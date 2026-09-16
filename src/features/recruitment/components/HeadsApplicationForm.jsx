"use client";
import { useEffect, useRef, useState } from "react";
import { submitApplication } from "@/lib/recruitment";
import { uploadToCloudinary, uploadFileToCloudinary } from "@/lib/upload";
import {
  ACADEMIC_YEAR_OPTIONS,
  GRADE_OPTIONS,
  validateHeadsApplication,
  validateHeadsStep,
} from "@/lib/recruitmentValidation";
import { fetchCommitteesResult } from "@/features/committees/hooks/useCommittees";
import { committees as fallbackCommittees } from "@/features/committees/data/committees";
import Select, { toOptions } from "@/components/ui/Select";

const DRAFT_KEY = "recruitment:heads:draft";
const emptyValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
  photoUrl: "",
  university: "",
  major: "",
  academicYear: "",
  grade: "",
  cvUrl: "",
  links: "",
  applyingAs: "",
  committee: "",
  whyHead: "",
  experience: "",
  prevMember: "",
  prevCommittee: "",
  prevPosition: "",
  studentActivities: "",
  weeklyHours: "",
  whyJoin: "",
  notes: "",
};
const STEP_TITLES = ["Personal", "Ambition", "Experience", "Notes"];

// Which wizard step renders each field, so a failed final validation
// can jump back to the step where the user can see and fix the error.
const FIELD_STEPS = {
  name: 0,
  email: 0,
  phone: 0,
  address: 0,
  photoUrl: 0,
  university: 0,
  major: 0,
  academicYear: 0,
  grade: 0,
  cvUrl: 0,
  links: 0,
  applyingAs: 1,
  committee: 1,
  whyHead: 1,
  experience: 1,
  prevMember: 2,
  prevCommittee: 2,
  prevPosition: 2,
  studentActivities: 2,
  weeklyHours: 2,
  whyJoin: 2,
  notes: 3,
};

const APPLYING_AS_SELECT_OPTIONS = [
  { value: "head", label: "Head" },
  { value: "vice-head", label: "Vice Head" },
  { value: "manager", label: "Manager" },
];

const ACADEMIC_YEAR_SELECT_OPTIONS = [
  { value: "1st", label: "1st Year" },
  { value: "2nd", label: "2nd Year" },
  { value: "3rd", label: "3rd Year" },
  { value: "4th", label: "4th Year" },
];

const GRADE_SELECT_OPTIONS = [
  { value: "excellent", label: "Excellent (3.5 – 4.0)" },
  { value: "very-good", label: "Very Good (3.0 – 3.49)" },
  { value: "good", label: "Good (2.5 – 2.99)" },
  { value: "pass", label: "Pass (2.0 – 2.49)" },
];

// Legacy drafts stored free text. Map common variants to the select values so
// returning applicants don't lose their step-1 answers.
const YEAR_BY_DIGIT = { 1: "1st", 2: "2nd", 3: "3rd", 4: "4th" };
function normalizeAcademicYear(raw) {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (ACADEMIC_YEAR_OPTIONS.includes(s)) return s;
  const digit = s.match(/[1-4]/);
  if (digit) return YEAR_BY_DIGIT[digit[0]];
  for (const [word, value] of [
    ["first", "1st"],
    ["second", "2nd"],
    ["third", "3rd"],
    ["fourth", "4th"],
  ]) {
    if (s.includes(word)) return value;
  }
  return "";
}

function normalizeGrade(raw) {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!s || GRADE_OPTIONS.includes(s)) return s;
  if (s.includes("excellent")) return "excellent";
  if (s.includes("very good") || s.includes("very-good")) return "very-good";
  if (s.includes("good")) return "good";
  if (s.includes("pass")) return "pass";
  return "";
}

function migrateDraft(stored = {}) {
  const next = { ...emptyValues };
  for (const key of Object.keys(emptyValues)) {
    if (typeof stored[key] === "string") next[key] = stored[key];
  }
  if (!next.committee && typeof stored.firstPref === "string")
    next.committee = stored.firstPref;
  if (!next.applyingAs && typeof stored.role === "string") {
    const r = stored.role.toLowerCase();
    if (r.includes("vice")) next.applyingAs = "vice-head";
    else if (r.includes("manager")) next.applyingAs = "manager";
    else if (r.includes("head")) next.applyingAs = "head";
  }
  if (!next.studentActivities && typeof stored.activitiesDetails === "string")
    next.studentActivities = stored.activitiesDetails;
  next.academicYear = normalizeAcademicYear(next.academicYear);
  next.grade = normalizeGrade(next.grade);
  return next;
}

function loadDraft() {
  try {
    const stored = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
    return migrateDraft(stored);
  } catch {
    return { ...emptyValues };
  }
}

export default function HeadsApplicationForm({ onClosed }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(loadDraft);
  const [photoFile, setPhotoFile] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldError, setFieldError] = useState(null);
  const [doneId, setDoneId] = useState(null);
  const [options, setOptions] = useState(fallbackCommittees);
  // Submit replaces Continue in the same spot on step 4. A double-click (or
  // Enter-key repeat) on Continue would otherwise land on Submit and send the
  // form before the user can type Notes. Hold Submit briefly on step entry.
  const [readyToSubmit, setReadyToSubmit] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const notesRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    } catch {
      /* private-mode storage may be unavailable; draft stays in memory */
    }
  }, [values]);
  useEffect(() => {
    let active = true;
    fetchCommitteesResult()
      .then((r) => {
        if (active && r?.committees?.length) setOptions(r.committees);
      })
      .catch(() => {
        /* fallback committees stay in use */
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (step !== 3) {
      setReadyToSubmit(true);
      setConfirmed(false);
      return;
    }
    setReadyToSubmit(false);
    notesRef.current?.focus();
    const t = setTimeout(() => setReadyToSubmit(true), 800);
    return () => clearTimeout(t);
  }, [step]);

  const set = (key) => (valueOrEvent) => {
    setFieldError(null);
    const next =
      valueOrEvent &&
      typeof valueOrEvent === "object" &&
      "target" in valueOrEvent
        ? valueOrEvent.target.value
        : valueOrEvent;
    setValues((v) => ({ ...v, [key]: next }));
  };
  function next() {
    setError(null);
    // One shared gate: the same rules the final submit enforces, so bad
    // input can never advance to a later step.
    const check = validateHeadsStep(step, values, {
      hasPhotoFile: !!photoFile,
      hasCvFile: !!cvFile,
    });
    if (!check.ok) {
      setFieldError(check);
      return;
    }
    setFieldError(null);
    setStep((s) => Math.min(s + 1, 3));
  }

  async function submit(e) {
    e.preventDefault();
    // Enter inside a text input implicitly submits the form on any step.
    // Only the final step may really submit; earlier steps advance instead.
    if (step < 3) {
      next();
      return;
    }
    // Ignore the second half of a double-click / key repeat that lands on
    // Submit right after Continue advanced to this step.
    if (!readyToSubmit) return;
    // The Step 4 confirmation checkbox gates real submission; implicit
    // submits (Enter / assistive tech) must not bypass the disabled button.
    if (!confirmed) return;
    setError(null);
    setFieldError(null);
    setUploading(true);
    try {
      // Fail fast on text fields before spending time on file uploads.
      const pre = validateHeadsApplication(values, { skipUploads: true });
      if (!pre.ok) {
        setFieldError(pre);
        setStep(FIELD_STEPS[pre.field] ?? 0);
        setUploading(false);
        return;
      }
      const photoUrl = photoFile
        ? await uploadToCloudinary(photoFile)
        : String(values.photoUrl ?? "").trim();
      const cvUrl = cvFile
        ? await uploadFileToCloudinary(cvFile)
        : String(values.cvUrl ?? "").trim();
      const payload = { ...values, photoUrl, cvUrl };
      const check = validateHeadsApplication(payload);
      if (!check.ok) {
        setFieldError(check);
        setStep(FIELD_STEPS[check.field] ?? 0);
        setUploading(false);
        return;
      }
      const id = await submitApplication("heads", payload);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* draft already gone */
      }
      setDoneId(id);
    } catch (err) {
      if (
        String(err.message || "")
          .toLowerCase()
          .includes("closed") ||
        String(err.message || "").includes("410")
      )
        onClosed?.();
      else setError(err.message);
    }
    setUploading(false);
  }

  const firstName = String(values.name ?? "").trim().split(/\s+/)[0];

  if (doneId)
    return (
      <div role="status" className="card page-enter relative overflow-hidden p-8 md:p-12">
        <span
          aria-hidden="true"
          className="wedge-accent absolute right-0 top-0 h-20 w-20 md:h-28 md:w-28"
          style={{ background: "linear-gradient(135deg, var(--primary), var(--color-primary-container))" }}
        />
        <span className="btn-wedge inline-flex h-12 w-12 items-center justify-center bg-primary text-white">
          <span className="material-symbols-outlined" aria-hidden="true">check</span>
        </span>
        <p className="mt-5 text-xs font-bold uppercase tracking-widest text-primary">
          Application received
        </p>
        <h2 className="mt-3 text-3xl font-black md:text-4xl">
          {firstName ? `You're all set, ${firstName}!` : "You're all set!"}
        </h2>
        <p className="mt-4 max-w-xl text-on-surface-variant">
          Thanks for applying — our team will review your answers and reach out
          if anything else is needed.
        </p>
        <p className="mt-6">
          <span className="inline-block rounded-full bg-primary-fixed px-4 py-1.5 text-xs font-bold text-on-primary-fixed">
            Reference #{doneId}
          </span>
        </p>
      </div>
    );

  const errFor = (name) =>
    fieldError?.field === name ? (
      <p className="form-error" role="alert">
        {fieldError.error}
      </p>
    ) : null;
  const input = (label, key, props = {}) => (
    <label className="form-label" htmlFor={`heads-${key}`}>
      {label}
      <input
        id={`heads-${key}`}
        className="form-input mt-2"
        value={values[key]}
        onChange={set(key)}
        {...props}
      />
      {errFor(key)}
    </label>
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
          Step {step + 1}/4 — {STEP_TITLES[step]}
        </p>
        <div className="mt-2 h-1 bg-surface-container">
          <div
            className="h-1 bg-primary btn-wedge"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>
      </div>
      {error && (
        <div
          role="alert"
          className="p-4 bg-error/10 border border-error/30 rounded-lg text-sm text-error"
        >
          {error}
        </div>
      )}
      {step === 0 && (
        <>
          {input("Full name", "name", { required: true, type: "text" })}
          {input("Email", "email", { required: true, type: "email" })}
          {input("Phone", "phone", { required: true, type: "tel" })}
          {input("Address", "address")}
          {input("University", "university", { required: true })}
          {input("Major", "major", { required: true })}
          <Select
            id="heads-academicYear"
            label="Academic Year"
            required
            name="academicYear"
            value={values.academicYear}
            onChange={set("academicYear")}
            options={ACADEMIC_YEAR_SELECT_OPTIONS}
            placeholder="Select…"
          />
          {errFor("academicYear")}
          <Select
            id="heads-grade"
            label="Current Academic Grade"
            name="grade"
            value={values.grade}
            onChange={set("grade")}
            options={GRADE_SELECT_OPTIONS}
            placeholder="Select…"
          />
          {errFor("grade")}
          <div className="file-upload">
            <label className="form-label" htmlFor="heads-photoFile">
              Personal photo (upload, required)
            </label>
            <input
              id="heads-photoFile"
              className="form-file"
              type="file"
              accept="image/*"
              required={!values.photoUrl}
              onChange={(e) => {
                setFieldError(null);
                setPhotoFile(e.target.files?.[0] || null);
              }}
            />
            {photoFile && (
              <p className="file-chosen" aria-live="polite">
                ✓ {photoFile.name}
              </p>
            )}
            {errFor("photoUrl")}
          </div>
          <div className="file-upload">
            <label className="form-label" htmlFor="heads-cvFile">
              CV (PDF file, required)
            </label>
            <input
              id="heads-cvFile"
              className="form-file"
              type="file"
              accept=".pdf,.doc,.docx"
              required={!values.cvUrl}
              onChange={(e) => {
                setFieldError(null);
                setCvFile(e.target.files?.[0] || null);
              }}
            />
            {cvFile && (
              <p className="file-chosen" aria-live="polite">
                ✓ {cvFile.name}
              </p>
            )}
            {errFor("cvUrl")}
          </div>
          {input("Social media links (comma-separated)", "links", {
            type: "text",
            placeholder: "https://…, https://…",
          })}
        </>
      )}
      {step === 1 && (
        <>
          <Select
            id="heads-applyingAs"
            label="You are applying as"
            required
            name="applyingAs"
            value={values.applyingAs}
            onChange={set("applyingAs")}
            options={APPLYING_AS_SELECT_OPTIONS}
            placeholder="Select…"
          />
          {errFor("applyingAs")}
          <Select
            id="heads-committee"
            label="Committee"
            required
            name="committee"
            value={values.committee}
            onChange={set("committee")}
            placeholder="Select a committee"
            options={toOptions(options)}
          />
          {errFor("committee")}
          <label className="form-label" htmlFor="heads-whyHead">
            Why do you want to apply as a head?
            <textarea
              id="heads-whyHead"
              className="form-textarea mt-2"
              rows={4}
              required
              value={values.whyHead}
              onChange={set("whyHead")}
            />
            {errFor("whyHead")}
          </label>
          <label className="form-label" htmlFor="heads-experience">
            What&apos;s your technical experience in this field?
            <textarea
              id="heads-experience"
              className="form-textarea mt-2"
              rows={4}
              required
              value={values.experience}
              onChange={set("experience")}
            />
            {errFor("experience")}
          </label>
        </>
      )}
      {step === 2 && (
        <>
          <Select
            id="heads-prevMember"
            label="Are you a previous IEEE HITU member?"
            required
            name="prevMember"
            value={values.prevMember}
            onChange={set("prevMember")}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            placeholder="Select…"
          />
          {errFor("prevMember")}
          {values.prevMember === "yes" && (
            <>
              {input("Committee name", "prevCommittee", { required: true })}
              {input("Position", "prevPosition", { required: true })}
            </>
          )}
          <label className="form-label" htmlFor="heads-studentActivities">
            Student activity experience
            <textarea
              id="heads-studentActivities"
              className="form-textarea mt-2"
              rows={4}
              required
              value={values.studentActivities}
              onChange={set("studentActivities")}
              placeholder="Tell us about your student activities…"
            />
            {errFor("studentActivities")}
          </label>
          {input("Weekly commit hours", "weeklyHours", {
            required: true,
            placeholder: "e.g. 6",
          })}
          <label className="form-label" htmlFor="heads-whyJoin">
            Why do you want to join IEEE HITU?
            <textarea
              id="heads-whyJoin"
              className="form-textarea mt-2"
              rows={4}
              required
              value={values.whyJoin}
              onChange={set("whyJoin")}
            />
            {errFor("whyJoin")}
          </label>
        </>
      )}
      {step === 3 && (
        <>
          <label className="form-label" htmlFor="heads-notes">
            Notes
            <textarea
              ref={notesRef}
              id="heads-notes"
              className="form-textarea mt-2"
              rows={4}
              value={values.notes}
              onChange={set("notes")}
              placeholder="Anything else you want us to know…"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm" htmlFor="heads-confirm">
            <input
              id="heads-confirm"
              type="checkbox"
              className="form-checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I confirm that the information I provided is accurate.
          </label>
          <input
            type="text"
            name="company_website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
            value={values.company_website || ""}
            onChange={set("company_website")}
          />
        </>
      )}
      <div className="flex gap-3">
        {step > 0 && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            className="btn btn-primary btn-wedge"
            onClick={next}
          >
            Continue
          </button>
        ) : (
          <button
            type="submit"
            className="btn btn-primary btn-wedge"
            disabled={uploading || !readyToSubmit || !confirmed}
          >
            {uploading ? "Submitting…" : "Submit application"}
          </button>
        )}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setValues({ ...emptyValues });
            setPhotoFile(null);
            setCvFile(null);
            setStep(0);
            setError(null);
            setFieldError(null);
            try {
              localStorage.removeItem(DRAFT_KEY);
            } catch {
              /* nothing to clear */
            }
          }}
        >
          Clear
        </button>
      </div>
    </form>
  );
}
