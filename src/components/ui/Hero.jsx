"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { committees } from "@/features/committees/data/committees";

export default function Hero() {
  const scopeRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !scopeRef.current) return;
    if (typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const scope = scopeRef.current;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { duration: 0.7, ease: "power2.out" } });
      tl.from('[data-hero="logo"]', { opacity: 0, scale: 0.92 })
        .from('[data-hero="slogan"]', { opacity: 0, y: 24 }, "-=0.4")
        .from('[data-hero="copy"]', { opacity: 0, y: 24 }, "-=0.45")
        .from('[data-hero="stat"]', { opacity: 0, y: 16, stagger: 0.08 }, "-=0.4")
        .from('[data-hero="ctas"] > *', { opacity: 0, y: 16, stagger: 0.08 }, "-=0.4");
      scope.querySelectorAll('[data-hero="count"]').forEach((el) => {
        const target = Number(el.dataset.countTarget || 0);
        const obj = { value: 0 };
        gsap.to(obj, {
          value: target, duration: 1.1, ease: "power2.out", delay: 0.5,
          onUpdate: () => { el.textContent = `+${Math.round(obj.value)}`; },
        });
      });
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.to('[data-hero="bg"]', {
          yPercent: 12, ease: "none",
          scrollTrigger: { trigger: scope, start: "top top", end: "bottom top", scrub: 1 },
        });
      });
    }, scope);
    return () => { ctx.revert(); };
  }, []);

  return (
    <section
      ref={scopeRef}
      aria-labelledby="home-title"
      className="grid min-h-[100svh] items-center overflow-hidden bg-inverse-surface pt-[var(--navbar-height)]"
    >
      <div data-hero="bg" aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-24 h-80 w-80 rounded-full border border-primary/20" />
        <div className="absolute -left-20 top-36 h-56 w-56 rounded-full border border-primary/15" />
      </div>
      <div data-hero="content" className="container relative mx-auto flex max-w-4xl flex-col items-center px-6 py-8 text-center md:px-12 md:py-10">
        <img
          data-hero="logo"
          src="/logo.png"
          alt=""
          className="w-full max-w-[9rem] object-contain md:max-w-[11rem]"
        />
        <h1 id="home-title" className="sr-only">
          IEEE HITU Student Branch
        </h1>
        <p data-hero="copy" className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#9BA9B4] md:text-lg">
          The IEEE student branch at Helwan International Technological
          University — hands-on workshops, technical committees, and a community
          that learns and builds together.
        </p>
        <img
          data-hero="slogan"
          src="/slogan/ieeehitu_kit_white.png"
          alt="IEEE HITU Student Branch slogan"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="mx-auto mt-4 h-auto w-full max-w-xs object-contain"
        />
        <dl className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-4">
          <div className="flex flex-col" data-hero="stat">
            <dt className="order-2 mt-1 text-sm text-[#9BA9B4]">Committees</dt>
            <dd className="order-1 text-3xl font-black leading-none text-[#F0F4F8]" data-hero="count" data-count-target={committees.length}>
              +{committees.length}
            </dd>
          </div>
          <div className="flex flex-col" data-hero="stat">
            <dt className="order-2 mt-1 text-sm text-[#9BA9B4]">Members</dt>
            <dd className="order-1 text-3xl font-black leading-none text-[#F0F4F8]" data-hero="count" data-count-target={180}>
              +180
            </dd>
          </div>
        </dl>
        <div data-hero="ctas" className="mt-5 flex flex-wrap justify-center gap-3">
          <Link className="btn btn-primary" href="/events">
            View events
          </Link>
          <Link className="btn btn-secondary" href="/join-us">
            Join the branch
          </Link>
        </div>
      </div>
    </section>
  );
}
