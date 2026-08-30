"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";

import { ArchitectureGraph } from "@/components/portfolio/architecture-graph";
import { SectionShell } from "@/components/portfolio/section-shell";
import { Reveal } from "@/components/ui/reveal";
import { architectureDiagrams } from "@/lib/portfolio-data";
import { initGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const TAB_ID_PREFIX = "architecture-tab";
const PANEL_ID = "blueprint-panel";

export function Architecture() {
  const firstDiagram = architectureDiagrams[0];

  const [activeKey, setActiveKey] = useState<string | undefined>(
    firstDiagram?.key
  );

  const contentRef = useRef<HTMLDivElement>(null);
  const blueprintTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const active =
    architectureDiagrams.find((diagram) => diagram.key === activeKey) ??
    firstDiagram;

  /* ---------------------------------------------------------------------- */
  /* Keyboard navigation                                                    */
  /* ---------------------------------------------------------------------- */

  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!architectureDiagrams.length) return;

    const currentIndex = Math.max(
      0,
      architectureDiagrams.findIndex(
        (diagram) => diagram.key === activeKey
      )
    );

    let nextIndex: number;

    switch (event.key) {
      case "ArrowRight":
        nextIndex = (currentIndex + 1) % architectureDiagrams.length;
        break;

      case "ArrowLeft":
        nextIndex =
          (currentIndex - 1 + architectureDiagrams.length) %
          architectureDiagrams.length;
        break;

      case "Home":
        nextIndex = 0;
        break;

      case "End":
        nextIndex = architectureDiagrams.length - 1;
        break;

      default:
        return;
    }

    event.preventDefault();

    const nextDiagram = architectureDiagrams[nextIndex];

    if (!nextDiagram) return;

    setActiveKey(nextDiagram.key);

    requestAnimationFrame(() => {
      blueprintTabRefs.current[nextIndex]?.focus();
    });
  };

  /* ---------------------------------------------------------------------- */
  /* Blueprint transition                                                   */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const element = contentRef.current;

    if (!element || !active) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      element.style.opacity = "1";
      element.style.transform = "none";
      return;
    }

    const { gsap } = initGsap();

    const animation = gsap.fromTo(
      element,
      {
        autoAlpha: 0,
        y: 14,
      },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
        overwrite: true,
      }
    );

    return () => {
      animation.kill();
    };
  }, [activeKey, active]);

  /* ---------------------------------------------------------------------- */
  /* Empty state                                                            */
  /* ---------------------------------------------------------------------- */

  if (!active) {
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
        description="Architecture blueprints are currently unavailable."
      >
        <Reveal>
          <div className="panel corner-brackets p-6">
            <p className="font-mono text-xs tracking-[0.2em] text-ink-faint">
              &gt; NO ARCHITECTURE BLUEPRINTS AVAILABLE
            </p>
          </div>
        </Reveal>
      </SectionShell>
    );
  }

  const activeTabId = `${TAB_ID_PREFIX}-${active.key}`;

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
      {/* Blueprint selector */}
      <Reveal>
        <div
          role="tablist"
          aria-label="Architecture blueprints"
          aria-orientation="horizontal"
          onKeyDown={handleTabKeyDown}
          className="flex flex-wrap gap-2"
        >
          {architectureDiagrams.map((diagram, index) => {
            const isActive = diagram.key === active.key;
            const isAi = Boolean(diagram.exploring);
            const tabId = `${TAB_ID_PREFIX}-${diagram.key}`;

            return (
              <button
                key={diagram.key}
                id={tabId}
                ref={(element) => {
                  blueprintTabRefs.current[index] = element;
                }}
                type="button"
                role="tab"
                tabIndex={isActive ? 0 : -1}
                aria-selected={isActive}
                aria-controls={PANEL_ID}
                onClick={() => setActiveKey(diagram.key)}
                className={cn(
                  "inline-flex items-center gap-2 border px-4 py-2.5",
                  "font-mono text-[10.5px] tracking-[0.2em]",
                  "transition-all sm:text-[11px]",
                  isActive
                    ? isAi
                      ? "border-warn/60 bg-warn/10 text-warn"
                      : "border-accent/60 bg-accent-soft text-accent"
                    : "border-line text-ink-faint hover:border-line-strong hover:text-ink-dim"
                )}
              >
                <span>{diagram.tab}</span>

                {isAi ? (
                  <span
                    aria-hidden="true"
                    className="animate-pulse-dot inline-block size-1.5 rounded-full bg-warn"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Active blueprint */}
      <div
        ref={contentRef}
        id={PANEL_ID}
        role="tabpanel"
        aria-labelledby={activeTabId}
        tabIndex={0}
        className="mt-6 outline-none"
      >
        <p className="mb-5 max-w-3xl text-sm leading-relaxed text-ink-dim">
          <span className="font-mono text-accent">&gt; </span>
          {active.blurb}
        </p>

        {active.exploring ? (
          <p className="mb-5 inline-flex flex-wrap items-center gap-2 border border-warn/30 bg-warn/[0.06] px-4 py-2.5 font-mono text-[10px] tracking-[0.22em] text-warn">
            <span
              aria-hidden="true"
              className="animate-pulse-dot inline-block size-1.5 rounded-full bg-warn"
            />

            <span>EXPLORATION CONCEPT — NOT PRODUCTION EXPERIENCE</span>
          </p>
        ) : null}

        <ArchitectureGraph
          key={active.key}
          diagram={active}
        />
      </div>
    </SectionShell>
  );
}