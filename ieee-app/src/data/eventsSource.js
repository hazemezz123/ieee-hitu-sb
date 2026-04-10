import { client } from '../lib/sanity';
import { events as staticEvents, getEventBySlug as getStaticEventBySlug } from './events';

const USE_SANITY = true;

const eventsGROQ = `*[_type == "event"] | order(date desc) {
  _id,
  title,
  "slug": slug.current,
  date,
  endDate,
  location,
  category,
  "coverImage": coverImage.asset->url,
  excerpt,
  description[]{
    ...
  },
  gallery[]{
    "src": asset->url,
    caption
  },
  organizerCommittee
}`;

const eventBySlugGROQ = `*[_type == "event" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  date,
  endDate,
  location,
  category,
  "coverImage": coverImage.asset->url,
  excerpt,
  description[]{
    ...
  },
  gallery[]{
    "src": asset->url,
    caption
  },
  organizerCommittee
}`;

function mapSanityEvent(doc) {
  const eventDate = new Date(doc.date);
  const status = eventDate > new Date() ? 'upcoming' : 'past';

  return {
    title: doc.title,
    slug: doc.slug,
    date: doc.date,
    endDate: doc.endDate || null,
    location: doc.location,
    category: doc.category,
    categoryLabel: doc.category?.charAt(0).toUpperCase() + doc.category?.slice(1),
    coverImage: doc.coverImage || '',
    excerpt: doc.excerpt || '',
    description: Array.isArray(doc.description)
      ? doc.description
          .filter((block) => block._type === 'block')
          .map((block) =>
            block.children?.map((child) => child.text).join('') || ''
          )
          .filter(Boolean)
          .join('\n\n')
      : '',
    gallery: doc.gallery?.map((img) => ({ src: img.src, caption: img.caption || '' })) || [],
    organizerCommittee: doc.organizerCommittee || null,
    status,
  };
}

/**
 * Fetch all events. Currently returns static data.
 * Future: swap to sanityClient.fetch('*[_type == "event"]')
 */
export async function fetchEvents() {
  if (!USE_SANITY) return staticEvents;

  try {
    const docs = await client.fetch(eventsGROQ);
    return docs.map(mapSanityEvent);
  } catch {
    return staticEvents;
  }
}

/**
 * Fetch a single event by slug. Currently returns static data.
 * Future: swap to sanityClient.fetch('*[_type == "event" && slug.current == $slug][0]')
 */
export async function fetchEventBySlug(slug) {
  if (!USE_SANITY) return getStaticEventBySlug(slug);

  try {
    const doc = await client.fetch(eventBySlugGROQ, { slug });
    return doc ? mapSanityEvent(doc) : null;
  } catch {
    return getStaticEventBySlug(slug);
  }
}
