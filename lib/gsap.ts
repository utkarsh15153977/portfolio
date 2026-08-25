"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let initialized = false;

/** Registers ScrollTrigger exactly once, client-side only. */
export function initGsap() {
  if (!initialized && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    initialized = true;
  }
  return { gsap, ScrollTrigger };
}

export { gsap, ScrollTrigger };
