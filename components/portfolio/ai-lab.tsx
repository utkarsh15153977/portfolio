import {
  ArrowRight,
  FlaskConical,
  Sparkles,
} from "lucide-react";
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
  EXPLORING:
    "border-warn/40 bg-warn/[0.07] text-warn/90",
  "FUTURE DIRECTION":
    "border-violet/40 bg-violet/[0.07] text-violet/90",
};

/*
 * Visual pipeline colors:
 *
 * 01 DOCUMENTS       → Cyan
 * 02 CHUNKING        → Amber
 * 03 EMBEDDINGS      → Violet
 * 04 VECTOR SEARCH   → Violet
 * 05 RETRIEVAL       → Violet
 * 06 LLM             → Violet
 */
const PIPELINE_STYLES = [
  {
    circle:
      "border-accent bg-accent-soft text-accent shadow-[0_0_24px_rgba(34,211,238,0.12)]",
    line: "bg-accent/30",
    arrow: "text-accent/50",
  },
  {
    circle:
      "border-warn bg-warn/[0.08] text-warn shadow-[0_0_24px_rgba(251,191,36,0.10)]",
    line: "bg-warn/30",
    arrow: "text-warn/50",
  },
  {
    circle:
      "border-violet/60 bg-violet/[0.05] text-violet/90 shadow-[0_0_24px_rgba(167,139,250,0.08)]",
    line: "bg-violet/25",
    arrow: "text-violet/40",
  },
  {
    circle:
      "border-violet/60 bg-violet/[0.05] text-violet/90 shadow-[0_0_24px_rgba(167,139,250,0.08)]",
    line: "bg-violet/25",
    arrow: "text-violet/40",
  },
  {
    circle:
      "border-violet/60 bg-violet/[0.05] text-violet/90 shadow-[0_0_24px_rgba(167,139,250,0.08)]",
    line: "bg-violet/25",
    arrow: "text-violet/40",
  },
  {
    circle:
      "border-violet/60 bg-violet/[0.05] text-violet/90 shadow-[0_0_24px_rgba(167,139,250,0.08)]",
    line: "bg-violet/25",
    arrow: "text-violet/40",
  },
];

const PIPELINE_DESCRIPTIONS = [
  "Markdown · JSON",
  "Text segmentation",
  "Vector models",
  "Nearest neighbor",
  "RAG pipeline",
  "Language model",
];

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
          EXPLORING{" "}
          <span className="text-warn">INTELLIGENT SYSTEMS.</span>
        </>
      }
      description="The production foundation is Java and distributed systems. The AI Lab is where that foundation is being extended — experiments and direction, honestly labeled."
    >
      {/* =====================================================
          DISCLAIMER
          ===================================================== */}

      <Reveal>
        <p className="mb-8 flex flex-wrap items-center gap-2 border border-warn/25 bg-warn/[0.05] px-4 py-3 font-mono text-[10px] leading-relaxed tracking-[0.18em] text-warn/90">
          <FlaskConical
            className="size-3.5 shrink-0"
            aria-hidden
          />

          {aiDisclaimer.toUpperCase()}
        </p>
      </Reveal>

      {/* =====================================================
          RAG PIPELINE
          ===================================================== */}

      <Reveal delay={0.04}>
        <div className="panel mb-10 overflow-hidden p-6 sm:p-7">
          {/* Header */}

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">
                EXPLORING RETRIEVAL-AUGMENTED GENERATION
              </p>

              <h3 className="mt-2 font-display text-sm font-bold tracking-[0.16em] text-ink">
                CONCEPTUAL RAG PIPELINE
              </h3>
            </div>

            <span className="border border-violet/30 bg-violet/[0.04] px-2.5 py-1 font-mono text-[8px] tracking-[0.2em] text-violet/80">
              EXPERIMENTAL
            </span>
          </div>

          {/* Pipeline */}

          <div className="mt-8 overflow-x-auto pb-3">
            <ol
              className="flex min-w-[760px] items-start"
              aria-label="Conceptual Retrieval-Augmented Generation pipeline"
            >
              {aiEvolutionPath.map((step, i) => {
                const style =
                  PIPELINE_STYLES[i] ?? PIPELINE_STYLES[5];

                return (
                  <li
                    key={step.label}
                    className="flex min-w-0 flex-1 items-start"
                  >
                    {/* Node */}

                    <div className="flex min-w-[105px] flex-1 flex-col items-center text-center">
                      <span
                        className={cn(
                          "flex size-13 shrink-0 items-center justify-center rounded-full border font-mono text-sm font-bold transition-all duration-300",
                          style.circle
                        )}
                        aria-hidden
                      >
                        {i + 1}
                      </span>

                      {/* Label */}

                      <p className="mt-3 font-mono text-[10px] font-bold tracking-[0.16em] text-ink">
                        {step.label.toUpperCase()}
                      </p>

                      {/* Description */}

                      <p className="mt-1 max-w-[120px] text-[10px] leading-relaxed text-ink-faint">
                        {PIPELINE_DESCRIPTIONS[i]}
                      </p>
                    </div>

                    {/* Connector */}

                    {i < aiEvolutionPath.length - 1 && (
                      <div className="mt-6 flex w-8 shrink-0 items-center">
                        <span
                          className={cn(
                            "h-px w-full",
                            style.line
                          )}
                          aria-hidden
                        />

                        <ArrowRight
                          className={cn(
                            "size-3 shrink-0",
                            style.arrow
                          )}
                          aria-hidden
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Footer */}

          <div className="mt-3 border-t border-line pt-4">
            <p className="font-mono text-[9px] tracking-[0.25em] text-ink-faint">
              CONCEPTUAL ARCHITECTURE — NOT IMPLEMENTED
            </p>
          </div>
        </div>
      </Reveal>

      {/* =====================================================
          EXPERIMENT CARDS
          ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {aiExperiments.map((experiment, i) => (
          <Reveal
            key={experiment.key}
            delay={(i % 3) * 0.05}
            className="h-full"
          >
            <article className="group relative h-full border border-line bg-gradient-to-b from-surface-2/80 to-surface/60 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-warn/45 hover:shadow-[0_12px_40px_rgba(251,191,36,0.07)]">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-9 items-center justify-center rounded-sm border border-warn/35 bg-warn/[0.07] text-warn transition-colors group-hover:border-warn/55 group-hover:bg-warn/[0.1]">
                  <Sparkles
                    className="size-4"
                    aria-hidden
                  />
                </span>

                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 border px-2 py-1 font-mono text-[8.5px] tracking-[0.22em]",
                    STATUS_STYLE[experiment.status]
                  )}
                >
                  <span
                    className="animate-pulse-dot inline-block size-1 rounded-full bg-current"
                    aria-hidden
                  />

                  {experiment.status}
                </span>
              </div>

              <h3 className="mt-4 font-mono text-sm font-bold tracking-[0.16em] text-ink transition-colors group-hover:text-warn">
                {experiment.title}
              </h3>

              <p className="mt-2.5 text-[13px] leading-relaxed text-ink-dim">
                {experiment.description}
              </p>

              <ul
                className="mt-4 flex flex-wrap gap-1.5"
                aria-label={`Tags: ${experiment.tags.join(", ")}`}
              >
                {experiment.tags.map((tag) => (
                  <li key={tag}>
                    <span className="chip chip--ai !py-0.5 !text-[9px]">
                      {tag}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>

      {/* =====================================================
          PHASE 2 CALL PATH
          ===================================================== */}

      <Reveal delay={0.06}>
        <aside className="mt-10 border border-line bg-surface-2/50 p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">
              PLANNED CALL PATH — ARCHITECTED, NOT YET WIRED
            </p>

            <span className="border border-dashed border-warn/35 px-2 py-1 font-mono text-[8px] tracking-[0.2em] text-warn/80">
              PHASE 02
            </span>
          </div>

          <ol
            className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2"
            aria-label="Planned Phase 2 architecture call path"
          >
            {PHASE2_PATH.map((node, i) => (
              <li
                key={node}
                className="flex items-center gap-2"
              >
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
                  <span
                    aria-hidden
                    className="font-mono text-[10px] text-ink-faint"
                  >
                    →
                  </span>
                )}
              </li>
            ))}

            <li className="flex items-center gap-2">
              <span
                aria-hidden
                className="font-mono text-[10px] text-ink-faint"
              >
                →
              </span>

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