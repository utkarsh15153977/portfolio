import { BookOpen, Clapperboard, Cpu, Plane, Sparkles, GraduationCap } from "lucide-react";
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
  return (
    <article
      className={
        card.placeholder
          ? "group h-full border border-dashed border-line-strong/70 bg-surface/40 p-5 transition-colors hover:border-warn/40"
          : "panel group h-full p-5 transition-colors hover:border-accent/40"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={
              card.placeholder
                ? "flex size-9 items-center justify-center rounded-sm border border-line-strong text-ink-faint"
                : "flex size-9 items-center justify-center rounded-sm border border-accent/30 bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-background"
            }
          >
            <Icon className="size-4" aria-hidden />
          </span>
          <h3 className="font-mono text-xs font-bold tracking-[0.24em] text-ink">
            {card.title}
          </h3>
        </div>
        {card.placeholder && (
          <span
            className="border border-dashed border-line-strong px-1.5 py-0.5 font-mono text-[7.5px] tracking-[0.2em] text-ink-faint/85"
            title="Editable placeholder — update lib/portfolio-data.ts"
          >
            PLACEHOLDER
          </span>
        )}
      </div>
      <ul className="mt-3 space-y-1.5">
        {card.lines.map((line, i) => (
          <li
            key={i}
            className={card.placeholder ? "text-[13px] italic leading-relaxed text-ink-faint" : "text-[13px] leading-relaxed text-ink-dim"}
          >
            {line}
          </li>
        ))}
      </ul>
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
    >
      <Reveal>
        <p className="mb-8 max-w-2xl text-sm leading-relaxed text-ink-dim">
          Systems engineers are more than their stack. This section is intentionally
          lightweight — a few honest signals, and space reserved for what gets added next.
        </p>
      </Reveal>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {interests.map((card, i) => (
          <Reveal key={card.key} delay={(i % 3) * 0.05} className="h-full">
            <InterestPanel card={card} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.08}>
        <p className="mt-6 font-mono text-[10px] tracking-[0.22em] text-ink-faint/85">
          {"// DASHED CARDS ARE EDITABLE PLACEHOLDERS — UPDATE lib/portfolio-data.ts"}
        </p>
      </Reveal>
    </SectionShell>
  );
}
