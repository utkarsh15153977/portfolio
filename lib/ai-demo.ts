// ---------------------------------------------------------------------------
// UTKARSH AI — local demo knowledge engine (Phase 3, frontend only)
//
// Responses are matched against predefined topics and composed EXCLUSIVELY
// from portfolio data structures. No network calls. No LLM. Phase 4 will
// replace this module with the Spring AI / RAG backend.
// ---------------------------------------------------------------------------

import { chatProject, experience, skillCategories } from "@/lib/portfolio-data";

export interface DemoReply {
  title: string;
  tag: string;
  lines: string[];
}

const workDomain = (key: string) =>
  experience.domains.find((d) => d.key === key);

const chatChapter = (key: string) =>
  chatProject.chapters.find((c) => c.key === key);

function stackSummaryLines(): string[] {
  return skillCategories
    .filter((c) => c.tone === "production")
    .map((c) => `${c.title}: ${c.skills.join(" · ")}`);
}

interface KnowledgeEntry {
  key: string;
  keywords: string[];
  reply: DemoReply;
}

const KNOWLEDGE: KnowledgeEntry[] = [
  {
    key: "experience",
    keywords: [
      "experience", "edgeverve", "infosys", "work", "career", "job",
      "banking", "professional", "company", "employment", "background",
    ],
    reply: {
      title: "BACKEND EXPERIENCE — EDGEVERVE SYSTEMS",
      tag: "SOURCE: EXPERIENCE // PORTFOLIO DATA",
      lines: [
        `${experience.company} (${experience.parent}) — ${experience.role}, ${experience.period}, ${experience.location}.`,
        experience.domains[0].points[0],
        experience.domains[1].points[0],
        `${experience.domains[3].points[0]} ${experience.domains[2].points[0]}`,
        experience.highlights[0] + ".",
        [
          experience.domains[6].points[0].replace("Integrated AWS CloudWatch for ", "AWS CloudWatch for "),
          `Docker + Kubernetes for scalable, zero-downtime deployments; CI/CD automated with Jenkins.`,
        ].join(" "),
      ],
    },
  },
  {
    key: "chat-architecture",
    keywords: ["chat architecture", "architecture of", "chat system architecture", "topology", "design of the chat"],
    reply: {
      title: "CHAT ARCHITECTURE — FOUR LAYERS",
      tag: "SOURCE: PROJECT CASE STUDY // PORTFOLIO DATA",
      lines: [
        "Clients connect over persistent WebSockets to the Chat Service (Spring Boot) — push-based delivery, no polling.",
        "Messages are acknowledged fast, then published to Kafka — decoupling ingestion from delivery.",
        "Event processing applies retries and failure handling, persists every message to PostgreSQL and serves hot reads from Redis.",
        "Media lands in AWS S3, logs stream to CloudWatch, and everything ships as Docker containers on Kubernetes.",
      ],
    },
  },
  {
    key: "kafka",
    keywords: ["kafka", "event-driven", "events", "broker", "async", "asynchronous", "messaging"],
    reply: {
      title: "KAFKA — TWO CONTEXTS",
      tag: "SOURCE: EXPERIENCE + PROJECT // PORTFOLIO DATA",
      lines: [
        `At ${experience.company}: ${workDomain("event-driven")?.points[0]?.replace(/^Built /, "built ") ?? "built Kafka-based event-driven systems."}`,
        "In the chat project: Kafka sits between WebSocket ingestion and message processing — absorbing bursts so a slow or restarting consumer never blocks live delivery.",
        "The pattern in both cases: decouple acknowledgment from processing, then retry failed work instead of dropping it.",
      ],
    },
  },
  {
    key: "aws",
    keywords: ["aws", "s3", "cloudwatch", "glue", "athena", "cloud"],
    reply: {
      title: "AWS — STORAGE, OBSERVABILITY, ANALYTICS",
      tag: "SOURCE: EXPERIENCE // PORTFOLIO DATA",
      lines: [
        "S3 — durable storage for data and media, kept off service instances.",
        "CloudWatch — centralized logging and monitoring across containers, reducing incident resolution time.",
        "Glue + Athena — cataloguing and efficient querying of large datasets for analysis.",
      ],
    },
  },
  {
    key: "chat-system",
    keywords: ["explain the chat", "chat system", "chat application", "real-time chat", "whatsapp", "messaging system", "flagship"],
    reply: {
      title: "REAL-TIME CHAT APPLICATION — OVERVIEW",
      tag: "SOURCE: FLAGSHIP CASE STUDY // PORTFOLIO DATA",
      lines: [
        `${chatProject.subtitle}. Stack: ${chatProject.stack.join(", ")}.`,
        chatChapter("realtime")?.body[0] ?? "",
        chatChapter("events")?.body[0] ?? "",
        chatChapter("reliability")?.body[1] ?? "",
        `Performance result: reduced API response time and improved throughput using caching and efficient data access patterns.`,
        `Testing: JUnit + Mockito unit tests; Postman for end-to-end API validation.`,
      ],
    },
  },
  {
    key: "stack",
    keywords: ["stack", "technologies", "technology", "tools", "skills", "languages", "frameworks", "database", "databases"],
    reply: {
      title: "TECHNOLOGY STACK — PRODUCTION TODAY",
      tag: "SOURCE: SKILLS // PORTFOLIO DATA",
      lines: stackSummaryLines(),
    },
  },
];

export const FALLBACK_REPLY: DemoReply = {
  title: "OUTSIDE DEMO SCOPE",
  tag: "LOCAL MATCHER // NO LLM CONNECTED",
  lines: [
    "This demo answers only from portfolio knowledge — no language model is connected yet.",
    "Try one of the quick queries below: experience, chat architecture, Kafka, AWS, the chat system, or my technology stack.",
  ],
};

/** Simple keyword-overlap matcher over the local knowledge base. */
export function matchReply(query: string): DemoReply {
  const q = query.toLowerCase().trim();
  if (!q) return FALLBACK_REPLY;

  let best: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (q.includes(kw)) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return best?.reply ?? FALLBACK_REPLY;
}
