'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MasonryGallery from "../components/MasonryGallery";
import { fetchEventBySlugResult } from "../data/eventsSource";
import Skeleton from "../components/Skeleton";

const formatDate = (date) => {
  const parsed = new Date(date);
  return Number.isFinite(parsed.getTime())
    ? parsed.toLocaleDateString("en-US", { dateStyle: "long", timeZone: "UTC" })
    : "Date unavailable";
};

function EventDetail({ slug }) {
  const [state, setState] = useState({
    event: null,
    source: null,
    status: "loading",
  });
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let active = true;
    fetchEventBySlugResult(slug)
      .then((result) => {
        if (active) {
          setImageFailed(false);
          setState({ ...result, status: "ready" });
        }
      })
      .catch(
        () =>
          active && setState({ event: null, source: null, status: "error" }),
      );
    return () => {
      active = false;
    };
  }, [slug]);

  if (state.status === "loading")
    return (
      <div className="page-enter pt-[var(--navbar-height,6rem)]">
        <div
          role="status"
          className="container mx-auto max-w-5xl px-6 py-16 md:px-12 md:py-24"
        >
          <span className="sr-only">Loading event record...</span>
          <Skeleton className="aspect-[21/9] w-full rounded-none" />
          <div className="mt-8 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-3/4 md:h-14" />
            <Skeleton className="h-5 w-full max-w-2xl" />
          </div>
          <dl className="mt-10 grid gap-6 border-y border-outline-variant/30 py-8 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-40" />
            </div>
          </dl>
        </div>
      </div>
    );
  if (state.status === "error")
    return (
      <div className="page-enter pt-[var(--navbar-height,6rem)]">
        <div
          role="alert"
          className="container mx-auto max-w-5xl px-6 py-24 text-center"
        >
          <h1 className="text-3xl font-bold text-on-surface">
            Event record could not be loaded
          </h1>
          <p className="mt-3 text-on-surface-variant">
            Please try again later.
          </p>
        </div>
      </div>
    );
  if (!state.event)
    return (
      <div className="page-enter pt-[var(--navbar-height,6rem)]">
        <div className="container mx-auto max-w-5xl px-6 py-24 text-center">
          <h1 className="text-4xl font-black text-on-surface">
            Event not found
          </h1>
          <p className="mt-3 text-on-surface-variant">
            The event page you are looking for does not exist.
          </p>
          <Link
            className="mt-8 inline-flex min-h-11 items-center text-xs font-bold uppercase tracking-widest text-primary"
            href="/events"
          >
            Back to events
          </Link>
        </div>
      </div>
    );

  const event = state.event;
  return (
    <div className="page-enter pt-[var(--navbar-height,6rem)]">
      {event.coverImage && !imageFailed ? (
        <img
          className=" w-full object-cover"
          src={event.coverImage}
          alt={event.title || "Event"}
          onError={() => setImageFailed(true)}
        />
      ) : event.coverImage ? (
        <div
          role="img"
          aria-label={`${event.title || "Event"} image unavailable`}
          className="flex  w-full items-center justify-center bg-surface-container text-center font-semibold text-on-surface-variant"
        >
          Image unavailable
        </div>
      ) : null}
      <article className="container mx-auto max-w-5xl px-6 py-6 md:px-12 md:py-14">
        {state.source === "fallback" && (
          <p className="mt-6 bg-secondary-container px-6 py-3 text-center text-sm text-on-secondary-container">
            Showing saved fallback event information while live event data is
            unavailable.
          </p>
        )}
        <header className="max-w-3xl py-12">
          <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-primary">
            <span>
              {event.categoryLabel || event.category || "Uncategorised"}
            </span>
            <span>{event.status || "Status unavailable"}</span>
          </div>
          <h1 className="mt-4 text-4xl font-black leading-tight text-on-surface md:text-6xl">
            {event.title || "Untitled event"}
          </h1>
          {event.excerpt && (
            <p className="mt-5 text-xl leading-relaxed text-on-surface-variant">
              {event.excerpt}
            </p>
          )}
          {event.eventLink && (
            <a
              className="btn btn-primary mt-8"
              href={event.eventLink}
              target="_blank"
              rel="noreferrer"
            >
              Attend
            </a>
          )}
        </header>
        <dl className="grid gap-6 border-y border-outline-variant/30 py-8 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Date
            </dt>
            <dd className="mt-2 text-on-surface">
              {formatDate(event.date)}
              {event.endDate && ` - ${formatDate(event.endDate)}`}
            </dd>
          </div>
          {event.location && (
            <div>
              <dt className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Location
              </dt>
              <dd className="mt-2 text-on-surface">{event.location}</dd>
            </div>
          )}
          {event.organizerCommittee && (
            <div>
              <dt className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Organizer
              </dt>
              <dd className="mt-2 text-on-surface">
                {event.organizerCommittee} Committee
              </dd>
            </div>
          )}
        </dl>
        {event.description && (
          <section className="max-w-3xl py-16">
            <h2 className="text-2xl font-bold text-on-surface">
              About the event
            </h2>
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-on-surface-variant">
              {event.description
                .split("\n")
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index}>{paragraph.trim()}</p>
                ))}
            </div>
          </section>
        )}
        {event.gallery?.length > 0 && (
          <section className="py-16">
            <h2 className="text-2xl font-bold text-on-surface">Event photos</h2>
            <div className="mt-8">
              <MasonryGallery images={event.gallery} />
            </div>
          </section>
        )}
      </article>
    </div>
  );
}

export default function EventDetailPage() {
  const { slug } = useParams();
  return <EventDetail key={slug} slug={slug} />;
}
