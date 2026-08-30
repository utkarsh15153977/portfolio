"use client";

import {
  Fragment,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
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
  architectureDiagrams.find((diagram) => diagram.key === "realtime-chat") ??
  null;

const chapterNumber = new Map(
  chatProject.chapters.map((chapter, index) => [chapter.key, index])
);

/* -------------------------------------------------------------------------- */
/* Repository Card                                                            */
/* -------------------------------------------------------------------------- */

function RepoCard({
  repo,
}: {
  repo: (typeof githubRepos)[number];
}) {
  return (
    <article
      className={cn(
        "group relative flex h-full min-w-0 flex-col overflow-hidden border bg-gradient-to-b from-surface-2/80 to-surface/60 p-5 transition-transform duration-300",
        "hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        repo.badge
          ? "border-accent/45 hover:border-accent/70 hover:shadow-[0_12px_40px_rgba(34,211,238,0.08)]"
          : "border-line hover:border-accent/40"
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.07),transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
      />

      <div className="relative flex h-full flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-line-strong text-ink-dim transition-colors group-hover:border-accent/50 group-hover:text-accent"
          >
            <GithubIcon className="size-4" />
          </span>

          {repo.badge && (
            <span className="chip chip--solid !py-1 !text-[8.5px]">
              {repo.badge}
            </span>
          )}
        </div>

        {/* Repository identity */}
        <h4 className="mt-4 font-mono text-sm font-bold tracking-[0.12em] text-ink transition-colors group-hover:text-accent">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block max-w-full break-words outline-offset-4 focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
          >
            {repo.name}
          </a>
        </h4>

        <p className="mt-1 font-mono text-[9px] tracking-[0.22em] text-accent/80">
          {repo.tagline}
        </p>

        <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-ink-dim">
          {repo.description}
        </p>

        {/* Technologies */}
        <ul
          className="mt-4 flex flex-wrap gap-1.5"
          aria-label={`${repo.name} technologies`}
        >
          {repo.tech.map((tech) => (
            <li key={tech}>
              <span className="chip !py-1 !text-[9px]">{tech}</span>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-3.5">
          <span className="inline-flex min-w-0 items-center gap-2 font-mono text-[9px] tracking-[0.18em] text-ink-faint">
            <span
              aria-hidden
              className={cn(
                "inline-block size-1.5 shrink-0 rounded-full",
                repo.primaryLanguage === "Java"
                  ? "bg-[#f89820]"
                  : "bg-[#3178c6]"
              )}
            />
            <span className="truncate">
              {repo.primaryLanguage.toUpperCase()}
            </span>
          </span>

          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-sm px-1 font-mono text-[10px] tracking-[0.16em] text-ink-faint transition-colors hover:text-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
            aria-label={`View ${repo.name} on GitHub`}
          >
            SOURCE
            <ArrowUpRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </a>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export function Projects() {
  const firstChapter = chatProject.chapters[0];

  const [activeKey, setActiveKey] = useState(firstChapter?.key ?? "");

  const active =
    chatProject.chapters.find((chapter) => chapter.key === activeKey) ??
    firstChapter;

  const contentRef = useRef<HTMLDivElement>(null);
  const chapterTabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  /* ------------------------------------------------------------------------ */
  /* Chapter selection                                                        */
  /* ------------------------------------------------------------------------ */

  const selectChapter = (key: string) => {
    if (key === activeKey) return;
    setActiveKey(key);
  };

  /* ------------------------------------------------------------------------ */
  /* Keyboard navigation                                                      */
  /* ------------------------------------------------------------------------ */

  const onChapterTablistKeyDown = (event: KeyboardEvent) => {
    const count = chatProject.chapters.length;

    if (count === 0) return;

    const currentIndex = Math.max(
      0,
      chatProject.chapters.findIndex((chapter) => chapter.key === activeKey)
    );

    let nextIndex: number;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = (currentIndex + 1) % count;
        break;

      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = (currentIndex - 1 + count) % count;
        break;

      case "Home":
        nextIndex = 0;
        break;

      case "End":
        nextIndex = count - 1;
        break;

      default:
        return;
    }

    event.preventDefault();

    const nextChapter = chatProject.chapters[nextIndex];

    if (!nextChapter) return;

    selectChapter(nextChapter.key);
    chapterTabRefs.current[nextIndex]?.focus();
  };

  /* ------------------------------------------------------------------------ */
  /* Chapter transition                                                        */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const element = contentRef.current;

    if (!element) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      element.style.opacity = "1";
      element.style.transform = "none";
      return;
    }

    const { gsap } = initGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        {
          autoAlpha: 0,
          y: 12,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
        }
      );
    }, element);

    return () => ctx.revert();
  }, [activeKey]);

  if (!active) {
    return null;
  }

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
      {/* ================================================================== */}
      {/* FEATURED BUILD                                                      */}
      {/* ================================================================== */}

      <Reveal>
        <article className="corner-brackets relative overflow-hidden border border-accent/40 bg-gradient-to-br from-accent/[0.07] via-surface-2/70 to-surface/60 p-5 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_75%_at_88%_15%,rgba(34,211,238,0.1),transparent)]"
          />

          <div className="relative">
            {/* Header */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.24em] text-accent sm:text-[10px] sm:tracking-[0.3em]">
                  <FolderGit2 className="size-3.5 shrink-0" aria-hidden />
                  {featuredRepo.tagline}
                </p>

                <h3 className="mt-3 break-words font-display text-2xl font-bold tracking-wide text-ink sm:text-3xl lg:text-4xl">
                  {featuredRepo.name}
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-dim">
                  {featuredRepo.description}
                </p>
              </div>

              <a
                href={featuredRepo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 bg-accent px-5 py-3 font-mono text-xs font-bold tracking-[0.16em] text-background transition-all hover:bg-cyan-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.35)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent sm:w-auto sm:self-start sm:tracking-[0.2em]"
              >
                <GithubIcon className="size-4" aria-hidden />
                VIEW SOURCE
                <ArrowUpRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </a>
            </div>

            {/* Stack */}
            <ul
              className="mt-6 flex flex-wrap gap-1.5"
              aria-label="Featured build technologies"
            >
              {featuredRepo.tech.map((tech) => (
                <li key={tech}>
                  <span className="chip chip--solid !text-[10px]">
                    {tech}
                  </span>
                </li>
              ))}
            </ul>

            {/* Feature matrix */}
            <dl
              className="mt-7 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-3 lg:grid-cols-6"
              aria-label="BizFlow features"
            >
              {[
                "AUTH",
                "MULTI-TENANCY",
                "CUSTOMERS",
                "LEADS",
                "FOLLOW-UPS",
                "INVOICES",
                "PAYMENTS",
                "WHATSAPP ALERTS",
                "DASHBOARD",
                "REPORTS",
                "STAFF",
              ].map((feature) => (
                <div key={feature} className="bg-background/60 p-3">
                  <dt className="break-words font-mono text-[9px] leading-snug tracking-[0.18em] text-ink-dim">
                    {feature}
                  </dt>
                </div>
              ))}
            </dl>

            <p className="mt-3 font-mono text-[8px] leading-relaxed tracking-[0.18em] text-ink-faint/85 sm:text-[9px] sm:tracking-[0.22em]">
              {"// FEATURE SET FROM THE PUBLIC REPOSITORY README"}
            </p>
          </div>
        </article>
      </Reveal>

      {/* ================================================================== */}
      {/* FLAGSHIP PROJECT HEADER                                             */}
      {/* ================================================================== */}

      <Reveal>
        <header className="panel corner-brackets relative mt-8 overflow-hidden p-5 sm:mt-10 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_45%_70%_at_90%_10%,rgba(167,139,250,0.09),transparent)]"
          />

          <div className="relative">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.24em] text-violet sm:text-[10px] sm:tracking-[0.3em]">
                  <FolderGit2 className="size-3.5 shrink-0" aria-hidden />
                  {chatProject.kind} · {chatProject.index}
                </p>

                <h3 className="mt-3 break-words font-display text-2xl font-bold tracking-wide text-ink sm:text-3xl lg:text-4xl">
                  {chatProject.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                  “{chatProject.subtitle}”
                </p>
              </div>

              <div className="flex w-full flex-row items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end">
                <span className="chip chip--solid">
                  {chatProject.stack.length} TECHNOLOGIES
                </span>

                <a
                  href={chatProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-9 items-center gap-1.5 border border-line px-3 py-2 font-mono text-[10px] tracking-[0.18em] text-ink-dim transition-colors hover:border-accent/50 hover:text-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
                >
                  <GithubIcon className="size-3.5" aria-hidden />
                  SOURCE
                  <ArrowUpRight
                    className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  />
                </a>
              </div>
            </div>

            {/* Specification sheet */}
            <dl className="mt-7 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-4">
              {chatProject.specSheet.map((row) => (
                <div key={row.k} className="bg-surface-2/80 p-3.5">
                  <dt className="break-words font-mono text-[9px] leading-snug tracking-[0.22em] text-ink-faint">
                    {row.k}
                  </dt>

                  <dd className="mt-1.5 break-words font-mono text-xs font-semibold leading-snug tracking-wider text-accent">
                    {row.v}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Capabilities */}
            <p className="mt-6 font-mono text-[9px] tracking-[0.3em] text-ink-faint">
              CAPABILITIES
            </p>

            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {chatProject.capabilities.map((capability) => (
                <li key={capability}>
                  <span className="chip !text-[10px]">{capability}</span>
                </li>
              ))}
            </ul>
          </div>
        </header>
      </Reveal>

      {/* ================================================================== */}
      {/* CASE STUDY                                                          */}
      {/* ================================================================== */}

      <div className="mt-8 grid min-w-0 gap-5 sm:mt-10 sm:gap-6 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
        {/* Chapter navigation */}
        <nav
          aria-label="Case study chapters"
          className="min-w-0 lg:sticky lg:top-24 lg:self-start"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="hidden font-mono text-[9px] tracking-[0.3em] text-ink-faint lg:block">
              CHAPTERS —{" "}
              {String(chatProject.chapters.length).padStart(2, "0")}
            </p>

            <p className="font-mono text-[8px] tracking-[0.2em] text-ink-faint lg:hidden">
              CHAPTER{" "}
              {String((chapterNumber.get(active.key) ?? 0) + 1).padStart(
                2,
                "0"
              )}{" "}
              / {String(chatProject.chapters.length).padStart(2, "0")}
            </p>
          </div>

          {/* Mobile horizontal chapter rail */}
          <div className="relative -mx-1 min-w-0">
            <ul
              role="tablist"
              aria-label="Case study chapters"
              aria-orientation="vertical"
              onKeyDown={onChapterTablistKeyDown}
              className="flex min-w-0 gap-1.5 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-col lg:overflow-visible lg:pb-0"
            >
              {casePhases.map((phase, phaseIndex) => {
                const group = chatProject.chapters.filter(
                  (chapter) => chapter.phase === phase
                );

                return (
                  <Fragment key={phase}>
                    {/* Phase label */}
                    <li
                      role="presentation"
                      aria-hidden="true"
                      className="hidden select-none px-3 pb-1 pt-4 font-mono text-[8px] tracking-[0.32em] text-ink-faint lg:block first:pt-1"
                    >
                      PHASE {String(phaseIndex + 1).padStart(2, "0")} — {phase}
                    </li>

                    {group.map((chapter) => {
                      const index = chapterNumber.get(chapter.key) ?? 0;
                      const isActive = chapter.key === activeKey;

                      return (
                        <li
                          key={chapter.key}
                          role="presentation"
                          className="shrink-0 lg:shrink"
                        >
                          <button
                            role="tab"
                            id={`chapter-tab-${chapter.key}`}
                            ref={(element) => {
                              chapterTabRefs.current[index] = element;
                            }}
                            tabIndex={isActive ? 0 : -1}
                            aria-selected={isActive}
                            aria-controls={`chapter-panel-${chapter.key}`}
                            onClick={() => selectChapter(chapter.key)}
                            className={cn(
                              "group flex min-h-11 items-center gap-2.5 whitespace-nowrap border px-3.5 py-2.5 font-mono text-[10px] tracking-[0.14em] transition-colors sm:text-[11px] sm:tracking-[0.18em]",
                              "focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent",
                              isActive
                                ? "border-accent/60 bg-accent-soft text-accent"
                                : "border-line text-ink-faint hover:border-line-strong hover:text-ink-dim"
                            )}
                          >
                            <span
                              className={cn(
                                "text-[9px]",
                                isActive
                                  ? "text-accent"
                                  : "text-ink-faint/80"
                              )}
                            >
                              {String(index + 1).padStart(2, "0")}
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
          </div>
        </nav>

        {/* Phase + content */}
        <div className="min-w-0">
          {/* Phase tracker */}
          <ol
            aria-label={`Case study phases — current phase: ${active.phase}`}
            className="mb-4 flex min-w-0 items-center gap-x-2 gap-y-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mb-5 sm:flex-wrap sm:overflow-visible sm:pb-0"
          >
            {casePhases.map((phase, index) => {
              const isActive = phase === active.phase;

              return (
                <li key={phase} className="flex shrink-0 items-center gap-2">
                  <span
                    aria-current={isActive ? "step" : undefined}
                    className={cn(
                      "inline-flex min-h-8 items-center gap-2 border px-3 py-1.5 font-mono text-[9px] tracking-[0.18em] transition-colors duration-300 sm:text-[9.5px] sm:tracking-[0.22em]",
                      isActive
                        ? "border-accent/60 bg-accent-soft text-accent"
                        : "border-line text-ink-faint"
                    )}
                  >
                    <span
                      aria-hidden
                      className={
                        isActive
                          ? "text-accent"
                          : "text-ink-faint/80"
                      }
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {phase}
                  </span>

                  {index < casePhases.length - 1 && (
                    <span
                      aria-hidden
                      className="font-mono text-[10px] text-ink-faint"
                    >
                      →
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          {/* Chapter content */}
          <div
            ref={contentRef}
            role="tabpanel"
            id={`chapter-panel-${active.key}`}
            aria-labelledby={`chapter-tab-${active.key}`}
            tabIndex={0}
            className="min-h-0 outline-none"
          >
            <article className="panel h-full min-w-0 overflow-hidden p-5 sm:p-8">
              {/* Chapter metadata */}
              <p className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[9px] tracking-[0.25em] text-accent sm:text-[10px] sm:tracking-[0.35em]">
                <span>
                  CHAPTER{" "}
                  {String(
                    (chapterNumber.get(active.key) ?? 0) + 1
                  ).padStart(2, "0")}{" "}
                  / {active.tab}
                </span>

                <span
                  aria-hidden
                  className="hidden text-line-strong sm:inline"
                >
                  |
                </span>

                <span className="text-ink-faint">
                  PHASE: {active.phase}
                </span>
              </p>

              {/* Heading */}
              <h4 className="mt-3 break-words font-display text-xl font-bold tracking-wide text-ink sm:text-2xl">
                {active.heading}
              </h4>

              {/* Body */}
              <div className="mt-5 space-y-4">
                {active.body.map((paragraph, index) => (
                  <p
                    key={index}
                    className="max-w-3xl text-sm leading-[1.8] text-ink-dim"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Technologies */}
              <ul
                className="mt-5 flex flex-wrap gap-1.5"
                aria-label="Chapter technologies"
              >
                {active.tech.map((tech) => (
                  <li key={tech}>
                    <span className="chip chip--solid !text-[10px]">
                      {tech}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Architecture diagram */}
              {active.key === "architecture" && chatDiagram && (
                <ArchitectureGraph
                  diagram={chatDiagram}
                  className="mt-7 w-full max-w-full overflow-hidden sm:mt-8"
                />
              )}
            </article>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* GITHUB ENGINEERING                                                  */}
      {/* ================================================================== */}

      <div
        className="mt-16 border-t border-line pt-12 sm:mt-20 sm:pt-14"
        aria-labelledby="github-engineering-heading"
      >
        <Reveal>
          <p className="flex items-center gap-3 font-mono text-[10px] tracking-[0.28em] text-accent sm:text-[11px] sm:tracking-[0.35em]">
            <span
              aria-hidden
              className="h-px w-8 bg-accent/50 sm:w-10"
            />
            GITHUB // ENGINEERING
          </p>

          <h3
            id="github-engineering-heading"
            className="mt-4 break-words font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl"
          >
            SELECTED PUBLIC REPOSITORIES.
          </h3>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-dim">
            Curated public work — each card links straight to source. No
            inflated stats; the code speaks for itself.
          </p>
        </Reveal>

        {/* Repository grid */}
        <div className="mt-7 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-4">
          {githubRepos.map((repo, index) => (
            <Reveal
              key={repo.key}
              delay={(index % 4) * 0.04}
              className="h-full min-w-0"
            >
              <RepoCard repo={repo} />
            </Reveal>
          ))}
        </div>

        {/* All repositories */}
        <Reveal delay={0.06}>
          <a
            href={githubProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-line-strong px-5 py-3 font-mono text-xs tracking-[0.18em] text-ink transition-colors hover:border-accent/60 hover:text-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent sm:w-auto sm:tracking-[0.22em]"
          >
            <GithubIcon className="size-4" aria-hidden />
            ALL PUBLIC REPOSITORIES
            <ArrowUpRight
              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </a>
        </Reveal>
      </div>
    </SectionShell>
  );
}