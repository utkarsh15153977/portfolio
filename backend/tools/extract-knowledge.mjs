// ---------------------------------------------------------------------------
// Portfolio knowledge extractor (Phase 4.2 tooling)
//
// Transforms the frontend's single source of truth (lib/portfolio-data.ts,
// compiled to CommonJS) into the backend knowledge file consumed by the RAG
// ingestion pipeline. This keeps backend knowledge DERIVED from the portfolio
// data instead of hand-duplicated.
//
// Regenerate after portfolio content changes:
//   1) npx tsc lib/portfolio-data.ts --module commonjs --target es2019 ^
//        --outDir backend/tools/.compiled --skipLibCheck     (repo root)
//   2) node backend/tools/extract-knowledge.mjs backend/tools/.compiled/portfolio-data.js
// ---------------------------------------------------------------------------

import { writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const compiledPath = resolve(process.argv[2] ?? "../tools/.compiled/portfolio-data.js");
const outputPath = resolve(__dirname, "../src/main/resources/knowledge/portfolio-knowledge.json");

const d = createRequire(import.meta.url)(compiledPath);

const item = (key, title, lines, tags) => ({
  key,
  title,
  lines: (lines ?? []).map(String),
  ...(tags && tags.length > 0 ? { tags: tags.map(String) } : {}),
});

const section = (id, title, items) => ({ section: id, title, items });

const sections = [
  // ABOUT -------------------------------------------------------------------
  section("about", "ABOUT", [
    item("profile", "PROFILE", [
      `${d.profile.name} - ${d.profile.role}, ${d.profile.experienceYears} experience, ${d.profile.location}.`,
      d.profile.statement,
    ]),
    ...d.focusAreas.map((f) =>
      item(`focus-${f.title.toLowerCase().replace(/[^a-z]+/g, "-")}`, `FOCUS: ${f.title.toUpperCase()}`, [f.detail])
    ),
    item("currently-exploring", "CURRENTLY EXPLORING (NOT PRODUCTION)", [...d.currentlyExploring]),
  ]),

  // EXPERIENCE ---------------------------------------------------------------
  section("experience", "EXPERIENCE", [
    item("overview", `${d.experience.company} (${d.experience.parent})`, [
      `${d.experience.role}, ${d.experience.period}, ${d.experience.location}.`,
      d.experience.summary,
      ...d.experience.highlights,
    ], d.experience.domains.flatMap((x) => x.tech)),
    ...d.experience.domains.map((dom) =>
      item(`domain-${dom.key}`, dom.label, dom.points, dom.tech)
    ),
  ]),

  // PROJECTS -----------------------------------------------------------------
  section("projects", "PROJECTS", [
    item("chat-summary", d.chatProject.title, [
      d.chatProject.subtitle,
      `Flagship engineering case study. Stack: ${d.chatProject.stack.join(", ")}.`,
      `Capabilities include: ${d.chatProject.capabilities.slice(0, 9).join(", ")}.`,
    ]),
    ...d.chatProject.chapters.map((ch) =>
      item(`chat-${ch.key}`, `CASE STUDY: ${ch.heading}`, ch.body, ch.tech)
    ),
    ...d.githubRepos.map((r) =>
      item(`repo-${r.key}`, r.name, [r.tagline, r.description], r.tech)
    ),
  ]),

  // SKILLS -------------------------------------------------------------------
  section("skills", "SKILLS", [
    ...d.skillCategories.map((c) =>
      item(
        `skills-${c.key}`,
        `SKILLS: ${c.title}${c.note ? ` (${c.note})` : ""}`,
        [`${c.title}: ${c.skills.join(", ")}. Tone: ${c.tone === "production" ? "production experience" : "exploring, not production yet"}.`],
        c.skills
      )
    ),
    item("engineering-practices", "ENGINEERING PRACTICES", [...d.engineeringPractices]),
  ]),

  // ARCHITECTURE -------------------------------------------------------------
  section("architecture", "ARCHITECTURE", [
    ...d.architectureDiagrams.map((diag) =>
      item(
        `diagram-${diag.key}`,
        `ARCHITECTURE: ${diag.tab}`,
        [diag.blurb, `Layers: ${diag.layers.join(" -> ")}.`, diag.exploring ? "Exploration target, not shipped work." : ""].filter(Boolean),
        []
      )
    ),
  ]),

  // EDUCATION ------------------------------------------------------------------
  section("education", "EDUCATION", [
    item("degree", d.education.degree, [
      `${d.education.institution} (${d.education.short}), ${d.education.period}, ${d.education.location}.`,
      `Relevant coursework: ${d.education.coursework.join(", ")}.`,
    ]),
  ]),

  // AI LAB ---------------------------------------------------------------------
  section("ai-lab", "AI LAB", [
    ...d.aiExperiments.map((e) =>
      item(`experiment-${e.key}`, `AI LAB: ${e.title}`, [
        `Status: ${e.status}. ${e.description}`,
        e.status === "FUTURE DIRECTION" || e.status === "EXPLORING"
          ? "This is exploration or future direction - NOT professional production AI experience."
          : "",
      ].filter(Boolean), e.tags)
    ),
    item("bridge", "JAVA BACKEND TO AI BRIDGE", [
      `Production foundation: ${d.aiBridge.foundation.join(", ")}. Exploration targets: ${d.aiBridge.target.join(", ")}.`,
      d.aiBridge.statement,
    ]),
    item("disclaimer", "AI DISCLAIMER", [d.aiDisclaimer]),
    item("planned-architecture", "PLANNED AI ARCHITECTURE (NOT IMPLEMENTED)", [
      d.plannedAiDiagram.title,
      d.plannedAiDiagram.blurb,
      "Nothing beyond the local demo console is implemented yet.",
    ]),
  ]),

  // BEYOND CODE ----------------------------------------------------------------
  section("beyond-code", "BEYOND CODE", [
    ...d.interests.map((i) =>
      item(`interest-${i.key}`, i.title, i.placeholder ? ["(portfolio placeholder - not filled in yet)"] : i.lines)
    ),
  ]),
];

const knowledge = {
  generatedFrom: "lib/portfolio-data.ts",
  note: "Generated by backend/tools/extract-knowledge.mjs - do not hand-edit.",
  sections,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(knowledge, null, 2) + "\n", "utf8");

const total = sections.reduce((n, s) => n + s.items.length, 0);
console.log(`Wrote ${outputPath}`);
console.log(`Sections: ${sections.length}, knowledge chunks: ${total}`);
