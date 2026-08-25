"use client";

import { useEffect, useRef } from "react";
import { useActiveSection } from "@/hooks/use-active-section";
import { useSystem } from "@/components/providers/system-provider";
import { navSections, profile } from "@/lib/portfolio-data";
import { SocialLinks, SystemStatus } from "@/components/portfolio/social-links";
import { initGsap, gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const NAV_IDS = navSections.map((s) => s.id);

export function Sidebar() {
  const active = useActiveSection(NAV_IDS);
  const { scrollToSection } = useSystem();
  const progressRef = useRef<HTMLDivElement>(null);

  // Vertical scroll progress rail.
  useEffect(() => {
    initGsap();
    const st = ScrollTrigger.create({
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      onUpdate: (self) => {
        if (progressRef.current) {
          gsap.set(progressRef.current, { scaleY: self.progress });
        }
      },
    });
    return () => st.kill();
  }, []);

  return (
    <aside
      aria-label="Primary navigation"
      className="fixed inset-y-0 left-0 z-40 hidden w-[264px] flex-col border-r border-line bg-surface/80 backdrop-blur-md lg:flex"
    >
      {/* logo */}
      <a
        href="#home"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection("home");
        }}
        className="group border-b border-line px-7 py-7 block"
      >
        <span className="block font-display text-xl font-bold tracking-[0.14em] text-ink group-hover:text-accent transition-colors">
          {profile.firstName}
          <span className="text-accent">{"//SYSTEM"}</span>
        </span>
        <span className="mt-1 block font-mono text-[10px] tracking-[0.3em] text-ink-faint">
          {profile.role.toUpperCase()}
        </span>
      </a>

      {/* nav */}
      <nav aria-label="Sections" className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-0.5">
          {navSections.map((section) => {
            const isActive = active === section.id;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(section.id);
                  }}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-sm px-3 py-2 font-mono text-[11px] tracking-[0.22em] transition-all duration-200",
                    isActive
                      ? "text-accent bg-accent-soft/60"
                      : "text-ink-faint hover:text-ink hover:bg-white/[0.03]"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-accent transition-all duration-200",
                      isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
                    )}
                  />
                  <span className={cn("transition-colors", isActive ? "text-accent" : "text-ink-faint/80 group-hover:text-ink-dim")}>
                    {section.index}
                  </span>
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* footer */}
      <div className="border-t border-line px-7 py-5 space-y-4">
        <SystemStatus compact />
        <SocialLinks variant="row" />
        <p className="font-mono text-[9px] tracking-[0.25em] text-ink-faint/85">
          {profile.systemVersion} {"//"} BUILD 2026 — BANGALORE, IN
        </p>
      </div>

      {/* scroll progress rail */}
      <div
        aria-hidden
        className="absolute right-0 top-0 h-full w-[2px] bg-transparent"
      >
        <div
          ref={progressRef}
          className="h-full w-full origin-top scale-y-0 bg-gradient-to-b from-accent to-violet"
        />
      </div>
    </aside>
  );
}
