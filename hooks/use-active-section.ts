"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks the section closest to the vertical center of the viewport.
 *
 * Using the viewport center instead of IntersectionObserver makes the active
 * navigation state more stable when sections are large or overlap the
 * viewport.
 */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState<string>(ids[0] ?? "");
  const activeRef = useRef<string>(ids[0] ?? "");

  useEffect(() => {
    if (!ids.length) return;

    let frame = 0;

    const updateActiveSection = () => {
      const viewportCenter = window.innerHeight / 2;

      let closestId = activeRef.current;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const id of ids) {
        const element = document.getElementById(id);

        if (!element) continue;

        const rect = element.getBoundingClientRect();

        // Ignore sections that are completely outside the viewport.
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) {
          continue;
        }

        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = id;
        }
      }

      // If no section is currently visible, preserve the current section.
      if (!closestDistance || closestDistance !== Number.POSITIVE_INFINITY) {
        if (closestId !== activeRef.current) {
          activeRef.current = closestId;
          setActive(closestId);
        }
      }

      frame = 0;
    };

    const scheduleUpdate = () => {
      if (frame) return;

      frame = window.requestAnimationFrame(updateActiveSection);
    };

    // Calculate the initial active section immediately.
    updateActiveSection();

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [ids]);

  return active;
}