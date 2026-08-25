"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowDown, ArrowRight, Mail } from "lucide-react";
import { useSystem } from "@/components/providers/system-provider";
import { useIsMobile, usePrefersReducedMotion } from "@/hooks/use-preferences";
import { initGsap } from "@/lib/gsap";
import { heroTechLine, profile } from "@/lib/portfolio-data";
import { SocialLinks } from "@/components/portfolio/social-links";
import { cn } from "@/lib/utils";

const HeroSceneCanvas = dynamic(() => import("@/components/three/hero-scene"), {
  ssr: false,
  loading: () => <CanvasFallback />,
});

function CanvasFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center" aria-hidden>
      <div className="grid-bg absolute inset-0 opacity-60" />
      <span className="relative font-mono text-[10px] tracking-[0.35em] text-ink-faint animate-pulse">
        RENDERING SYSTEM TOPOLOGY…
      </span>
    </div>
  );
}

function SplitWord({ word, outline = false }: { word: string; outline?: boolean }) {
  return (
    <span aria-hidden className="inline-flex overflow-hidden">
      {word.split("").map((ch, i) => (
        <span
          key={i}
          data-hero-char
          className="inline-block will-change-transform"
          style={
            outline
              ? { WebkitTextStroke: "1.5px rgba(34,211,238,0.75)", color: "transparent" }
              : undefined
          }
        >
          {ch}
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const { state, scrollToSection } = useSystem();
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobile();
  const [heroVisible, setHeroVisible] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef(0);
  const played = useRef(false);

  // Hero entrance — plays once the boot overlay lifts.
  useEffect(() => {
    if (state !== "ready" || played.current) return;
    played.current = true;
    if (reduced) return;

    const { gsap } = initGsap();
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.25 });
      tl.fromTo("[data-hero-kicker]", { autoAlpha: 0, y: -12 }, { autoAlpha: 1, y: 0, duration: 0.5 })
        .fromTo(
          "[data-hero-char]",
          { yPercent: 110, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.7, stagger: 0.035 },
          "-=0.15"
        )
        .fromTo("[data-hero-role]", { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.55 }, "-=0.35")
        .fromTo("[data-hero-statement]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.55 }, "-=0.3")
        .fromTo(
          "[data-hero-chip]",
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05 },
          "-=0.3"
        )
        .fromTo("[data-hero-panel]", { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: "power2.out" }, "-=0.7")
        .fromTo("[data-hero-cue]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, "-=0.3");
    }, sectionRef);
    return () => ctx.revert();
  }, [state, reduced]);

  // Scroll progress drives the 3D scene camera drift.
  useEffect(() => {
    const { ScrollTrigger } = initGsap();
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom top",
      onUpdate: (self) => {
        scrollRef.current = self.progress;
      },
    });
    return () => st.kill();
  }, []);

  // Pause the WebGL scene while the hero is offscreen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="home"
      aria-label="Introduction"
      className="relative flex min-h-svh flex-col overflow-hidden pt-14 lg:min-h-screen lg:pt-0"
    >
      <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,rgba(34,211,238,0.07),transparent_70%)]"
        aria-hidden
      />

      <div className="relative mx-auto grid w-full max-w-[1400px] flex-1 items-center gap-10 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-6 lg:px-12 lg:pb-10">
        {/* ---------------- left: identity ---------------- */}
        <div className="order-2 lg:order-1">
          <p
            data-hero-kicker
            className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] tracking-[0.3em] text-ink-faint sm:text-[11px]"
          >
            <span className="inline-flex items-center gap-2 text-ok">
              <span className="animate-pulse-dot inline-block size-1.5 rounded-full bg-ok" aria-hidden />
              SYSTEMS ONLINE
            </span>
            <span aria-hidden className="text-line-strong">|</span>
            <span>LOC: BANGALORE, IN</span>
            <span aria-hidden className="text-line-strong">|</span>
            <span className="text-accent">{profile.experienceYears} EXPERIENCE</span>
          </p>

          <h1 className="mt-6 font-display text-[17vw] font-bold leading-[0.95] tracking-tight text-ink sm:text-7xl lg:text-[5.4rem] xl:text-[6rem]">
            <SplitWord word="UTKARSH" />
            <br />
            <SplitWord word="SINGH" outline />
            <span className="sr-only">Utkarsh Singh</span>
          </h1>

          <div data-hero-role className="mt-5 flex flex-wrap items-center gap-3">
            <span className="corner-brackets border border-accent/40 bg-accent-soft px-4 py-2 font-mono text-xs font-semibold tracking-[0.28em] text-accent sm:text-sm">
              {"// JAVA BACKEND DEVELOPER"}
            </span>
            <span className="font-mono text-[10px] tracking-[0.22em] text-ink-faint sm:text-[11px]">
              BUILDING SCALABLE BACKEND SYSTEMS
            </span>
          </div>

          <p
            data-hero-statement
            className="mt-6 max-w-xl text-sm leading-relaxed text-ink-dim sm:text-base"
          >
            {profile.statement}
          </p>

          {/* CTAs */}
          <div data-hero-chip className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("projects");
              }}
              className="group inline-flex items-center gap-2 bg-accent px-6 py-3.5 font-mono text-xs font-bold tracking-[0.22em] text-background transition-all hover:bg-cyan-300 hover:shadow-[0_0_28px_rgba(34,211,238,0.35)] sm:text-sm"
            >
              VIEW PROJECTS
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("contact");
              }}
              className="inline-flex items-center gap-2 border border-line-strong px-6 py-3.5 font-mono text-xs font-bold tracking-[0.22em] text-ink transition-colors hover:border-accent/60 hover:text-accent sm:text-sm"
            >
              <Mail className="size-4" aria-hidden />
              CONTACT ME
            </a>
            <SocialLinks variant="row" className="ml-1" />
          </div>
        </div>

        {/* ---------------- right: live system topology ---------------- */}
        <div data-hero-panel className="panel corner-brackets relative order-1 lg:order-2">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="font-mono text-[9px] tracking-[0.3em] text-ink-faint sm:text-[10px]">
              LIVE SYSTEM TOPOLOGY
            </span>
            <span className="hidden items-center gap-2 font-mono text-[9px] tracking-[0.25em] text-warn/80 sm:inline-flex">
              <span className="animate-pulse-dot inline-block size-1 rounded-full bg-warn" aria-hidden />
              AI LAYER — EXPLORING
            </span>
          </div>
          <div className="relative h-[380px] sm:h-[440px] lg:h-[560px] scanline" style={{ ["--scan-h" as string]: "560px" }}>
            <HeroSceneCanvas scrollRef={scrollRef} reduceMotion={reduced} simplify={isMobile} paused={!heroVisible} />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent"
              aria-hidden
            />
          </div>
          <div className="flex items-center justify-between border-t border-line px-4 py-2 font-mono text-[9px] tracking-[0.22em] text-ink-faint">
            <span>NODES: 13 · EDGES: 15 · EVENTS: LIVE</span>
            <span className="hidden sm:inline">HOVER NODES TO INSPECT</span>
          </div>
        </div>
      </div>

      {/* tech marquee — two identical halves; -50% translate lands on a copy boundary */}
      <div className="group relative overflow-hidden border-y border-line bg-surface/60 py-3" aria-hidden>
        <div className="animate-marquee flex w-max group-hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {heroTechLine.map((tech) => (
                <span
                  key={`${copy}-${tech}`}
                  className="flex items-center gap-10 whitespace-nowrap pr-10 font-mono text-[11px] tracking-[0.3em] text-ink-dim"
                >
                  {tech}
                  <span className={cn("inline-block size-1 rounded-full", tech === "AI" ? "bg-warn" : "bg-accent/50")} />
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
      </div>

      {/* scroll cue */}
      <button
        data-hero-cue
        onClick={() => scrollToSection("about")}
        className="absolute bottom-16 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[9px] tracking-[0.35em] text-ink-faint transition-colors hover:text-accent lg:flex"
        aria-label="Scroll to about section"
      >
        SCROLL
        <ArrowDown className="size-3.5 animate-bounce" aria-hidden />
      </button>
    </section>
  );
}
