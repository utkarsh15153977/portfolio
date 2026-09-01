"use client";

import { useState } from "react";
import { Check, Copy, Mail, Phone } from "lucide-react";
import { SectionShell } from "@/components/portfolio/section-shell";
import { Reveal } from "@/components/ui/reveal";
import { SocialLinks } from "@/components/portfolio/social-links";
import { contact, profile } from "@/lib/portfolio-data";

export function Contact() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard access can be unavailable in insecure contexts.
    }
  };

  return (
    <SectionShell
      id="contact"
      index="10"
      kicker="CONTACT // OPEN CHANNEL"
      title={contact.title}
      description={contact.subtitle}
      className="pb-32"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* =====================================================
            DIRECT CHANNELS
        ====================================================== */}
        <Reveal>
          <div className="flex h-full flex-col gap-5">
            {/* Contact information */}
            <div className="panel corner-brackets relative overflow-hidden p-6 sm:p-7">
              {/* subtle background glow */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-accent/[0.035] blur-3xl"
              />

              <div className="relative">
                <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">
                  DIRECT CHANNEL
                </p>

                {/* Email */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a
                    href={`mailto:${profile.email}`}
                    className="group inline-flex min-w-0 max-w-full items-center gap-3 border border-accent/40 bg-accent-soft px-4 py-3 transition-all duration-200 hover:border-accent hover:bg-accent/[0.14]"
                  >
                    <Mail
                      className="size-4 shrink-0 text-accent transition-transform duration-200 group-hover:scale-110"
                      aria-hidden="true"
                    />

                    <span className="truncate font-mono text-xs tracking-wider text-accent sm:text-sm">
                      {profile.email}
                    </span>
                  </a>

                  <button
                    type="button"
                    onClick={copyEmail}
                    aria-label={
                      copied
                        ? "Email address copied"
                        : "Copy email address to clipboard"
                    }
                    className="inline-flex size-11 shrink-0 items-center justify-center border border-line text-ink-dim transition-all duration-200 hover:border-accent/50 hover:bg-accent-soft hover:text-accent focus-visible:border-accent"
                  >
                    {copied ? (
                      <Check
                        className="size-4 text-ok"
                        aria-hidden="true"
                      />
                    ) : (
                      <Copy className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>

                {copied && (
                  <p
                    aria-live="polite"
                    className="mt-2 font-mono text-[10px] tracking-[0.2em] text-ok"
                  >
                    COPIED TO CLIPBOARD
                  </p>
                )}

                {/* Social links */}
                <div className="mt-6 border-t border-line pt-5">
                  <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">
                    ELSEWHERE
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
                    <SocialLinks variant="row" />

                    <p className="font-mono text-[9px] tracking-[0.18em] text-ink-faint/85">
                      RESUME: /RESUME.PDF
                    </p>
                  </div>
                </div>

                {/* Phone */}
                {contact.showPhonePublicly && contact.phone ? (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <a
                      href={`tel:${contact.phone}`}
                      className="inline-flex items-center gap-3 border border-line px-4 py-3 font-mono text-xs tracking-wider text-ink transition-all duration-200 hover:border-accent/50 hover:bg-accent-soft hover:text-accent"
                    >
                      <Phone
                        className="size-4 text-accent"
                        aria-hidden="true"
                      />
                      {contact.phone}
                    </a>

                    <span className="font-mono text-[9px] tracking-[0.22em] text-ink-faint">
                      MOBILE — CALLS &amp; TEXT
                    </span>
                  </div>
                ) : (
                  <p className="mt-5 font-mono text-[9px] tracking-[0.22em] text-ink-faint/80">
                    {"// PHONE INTENTIONALLY NOT DISPLAYED PUBLICLY"}
                  </p>
                )}
              </div>
            </div>

            {/* Availability */}
            <div className="border border-ok/25 bg-ok/[0.04] p-5 sm:p-6">
              <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.28em] text-ok">
                <span
                  aria-hidden="true"
                  className="inline-block size-1.5 rounded-full bg-ok animate-pulse-dot"
                />
                STATUS: OPEN TO OPPORTUNITIES
              </p>

              <p className="mt-2.5 max-w-xl text-[13px] leading-relaxed text-ink-dim">
                Backend engineering roles and deep-dive conversations about
                distributed systems, microservices, and event-driven
                architecture — plus where AI agents fit into tomorrow&apos;s
                backends.
              </p>
            </div>

            {/* Response protocol */}
            <div className="border border-line bg-surface-2/50 p-5 font-mono text-[10px] leading-relaxed tracking-[0.16em] text-ink-faint sm:p-6">
              <p className="text-ink-dim">PROTOCOL:</p>

              <ol className="mt-2 space-y-1.5">
                <li>01 — YOU REACH OUT WITH A ROLE OR PROBLEM</li>
                <li>02 — WE TALK ARCHITECTURE, TRADE-OFFS, FIT</li>
                <li>03 — WE BUILD SOMETHING SCALABLE</li>
              </ol>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}