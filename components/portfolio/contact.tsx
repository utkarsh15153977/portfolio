"use client";

import { useState, type FormEvent } from "react";
import { Check, Copy, Mail, Phone, Send } from "lucide-react";
import { SectionShell } from "@/components/portfolio/section-shell";
import { Reveal } from "@/components/ui/reveal";
import { contact, profile } from "@/lib/portfolio-data";
import { SocialLinks } from "@/components/portfolio/social-links";

export function Contact() {
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
        {/* direct channels */}
        <Reveal>
          <div className="flex h-full flex-col gap-5">
            <div className="panel corner-brackets p-6 sm:p-7">
              <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">
                DIRECT CHANNEL
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${profile.email}`}
                  className="group inline-flex min-w-0 items-center gap-3 border border-accent/40 bg-accent-soft px-4 py-3 transition-colors hover:border-accent"
                >
                  <Mail className="size-4 shrink-0 text-accent" aria-hidden />
                  <span className="truncate font-mono text-xs tracking-wider text-accent sm:text-sm">
                    {profile.email}
                  </span>
                </a>
                <button
                  onClick={copyEmail}
                  aria-label="Copy email address to clipboard"
                  className="inline-flex size-11 items-center justify-center border border-line text-ink-dim transition-colors hover:border-accent/50 hover:text-accent"
                >
                  {copied ? <Check className="size-4 text-ok" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                </button>
              </div>
              {copied && (
                <p aria-live="polite" className="mt-2 font-mono text-[10px] tracking-[0.2em] text-ok">
                  COPIED TO CLIPBOARD
                </p>
              )}

              <div className="mt-6 border-t border-line pt-5">
                <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">ELSEWHERE</p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <SocialLinks variant="row" />
                  <p className="font-mono text-[10px] tracking-[0.2em] text-ink-faint/85">
                    RESUME: /RESUME.PDF
                  </p>
                </div>
              </div>

              {contact.showPhonePublicly && contact.phone ? (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <a
                    href={`tel:${contact.phone}`}
                    className="inline-flex items-center gap-3 border border-line px-4 py-3 font-mono text-xs tracking-wider text-ink transition-colors hover:border-accent/50 hover:text-accent"
                  >
                    <Phone className="size-4 text-accent" aria-hidden />
                    {contact.phone}
                  </a>
                  <span className="font-mono text-[9px] tracking-[0.22em] text-ink-faint">
                    MOBILE — CALLS & TEXT
                  </span>
                </div>
              ) : (
                <p className="mt-5 font-mono text-[9px] tracking-[0.22em] text-ink-faint/80">
                  {"// PHONE INTENTIONALLY NOT DISPLAYED PUBLICLY"}
                </p>
              )}
            </div>

            {/* availability */}
            <div className="border border-ok/25 bg-ok/[0.04] p-5 sm:p-6">
              <p className="flex items-center gap-2 font-mono text-[10px] tracking-[0.28em] text-ok">
                <span className="animate-pulse-dot inline-block size-1.5 rounded-full bg-ok" aria-hidden />
                STATUS: OPEN TO OPPORTUNITIES
              </p>
              <p className="mt-2.5 text-[13px] leading-relaxed text-ink-dim">
                Backend engineering roles and deep-dive conversations about distributed systems,
                microservices and event-driven architecture — plus where AI agents fit into
                tomorrow&apos;s backends.
              </p>
            </div>

            {/* response protocol */}
            <div className="border border-line bg-surface-2/50 p-5 font-mono text-[10px] leading-relaxed tracking-[0.16em] text-ink-faint sm:p-6">
              <p>PROTOCOL:</p>
              <p className="mt-1.5">01 — YOU REACH OUT WITH A ROLE OR PROBLEM</p>
              <p className="mt-1">02 — WE TALK ARCHITECTURE, TRADE-OFFS, FIT</p>
              <p className="mt-1">03 — WE BUILD SOMETHING SCALABLE</p>
            </div>
          </div>
        </Reveal>

        {/* form */}
        <Reveal delay={0.06}>
          <form
            onSubmit={onSubmit}
            aria-label="Contact form"
            className="panel relative h-full p-6 sm:p-7"
          >
            <p className="font-mono text-[9px] tracking-[0.3em] text-ink-faint">
              TRANSMISSION FORM
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="contact-name" className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] text-ink-dim">
                  NAME *
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                  className="w-full border border-line bg-background/70 px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-faint/85 focus:border-accent/60 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] text-ink-dim">
                  EMAIL *
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="w-full border border-line bg-background/70 px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-faint/85 focus:border-accent/60 focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-1.5 block font-mono text-[10px] tracking-[0.25em] text-ink-dim">
                  MESSAGE *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Tell me about the system you're building…"
                  className="w-full resize-y border border-line bg-background/70 px-4 py-3 font-mono text-sm text-ink placeholder:text-ink-faint/85 focus:border-accent/60 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-accent px-6 py-3.5 font-mono text-xs font-bold tracking-[0.25em] text-background transition-all hover:bg-cyan-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.3)]"
            >
              <Send className="size-4" aria-hidden />
              TRANSMIT MESSAGE
            </button>

            <div aria-live="polite">
              {submitted && (
                <div className="mt-4 border border-warn/35 bg-warn/[0.06] p-4">
                  <p className="font-mono text-[10px] leading-relaxed tracking-[0.14em] text-warn">
                    ▲ NOTE — THIS FORM IS FRONTEND-ONLY IN PHASE 1 (NO EMAIL BACKEND YET).
                    PLEASE EMAIL ME DIRECTLY AT{" "}
                    <a href={`mailto:${profile.email}`} className="underline underline-offset-2">
                      {profile.email}
                    </a>{" "}
                    AND I&apos;LL GET BACK TO YOU.
                  </p>
                </div>
              )}
            </div>

            <p className="mt-4 font-mono text-[9px] tracking-[0.2em] text-ink-faint/80">
              {"// NO DATA LEAVES YOUR BROWSER — BACKEND DELIVERY ARRIVES IN PHASE 2"}
            </p>
          </form>
        </Reveal>
      </div>
    </SectionShell>
  );
}
