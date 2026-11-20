"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LogoMark from "@/components/ui/LogoMark";

function ConstellationCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    // ponytail: 65 canvas particles replace external tsparticles bundle; upgrade to tsparticles if complex physics presets are needed
    const count = 65;
    const colors = ["rgba(0, 98, 155, 0.28)", "rgba(0, 114, 206, 0.32)"];
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 1.4 + 1.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const mouse = { x: null, y: null };
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      } else {
        mouse.x = null;
        mouse.y = null;
      }
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseout", handleMouseLeave, { passive: true });

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        if (!canvas) return;
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      });
      resizeObserver.observe(canvas);
    }

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let animationId;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < count; i++) {
        const p = particles[i];
        if (!reducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = width;
          else if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          else if (p.y > height) p.y = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      const maxDist = 110;
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.22;
            ctx.strokeStyle = `rgba(0, 114, 206, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      if (mouse.x !== null && mouse.y !== null) {
        const mouseMaxDist = 140;
        for (let i = 0; i < count; i++) {
          const p = particles[i];
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < mouseMaxDist) {
            const alpha = (1 - dist / mouseMaxDist) * 0.35;
            ctx.strokeStyle = `rgba(0, 114, 206, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      if (!reducedMotion) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

export default function Hero({ recruitmentOpen = true }) {
  const scopeRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !scopeRef.current) return;
    if (typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const scope = scopeRef.current;
    const diamondPath = scope.querySelector('[data-logo="diamond"]');
    const archPath = scope.querySelector('[data-logo="arch"]');

    const ctx = gsap.context(() => {
      const paths = [diamondPath, archPath].filter(Boolean);
      if (paths.length > 0) {
        paths.forEach((path) => {
          const length =
            typeof path.getTotalLength === "function"
              ? path.getTotalLength()
              : 4000;
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
            fillOpacity: 0,
            strokeWidth: 2.5,
            stroke: "#ffffff",
          });
        });
      }

      const tl = gsap.timeline({
        defaults: { duration: 0.55, ease: "power2.out" },
      });

      if (paths.length > 0) {
        tl.to(
          paths,
          {
            strokeDashoffset: 0,
            duration: 0.95,
            ease: "power2.out",
            stagger: 0.12,
          },
          0,
        )
          .to(
            paths,
            {
              fillOpacity: 1,
              duration: 0.4,
              ease: "power1.inOut",
            },
            0.55,
          )
          .to(
            paths,
            {
              strokeWidth: 0.25,
              duration: 0.25,
              ease: "power1.out",
              clearProps:
                "stroke,strokeWidth,strokeDasharray,strokeDashoffset,fillOpacity",
            },
            0.75,
          );
      }

      tl.from('[data-hero="headline"]', { opacity: 0, y: 18 }, 0.35)
        .from('[data-hero="slogan"]', { opacity: 0, y: 18 }, 0.45)
        .from('[data-hero="copy"]', { opacity: 0, y: 16 }, 0.55)
        .from(
          '[data-hero="ctas"] > *',
          { opacity: 0, y: 14, stagger: 0.08 },
          0.65,
        );

      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.to('[data-hero="bg"]', {
            yPercent: 10,
            ease: "none",
            scrollTrigger: {
              trigger: scope,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });
        },
      );
    }, scope);

    return () => {
      ctx.revert();
    };
  }, []);

  const primaryAction = recruitmentOpen
    ? { label: "Join the Branch", href: "/join-us" }
    : { label: "Explore Committees", href: "/committees" };

  const secondaryAction = recruitmentOpen
    ? { label: "Explore Committees", href: "/committees" }
    : { label: "View Events", href: "/events" };

  return (
    <section
      ref={scopeRef}
      aria-labelledby="home-title"
      className="relative grid min-h-[92svh] items-center overflow-hidden bg-[#070d18] pt-[var(--navbar-height)] md:min-h-[100svh]"
    >
      <div
        data-hero="bg"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(0, 114, 206, 0.18) 0%, transparent 70%)",
          }}
        />
        <ConstellationCanvas />
      </div>
      <div
        data-hero="content"
        className="mx-auto flex w-full max-w-4xl flex-col items-center px-5 py-12 text-center sm:px-8 md:py-16 relative z-10"
      >
        <LogoMark
          data-hero="logo"
          variant="white"
          className="w-full max-w-[7.5rem] md:max-w-[9.5rem]"
        />
        <h1
          id="home-title"
          data-hero="headline"
          className="mt-6 text-balance text-3xl font-black leading-[1.08] tracking-tight text-[#F0F4F8] sm:text-5xl md:text-[3.25rem]"
        >
          IEEE HITU Student Branch
        </h1>
        <img
          data-hero="slogan"
          src="/logos/slogan/ieeehitu-slogan-white.svg"
          alt="Beyond Labels. Beyond Limits."
          width={1189}
          height={115}
          fetchPriority="high"
          decoding="async"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
          className="mx-auto mt-4 h-auto w-full max-w-[16rem] object-contain sm:max-w-xs"
        />
        <p
          data-hero="copy"
          className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#B6C4D1] sm:text-lg"
        >
          A student-led community at Helwan International Technological
          University where technology, ambition, and collaboration come
          together.
        </p>
        <div
          data-hero="ctas"
          className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
        >
          <Link
            className="btn btn-primary btn-wedge"
            href={primaryAction.href}
          >
            {primaryAction.label}
          </Link>
          <Link
            className="btn border border-white/30 bg-white/[0.06] text-[#F0F4F8] hover:border-white/60 hover:bg-white/[0.12]"
            href={secondaryAction.href}
          >
            {secondaryAction.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
