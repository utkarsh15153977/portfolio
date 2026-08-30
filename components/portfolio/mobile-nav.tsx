"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { useActiveSection } from "@/hooks/use-active-section";
import { useDialogFocus } from "@/hooks/use-dialog-focus";
import { useSystem } from "@/components/providers/system-provider";
import { navSections, profile } from "@/lib/portfolio-data";
import { SocialLinks, SystemStatus } from "@/components/portfolio/social-links";
import { cn } from "@/lib/utils";

const NAV_IDS = navSections.map((section) => section.id);

export function MobileNav() {
  const active = useActiveSection(NAV_IDS);
  const { scrollToSection, setScrollLocked, state } = useSystem();

  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  /*
   * Lock page scrolling while the mobile menu is open.
   */
  useEffect(() => {
    if (state === "booting") return;

    setScrollLocked(open);

    return () => {
      setScrollLocked(false);
    };
  }, [open, state, setScrollLocked]);

  /*
   * Close menu automatically when entering desktop breakpoint.
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  /*
   * Escape closes the menu.
   */
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  /*
   * Move focus into the dialog, trap Tab navigation,
   * and restore focus to the menu trigger when closed.
   */
  useDialogFocus(open, overlayRef);

  /*
   * Navigate only after the overlay has started closing.
   */
  const go = (id: string) => {
    setOpen(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToSection(id);
      });
    });
  };

  const activeLabel =
    navSections.find((section) => section.id === active)?.label ?? "HOME";

  return (
    <>
      {/* =========================================================
          MOBILE TOP BAR
          ========================================================= */}

      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-background/85 px-5 backdrop-blur-md lg:hidden">
        <a
          href="#home"
          onClick={(event) => {
            event.preventDefault();
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
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            className="inline-flex size-10 items-center justify-center rounded-md border border-line text-ink transition-colors hover:border-accent/50 hover:text-accent focus-visible:border-accent"
          >
            {open ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* =========================================================
          MOBILE MENU
          ========================================================= */}

      <div
        ref={overlayRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!open}
        tabIndex={-1}
        className={cn(
          "fixed inset-0 z-[60] flex flex-col bg-background/[0.985] lg:hidden",
          "grid-bg noise",
          "transition-[opacity,visibility] duration-300",
          open
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        )}
      >
        {/* =====================================================
            MENU HEADER
            ===================================================== */}

        <div
          className={cn(
            "flex items-center justify-between border-b border-line px-5 py-4",
            "transition-transform duration-300",
            open ? "translate-y-0" : "-translate-y-3"
          )}
        >
          <SystemStatus compact />

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            data-autofocus
            tabIndex={open ? 0 : -1}
            className="inline-flex size-10 items-center justify-center rounded-md border border-line text-ink transition-colors hover:border-accent/50 hover:text-accent focus-visible:border-accent"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {/* =====================================================
            NAVIGATION
            ===================================================== */}

        <nav
          aria-label="Mobile sections"
          className="flex-1 overflow-y-auto px-6 py-6"
        >
          <ul className="space-y-1">
            {navSections.map((section, index) => {
              const isActive = active === section.id;

              return (
                <li
                  key={section.id}
                  style={{
                    transitionDelay: open
                      ? `${80 + index * 35}ms`
                      : "0ms",
                  }}
                  className={cn(
                    "transition-all duration-500 ease-out",
                    open
                      ? "translate-x-0 opacity-100"
                      : "translate-x-6 opacity-0"
                  )}
                >
                  <a
                    href={`#${section.id}`}
                    tabIndex={open ? 0 : -1}
                    onClick={(event) => {
                      event.preventDefault();
                      go(section.id);
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group flex items-baseline gap-4 border-b border-line/60 py-3.5",
                      "transition-colors",
                      isActive ? "text-accent" : "text-ink-dim"
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-xs tracking-widest",
                        isActive
                          ? "text-accent"
                          : "text-ink-faint/85"
                      )}
                    >
                      {section.index}
                    </span>

                    <span className="font-display text-xl font-semibold tracking-[0.12em] transition-colors group-hover:text-accent">
                      {section.label}
                    </span>

                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="ml-auto size-1.5 rounded-full bg-accent animate-pulse-dot"
                      />
                    )}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* ===================================================
              SOCIAL / VERSION
              =================================================== */}

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