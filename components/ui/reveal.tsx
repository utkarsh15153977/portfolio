"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { initGsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 12,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) return;

    const { gsap } = initGsap();

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        {
          y,
          opacity: 0.01,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.45,
          delay,
          ease: "power2.out",
          clearProps: "transform,opacity",
          scrollTrigger: {
            trigger: element,
            start: "top 96%",
            once,
          },
        }
      );
    }, element);

    return () => ctx.revert();
  }, [delay, y, once]);

  return (
    <div
      ref={ref}
      className={cn(className)}
    >
      {children}
    </div>
  );
}