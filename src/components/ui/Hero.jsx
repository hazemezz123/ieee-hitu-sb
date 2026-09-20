"use client";

import Link from "next/link";
import { committees } from "@/features/committees/data/committees";

export default function Hero() {
  return (
    <section
      aria-labelledby="home-title"
      className="grid min-h-[100svh] items-center bg-inverse-surface pt-[var(--navbar-height)]"
    >
      <div className="container mx-auto flex max-w-4xl flex-col items-center px-6 py-8 text-center md:px-12 md:py-10">
        <img
          src="/logo.png"
          alt=""
          className="w-full max-w-[9rem] object-contain md:max-w-[11rem]"
        />
        <h1 id="home-title" className="sr-only">
          IEEE HITU Student Branch
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#9BA9B4] md:text-lg">
          The IEEE student branch at Helwan International Technological
          University — hands-on workshops, technical committees, and a community
          that learns and builds together.
        </p>

        {/* Branch slogan artwork (public/slogan/ieeehitu_kit_white.png). The hero
            stays dark navy in both themes, so the white version has the best
            contrast. The PNG is transparent, so no badge is needed. */}
        <img
          src="/slogan/ieeehitu_kit_white.png"
          alt="IEEE HITU Student Branch slogan"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="mx-auto mt-4 h-auto w-full max-w-xs object-contain"
        />
        <dl className="mt-5 flex flex-wrap justify-center gap-x-8 gap-y-4">
          <div className="flex flex-col">
            <dt className="order-2 mt-1 text-sm text-[#9BA9B4]">Committees</dt>
            <dd className="order-1 text-3xl font-black leading-none text-[#F0F4F8]">
              +{committees.length}
            </dd>
          </div>
          <div className="flex flex-col">
            <dt className="order-2 mt-1 text-sm text-[#9BA9B4]">Members</dt>
            <dd className="order-1 text-3xl font-black leading-none text-[#F0F4F8]">
              +180
            </dd>
          </div>
        </dl>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
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
