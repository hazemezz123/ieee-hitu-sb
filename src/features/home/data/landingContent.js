// Structured landing page editorial content separated from section presentation.
// All statistics, links, and workflows reference verified repository sources.

export const WHO_WE_ARE = {
  heading: 'More than a student activity.',
  paragraphs: [
    'IEEE HITU Student Branch is the student-led branch of IEEE at Helwan International Technological University, connecting students across campus with structured technical learning, engineering practice, and collaborative growth.',
    'Through 19 specialized technical and non-technical committees, hands-on workshops, and campus events, members turn classroom theory into practical teamwork while connecting local student effort to the wider global IEEE community.',
  ],
  image: {
    src: '/gallery/techne4.webp',
    width: 1280,
    height: 720,
    alt: 'IEEE HITU Student Branch members together at Techne Summit',
    caption: 'IEEE HITU Student Branch delegation at Techne Summit.',
  },
  cta: {
    label: 'Learn more about our branch',
    href: '/about',
  },
}

// Draft Mission & Vision wording aligned with branch activities — pending official IEEE HITU board approval.
export const MISSION_VISION = {
  heading: 'Driven by purpose. Built for impact.',
  mission: {
    number: '01',
    concept: 'What we do today',
    title: 'Our Mission',
    body: 'To empower students through hands-on technical learning, innovation, collaboration, and leadership opportunities, bridging the gap between academic knowledge and real-world engineering challenges.',
  },
  vision: {
    number: '02',
    concept: "Where we're headed",
    title: 'Our Vision',
    body: 'To build a thriving community of innovators and future technology leaders who create meaningful impact through engineering, knowledge sharing, and continuous development.',
  },
}

export const VERIFIED_IMPACT_BASE = {
  members: { value: 180, suffix: '+', label: 'Community Members' },
  sessions: { value: 60, suffix: '+', label: 'Sessions & Workshops' },
}

export const COMMITTEE_CATEGORY_META = {
  technical: {
    id: 'technical',
    label: 'Technical Committees',
    shortLabel: 'Technical',
    description:
      'Hands-on engineering tracks covering software, AI, embedded systems, PCB design, IoT, cybersecurity, automation, and 3D CAD.',
  },
  'non-technical': {
    id: 'non-technical',
    label: 'Non-Technical Committees',
    shortLabel: 'Non-Technical',
    description:
      'Operations, outreach, and creative teams leading event logistics, recruitment, public relations, marketing, visual design, and content.',
  },
}

export const WHY_JOIN_INTRO = {
  heading: 'Why IEEE HITU?',
  subtitle: 'More than knowledge. Real experience.',
}

export const BRANCH_BENEFITS = [
  {
    id: 'learning',
    icon: 'cpu',
    title: 'Learn by Doing',
    description: 'Hands-on technical experience.',
  },
  {
    id: 'projects',
    icon: 'code',
    title: 'Build Real Projects',
    description: 'Turn ideas into real solutions.',
  },
  {
    id: 'networking',
    icon: 'network',
    title: 'Make Connections',
    description: 'Grow your professional network.',
  },
  {
    id: 'leadership',
    icon: 'compass',
    title: 'Become a Leader',
    description: 'Take ownership and lead teams.',
  },
  {
    id: 'skills',
    icon: 'layers',
    title: 'Expand Your Skills',
    description: 'Explore beyond your specialty.',
  },
  {
    id: 'community',
    icon: 'users',
    title: 'Find Your Community',
    description: 'Learn and grow together.',
  },
]

export const GLOBAL_IEEE_CONTEXT = {
  title: 'Local Student Branch vs. Global IEEE Membership',
  description:
    'Joining an IEEE HITU Student Branch committee connects you with local campus tracks, workshops, and events at HITU. Official global IEEE membership is managed separately through IEEE.org and provides access to IEEE-wide publications and programs.',
  links: [
    { label: 'IEEE.org', href: 'https://www.ieee.org/' },
    { label: 'Official IEEE Membership', href: 'https://www.ieee.org/membership.html' },
    { label: 'IEEE Xplore', href: 'https://ieeexplore.ieee.org/' },
  ],
}

export const OFFICIAL_CHANNELS = [
  { name: 'Facebook', href: 'https://www.facebook.com/ieeehitusb' },
  { name: 'Instagram', href: 'https://www.instagram.com/ieee.hitu.sb/' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/company/hitu-ieee-sb/posts/' },
]

export function buildFaqItems({ isOpen, closedMessage, committeeCount = 19 } = {}) {
  const recruitmentAnswer =
    isOpen === true
      ? 'Committee recruitment is currently open. You can start your application directly from the Join Us page.'
      : isOpen === false
        ? closedMessage ||
          'Committee recruitment runs in periodic waves and is currently closed. Follow our events and official Facebook, Instagram, and LinkedIn channels for upcoming recruitment announcements.'
        : 'Committee recruitment opens in periodic waves announced on the Join Us page and across our official Facebook, Instagram, and LinkedIn channels.'

  return [
    {
      id: 'who-can-join',
      question: 'Who can join IEEE HITU Student Branch?',
      answer:
        'Students at Helwan International Technological University across 1st through 4th academic years and engineering or technology majors can apply to join a branch committee when recruitment is open.',
    },
    {
      id: 'how-to-join',
      question: 'How can I join a committee?',
      answer:
        'Explore our technical and non-technical committees to find the track that fits your goals, then complete the two-step application on the Join Us page while recruitment is open. Uploading a CV is optional.',
    },
    {
      id: 'committees-roles',
      question: 'What committees and roles can I apply for?',
      answer: `IEEE HITU operates ${committeeCount} specialized committees spanning technical engineering fields and non-technical branch operations. Recruitment applications support Member, Instructor, Vice-Head, Head, Manager, and Director tracks.`,
    },
    {
      id: 'recruitment-window',
      question: 'When does recruitment open?',
      answer: recruitmentAnswer,
    },
    {
      id: 'events-contact',
      question: 'How can I attend branch events or contact the team?',
      answer:
        'Browse upcoming workshops and past recaps on the Events page, or reach out directly at ieee.hitu.sb@gmail.com or through the Contact page for inquiries and collaborations.',
    },
  ]
}
