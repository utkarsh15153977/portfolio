import {
  Boxes,
  Cloud,
  Code2,
  Container,
  Database,
  FlaskConical,
  Layers,
  Sparkles,
  Workflow,
} from "lucide-react";
import { SectionShell } from "@/components/portfolio/section-shell";
import { Reveal } from "@/components/ui/reveal";
import { engineeringPractices, skillCategories } from "@/lib/portfolio-data";
import type { SkillCategory } from "@/lib/portfolio-data";

const CATEGORY_ICONS: Record<string, typeof Code2> = {
  core: Code2,
  backend: Layers,
  "architecture-skills": Boxes,
  database: Database,
  messaging: Workflow,
  aws: Cloud,
  devops: Container,
  testing: FlaskConical,
  exploring: Sparkles,
};

function SkillPanel({ category }: { category: SkillCategory }) {
  const Icon = CATEGORY_ICONS[category.key] ?? Code2;
  const isAi = category.tone === "exploring";
  return (
    <article
      className={
        isAi
          ? "group relative border border-warn/30 bg-gradient-to-b from-warn/[0.06] to-transparent p-5 transition-colors hover:border-warn/60"
          : "panel group h-full p-5 transition-colors hover:border-accent/40"
      }
      aria-label={`${category.title} skills`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={
              isAi
                ? "flex size-9 items-center justify-center rounded-sm border border-warn/40 bg-warn/10 text-warn"
                : "flex size-9 items-center justify-center rounded-sm border border-accent/30 bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-background"
            }
          >
            <Icon className="size-4" aria-hidden />
          </span>
          <h3 className="font-mono text-xs font-bold tracking-[0.24em] text-ink">
            {category.title}
          </h3>
        </div>
        {isAi && category.note && (
          <span className="chip chip--ai !py-0.5 !text-[8.5px]">{category.note}</span>
        )}
      </div>
      <ul className={isAi ? "mt-4 flex flex-wrap gap-1.5" : "mt-4 flex flex-wrap gap-1.5"}>
        {category.skills.map((skill) => (
          <li key={skill}>
            <span className={isAi ? "chip chip--ai" : "chip"}>{skill}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function Skills() {
  return (
    <SectionShell
      id="skills"
      index="05"
      kicker="TECHNICAL ARSENAL"
      title={
        <>
          TOOLS OF THE <span className="text-accent">TRADE.</span>
        </>
      }
      description="Production depth in the Java ecosystem — plus an honest exploration track toward AI. No percentage bars; real usage speaks for itself."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {skillCategories.map((category, i) => (
          <Reveal key={category.key} delay={(i % 3) * 0.05} className="h-full">
            <SkillPanel category={category} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.08}>
        <aside className="mt-6 border border-line bg-surface-2/50 p-5 sm:p-6">
          <p className="font-mono text-[10px] tracking-[0.35em] text-ink-faint">
            ENGINEERING PRACTICES
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {engineeringPractices.map((practice) => (
              <li
                key={practice}
                className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-ink-dim"
              >
                <span aria-hidden className="text-accent">▸</span>
                {practice}
              </li>
            ))}
          </ul>
        </aside>
      </Reveal>
    </SectionShell>
  );
}
