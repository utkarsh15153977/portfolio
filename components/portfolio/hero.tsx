"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { Reveal } from "@/components/ui/reveal";
import {
  profile,
  heroTechLine,
  socialLinks,
} from "@/lib/portfolio-data";
import { initGsap } from "@/lib/gsap";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const { gsap } = initGsap();

    const context = gsap.context(() => {
      gsap.fromTo(
        ".hero-grid-line",
        {
          scaleX: 0,
        },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: element,
            start: "top 85%",
            once: true,
          },
        }
      );
    }, element);

    return () => {
      context.revert();
    };
  }, []);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative flex min-h-[calc(100vh-64px)] items-center px-4 py-16 sm:px-6 lg:px-8"
      aria-labelledby="hero-title"
    >
      {/* Decorative system line — intentionally positioned above the hero title */}
      <div
        className="hero-grid-line pointer-events-none absolute left-0 top-[18%] h-px w-full origin-left bg-gradient-to-r from-accent/60 via-accent/10 to-transparent"
        aria-hidden="true"
        style={{ transform: "scaleX(0)" }}
      />

      <div className="container mx-auto max-w-5xl">
        <Reveal>
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[11px] tracking-[0.35em] text-accent">
              <span>{profile.firstName}</span>
              <span>{" //"}</span>
              <span>{` ${profile.systemVersion}`}</span>
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.04}>
          <h1
            id="hero-title"
            className="mt-4 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl md:text-6xl lg:text-7xl"
          >
            {profile.name}
          </h1>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-sm border border-accent/30 bg-accent-soft px-4 py-1.5 font-mono text-xs tracking-[0.2em] text-accent">
              <span
                className="inline-block size-1.5 animate-pulse rounded-full bg-accent"
                aria-hidden="true"
              />
              {profile.role}
            </span>

            <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-ink-faint">
              {profile.location}
            </span>

            <span className="font-mono text-[11px] tracking-[0.16em] text-ink-faint">
              {profile.experienceYears} EXPERIENCE
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-dim sm:text-xl">
            {profile.statement}
          </p>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="mt-6 flex flex-wrap gap-2">
            {heroTechLine.map((tech) => (
              <span
                key={tech}
                className="border border-line px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-ink-dim transition-colors hover:border-accent/40 hover:text-accent"
              >
                {tech}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              className="group inline-flex items-center gap-2 bg-accent px-6 py-3.5 font-mono text-xs font-bold tracking-[0.2em] text-background transition-all hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              GET IN TOUCH
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>

            <div className="flex items-center gap-1.5">
              {socialLinks.map((link) => {
                const Icon =
                  link.label === "GitHub" ? FaGithub : FaLinkedin;

                return (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-11 items-center justify-center border border-line text-ink-dim transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label={`Visit ${link.label} profile`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </a>
                );
              })}

              <a
                href={`mailto:${profile.email}`}
                className="inline-flex size-11 items-center justify-center border border-line text-ink-dim transition-colors hover:border-accent/40 hover:text-accent"
                aria-label="Send email"
              >
                <Mail className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-12 flex items-center gap-2 text-xs text-ink-faint">
            <span className="font-mono tracking-[0.2em]">
              SYSTEM STATUS
            </span>

            <span
              className="inline-block size-1.5 animate-pulse rounded-full bg-accent"
              aria-hidden="true"
            />

            <span className="font-mono text-[9px] tracking-[0.16em] text-accent/80">
              ONLINE
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}