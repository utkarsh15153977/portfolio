"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Lightweight dialog focus management:
 * - moves focus into the dialog on open
 * - prefers [data-autofocus], otherwise focuses the container
 * - keeps Tab / Shift+Tab cycling inside the dialog
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
      const container = containerRef.current;
      if (!container) return;

      const autoFocus =
        container.querySelector<HTMLElement>(
          "[data-autofocus]"
        );

      (autoFocus ?? container).focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const root = containerRef.current;
      if (!root) return;

      const nodes = Array.from(
        root.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR
        )
      );

      if (nodes.length === 0) {
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      const current =
        document.activeElement as HTMLElement | null;

      if (
        event.shiftKey &&
        (current === first || !root.contains(current))
      ) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);

      if (
        previous &&
        document.contains(previous)
      ) {
        previous.focus();
      }
    };
  }, [active, containerRef]);
}