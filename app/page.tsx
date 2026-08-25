"use client";

import { ArrowUp } from "lucide-react";
import { SystemProvider, useSystem } from "@/components/providers/system-provider";
import { BootSequence } from "@/components/portfolio/boot-sequence";
import { Sidebar } from "@/components/portfolio/sidebar";
import { MobileNav } from "@/components/portfolio/mobile-nav";
import { Hero } from "@/components/portfolio/hero";
import { About } from "@/components/portfolio/about";
import { Experience } from "@/components/portfolio/experience";
import { Projects } from "@/components/portfolio/projects";
import { Skills } from "@/components/portfolio/skills";
import { Architecture } from "@/components/portfolio/architecture";
import { Education } from "@/components/portfolio/education";
import { AiLab } from "@/components/portfolio/ai-lab";
import { BeyondCode } from "@/components/portfolio/beyond-code";
import { Contact } from "@/components/portfolio/contact";
import { profile } from "@/lib/portfolio-data";

function Footer() {
  const { scrollToSection } = useSystem();
  return (
    <footer className="border-t border-line bg-surface/60">
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 px-5 py-8 sm:px-8">
        <div>
          <p className="font-display text-sm font-bold tracking-[0.14em] text-ink">
            {profile.firstName}
            <span className="text-accent">{"//SYSTEM"}</span>
          </p>
          <p className="mt-1 font-mono text-[9px] tracking-[0.22em] text-ink-faint">
            DESIGNED & ENGINEERED BY {profile.name.toUpperCase()} — JAVA BACKEND DEVELOPER
          </p>
        </div>
        <div className="flex items-center gap-6">
          <p className="hidden font-mono text-[9px] leading-relaxed tracking-[0.2em] text-ink-faint sm:block">
            SPRING BOOT · KAFKA · POSTGRESQL · AWS<br />
            EXPLORING: LLM · RAG · AGENTIC SYSTEMS
          </p>
          <button
            onClick={() => scrollToSection("home")}
            aria-label="Back to top"
            className="inline-flex size-10 items-center justify-center border border-line text-ink-dim transition-colors hover:border-accent/50 hover:text-accent"
          >
            <ArrowUp className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <SystemProvider>
      {/* Keyboard users: jump straight past navigation into the content. */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:inline-flex focus:items-center focus:border focus:border-accent/60 focus:bg-accent focus:px-4 focus:py-2.5 focus:font-mono focus:text-xs focus:font-bold focus:tracking-[0.22em] focus:text-background"
      >
        SKIP TO CONTENT →
      </a>

      <BootSequence />
      <Sidebar />
      <MobileNav />

      <div className="relative lg:pl-[264px]">
        <main id="content" tabIndex={-1}>
          <Hero />
          <About />
          <Experience />
          <Projects />
          <Skills />
          <Architecture />
          <Education />
          <AiLab />
          <BeyondCode />
          <Contact />
        </main>
        <Footer />
      </div>
    </SystemProvider>
  );
}
