"use client";

import { useEffect, useRef } from "react";
import { useActiveSection } from "@/hooks/use-active-section";
import { useSystem } from "@/components/providers/system-provider";
import { navSections, profile } from "@/lib/portfolio-data";
import {
  SocialLinks,
  SystemStatus,
} from "@/components/portfolio/social-links";

import { initGsap, gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const NAV_IDS = navSections.map((section) => section.id);

export function Sidebar() {
  const active = useActiveSection(NAV_IDS);
  const { scrollToSection } = useSystem();

  const progressRef = useRef<HTMLDivElement>(null);

  /*
   * =========================================================
   * SCROLL PROGRESS
   * =========================================================
   *
   * A thin vertical rail on the right side of the sidebar
   * represents the user's overall page progress.
   */
  useEffect(() => {
    initGsap();

    const progressElement = progressRef.current;

    if (!progressElement) return;

    const updateProgress = (progress: number) => {
      gsap.set(progressElement, {
        scaleY: progress,
      });
    };

    const scrollTrigger = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      invalidateOnRefresh: true,

      onUpdate: (self) => {
        updateProgress(self.progress);
      },
    });

    /*
     * Make sure the initial state is correct even before the
     * first scroll event fires.
     */
    updateProgress(
      ScrollTrigger.maxScroll(window) > 0
        ? window.scrollY / ScrollTrigger.maxScroll(window)
        : 0
    );

    return () => {
      scrollTrigger.kill();
    };
  }, []);

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const handleNavigation = (
    event: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    event.preventDefault();
    scrollToSection(sectionId);
  };

  return (
    <aside
      aria-label="Primary navigation"
      className="
        fixed inset-y-0 left-0 z-40 hidden w-[264px]
        flex-col
        border-r border-line
        bg-surface/85
        backdrop-blur-md
        lg:flex
      "
    >
      {/* =====================================================
          BRAND / IDENTITY
          ===================================================== */}

      <div className="relative border-b border-line">
        <a
          href="#home"
          onClick={(event) => handleNavigation(event, "home")}
          className="
            group block
            px-7 py-7
            transition-colors duration-200
            hover:bg-white/[0.015]
          "
          aria-label={`${profile.firstName} — Home`}
        >
          {/* top system marker */}
          <div className="mb-3 flex items-center gap-2">
            <span
              aria-hidden
              className="
                size-1.5 rounded-full
                bg-accent
                shadow-[0_0_10px_rgba(34,211,238,0.55)]
              "
            />

            <span className="font-mono text-[8px] tracking-[0.28em] text-ink-faint">
              SYSTEM IDENTITY
            </span>
          </div>

          {/* logo */}
          <span
            className="
              block
              font-display text-xl font-bold
              tracking-[0.13em]
              text-ink
              transition-colors duration-200
              group-hover:text-accent
            "
          >
            {profile.firstName}
            <span className="text-accent">{"//SYSTEM"}</span>
          </span>

          {/* role */}
          <span
            className="
              mt-1.5 block
              font-mono text-[9px]
              tracking-[0.28em]
              text-ink-faint
            "
          >
            {profile.role.toUpperCase()}
          </span>

          {/* bottom signal */}
          <span
            aria-hidden
            className="
              pointer-events-none
              absolute bottom-0 left-7
              h-px w-10
              bg-accent/50
              transition-all duration-300
              group-hover:w-20
              group-hover:bg-accent
            "
          />
        </a>
      </div>

      {/* =====================================================
          NAVIGATION
          ===================================================== */}

      <nav
        aria-label="Portfolio sections"
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="mb-3 px-3">
          <p className="font-mono text-[8px] tracking-[0.3em] text-ink-faint/70">
            NAVIGATION
          </p>
        </div>

        <ul className="space-y-1">
          {navSections.map((section) => {
            const isActive = active === section.id;

            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={(event) =>
                    handleNavigation(event, section.id)
                  }
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    `
                      group relative
                      flex items-center gap-3
                      rounded-sm
                      px-3 py-2.5
                      font-mono text-[10.5px]
                      tracking-[0.2em]
                      transition-all duration-200
                    `,
                    isActive
                      ? `
                        bg-accent-soft/70
                        text-accent
                      `
                      : `
                        text-ink-faint
                        hover:bg-white/[0.025]
                        hover:text-ink
                      `
                  )}
                >
                  {/* active rail */}
                  <span
                    aria-hidden
                    className={cn(
                      `
                        absolute left-0 top-1/2
                        h-5 w-[2px]
                        -translate-y-1/2
                        rounded-full
                        bg-accent
                        transition-all duration-200
                      `,
                      isActive
                        ? `
                          scale-y-100
                          opacity-100
                          shadow-[0_0_8px_rgba(34,211,238,0.5)]
                        `
                        : `
                          scale-y-0
                          opacity-0
                        `
                    )}
                  />

                  {/* index */}
                  <span
                    className={cn(
                      `
                        w-5 shrink-0
                        font-mono text-[9px]
                        tracking-[0.16em]
                        transition-colors duration-200
                      `,
                      isActive
                        ? "text-accent"
                        : "text-ink-faint/70 group-hover:text-ink-dim"
                    )}
                  >
                    {section.index}
                  </span>

                  {/* label */}
                  <span
                    className={cn(
                      `
                        transition-all duration-200
                      `,
                      isActive
                        ? "translate-x-0.5 font-medium"
                        : "group-hover:translate-x-0.5"
                    )}
                  >
                    {section.label}
                  </span>

                  {/* active indicator */}
                  {isActive && (
                    <span
                      aria-hidden
                      className="
                        ml-auto
                        size-1.5
                        rounded-full
                        bg-accent
                        animate-pulse-dot
                      "
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* =====================================================
          FOOTER / SYSTEM INFO
          ===================================================== */}

      <div className="space-y-4 border-t border-line px-7 py-5">
        {/* system status */}
        <SystemStatus compact />

        {/* social links */}
        <SocialLinks variant="row" />

        {/* build information */}
        <div className="space-y-1">
          <p className="font-mono text-[8px] tracking-[0.24em] text-ink-faint/70">
            {profile.systemVersion}
          </p>

          <p className="font-mono text-[8px] tracking-[0.22em] text-ink-faint/60">
            {"//"} BUILD 2026
          </p>

          <p className="font-mono text-[8px] tracking-[0.22em] text-ink-faint/60">
            BANGALORE, IN
          </p>
        </div>
      </div>

      {/* =====================================================
          VERTICAL SCROLL PROGRESS RAIL
          ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute right-0 top-0
          h-full w-px
          bg-line
        "
      >
        <div
          ref={progressRef}
          className="
            h-full w-full
            origin-top
            scale-y-0
            bg-gradient-to-b
            from-accent
            via-accent
            to-violet
          "
        />
      </div>
    </aside>
  );
}