"use client";

import { useState, type FormEvent } from "react";
import { Check, Copy, Mail, Phone, Send } from "lucide-react";
import { SectionShell } from "@/components/portfolio/section-shell";
import { Reveal } from "@/components/ui/reveal";
import { SocialLinks } from "@/components/portfolio/social-links";
import { contact, profile } from "@/lib/portfolio-data";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
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

        {/* =====================================================
            TRANSMISSION FORM
        ====================================================== */}
        <Reveal delay={0.06}>
          <form
            onSubmit={onSubmit}
            aria-label="Contact form"
            className="panel corner-brackets relative h-full overflow-hidden p-6 sm:p-7"
          >
            {/* subtle form glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-32 -right-24 size-72 rounded-full bg-accent/[0.025] blur-3xl"
            />

            <div className="relative">
              <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">
                TRANSMISSION FORM
              </p>

              <p className="mt-2 max-w-lg text-[12px] leading-relaxed text-ink-faint">
                Send a role, project, architecture problem, or just say hello.
              </p>

              <div className="mt-6 space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] text-ink-dim"
                  >
                    NAME *
                  </label>

                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Ada Lovelace"
                    className="w-full border border-line bg-background/70 px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-faint/70 transition-colors hover:border-line-strong focus:border-accent/60 focus:bg-background focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] text-ink-dim"
                  >
                    EMAIL *
                  </label>

                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    className="w-full border border-line bg-background/70 px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-faint/70 transition-colors hover:border-line-strong focus:border-accent/60 focus:bg-background focus:outline-none"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] text-ink-dim"
                  >
                    MESSAGE *
                  </label>

                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={6}
                    placeholder="Tell me about the system you're building…"
                    className="w-full resize-y border border-line bg-background/70 px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-faint/70 transition-colors hover:border-line-strong focus:border-accent/60 focus:bg-background focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-accent px-6 py-3.5 font-mono text-xs font-bold tracking-[0.25em] text-background transition-all duration-200 hover:bg-cyan-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.3)] focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 active:translate-y-px"
              >
                <Send className="size-4" aria-hidden="true" />
                TRANSMIT MESSAGE
              </button>

              {/* Phase 1 notice */}
              <div aria-live="polite" aria-atomic="true">
                {submitted && (
                  <div className="mt-4 border border-warn/35 bg-warn/[0.06] p-4">
                    <p className="font-mono text-[10px] leading-relaxed tracking-[0.14em] text-warn">
                      <span aria-hidden="true">▲ </span>
                      NOTE — THIS FORM IS FRONTEND-ONLY IN PHASE 1 (NO EMAIL
                      BACKEND YET). PLEASE EMAIL ME DIRECTLY AT{" "}
                      <a
                        href={`mailto:${profile.email}`}
                        className="break-all underline underline-offset-2 transition-colors hover:text-ink"
                      >
                        {profile.email}
                      </a>{" "}
                      AND I&apos;LL GET BACK TO YOU.
                    </p>
                  </div>
                )}
              </div>

              <p className="mt-4 font-mono text-[9px] leading-relaxed tracking-[0.2em] text-ink-faint/80">
                {"// NO DATA LEAVES YOUR BROWSER — BACKEND DELIVERY ARRIVES IN PHASE 2"}
              </p>
            </div>
          </form>
        </Reveal>
      </div>
    </SectionShell>
  );
}