"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Lightweight dialog focus management (no library):
 * - moves focus into the dialog on open ([data-autofocus] target, else container)
 * - keeps Tab / Shift+Tab cycling inside the dialog while open
 * - restores focus to the triggering element on close
 */
export function useDialogFocus(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!active) return;

    const previous = document.activeElement as HTMLElement | null;

    const raf = requestAnimationFrame(() => {
      const auto =
        containerRef.current?.querySelector<HTMLElement>("[data-autofocus]");
      (auto ?? containerRef.current)?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const root = containerRef.current;
      if (!root) return;

      const nodes = Array.from(
        root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const current = document.activeElement as HTMLElement | null;

      if (event.shiftKey && (current === first || !root.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      if (previous && document.contains(previous)) {
        previous.focus();
      }
    };
  }, [active, containerRef]);
}
