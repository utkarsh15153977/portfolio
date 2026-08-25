"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { ArrowUpRight, FolderGit2 } from "lucide-react";
import { SectionShell } from "@/components/portfolio/section-shell";
import { Reveal } from "@/components/ui/reveal";
import { ArchitectureGraph } from "@/components/portfolio/architecture-graph";
import { GithubIcon } from "@/components/portfolio/social-links";
import { initGsap } from "@/lib/gsap";
import {
  architectureDiagrams,
  casePhases,
  chatProject,
  featuredRepo,
  githubProfileUrl,
  githubRepos,
} from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

const chatDiagram =
  architectureDiagrams.find((d) => d.key === "realtime-chat") ?? null;

/** chapter key -> zero-based position (stable numbering across grouped nav) */
const chapterNumber = new Map(chatProject.chapters.map((c, i) => [c.key, i]));

function RepoCard({ repo }: { repo: (typeof githubRepos)[number] }) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col border bg-gradient-to-b from-surface-2/80 to-surface/60 p-5 transition-all duration-300 hover:-translate-y-1",
        repo.badge
          ? "border-accent/45 hover:border-accent/70 hover:shadow-[0_12px_40px_rgba(34,211,238,0.08)]"
          : "border-line hover:border-accent/40"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-line-strong text-ink-dim transition-colors group-hover:border-accent/50 group-hover:text-accent">
          <GithubIcon className="size-4" />
        </span>
        {repo.badge && (
          <span className="chip chip--solid !py-0.5 !text-[8.5px]">{repo.badge}</span>
        )}
      </div>

      <h4 className="mt-4 font-mono text-sm font-bold tracking-[0.14em] text-ink transition-colors group-hover:text-accent">
        <a href={repo.url} target="_blank" rel="noreferrer" className="outline-offset-4">
          {repo.name}
        </a>
      </h4>
      <p className="mt-1 font-mono text-[9px] tracking-[0.26em] text-accent/80">
        {repo.tagline}
      </p>
      <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-ink-dim">
        {repo.description}
      </p>

      <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={`${repo.name} technologies`}>
        {repo.tech.map((tech) => (
          <li key={tech}>
            <span className="chip !py-0.5 !text-[9px]">{tech}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
        <span className="inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.22em] text-ink-faint">
          <span aria-hidden className={cn("inline-block size-1.5 rounded-full", repo.primaryLanguage === "Java" ? "bg-[#f89820]" : "bg-[#3178c6]")} />
          {repo.primaryLanguage.toUpperCase()}
        </span>
        <a
          href={repo.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.2em] text-ink-faint transition-colors hover:text-accent"
          aria-label={`View ${repo.name} on GitHub`}
        >
          SOURCE <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </a>
      </div>
    </article>
  );
}

export function Projects() {
  const [activeKey, setActiveKey] = useState(chatProject.chapters[0].key);
  const active = chatProject.chapters.find((c) => c.key === activeKey)!;
  const contentRef = useRef<HTMLDivElement>(null);
  const chapterTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Roving-tabindex keyboard support: ← → Home End, wrapping.
  const onChapterTablistKeyDown = (e: React.KeyboardEvent) => {
    const count = chatProject.chapters.length;
    const current = chatProject.chapters.findIndex((c) => c.key === activeKey);
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
    setActiveKey(chatProject.chapters[next].key);
    chapterTabRefs.current[next]?.focus();
  };

  // Animate chapter swaps.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const { gsap } = initGsap();
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" }
    );
  }, [activeKey]);

  return (
    <SectionShell
      id="projects"
      index="04"
      kicker="PROJECTS // GITHUB ENGINEERING"
      title={
        <>
          NOT A DEMO. <span className="text-accent">A CASE STUDY.</span>
        </>
      }
      description="A flagship messaging system explored as a full engineering case study, a featured SaaS build, and selected public repositories — all linked to source."
    >
      {/* featured build spotlight */}
      <Reveal>
        <article className="corner-brackets relative overflow-hidden border border-accent/40 bg-gradient-to-br from-accent/[0.07] via-surface-2/70 to-surface/60 p-6 sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_75%_at_88%_15%,rgba(34,211,238,0.1),transparent)]"
            aria-hidden
          />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-accent">
                <FolderGit2 className="size-3.5" aria-hidden />
                {featuredRepo.tagline}
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-wide text-ink sm:text-3xl lg:text-4xl">
                {featuredRepo.name}
              </h3>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-dim">
                {featuredRepo.description}
              </p>
            </div>
            <a
              href={featuredRepo.url}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 bg-accent px-5 py-3 font-mono text-xs font-bold tracking-[0.2em] text-background transition-all hover:bg-cyan-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.35)]"
            >
              <GithubIcon className="size-4" />
              VIEW SOURCE
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
            </a>
          </div>

          <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Featured build technologies">
            {featuredRepo.tech.map((tech) => (
              <li key={tech}>
                <span className="chip chip--solid !text-[10px]">{tech}</span>
              </li>
            ))}
          </ul>

          {/* feature grid */}
          <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-4 lg:grid-cols-6" aria-label="BizFlow features">
            {[
              "AUTH", "MULTI-TENANCY", "CUSTOMERS", "LEADS", "FOLLOW-UPS", "INVOICES",
              "PAYMENTS", "WHATSAPP ALERTS", "DASHBOARD", "REPORTS", "STAFF",
            ].map((feature) => (
              <div key={feature} className="bg-background/60 p-3">
                <dt className="font-mono text-[9px] tracking-[0.22em] text-ink-dim">{feature}</dt>
              </div>
            ))}
          </dl>
          <p className="mt-3 font-mono text-[9px] tracking-[0.22em] text-ink-faint/85">
            {"// FEATURE SET FROM THE PUBLIC REPOSITORY README"}
          </p>
        </article>
      </Reveal>
      {/* project header */}
      <Reveal>
        <header className="panel corner-brackets relative overflow-hidden p-6 sm:p-8">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_70%_at_90%_10%,rgba(167,139,250,0.09),transparent)]"
            aria-hidden
          />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-violet">
                <FolderGit2 className="size-3.5" aria-hidden />
                {chatProject.kind} · {chatProject.index}
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-wide text-ink sm:text-3xl lg:text-4xl">
                {chatProject.title}
              </h3>
              <p className="mt-1.5 text-sm text-ink-dim">“{chatProject.subtitle}”</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="chip chip--solid">{chatProject.stack.length} TECHNOLOGIES</span>
              <a
                href={chatProject.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-1.5 border border-line px-3 py-1.5 font-mono text-[10px] tracking-[0.2em] text-ink-dim transition-colors hover:border-accent/50 hover:text-accent"
              >
                <GithubIcon className="size-3.5" />
                SOURCE
                <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
              </a>
            </div>
          </div>

          {/* spec sheet */}
          <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-4">
            {chatProject.specSheet.map((row) => (
              <div key={row.k} className="bg-surface-2/80 p-3.5">
                <dt className="font-mono text-[9px] tracking-[0.28em] text-ink-faint">{row.k}</dt>
                <dd className="mt-1.5 font-mono text-xs font-semibold tracking-wider text-accent">
                  {row.v}
                </dd>
              </div>
            ))}
          </dl>

          {/* capabilities */}
          <p className="mt-6 font-mono text-[9px] tracking-[0.3em] text-ink-faint">CAPABILITIES</p>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {chatProject.capabilities.map((cap) => (
              <li key={cap}>
                <span className="chip !text-[10px]">{cap}</span>
              </li>
            ))}
          </ul>
        </header>
      </Reveal>

      {/* case-study chapters */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* chapter nav */}
        <nav aria-label="Case study chapters" className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-3 hidden font-mono text-[9px] tracking-[0.3em] text-ink-faint lg:block">
            CHAPTERS — {String(chatProject.chapters.length).padStart(2, "0")}
          </p>
          <ul
            role="tablist"
            aria-label="Case study chapters"
            onKeyDown={onChapterTablistKeyDown}
            className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {casePhases.map((phase) => {
              const group = chatProject.chapters.filter((c) => c.phase === phase);
              return (
                <Fragment key={phase}>
                  <li
                    role="presentation"
                    aria-hidden="true"
                    className="hidden select-none px-3 pb-1 pt-4 font-mono text-[8px] tracking-[0.32em] text-ink-faint lg:block first:pt-1"
                  >
                    PHASE {String(casePhases.indexOf(phase) + 1).padStart(2, "0")} — {phase}
                  </li>
                  {group.map((chapter) => {
                    const i = chapterNumber.get(chapter.key)!;
                    const isActive = chapter.key === activeKey;
                    return (
                      <li key={chapter.key} role="presentation" className="shrink-0 lg:shrink">
                        <button
                          role="tab"
                          id={`chapter-tab-${chapter.key}`}
                          ref={(el) => {
                            chapterTabRefs.current[i] = el;
                          }}
                          tabIndex={isActive ? 0 : -1}
                          aria-selected={isActive}
                          aria-controls={`chapter-panel-${chapter.key}`}
                          onClick={() => setActiveKey(chapter.key)}
                          className={cn(
                            "group flex w-full items-center gap-2.5 whitespace-nowrap border px-3 py-2 font-mono text-[10.5px] tracking-[0.18em] transition-all sm:text-[11px]",
                            isActive
                              ? "border-accent/60 bg-accent-soft text-accent"
                              : "border-line text-ink-faint hover:border-line-strong hover:text-ink-dim"
                          )}
                        >
                          <span className={cn("text-[9px]", isActive ? "text-accent" : "text-ink-faint/80")}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {chapter.tab}
                        </button>
                      </li>
                    );
                  })}
                </Fragment>
              );
            })}
          </ul>
        </nav>

        {/* phase tracker + chapter content */}
        <div>
          <ol
            aria-label={`Case study phases — current phase: ${active.phase}`}
            className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-2"
          >
            {casePhases.map((phase, i) => {
              const isActive = phase === active.phase;
              return (
                <li key={phase} className="flex items-center gap-2">
                  <span
                    aria-current={isActive ? "step" : undefined}
                    className={cn(
                      "inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[9.5px] tracking-[0.22em] transition-colors duration-300",
                      isActive
                        ? "border-accent/60 bg-accent-soft text-accent"
                        : "border-line text-ink-faint"
                    )}
                  >
                    <span aria-hidden className={isActive ? "text-accent" : "text-ink-faint/80"}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {phase}
                  </span>
                  {i < casePhases.length - 1 && (
                    <span aria-hidden className="font-mono text-[10px] text-ink-faint">
                      →
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          <div
            ref={contentRef}
            role="tabpanel"
            id={`chapter-panel-${active.key}`}
            aria-labelledby={`chapter-tab-${active.key}`}
            className="min-h-[420px]"
          >
            <article className="panel h-full p-6 sm:p-8">
              <p className="flex flex-wrap items-center gap-x-3 font-mono text-[10px] tracking-[0.35em] text-accent">
                <span>
                  CHAPTER {String(chapterNumber.get(active.key)! + 1).padStart(2, "0")} / {active.tab}
                </span>
                <span aria-hidden className="text-line-strong">|</span>
                <span className="text-ink-faint">PHASE: {active.phase}</span>
              </p>
              <h4 className="mt-3 font-display text-xl font-bold tracking-wide text-ink sm:text-2xl">
                {active.heading}
              </h4>
              <div className="mt-5 space-y-4">
                {active.body.map((para, i) => (
                  <p key={i} className="max-w-3xl text-sm leading-relaxed text-ink-dim">
                    {para}
                  </p>
                ))}
              </div>
              <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Chapter technologies">
                {active.tech.map((tech) => (
                  <li key={tech}>
                    <span className="chip chip--solid !text-[10px]">{tech}</span>
                  </li>
                ))}
              </ul>

              {active.key === "architecture" && chatDiagram && (
                <ArchitectureGraph diagram={chatDiagram} className="mt-8" />
              )}
            </article>
          </div>
        </div>
      </div>

      {/* ---------------- GitHub / Engineering subsection ---------------- */}
      <div className="mt-20 border-t border-line pt-14" aria-labelledby="github-engineering-heading">
        <Reveal>
          <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.35em] text-accent">
            <span aria-hidden className="h-px w-10 bg-accent/50" />
            GITHUB // ENGINEERING
          </p>
          <h3
            id="github-engineering-heading"
            className="mt-4 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl"
          >
            SELECTED PUBLIC REPOSITORIES.
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-dim">
            Curated public work — each card links straight to source. No inflated stats;
            the code speaks for itself.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {githubRepos.map((repo) => (
            <Reveal key={repo.key} delay={(githubRepos.indexOf(repo) % 4) * 0.05} className="h-full">
              <RepoCard repo={repo} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.08}>
          <a
            href={githubProfileUrl}
            target="_blank"
            rel="noreferrer"
            className="group mt-6 inline-flex items-center gap-2 border border-line-strong px-5 py-3 font-mono text-xs tracking-[0.22em] text-ink transition-colors hover:border-accent/60 hover:text-accent"
          >
            <GithubIcon className="size-4" />
            ALL PUBLIC REPOSITORIES
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
          </a>
        </Reveal>
      </div>
    </SectionShell>
  );
}
