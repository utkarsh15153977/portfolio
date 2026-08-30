"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap, initGsap, ScrollTrigger } from "@/lib/gsap";

type SystemState = "booting" | "ready";

interface SystemContextValue {
  state: SystemState;
  finishBoot: () => void;
  scrollToSection: (id: string) => void;
  setScrollLocked: (locked: boolean) => void;
}

const SystemContext = createContext<SystemContextValue | null>(null);

export function useSystem(): SystemContextValue {
  const ctx = useContext(SystemContext);

  if (!ctx) {
    throw new Error("useSystem must be used within <SystemProvider>");
  }

  return ctx;
}

export function SystemProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<SystemState>("booting");

  const lenisRef = useRef<Lenis | null>(null);
  const lockCount = useRef(0);

  // -----------------------------------------------------------------------
  // Initial scroll position
  //
  // Browsers can restore the previous scroll position after a reload.
  // This portfolio should always start at the Hero/Home section.
  // -----------------------------------------------------------------------
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const previousScrollRestoration =
      window.history.scrollRestoration;

    // Tell the browser NOT to restore the previous scroll position.
    window.history.scrollRestoration = "manual";

    const resetNativeScroll = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });

      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Reset immediately.
    resetNativeScroll();

    // Reset again after the browser has completed the current frame.
    const frame1 = window.requestAnimationFrame(() => {
      resetNativeScroll();

      // One additional frame handles browser/Next.js scroll restoration.
      window.requestAnimationFrame(() => {
        resetNativeScroll();
      });
    });

    return () => {
      window.cancelAnimationFrame(frame1);

      // Restore the browser's original behavior when this provider
      // is removed from the page.
      window.history.scrollRestoration =
        previousScrollRestoration;
    };
  }, []);

  // -----------------------------------------------------------------------
  // Handle browser page restoration.
  //
  // pageshow fires when the document is loaded or restored from the
  // browser's back/forward cache.
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePageShow = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });

      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // If Lenis already exists, reset it too.
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, {
          immediate: true,
        });
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  // -----------------------------------------------------------------------
  // Lenis + GSAP ScrollTrigger
  // -----------------------------------------------------------------------
  useEffect(() => {
    initGsap();

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let lenis: Lenis | null = null;
    let rafFn: ((time: number) => void) | null = null;

    if (!reduced) {
      lenis = new Lenis({
        lerp: 0.11,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
        autoRaf: false,
      });

      lenisRef.current = lenis;

      // Never inherit a browser-restored position.
      lenis.scrollTo(0, {
        immediate: true,
      });

      lenis.on("scroll", ScrollTrigger.update);

      rafFn = (time: number) => {
        lenis?.raf(time * 1000);
      };

      gsap.ticker.add(rafFn);
      gsap.ticker.lagSmoothing(0);

      // Make absolutely sure Lenis is at the top after initialization.
      requestAnimationFrame(() => {
        lenis?.scrollTo(0, {
          immediate: true,
        });
      });
    } else {
      // Reduced-motion users don't use Lenis, so make sure native
      // scrolling also starts at the top.
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    }

    return () => {
      if (rafFn) {
        gsap.ticker.remove(rafFn);
      }

      if (lenis) {
        lenis.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  // -----------------------------------------------------------------------
  // Scroll locking
  // -----------------------------------------------------------------------
  const setScrollLocked = useCallback((locked: boolean) => {
    lockCount.current += locked ? 1 : -1;
    lockCount.current = Math.max(0, lockCount.current);

    const isLocked = lockCount.current > 0;

    document.documentElement.style.overflow = isLocked
      ? "hidden"
      : "";

    if (lenisRef.current) {
      if (isLocked) {
        lenisRef.current.stop();
      } else {
        lenisRef.current.start();
      }
    }
  }, []);

  // -----------------------------------------------------------------------
  // Section navigation
  // -----------------------------------------------------------------------
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);

    if (!el) {
      return;
    }

    const lenis = lenisRef.current;

    if (lenis) {
      lenis.scrollTo(el, {
        offset: 0,
        duration: 1.2,
      });
    } else {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  // -----------------------------------------------------------------------
  // Boot completion
  // -----------------------------------------------------------------------
  const finishBoot = useCallback(() => {
    setState("ready");
  }, []);

  return (
    <SystemContext.Provider
      value={{
        state,
        finishBoot,
        scrollToSection,
        setScrollLocked,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}