import leaderPlaceholder from '../assets/leader-placeholder.svg';

const placeholderGoals = [
  'Build practical member experience through guided sessions and collaborative work.',
  'Create a strong internal learning culture that helps members grow steadily.',
  'Support branch initiatives with focused committee contributions and execution.',
];

const placeholderRoles = [
  'Attend committee meetings and contribute actively to assigned work.',
  'Take responsibility for deliverables, internal coordination, and team support.',
  'Document progress, share knowledge, and help improve committee workflows.',
];

const placeholderActivities = [
  'Hands-on workshops and guided learning sessions.',
  'Internal projects, event preparation, and collaborative planning.',
  'Regular reviews, presentations, and knowledge-sharing activities.',
];

const categoryLabelMap = {
  technical: 'Technical',
  'non-technical': 'Non-Technical',
};

const webHeadImage = 'https://res.cloudinary.com/dweqigxnz/image/upload/f_auto,q_auto,w_800/v1775792545/web-head_kd8plg.png';

const createCommittee = ({
  name,
  slug,
  category,
  memberCount,
  icon,
  shortDescription,
  slogan,
  headImage = null,
  viceHead = undefined,
}) => ({
  name,
  slug,
  category,
  categoryLabel: categoryLabelMap[category],
  memberCount,
  icon,
  shortDescription,
  slogan,
  goals: placeholderGoals,
  roles: placeholderRoles,
  activities: placeholderActivities,
  head: {
    name: name === 'Web' ? 'Khaled Nasser' : `${name} Head`,
    role: 'Head',
    bio: name === 'Web' 
      ? 'Third-year Computer Engineering student at HITU. Passionate about full-stack development and building scalable web applications. Leading the Web committee to create impactful projects.'
      : `Placeholder profile for the Head of the ${name} committee until the official branch leadership information is added.`,
    image: headImage || leaderPlaceholder,
    githubUrl: 'https://github.com',
    linkedinUrl: 'https://linkedin.com',
    email: 'web@ieeehitu.org',
  },
  viceHead:
    viceHead === undefined
      ? {
          name: `${name} Vice Head`,
          role: 'Vice Head',
          bio: `Placeholder profile for the Vice Head of the ${name} committee until the official branch leadership information is added.`,
          image: leaderPlaceholder,
          githubUrl: 'https://github.com',
          linkedinUrl: 'https://linkedin.com',
          email: `${slug}@ieeehitu.org`,
        }
      : viceHead,
});

export const committees = [
  createCommittee({
    name: 'AI',
    slug: 'ai',
    category: 'technical',
    memberCount: 52,
    icon: 'neurology',
    shortDescription: 'Explores artificial intelligence concepts through practical learning, experiments, and team-led projects.',
    slogan: 'Turning intelligence into impact.',
  }),
  createCommittee({
    name: 'Cyber Defensive',
    slug: 'cyber-defensive',
    category: 'technical',
    memberCount: 13,
    icon: 'shield_locked',
    shortDescription: 'Focuses on secure systems, defensive practices, and protecting digital environments.',
    slogan: 'Protect first, respond smarter.',
  }),
  createCommittee({
    name: 'Cyber Offensive',
    slug: 'cyber-offensive',
    category: 'technical',
    memberCount: 17,
    icon: 'gpp_maybe',
    shortDescription: 'Builds offensive security awareness through ethical testing, challenges, and practical exercises.',
    slogan: 'Think like an attacker, build like a defender.',
  }),
  createCommittee({
    name: 'Web',
    slug: 'web',
    category: 'technical',
    memberCount: 12,
    icon: 'language',
    shortDescription: 'Creates modern web experiences and sharpens frontend and full-stack delivery skills.',
    slogan: 'Design, build, and ship for the web.',
    headImage: webHeadImage,
    viceHead: null,
  }),
  createCommittee({
    name: 'Automations',
    slug: 'automations',
    category: 'technical',
    memberCount: 18,
    icon: 'precision_manufacturing',
    shortDescription: 'Improves processes with automation thinking, efficient tooling, and repeatable workflows.',
    slogan: 'Automate the routine, focus on the meaningful.',
  }),
  createCommittee({
    name: 'Robotics',
    slug: 'robotics',
    category: 'technical',
    memberCount: 23,
    icon: 'smart_toy',
    shortDescription: 'Combines design, mechanics, and control systems to create interactive robotic solutions.',
    slogan: 'Build motion with purpose.',
  }),
  createCommittee({
    name: 'Embedded',
    slug: 'embedded',
    category: 'technical',
    memberCount: 8,
    icon: 'memory',
    shortDescription: 'Works close to hardware through embedded systems practice, low-level thinking, and device integration.',
    slogan: 'Closer to the hardware, closer to the solution.',
  }),
  createCommittee({
    name: 'PR & OC',
    slug: 'pr-oc',
    category: 'non-technical',
    memberCount: 8,
    icon: 'campaign',
    shortDescription: 'Shapes branch communication, public voice, and outreach coordination across activities and events.',
    slogan: 'Connect the branch to its audience.',
  }),
  createCommittee({
    name: 'Multi Media',
    slug: 'multi-media',
    category: 'non-technical',
    memberCount: 7,
    icon: 'perm_media',
    shortDescription: 'Translates branch stories into visual and media content that is clear, creative, and memorable.',
    slogan: 'Turn moments into strong visual stories.',
  }),
  createCommittee({
    name: 'Marketing',
    slug: 'marketing',
    category: 'non-technical',
    memberCount: 3,
    icon: 'trending_up',
    shortDescription: 'Supports visibility, audience growth, and campaign planning with focused promotional work.',
    slogan: 'Make the right people notice.',
  }),
  createCommittee({
    name: 'HR - T&D',
    slug: 'hr-td',
    category: 'non-technical',
    memberCount: 23,
    icon: 'groups_3',
    shortDescription: 'Develops members internally through support, training, team care, and growth-oriented initiatives.',
    slogan: 'Grow people, strengthen teams.',
  }),
];

export const committeeCategories = {
  technical: 'Technical Committees',
  nonTechnical: 'Non-Technical Committees',
};

export const technicalCommittees = committees.filter((committee) => committee.category === 'technical');
export const nonTechnicalCommittees = committees.filter((committee) => committee.category === 'non-technical');
export const totalCommittees = committees.length;
