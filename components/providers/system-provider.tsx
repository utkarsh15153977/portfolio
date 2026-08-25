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
  if (!ctx) throw new Error("useSystem must be used within <SystemProvider>");
  return ctx;
}

export function SystemProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SystemState>("booting");
  const lenisRef = useRef<Lenis | null>(null);
  const lockCount = useRef(0);

  // ---- Lenis + GSAP ScrollTrigger sync -------------------------------
  useEffect(() => {
    initGsap();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lenis: Lenis | null = null;
    let rafFn: ((time: number) => void) | null = null;
    if (!reduced) {
      lenis = new Lenis({
        lerp: 0.11,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
      });
      lenisRef.current = lenis;
      lenis.on("scroll", ScrollTrigger.update);

      rafFn = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(rafFn);
      gsap.ticker.lagSmoothing(0);
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

  // ---- scroll lock (boot overlay / mobile menu) ----------------------
  const setScrollLocked = useCallback((locked: boolean) => {
    lockCount.current += locked ? 1 : -1;
    lockCount.current = Math.max(0, lockCount.current);
    const isLocked = lockCount.current > 0;
    document.documentElement.style.overflow = isLocked ? "hidden" : "";
    if (lenisRef.current) {
      if (isLocked) lenisRef.current.stop();
      else lenisRef.current.start();
    }
  }, []);

  const scrollToSection = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(el, { offset: 0, duration: 1.2 });
      } else {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    []
  );

  const finishBoot = useCallback(() => setState("ready"), []);

  return (
    <SystemContext.Provider
      value={{ state, finishBoot, scrollToSection, setScrollLocked }}
    >
      {children}
    </SystemContext.Provider>
  );
}
