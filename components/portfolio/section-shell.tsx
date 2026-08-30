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
  const headingId = `${id}-heading`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "relative mx-auto w-full max-w-[1240px]",
        "scroll-mt-20 px-4 py-14",
        "sm:scroll-mt-16 sm:px-6 sm:py-18",
        "md:px-8 md:py-20",
        "lg:scroll-mt-6 lg:px-10 lg:py-24",
        "xl:py-28",
        className
      )}
    >
      {/* ------------------------------------------------------------------ */}
      {/* SECTION HEADER                                                      */}
      {/* ------------------------------------------------------------------ */}

      <header className="mb-8 max-w-4xl sm:mb-10 md:mb-12">
        <div
          className="flex min-w-0 items-center gap-2.5 sm:gap-3"
          aria-label={`${index} ${kicker}`}
        >
          {/* Section index */}
          <span className="shrink-0 font-mono text-[9px] tracking-[0.24em] text-ink-faint sm:text-[10px]">
            {index}
          </span>

          {/* Accent connector */}
          <span
            aria-hidden="true"
            className="h-px w-6 shrink-0 bg-accent/50 sm:w-10"
          />

          {/* Kicker */}
          <p className="min-w-0 truncate font-mono text-[9px] tracking-[0.2em] text-accent sm:text-[10px] sm:tracking-[0.28em] md:text-[11px] md:tracking-[0.35em]">
            {kicker}
          </p>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* TITLE                                                             */}
        {/* ---------------------------------------------------------------- */}

        <h2
          id={headingId}
          className={cn(
            "mt-3 max-w-4xl",
            "font-display font-bold text-ink",
            "leading-[0.98] tracking-[-0.035em]",
            "text-[clamp(2rem,8vw,3.25rem)]",
            "sm:mt-4 sm:leading-[0.96]",
            "md:text-5xl",
            "lg:text-[3.5rem]",
            "xl:text-[4rem]"
          )}
        >
          {title}
        </h2>

        {/* ---------------------------------------------------------------- */}
        {/* DESCRIPTION                                                       */}
        {/* ---------------------------------------------------------------- */}

        {description ? (
          <p
            className={cn(
              "mt-4 max-w-2xl",
              "text-[13px] leading-[1.7] text-ink-dim",
              "sm:mt-5 sm:text-sm sm:leading-relaxed",
              "md:text-base"
            )}
          >
            {description}
          </p>
        ) : null}
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* CONTENT                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="min-w-0">{children}</div>
    </section>
  );
}