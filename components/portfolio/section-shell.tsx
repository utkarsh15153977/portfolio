import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionShellProps {
  id: string;
  index: string;
  kicker: string;
  title: ReactNode;
  description?: string;
  className?: string;
  children: ReactNode;
}

export function SectionShell({
  id,
  index,
  kicker,
  title,
  description,
  className,
  children,
}: SectionShellProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn(
        "relative mx-auto w-full max-w-[1200px] scroll-mt-16 px-5 py-16 sm:px-8 sm:py-20 lg:scroll-mt-0 lg:py-20",
        className
      )}
    >
      <header className="mb-10 sm:mb-12">
        <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.35em] text-accent">
          <span className="text-ink-faint">{index}</span>

          <span
            aria-hidden
            className="h-px w-10 bg-accent/50"
          />

          {kicker}
        </p>

        <h2
          id={`${id}-heading`}
          className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl"
        >
          {title}
        </h2>

        {description && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-dim sm:text-base">
            {description}
          </p>
        )}
      </header>

      {children}
    </section>
  );
}