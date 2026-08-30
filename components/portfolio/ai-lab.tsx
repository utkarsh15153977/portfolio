import { FlaskConical, Sparkles } from "lucide-react";
import { SectionShell } from "@/components/portfolio/section-shell";
import { AiAgentChat } from "@/components/portfolio/ai-agent-chat";
import { Reveal } from "@/components/ui/reveal";
import {
  aiExperiments,
  type AiStatus,
  ragFlowSteps,
  aiEvolutionPath,
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

/*
 * Each RAG stage gets its own semantic color.
 *
 * SOURCE        → cyan       : incoming data / documents
 * CHUNKING      → blue       : data processing
 * EMBEDDINGS    → violet     : vector representation
 * VECTOR SEARCH → indigo     : retrieval infrastructure
 * RETRIEVAL     → green      : relevant context
 * GENERATION    → amber      : LLM response generation
 *
 * The fallback keeps the component safe if another step
 * is added to portfolio-data.ts later.
 */
const RAG_STEP_STYLES = [
  "border-accent bg-accent-soft text-accent",
  "border-sky-400/70 bg-sky-400/[0.07] text-sky-300",
  "border-violet-400/70 bg-violet-400/[0.07] text-violet-300",
  "border-indigo-400/70 bg-indigo-400/[0.07] text-indigo-300",
  "border-emerald-400/70 bg-emerald-400/[0.07] text-emerald-300",
  "border-warn bg-warn/[0.07] text-warn",
];

const RAG_STEP_DOT_STYLES = [
  "bg-accent",
  "bg-sky-400",
  "bg-violet-400",
  "bg-indigo-400",
  "bg-emerald-400",
  "bg-warn",
];

export function AiLab() {
  return (
    <SectionShell
      id="ai-lab"
      index="08"
      kicker="AI LAB — FUTURE DIRECTION"
      title={
        <>
          EXTENDING BACKENDS WITH <span className="text-warn">AI</span>
        </>
      }
      description="My production foundation is Java, Spring Boot and distributed systems. The AI Lab explores how LLMs, RAG and agentic workflows can extend that foundation."
    >
      {/* Disclaimer */}
      <Reveal>
        <div className="mb-8 flex flex-wrap items-start gap-3 border border-warn/30 bg-warn/[0.06] px-5 py-4">
          <FlaskConical
            className="size-5 shrink-0 text-warn/70"
            aria-hidden
          />

          <div>
            <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-warn/90">
              EXPLORATION LAB — NOT PRODUCTION EXPERIENCE
            </p>

            <p className="mt-1 font-mono text-[10px] leading-relaxed tracking-[0.18em] text-warn/80">
              This section shows what I&apos;m exploring, not what&apos;s in
              production. My production experience is Java, Spring Boot, and
              distributed systems — AI is a future direction I&apos;m actively
              learning.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Live agent console */}
      <Reveal delay={0.02} className="mb-10">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="inline-block size-1.5 animate-pulse rounded-full bg-warn"
            aria-hidden
          />

          <span className="font-mono text-[9px] tracking-[0.2em] text-warn/80">
            EXPERIMENTAL DEMO
          </span>
        </div>

        <AiAgentChat />
      </Reveal>

      {/* Interactive evolution path */}
      <Reveal delay={0.04}>
        <div
          className="panel mb-10 p-6 sm:p-7"
          aria-label="Evolution path from backend to intelligent systems"
        >
          <p className="mb-5 font-mono text-[9px] tracking-[0.3em] text-ink-faint">
            ENGINEERING EVOLUTION PATH
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="border-b border-line pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
              <h3 className="mb-2 font-mono text-[10px] tracking-[0.2em] text-accent">
                PRODUCTION FOUNDATION
              </h3>

              <ul className="space-y-2">
                {aiEvolutionPath
                  .filter((step) => step.active)
                  .map((step) => (
                    <li
                      key={step.label}
                      className="flex items-start gap-2"
                    >
                      <span
                        className="inline-flex size-2 translate-y-1 rounded-full bg-accent"
                        aria-hidden
                      />

                      <span className="font-mono text-[11px] leading-relaxed tracking-[0.16em] text-ink">
                        {step.label}
                      </span>
                    </li>
                  ))}
              </ul>

              <p className="mt-3 text-[10px] leading-relaxed text-ink-dim/70">
                My core engineering foundation — built and shipped in
                production environments.
              </p>
            </div>

            <div className="border-b border-line pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
              <h3 className="mb-2 font-mono text-[10px] tracking-[0.2em] text-warn">
                CURRENT EXPLORATION
              </h3>

              <ul className="space-y-2">
                {aiExperiments
                  .filter((exp) => exp.status === "EXPLORING")
                  .map((exp) => (
                    <li
                      key={exp.key}
                      className="flex items-start gap-2"
                    >
                      <span
                        className="inline-flex size-2 translate-y-1 animate-pulse rounded-full bg-warn"
                        aria-hidden
                      />

                      <span className="font-mono text-[11px] leading-relaxed tracking-[0.16em] text-ink">
                        {exp.title}
                      </span>
                    </li>
                  ))}
              </ul>

              <p className="mt-3 text-[10px] leading-relaxed text-ink-dim/70">
                Actively learning and experimenting with AI integration.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-mono text-[10px] tracking-[0.2em] text-violet">
                FUTURE DIRECTION
              </h3>

              <ul className="space-y-2">
                {aiEvolutionPath
                  .filter((step) => !step.active)
                  .map((step) => (
                    <li
                      key={step.label}
                      className="flex items-start gap-2"
                    >
                      <span
                        className="inline-flex size-2 translate-y-1 rounded-full bg-violet"
                        aria-hidden
                      />

                      <span className="font-mono text-[11px] leading-relaxed tracking-[0.16em] text-ink-dim">
                        {step.label}
                      </span>
                    </li>
                  ))}
              </ul>

              <p className="mt-3 text-[10px] leading-relaxed text-ink-dim/70">
                Where I want to take my backend expertise next.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* RAG flow visualization */}
      <Reveal delay={0.06}>
        <div className="panel mb-10 p-6 sm:p-7">
          <div className="mb-2 flex items-center gap-2">
            <span
              className="inline-block size-1.5 rounded-full bg-violet"
              aria-hidden
            />

            <span className="font-mono text-[9px] tracking-[0.2em] text-violet/80">
              CONCEPTUAL ARCHITECTURE
            </span>
          </div>

          <p className="mb-5 font-mono text-[9px] tracking-[0.3em] text-ink-faint">
            EXPLORING RETRIEVAL-AUGMENTED GENERATION
          </p>

          <div className="relative">
            <div
              className="absolute inset-0 grid-bg opacity-20"
              aria-hidden
            />

            <ol className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-6">
              {ragFlowSteps.map((step, i) => {
                const stepStyle =
                  RAG_STEP_STYLES[i] ??
                  "border-line-strong bg-surface-2 text-ink-dim";

                const dotStyle =
                  RAG_STEP_DOT_STYLES[i] ?? "bg-ink-faint";

                return (
                  <li
                    key={step.id}
                    className="group flex flex-col items-center gap-2"
                  >
                    {/* Architecture node */}
                    <div
                      className={cn(
                        "relative flex size-12 items-center justify-center rounded-full border-2 font-mono text-[10px] font-bold tracking-[0.18em] transition-all duration-300",
                        stepStyle,
                        "group-hover:scale-110"
                      )}
                    >
                      {i + 1}

                      {/* Small status indicator */}
                      <span
                        aria-hidden
                        className={cn(
                          "absolute -right-0.5 -top-0.5 size-2 rounded-full ring-2 ring-background",
                          dotStyle
                        )}
                      />
                    </div>

                    <div className="text-center">
                      <h3
                        className={cn(
                          "font-mono text-[10px] font-bold tracking-[0.16em]",
                          stepStyle.includes("text-")
                            ? stepStyle.split(" ").find((value) =>
                                value.startsWith("text-")
                              )
                            : "text-ink"
                        )}
                      >
                        {step.label}
                      </h3>

                      <p className="mt-1 text-[10px] leading-relaxed text-ink-dim">
                        {step.tech}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Architecture legend */}
            <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-line pt-4">
              {ragFlowSteps.map((step, i) => (
                <div
                  key={`legend-${step.id}`}
                  className="flex items-center gap-1.5"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-1.5 rounded-full",
                      RAG_STEP_DOT_STYLES[i] ?? "bg-ink-faint"
                    )}
                  />

                  <span className="font-mono text-[8px] tracking-[0.16em] text-ink-faint">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-line pt-4">
              <p className="font-mono text-[9px] tracking-[0.22em] text-ink-faint">
                CONCEPTUAL ARCHITECTURE — NOT IMPLEMENTED
              </p>

              <p className="mt-1 font-mono text-[8px] tracking-[0.2em] text-ink-faint/70">
                This is a learning exercise, not a production system.
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Experiment cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {aiExperiments.map((experiment, i) => (
          <Reveal
            key={experiment.key}
            delay={(i % 3) * 0.05}
            className="h-full"
          >
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
                  <span
                    className="animate-pulse inline-block size-1 rounded-full bg-current"
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

      {/* Experimental call path */}
      <Reveal delay={0.06}>
        <aside className="mt-10 border border-line bg-surface-2/50 p-6 sm:p-7">
          <div className="mb-2 flex items-center gap-2">
            <span
              className="inline-block size-1.5 animate-pulse rounded-full bg-warn"
              aria-hidden
            />

            <span className="font-mono text-[9px] tracking-[0.2em] text-warn/80">
              EXPERIMENTAL CALL PATH
            </span>
          </div>

          <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">
            LIVE DEMO ARCHITECTURE — EXPLORATION ONLY
          </p>

          <ol
            className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2"
            aria-label="Experimental architecture call path"
          >
            {PHASE2_PATH.map((node, i) => (
              <li key={node} className="flex items-center gap-2">
                <span
                  className={cn(
                    "border px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.16em]",
                    i === 0
                      ? "border-accent/40 bg-accent-soft text-accent"
                      : i === PHASE2_PATH.length - 1
                      ? "border-warn/40 bg-warn/[0.06] text-warn/90"
                      : "border-line-strong text-ink-dim"
                  )}
                >
                  {node}
                </span>

                {i < PHASE2_PATH.length - 1 && (
                  <span
                    aria-hidden
                    className="font-mono text-[10px] text-accent/60"
                  >
                    →
                  </span>
                )}
              </li>
            ))}

            <li className="flex items-center gap-2">
              <span
                aria-hidden
                className="font-mono text-[10px] text-accent/60"
              >
                →
              </span>

              <span className="border border-warn/40 bg-warn/[0.06] px-2.5 py-1.5 font-mono text-[9.5px] tracking-[0.16em] text-warn/90">
                TOOLS · searchProjects() getSkills() explainArchitecture()
              </span>
            </li>
          </ol>

          <p className="mt-3 text-[10px] leading-relaxed text-ink-dim/70">
            This shows the conceptual flow for a future AI-powered portfolio
            assistant. Currently experimental and not in production.
          </p>
        </aside>
      </Reveal>
    </SectionShell>
  );
}