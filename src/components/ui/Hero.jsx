"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { committees } from "@/features/committees/data/committees";
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

      // Draw particles
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

      // Draw node links
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

      // Draw interactive mouse links
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

export default function Hero() {
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
        paths.forEach((path, i) => {
          const length = typeof path.getTotalLength === "function" ? path.getTotalLength() : 4000;
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
            fillOpacity: 0,
            strokeWidth: 2.5,
            stroke: i === 0 ? "#0e487f" : "#dcb656",
          });
        });
      }

      const tl = gsap.timeline({
        defaults: { duration: 0.7, ease: "power2.out" },
      });
      tl.from('[data-hero="logo"]', { opacity: 0, scale: 0.96, duration: 0.4, ease: "power2.out" });

      if (paths.length > 0) {
        tl.to(
          paths,
          {
            strokeDashoffset: 0,
            duration: 1.2,
            ease: "power2.out",
            stagger: 0.15,
          },
          "-=0.2",
        )
        .to(
          paths,
          {
            fillOpacity: 1,
            duration: 0.5,
            ease: "power1.inOut",
          },
          "-=0.3",
        )
        .to(
          paths,
          {
            strokeWidth: 0.25,
            duration: 0.3,
            ease: "power1.out",
            clearProps: "stroke,strokeWidth,strokeDasharray,strokeDashoffset,fillOpacity",
          },
          "-=0.2",
        );
      }

      tl.from('[data-hero="slogan"]', { opacity: 0, y: 24 }, "-=0.1")
        .from('[data-hero="copy"]', { opacity: 0, y: 24 }, "-=0.4")
        .from(
          '[data-hero="stat"]',
          { opacity: 0, y: 16, stagger: 0.08 },
          "-=0.4",
        )
        .from(
          '[data-hero="ctas"] > *',
          { opacity: 0, y: 16, stagger: 0.08 },
          "-=0.4",
        );
      scope.querySelectorAll('[data-hero="count"]').forEach((el) => {
        const target = Number(el.dataset.countTarget || 0);
        const obj = { value: 0 };
        gsap.to(obj, {
          value: target,
          duration: 1.1,
          ease: "power2.out",
          delay: 0.5,
          onUpdate: () => {
            el.textContent = `+${Math.round(obj.value)}`;
          },
        });
      });
      const mm = gsap.matchMedia();
      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          gsap.to('[data-hero="bg"]', {
            yPercent: 12,
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

  return (
    <section
      ref={scopeRef}
      aria-labelledby="home-title"
      className="relative grid min-h-[100svh] items-center overflow-hidden bg-[#070d18] pt-[var(--navbar-height)]"
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
        className="container relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 py-8 text-center md:px-12 md:py-10"
      >
        <LogoMark
          data-hero="logo"
          className="w-full max-w-[9rem] md:max-w-[11rem]"
        />
        <h1 id="home-title" className="sr-only">
          IEEE HITU Student Branch
        </h1>
        <p
          data-hero="copy"
          className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#9BA9B4] md:text-lg"
        >
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
            <dd
              className="order-1 text-3xl font-black leading-none text-[#F0F4F8]"
              data-hero="count"
              data-count-target={committees.length}
            >
              +{committees.length}
            </dd>
          </div>
          <div className="flex flex-col" data-hero="stat">
            <dt className="order-2 mt-1 text-sm text-[#9BA9B4]">Members</dt>
            <dd
              className="order-1 text-3xl font-black leading-none text-[#F0F4F8]"
              data-hero="count"
              data-count-target={180}
            >
              +180
            </dd>
          </div>
        </dl>
        <div
          data-hero="ctas"
          className="mt-5 flex flex-wrap justify-center gap-3"
        >
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
