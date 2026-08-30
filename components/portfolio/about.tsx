import {
  BadgeCheck,
  Boxes,
  Cloud,
  Compass,
  Network,
  Radio,
  Server,
} from "lucide-react";
import { SectionShell } from "@/components/portfolio/section-shell";
import { Reveal } from "@/components/ui/reveal";
import {
  currentlyExploring,
  focusAreas,
  profile,
} from "@/lib/portfolio-data";

const FOCUS_ICONS = [
  Server,
  Network,
  Boxes,
  Radio,
  Cloud,
  Compass,
] as const;

const FOCUS_KEYS = [
  "backend-engineering",
  "microservices",
  "distributed-systems",
  "event-driven",
  "cloud",
  "system-design",
] as const;

const PROFILE_ROWS = [
  ["BASE", profile.location],
  ["PRIMARY", "JAVA · SPRING BOOT"],
  ["SYSTEMS", "MICROSERVICES · KAFKA"],
  ["CLOUD", "AWS"],
  ["MINDSET", "BUILD → MEASURE → IMPROVE"],
] as const;

export function About() {
  return (
    <SectionShell
      id="about"
      index="02"
      kicker="ENGINEER PROFILE"
      // title={
      //   <>
      //     I BUILD BACKENDS THAT{" "}
      //     <span className="text-accent">HOLD UP UNDER PRESSURE.</span>
      //   </>
      // }
      title={
  <>
    THE ENGINEER <span className="text-accent">BEHIND THE SYSTEMS.</span>
  </>
}
      description="Java backend developer focused on scalable services, distributed systems and event-driven architectures — with a growing interest in intelligent systems."
    >
      <div className="grid min-w-0 gap-5 sm:gap-6 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
        {/* Engineer profile */}
        <Reveal className="h-full">
          <aside
            aria-label="Engineer profile"
            className="panel corner-brackets relative flex h-full min-w-0 flex-col overflow-hidden p-5 sm:p-6 md:p-7"
          >
            {/* System status */}
            <div
              className="absolute right-4 top-4 flex items-center gap-2 font-mono text-[8px] tracking-[0.22em] text-ok sm:right-5 sm:top-5"
              aria-label="Currently online"
            >
              <span
                className="size-1.5 animate-pulse-dot rounded-full bg-ok"
                aria-hidden
              />
              ONLINE
            </div>

            {/* Identity */}
            <div className="flex min-w-0 items-center gap-3.5 pr-14 sm:gap-4">
              <div
                aria-hidden
                className="flex size-14 shrink-0 items-center justify-center border border-accent/40 bg-accent-soft font-display text-lg font-bold tracking-[0.1em] text-accent sm:size-[68px] sm:text-xl"
              >
                US
              </div>

              <div className="min-w-0">
                <h3 className="truncate font-display text-lg font-bold tracking-wide text-ink sm:text-xl">
                  {profile.name.toUpperCase()}
                </h3>

                <p className="mt-1 truncate font-mono text-[9px] font-semibold tracking-[0.16em] text-accent sm:text-[10px] sm:tracking-[0.2em]">
                  {profile.role.toUpperCase()}
                </p>

                <p className="mt-1.5 font-mono text-[8px] tracking-[0.15em] text-ink-faint sm:text-[9px] sm:tracking-[0.18em]">
                  {profile.experienceYears} PRODUCTION EXPERIENCE
                </p>
              </div>
            </div>

            {/* Positioning */}
            <div className="mt-6 border-l-2 border-accent/40 pl-3.5 sm:mt-7 sm:pl-4">
              <p className="text-[13px] leading-[1.75] text-ink-dim sm:text-sm">
                I enjoy taking complex backend problems and turning them into
                systems that are reliable, observable, maintainable, and ready
                to evolve as requirements grow.
              </p>
            </div>

            {/* Engineering profile */}
            <dl className="mt-6 space-y-3 font-mono text-[9px] tracking-[0.1em] sm:mt-7 sm:space-y-3.5 sm:text-[10px] sm:tracking-[0.13em]">
              {PROFILE_ROWS.map(([key, value]) => (
                <div
                  key={key}
                  className="flex min-w-0 items-center gap-2"
                >
                  <dt className="shrink-0 text-ink-faint">{key}</dt>

                  <span
                    aria-hidden
                    className="min-w-3 flex-1 translate-y-[-1px] border-b border-dotted border-line-strong"
                  />

                  <dd className="min-w-0 text-right text-ink-dim">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Engineering principle */}
            <div className="mt-7 pt-2 sm:mt-auto sm:pt-8">
              <div className="border border-line bg-background/40 p-3.5 sm:p-4">
                <p className="font-mono text-[8px] tracking-[0.28em] text-ink-faint">
                  ENGINEERING PRINCIPLE
                </p>

                <p className="mt-2 font-display text-sm font-semibold leading-relaxed text-ink">
                  &quot;Design for failure.
                  <br />
                  Build for scale.&quot;
                </p>
              </div>

              <div className="mt-3 inline-flex max-w-full items-center gap-2 border border-line px-3 py-2 font-mono text-[8px] tracking-[0.15em] text-ok sm:mt-4 sm:text-[9px] sm:tracking-[0.18em]">
                <BadgeCheck className="size-3.5 shrink-0" aria-hidden />
                <span>PRODUCTION-GRADE DISCIPLINE</span>
              </div>
            </div>
          </aside>
        </Reveal>

        {/* Engineering focus */}
        <div className="min-w-0">
          <Reveal delay={0.05}>
            <div className="mb-4 flex flex-col gap-2.5 sm:mb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[8px] font-medium tracking-[0.28em] text-accent sm:text-[9px] sm:tracking-[0.35em]">
                  {"//ENGINEERING FOCUS"}
                </p>

                <h3 className="mt-1.5 font-display text-lg font-bold tracking-tight text-ink sm:mt-2 sm:text-xl md:text-2xl">
                  SYSTEMS, SERVICES &amp; SCALE
                </h3>
              </div>

              <p className="shrink-0 font-mono text-[8px] tracking-[0.2em] text-ink-faint">
                06 ENGINEERING AREAS
              </p>
            </div>
          </Reveal>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            {focusAreas.map((area, index) => {
              const Icon = FOCUS_ICONS[index % FOCUS_ICONS.length];
              const key = FOCUS_KEYS[index % FOCUS_KEYS.length];
              const number = String(index + 1).padStart(2, "0");

              return (
                <Reveal
                  key={key}
                  delay={index * 0.035}
                  className="h-full"
                >
                  <article
                    aria-labelledby={`${key}-title`}
                    className="panel group relative flex h-full min-h-[156px] min-w-0 flex-col overflow-hidden p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 sm:min-h-[170px] sm:p-5"
                  >
                    {/* Card number */}
                    <span
                      aria-hidden
                      className="absolute right-4 top-4 font-mono text-[8px] tracking-[0.2em] text-ink-faint/60 sm:right-5 sm:top-5"
                    >
                      {number}
                    </span>

                    {/* Title */}
                    <div className="flex min-w-0 items-start gap-3 pr-7">
                      <span
                        aria-hidden
                        className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-accent/30 bg-accent-soft text-accent transition-all duration-300 group-hover:border-accent/60 group-hover:bg-accent group-hover:text-background"
                      >
                        <Icon className="size-4" />
                      </span>

                      <div className="min-w-0">
                        <h4
                          id={`${key}-title`}
                          className="font-mono text-[10px] font-semibold leading-[1.4] tracking-[0.14em] text-ink sm:text-[11px] sm:tracking-[0.18em]"
                        >
                          {area.title.toUpperCase()}
                        </h4>

                        <div
                          aria-hidden
                          className="mt-2 h-px w-7 bg-accent/40 transition-all duration-300 group-hover:w-12 group-hover:bg-accent"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mt-3.5 text-[12px] leading-[1.7] text-ink-dim sm:mt-4 sm:text-[13px] sm:leading-[1.75]">
                      {area.detail}
                    </p>

                    {/* Hover indicator */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute bottom-0 left-0 h-px w-0 bg-accent transition-all duration-500 group-hover:w-full"
                    />
                  </article>
                </Reveal>
              );
            })}
          </div>

          {/* Current exploration */}
          <Reveal delay={0.1}>
            <aside
              aria-label="Currently exploring"
              className="relative mt-5 overflow-hidden border border-warn/25 bg-gradient-to-r from-warn/[0.07] via-warn/[0.03] to-transparent p-4 sm:mt-6 sm:p-5 md:p-6"
            >
              {/* Decorative glow */}
              <div
                aria-hidden
                className="pointer-events-none absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08),transparent_65%)]"
              />

              <div className="relative">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <p className="font-mono text-[8px] font-semibold tracking-[0.25em] text-warn sm:text-[9px] sm:tracking-[0.3em]">
                    ▲ CURRENT EXPLORATION
                  </p>

                  <span className="font-mono text-[7px] tracking-[0.18em] text-ink-faint sm:text-[8px] sm:tracking-[0.22em]">
                    NOT PRODUCTION CLAIMS
                  </span>
                </div>

                <ul className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
                  {currentlyExploring.map((item) => (
                    <li key={item}>
                      <span className="chip chip--ai !text-[9px] sm:!text-[10px]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="mt-3 max-w-3xl text-[12px] leading-[1.7] text-ink-dim sm:mt-4 sm:text-[13px] sm:leading-[1.75]">
                  I&apos;m extending the same backend fundamentals into AI —
                  exploring LLMs, retrieval-augmented generation, and agentic
                  systems while keeping reliability, architecture, and
                  observability at the center.
                </p>
              </div>
            </aside>
          </Reveal>
        </div>
      </div>
    </SectionShell>
  );
}