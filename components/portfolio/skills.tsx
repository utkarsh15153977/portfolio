import {
  Boxes,
  Cloud,
  Code2,
  Container,
  Database,
  FlaskConical,
  Layers,
  Sparkles,
  Workflow,
} from "lucide-react";
import { SectionShell } from "@/components/portfolio/section-shell";
import { Reveal } from "@/components/ui/reveal";
import {
  engineeringPractices,
  skillCategories,
} from "@/lib/portfolio-data";
import type { SkillCategory } from "@/lib/portfolio-data";

const CATEGORY_ICONS: Record<string, typeof Code2> = {
  core: Code2,
  backend: Layers,
  "architecture-skills": Boxes,
  database: Database,
  messaging: Workflow,
  aws: Cloud,
  devops: Container,
  testing: FlaskConical,
  exploring: Sparkles,
};

function SkillPanel({ category }: { category: SkillCategory }) {
  const Icon = CATEGORY_ICONS[category.key] ?? Code2;
  const isExploring = category.tone === "exploring";

  return (
    <article
      aria-label={`${category.title} skills`}
      className={
        isExploring
          ? "group relative h-full overflow-hidden border border-warn/30 bg-gradient-to-br from-warn/[0.07] via-surface-2/60 to-transparent p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-warn/60"
          : "panel group relative h-full overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.05)]"
      }
    >
      <span
        aria-hidden
        className={
          isExploring
            ? "absolute right-0 top-0 h-12 w-12 border-l border-b border-warn/20"
            : "absolute right-0 top-0 h-12 w-12 border-l border-b border-line"
        }
      />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={
              isExploring
                ? "flex size-10 shrink-0 items-center justify-center rounded-sm border border-warn/40 bg-warn/10 text-warn transition-all duration-300 group-hover:border-warn/70 group-hover:bg-warn/15"
                : "flex size-10 shrink-0 items-center justify-center rounded-sm border border-accent/30 bg-accent-soft text-accent transition-all duration-300 group-hover:border-accent/60 group-hover:bg-accent group-hover:text-background"
            }
          >
            <Icon className="size-4" />
          </span>

          <div className="min-w-0">
            <h3 className="font-mono text-[11px] font-bold tracking-[0.22em] text-ink">
              {category.title.toUpperCase()}
            </h3>

            <div
              aria-hidden
              className={
                isExploring
                  ? "mt-2 h-px w-8 bg-warn/40 transition-all duration-300 group-hover:w-14 group-hover:bg-warn"
                  : "mt-2 h-px w-8 bg-accent/40 transition-all duration-300 group-hover:w-14 group-hover:bg-accent"
              }
            />
          </div>
        </div>

        {isExploring && category.note ? (
          <span className="chip chip--ai shrink-0 !py-0.5 !text-[8px]">
            {category.note}
          </span>
        ) : null}
      </div>

      <ul
        className="mt-5 flex flex-wrap gap-1.5"
        aria-label={`${category.title} technologies`}
      >
        {category.skills.map((skill) => (
          <li key={skill}>
            <span
              className={
                isExploring
                  ? "chip chip--ai transition-colors"
                  : "chip transition-colors"
              }
            >
              {skill}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex items-center gap-2 font-mono text-[8px] tracking-[0.25em] text-ink-faint">
        <span
          aria-hidden
          className={
            isExploring
              ? "size-1.5 rounded-full bg-warn/70"
              : "size-1.5 rounded-full bg-accent/60"
          }
        />

        {isExploring
          ? "EXPLORATION TRACK"
          : "PRODUCTION EXPERIENCE"}
      </div>
    </article>
  );
}

export function Skills() {
  return (
    <SectionShell
      id="skills"
      index="05"
      kicker="TECHNICAL ARSENAL"
      title={
        <>
          TOOLS OF THE <span className="text-accent">TRADE.</span>
        </>
      }
      description="A production-focused toolkit built around Java backend engineering, distributed systems, messaging, cloud infrastructure and the engineering practices required to operate them reliably."
    >
      <Reveal>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[9px] tracking-[0.35em] text-accent">
              {"// TECHNICAL ARSENAL"}
            </p>

            <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
              BUILT FOR PRODUCTION.
            </h3>
          </div>

          <p className="font-mono text-[8px] tracking-[0.22em] text-ink-faint">
            {String(skillCategories.length).padStart(2, "0")} SKILL DOMAINS
          </p>
        </div>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skillCategories.map((category, index) => (
          <Reveal
            key={category.key}
            delay={(index % 3) * 0.05}
            className="h-full"
          >
            <SkillPanel category={category} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <aside
          aria-label="Engineering practices"
          className="relative mt-8 overflow-hidden border border-line bg-surface-2/50 p-5 sm:p-6"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06),transparent_65%)]"
          />

          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[9px] tracking-[0.35em] text-accent">
                  ENGINEERING PRACTICES
                </p>

                <h3 className="mt-2 font-display text-base font-semibold tracking-wide text-ink">
                  HOW I APPROACH THE WORK.
                </h3>
              </div>

              <span className="font-mono text-[8px] tracking-[0.22em] text-ink-faint">
                {"PRINCIPLES // 01"}
              </span>
            </div>

            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {engineeringPractices.map((practice, index) => (
                <li
                  key={practice}
                  className="group flex items-start gap-3 border border-line bg-background/40 p-3 transition-colors hover:border-accent/30"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 font-mono text-[9px] text-accent"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="text-[12px] leading-relaxed text-ink-dim transition-colors group-hover:text-ink">
                    {practice}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </Reveal>

      <Reveal delay={0.14}>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <p className="font-mono text-[9px] tracking-[0.25em] text-ink-faint">
            {"NO PERCENTAGE BARS. REAL USAGE OVER SELF-RATINGS."}
          </p>

          <p className="font-mono text-[9px] tracking-[0.2em] text-accent">
            BUILD → MEASURE → IMPROVE
          </p>
        </div>
      </Reveal>
    </SectionShell>
  );
}