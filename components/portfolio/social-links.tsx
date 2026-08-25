"use client";

import { FileText } from "lucide-react";
import { resumeUrl, socialLinks } from "@/lib/portfolio-data";
import { cn } from "@/lib/utils";

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

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
        variant === "row" ? "flex items-center gap-1" : "flex flex-col gap-3",
        className
      )}
    >
      {socialLinks.map((link) => {
        const Icon =
          link.label === "GitHub"
            ? GithubIcon
            : link.label === "LinkedIn"
              ? LinkedinIcon
              : null;
        const enabled = Boolean(link.url);
        const shared = cn(
          "inline-flex size-9 items-center justify-center rounded-md border border-line text-ink-dim transition-colors",
          enabled
            ? "hover:border-accent/50 hover:text-accent hover:bg-accent-soft"
            : "cursor-help opacity-50"
        );
        const content = (
          <>
            {Icon ? (
              <Icon className="size-4" />
            ) : (
              <span className="font-mono text-[10px]">{link.label.slice(0, 2)}</span>
            )}
            <span className="sr-only">{link.label}</span>
          </>
        );
        return enabled ? (
          <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className={shared} title={link.label}>
            {content}
          </a>
        ) : (
          <span
            key={link.label}
            className={shared}
            title={`${link.label} URL pending — update lib/portfolio-data.ts`}
            aria-disabled="true"
          >
            {content}
          </span>
        );
      })}

      {/* Resume */}
      <a
        href={resumeUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex size-9 items-center justify-center rounded-md border border-line text-ink-dim transition-colors hover:border-accent/50 hover:text-accent hover:bg-accent-soft"
        title="Resume (add /public/resume.pdf)"
      >
        <FileText className="size-4" aria-hidden />
        <span className="sr-only">Resume</span>
      </a>
    </div>
  );
}

export function SystemStatus({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-ok">
      <span className="animate-pulse-dot inline-block size-2 rounded-full bg-ok" aria-hidden />
      SYSTEM ONLINE
      {!compact && (
        <span className="text-ink-faint tracking-[0.2em]">· ALL CORE SERVICES NOMINAL</span>
      )}
    </div>
  );
}
