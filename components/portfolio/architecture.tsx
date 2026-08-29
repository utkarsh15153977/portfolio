"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { SectionShell } from "@/components/portfolio/section-shell";
import { Reveal } from "@/components/ui/reveal";
import { ArchitectureGraph } from "@/components/portfolio/architecture-graph";
import { initGsap } from "@/lib/gsap";
import { architectureDiagrams } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

export function Architecture() {
  const [activeKey, setActiveKey] = useState(architectureDiagrams[0].key);
  const active = architectureDiagrams.find((d) => d.key === activeKey)!;
  const contentRef = useRef<HTMLDivElement>(null);
  const blueprintTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Roving-tabindex keyboard support: ← → Home End, wrapping.
  const onBlueprintTablistKeyDown = (e: ReactKeyboardEvent) => {
    const count = architectureDiagrams.length;
    const current = architectureDiagrams.findIndex((d) => d.key === activeKey);
    let next = -1;
    switch (e.key) {
      case "ArrowRight":
        next = (current + 1) % count;
        break;
      case "ArrowLeft":
        next = (current - 1 + count) % count;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    setActiveKey(architectureDiagrams[next].key);
    blueprintTabRefs.current[next]?.focus();
  };

  // Swap animation between system blueprints.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const { gsap } = initGsap();
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out" }
    );
  }, [activeKey]);

  // Split diagrams into production and exploration
  const productionDiagrams = architectureDiagrams.filter(d => !d.exploring);
  const explorationDiagrams = architectureDiagrams.filter(d => d.exploring);

  return (
    <SectionShell
      id="architecture"
      index="06"
      kicker="SYSTEM DESIGN"
      title={
        <>
          HOW I <span className="text-accent">BUILD SYSTEMS.</span>
        </>
      }
      description="Five blueprints, one philosophy — decouple with events, guard with resilience patterns, persist deliberately, observe everything. Select a blueprint, then click any node."
    >
      <Reveal>
        {/* Production Foundation Section */}
        <div className="mb-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px flex-1 bg-accent/30" aria-hidden />
            <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-accent">
              <span className="inline-block size-2 rounded-full bg-accent" aria-hidden />
              PRODUCTION FOUNDATION
            </span>
            <span className="h-px flex-1 bg-accent/30" aria-hidden />
          </div>
          <div
            role="tablist"
            aria-label="Production architecture blueprints"
            aria-orientation="horizontal"
            className="flex flex-wrap gap-2"
            onKeyDown={onBlueprintTablistKeyDown} 
          >
            {productionDiagrams.map((diagram, i) => {
              const isActive = diagram.key === activeKey;
              return (
                <button
                  key={diagram.key}
                  role="tab"
                  ref={(el) => {
                    blueprintTabRefs.current[i] = el;
                  }}
                  tabIndex={isActive ? 0 : -1}
                  aria-selected={isActive}
                  aria-controls="blueprint-panel"
                  onClick={() => setActiveKey(diagram.key)}
                  className={cn(
                    "inline-flex items-center gap-2 border px-4 py-2.5 font-mono text-[10.5px] tracking-[0.2em] transition-all sm:text-[11px]",
                    isActive
                      ? "border-accent/60 bg-accent-soft text-accent"
                      : "border-line text-ink-faint hover:border-line-strong hover:text-ink-dim"
                  )}
                >
                  {diagram.tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Exploration Architecture Section */}
        <div className="mb-4">
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px flex-1 bg-warn/30" aria-hidden />
            <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-warn">
              <span className="inline-block size-2 animate-pulse rounded-full bg-warn" aria-hidden />
              EXPLORATION ARCHITECTURE
            </span>
            <span className="h-px flex-1 bg-warn/30" aria-hidden />
          </div>
          <div
            role="tablist"
            aria-label="Exploration architecture blueprints"
            aria-orientation="horizontal"
            className="flex flex-wrap gap-2"
            onKeyDown={onBlueprintTablistKeyDown} 
          >
            {explorationDiagrams.map((diagram, i) => {
              const isActive = diagram.key === activeKey;
              const idx = productionDiagrams.length + i;
              return (
                <button
                  key={diagram.key}
                  role="tab"
                  ref={(el) => {
                    blueprintTabRefs.current[idx] = el;
                  }}
                  tabIndex={isActive ? 0 : -1}
                  aria-selected={isActive}
                  aria-controls="blueprint-panel"
                  onClick={() => setActiveKey(diagram.key)}
                  className={cn(
                    "inline-flex items-center gap-2 border px-4 py-2.5 font-mono text-[10.5px] tracking-[0.2em] transition-all sm:text-[11px]",
                    isActive
                      ? "border-warn/60 bg-warn/10 text-warn"
                      : "border-line text-ink-faint hover:border-line-strong hover:text-ink-dim"
                  )}
                >
                  {diagram.tab}
                  <span className="inline-block size-1.5 animate-pulse rounded-full bg-warn" aria-hidden />
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>

      <div ref={contentRef} id="blueprint-panel" role="tabpanel" className="mt-6">
        <div className="mb-5 flex flex-wrap items-start gap-3">
          <p className="max-w-3xl text-sm leading-relaxed text-ink-dim">
            <span className="font-mono text-accent">&gt; </span>
            {active.blurb}
          </p>
          {active.exploring ? (
            <span className="inline-flex shrink-0 items-center gap-2 border border-warn/40 bg-warn/[0.08] px-3 py-1.5 font-mono text-[9px] font-bold tracking-[0.2em] text-warn">
              <span className="inline-block size-1.5 animate-pulse rounded-full bg-warn" aria-hidden />
              EXPLORATION — NOT PRODUCTION
            </span>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-2 border border-accent/40 bg-accent/[0.08] px-3 py-1.5 font-mono text-[9px] font-bold tracking-[0.2em] text-accent">
              <span className="inline-block size-1.5 rounded-full bg-accent" aria-hidden />
              PRODUCTION EXPERIENCE
            </span>
          )}
        </div>

        {active.exploring && (
          <p className="mb-5 inline-flex flex-wrap items-center gap-2 border border-warn/30 bg-warn/[0.06] px-4 py-2.5 font-mono text-[10px] tracking-[0.22em] text-warn">
            {/* Fixed: Changed animate-pulse-dot to animate-pulse */}
            <span className="animate-pulse inline-block size-1.5 rounded-full bg-warn" aria-hidden />
            EXPLORATION CONCEPT — NOT PRODUCTION EXPERIENCE
          </p>
        )}

        <ArchitectureGraph key={active.key} diagram={active} />
      </div>
    </SectionShell>
  );
}