import { ArrowRight, FlaskConical, Sparkles } from "lucide-react";
import { SectionShell } from "@/components/portfolio/section-shell";
import { Reveal } from "@/components/ui/reveal";
import {
  aiDisclaimer,
  aiEvolutionPath,
  aiExperiments,
  type AiStatus,
} from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<AiStatus, string> = {
  EXPLORING: "border-warn/40 bg-warn/[0.07] text-warn/90",
  "FUTURE DIRECTION": "border-violet/40 bg-violet/[0.07] text-violet/90",
};

const PHASE2_PATH = [
  "NEXT.JS",
  "SPRING BOOT",
  "SPRING AI",
  "AI AGENT",
  "RAG",
  "PORTFOLIO KNOWLEDGE",
];

export function AiLab() {
  return (
    <SectionShell
      id="ai-lab"
      index="08"
      kicker="AI LAB — FUTURE DIRECTION"
      title={
        <>
          EXPLORING <span className="text-warn">INTELLIGENT SYSTEMS.</span>
        </>
      }
      description="The production foundation is Java and distributed systems. The AI Lab is where that foundation is being extended — experiments and direction, honestly labeled."
    >
      {/* disclaimer */}
      <Reveal>
        <p className="mb-8 flex flex-wrap items-center gap-2 border border-warn/25 bg-warn/[0.05] px-4 py-3 font-mono text-[10px] leading-relaxed tracking-[0.18em] text-warn/90">
          <FlaskConical className="size-3.5 shrink-0" aria-hidden />
          {aiDisclaimer.toUpperCase()}
        </p>
      </Reveal>

      {/* evolution path */}
      <Reveal delay={0.04}>
        <div className="panel mb-10 overflow-x-auto p-6 sm:p-7" aria-label="Evolution path from backend to intelligent systems">
          <p className="mb-5 font-mono text-[9px] tracking-[0.3em] text-ink-faint">
            EVOLUTION PATH
          </p>
          <ol className="flex min-w-[720px] items-center gap-2">
            {aiEvolutionPath.map((step, i) => (
              <li key={step.label} className="flex items-center gap-2">
                <span
                  className={cn(
                    "whitespace-nowrap border px-3 py-2 font-mono text-[10px] tracking-[0.18em]",
                    step.active
                      ? "border-accent/50 bg-accent-soft text-accent"
                      : "border-dashed border-warn/40 bg-warn/[0.04] text-warn/80"
                  )}
                >
                  {step.label}
                  {!step.active && (
                    <span className="ml-2 inline-block size-1 animate-pulse-dot rounded-full bg-warn align-middle" aria-hidden />
                  )}
                </span>
                {i < aiEvolutionPath.length - 1 && (
                  <ArrowRight
                    className={cn("size-3.5 shrink-0", step.active ? "text-accent/60" : "text-warn/50")}
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </Reveal>

      {/* experiment cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {aiExperiments.map((experiment, i) => (
          <Reveal key={experiment.key} delay={(i % 3) * 0.05} className="h-full">
            <article className="group relative h-full border border-line bg-gradient-to-b from-surface-2/80 to-surface/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-warn/45 hover:shadow-[0_12px_40px_rgba(251,191,36,0.07)]">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-9 items-center justify-center rounded-sm border border-warn/35 bg-warn/[0.07] text-warn">
                  <Sparkles className="size-4" aria-hidden />
                </span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[8.5px] tracking-[0.22em]",
                    STATUS_STYLE[experiment.status]
                  )}
                >
                  <span className="animate-pulse-dot inline-block size-1 rounded-full bg-current" aria-hidden />
                  {experiment.status}
                </span>
              </div>

              <h3 className="mt-4 font-mono text-sm font-bold tracking-[0.16em] text-ink transition-colors group-hover:text-warn">
                {experiment.title}
              </h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-ink-dim">
                {experiment.description}
              </p>

              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`Tags: ${experiment.tags.join(", ")}`}>
                {experiment.tags.map((tag) => (
                  <li key={tag}>
                    <span className="chip chip--ai !py-0.5 !text-[9px]">{tag}</span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>

      {/* phase 2 call path */}
      <Reveal delay={0.06}>
        <aside className="mt-10 border border-line bg-surface-2/50 p-6 sm:p-7">
          <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">
            PLANNED CALL PATH — ARCHITECTED, NOT YET WIRED
          </p>
          <ol className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2" aria-label="Planned Phase 2 architecture call path">
            {PHASE2_PATH.map((node, i) => (
              <li key={node} className="flex items-center gap-2">
                <span
                  className={cn(
                    "border px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.16em]",
                    i === 0
                      ? "border-accent/40 bg-accent-soft text-accent"
                      : "border-dashed border-line-strong text-ink-faint"
                  )}
                >
                  {node}
                </span>
                {i < PHASE2_PATH.length - 1 && (
                  <span aria-hidden className="font-mono text-[10px] text-ink-faint">→</span>
                )}
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span aria-hidden className="font-mono text-[10px] text-ink-faint">→</span>
              <span className="border border-dashed border-warn/40 px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.16em] text-warn/90">
                TOOLS · searchProjects() getSkills() explainArchitecture()
              </span>
            </li>
          </ol>
        </aside>
      </Reveal>
    </SectionShell>
  );
}
