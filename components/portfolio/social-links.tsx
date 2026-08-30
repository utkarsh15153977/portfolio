"use client";

import { FileText } from "lucide-react";
import { resumeUrl, socialLinks } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
}

/* -------------------------------------------------------------------------- */
/* GitHub                                                                      */
/* -------------------------------------------------------------------------- */

export function GithubIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* LinkedIn                                                                    */
/* -------------------------------------------------------------------------- */

export function LinkedinIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Social Links                                                                */
/* -------------------------------------------------------------------------- */

export function SocialLinks({
  variant = "row",
  className,
}: {
  variant?: "row" | "stack";
  className?: string;
}) {
  return (
    <div
      className={cn(
        variant === "row"
          ? "flex items-center gap-1.5"
          : "flex flex-col gap-3",
        className
      )}
      aria-label="Social links"
    >
      {socialLinks.map((link) => {
        const Icon =
          link.label === "GitHub"
            ? GithubIcon
            : link.label === "LinkedIn"
              ? LinkedinIcon
              : null;

        const enabled = Boolean(link.url);

        const buttonClass = cn(
          "group relative inline-flex size-9 items-center justify-center",
          "rounded-md border font-mono",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent",
          enabled
            ? [
                "border-line text-ink-dim",
                "hover:border-accent/60",
                "hover:bg-accent-soft",
                "hover:text-accent",
                "hover:shadow-[0_0_18px_rgba(34,211,238,0.08)]",
              ]
            : [
                "cursor-not-allowed",
                "border-line/70 text-ink-faint/50",
              ]
        );

        const content = (
          <>
            {Icon ? (
              <Icon className="size-4 transition-transform duration-200 group-hover:scale-110" />
            ) : (
              <span className="text-[9px] tracking-wider">
                {link.label.slice(0, 2).toUpperCase()}
              </span>
            )}

            <span className="sr-only">{link.label}</span>
          </>
        );

        if (!enabled) {
          return (
            <span
              key={link.label}
              className={buttonClass}
              title={`${link.label} URL pending`}
              aria-disabled="true"
            >
              {content}
            </span>
          );
        }

        return (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
            title={`Open ${link.label}`}
            aria-label={`Open ${link.label}`}
          >
            {content}
          </a>
        );
      })}

      {/* ------------------------------------------------------------------ */}
      {/* Resume                                                              */}
      {/* ------------------------------------------------------------------ */}

      {resumeUrl ? (
        <a
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "group inline-flex size-9 items-center justify-center",
            "rounded-md border border-line text-ink-dim",
            "transition-all duration-200",
            "hover:border-accent/60",
            "hover:bg-accent-soft",
            "hover:text-accent",
            "hover:shadow-[0_0_18px_rgba(34,211,238,0.08)]",
            "focus-visible:outline-none",
            "focus-visible:ring-1",
            "focus-visible:ring-accent"
          )}
          title="Open resume"
          aria-label="Open resume"
        >
          <FileText className="size-4 transition-transform duration-200 group-hover:scale-110" />
          <span className="sr-only">Resume</span>
        </a>
      ) : (
        <span
          className={cn(
            "inline-flex size-9 cursor-not-allowed items-center justify-center",
            "rounded-md border border-line/70 text-ink-faint/50"
          )}
          title="Resume not available"
          aria-disabled="true"
        >
          <FileText className="size-4" aria-hidden="true" />
          <span className="sr-only">Resume unavailable</span>
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* System Status                                                               */
/* -------------------------------------------------------------------------- */

export function SystemStatus({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-ok"
      role="status"
      aria-label="System online"
    >
      <span
        className="inline-block size-1.5 animate-pulse-dot rounded-full bg-ok"
        aria-hidden="true"
      />

      <span>SYSTEM ONLINE</span>

      {!compact && (
        <span className="tracking-[0.2em] text-ink-faint">
          · ALL CORE SERVICES NOMINAL
        </span>
      )}
    </div>
  );
}