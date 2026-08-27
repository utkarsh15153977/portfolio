// ============================================================================
// UTKARSH // SYSTEM — single source of truth for all portfolio content.
// Phase 2 (AI/RAG) will read from this module. Do not duplicate this data
// inside components.
// ============================================================================

export type SectionId =
  | "home"
  | "about"
  | "experience"
  | "projects"
  | "skills"
  | "architecture"
  | "education"
  | "ai-lab"
  | "beyond-code"
  | "contact";

export const profile = {
  name: "Utkarsh Singh",
  firstName: "UTKARSH",
  role: "Java Backend Developer",
  experienceYears: "3+ YEARS",
  tagline: "BUILDING SCALABLE SYSTEMS",
  aiLine: "EXPLORING INTELLIGENT SYSTEMS",
  statement:
    "Building scalable backend systems with Java, Spring Boot, microservices and event-driven architectures — while exploring the next generation of intelligent systems.",
  location: "Bangalore, India",
  email: "utkarsh20001997@gmail.com",
  systemName: "UTKARSH.DEVELOPER",
  systemVersion: "v1.0.0",
} as const;

export const socialLinks = [
  {
    label: "GitHub",
    url: "https://github.com/utkarsh15153977",
    handle: "@utkarsh15153977",
    placeholder: false,
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/utkarsh-singh-5a45851b4/",
    handle: "in/utkarsh-singh-5a45851b4",
    placeholder: false,
  },
] as const;

export const githubProfileUrl = "https://github.com/utkarsh15153977";

export const resumeUrl = "/resume.pdf"; // TODO: drop resume file into /public

export const navSections: { id: SectionId; index: string; label: string }[] = [
  { id: "home", index: "01", label: "HOME" },
  { id: "about", index: "02", label: "ABOUT" },
  { id: "experience", index: "03", label: "EXPERIENCE" },
  { id: "projects", index: "04", label: "PROJECTS" },
  { id: "skills", index: "05", label: "SKILLS" },
  { id: "architecture", index: "06", label: "ARCHITECTURE" },
  { id: "education", index: "07", label: "EDUCATION" },
  { id: "ai-lab", index: "08", label: "AI LAB" },
  { id: "beyond-code", index: "09", label: "BEYOND CODE" },
  { id: "contact", index: "10", label: "CONTACT" },
];

export const heroTechLine = [
  "JAVA",
  "SPRING BOOT",
  "MICROSERVICES",
  "KAFKA",
  "AWS",
  "DISTRIBUTED SYSTEMS",
  "AI",
] as const;

// ---------------------------------------------------------------------------
// BOOT SEQUENCE
// ---------------------------------------------------------------------------

export const bootSequence = {
  coreSystems: [
    { name: "JAVA RUNTIME", status: "ONLINE" },
    { name: "SPRING BOOT", status: "ONLINE" },
    { name: "MICROSERVICES", status: "ONLINE" },
    { name: "KAFKA", status: "ONLINE" },
    { name: "POSTGRESQL", status: "ONLINE" },
    { name: "REDIS", status: "ONLINE" },
    { name: "AWS", status: "ONLINE" },
  ],
  intelligenceLayer: [
    { name: "LLM CORE", status: "EXPLORING" },
    { name: "RAG ENGINE", status: "EXPERIMENT" },
    { name: "AI AGENTS", status: "EXPLORING" },
  ],
} as const;

// ---------------------------------------------------------------------------
// ABOUT
// ---------------------------------------------------------------------------

export const focusAreas = [
  {
    title: "Backend Engineering",
    detail:
      "Core services in Java & Spring Boot — account management, transaction processing, REST APIs.",
  },
  {
    title: "Microservices",
    detail:
      "Service discovery and inter-service communication with Spring Cloud.",
  },
  {
    title: "Distributed Systems",
    detail:
      "Resilience patterns, fault tolerance and consistency across services.",
  },
  {
    title: "Event-Driven Architecture",
    detail:
      "Kafka-based asynchronous pipelines for real-time processing.",
  },
  {
    title: "Cloud",
    detail:
      "AWS storage, analytics and observability — S3, Glue, Athena, CloudWatch.",
  },
  {
    title: "System Design",
    detail:
      "Designing for scale: caching, persistence, deployment and delivery.",
  },
] as const;

export const currentlyExploring = ["AI", "LLMs", "RAG", "Agentic AI"] as const;

// ---------------------------------------------------------------------------
// EXPERIENCE
// ---------------------------------------------------------------------------

export interface ExperienceDomain {
  key: string;
  label: string;
  points: string[];
  tech: string[];
}

export const experience = {
  company: "EdgeVerve Systems",
  parent: "An Infosys Company",
  role: "Product Developer",
  period: "09/2022 — 08/2025",
  start: "09/2022",
  end: "08/2025",
  location: "Electronic City, Bangalore",
  summary:
    "Core banking microservices — building and operating scalable, event-driven backend systems in production.",
  highlights: [
    "Reduced PostgreSQL query latency by 30% through query optimization and indexing",
    "Zero-downtime deployments on Kubernetes with Docker-containerized services",
    "Real-time transaction processing over Kafka-based event-driven systems",
  ],
  domains: [
    {
      key: "core-banking",
      label: "CORE BANKING",
      points: [
        "Developed and maintained core banking microservices for account management and transaction processing using Spring Boot and REST APIs.",
      ],
      tech: ["Java", "Spring Boot", "REST APIs"],
    },
    {
      key: "microservices",
      label: "MICROSERVICES",
      points: [
        "Designed scalable microservices architecture with service discovery and inter-service communication using Spring Cloud.",
      ],
      tech: ["Spring Cloud", "Spring MVC", "Microservices"],
    },
    {
      key: "event-driven",
      label: "EVENT-DRIVEN SYSTEMS",
      points: [
        "Built Kafka-based event-driven systems for real-time transaction processing and asynchronous communication.",
      ],
      tech: ["Kafka", "Event-Driven Architecture"],
    },
    {
      key: "security",
      label: "SECURITY",
      points: [
        "Implemented secure authentication and authorization using Spring Security and JWT.",
      ],
      tech: ["Spring Security", "JWT"],
    },
    {
      key: "database",
      label: "DATABASE OPTIMIZATION",
      points: [
        "Optimized PostgreSQL queries and indexing, reducing latency by 30% and improving system throughput.",
      ],
      tech: ["PostgreSQL", "Indexing", "Hibernate / JPA"],
    },
    {
      key: "resilience",
      label: "RESILIENCE",
      points: [
        "Implemented resilience patterns including circuit breaker and retries using Resilience4j to improve fault tolerance and system stability.",
      ],
      tech: ["Resilience4j", "Circuit Breaker", "Retry Patterns"],
    },
    {
      key: "cloud",
      label: "CLOUD",
      points: [
        "Integrated AWS CloudWatch for centralized logging and monitoring, improving debugging and reducing incident resolution time.",
        "Utilized AWS S3, Glue, and Athena for data storage and analysis, enabling efficient querying of large datasets.",
      ],
      tech: ["CloudWatch", "S3", "Glue", "Athena"],
    },
    {
      key: "devops",
      label: "DEVOPS",
      points: [
        "Containerized services using Docker and deployed on Kubernetes, enabling scalable and zero-downtime deployments.",
        "Automated CI/CD pipelines using Maven, Git, and Jenkins for faster and reliable releases.",
      ],
      tech: ["Docker", "Kubernetes", "Jenkins", "Maven", "Git"],
    },
  ] as ExperienceDomain[],
} as const;

// ---------------------------------------------------------------------------
// EXPERIENCE — technical progression (storytelling device, NOT a chronology)
// ---------------------------------------------------------------------------

export interface TechProgressionNode {
  key: string;
  label: string;
  detail: string;
}

export const techProgression: TechProgressionNode[] = [
  {
    key: "spring-boot",
    label: "SPRING BOOT",
    detail:
      "Developed and maintained core banking microservices for account management and transaction processing.",
  },
  {
    key: "rest-apis",
    label: "REST APIS",
    detail:
      "Exposed account and transaction workflows as REST endpoints on top of Spring Boot services.",
  },
  {
    key: "microservices",
    label: "MICROSERVICES",
    detail:
      "Designed a scalable microservices architecture with independently maintainable services.",
  },
  {
    key: "spring-cloud",
    label: "SPRING CLOUD",
    detail:
      "Service discovery and inter-service communication across microservices using Spring Cloud.",
  },
  {
    key: "security-jwt",
    label: "SPRING SECURITY + JWT",
    detail:
      "Secure authentication and authorization enforced through Spring Security with JWT tokens.",
  },
  {
    key: "kafka",
    label: "KAFKA",
    detail:
      "Built Kafka-based event-driven systems for real-time transaction processing and asynchronous communication.",
  },
  {
    key: "postgresql",
    label: "POSTGRESQL OPTIMIZATION",
    detail:
      "Optimized queries and indexing, reducing latency by 30% and improving system throughput.",
  },
  {
    key: "resilience4j",
    label: "RESILIENCE4J",
    detail:
      "Implemented circuit breaker and retry patterns to improve fault tolerance and system stability.",
  },
  {
    key: "aws",
    label: "AWS",
    detail:
      "Used S3, CloudWatch, Glue and Athena for storage, monitoring and data analysis.",
  },
  {
    key: "docker",
    label: "DOCKER",
    detail:
      "Containerized services using Docker for consistent, reproducible builds.",
  },
  {
    key: "kubernetes",
    label: "KUBERNETES",
    detail:
      "Deployed containerized services on Kubernetes, enabling scalable and zero-downtime deployments.",
  },
  {
    key: "jenkins-cicd",
    label: "JENKINS / CI-CD",
    detail:
      "Automated CI/CD pipelines using Maven, Git and Jenkins for faster and reliable releases.",
  },
];

// ---------------------------------------------------------------------------
// PROJECTS — engineering case study
// ---------------------------------------------------------------------------

export type CasePhase =
  | "PROBLEM"
  | "DESIGN"
  | "IMPLEMENTATION"
  | "RELIABILITY"
  | "DEPLOYMENT";

export const casePhases: readonly CasePhase[] = [
  "PROBLEM",
  "DESIGN",
  "IMPLEMENTATION",
  "RELIABILITY",
  "DEPLOYMENT",
];

export interface CaseStudyChapter {
  key: string;
  tab: string;
  phase: CasePhase;
  heading: string;
  body: string[];
  tech: string[];
}

export const chatProject = {
  id: "realtime-chat",
  index: "P-01",
  title: "REAL-TIME CHAT APPLICATION",
  subtitle: "WhatsApp-like distributed messaging system",
  kind: "FLAGSHIP PROJECT // ENGINEERING CASE STUDY",
  githubUrl: "https://github.com/utkarsh15153977/real-time-chat-application",
  stack: [
    "Spring Boot",
    "Kafka",
    "WebSockets",
    "PostgreSQL",
    "Redis",
    "AWS S3",
    "AWS CloudWatch",
    "Docker",
    "Kubernetes",
    "Spring Security",
    "JWT",
    "JUnit",
    "Mockito",
  ],
  capabilities: [
    "One-to-one messaging",
    "Group messaging",
    "Real-time communication",
    "WebSockets",
    "Kafka-based asynchronous messaging",
    "Message persistence",
    "PostgreSQL",
    "Redis caching",
    "JWT authentication",
    "Spring Security",
    "AWS S3",
    "CloudWatch",
    "Retry mechanisms",
    "Failure handling",
    "Docker",
    "Kubernetes",
    "Unit testing",
    "Integration testing",
  ],
  specSheet: [
    { k: "PROTOCOL", v: "WebSocket" },
    { k: "BROKER", v: "Kafka" },
    { k: "STORE", v: "PostgreSQL" },
    { k: "CACHE", v: "Redis" },
    { k: "MEDIA", v: "AWS S3" },
    { k: "OBSERVABILITY", v: "CloudWatch" },
    { k: "RUNTIME", v: "Docker / K8s" },
    { k: "AUTH", v: "JWT + Spring Security" },
  ],
  chapters: [
    {
      key: "problem",
      tab: "PROBLEM",
      phase: "PROBLEM",
      heading: "WHY REAL-TIME MESSAGING IS HARD",
      body: [
        "A chat system looks simple from the outside — two people sending text. Under the hood it is a distributed systems problem: messages must arrive in order, must not be lost when services restart, must survive broker failures, and must scale beyond a single server holding socket connections in memory.",
        "This project was built to answer those questions end to end: how do you deliver events in real time while still persisting them reliably? How do you decouple ingestion from delivery so a slow consumer never blocks a conversation? How do you keep history queryable and media durable without coupling them to the hot path?",
      ],
      tech: ["Distributed Systems", "Reliability", "Ordering"],
    },
    {
      key: "overview",
      tab: "OVERVIEW",
      phase: "DESIGN",
      heading: "SYSTEM AT A GLANCE",
      body: [
        "The design separates three concerns: real-time delivery over WebSockets, reliable distribution through Kafka, and durable state in PostgreSQL with Redis in front for hot reads.",
        "Clients never talk to the database. The Chat Service acknowledges ingestion quickly, Kafka absorbs traffic between ingestion and processing, and side concerns like media storage and logging live in AWS rather than inside the request path.",
      ],
      tech: ["High-Level Design", "Separation of Concerns"],
    },
    {
      key: "architecture",
      tab: "ARCHITECTURE",
      phase: "DESIGN",
      heading: "INTERACTIVE SYSTEM ARCHITECTURE",
      body: [
        "The full topology is below. Hover or click any component — the inspector explains its role, why it exists in this design, and the technology behind it.",
      ],
      tech: ["System Design", "Topology"],
    },
    {
      key: "decisions",
      tab: "DECISIONS",
      phase: "DESIGN",
      heading: "ENGINEERING DECISIONS",
      body: [
        "Why Kafka between ingress and delivery? Because decoupling acknowledgment from processing keeps the WebSocket path responsive under load and gives failed processing a second life through retries.",
        "Why Redis in front of PostgreSQL? Conversation history must be durable, but most reads hit recent messages. Serving hot conversations from cache protects the database and keeps read latency low.",
        "Why JWT? Stateless tokens scale horizontally — any service instance can validate a request without a shared session store.",
        "Why Docker + Kubernetes? Messaging workloads need elastic scaling and rolling updates; containers plus orchestration deliver zero-downtime deployments without bespoke scripts.",
      ],
      tech: ["Trade-offs", "Scalability", "Design Rationale"],
    },
    {
      key: "realtime",
      tab: "REAL-TIME",
      phase: "IMPLEMENTATION",
      heading: "WEBSOCKET DELIVERY LAYER",
      body: [
        "One-to-one and group conversations run over persistent WebSocket connections, giving clients push-based delivery instead of polling.",
        "The Chat Service owns connection lifecycle, session routing and message fan-out — keeping transport concerns out of business logic.",
      ],
      tech: ["WebSockets", "One-to-one messaging", "Group messaging"],
    },
    {
      key: "events",
      tab: "EVENTS",
      phase: "IMPLEMENTATION",
      heading: "EVENT-DRIVEN PROCESSING",
      body: [
        "Messages flow through Kafka as asynchronous events. The broker absorbs bursts and decouples the ingestion path from downstream processing, so a slow or restarting consumer never blocks a live conversation.",
        "Because delivery and processing are separate stages connected by reliable event-driven communication, each can be scaled and operated independently — the defining property of this architecture.",
      ],
      tech: ["Kafka", "Async messaging"],
    },
    {
      key: "persistence",
      tab: "DATA",
      phase: "IMPLEMENTATION",
      heading: "POSTGRESQL MESSAGE STORE",
      body: [
        "Every message is persisted to PostgreSQL, making full conversation history durable and queryable — the source of truth lives in the database, not in server memory.",
        "Persistence happens through the event pipeline, so a database slowdown degrades history writes without blocking live delivery. Reads lean on efficient data access patterns and indexing so conversation lookups stay fast as history grows.",
      ],
      tech: ["PostgreSQL", "Message persistence", "Efficient Data Access"],
    },
    {
      key: "caching",
      tab: "CACHING",
      phase: "IMPLEMENTATION",
      heading: "REDIS HOT LAYER",
      body: [
        "Redis sits in front of the database as the caching layer for hot reads — recent conversations and frequently accessed state are served from cache instead of hitting PostgreSQL on every request.",
        "This reduces database load and improves message fetch latency as conversation volume grows.",
      ],
      tech: ["Redis", "Caching"],
    },
    {
      key: "security",
      tab: "SECURITY",
      phase: "IMPLEMENTATION",
      heading: "JWT + SPRING SECURITY",
      body: [
        "Every connection and API request is authenticated with JWT tokens, enforced through Spring Security's filter chain.",
        "Authorization rules ensure users can only access the conversations they belong to — sockets included.",
      ],
      tech: ["Spring Security", "JWT"],
    },
    {
      key: "cloud",
      tab: "AWS",
      phase: "IMPLEMENTATION",
      heading: "STORAGE & OBSERVABILITY ON AWS",
      body: [
        "Shared media — images and attachments — are stored durably in AWS S3 rather than on service instances.",
        "Logs from every container stream into AWS CloudWatch, centralizing debugging across the cluster.",
      ],
      tech: ["AWS S3", "CloudWatch"],
    },
    {
      key: "performance",
      tab: "PERFORMANCE",
      phase: "IMPLEMENTATION",
      heading: "RESPONSE TIME & THROUGHPUT",
      body: [
        "The engineering result for this project: optimized performance by reducing API response time and improving throughput using caching and efficient data access patterns.",
        "No synthetic benchmark numbers are attached to that claim — the mechanism matters more than the figure. Redis absorbs repeated reads before they reach PostgreSQL, and data access patterns are tuned so common fetches avoid unnecessary work.",
      ],
      tech: ["Caching", "Efficient Data Access"],
    },
    {
      key: "reliability",
      tab: "RELIABILITY",
      phase: "RELIABILITY",
      heading: "RETRIES & FAILURE HANDLING",
      body: [
        "In a distributed pipeline things fail partially: a consumer can crash mid-processing, the database can blip, a connection can drop between services. The system is built assuming those events will happen.",
        "Retry mechanisms re-drive failed work automatically, and failure handling around the event pipeline ensures a single failing message does not stall delivery for everyone else.",
      ],
      tech: ["Retry mechanisms", "Failure handling", "Fault tolerance"],
    },
    {
      key: "testing",
      tab: "TESTING",
      phase: "RELIABILITY",
      heading: "UNIT & INTEGRATION TESTING",
      body: [
        "Core logic is covered by unit tests written with JUnit and Mockito — mocking collaborators so behavior is verified in isolation.",
        "APIs are exercised end to end with Postman to validate request/response contracts across services.",
      ],
      tech: ["JUnit", "Mockito", "Postman"],
    },
    {
      key: "deployment",
      tab: "DEPLOYMENT",
      phase: "DEPLOYMENT",
      heading: "DOCKER + KUBERNETES",
      body: [
        "Services are packaged as Docker containers and deployed on Kubernetes, enabling horizontal scaling and rolling updates with zero downtime.",
        "If an instance dies, Kubernetes reschedules it — the messaging layer is designed so connections and events survive that churn.",
      ],
      tech: ["Docker", "Kubernetes"],
    },
  ] as CaseStudyChapter[],
} as const;

// ---------------------------------------------------------------------------
// GITHUB — selected public repositories (verified metadata only, no metrics)
// ---------------------------------------------------------------------------

export interface GithubRepo {
  key: string;
  name: string;
  url: string;
  tagline: string;
  description: string;
  tech: string[];
  primaryLanguage: string;
  badge?: string;
}

export const featuredRepo: GithubRepo = {
  key: "bizflow",
  name: "BIZFLOW",
  url: "https://github.com/utkarsh15153977/bizFlow",
  tagline: "FEATURED BUILD // MULTI-TENANT SAAS PLATFORM",
  description:
    "Multi-tenant SaaS platform for local businesses — gyms, salons, repair shops and clinics. Covers the full business loop: customers, leads and follow-ups through invoices, payments, WhatsApp notifications, staff management and reporting.",
  tech: ["Next.js", "TypeScript", "PostgreSQL", "Supabase", "Tailwind CSS"],
  primaryLanguage: "TypeScript",
};

export const githubRepos: GithubRepo[] = [
  featuredRepo,
  {
    key: "realtime-chat",
    name: "REAL-TIME CHAT APPLICATION",
    url: "https://github.com/utkarsh15153977/real-time-chat-application",
    tagline: "FLAGSHIP // DISTRIBUTED MESSAGING",
    description:
      "WhatsApp-like chat application — WebSocket delivery with a Kafka event pipeline, PostgreSQL persistence and Redis caching. Explored in depth as the case study above.",
    tech: ["Java", "Spring Boot", "Kafka", "WebSockets", "Redis", "Docker"],
    primaryLanguage: "Java",
    badge: "CASE STUDY",
  },
  {
    key: "user-management",
    name: "USER-MANAGEMENT-SYSTEM",
    url: "https://github.com/utkarsh15153977/User-Management-System",
    tagline: "REST BACKEND SERVICE",
    description:
      "Backend service exposing a REST API for managing users — built with Spring Boot and secured with Spring Security.",
    tech: ["Java", "Spring Boot", "Spring Security", "REST API"],
    primaryLanguage: "Java",
  },
  {
    key: "book-management",
    name: "BOOK-MANAGEMENT-SYSTEM",
    url: "https://github.com/utkarsh15153977/book-management-system",
    tagline: "FULL-STACK CRUD PLATFORM",
    description:
      "Book management application pairing a Java / Spring Boot backend with a React front end for browsing and managing book collections.",
    tech: ["Java", "Spring Boot", "React", "JavaScript"],
    primaryLanguage: "Java",
  },
];

// ---------------------------------------------------------------------------
// SKILLS
// ---------------------------------------------------------------------------

export type SkillCategory = {
  key: string;
  title: string;
  note?: string;
  tone: "production" | "exploring";
  skills: string[];
};

export const skillCategories: SkillCategory[] = [
  {
    key: "core",
    title: "CORE",
    tone: "production",
    skills: ["Java", "C++"],
  },
  {
    key: "backend",
    title: "BACKEND",
    tone: "production",
    skills: [
      "Spring Boot",
      "Spring MVC",
      "Spring Security",
      "Spring Cloud",
      "REST APIs",
      "Hibernate / JPA",
    ],
  },
  {
    key: "architecture-skills",
    title: "ARCHITECTURE",
    tone: "production",
    skills: [
      "Microservices",
      "Distributed Systems",
      "Event-Driven Architecture",
      "Design Patterns",
      "OOP",
      "DSA",
    ],
  },
  {
    key: "database",
    title: "DATABASE",
    tone: "production",
    skills: ["PostgreSQL", "MySQL", "Redis"],
  },
  {
    key: "messaging",
    title: "MESSAGING",
    tone: "production",
    skills: ["Kafka"],
  },
  {
    key: "aws",
    title: "AWS",
    tone: "production",
    skills: ["S3", "CloudWatch", "Glue", "Athena"],
  },
  {
    key: "devops",
    title: "DEVOPS",
    tone: "production",
    skills: ["Docker", "Kubernetes", "Jenkins", "Maven", "Git"],
  },
  {
    key: "testing",
    title: "TESTING",
    tone: "production",
    skills: ["JUnit", "Mockito", "Postman"],
  },
  {
    key: "exploring",
    title: "EXPLORING",
    note: "NOT PRODUCTION YET",
    tone: "exploring",
    skills: ["LLMs", "RAG", "AI Agents", "Agentic AI"],
  },
];

export const engineeringPractices = [
  "Circuit Breaker",
  "Retry Patterns",
  "CI/CD",
  "Agile / Scrum",
] as const;

// ---------------------------------------------------------------------------
// ARCHITECTURE EXPLORER — interactive diagrams
// ---------------------------------------------------------------------------

export type NodeKind = "client" | "compute" | "messaging" | "data" | "platform" | "ai";

export interface DiagNode {
  id: string;
  label: string;
  sub?: string;
  desc: string;
  /** Structured inspector fields — fall back to `desc` when absent. */
  role?: string;
  why?: string;
  tech?: string;
  /** Optional lifecycle chip rendered in the inspector header (free-form). */
  status?: string;
  /** Overrides the "WHY IT EXISTS" inspector row label (e.g. "FUTURE PURPOSE"). */
  inspectorWhyLabel?: string;
  kind: NodeKind;
  layer: number;
  col: number;
  colSpan?: number;
  exploring?: boolean;
}

export interface DiagEdge {
  from: string;
  to: string;
}

export interface ArchitectureDiagram {
  key: string;
  tab: string;
  title: string;
  blurb: string;
  layers: string[];
  nodes: DiagNode[];
  edges: DiagEdge[];
  exploring?: boolean;
}

const CHAT_NODES: DiagNode[] = [
  {
    id: "users", label: "USERS", desc: "Web and mobile clients holding persistent WebSocket sessions.",
    role: "Message entry point",
    why: "Conversations start here — clients hold open WebSocket sessions instead of polling for updates.",
    tech: "WebSocket clients",
    kind: "client", layer: 0, col: 1,
  },
  {
    id: "ws", label: "WEBSOCKET", sub: "persistent channel", desc: "Push-based real-time transport between clients and the Chat Service — no polling.",
    role: "Real-time transport",
    why: "A persistent channel carries messages in both directions the moment they are sent, instead of relying on request/response polling.",
    tech: "WebSockets",
    kind: "compute", layer: 1, col: 1,
  },
  {
    id: "chat", label: "CHAT SERVICE", sub: "spring boot", desc: "Owns connection lifecycle, routing, fan-out and validation. Acknowledges ingestion before downstream work completes.",
    role: "Ingress & routing",
    why: "Acknowledges ingestion quickly, owns session routing and fan-out, and keeps transport concerns out of business logic.",
    tech: "Spring Boot",
    kind: "compute", layer: 2, col: 1,
  },
  {
    id: "kafka", label: "KAFKA", sub: "event bus", desc: "Event-driven messaging layer for asynchronous communication — absorbs bursts and decouples delivery from processing.",
    role: "Asynchronous event processing",
    why: "Decouples messaging workflows and supports event-driven communication.",
    tech: "Apache Kafka",
    kind: "messaging", layer: 3, col: 0,
  },
  {
    id: "proc", label: "MESSAGE PROCESSING", sub: "async consumers", desc: "Consumes Kafka events, applies failure handling and retry mechanisms, then routes results to stores.",
    role: "Async consumer pipeline",
    why: "Processes events independently of ingestion, so slow or restarting consumers never block live delivery.",
    tech: "Java · Spring Boot",
    kind: "compute", layer: 4, col: 0,
  },
  {
    id: "pg", label: "POSTGRESQL", sub: "persistence", desc: "Source of truth — every message persisted as queryable conversation history.",
    role: "Source of truth",
    why: "Every message becomes durable, queryable history — persisted through the event pipeline so database slowdowns never block delivery.",
    tech: "PostgreSQL",
    kind: "data", layer: 5, col: 0,
  },
  {
    id: "redis", label: "REDIS", sub: "caching layer", desc: "Caching layer used to reduce database load and improve read performance for recent conversations.",
    role: "Caching layer",
    why: "Serves hot reads before they reach PostgreSQL — reducing database load and improving message fetch latency.",
    tech: "Redis",
    kind: "data", layer: 5, col: 1,
  },
  {
    id: "s3", label: "AWS S3", sub: "media storage", desc: "Durable storage for shared images and attachments, kept off the service instances.",
    role: "Media storage",
    why: "Images and attachments live in durable object storage rather than on service instances.",
    tech: "Amazon S3",
    kind: "data", layer: 6, col: 0,
  },
  {
    id: "cw", label: "CLOUDWATCH", sub: "monitoring · logging", desc: "Centralized logging and monitoring across all containers in the cluster.",
    role: "Monitoring & logging",
    why: "Centralized logs across containers make debugging faster and reduce incident resolution time.",
    tech: "Amazon CloudWatch",
    kind: "platform", layer: 6, col: 1,
  },
  {
    id: "k8s", label: "DOCKER · KUBERNETES", sub: "deployment layer", desc: "Every service runs as a Docker container on Kubernetes — horizontal scaling with rolling zero-downtime deployments.",
    role: "Deployment layer",
    why: "Horizontal scaling with rolling zero-downtime deployments — and failed instances are rescheduled automatically.",
    tech: "Docker · Kubernetes",
    kind: "platform", layer: 7, col: 0, colSpan: 2,
  },
];

const CHAT_EDGES: DiagEdge[] = [
  { from: "users", to: "ws" },
  { from: "ws", to: "chat" },
  { from: "chat", to: "kafka" },
  { from: "kafka", to: "proc" },
  { from: "proc", to: "pg" },
  { from: "proc", to: "redis" },
  { from: "chat", to: "s3" },
  { from: "chat", to: "cw" },
  { from: "chat", to: "k8s" },
  { from: "proc", to: "k8s" },
];

export const architectureDiagrams: ArchitectureDiagram[] = [
  {
    key: "microservices",
    tab: "MICROSERVICES",
    title: "MICROSERVICE DECOMPOSITION",
    blurb:
      "Independent services behind a gateway — discovered via Spring Cloud, hardened with Resilience4j, shipped on Kubernetes.",
    layers: ["CLIENTS", "EDGE", "SERVICES", "DATA & MESSAGING", "PLATFORM"],
    nodes: [
      { id: "client", label: "CLIENTS", desc: "Web / mobile / partner consumers calling public APIs.", kind: "client", layer: 0, col: 1 },
      { id: "gw", label: "API GATEWAY", desc: "Single entry point — routing, auth boundary and traffic policy in front of all services.", kind: "compute", layer: 1, col: 1 },
      { id: "acc", label: "ACCOUNT SVC", sub: "spring boot", desc: "Account management domain — ownership, profiles and state via REST APIs.", kind: "compute", layer: 2, col: 0 },
      { id: "txn", label: "TRANSACTION SVC", sub: "spring boot", desc: "Transaction processing domain — high-volume writes with strict correctness.", kind: "compute", layer: 2, col: 1 },
      { id: "chat", label: "CHAT SVC", sub: "spring boot", desc: "Real-time messaging domain over WebSockets.", kind: "compute", layer: 2, col: 2 },
      { id: "disc", label: "SPRING CLOUD", sub: "discovery", desc: "Service discovery and inter-service communication — services locate each other without hard-coded hosts.", kind: "messaging", layer: 3, col: 0 },
      { id: "r4j", label: "RESILIENCE4J", sub: "fault tolerance", desc: "Circuit breaker and retry patterns for improved fault tolerance under partial failure.", kind: "messaging", layer: 3, col: 1 },
      { id: "pg", label: "POSTGRESQL", desc: "Optimized queries and indexing per service — 30% latency reduction in production workloads.", kind: "data", layer: 3, col: 2 },
      { id: "redis", label: "REDIS", desc: "Caching layer used to reduce database load and improve read performance.", kind: "data", layer: 3, col: 3 },
      { id: "k8s", label: "KUBERNETES", sub: "docker · jenkins ci/cd", desc: "Containerized services with zero-downtime rolling deployments, automated via Jenkins pipelines.", kind: "platform", layer: 4, col: 1, colSpan: 2 },
    ],
    edges: [
      { from: "client", to: "gw" },
      { from: "gw", to: "acc" },
      { from: "gw", to: "txn" },
      { from: "gw", to: "chat" },
      { from: "acc", to: "disc" },
      { from: "txn", to: "disc" },
      { from: "txn", to: "r4j" },
      { from: "acc", to: "pg" },
      { from: "txn", to: "pg" },
      { from: "chat", to: "redis" },
      { from: "acc", to: "k8s" },
      { from: "txn", to: "k8s" },
      { from: "chat", to: "k8s" },
    ],
  },
  {
    key: "event-driven",
    tab: "EVENT-DRIVEN",
    title: "EVENT-DRIVEN PIPELINE",
    blurb:
      "Producers and consumers decoupled through Kafka — failures retried, analytics flowing to the AWS data stack.",
    layers: ["PRODUCERS", "BROKER", "CONSUMERS", "SINKS"],
    nodes: [
      { id: "svc", label: "CORE SERVICES", sub: "producers", desc: "Domain services emit state-change events (transactions, account updates) instead of calling each other synchronously.", kind: "compute", layer: 0, col: 1 },
      { id: "kafka", label: "KAFKA", sub: "topics · partitions", desc: "Event-driven messaging layer for asynchronous communication — ordered, durable, replayable.", kind: "messaging", layer: 1, col: 1 },
      { id: "retry", label: "RETRY HANDLING", sub: "resilience4j", desc: "Failed events are retried instead of dropped — circuit breakers stop cascading failure during outages.", kind: "messaging", layer: 2, col: 1 },
      { id: "cons", label: "CONSUMER GROUPS", sub: "async workers", desc: "Consumers process events independently — scaling and deploying without touching producers.", kind: "compute", layer: 2, col: 0 },
      { id: "pg", label: "POSTGRESQL", desc: "Processed state persisted as queryable records.", kind: "data", layer: 3, col: 0 },
      { id: "cache", label: "REDIS", desc: "Cache invalidated / warmed as events flow through.", kind: "data", layer: 3, col: 1 },
      { id: "aws", label: "AWS DATA STACK", sub: "s3 · glue · athena", desc: "Events landed to S3 and catalogued with Glue, enabling efficient querying of large datasets with Athena.", kind: "data", layer: 3, col: 2 },
    ],
    edges: [
      { from: "svc", to: "kafka" },
      { from: "kafka", to: "retry" },
      { from: "retry", to: "cons" },
      { from: "cons", to: "pg" },
      { from: "cons", to: "cache" },
      { from: "kafka", to: "aws" },
    ],
  },
  {
    key: "realtime-chat",
    tab: "REAL-TIME CHAT",
    title: "REAL-TIME CHAT PIPELINE",
    blurb: "The flagship project's architecture — WebSocket ingress, Kafka backbone, dual sinks, containerized deployment.",
    layers: ["CLIENTS", "TRANSPORT", "SERVICE", "BROKER", "PROCESSING", "STORES", "CLOUD", "DEPLOYMENT"],
    nodes: CHAT_NODES,
    edges: CHAT_EDGES,
  },
  {
    key: "scalable-api",
    tab: "SCALABLE API",
    title: "SCALABLE API PATH",
    blurb:
      "What stands between a request and the database — cache-first reads, guarded dependencies, observable everything.",
    layers: ["CLIENT", "EDGE", "API LAYER", "GUARDS", "STATE"],
    nodes: [
      { id: "client", label: "CLIENT", desc: "Callers hitting public REST endpoints.", kind: "client", layer: 0, col: 1 },
      { id: "lb", label: "LOAD BALANCER", desc: "Distributes traffic across stateless API instances.", kind: "platform", layer: 1, col: 1 },
      { id: "api", label: "REST API", sub: "spring boot mvc", desc: "Stateless Spring MVC controllers — validated, versioned contract endpoints.", kind: "compute", layer: 2, col: 1 },
      { id: "sec", label: "SPRING SECURITY", sub: "jwt authn", desc: "Token-based authentication and route-level authorization at the edge of the API.", kind: "messaging", layer: 3, col: 0 },
      { id: "cb", label: "CIRCUIT BREAKER", sub: "resilience4j", desc: "Circuit breaker and retry patterns — dependencies fail fast instead of cascading.", kind: "messaging", layer: 3, col: 1 },
      { id: "log", label: "CLOUDWATCH", desc: "Centralized logs and metrics cut incident resolution time.", kind: "platform", layer: 3, col: 2 },
      { id: "redis", label: "REDIS", desc: "Hot responses served from cache before touching the database.", kind: "data", layer: 4, col: 0 },
      { id: "pg", label: "POSTGRESQL", desc: "Indexed, query-optimized persistence — the 30% latency reduction lives here.", kind: "data", layer: 4, col: 1 },
      { id: "s3", label: "AWS DATA STACK", sub: "s3 · glue · athena", desc: "Large-dataset storage and analysis offloaded to the AWS data stack.", kind: "data", layer: 4, col: 2 },
    ],
    edges: [
      { from: "client", to: "lb" },
      { from: "lb", to: "api" },
      { from: "api", to: "sec" },
      { from: "api", to: "cb" },
      { from: "api", to: "log" },
      { from: "api", to: "redis" },
      { from: "api", to: "pg" },
      { from: "pg", to: "s3" },
    ],
  },
  {
    key: "ai-agent",
    tab: "AI AGENT — EXPLORATION",
    title: "AGENTIC BACKEND — FUTURE DIRECTION",
    blurb:
      "An exploration target, not shipped work: extending my backend foundation toward intelligent, agentic systems.",
    exploring: true,
    layers: ["USER", "AGENT", "ORCHESTRATION", "CAPABILITIES", "FOUNDATION"],
    nodes: [
      { id: "user", label: "USER", desc: "Intent in natural language instead of hard-coded API calls.", kind: "client", layer: 0, col: 1, exploring: true },
      { id: "agent", label: "AI AGENT", sub: "llm core", desc: "Currently exploring LLM-driven agents — reasoning over goals and deciding next actions.", kind: "ai", layer: 1, col: 1, exploring: true },
      { id: "orch", label: "ORCHESTRATOR", desc: "Exploration concept — planning loop that routes between retrieval, tools and memory.", kind: "ai", layer: 2, col: 1, exploring: true },
      { id: "rag", label: "RAG", desc: "Experiment track: grounding model answers in retrieved knowledge.", kind: "ai", layer: 3, col: 0, exploring: true },
      { id: "tools", label: "TOOLS", desc: "Exploration concept: typed function tools the agent can invoke.", kind: "ai", layer: 3, col: 1, exploring: true },
      { id: "mem", label: "MEMORY", desc: "Exploration concept: short- and long-term agent memory.", kind: "ai", layer: 3, col: 2, exploring: true },
      { id: "be", label: "JAVA BACKEND FOUNDATION", sub: "microservices · kafka · aws", desc: "Everything above would run on the same principles I use in production: services, events, resilience and observability.", kind: "compute", layer: 4, col: 1, colSpan: 3 },
    ],
    edges: [
      { from: "user", to: "agent" },
      { from: "agent", to: "orch" },
      { from: "orch", to: "rag" },
      { from: "orch", to: "tools" },
      { from: "orch", to: "mem" },
      { from: "rag", to: "be" },
      { from: "tools", to: "be" },
      { from: "mem", to: "be" },
    ],
  },
];

// ---------------------------------------------------------------------------
// EDUCATION
// ---------------------------------------------------------------------------

export const education = {
  degree: "B.E. COMPUTER SCIENCE AND ENGINEERING",
  institution: "Birla Institute of Technology, Mesra",
  short: "BIT MESRA",
  period: "2017 — 2021",
  start: "07/2017",
  end: "06/2021",
  location: "Ranchi, Jharkhand",
  coursework: [
    "Data Structures",
    "Algorithms",
    "Operating Systems",
    "Database Systems",
    "Web Technologies",
    "Software Engineering",
  ],
} as const;

// ---------------------------------------------------------------------------
// AI LAB — exploration only, NOT production experience
// ---------------------------------------------------------------------------

export type AiStatus = "EXPLORING" | "FUTURE DIRECTION";

export interface AiExperiment {
  key: string;
  title: string;
  status: AiStatus;
  description: string;
  tags: string[];
}

export const aiExperiments: AiExperiment[] = [
  {
    key: "llm-exploration",
    title: "LLM EXPLORATION",
    status: "EXPLORING",
    description:
      "Exploring how large language models can be integrated into backend applications.",
    tags: ["LLMs", "Backend Integration"],
  },
  {
    key: "rag",
    title: "RAG",
    status: "EXPLORING",
    description:
      "Exploring retrieval-augmented generation for grounded responses using portfolio knowledge.",
    tags: ["RAG", "Vector Search"],
  },
  {
    key: "ai-agents",
    title: "AI AGENTS",
    status: "EXPLORING",
    description:
      "Exploring agent-based workflows and tool-driven AI systems.",
    tags: ["AI Agents", "Tool Use"],
  },
  {
    key: "spring-ai",
    title: "SPRING AI",
    status: "FUTURE DIRECTION",
    description:
      "Exploring Java-native AI application development using Spring AI.",
    tags: ["Spring AI", "Java"],
  },
  {
    key: "agentic-backend",
    title: "AGENTIC BACKEND",
    status: "FUTURE DIRECTION",
    description:
      "Exploring the combination of AI agents with backend services, APIs and distributed systems.",
    tags: ["Agentic AI", "Event-Driven"],
  },
];

export const aiSystemStatus: Array<{ label: string; status: string }> = [
  { label: "LLM", status: "EXPLORING" },
  { label: "RAG", status: "EXPLORING" },
  { label: "AI AGENTS", status: "EXPLORING" },
  { label: "SPRING AI", status: "FUTURE DIRECTION" },
  { label: "TOOL CALLING", status: "FUTURE DIRECTION" },
  { label: "VECTOR SEARCH", status: "FUTURE DIRECTION" },
];

// ---------------------------------------------------------------------------
// PLANNED AI ARCHITECTURE — interactive visualization (not implemented)
// ---------------------------------------------------------------------------

const PLANNED_AI_NODES: DiagNode[] = [
  {
    id: "user", label: "USER", desc: "Asks questions about the portfolio in natural language.",
    role: "Intent entry",
    why: "Questions about experience, projects and architecture arrive as natural language instead of hard-coded queries.",
    tech: "Next.js UI",
    status: "INPUT",
    kind: "client", layer: 0, col: 1,
  },
  {
    id: "uai", label: "UTKARSH AI", sub: "demo interface", desc: "The experimental console in this section — currently powered by a local portfolio matcher.",
    role: "Portfolio intelligence interface",
    why: "The console you are using right now — later backed by a real AI service reading this same structured data.",
    tech: "React · Local matcher (demo)",
    status: "EXPERIMENTAL",
    kind: "compute", layer: 1, col: 1,
  },
  {
    id: "api", label: "SPRING BOOT API", sub: "planned endpoint", desc: "Would expose portfolio-knowledge endpoints with production-grade discipline.",
    role: "Secure gateway",
    why: "Exposes portfolio-knowledge endpoints behind the same patterns used at work: validation, auth and observability.",
    tech: "Spring Boot",
    status: "PLANNED",
    kind: "compute", layer: 2, col: 1,
  },
  {
    id: "sai", label: "SPRING AI", sub: "framework", desc: "Java-native abstractions over models, embeddings and tool calling.",
    role: "AI application framework",
    why: "Brings model orchestration into the JVM ecosystem I already build in — no context switch to another runtime.",
    tech: "Spring AI",
    status: "FUTURE DIRECTION",
    inspectorWhyLabel: "FUTURE PURPOSE",
    kind: "ai", layer: 3, col: 1,
  },
  {
    id: "llm", label: "LLM", sub: "reasoning engine", desc: "Generates responses grounded in retrieved portfolio context.",
    role: "Reasoning engine",
    why: "Generates candidate answers from retrieved context — treated like any other distributed dependency.",
    tech: "LLM APIs (planned)",
    status: "EXPLORING",
    exploring: true,
    inspectorWhyLabel: "FUTURE PURPOSE",
    kind: "ai", layer: 4, col: 1,
  },
  {
    id: "rag", label: "RAG · KNOWLEDGE", sub: "retrieval", desc: "Retrieves relevant portfolio information before an answer is generated.",
    role: "Knowledge retrieval",
    why: "Retrieve relevant portfolio/project information before generating grounded responses.",
    tech: "Vector search (planned)",
    status: "EXPLORING",
    exploring: true,
    inspectorWhyLabel: "FUTURE PURPOSE",
    kind: "ai", layer: 5, col: 0,
  },
  {
    id: "agent", label: "AI AGENT", sub: "orchestration", desc: "Plans multi-step answers and routes between retrieval and tools.",
    role: "Orchestration",
    why: "Plans multi-step answers and routes between retrieval, memory and tool calls.",
    tech: "Agent runtime (planned)",
    status: "EXPLORING",
    exploring: true,
    inspectorWhyLabel: "FUTURE PURPOSE",
    kind: "ai", layer: 5, col: 1,
  },
  {
    id: "tools", label: "TOOLS", sub: "typed capabilities", desc: "Callable functions scoped strictly to portfolio knowledge.",
    role: "Typed capabilities",
    why: "searchProjects(), getSkills(), explainArchitecture() — callable functions scoped strictly to portfolio knowledge.",
    tech: "Tool calling (planned)",
    status: "PLANNED",
    inspectorWhyLabel: "FUTURE PURPOSE",
    kind: "ai", layer: 5, col: 2,
  },
  {
    id: "resp", label: "RESPONSE", desc: "Grounded answer delivered back through the same interface.",
    role: "Grounded answer",
    why: "Delivered back through the same interface, traceable to the portfolio data behind it.",
    tech: "Next.js UI",
    status: "OUTPUT",
    kind: "client", layer: 6, col: 1,
  },
];

export const plannedAiDiagram: ArchitectureDiagram = {
  key: "planned-ai",
  tab: "PLANNED AI",
  title: "PLANNED AI ARCHITECTURE — NOT IMPLEMENTED",
  blurb:
    "The intended call path for a real UTKARSH AI service. Every capability beyond this demo panel is exploration or future direction.",
  layers: ["USER", "INTERFACE", "API LAYER", "FRAMEWORK", "MODEL", "CAPABILITIES", "OUTPUT"],
  nodes: PLANNED_AI_NODES,
  edges: [
    { from: "user", to: "uai" },
    { from: "uai", to: "api" },
    { from: "api", to: "sai" },
    { from: "sai", to: "llm" },
    { from: "llm", to: "rag" },
    { from: "llm", to: "agent" },
    { from: "agent", to: "tools" },
    { from: "rag", to: "resp" },
    { from: "tools", to: "resp" },
  ],
  exploring: true,
};

// ---------------------------------------------------------------------------
// JAVA BACKEND → AI BRIDGE
// ---------------------------------------------------------------------------

export const aiBridge = {
  foundation: ["JAVA", "SPRING BOOT", "MICROSERVICES", "KAFKA", "AWS"],
  target: ["LLM", "RAG", "AGENTS"],
  statement:
    "Building on backend engineering foundations to explore AI-powered distributed systems.",
};

/** One hop on the evolution path: production steps are `active`, exploration targets are not. */
export interface AiEvolutionStep {
  label: string;
  active: boolean;
}

/** Derived from aiBridge so the backend→AI story has a single source of truth. */
export const aiDisclaimer =
  "AI Lab documents exploration and experiments — not production AI experience. The production foundation is Java, Spring and distributed systems.";

export const aiEvolutionPath: AiEvolutionStep[] = [
  ...aiBridge.foundation.map((label) => ({ label, active: true })),
  ...aiBridge.target.map((label) => ({ label, active: false })),
];

// ---------------------------------------------------------------------------
// BEYOND CODE — editable placeholders, nothing fabricated
// ---------------------------------------------------------------------------

export interface InterestCard {
  key: string;
  icon: "book" | "cpu" | "film" | "plane" | "sparkles" | "graduation";
  title: string;
  lines: string[];
  placeholder: boolean;
}

export const interests: InterestCard[] = [
  {
    key: "learning",
    icon: "graduation",
    title: "LEARNING",
    lines: ["Currently exploring LLMs, RAG and agentic systems."],
    placeholder: false,
  },
  {
    key: "tech-exploration",
    icon: "cpu",
    title: "TECHNOLOGY EXPLORATION",
    lines: ["[ Add what you're building or tinkering with outside work ]"],
    placeholder: true,
  },
  {
    key: "books",
    icon: "book",
    title: "BOOKS",
    lines: ["[ Add books you're reading or would recommend ]"],
    placeholder: true,
  },
  {
    key: "movies",
    icon: "film",
    title: "MOVIES",
    lines: ["[ Add favorites ]"],
    placeholder: true,
  },
  {
    key: "travel",
    icon: "plane",
    title: "TRAVEL",
    lines: ["[ Add places you've been or want to go ]"],
    placeholder: true,
  },
  {
    key: "personal",
    icon: "sparkles",
    title: "PERSONAL INTERESTS",
    lines: ["[ Add anything else — sports, music, communities ]"],
    placeholder: true,
  },
];

// ---------------------------------------------------------------------------
// CONTACT
// ---------------------------------------------------------------------------

export const contact = {
  title: "LET'S BUILD SOMETHING SCALABLE.",
  subtitle:
    "Open to backend engineering roles and conversations about distributed systems, microservices and where AI is taking backends.",
  showPhonePublicly: true,
  phone: "7991103971",
};

// ---------------------------------------------------------------------------
// PHASE 2 HOOK POINTS (documented, not implemented)
//
// Future AI tool surface for RAG / agents:
//   searchProjects() searchExperience() getSkills()
//   explainArchitecture() searchGitHub() getResumeInformation()
//
// Planned call path:
//   Next.js → Spring Boot → Spring AI → AI Agent → RAG →
//   Portfolio Knowledge (this file) → Tools
// ---------------------------------------------------------------------------
