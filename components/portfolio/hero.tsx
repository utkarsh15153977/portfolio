"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { ArrowDown, ArrowRight, Mail } from "lucide-react";

import { useSystem } from "@/components/providers/system-provider";
import { usePrefersReducedMotion } from "@/hooks/use-preferences";
import { SocialLinks } from "@/components/portfolio/social-links";
import { SystemStatus } from "@/components/portfolio/system-status";
import { initGsap } from "@/lib/gsap";
import { heroTechLine, profile } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

function SplitWord({
  word,
  outline = false,
}: {
  word: string;
  outline?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex max-w-full overflow-hidden align-top"
    >
      {word.split("").map((character, index) => (
        <span
          key={`${word}-${index}`}
          data-hero-char
          className="inline-block will-change-transform"
          style={
            outline
              ? {
                  WebkitTextStroke:
                    "clamp(1px, 0.12vw, 1.5px) rgba(34,211,238,0.7)",
                  color: "transparent",
                }
              : undefined
          }
        >
          {character}
        </span>
      ))}
    </span>
  );
}

export function Hero() {
  const { state, scrollToSection } = useSystem();
  const reduced = usePrefersReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const played = useRef(false);

  useEffect(() => {
    if (state !== "ready" || played.current) return;

    played.current = true;

    if (reduced) return;

    const { gsap } = initGsap();

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
        delay: 0.15,
      });

      timeline
        .fromTo(
          "[data-hero-kicker]",
          {
            autoAlpha: 0,
            y: -10,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
          }
        )
        .fromTo(
          "[data-hero-char]",
          {
            yPercent: 110,
            autoAlpha: 0,
          },
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.6,
            stagger: 0.022,
          },
          "-=0.08"
        )
        .fromTo(
          "[data-hero-role]",
          {
            autoAlpha: 0,
            y: 14,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
          },
          "-=0.25"
        )
        .fromTo(
          "[data-hero-statement]",
          {
            autoAlpha: 0,
            y: 14,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
          },
          "-=0.22"
        )
        .fromTo(
          "[data-hero-proof]",
          {
            autoAlpha: 0,
            y: 14,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
          },
          "-=0.2"
        )
        .fromTo(
          "[data-hero-actions]",
          {
            autoAlpha: 0,
            y: 12,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.4,
          },
          "-=0.18"
        )
        .fromTo(
          "[data-hero-status]",
          {
            autoAlpha: 0,
            x: 24,
          },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.5,
          },
          "-=0.3"
        )
        .fromTo(
          "[data-hero-tech]",
          {
            autoAlpha: 0,
            y: 10,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.35,
          },
          "-=0.18"
        )
        .fromTo(
          "[data-hero-cue]",
          {
            autoAlpha: 0,
          },
          {
            autoAlpha: 1,
            duration: 0.35,
          },
          "-=0.1"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, [state, reduced]);

  const handleSectionNavigation = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    event.preventDefault();
    scrollToSection(id);
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      aria-label="Introduction"
      className={cn(
        "relative isolate flex min-h-svh flex-col overflow-hidden",
        "pt-16 sm:pt-20 lg:min-h-screen lg:pt-0"
      )}
    >
      {/* Background grid */}
      <div
        className="grid-bg pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      {/* Main atmospheric glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_25%,rgba(34,211,238,0.055),transparent_70%)]"
        aria-hidden="true"
      />

      {/* Secondary status glow */}
      <div
        className="pointer-events-none absolute right-0 top-1/4 hidden h-[500px] w-[500px] bg-[radial-gradient(circle,rgba(34,211,238,0.045),transparent_68%)] lg:block"
        aria-hidden="true"
      />

      {/* Architectural horizontal line */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-[17%] h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent"
        aria-hidden="true"
      />

      {/* Desktop architectural line */}
      <div
        className="pointer-events-none absolute bottom-0 left-[8%] top-0 hidden w-px bg-line lg:block"
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="relative mx-auto flex w-full max-w-[1320px] flex-1 items-center px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-14 md:px-8 lg:px-10 lg:pb-24 lg:pt-20">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_360px] xl:gap-20">
          {/* ============================================================ */}
          {/* HERO COPY */}
          {/* ============================================================ */}

          <div className="min-w-0">
            {/* System kicker */}
            <div
              data-hero-kicker
              className="flex max-w-full flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[9px] tracking-[0.2em] text-ink-faint sm:gap-x-4 sm:text-[10px] sm:tracking-[0.26em] md:text-[11px]"
            >
              <span className="inline-flex items-center gap-2 text-ok">
                <span
                  className="animate-pulse-dot inline-block size-1.5 rounded-full bg-ok"
                  aria-hidden="true"
                />
                SYSTEMS ONLINE
              </span>

              <span aria-hidden="true" className="text-line-strong">
                |
              </span>

              <span>BANGALORE, INDIA</span>

              <span aria-hidden="true" className="text-line-strong">
                |
              </span>

              <span className="text-accent">
                {profile.experienceYears} EXPERIENCE
              </span>
            </div>

            {/* Name */}
            <h1
              className={cn(
                "mt-5 max-w-full font-display font-bold text-ink",
                "text-[16vw] leading-[0.84] tracking-[-0.06em]",
                "sm:mt-6 sm:text-[13vw]",
                "md:text-[7.5rem]",
                "lg:text-[6.3rem]",
                "xl:text-[7.1rem]"
              )}
            >
              <SplitWord word="UTKARSH" />
              <br />
              <SplitWord word="SINGH" outline />

              <span className="sr-only">Utkarsh Singh</span>
            </h1>

            {/* Role */}
            <div
              data-hero-role
              className="mt-6 flex max-w-4xl flex-wrap items-center gap-2.5 sm:mt-7 sm:gap-3"
            >
              <span className="corner-brackets border border-accent/40 bg-accent-soft px-3.5 py-2 font-mono text-[10px] font-semibold tracking-[0.18em] text-accent sm:px-4 sm:text-xs md:text-sm">
                BACKEND ENGINEER
              </span>

              <span className="font-mono text-[8.5px] tracking-[0.16em] text-ink-faint sm:text-[10px] sm:tracking-[0.2em]">
                JAVA · SPRING BOOT · DISTRIBUTED SYSTEMS
              </span>
            </div>

            {/* Main statement */}
            <div data-hero-statement className="mt-7 sm:mt-8">
              <h2 className="max-w-3xl font-display text-[clamp(2rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-ink">
                I BUILD BACKENDS THAT{" "}
                <span className="text-accent">HOLD UP UNDER PRESSURE.</span>
              </h2>

              <p className="mt-5 max-w-2xl text-[13px] leading-[1.75] text-ink-dim sm:mt-6 sm:text-sm md:text-base lg:text-lg">
                Production systems. Event-driven architecture. Reliable
                services at scale.
              </p>
            </div>

            {/* Engineering proof */}
            <div
              data-hero-proof
              className="mt-7 grid max-w-3xl grid-cols-2 overflow-hidden border-y border-line sm:mt-8 sm:grid-cols-4"
            >
              <div className="min-w-0 border-r border-b border-line px-3 py-3.5 sm:border-b-0 sm:px-5 sm:py-4">
                <p className="font-display text-lg font-bold tracking-tight text-ink sm:text-2xl">
                  3+
                </p>

                <p className="mt-1 font-mono text-[8px] leading-tight tracking-[0.14em] text-ink-faint sm:text-[9px] sm:tracking-[0.18em]">
                  YEARS EXPERIENCE
                </p>
              </div>

              <div className="min-w-0 border-b border-line px-3 py-3.5 sm:border-b-0 sm:border-r sm:px-5 sm:py-4">
                <p className="font-display text-lg font-bold tracking-tight text-ink sm:text-2xl">
                  JAVA
                </p>

                <p className="mt-1 font-mono text-[8px] leading-tight tracking-[0.14em] text-ink-faint sm:text-[9px] sm:tracking-[0.18em]">
                  PRIMARY STACK
                </p>
              </div>

              <div className="min-w-0 border-r border-line px-3 py-3.5 sm:px-5 sm:py-4">
                <p className="font-display text-lg font-bold tracking-tight text-ink sm:text-2xl">
                  KAFKA
                </p>

                <p className="mt-1 font-mono text-[8px] leading-tight tracking-[0.14em] text-ink-faint sm:text-[9px] sm:tracking-[0.18em]">
                  EVENT-DRIVEN
                </p>
              </div>

              <div className="min-w-0 px-3 py-3.5 sm:px-5 sm:py-4">
                <p className="font-display text-lg font-bold tracking-tight text-ink sm:text-2xl">
                  AWS
                </p>

                <p className="mt-1 font-mono text-[8px] leading-tight tracking-[0.14em] text-ink-faint sm:text-[9px] sm:tracking-[0.18em]">
                  CLOUD READY
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div
              data-hero-actions
              className="mt-7 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
            >
              <a
                href="#experience"
                onClick={(event) =>
                  handleSectionNavigation(event, "experience")
                }
                className="group inline-flex min-h-12 items-center justify-center gap-2 bg-accent px-5 py-3.5 font-mono text-[10px] font-bold tracking-[0.18em] text-background transition-all hover:bg-cyan-300 hover:shadow-[0_0_28px_rgba(34,211,238,0.35)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent sm:min-h-0 sm:px-6 sm:text-xs md:text-sm"
              >
                VIEW EXPERIENCE
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>

              <a
                href="#projects"
                onClick={(event) =>
                  handleSectionNavigation(event, "projects")
                }
                className="group inline-flex min-h-12 items-center justify-center gap-2 border border-line-strong px-5 py-3.5 font-mono text-[10px] font-bold tracking-[0.18em] text-ink transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent sm:min-h-0 sm:px-6 sm:text-xs md:text-sm"
              >
                VIEW PROJECTS
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>

              <a
                href="#contact"
                onClick={(event) =>
                  handleSectionNavigation(event, "contact")
                }
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-line px-5 py-3.5 font-mono text-[10px] font-bold tracking-[0.18em] text-ink-faint transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent sm:min-h-0 sm:px-4 sm:text-xs"
              >
                <Mail className="size-3.5" aria-hidden="true" />
                CONTACT
              </a>

              <SocialLinks
                variant="row"
                className="justify-center sm:ml-1 sm:justify-start"
              />
            </div>

            {/* Technology line */}
            <div
              data-hero-tech
              className="mt-9 border-y border-line py-3.5 sm:mt-11 sm:py-4"
            >
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 sm:gap-x-6 sm:gap-y-3">
                {heroTechLine
                  .filter((tech) => tech !== "AI")
                  .map((tech) => (
                    <span
                      key={tech}
                      className="flex items-center gap-2 font-mono text-[8.5px] tracking-[0.16em] text-ink-dim sm:gap-2.5 sm:text-[10px] sm:tracking-[0.22em]"
                    >
                      <span
                        className="inline-block size-1 shrink-0 rounded-full bg-accent/50"
                        aria-hidden="true"
                      />

                      {tech}
                    </span>
                  ))}

                <span
                  className="hidden h-4 w-px bg-line-strong sm:block"
                  aria-hidden="true"
                />

                <span className="flex items-center gap-2 font-mono text-[8.5px] tracking-[0.16em] text-warn sm:gap-2.5 sm:text-[10px] sm:tracking-[0.22em]">
                  <span
                    className="inline-block size-1 shrink-0 rounded-full bg-warn"
                    aria-hidden="true"
                  />

                  EXPLORING: AI / RAG
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* SYSTEM STATUS */}
          {/* ============================================================ */}

          <div
            data-hero-status
            className="w-full lg:self-center"
          >
            <SystemStatus />

            {/* Small supporting system note */}
            <div className="mt-3 hidden border-l border-accent/30 pl-4 lg:block">
              <p className="font-mono text-[8px] leading-[1.8] tracking-[0.16em] text-ink-faint">
                &gt; ENGINEERING MODE ACTIVE
                <br />
                &gt; FOCUS: RELIABLE BACKEND SYSTEMS
                <br />
                &gt; NEXT: DISTRIBUTED AI SYSTEMS
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <button
        type="button"
        data-hero-cue
        onClick={() => scrollToSection("about")}
        className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[9px] tracking-[0.35em] text-ink-faint transition-colors hover:text-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent lg:flex"
        aria-label="Scroll to about section"
      >
        SCROLL

        <ArrowDown
          className="size-3.5 animate-bounce"
          aria-hidden="true"
        />
      </button>
    </section>
  );
}