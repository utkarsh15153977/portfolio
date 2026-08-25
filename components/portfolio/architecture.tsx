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
        {/* blueprint selector */}
        <div
          role="tablist"
          aria-label="Architecture blueprints"
          aria-orientation="horizontal"
          onKeyDown={onBlueprintTablistKeyDown}
          className="flex flex-wrap gap-2"
        >
          {architectureDiagrams.map((diagram, i) => {
            const isActive = diagram.key === activeKey;
            const isAi = !!diagram.exploring;
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
                    ? isAi
                      ? "border-warn/60 bg-warn/10 text-warn"
                      : "border-accent/60 bg-accent-soft text-accent"
                    : "border-line text-ink-faint hover:border-line-strong hover:text-ink-dim"
                )}
              >
                {diagram.tab}
                {isAi && (
                  <span className="animate-pulse-dot inline-block size-1.5 rounded-full bg-warn" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      </Reveal>

      <div ref={contentRef} id="blueprint-panel" role="tabpanel" className="mt-6">
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-ink-dim">
          <span className="font-mono text-accent">&gt; </span>
          {active.blurb}
        </p>

        {active.exploring && (
          <p className="mb-5 inline-flex flex-wrap items-center gap-2 border border-warn/30 bg-warn/[0.06] px-4 py-2.5 font-mono text-[10px] tracking-[0.22em] text-warn">
            <span className="animate-pulse-dot inline-block size-1.5 rounded-full bg-warn" aria-hidden />
            EXPLORATION CONCEPT — NOT PRODUCTION EXPERIENCE
          </p>
        )}

        <ArchitectureGraph key={active.key} diagram={active} />
      </div>
    </SectionShell>
  );
}
