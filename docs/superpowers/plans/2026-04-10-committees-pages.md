# Committees Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a committees overview page and reusable committee detail pages with placeholder content for all current branch committees.

**Architecture:** Store all committee content in one shared data module, render the overview page from categorized data, and use a single route-driven detail template for every committee. Keep the implementation static and data-driven so real content can replace placeholders without changing layout code.

**Tech Stack:** React 19, React Router 7, Vite, Tailwind CSS 4, ESLint

---

### Task 1: Create Shared Committee Data

**Files:**
- Create: `src/data/committees.js`

- [ ] **Step 1: Create the committee data module**

```jsx
const placeholderGoals = [
  'Drive hands-on learning through structured committee sessions.',
  'Support members as they build practical technical and leadership skills.',
  'Contribute to branch initiatives through focused committee collaboration.',
];

const placeholderRoles = [
  'Participate actively in weekly meetings and collaborative tasks.',
  'Take ownership of assigned deliverables and internal team support.',
  'Help document progress, share knowledge, and improve team workflows.',
];

const placeholderActivities = [
  'Workshops and guided practice sessions.',
  'Internal projects and branch event contributions.',
  'Peer reviews, planning sessions, and knowledge sharing activities.',
];

const createLeader = (committeeName, role) => ({
  name: `${committeeName} ${role}`,
  role,
  bio: `Placeholder bio for the ${role.toLowerCase()} of the ${committeeName} committee until the official profile is added.`,
  image: 'https://placehold.co/320x360?text=Leader',
  githubUrl: '#',
  linkedinUrl: '#',
  email: 'placeholder@ieeehitu.org',
});

export const committees = [
  {
    name: 'AI',
    slug: 'ai',
    category: 'technical',
    memberCount: 52,
    icon: 'neurology',
    shortDescription: 'Explores applied artificial intelligence through collaborative learning and practical experimentation.',
    slogan: 'Turning intelligence into impact.',
    goals: placeholderGoals,
    roles: placeholderRoles,
    activities: placeholderActivities,
    head: createLeader('AI', 'Head'),
    viceHead: createLeader('AI', 'Vice Head'),
  },
];

export const committeeCategories = {
  technical: 'Technical Committees',
  nonTechnical: 'Non-Technical Committees',
};
```

- [ ] **Step 2: Expand the data array with all committees from the approved spec**

Add entries for:
- `Cyber Defensive`
- `Cyber Offensive`
- `Web`
- `Automations`
- `Robotics`
- `Embedded`
- `PR & OC`
- `Multi Media`
- `Marketing`
- `HR - T&D`

Use slugs like `cyber-defensive`, `cyber-offensive`, `pr-oc`, and `hr-td`.

- [ ] **Step 3: Add small helper exports for page rendering**

```jsx
export const technicalCommittees = committees.filter((committee) => committee.category === 'technical');
export const nonTechnicalCommittees = committees.filter((committee) => committee.category === 'non-technical');
export const totalCommittees = committees.length;
```

---

### Task 2: Add Committees Overview Page

**Files:**
- Create: `src/pages/CommitteesPage.jsx`
- Modify: `src/data/committees.js`

- [ ] **Step 1: Create grouped committee helpers inside the page**

```jsx
import { Link } from 'react-router-dom';
import {
  committeeCategories,
  nonTechnicalCommittees,
  technicalCommittees,
  totalCommittees,
} from '../data/committees';
```

- [ ] **Step 2: Add the page hero and category sections**

```jsx
export default function CommitteesPage() {
  return (
    <div className="min-h-screen bg-surface">
      <section className="relative py-32 bg-surface-container-lowest overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary wedge-accent" style={{ transform: 'rotate(0deg) scale(1.5)' }}></div>
        </div>
        <div className="container mx-auto px-12 relative z-10 max-w-5xl text-center">
          <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-4">Committees</span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-on-surface leading-tight mb-6">
            The Teams That Power Our <span className="text-primary">Branch</span>
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed mb-8">
            Explore the technical and non-technical committees that shape learning, operations, and community impact across IEEE HITU SB.
          </p>
          <div className="flex gap-8 justify-center text-on-surface-variant">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{totalCommittees}</div>
              <div className="text-sm uppercase tracking-wider">Committees</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">2</div>
              <div className="text-sm uppercase tracking-wider">Categories</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-surface">
        <div className="container mx-auto px-12 space-y-20">
          <div>
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-4">Category</span>
                <h2 className="text-4xl font-extrabold tracking-tight">{committeeCategories.technical}</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {technicalCommittees.map(renderCommitteeCard)}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-10">
              <div>
                <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-4">Category</span>
                <h2 className="text-4xl font-extrabold tracking-tight">{committeeCategories.nonTechnical}</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {nonTechnicalCommittees.map(renderCommitteeCard)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Render a reusable card map for both categories**

```jsx
const renderCommitteeCard = (committee) => (
  <div key={committee.slug} className="bg-surface-container-low p-8 transition-all duration-300 hover:bg-surface-container-lowest">
    <span className="material-symbols-outlined text-primary text-4xl mb-4">{committee.icon}</span>
    <div className="flex items-center justify-between gap-4 mb-4">
      <h3 className="text-xl font-bold">{committee.name}</h3>
      <span className="text-xs font-bold tracking-widest uppercase text-primary">{committee.memberCount} Members</span>
    </div>
    <p className="text-sm text-on-surface-variant leading-relaxed mb-6">{committee.shortDescription}</p>
    <Link className="inline-flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase" to={`/committees/${committee.slug}`}>
      View Committee <span className="material-symbols-outlined text-sm">arrow_forward</span>
    </Link>
  </div>
);
```

---

### Task 3: Add Reusable Committee Detail Page

**Files:**
- Create: `src/pages/CommitteeDetailPage.jsx`
- Modify: `src/data/committees.js`

- [ ] **Step 1: Resolve the committee from the route slug**

```jsx
import { Link, useParams } from 'react-router-dom';
import { committees } from '../data/committees';

export default function CommitteeDetailPage() {
  const { slug } = useParams();
  const committee = committees.find((item) => item.slug === slug);

  if (!committee) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-8">
        <div className="text-center max-w-xl">
          <h1 className="text-4xl font-black tracking-tight mb-4">Committee not found</h1>
          <p className="text-on-surface-variant mb-6">The committee page you are looking for does not exist.</p>
          <Link to="/committees" className="btn-wedge inline-block bg-primary text-on-primary px-6 py-3 font-bold tracking-wide uppercase">
            Back to Committees
          </Link>
        </div>
      </div>
    );
  }
```

- [ ] **Step 2: Add the detail page hero and quick facts strip**

```jsx
  return (
    <div className="min-h-screen bg-surface">
      <section className="relative py-32 bg-surface-container-lowest overflow-hidden">
        <div className="container mx-auto px-12 relative z-10 max-w-5xl">
          <Link to="/committees" className="inline-flex items-center gap-2 text-primary text-xs font-bold tracking-widest uppercase mb-8">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            All Committees
          </Link>
          <div className="max-w-3xl">
            <span className="material-symbols-outlined text-primary text-5xl mb-6">{committee.icon}</span>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-on-surface leading-tight mb-4">{committee.name}</h1>
            <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-4">{committee.slogan}</p>
            <p className="text-xl text-on-surface-variant leading-relaxed">{committee.shortDescription}</p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface-container-low p-6">
              <div className="text-sm uppercase tracking-wider text-on-surface-variant mb-2">Category</div>
              <div className="text-2xl font-bold text-primary">{committee.categoryLabel}</div>
            </div>
            <div className="bg-surface-container-low p-6">
              <div className="text-sm uppercase tracking-wider text-on-surface-variant mb-2">Members</div>
              <div className="text-2xl font-bold text-primary">{committee.memberCount}</div>
            </div>
            <div className="bg-surface-container-low p-6">
              <div className="text-sm uppercase tracking-wider text-on-surface-variant mb-2">Focus</div>
              <div className="text-2xl font-bold text-primary">Core Team</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Add the goals, roles, activities, and leadership sections**

```jsx
<section className="py-24 bg-surface">
  <div className="container mx-auto px-12 grid gap-8 lg:grid-cols-3">
    <div className="bg-surface-container-low p-8 lg:col-span-1">
      <h2 className="text-2xl font-bold mb-4">Committee Goals</h2>
      <ul className="space-y-3 text-on-surface-variant">
        {committee.goals.map((goal) => <li key={goal}>{goal}</li>)}
      </ul>
    </div>
    <div className="bg-surface-container-low p-8 lg:col-span-1">
      <h2 className="text-2xl font-bold mb-4">Roles & Responsibilities</h2>
      <ul className="space-y-3 text-on-surface-variant">
        {committee.roles.map((role) => <li key={role}>{role}</li>)}
      </ul>
    </div>
    <div className="bg-surface-container-low p-8 lg:col-span-1">
      <h2 className="text-2xl font-bold mb-4">Key Activities</h2>
      <ul className="space-y-3 text-on-surface-variant">
        {committee.activities.map((activity) => <li key={activity}>{activity}</li>)}
      </ul>
    </div>
  </div>
</section>
```

```jsx
<section className="py-24 bg-surface-container-lowest">
  <div className="container mx-auto px-12">
    <div className="text-center mb-16">
      <span className="text-[0.6875rem] font-bold tracking-[0.2em] uppercase text-primary block mb-4">Leadership</span>
      <h2 className="text-4xl font-extrabold tracking-tight">Committee Leads</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[committee.head, committee.viceHead].map((leader) => (
        <article key={leader.role} className="bg-surface-container-low p-8">
          <img src={leader.image} alt={leader.name} className="w-full h-72 object-cover mb-6 bg-surface-container" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">{leader.role}</p>
          <h3 className="text-2xl font-bold mb-3">{leader.name}</h3>
          <p className="text-on-surface-variant mb-6 leading-relaxed">{leader.bio}</p>
          <div className="flex items-center gap-4">
            <a href={leader.githubUrl} aria-label={`${leader.name} GitHub`} className="text-primary"><span className="material-symbols-outlined">code</span></a>
            <a href={leader.linkedinUrl} aria-label={`${leader.name} LinkedIn`} className="text-primary"><span className="material-symbols-outlined">work</span></a>
            <a href={`mailto:${leader.email}`} aria-label={`${leader.name} email`} className="text-primary"><span className="material-symbols-outlined">mail</span></a>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 4: Add category labels into the shared committee data**

```jsx
const categoryLabelMap = {
  technical: 'Technical',
  'non-technical': 'Non-Technical',
};

// inside each committee object
categoryLabel: categoryLabelMap.technical,
```

---

### Task 4: Wire Routes and Navigation

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/Navbar.jsx`

- [ ] **Step 1: Register the new routes in the router**

```jsx
import CommitteesPage from './pages/CommitteesPage'
import CommitteeDetailPage from './pages/CommitteeDetailPage'

<Route path="/committees" element={<CommitteesPage />} />
<Route path="/committees/:slug" element={<CommitteeDetailPage />} />
```

- [ ] **Step 2: Add Committees to the navbar links**

```jsx
const navLinks = [
  { name: 'Standards', href: '#' },
  { name: 'Publications', href: '#' },
  { name: 'Education', href: '#' },
  { name: 'Committees', href: '/committees' },
  { name: 'Membership', href: '/membership' },
];
```

---

### Task 5: Verify The Feature

**Files:**
- Verify: `npm run lint`
- Verify: `npm run build`

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: ESLint completes without errors.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Vite build completes successfully and outputs production assets.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx src/components/Navbar.jsx src/data/committees.js src/pages/CommitteesPage.jsx src/pages/CommitteeDetailPage.jsx docs/superpowers/specs/2026-04-10-committees-pages-design.md docs/superpowers/plans/2026-04-10-committees-pages.md
git commit -m "feat: add committees overview and detail pages"
```
