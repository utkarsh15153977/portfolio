import {
  BookOpen,
  Clapperboard,
  Cpu,
  GraduationCap,
  Plane,
  Sparkles,
} from "lucide-react";
import { SectionShell } from "@/components/portfolio/section-shell";
import { Reveal } from "@/components/ui/reveal";
import { interests, type InterestCard } from "@/lib/portfolio-data";

const ICONS: Record<InterestCard["icon"], typeof BookOpen> = {
  book: BookOpen,
  cpu: Cpu,
  film: Clapperboard,
  plane: Plane,
  sparkles: Sparkles,
  graduation: GraduationCap,
};

function InterestPanel({ card }: { card: InterestCard }) {
  const Icon = ICONS[card.icon];

  const isPlaceholder = card.placeholder;

  return (
    <article
      className={[
        "group relative flex h-full flex-col overflow-hidden p-5",
        "transition-all duration-300",
        isPlaceholder
          ? [
              "border border-dashed border-line-strong/70",
              "bg-surface/40",
              "hover:border-warn/40",
              "hover:bg-warn/[0.025]",
            ].join(" ")
          : [
              "panel",
              "hover:-translate-y-0.5",
              "hover:border-accent/40",
            ].join(" "),
      ].join(" ")}
    >
      {/* Top accent line */}
      <span
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-x-0 top-0 h-px",
          "origin-left scale-x-0 transition-transform duration-500",
          "group-hover:scale-x-100",
          isPlaceholder ? "bg-warn/50" : "bg-accent/60",
        ].join(" ")}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className={[
              "flex size-9 shrink-0 items-center justify-center rounded-sm",
              "transition-all duration-300",
              isPlaceholder
                ? [
                    "border border-line-strong",
                    "text-ink-faint",
                    "group-hover:border-warn/30",
                    "group-hover:text-warn/80",
                  ].join(" ")
                : [
                    "border border-accent/30",
                    "bg-accent-soft",
                    "text-accent",
                    "group-hover:border-accent",
                    "group-hover:bg-accent",
                    "group-hover:text-background",
                  ].join(" "),
            ].join(" ")}
          >
            <Icon className="size-4" />
          </span>

          <h3 className="truncate font-mono text-xs font-bold tracking-[0.22em] text-ink">
            {card.title}
          </h3>
        </div>

        {isPlaceholder && (
          <span className="shrink-0 border border-dashed border-line-strong px-1.5 py-0.5 font-mono text-[7.5px] tracking-[0.18em] text-ink-faint/85">
            PLACEHOLDER
          </span>
        )}
      </div>

      {/* Content */}
      <ul className="mt-4 space-y-2.5">
        {card.lines.map((line, index) => (
          <li
            key={`${card.key}-${index}`}
            className={[
              "relative pl-3 text-[13px] leading-relaxed",
              isPlaceholder ? "italic text-ink-faint" : "text-ink-dim",
            ].join(" ")}
          >
            <span
              aria-hidden="true"
              className={[
                "absolute left-0 top-[0.65em] size-1 rounded-full",
                isPlaceholder ? "bg-warn/50" : "bg-accent/50",
              ].join(" ")}
            />

            {line}
          </li>
        ))}
      </ul>

      {/* Bottom metadata */}
      <div className="mt-auto pt-5">
        <span
          aria-hidden="true"
          className={[
            "block h-px w-8 transition-all duration-300",
            "group-hover:w-14",
            isPlaceholder ? "bg-warn/30" : "bg-accent/30",
          ].join(" ")}
        />
      </div>
    </article>
  );
}

export function BeyondCode() {
  return (
    <SectionShell
      id="beyond-code"
      index="09"
      kicker="BEYOND CODE"
      title={
        <>
          OFF THE <span className="text-accent">MAIN THREAD.</span>
        </>
      }
      description="A few signals beyond the engineering stack — interests, influences, and things worth exploring outside the main execution path."
    >
      <Reveal>
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-ink-dim">
          Systems engineers are more than their stack. This section is
          intentionally lightweight — a few honest signals, with room for
          additional interests as the system evolves.
        </p>
      </Reveal>

      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Interests beyond software development"
      >
        {interests.map((card, index) => (
          <Reveal
            key={card.key}
            delay={(index % 3) * 0.05}
            className="h-full"
          >
            <InterestPanel card={card} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.08}>
        <div className="mt-6 flex items-start gap-2 font-mono text-[9px] leading-relaxed tracking-[0.2em] text-ink-faint/85 sm:text-[10px]">
          <span className="shrink-0 text-warn/70">{"//"}</span>

          <p>
            DASHED CARDS ARE EDITABLE PLACEHOLDERS — UPDATE{" "}
            <span className="text-ink-dim">lib/portfolio-data.ts</span>
          </p>
        </div>
      </Reveal>
    </SectionShell>
  );
}