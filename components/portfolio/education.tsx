import { GraduationCap, MapPin } from "lucide-react";

import { SectionShell } from "@/components/portfolio/section-shell";
import { Reveal } from "@/components/ui/reveal";
import { education } from "@/lib/portfolio-data";

export function Education() {
  const [startYear, endYear] = education.period.split("–");

  return (
    <SectionShell
      id="education"
      index="07"
      kicker="FOUNDATION"
      title={
        <>
          WHERE IT <span className="text-accent">STARTED.</span>
        </>
      }
    >
      <Reveal>
        <article className="panel corner-brackets relative overflow-hidden p-6 sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_70%_at_95%_20%,rgba(34,211,238,0.07),transparent)]"
            aria-hidden="true"
          />

          <div className="flex flex-wrap items-start justify-between gap-6">
            {/* institution */}
            <div className="flex items-start gap-4">
              <span
                className="flex size-12 shrink-0 items-center justify-center rounded-sm border border-accent/40 bg-accent-soft text-accent"
                aria-hidden="true"
              >
                <GraduationCap className="size-5" />
              </span>

              <div>
                <p className="font-mono text-[10px] tracking-[0.3em] text-ink-faint">
                  B.E. COMPUTER SCIENCE AND ENGINEERING
                </p>

                <h3 className="mt-2 font-display text-xl font-bold tracking-wide text-ink sm:text-2xl">
                  {education.institution.toUpperCase()}
                </h3>

                <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.16em] text-ink-faint">
                  <MapPin className="size-3" aria-hidden="true" />
                  {education.location.toUpperCase()}
                </p>
              </div>
            </div>

            {/* timeline */}
            <div className="text-right">
              <span className="chip chip--solid">{education.period}</span>

              {startYear && endYear && (
                <div
                  className="mt-4 hidden w-52 items-center gap-2 sm:flex"
                  aria-hidden="true"
                >
                  <span className="font-mono text-[9px] text-ink-faint">
                    {startYear.trim()}
                  </span>

                  <span className="relative h-px flex-1 bg-line-strong">
                    <span className="absolute left-0 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-accent/70" />
                    <span className="absolute right-0 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-accent" />
                  </span>

                  <span className="font-mono text-[9px] text-ink-faint">
                    {endYear.trim()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* coursework */}
          <div className="mt-7 border-t border-line pt-6">
            <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">
              RELEVANT COURSEWORK
            </p>

            <ul className="mt-3 flex flex-wrap gap-1.5">
              {education.coursework.map((course) => (
                <li key={course}>
                  <span className="chip">{course}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 font-mono text-[9px] tracking-[0.25em] text-ink-faint/85">
            FOUR YEARS OF CS FUNDAMENTALS → THE BASIS FOR EVERYTHING ABOVE.
          </p>
        </article>
      </Reveal>
    </SectionShell>
  );
}