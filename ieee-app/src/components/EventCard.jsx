import { Link } from 'react-router-dom';

function formatDateBadge(dateStr) {
  const date = new Date(dateStr);
  return {
    day: date.toLocaleDateString('en-US', { day: 'numeric' }).toUpperCase(),
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
  };
}

export default function EventCard({ event }) {
  const { day, month } = formatDateBadge(event.date);

  return (
    <article className="group relative bg-surface-container-low overflow-hidden transition-all duration-300 hover:bg-surface-container-lowest hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={event.coverImage}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {event.status === 'upcoming' && (
          <span className="absolute top-4 left-4 bg-primary text-on-primary text-[0.625rem] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            Upcoming
          </span>
        )}
        <div className="absolute top-4 right-4 bg-surface-container-lowest/95 backdrop-blur-sm text-on-surface px-3 py-2 text-center leading-none shadow-sm">
          <div className="text-lg font-black leading-none">{day}</div>
          <div className="text-[0.625rem] font-bold uppercase tracking-wider leading-none mt-1">{month}</div>
        </div>
      </div>

      <div className="p-6">
        <span className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-primary block mb-2">
          {event.categoryLabel}
        </span>
        <h3 className="text-xl font-bold text-on-surface mb-2 line-clamp-2">
          {event.title}
        </h3>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-4 line-clamp-2">
          {event.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-base">location_on</span>
            <span className="truncate">{event.location}</span>
          </div>
          <Link
            to={`/events/${event.slug}`}
            className="inline-flex items-center gap-1 text-primary font-bold text-[0.6875rem] uppercase tracking-widest whitespace-nowrap"
          >
            View
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
