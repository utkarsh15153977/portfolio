"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useSystem } from "@/components/providers/system-provider";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import { usePrefersReducedMotion } from "@/hooks/use-preferences";
import { bootSequence, profile } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const STORAGE_KEY = "utkarsh-system-booted-v1";

type Phase = "intro" | "core" | "ai" | "progress" | "ready";

export function BootSequence() {
  const { finishBoot, setScrollLocked } = useSystem();
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(true);
  const [phase, setPhase] = useState<Phase>("intro");
  const [coreCount, setCoreCount] = useState(0);
  const [aiCount, setAiCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const exiting = useRef(false);

  const complete = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode */
    }
    finishBoot();
  }, [finishBoot]);

  // Reduced motion OR already booted this session -> skip entirely.
  // Runs pre-paint on the client to avoid a boot-overlay flash.
  const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
  useIsoLayoutEffect(() => {
    let booted = false;
    try {
      booted = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* ignore */
    }
    if (booted || reduced) {
      setMounted(false);
      complete();
    }
  }, [reduced, complete]);

  // Lock page scroll while the overlay is up.
  useEffect(() => {
    if (!mounted) return;
    setScrollLocked(true);
    return () => setScrollLocked(false);
  }, [mounted, setScrollLocked]);

  // Dialog focus: focus enters the boot console, Tab cycles inside,
  // and focus returns to the previously focused element on exit.
  useDialogFocus(mounted, overlayRef);

  // Sequenced reveal.
  useEffect(() => {
    if (!mounted || reduced) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms));

    t(() => setPhase("core"), 500);
    bootSequence.coreSystems.forEach((_, i) => t(() => setCoreCount(i + 1), 700 + i * 150));
    const aiStart = 700 + bootSequence.coreSystems.length * 150 + 250;
    t(() => setPhase("ai"), aiStart);
    bootSequence.intelligenceLayer.forEach((_, i) =>
      t(() => setAiCount(i + 1), aiStart + 350 + i * 220)
    );
    const progStart = aiStart + 350 + bootSequence.intelligenceLayer.length * 220;
    t(() => setPhase("progress"), progStart);
    for (let p = 1; p <= 10; p++) t(() => setProgress(p * 10), progStart + p * 55);
    t(() => setPhase("ready"), progStart + 620);

    return () => timers.forEach(clearTimeout);
  }, [mounted, reduced]);

  const exit = useCallback(() => {
    if (exiting.current) return;
    exiting.current = true;
    const el = overlayRef.current;
    if (el && !reduced) {
      gsap.to(el, {
        yPercent: -100,
        duration: 0.7,
        ease: "power4.inOut",
        onComplete: () => {
          setMounted(false);
          complete();
        },
      });
    } else {
      setMounted(false);
      complete();
    }
  }, [complete, reduced]);

  // Keyboard: Enter or Escape proceeds once ready.
  useEffect(() => {
    if (phase !== "ready") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, exit]);

  if (!mounted) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="System initialization"
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background grid-bg noise outline-none"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(5,7,11,0.9)_100%)]" />

      <div className="relative w-[min(92vw,560px)] px-6 font-mono text-xs sm:text-sm">
        <p className="mb-2 text-accent/70 tracking-[0.3em]">INITIALIZING…</p>
        <h1 className="mb-1 text-lg sm:text-xl font-bold tracking-[0.18em] text-ink">
          {profile.systemName}
        </h1>
        <p className="mb-8 text-ink-faint text-[10px] sm:text-xs tracking-widest">
          {profile.role.toUpperCase()} {"//"} {profile.systemVersion}
        </p>

        <p className="mb-3 text-[10px] tracking-[0.35em] text-ink-dim">CORE SYSTEMS</p>
        <ul aria-label="Core systems status">
          {bootSequence.coreSystems.map((row, i) => (
            <li
              key={row.name}
              className={cn(
                "flex items-baseline gap-2 py-1 transition-opacity duration-300",
                i < coreCount ? "opacity-100" : "opacity-0"
              )}
              aria-hidden={i >= coreCount}
            >
              <span className="text-ink-dim">{row.name}</span>
              <span className="flex-1 translate-y-[-3px] border-b border-dotted border-line-strong" />
              <BootStatus value={row.status} tone="ok" />
            </li>
          ))}
        </ul>

        <p
          className={cn(
            "mt-6 mb-3 text-[10px] tracking-[0.35em] transition-opacity duration-500",
            phase === "intro" ? "text-ink-faint" : "text-warn/80"
          )}
        >
          INTELLIGENCE LAYER
        </p>
        <ul aria-label="Intelligence layer status">
          {bootSequence.intelligenceLayer.map((row, i) => (
            <li
              key={row.name}
              className={cn(
                "flex items-baseline gap-2 py-1 transition-opacity duration-300",
                i < aiCount ? "opacity-100" : "opacity-0"
              )}
              aria-hidden={i >= aiCount}
            >
              <span className="text-ink-dim">{row.name}</span>
              <span className="flex-1 translate-y-[-3px] border-b border-dotted border-line-strong" />
              <BootStatus value={row.status} tone="warn" />
            </li>
          ))}
        </ul>

        {/* progress */}
        <div
          className={cn(
            "mt-8 transition-opacity duration-300",
            phase === "progress" || phase === "ready" ? "opacity-100" : "opacity-0"
          )}
          aria-hidden
        >
          <div className="flex justify-between text-[10px] text-ink-faint mb-1">
            <span>LOADING MODULES</span>
            <span>{progress}%</span>
          </div>
          <div className="h-[2px] w-full bg-surface-2 overflow-hidden rounded-full">
            <div
              className="h-full bg-accent transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-8 min-h-[72px]">
          {phase === "ready" ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <button
                ref={(btn) => btn?.focus()}
                onClick={exit}
                className="corner-brackets group inline-flex items-center gap-2 border border-accent/50 bg-accent-soft px-6 py-3 font-mono text-sm font-semibold tracking-[0.25em] text-accent transition-colors hover:bg-accent hover:text-background"
              >
                [ ENTER SYSTEM ]
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
              <span className="animate-pulse-dot inline-flex size-2 rounded-full bg-ok" aria-hidden />
              <span className="text-[10px] tracking-[0.3em] text-ok">SYSTEM READY</span>
            </div>
          ) : (
            <button
              onClick={exit}
              tabIndex={0}
              className="font-mono text-[10px] tracking-[0.3em] text-ink-faint underline-offset-4 transition-colors hover:text-ink-dim hover:underline"
            >
              SKIP →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function BootStatus({ value, tone }: { value: string; tone: "ok" | "warn" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] tracking-[0.15em]",
        tone === "ok" ? "text-ok" : "text-warn"
      )}
    >
      <span
        className={cn(
          "inline-block size-1.5 rounded-full",
          tone === "ok" ? "bg-ok" : "bg-warn animate-pulse-dot"
        )}
        aria-hidden
      />
      {value}
    </span>
  );
}
