const eventCategoryLabels = {
  workshops: 'Workshops',
  conferences: 'Conferences',
  competitions: 'Competitions',
  social: 'Social',
  orientation: 'Orientation',
  outreach: 'Outreach',
};

const createEvent = ({
  title,
  slug,
  date,
  endDate = null,
  location,
  category,
  coverImage,
  excerpt,
  description = '',
  gallery = [],
  organizerCommittee = null,
}) => {
  const eventDate = new Date(date);
  const status = eventDate > new Date() ? 'upcoming' : 'past';

  return {
    title,
    slug,
    date,
    endDate,
    location,
    category,
    categoryLabel: eventCategoryLabels[category] || category,
    coverImage,
    excerpt,
    description,
    gallery,
    organizerCommittee,
    status,
  };
};

export const events = [
  createEvent({
    title: 'Introduction to Web Development',
    slug: 'intro-to-web-dev',
    date: '2025-09-20T14:00:00Z',
    location: 'HITU Campus, Room A101',
    category: 'workshops',
    coverImage: 'https://res.cloudinary.com/dweqigxnz/image/upload/f_auto,q_auto,w_800/v1775792545/web-head_kd8plg.png',
    excerpt: 'A hands-on workshop covering HTML, CSS, and JavaScript fundamentals for beginners.',
    description: 'This workshop introduced members to the fundamentals of web development. Starting with HTML structure, moving through CSS styling, and finishing with JavaScript interactivity, attendees built their first complete webpage by the end of the session.\n\nThe Web committee led the session with live coding exercises and one-on-one mentoring. Members left with a working portfolio page and a clear learning path for continued web development.',
    gallery: [
      { src: 'https://res.cloudinary.com/dweqigxnz/image/upload/f_auto,q_auto,w_800/v1775792545/web-head_kd8plg.png', caption: 'Workshop instructor demonstrating HTML structure' },
    ],
    organizerCommittee: 'Web',
  }),
  createEvent({
    title: 'IEEE Day Celebration 2025',
    slug: 'ieee-day-2025',
    date: '2025-10-05T10:00:00Z',
    location: 'HITU Campus Main Hall',
    category: 'social',
    coverImage: 'https://res.cloudinary.com/dweqigxnz/image/upload/f_auto,q_auto,w_800/v1775792545/web-head_kd8plg.png',
    excerpt: 'Celebrating IEEE Day with technical demos, networking, and branch achievements showcases.',
    description: 'Our branch celebrated IEEE Day 2025 with a full day of activities. Members showcased projects from each technical committee, shared experiences, and welcomed new attendees interested in joining IEEE.\n\nThe event featured live demos, poster presentations, and a panel discussion on the role of IEEE in shaping future engineers.',
    gallery: [
      { src: 'https://res.cloudinary.com/dweqigxnz/image/upload/f_auto,q_auto,w_800/v1775792545/web-head_kd8plg.png', caption: 'IEEE Day group photo' },
    ],
    organizerCommittee: 'PR & OC',
  }),
  createEvent({
    title: 'AI Study Camp — Level 1',
    slug: 'ai-study-camp-l1',
    date: '2026-05-10T09:00:00Z',
    endDate: '2026-05-14T16:00:00Z',
    location: 'HITU Campus, Computer Labs',
    category: 'workshops',
    coverImage: 'https://res.cloudinary.com/dweqigxnz/image/upload/f_auto,q_auto,w_800/v1775792545/web-head_kd8plg.png',
    excerpt: 'A five-day intensive study camp covering Python, data analysis, and introductory machine learning.',
    description: 'An intensive five-day study camp designed to give members a strong foundation in AI. The program covers Python programming, data analysis with pandas, visualization with matplotlib, and an introduction to machine learning with scikit-learn.\n\nEach day combines morning theory sessions with afternoon hands-on labs. Members who complete all five days receive a branch certificate of completion.',
    gallery: [],
    organizerCommittee: 'AI',
  }),
];

export { eventCategoryLabels };

export const eventCategories = Object.keys(eventCategoryLabels);

export const upcomingEvents = events.filter((e) => e.status === 'upcoming');
export const pastEvents = events.filter((e) => e.status === 'past');

export function getEventBySlug(slug) {
  return events.find((event) => event.slug === slug);
}
