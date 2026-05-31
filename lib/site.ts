export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'What Is Sensitivity', href: '/what-is-sensitivity' },
  { label: 'Programs', href: '/programs' },
  { label: 'Resources', href: '/resources' },
  { label: 'Concierge', href: '/concierge' },
  { label: 'For Professionals', href: '/professionals' },
]

export const programs = [
  {
    slug: 'parenting',
    name: 'Tuned In Parenting',
    modules: 10,
    status: 'Available now',
    age: 'Parents of sensitive children, ages 2 to 12',
    description:
      'For parents of sensitive children ages 2 to 12. Grounded in neuroscience, designed for real life.',
    moduleList: [
      'Why sensitive kids need a different kind of parenting',
      'Understanding the body and brain science of your child',
      'What type of parent are you?',
      'Knowing your sensitive child',
      'Reducing shame and understanding developmental stages',
      'Parent self-healing, self-regulation and self-care',
      'The highly sensitive parent',
      'Loving boundaries',
      'Conscious co-parenting',
      'Future planning',
    ],
  },
  {
    slug: 'parenting-teens',
    name: 'Tuned In Parenting for Teens',
    modules: 8,
    status: 'Available now',
    age: 'Parents of sensitive adolescents, ages 12 to 18',
    description:
      'The Tuned In framework adapted for parents of sensitive adolescents ages 12 to 18.',
    moduleList: [
      'The adolescent brain renovation',
      'What changes, and what stays the same',
      'Identity, peers, and the social world',
      'Low-agenda connection',
      'Rupture and repair in the teen years',
      'Shutdown, withdrawal, and the silent dinner',
      'Staying an advocate without taking over',
      'Planning for the years ahead',
    ],
  },
  {
    slug: 'sensitive-teens',
    name: 'Tuned In for Sensitive Teens',
    modules: 8,
    status: 'Coming soon',
    age: 'Sensitive teenagers, ages 12 to 18',
    description:
      'For sensitive teenagers navigating identity, relationships, school, and a world that moves too fast.',
    moduleList: [
      'What sensitivity actually is',
      'Your nervous system, explained',
      'Friendships and the social load',
      'School, focus, and overstimulation',
      'Big feelings and how to ride them',
      'Talking to the adults in your life',
      'Rest, recovery, and your own rhythm',
      'Designing a life that fits you',
    ],
  },
  {
    slug: 'adults',
    name: 'Tuned In for Adults',
    modules: 8,
    status: 'Available now',
    age: 'Sensitive adults',
    description:
      'Regulation tools for sensitive adults navigating work, relationships, and a world not built for them.',
    moduleList: [
      'Late discovery and accurate recognition',
      'The science behind the trait',
      'Nervous system load and depletion',
      'Regulation tools for daily life',
      'Designing your environment',
      'Language for partners and managers',
      'Boundaries without guilt',
      'A sustainable, sensitive life',
    ],
  },
] as const

export const clinicalFoundations = [
  {
    title: "Dr. Elaine Aron's HSP Research",
    body: 'Four decades of research establishing Sensory Processing Sensitivity as a measurable, inherited trait.',
  },
  {
    title: 'Polyvagal Theory',
    body: 'A map of the nervous system that explains why a sensitive body reaches shutdown or alarm more readily.',
  },
  {
    title: 'Attachment Science',
    body: 'How early relationships shape the way a sensitive child learns to regulate and reconnect.',
  },
  {
    title: "Dan Siegel's Interpersonal Neurobiology",
    body: 'The science of how relationships literally shape the developing brain, moment to moment.',
  },
  {
    title: 'Epigenetics',
    body: 'How environment and experience switch genes on and off, and why context matters as much as wiring.',
  },
]
