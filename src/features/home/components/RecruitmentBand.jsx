"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { fetchRecruitmentForm } from "@/lib/recruitment";
import { committees } from "@/features/committees/data/committees";

export default function RecruitmentBand() {
  const [form, setForm] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetchRecruitmentForm("heads")
      .then((f) => {
        if (active && f?.isOpen) {
          setForm(f);
          setOpen(true);
        }
      })
      .catch(() => {
        /* band stays hidden when status cannot load */
      });
    return () => {
      active = false;
    };
  }, []);

  if (!open) return null;

  return (
    <section
      aria-labelledby="recruitment-band-title"
      className="px-4 py-4 sm:px-6 lg:px-8"
    >
      <div
        className="max-w-7xl mx-auto rounded-3xl my-16 px-8 py-14 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #004976, #00629b)" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
      <Reveal className="relative">
        <p>
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
            Recruitment — Open
          </span>
        </p>
        <h2
          id="recruitment-band-title"
          className="mt-4 max-w-3xl text-3xl font-black tracking-tight text-[#F0F4F8] md:text-5xl"
        >
          Join an IEEE HITU Committee
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#C7D3DC] md:text-lg">
          {form?.description ||
            "Apply as a Member, Head, Vice-Head, Manager, Director, or Instructor."}
        </p>
        <p className="mt-6" aria-label={`${committees.length} committees`}>
          <strong className="text-2xl text-white">{committees.length}</strong>{" "}
          <span className="text-[#C7D3DC]">committees</span>
        </p>
        <Link
          className="btn mt-8 bg-white font-bold text-[#004976] hover:bg-[#D7E9F3]"
          href="/join-us"
        >
          Start your application
        </Link>
      </Reveal>
      </div>
    </section>
  );
}
