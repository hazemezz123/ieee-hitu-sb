'use client'

import Skeleton from "@/components/ui/Skeleton";

export default function EventsTable({ events, loading, onEdit, onConfirmDelete }) {
  if (loading) {
    return (
      <div role="status" className="overflow-x-auto">
        <span className="sr-only">Loading...</span>
        <table className="w-full text-sm">
          <tbody>
            {Array.from({ length: 5 }, (_, index) => (
              <tr key={index} className="border-b border-outline-variant/10">
                <td className="py-3 pr-4"><Skeleton className="h-4 w-40" /></td>
                <td className="hidden py-3 pr-4 sm:table-cell"><Skeleton className="h-4 w-24" /></td>
                <td className="hidden py-3 pr-4 md:table-cell"><Skeleton className="h-4 w-20" /></td>
                <td className="hidden py-3 pr-4 lg:table-cell"><Skeleton className="h-4 w-16" /></td>
                <td className="py-3"><div className="flex gap-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-16" /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-outline-variant/20 text-left text-xs uppercase tracking-wider text-on-surface-variant">
            <th className="pb-3 pr-4 font-semibold">Title</th>
            <th className="pb-3 pr-4 font-semibold hidden sm:table-cell">
              Date
            </th>
            <th className="pb-3 pr-4 font-semibold hidden md:table-cell">
              Category
            </th>
            <th className="pb-3 pr-4 font-semibold hidden lg:table-cell">
              Status
            </th>
            <th className="pb-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((ev) => (
            <tr
              key={ev._id}
              className="border-b border-outline-variant/10 hover:bg-surface-container/50 transition-colors"
            >
              <td className="py-3 pr-4 font-medium">{ev.title}</td>
              <td className="py-3 pr-4 text-on-surface-variant hidden sm:table-cell whitespace-nowrap">
                {new Date(ev.date).toLocaleDateString()}
              </td>
              <td className="py-3 pr-4 text-on-surface-variant hidden md:table-cell">
                {ev.categoryLabel}
              </td>
              <td className="py-3 pr-4 hidden lg:table-cell">
                <span
                  className={
                    "text-xs font-bold uppercase tracking-wider " +
                    (ev.status === "upcoming"
                      ? "text-primary"
                      : "text-on-surface-variant")
                  }
                >
                  {ev.status}
                </span>
              </td>
              <td className="py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(ev)}
                    className="btn btn-ghost text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onConfirmDelete(ev)}
                    className="btn btn-ghost text-xs text-error"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
