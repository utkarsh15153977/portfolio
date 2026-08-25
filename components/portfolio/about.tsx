import { BadgeCheck, Boxes, Cloud, Compass, Network, Radio, Server } from "lucide-react";
import { SectionShell } from "@/components/portfolio/section-shell";
import { Reveal } from "@/components/ui/reveal";
import {
  currentlyExploring,
  focusAreas,
  profile,
} from "@/lib/portfolio-data";

const FOCUS_ICONS = [Server, Network, Boxes, Radio, Cloud, Compass] as const;

const FOCUS_KEYS = [
  "backend-engineering",
  "microservices",
  "distributed-systems",
  "event-driven",
  "cloud",
  "system-design",
] as const;

export function About() {
  return (
    <SectionShell
      id="about"
      index="02"
      kicker="ENGINEER PROFILE"
      title={
        <>
          BACKEND ENGINEER WITH <br className="hidden sm:block" />
          <span className="text-accent">A SYSTEMS MINDSET.</span>
        </>
      }
      description={`${profile.name} — ${profile.role} with ${profile.experienceYears.toLowerCase()} of production experience. The work below reflects how I think about building software that survives scale.`}
    >
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* identity card */}
        <Reveal>
          <aside className="panel corner-brackets flex h-full flex-col p-6 sm:p-7" aria-label="Identity summary">
            <div className="flex items-center gap-4">
              <div
                aria-hidden
                className="flex size-16 shrink-0 items-center justify-center border border-accent/40 bg-accent-soft font-display text-xl font-bold tracking-widest text-accent"
              >
                US
              </div>
              <div>
                <h3 className="font-display text-lg font-bold tracking-wide text-ink">
                  {profile.name.toUpperCase()}
                </h3>
                <p className="mt-0.5 font-mono text-[11px] tracking-[0.2em] text-accent">
                  {profile.role.toUpperCase()}
                </p>
                <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-ink-faint">
                  {profile.experienceYears} EXPERIENCE
                </p>
              </div>
            </div>

            <dl className="mt-6 space-y-3 font-mono text-[11px] tracking-[0.14em]">
              {[
                ["BASE", profile.location],
                ["FOCUS", "SCALABLE BACKEND SYSTEMS"],
                ["CORE", "JAVA · SPRING · KAFKA · AWS"],
                ["MODE", "BUILDING → EXPLORING AI"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline gap-2">
                  <dt className="shrink-0 text-ink-faint">{k}</dt>
                  <span aria-hidden className="flex-1 translate-y-[-3px] border-b border-dotted border-line-strong" />
                  <dd className="text-right text-ink-dim">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-auto pt-6">
              <p className="inline-flex items-center gap-2 border border-line px-3 py-2 font-mono text-[10px] tracking-[0.2em] text-ok">
                <BadgeCheck className="size-3.5" aria-hidden />
                PRODUCTION-GRADE DISCIPLINE
              </p>
            </div>
          </aside>
        </Reveal>

        {/* focus areas */}
        <div>
          <Reveal delay={0.05}>
            <p className="mb-4 font-mono text-[10px] tracking-[0.35em] text-ink-faint">
              FOCUS AREAS
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {focusAreas.map((area, i) => {
              const Icon = FOCUS_ICONS[i % FOCUS_ICONS.length];
              const key = FOCUS_KEYS[i % FOCUS_KEYS.length];
              return (
                <Reveal key={key} delay={i * 0.04}>
                  <article className="panel group h-full p-5 transition-colors hover:border-accent/40">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-sm border border-accent/30 bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-background">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <h3 className="font-mono text-xs font-semibold tracking-[0.22em] text-ink">
                        {area.title.toUpperCase()}
                      </h3>
                    </div>
                    <p className="mt-3 text-[13px] leading-relaxed text-ink-dim">
                      {area.detail}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>

          {/* exploring strip */}
          <Reveal delay={0.1}>
            <aside
              aria-label="Currently exploring"
              className="relative mt-6 overflow-hidden border border-warn/25 bg-gradient-to-r from-warn/[0.07] to-transparent p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <p className="font-mono text-[10px] tracking-[0.35em] text-warn">
                  ▲ CURRENTLY EXPLORING
                </p>
                <ul className="flex flex-wrap gap-2">
                  {currentlyExploring.map((item) => (
                    <li key={item}>
                      <span className="chip chip--ai">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-ink-dim">
                The next chapter of the same engineering discipline — extending distributed-systems
                fundamentals toward intelligent systems. Exploration, not production claims.
              </p>
            </aside>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}
