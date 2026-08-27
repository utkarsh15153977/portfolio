"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Building2, GitBranch, MapPin } from "lucide-react";
import { SectionShell } from "@/components/portfolio/section-shell";
import { Reveal } from "@/components/ui/reveal";
import { initGsap } from "@/lib/gsap";
import { experience, techProgression } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

function TechnicalProgression() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selected = techProgression.find((n) => n.key === selectedKey) ?? null;

  return (
    <div
      className="mt-16 border-t border-line pt-12"
      aria-labelledby="progression-heading"
    >
      <Reveal>
        <p className="font-mono text-[10px] tracking-[0.35em] text-accent">
          TECHNICAL PROGRESSION
        </p>
        <h3
          id="progression-heading"
          className="mt-3 font-display text-xl font-bold tracking-wide text-ink sm:text-2xl"
        >
          FROM FIRST SERVICE TO FULL PIPELINE.
        </h3>
        <p className="mt-2 font-mono text-[10px] tracking-[0.2em] text-ink-faint">
          {"// A STORYTELLING DEVICE — NOT A STRICT CHRONOLOGY. SELECT A NODE."}
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <div
          role="toolbar"
          aria-label="Technical progression nodes"
          aria-orientation="horizontal"
          className="mt-6 flex items-center gap-0 overflow-x-auto pb-2"
        >
          {techProgression.map((node, i) => {
            const isSelected = node.key === selectedKey;
            return (
              <div key={node.key} className="flex shrink-0 items-center">
                <button
                  onClick={() =>
                    setSelectedKey((k) => (k === node.key ? null : node.key))
                  }
                  aria-pressed={isSelected}
                  className={cn(
                    "inline-flex items-center gap-2 whitespace-nowrap border px-3 py-2 font-mono text-[10px] tracking-[0.14em] transition-all",
                    isSelected
                      ? "border-accent/60 bg-accent-soft text-accent"
                      : "border-line text-ink-faint hover:border-line-strong hover:text-ink-dim"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "text-[8.5px]",
                      isSelected ? "text-accent" : "text-ink-faint/80"
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {node.label}
                </button>
                {i < techProgression.length - 1 && (
                  <ArrowRight
                    className="mx-1 size-3 shrink-0 text-accent/40"
                    aria-hidden
                  />
                )}
              </div>
            );
          })}
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <div
          aria-live="polite"
          className="mt-5 min-h-[88px] border border-line bg-surface-2/70 p-4 sm:p-5"
        >
          {selected ? (
            <p className="max-w-3xl text-sm leading-relaxed text-ink-dim">
              <span className="mr-2 font-mono text-xs font-bold tracking-[0.18em] text-accent">
                {selected.label}
              </span>
              — {selected.detail}
            </p>
          ) : (
            <p className="pt-1 font-mono text-[11px] tracking-[0.18em] text-ink-faint">
              &gt; SELECT A NODE TO SEE HOW IT WAS USED PROFESSIONALLY
              <span className="ml-1 inline-block h-3.5 w-2 translate-y-[2px] animate-pulse bg-accent/70" />
            </p>
          )}
        </div>
      </Reveal>
    </div>
  );
}

export function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Timeline rail draws itself as the section scrolls.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const { gsap } = initGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-rail-fill]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 70%",
            end: "bottom 75%",
            scrub: 0.6,
          },
        }
      );
      gsap.utils.toArray<HTMLElement>("[data-domain]").forEach((card, i) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, x: 26 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.6,
            delay: (i % 2) * 0.05,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%", once: true },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <SectionShell
      id="experience"
      index="03"
      kicker="PROFESSIONAL EXPERIENCE"
      title="PRODUCTION BACKEND EXPERIENCE"
      description={`${profile.experienceYears} building Java microservices and distributed systems at ${experience.company}`}
    >
      <div ref={sectionRef}>
        {/* company header */}
        <Reveal>
          <header className="panel corner-brackets relative overflow-hidden p-6 sm:p-8">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_85%_20%,rgba(34,211,238,0.08),transparent)]"
              aria-hidden
            />
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-ink-faint">
                  <Building2 className="size-3.5" aria-hidden />
                  EMPLOYER // CORE BANKING
                </p>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-wide text-ink sm:text-3xl">
                  {experience.company.toUpperCase()}
                </h3>
                <p className="mt-1 text-sm text-ink-dim">{experience.parent} · {experience.role}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.16em] text-ink-faint">
                  <MapPin className="size-3" aria-hidden />
                  {experience.location.toUpperCase()}
                </p>
              </div>

              <div className="text-right">
                <span className="chip chip--solid">{experience.period}</span>
                <p className="mt-3 font-mono text-[10px] leading-relaxed tracking-[0.18em] text-ink-faint">
                  09/2022 — JOINED<br />08/2025 — END OF LISTED EXPERIENCE
                </p>
              </div>
            </div>

            {/* highlights */}
            <ul className="mt-7 grid gap-3 sm:grid-cols-3">
              {experience.highlights.map((h, i) => (
                <li
                  key={i}
                  className="border border-line bg-surface-2/60 p-4 transition-colors hover:border-accent/40"
                >
                  <p className="font-mono text-[9px] tracking-[0.3em] text-accent">
                    HIGHLIGHT-{String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-[13px] leading-snug text-ink-dim">{h}</p>
                </li>
              ))}
            </ul>
          </header>
        </Reveal>

        {/* domain tree */}
        <div className="mt-14 grid gap-0 lg:grid-cols-[220px_1fr]">
          {/* rail */}
          <div className="relative hidden lg:block" aria-hidden>
            <div className="sticky top-32 pr-8">
              <p className="font-mono text-[10px] tracking-[0.35em] text-ink-faint">DOMAIN TREE</p>
              <p className="mt-2 font-display text-sm font-semibold leading-relaxed tracking-wider text-ink">
                EDGEVERVE
                <br />
                <span className="text-accent">SYSTEMS</span>
              </p>
              <div className="relative mt-5 h-[340px] w-px bg-line-strong">
                <div
                  data-rail-fill
                  className="absolute inset-0 origin-top bg-gradient-to-b from-accent to-violet"
                  style={{ transform: "scaleY(0)" }}
                />
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="absolute -left-[3px] size-[7px] rounded-full bg-background border border-accent/60"
                    style={{ top: `${[8, 46, 86][i]}%` }}
                  />
                ))}
              </div>
              <p className="mt-4 font-mono text-[9px] tracking-[0.25em] text-ink-faint">
                08 DOMAINS · 13 TECHNOLOGIES
              </p>
            </div>
          </div>

          {/* cards */}
          <ul className="grid gap-4 md:grid-cols-2">
            {experience.domains.map((domain) => (
              <li key={domain.key} data-domain className="will-change-transform">
                <article className="panel group relative h-full p-5 transition-all hover:border-accent/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.06)]">
                  <span
                    aria-hidden
                    className="absolute left-0 top-6 h-px w-4 bg-line-strong transition-all group-hover:w-6 group-hover:bg-accent/60 lg:-left-4"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-mono text-xs font-bold tracking-[0.24em] text-ink transition-colors group-hover:text-accent">
                      {domain.label}
                    </h4>
                    <GitBranch className="size-3.5 shrink-0 text-ink-faint/80 transition-colors group-hover:text-accent" aria-hidden />
                  </div>
                  <ul className="mt-3 space-y-2">
                    {domain.points.map((point, i) => (
                      <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-dim">
                        <span aria-hidden className="mt-[7px] inline-block size-1 shrink-0 rounded-full bg-accent/60" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`Technologies: ${domain.tech.join(", ")}`}>
                    {domain.tech.map((tech) => (
                      <li key={tech}>
                        <span className="chip !py-1 !text-[10px]">{tech}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <TechnicalProgression />
    </SectionShell>
  );
}
