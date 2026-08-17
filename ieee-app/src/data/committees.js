const categoryLabelMap = {
  technical: 'Technical',
  'non-technical': 'Non-Technical',
};

const createCommittee = ({
  name,
  slug,
  category,
  memberCount,
  shortDescription,
}) => ({
  name,
  slug,
  category,
  categoryLabel: categoryLabelMap[category],
  memberCount,
  shortDescription,
});

export const committees = [
  createCommittee({
    name: 'AI',
    slug: 'ai',
    category: 'technical',
    memberCount: 52,
    shortDescription: 'Explores artificial intelligence concepts through practical learning, experiments, and team-led projects.',
  }),
  createCommittee({
    name: 'Cyber Defensive',
    slug: 'cyber-defensive',
    category: 'technical',
    memberCount: 13,
    shortDescription: 'Focuses on secure systems, defensive practices, and protecting digital environments.',
  }),
  createCommittee({
    name: 'Cyber Offensive',
    slug: 'cyber-offensive',
    category: 'technical',
    memberCount: 17,
    shortDescription: 'Builds offensive security awareness through ethical testing, challenges, and practical exercises.',
  }),
  createCommittee({
    name: 'Web',
    slug: 'web',
    category: 'technical',
    memberCount: 12,
    shortDescription: 'Creates modern web experiences and sharpens frontend and full-stack delivery skills.',
  }),
  createCommittee({
    name: 'Automations',
    slug: 'automations',
    category: 'technical',
    memberCount: 18,
    shortDescription: 'Improves processes with automation thinking, efficient tooling, and repeatable workflows.',
  }),
  createCommittee({
    name: 'Robotics',
    slug: 'robotics',
    category: 'technical',
    memberCount: 23,
    shortDescription: 'Combines design, mechanics, and control systems to create interactive robotic solutions.',
  }),
  createCommittee({
    name: 'Embedded',
    slug: 'embedded',
    category: 'technical',
    memberCount: 8,
    shortDescription: 'Works close to hardware through embedded systems practice, low-level thinking, and device integration.',
  }),
  createCommittee({
    name: 'PR & OC',
    slug: 'pr-oc',
    category: 'non-technical',
    memberCount: 8,
    shortDescription: 'Shapes branch communication, public voice, and outreach coordination across activities and events.',
  }),
  createCommittee({
    name: 'Multi Media',
    slug: 'multi-media',
    category: 'non-technical',
    memberCount: 7,
    shortDescription: 'Translates branch stories into visual and media content that is clear, creative, and memorable.',
  }),
  createCommittee({
    name: 'Marketing',
    slug: 'marketing',
    category: 'non-technical',
    memberCount: 3,
    shortDescription: 'Supports visibility, audience growth, and campaign planning with focused promotional work.',
  }),
  createCommittee({
    name: 'HR - T&D',
    slug: 'hr-td',
    category: 'non-technical',
    memberCount: 23,
    shortDescription: 'Develops members internally through support, training, team care, and growth-oriented initiatives.',
  }),
];

export const committeeCategories = {
  technical: 'Technical committees',
  nonTechnical: 'Non-technical committees',
};

export const technicalCommittees = committees.filter((committee) => committee.category === 'technical');
export const nonTechnicalCommittees = committees.filter((committee) => committee.category === 'non-technical');
export const totalCommittees = committees.length;
