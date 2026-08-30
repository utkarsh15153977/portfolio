"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  ArrowRight,
  Building2,
  GitBranch,
  MapPin,
  Workflow,
} from "lucide-react";

import { SectionShell } from "@/components/portfolio/section-shell";
import { Reveal } from "@/components/ui/reveal";
import { initGsap } from "@/lib/gsap";
import { experience, techProgression } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

function TechnicalProgression() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const selected =
    techProgression.find((node) => node.key === selectedKey) ?? null;

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      setSelectedKey(null);
    }
  };

  return (
    <div
      className="mt-16 border-t border-line pt-12"
      aria-labelledby="progression-heading"
      onKeyDown={handleKeyDown}
    >
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] font-semibold tracking-[0.35em] text-accent">
              {"// TECHNICAL PROGRESSION"}
            </p>

            <h3
              id="progression-heading"
              className="mt-3 font-display text-xl font-bold tracking-wide text-ink sm:text-2xl"
            >
              FROM FIRST SERVICE TO FULL PIPELINE.
            </h3>
          </div>

          <div className="hidden items-center gap-2 font-mono text-[8px] tracking-[0.2em] text-ink-faint sm:flex">
            <Workflow className="size-3" aria-hidden="true" />
            SELECT A NODE
          </div>
        </div>

        <p className="mt-3 max-w-2xl font-mono text-[9px] leading-relaxed tracking-[0.15em] text-ink-faint">
          {"// A STORYTELLING DEVICE — NOT A STRICT CHRONOLOGY."}
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <div
          role="toolbar"
          aria-label="Technical progression nodes"
          aria-orientation="horizontal"
          className="mt-7 overflow-x-auto pb-2"
        >
          <div className="flex min-w-max items-center">
            {techProgression.map((node, index) => {
              const isSelected = node.key === selectedKey;

              return (
                <div
                  key={node.key}
                  className="flex shrink-0 items-center"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedKey((current) =>
                        current === node.key ? null : node.key
                      );
                    }}
                    aria-pressed={isSelected}
                    className={cn(
                      "group inline-flex items-center gap-2 whitespace-nowrap border px-3 py-2.5 font-mono text-[10px] tracking-[0.14em] transition-all duration-300",
                      isSelected
                        ? "border-accent/60 bg-accent-soft text-accent shadow-[0_0_20px_rgba(34,211,238,0.08)]"
                        : "border-line bg-surface-2/20 text-ink-faint hover:border-line-strong hover:text-ink-dim"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "text-[8px] transition-colors",
                        isSelected
                          ? "text-accent"
                          : "text-ink-faint/70 group-hover:text-accent/70"
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {node.label}
                  </button>

                  {index < techProgression.length - 1 ? (
                    <ArrowRight
                      className="mx-1.5 size-3 shrink-0 text-accent/30"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div
          aria-live="polite"
          className="relative mt-5 min-h-[96px] overflow-hidden border border-line bg-surface-2/60 p-5 sm:p-6"
        >
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 top-0 w-px bg-accent/50"
          />

          {selected ? (
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-[9px] font-semibold tracking-[0.25em] text-accent">
                  SELECTED NODE
                </span>

                <span
                  aria-hidden="true"
                  className="h-px w-8 bg-line-strong"
                />

                <span className="font-mono text-[10px] tracking-[0.18em] text-ink">
                  {selected.label}
                </span>
              </div>

              <p className="mt-3 max-w-3xl text-sm leading-[1.75] text-ink-dim">
                {selected.detail}
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className="mt-[5px] size-1.5 shrink-0 bg-accent/70"
              />

              <p className="font-mono text-[10px] leading-relaxed tracking-[0.16em] text-ink-faint sm:text-[11px]">
                {" > SELECT A NODE TO SEE HOW IT WAS USED PROFESSIONALLY"}
                <span
                  aria-hidden="true"
                  className="ml-1 inline-block h-3.5 w-2 translate-y-[3px] animate-pulse bg-accent/70"
                />
              </p>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}

export function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = sectionRef.current;

    if (!element) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    const { gsap } = initGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-rail-fill]",
        {
          scaleY: 0,
        },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top 70%",
            end: "bottom 75%",
            scrub: 0.6,
          },
        }
      );

      gsap.utils
        .toArray<HTMLElement>("[data-domain]")
        .forEach((card, index) => {
          gsap.fromTo(
            card,
            {
              autoAlpha: 0,
              y: 24,
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.65,
              delay: (index % 2) * 0.06,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 88%",
                once: true,
              },
            }
          );
        });
    }, element);

    return () => ctx.revert();
  }, []);

  return (
    <SectionShell
      id="experience"
      index="03"
      kicker="PROFESSIONAL EXPERIENCE"
      title={
        <>
          THREE YEARS IN <span className="text-accent">PRODUCTION.</span>
        </>
      }
      description="Core banking systems at scale — where correctness, resilience, observability and operational discipline are not optional."
    >
      <div ref={sectionRef}>
        <Reveal>
          <header className="panel corner-brackets relative overflow-hidden p-6 sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_90%_at_90%_10%,rgba(34,211,238,0.08),transparent_70%)]"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:32px_32px]"
            />

            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-7">
                <div>
                  <p className="inline-flex items-center gap-2 font-mono text-[9px] font-medium tracking-[0.3em] text-ink-faint">
                    <Building2 className="size-3.5" aria-hidden="true" />
                    EMPLOYER // CORE BANKING
                  </p>

                  <h3 className="mt-3 font-display text-2xl font-bold tracking-wide text-ink sm:text-3xl">
                    {experience.company.toUpperCase()}
                  </h3>

                  <p className="mt-1.5 text-sm text-ink-dim">
                    {experience.parent} · {experience.role}
                  </p>

                  <p className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-ink-faint">
                    <MapPin className="size-3" aria-hidden="true" />
                    {experience.location.toUpperCase()}
                  </p>
                </div>

                <div className="sm:text-right">
                  <span className="chip chip--solid">
                    {experience.period}
                  </span>

                  <p className="mt-3 font-mono text-[9px] leading-[1.8] tracking-[0.16em] text-ink-faint">
                    {"09/2022 — JOINED"}
                    <br />
                    {"08/2025 — END OF LISTED EXPERIENCE"}
                  </p>
                </div>
              </div>

              <ul className="mt-8 grid gap-3 sm:grid-cols-3">
                {experience.highlights.map((highlight, index) => (
                  <li
                    key={index}
                    className="group border border-line bg-surface-2/60 p-4 transition-all duration-300 hover:border-accent/40 hover:bg-accent-soft/30"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-[8px] font-semibold tracking-[0.3em] text-accent">
                        HIGHLIGHT-{String(index + 1).padStart(2, "0")}
                      </p>

                      <span
                        aria-hidden="true"
                        className="h-px w-5 bg-line-strong transition-all duration-300 group-hover:w-8 group-hover:bg-accent/60"
                      />
                    </div>

                    <p className="mt-3 text-[13px] leading-[1.65] text-ink-dim">
                      {highlight}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </header>
        </Reveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside
            className="relative hidden lg:block"
            aria-label="Experience domain tree"
          >
            <div className="sticky top-32 pr-8">
              <p className="font-mono text-[9px] font-semibold tracking-[0.35em] text-ink-faint">
                DOMAIN TREE
              </p>

              <p className="mt-2 font-display text-sm font-semibold leading-relaxed tracking-wider text-ink">
                EDGEVERVE
                <br />
                <span className="text-accent">SYSTEMS</span>
              </p>

              <div className="relative mt-6 h-[520px] w-px bg-line-strong">
                <div
                  data-rail-fill
                  aria-hidden="true"
                  className="absolute inset-0 origin-top bg-gradient-to-b from-accent via-accent/70 to-violet"
                  style={{ transform: "scaleY(0)" }}
                />

                {[8, 32, 56, 80].map((position) => (
                  <span
                    key={position}
                    aria-hidden="true"
                    className="absolute -left-[3px] size-[7px] rounded-full border border-accent/60 bg-background"
                    style={{ top: `${position}%` }}
                  />
                ))}
              </div>

              <div className="mt-4 space-y-1 font-mono text-[8px] tracking-[0.22em] text-ink-faint">
                <p>08 DOMAINS</p>
                <p>13 TECHNOLOGIES</p>
              </div>
            </div>
          </aside>

          <ul className="grid gap-4 md:grid-cols-2">
            {experience.domains.map((domain, index) => (
              <li
                key={domain.key}
                data-domain
                className="will-change-transform"
              >
                <article className="panel group relative flex h-full flex-col overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.06)] sm:p-6">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-7 h-px w-4 bg-line-strong transition-all duration-300 group-hover:w-7 group-hover:bg-accent/60 lg:-left-4"
                  />

                  <span
                    aria-hidden="true"
                    className="absolute right-5 top-5 font-mono text-[8px] tracking-[0.2em] text-ink-faint/50"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div className="flex items-center justify-between gap-4 pr-8">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex size-8 shrink-0 items-center justify-center border border-accent/25 bg-accent-soft text-accent transition-all duration-300 group-hover:border-accent/50 group-hover:bg-accent group-hover:text-background"
                      >
                        <GitBranch className="size-3.5" />
                      </span>

                      <h4 className="font-mono text-[11px] font-bold tracking-[0.2em] text-ink transition-colors group-hover:text-accent">
                        {domain.label}
                      </h4>
                    </div>
                  </div>

                  <div
                    aria-hidden="true"
                    className="mt-4 h-px w-10 bg-accent/30 transition-all duration-300 group-hover:w-16 group-hover:bg-accent/70"
                  />

                  <ul className="mt-4 space-y-2.5">
                    {domain.points.map((point, pointIndex) => (
                      <li
                        key={pointIndex}
                        className="flex gap-2.5 text-[13px] leading-[1.65] text-ink-dim"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[8px] size-1 shrink-0 rounded-full bg-accent/60"
                        />

                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <ul
                    className="mt-auto flex flex-wrap gap-1.5 pt-5"
                    aria-label={`Technologies used: ${domain.tech.join(", ")}`}
                  >
                    {domain.tech.map((tech) => (
                      <li key={tech}>
                        <span className="chip !py-1 !text-[9px]">
                          {tech}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 h-px w-0 bg-accent transition-all duration-500 group-hover:w-full"
                  />
                </article>
              </li>
            ))}
          </ul>
        </div>

        <Reveal>
          <div className="mt-8 flex items-center justify-between border-y border-line py-3 lg:hidden">
            <span className="font-mono text-[8px] tracking-[0.25em] text-ink-faint">
              EXPERIENCE DOMAINS
            </span>

            <span className="font-mono text-[8px] tracking-[0.2em] text-accent">
              {String(experience.domains.length).padStart(2, "0")} AREAS
            </span>
          </div>
        </Reveal>
      </div>

      <TechnicalProgression />
    </SectionShell>
  );
}