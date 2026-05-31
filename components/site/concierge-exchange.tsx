export function ConciergeExchange({
  question,
  answer,
}: {
  question: string
  answer: string
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-stone bg-card p-6">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-charcoal/55">
          Member question
        </p>
        <p className="mt-3 font-serif text-[17px] leading-relaxed text-charcoal/90">{question}</p>
      </div>
      <div className="rounded-xl border border-transparent bg-deep-teal p-6 text-off-white">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-sage-light">
          Concierge response
        </p>
        <p className="mt-3 font-serif text-[17px] leading-relaxed text-off-white/95">{answer}</p>
      </div>
    </div>
  )
}

export const conciergeExamples = [
  {
    question:
      'My 7-year-old just had a meltdown over homework and is completely shut down. What do I do right now?',
    answer:
      "She's in dorsal vagal shutdown. Don't try to problem-solve yet. Sit near her, lower your voice, offer water. Once her breath slows, you can reconnect. The homework can wait 20 minutes.",
  },
  {
    question:
      'My sensitive teenager has stopped talking to me at dinner. Did I do something wrong, or is this normal?',
    answer:
      'This is developmentally on time, not a verdict on your relationship. Lower the agenda. Sit beside him instead of across from him, comment on something small, and let silence be allowed. Connection returns through low-pressure presence, not direct questions.',
  },
  {
    question:
      'I am a sensitive adult and the open office leaves me depleted by noon. What can I change today?',
    answer:
      'Your nervous system is carrying extra sensory load, not failing. Today, protect one 20-minute recovery block away from the floor, use headphones for deep work, and move your hardest task to your first quiet hour. Design beats willpower here.',
  },
]
