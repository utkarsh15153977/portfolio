"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { initGsap } from "@/lib/gsap";

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

  /* ---------------------------------------------------------------------- */
  /* Lenis + GSAP                                                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const { gsap, ScrollTrigger } = initGsap();

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1.15,
      smoothWheel: true,
      syncTouch: false,
    });

    lenisRef.current = lenis;

    const handleScroll = () => {
      ScrollTrigger.update();
    };

    const handleRefresh = () => {
      lenis.resize();
    };

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    lenis.on("scroll", handleScroll);

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.addEventListener("refresh", handleRefresh);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      ScrollTrigger.removeEventListener("refresh", handleRefresh);

      lenis.off("scroll", handleScroll);
      lenis.destroy();

      lenisRef.current = null;
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Scroll lock                                                             */
  /* ---------------------------------------------------------------------- */

  const setScrollLocked = useCallback((locked: boolean) => {
    if (locked) {
      lockCount.current += 1;
    } else {
      lockCount.current = Math.max(0, lockCount.current - 1);
    }

    const shouldLock = lockCount.current > 0;

    document.documentElement.classList.toggle(
      "overflow-hidden",
      shouldLock
    );

    document.body.classList.toggle(
      "overflow-hidden",
      shouldLock
    );

    if (lenisRef.current) {
      if (shouldLock) {
        lenisRef.current.stop();
      } else {
        lenisRef.current.start();
      }
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Section scrolling                                                       */
  /* ---------------------------------------------------------------------- */

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);

    if (!element) return;

    window.history.pushState(null, "", `#${id}`);

    const lenis = lenisRef.current;

    if (lenis) {
      lenis.scrollTo(element, {
        offset: -8,
        duration: 1.05,
        immediate: false,
      });

      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Boot                                                                    */
  /* ---------------------------------------------------------------------- */

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