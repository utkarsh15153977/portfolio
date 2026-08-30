"use client";

import {
  Activity,
  CheckCircle2,
  Cloud,
  Code2,
  Layers3,
  Radio,
} from "lucide-react";
import { systemStatus } from "@/lib/portfolio-data";

const SYSTEM_SIGNALS = [
  {
    label: "BACKEND",
    value: "JAVA · SPRING BOOT",
    icon: Code2,
  },
  {
    label: "ARCHITECTURE",
    value: "MICROSERVICES · KAFKA",
    icon: Layers3,
  },
  {
    label: "CLOUD",
    value: "AWS",
    icon: Cloud,
  },
] as const;

const STATUS_ROWS = [
  ["BUILD STATUS", systemStatus.buildStatus],
  ["CURRENT FOCUS", systemStatus.currentFocus],
  ["EXPLORING", systemStatus.exploring],
  ["AVAILABILITY", systemStatus.availability],
] as const;

export function SystemStatus() {
  return (
    <aside
      aria-label="System status"
      className="panel corner-brackets relative overflow-hidden p-4 sm:p-5"
    >
      {/* Background atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(34,211,238,0.07),transparent_55%)]"
      />

      {/* Subtle top signal */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent"
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="flex size-7 shrink-0 items-center justify-center border border-accent/30 bg-accent-soft"
            >
              <Activity
                className="size-3.5 text-accent"
                aria-hidden
              />
            </span>

            <div className="min-w-0">
              <p className="font-mono text-[8px] font-semibold tracking-[0.3em] text-ink-faint sm:text-[9px]">
                SYSTEM STATUS
              </p>

              <p className="mt-0.5 hidden font-mono text-[7px] tracking-[0.2em] text-ink-faint/60 sm:block">
                ENGINEERING SIGNAL
              </p>
            </div>
          </div>

          {/* Online indicator */}
          <div className="flex shrink-0 items-center gap-2 font-mono text-[8px] font-semibold tracking-[0.2em] text-ok sm:text-[9px]">
            <span
              aria-hidden
              className="relative flex size-1.5"
            >
              <span className="absolute inset-0 animate-ping rounded-full bg-ok/50" />
              <span className="relative size-1.5 rounded-full bg-ok" />
            </span>

            ONLINE
          </div>
        </div>

        {/* Main status */}
        <div className="my-4 h-px bg-line" />

        <dl className="space-y-2.5 font-mono text-[8px] tracking-[0.12em] sm:text-[9px]">
          {STATUS_ROWS.map(([label, value]) => {
            const isPositive =
              label === "BUILD STATUS" ||
              label === "AVAILABILITY";

            return (
              <div
                key={label}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"
              >
                <dt className="min-w-0 text-ink-faint">
                  {label}
                </dt>

                <dd
                  className={
                    isPositive
                      ? "max-w-[65%] truncate text-right text-ok"
                      : "max-w-[65%] truncate text-right text-ink-dim"
                  }
                >
                  {value}
                </dd>
              </div>
            );
          })}
        </dl>

        {/* Engineering signals */}
        <div className="my-4 h-px bg-line" />

        <div className="grid gap-2 sm:grid-cols-3">
          {SYSTEM_SIGNALS.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="group border border-line bg-background/30 p-2.5 transition-colors duration-300 hover:border-accent/30"
            >
              <div className="flex items-center gap-1.5">
                <Icon
                  className="size-3 text-accent/70 transition-colors group-hover:text-accent"
                  aria-hidden
                />

                <span className="font-mono text-[7px] tracking-[0.18em] text-ink-faint">
                  {label}
                </span>
              </div>

              <p className="mt-1.5 truncate font-mono text-[8px] tracking-[0.08em] text-ink-dim">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="size-3 text-accent"
              aria-hidden
            />

            <span className="font-mono text-[7px] tracking-[0.22em] text-ink-faint sm:text-[8px]">
              BUILD → MEASURE → IMPROVE
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[7px] tracking-[0.18em] text-ink-faint">
            <Radio
              className="size-2.5 text-accent/60"
              aria-hidden
            />

            {systemStatus.mode}
          </div>
        </div>
      </div>
    </aside>
  );
}