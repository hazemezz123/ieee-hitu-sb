'use client'

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchEvents, deleteEvent } from "@/features/events/hooks/useEvents";
import { useAdminAuth } from "../hooks/useAdminAuth";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Skeleton from "@/components/ui/Skeleton";
import EventsTable from "./EventsTable";
import LoginForm from "./LoginForm";
import GalleryTab from "./GalleryTab";
import CommitteesTab from "./CommitteesTab";
import PartnersTab from "./PartnersTab";
import RecruitmentTab from "./RecruitmentTab";

export default function AdminShell() {
  const router = useRouter();
  const { authed, checking, login, logout } = useAdminAuth();
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
      await login(password);
      setPassword("");
      setLoading(true);
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
    await logout();
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
      <LoginForm
        password={password}
        setPassword={setPassword}
        loginError={loginError}
        onSubmit={handleLogin}
      />
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
              onClick={() => router.push("/admin/events/new")}
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
          {["events", "gallery", "committees", "partners", "recruitment"].map((name) => (
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
              {name === "events" ? "Events" : name === "gallery" ? "Gallery" : name === "committees" ? "Committees" : name === "recruitment" ? "Recruitment" : "Partners"}
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
        ) : tab === "recruitment" ? (
          <RecruitmentTab />
        ) : (
          <EventsTable
            events={events}
            loading={loading}
            onEdit={(ev) => router.push("/admin/events/" + ev._id + "/edit")}
            onConfirmDelete={confirmDelete}
          />
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
