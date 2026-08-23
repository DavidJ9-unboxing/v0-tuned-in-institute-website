import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type ModelMessage,
  type UIMessage,
} from 'ai'
import * as z from 'zod'
import { getCurrentUser } from '@/lib/session'
import {
  buildRemiSystemPrompt,
  formatRetrievedSources,
  getResourcesByIds,
  retrieveRelevantSources,
} from '@/lib/remi'

export const maxDuration = 30

/** Flattens the text parts of a UI message into a single string. */
function messageText(message: UIMessage): string {
  return (message.parts ?? [])
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join(' ')
}

/**
 * Builds the search query for retrieval. The newest message matters most, but
 * including the previous member turn helps when the latest message is a short
 * follow-up like "what about at bedtime?".
 */
function buildRetrievalQuery(messages: UIMessage[]): string {
  const userTurns = messages.filter((m) => m.role === 'user').slice(-2)
  if (userTurns.length === 0) return ''
  const latest = messageText(userTurns[userTurns.length - 1])
  const previous = userTurns.length > 1 ? messageText(userTurns[0]) : ''
  return `${latest} ${previous}`.slice(0, 1500)
}

export async function POST(req: Request) {
  // Remi lives behind the member library — require a signed-in user.
  const user = await getCurrentUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  // The system prompt is static and cached; retrieval depends on the message.
  // Run them together so retrieval adds no serial latency on a cache miss.
  const [{ system }, sources] = await Promise.all([
    buildRemiSystemPrompt(),
    retrieveRelevantSources(buildRetrievalQuery(messages)),
  ])

  const modelMessages: ModelMessage[] = await convertToModelMessages(messages)

  // Insert the retrieved passages immediately before the member's latest
  // message. Keeping them OUT of the system prompt leaves that long prefix
  // byte-identical on every request, so the provider can serve it from its
  // prompt cache instead of reprocessing it each time.
  const grounding = formatRetrievedSources(sources)
  if (grounding) {
    const insertAt = Math.max(modelMessages.length - 1, 0)
    modelMessages.splice(insertAt, 0, { role: 'system', content: grounding })
  }

  const result = streamText({
    model: 'openai/gpt-5.4-mini',
    system,
    messages: modelMessages,
    stopWhen: stepCountIs(4),
    tools: {
      citeResources: tool({
        description:
          'Attach links to the Institute / Rooted Rhythm resources you are drawing from so the member can open the source document. Call this whenever you reference one or more resources, passing their #ids.',
        inputSchema: z.object({
          ids: z
            .array(z.number())
            .describe('The #ids of the resources you are citing, most relevant first.'),
        }),
        execute: async ({ ids }) => {
          const resources = await getResourcesByIds(ids)
          return { resources }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
