import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from 'ai'
import * as z from 'zod'
import { getCurrentUser } from '@/lib/session'
import { buildRemiSystemPrompt, getResourcesByIds } from '@/lib/remi'

export const maxDuration = 30

export async function POST(req: Request) {
  // Remi lives behind the member library — require a signed-in user.
  const user = await getCurrentUser()
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  const { system } = await buildRemiSystemPrompt()

  const result = streamText({
    model: 'openai/gpt-5.4-mini',
    system,
    messages: await convertToModelMessages(messages),
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
