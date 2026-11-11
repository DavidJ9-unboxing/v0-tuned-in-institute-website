export const POD_NAME = 'Connection & Learning Pods'

export const GROUP_TYPES = {
  'parent-child': 'Parent pod: parent of a child (ages 2-12)',
  'parent-teen': 'Parent pod: parent of a teen (ages 13-18)',
  adult: 'Adult pod: self-care & connection',
} as const

export type GroupType = keyof typeof GROUP_TYPES

export const PSILOCYBIN_PARENT_PROGRAM_URL = 'https://rootedrhythm.com/psilocybin-parent-program'
