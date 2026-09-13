import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEvents, deleteEvent } from "../data/eventsSource";
import ConfirmDialog from "../components/ConfirmDialog";
import Skeleton from "../components/Skeleton";
import GalleryTab from "./admin/GalleryTab";
import CommitteesTab from "./admin/CommitteesTab";
import PartnersTab from "./admin/PartnersTab";

async function apiAuth(path, body) {
  const res = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [tab, setTab] = useState("events");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setEvents(await fetchEvents());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    apiAuth("/api/auth/me")
      .then(({ authed }) => { if (active) setAuthed(authed); })
      .catch(() => { if (active) setAuthed(false); })
      .finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!authed) return;
    let active = true;
    fetchEvents()
      .then((data) => { if (active) setEvents(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authed]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError(null);
    try {
      await apiAuth("/api/auth/login", { password });
      setPassword("");
      setLoading(true);
      setAuthed(true);
    } catch (err) {
      setLoginError(err.message);
    }
  }

  function confirmDelete(ev) {
    setDeleteTarget(ev);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setError(null);
    try {
      await deleteEvent(deleteTarget._id);
      setDeleteTarget(null);
      await loadEvents();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogout() {
    try {
      await apiAuth("/api/auth/logout", {});
    } catch {
      // cookie may already be expired; still log out locally
    }
    setAuthed(false);
    setPassword("");
  }

  if (checking) {
    return (
      <div
        className="min-h-screen"
        style={{ paddingTop: "var(--navbar-height)" }}
      >
        <div
          className="flex items-center justify-center px-6"
          style={{ minHeight: "calc(100vh - var(--navbar-height))" }}
        >
          <div role="status">
            <span className="sr-only">Loading...</span>
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div
        className="min-h-screen"
        style={{ paddingTop: "var(--navbar-height)" }}
      >
        <div
          className="flex items-center justify-center px-6"
          style={{ minHeight: "calc(100vh - var(--navbar-height))" }}
        >
          <form onSubmit={handleLogin} className="w-full max-w-sm">
            <div className="card p-6 md:p-8">
              <h1 className="text-xl font-bold mb-1">Admin Login</h1>
              <p className="text-sm text-on-surface-variant mb-6">
                Enter the admin password to manage events.
              </p>
              <label htmlFor="admin-pw" className="form-label">
                Password
              </label>
              {loginError && (
                <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-lg text-sm text-error">
                  {loginError}
                </div>
              )}
              <input
                id="admin-pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input mb-4"
                autoFocus
              />
              <button type="submit" className="btn btn-primary w-full">
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ paddingTop: "var(--navbar-height)" }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-12 py-16 md:py-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Manage Events
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {events.length} events
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/events/new")}
              className="btn btn-primary text-xs"
            >
              + New Event
            </button>
            <button
              onClick={loadEvents}
              className="btn btn-secondary text-xs"
              disabled={loading}
            >
              Refresh
            </button>
            <button onClick={handleLogout} className="btn btn-ghost text-xs">
              Logout
            </button>
          </div>
        </div>

        <div role="tablist" className="mb-8 flex gap-2 border-b border-outline-variant/20">
          {["events", "gallery", "committees", "partners"].map((name) => (
            <button
              key={name}
              role="tab"
              aria-selected={tab === name}
              onClick={() => setTab(name)}
              className={
                "px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors " +
                (tab === name
                  ? "border-b-2 border-primary text-primary"
                  : "text-on-surface-variant hover:text-on-surface")
              }
            >
              {name === "events" ? "Events" : name === "gallery" ? "Gallery" : name === "committees" ? "Committees" : "Partners"}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error">
            {error}
          </div>
        )}

        {tab === "gallery" ? (
          <GalleryTab />
        ) : tab === "committees" ? (
          <CommitteesTab />
        ) : tab === "partners" ? (
          <PartnersTab />
        ) : loading ? (
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
        ) : (
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
                          onClick={() =>
                            navigate("/admin/events/" + ev._id + "/edit")
                          }
                          className="btn btn-ghost text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(ev)}
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
        )}

        {deleteTarget && (
          <ConfirmDialog title="Delete Event" onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete}>
            Are you sure you want to delete <span className="font-semibold text-on-surface">{deleteTarget.title}</span>? This cannot be undone.
          </ConfirmDialog>
        )}
      </div>
    </div>
  );
}
