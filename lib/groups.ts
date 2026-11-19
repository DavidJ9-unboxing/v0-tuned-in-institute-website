export const POD_NAME = 'Connection & Learning Pods'

export const GROUP_TYPES = {
  'parent-child': 'Parent pod: parent of a child (ages 2-12)',
  'parent-teen': 'Parent pod: parent of a teen (ages 13-18)',
  adult: 'Adult pod: self-care & connection',
} as const

export type GroupType = keyof typeof GROUP_TYPES

export const POD_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const
export const POD_TIMES = ['8:15am', '10:30am', '12pm', '12:30pm', '3pm'] as const
export const POD_SLOTS: readonly string[] = POD_DAYS.flatMap((day) =>
  POD_TIMES.map((time) => `${day} ${time}`),
)

export const PSILOCYBIN_PARENT_PROGRAM_URL = 'https://rootedrhythm.com/psilocybin-parent-program'
