"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useActiveSection } from "@/hooks/use-active-section";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import { useSystem } from "@/components/providers/system-provider";
import { navSections, profile } from "@/lib/portfolio-data";
import { SocialLinks, SystemStatus } from "@/components/portfolio/social-links";
import { cn } from "@/lib/utils";

const NAV_IDS = navSections.map((s) => s.id);

export function MobileNav() {
  const active = useActiveSection(NAV_IDS);
  const { scrollToSection, setScrollLocked, state } = useSystem();
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state === "booting") return;
    setScrollLocked(open);
    return () => setScrollLocked(false);
  }, [open, state, setScrollLocked]);

  // Breakpoint-aware cleanup: closing on desktop release locks and overlay state.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Dialog focus: focus moves into the menu, Tab cycles inside,
  // and focus returns to the opener on close.
  useDialogFocus(open, overlayRef);

  const go = (id: string) => {
    setOpen(false);
    // Wait a tick so the overlay unlocks scrolling before navigating.
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToSection(id)));
  };

  const activeLabel = navSections.find((s) => s.id === active)?.label ?? "HOME";

  return (
    <>
      {/* top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-background/85 px-5 backdrop-blur-md lg:hidden">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            go("home");
          }}
          className="font-display text-base font-bold tracking-[0.14em] text-ink"
        >
          {profile.firstName}
          <span className="text-accent">{"//SYS"}</span>
        </a>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-flex">
            <SystemStatus compact />
          </span>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-10 items-center justify-center rounded-md border border-line text-ink transition-colors hover:border-accent/50 hover:text-accent"
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </header>

      {/* overlay */}
      <div
        ref={overlayRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!open}
        tabIndex={-1}
        className={cn(
          "fixed inset-0 z-[60] flex flex-col bg-background/[0.985] grid-bg noise transition-all duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <SystemStatus compact />
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            data-autofocus
            tabIndex={open ? 0 : -1}
            className="inline-flex size-10 items-center justify-center rounded-md border border-line text-ink transition-colors hover:border-accent/50 hover:text-accent"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav aria-label="Mobile sections" className="flex-1 overflow-y-auto px-6 py-6">
          <ul className="space-y-1">
            {navSections.map((section, i) => {
              const isActive = active === section.id;
              return (
                <li
                  key={section.id}
                  style={{
                    transitionDelay: open ? `${80 + i * 35}ms` : "0ms",
                  }}
                  className={cn(
                    "transition-all duration-500 ease-out",
                    open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                  )}
                >
                  <a
                    href={`#${section.id}`}
                    tabIndex={open ? 0 : -1}
                    onClick={(e) => {
                      e.preventDefault();
                      go(section.id);
                    }}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "group flex items-baseline gap-4 border-b border-line/60 py-3.5",
                      isActive ? "text-accent" : "text-ink-dim"
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-xs tracking-widest",
                        isActive ? "text-accent" : "text-ink-faint/85"
                      )}
                    >
                      {section.index}
                    </span>
                    <span className="font-display text-xl font-semibold tracking-[0.12em] group-hover:text-accent transition-colors">
                      {section.label}
                    </span>
                    {isActive && (
                      <span aria-hidden className="ml-auto size-1.5 rounded-full bg-accent animate-pulse-dot" />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex items-center justify-between px-1">
            <SocialLinks variant="row" />
            <span className="font-mono text-[9px] tracking-[0.25em] text-ink-faint/85">
              {profile.systemVersion}
            </span>
          </div>

          <p className="mt-3 px-1 font-mono text-[10px] tracking-[0.2em] text-ink-faint">
            ACTIVE: {activeLabel} — BANGALORE, IN
          </p>
        </nav>
      </div>
    </>
  );
}
