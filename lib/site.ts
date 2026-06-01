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
    modules: 9,
    status: 'Available now',
    age: 'Parents of sensitive adolescents, ages 12 to 18',
    description:
      'The Tuned In framework adapted for parents of sensitive adolescents ages 12 to 18.',
    moduleList: [
      'Understanding Your Highly Sensitive Teen',
      'The Adolescent Brain & Nervous System',
      'Who You Are as the Parent of a Teenager',
      'Knowing Your Sensitive Teen: The DOES Framework',
      'Shame, Identity & the Teen Years',
      'Loving Boundaries with a Teenager',
      'Connection Across the Disconnection',
      'The Sensitive Teen at School & in the World',
      'Building Your Village & Raising a Thriving Sensitive Teen',
    ],
  },
  {
    slug: 'sensitive-teens',
    name: 'Tuned In for Sensitive Teens',
    modules: 8,
    status: 'Launching July 4',
    age: 'Sensitive teenagers, ages 12 to 18',
    description:
      'For sensitive teenagers navigating identity, relationships, school, and a world that moves too fast.',
    moduleList: [
      {
        title: "Understanding How You're Wired",
        points: [
          'Learn how your brain and nervous system work',
          'Understand sensitivity, emotions, and regulation',
          'Replace self-judgment with self-understanding',
        ],
      },
      {
        title: 'Your Brain & Nervous System',
        points: [
          'Green, red, and blue states',
          'The window of tolerance',
          'Recognizing signs of overwhelm before you hit your limit',
        ],
      },
      {
        title: 'Emotions Are Information',
        points: [
          'Understanding big feelings',
          'Emotional awareness and expression',
          'Tools for processing instead of suppressing',
        ],
      },
      {
        title: 'Your Regulation Toolkit',
        points: [
          'Practical strategies for calming and resetting',
          'Body, mind, and relationship-based tools',
          'Creating your personal regulation plan',
        ],
      },
      {
        title: 'Shame, Self-Worth & Confidence',
        points: [
          'Understanding shame and perfectionism',
          'Building self-compassion',
          'Separating your worth from performance',
        ],
      },
      {
        title: 'Healthy Boundaries',
        points: [
          'Learning to say no',
          'Protecting your energy',
          'Creating boundaries with people and technology',
        ],
      },
      {
        title: 'Connection & Relationships',
        points: [
          'Friendships, family, and belonging',
          'Co-regulation and repair',
          'Building a supportive community',
        ],
      },
      {
        title: "Who You're Becoming",
        points: [
          'Discovering your strengths and gifts',
          'Self-advocacy and independence',
          'Creating a vision for your future and a life that works for you',
        ],
      },
    ],
  },
  {
    slug: 'adults',
    name: 'Tuned In for Adults',
    modules: 8,
    status: 'Launching July 4',
    age: 'Sensitive adults',
    description:
      'Regulation tools for sensitive adults navigating work, relationships, and a world not built for them.',
    moduleList: [
      {
        title: "Understanding How You're Wired",
        points: [
          'The brain, nervous system, and sensitivity spectrum',
          'Why your reactions make sense',
          'The five Tuned In principles',
        ],
      },
      {
        title: 'Understanding Your Nervous System',
        points: [
          'Red zone, blue zone, and regulation',
          'Window of tolerance',
          'Recognizing early signs of dysregulation',
        ],
      },
      {
        title: 'Your Story Lives in Your Body',
        points: [
          'Triggers, past experiences, and emotional patterns',
          'Where emotions live in the body',
          'Building awareness before reacting',
        ],
      },
      {
        title: 'Your Regulation Toolkit',
        points: [
          'Practical regulation tools for everyday life',
          'Self-regulation and co-regulation',
          'Creating a sustainable regulation practice',
        ],
      },
      {
        title: 'Shame, Self-Compassion & Boundaries',
        points: [
          'Understanding shame and perfectionism',
          'Developing self-compassion',
          'Learning loving boundaries',
        ],
      },
      {
        title: 'Authenticity & Self-Trust',
        points: [
          'Reconnecting with your needs and values',
          'Building confidence in your decisions',
          'Showing up authentically without overexplaining',
        ],
      },
      {
        title: 'Relationships, Connection & Repair',
        points: [
          'Healthy relationships and co-regulation',
          'Communication and conflict repair',
          'Building a supportive community',
        ],
      },
      {
        title: 'Creating a Tuned In Life',
        points: [
          'Designing a life that supports your nervous system',
          'Rhythms, routines, and sustainable well-being',
          'Identifying your gifts, purpose, and future vision',
        ],
      },
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
