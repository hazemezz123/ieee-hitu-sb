const categoryLabelMap = {
  technical: 'Technical',
  'non-technical': 'Non-Technical',
};

const createCommittee = ({
  name,
  slug,
  category,
  memberCount = 0,
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
    name: 'Automation',
    slug: 'automation',
    category: 'technical',
    shortDescription: 'Improves workflows and engineering processes through automation systems, scripting, and industrial control concepts.',
  }),
  createCommittee({
    name: 'IoT',
    slug: 'iot',
    category: 'technical',
    shortDescription: 'Connects sensors, hardware, and cloud platforms to design smart, networked Internet of Things solutions.',
  }),
  createCommittee({
    name: 'Cyber Security (Defensive)',
    slug: 'cyber-security-defensive',
    category: 'technical',
    shortDescription: 'Focuses on secure systems, defensive practices, threat monitoring, and protecting digital environments.',
  }),
  createCommittee({
    name: 'Embedded',
    slug: 'embedded',
    category: 'technical',
    shortDescription: 'Works close to hardware through embedded systems practice, microcontrollers, firmware, and device integration.',
  }),
  createCommittee({
    name: 'PCB Design',
    slug: 'pcb-design',
    category: 'technical',
    shortDescription: 'Designs and validates printed circuit boards from schematic capture and layout to hardware prototyping.',
  }),
  createCommittee({
    name: 'SolidWorks',
    slug: 'solidworks',
    category: 'technical',
    shortDescription: 'Develops 3D CAD modeling, mechanical assemblies, and engineering design skills using SolidWorks.',
  }),
  createCommittee({
    name: 'Web Development',
    slug: 'web-development',
    category: 'technical',
    shortDescription: 'Creates modern web experiences and strengthens frontend, backend, and full-stack engineering skills.',
  }),
  createCommittee({
    name: 'Mobile Application',
    slug: 'mobile-application',
    category: 'technical',
    shortDescription: 'Builds mobile applications with a focus on architecture, usability, and practical end-to-end delivery.',
  }),
  createCommittee({
    name: 'Flutter',
    slug: 'flutter',
    category: 'technical',
    shortDescription: 'Develops cross-platform mobile applications using Flutter and Dart through hands-on projects and UI practice.',
  }),
  createCommittee({
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    category: 'technical',
    shortDescription: 'Explores artificial intelligence and machine learning through practical learning, experiments, and team-led projects.',
  }),
  createCommittee({
    name: 'Cyber Security (Offensive)',
    slug: 'cyber-security-offensive',
    category: 'technical',
    shortDescription: 'Builds offensive security awareness through ethical testing, vulnerability analysis, and hands-on challenges.',
  }),
  createCommittee({
    name: 'Problem Solving',
    slug: 'problem-solving',
    category: 'technical',
    shortDescription: 'Strengthens algorithmic thinking, data structures, and competitive programming through regular practice.',
  }),
  createCommittee({
    name: 'HR',
    slug: 'hr',
    category: 'non-technical',
    shortDescription: 'Supports recruitment, member onboarding, performance tracking, and internal team coordination across the branch.',
  }),
  createCommittee({
    name: 'Marketing',
    slug: 'marketing',
    category: 'non-technical',
    shortDescription: 'Supports branch visibility, audience growth, and campaign planning with focused promotional strategy.',
  }),
  createCommittee({
    name: 'People & Culture',
    slug: 'people-culture',
    category: 'non-technical',
    shortDescription: 'Fosters member engagement, team well-being, internal community initiatives, and a healthy branch culture.',
  }),
  createCommittee({
    name: 'Logistics & Events',
    slug: 'logistics-events',
    category: 'non-technical',
    shortDescription: 'Plans and executes on-ground logistics, venue operations, and seamless coordination for branch events.',
  }),
  createCommittee({
    name: 'Public Relations & Fundraising',
    slug: 'public-relations-fundraising',
    category: 'non-technical',
    shortDescription: 'Builds external partnerships, sponsorships, institutional relations, and public representation for the branch.',
  }),
  createCommittee({
    name: 'Graphic Design',
    slug: 'graphic-design',
    category: 'non-technical',
    shortDescription: 'Crafts the branch visual identity, event branding, and creative graphics across print and digital channels.',
  }),
  createCommittee({
    name: 'Content Creation',
    slug: 'content-creation',
    category: 'non-technical',
    shortDescription: 'Produces compelling copy, stories, and multimedia content that communicate branch activities clearly.',
  }),
];

export const committeeCategories = {
  technical: 'Technical committees',
  nonTechnical: 'Non-technical committees',
};
