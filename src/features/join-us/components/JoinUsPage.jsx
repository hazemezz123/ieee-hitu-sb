"use client";
import { useEffect, useState } from "react";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Skeleton from "@/components/ui/Skeleton";
import HeadsApplicationForm from "@/features/recruitment/components/HeadsApplicationForm";
import RecruitmentClosed from "@/features/recruitment/components/RecruitmentClosed";
import { fetchRecruitmentForm } from "@/lib/recruitment";

export default function JoinUsPage() {
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let active = true;
    fetchRecruitmentForm("heads")
      .then((f) => {
        if (active) {
          setForm(f);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="page-enter pt-[var(--navbar-height,6rem)]">
      <AnimatedSection>
        <header className="container mx-auto max-w-4xl px-6 py-16 sm:px-8 md:px-12 md:py-24">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Members, Heads &amp; Managers Recruitment
          </p>
          <h1 className="mt-3 text-4xl font-black text-on-surface md:text-6xl">
            Join an IEEE HITU Committee
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-on-surface-variant">
            {form?.description ||
              "Apply to lead a committee as Head or Vice-Head."}
          </p>
        </header>
      </AnimatedSection>
      <AnimatedSection delay={1}>
        <section className="py-16">
          <div className="container mx-auto max-w-3xl px-6 sm:px-8 md:px-12">
            {status === "loading" && (
              <div role="status">
                <span className="sr-only">Loading recruitment status...</span>
                <Skeleton className="h-10 w-64" />
                <Skeleton className="mt-4 h-40 w-full" />
              </div>
            )}
            {status === "error" && (
              <div role="alert" className="card p-6">
                Recruitment status could not be loaded. Please try again later.
              </div>
            )}
            {status === "ready" &&
              (form?.isOpen ? (
                <HeadsApplicationForm
                  onClosed={() => setForm({ ...form, isOpen: false })}
                />
              ) : (
                <RecruitmentClosed form={form} />
              ))}
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
