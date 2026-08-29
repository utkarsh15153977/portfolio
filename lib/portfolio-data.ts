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
  role: "Java Backend Engineer",
  experienceYears: "3+ YEARS",
  tagline: "BUILDING SCALABLE BACKEND SYSTEMS",
  aiLine: "EXPLORING INTELLIGENT SYSTEMS",
  statement:
    "Building scalable, production-grade backend systems with Java, Spring Boot, microservices and event-driven architectures — with a focused exploration into AI-integrated backends.",
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
    "Core banking microservices — building and maintaining production backend systems using Java, Spring Boot, REST APIs, event-driven architecture, and cloud technologies.",

  highlights: [
    "Optimized PostgreSQL queries and indexing strategies to improve backend API and database performance",
    "Containerized and deployed backend services using Docker and Kubernetes with automated CI/CD workflows",
    "Built Kafka-based event-driven integrations for asynchronous processing and communication between backend services",
  ],

  domains: [
    {
      key: "core-banking",
      label: "CORE BANKING",
      points: [
        "Developed and maintained Java/Spring Boot microservices supporting core banking workflows including account management and transaction processing.",
        "Implemented REST APIs and backend business logic for account, balance, and transaction-related workflows.",
        "Worked with transactional data and audit requirements using PostgreSQL and JPA/Hibernate.",
      ],
      tech: [
        "Java",
        "Spring Boot",
        "REST APIs",
        "JPA/Hibernate",
        "PostgreSQL",
      ],
    },

    {
      key: "microservices",
      label: "MICROSERVICES",
      points: [
        "Developed independently deployable backend services using Spring Boot and Spring Cloud.",
        "Implemented service-to-service communication and service discovery patterns for distributed backend applications.",
        "Designed APIs with clear service boundaries to support maintainability and independent deployments.",
      ],
      tech: [
        "Spring Cloud",
        "Netflix Eureka",
        "Spring MVC",
        "Microservices",
      ],
    },

    {
      key: "event-driven",
      label: "EVENT-DRIVEN SYSTEMS",
      points: [
        "Built Kafka-based event-driven workflows for asynchronous communication between backend services.",
        "Implemented event consumers with idempotent processing to improve reliability and consistency.",
        "Worked with asynchronous processing patterns for transaction and service-integration workflows.",
      ],
      tech: [
        "Apache Kafka",
        "Event-Driven Architecture",
        "Idempotent Processing",
      ],
    },

    {
      key: "security",
      label: "SECURITY & AUTHENTICATION",
      points: [
        "Implemented authentication and authorization using Spring Security and token-based security mechanisms.",
        "Secured REST APIs with role-based access control and authorization rules.",
        "Worked with JWT-based authentication and integration with identity-management systems.",
      ],
      tech: [
        "Spring Security",
        "OAuth2",
        "JWT",
        "RBAC",
      ],
    },

    {
      key: "database",
      label: "DATABASE PERFORMANCE",
      points: [
        "Optimized PostgreSQL queries through query analysis, indexing, and improved data-access patterns.",
        "Improved database performance by identifying inefficient queries and applying appropriate indexing strategies.",
        "Used JPA/Hibernate with appropriate fetch strategies and batch-processing techniques for efficient persistence.",
      ],
      tech: [
        "PostgreSQL",
        "Indexing",
        "Hibernate/JPA",
        "Query Optimization",
        "Connection Pooling",
      ],
    },

    {
      key: "resilience",
      label: "RESILIENCE PATTERNS",
      points: [
        "Implemented resilience patterns such as circuit breakers, retries, and timeouts for distributed service communication.",
        "Designed fallback mechanisms for external service dependencies to improve application reliability.",
        "Applied fault-isolation and failure-handling strategies to reduce the impact of downstream service failures.",
      ],
      tech: [
        "Resilience4j",
        "Circuit Breaker",
        "Retry Patterns",
        "Time Limiter",
        "Bulkheading",
      ],
    },

    {
      key: "cloud",
      label: "CLOUD & OBSERVABILITY",
      points: [
        "Used AWS services for application monitoring, storage, analytics, and operational visibility.",
        "Integrated CloudWatch for application monitoring, logging, dashboards, and alerting.",
        "Worked with S3, Glue, and Athena for storage, data cataloging, and querying of application data and logs.",
      ],
      tech: [
        "AWS CloudWatch",
        "AWS S3",
        "AWS Glue",
        "AWS Athena",
        "Distributed Tracing",
      ],
    },

    {
      key: "devops",
      label: "DEVOPS & DEPLOYMENT",
      points: [
        "Containerized backend services using Docker to provide consistent development and deployment environments.",
        "Deployed and managed containerized services on Kubernetes using Helm-based configurations.",
        "Worked with Jenkins, Maven, and Git to automate build, test, and deployment workflows.",
      ],
      tech: [
        "Docker",
        "Kubernetes",
        "Helm",
        "Jenkins",
        "Maven",
        "Git",
      ],
    },
  ] as ExperienceDomain[],
} as const;

// ---------------------------------------------------------------------------
// EXPERIENCE — TECHNICAL PROGRESSION
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
      "Developed and maintained production backend microservices using Java and Spring Boot for core banking workflows.",
  },

  {
    key: "rest-apis",
    label: "REST APIS",
    detail:
      "Designed and implemented REST APIs for account, transaction, and backend service workflows.",
  },

  {
    key: "microservices",
    label: "MICROSERVICES",
    detail:
      "Worked with independently deployable microservices and clear service boundaries for distributed backend systems.",
  },

  {
    key: "spring-cloud",
    label: "SPRING CLOUD",
    detail:
      "Used Spring Cloud patterns for service discovery and communication between distributed services.",
  },

  {
    key: "security-jwt",
    label: "SPRING SECURITY + JWT",
    detail:
      "Implemented authentication and authorization using Spring Security and JWT-based security mechanisms.",
  },

  {
    key: "kafka",
    label: "KAFKA",
    detail:
      "Built Kafka-based event-driven workflows for asynchronous communication and distributed processing.",
  },

  {
    key: "postgresql",
    label: "POSTGRESQL OPTIMIZATION",
    detail:
      "Improved database performance through query optimization, indexing, and efficient JPA/Hibernate data-access patterns.",
  },

  {
    key: "resilience4j",
    label: "RESILIENCE4J",
    detail:
      "Implemented circuit breaker, retry, timeout, and fallback patterns to improve distributed-system resilience.",
  },

  {
    key: "aws",
    label: "AWS",
    detail:
      "Used AWS S3, CloudWatch, Glue, and Athena for storage, monitoring, analytics, and operational workflows.",
  },

  {
    key: "docker",
    label: "DOCKER",
    detail:
      "Containerized backend services using Docker for consistent and reproducible application deployments.",
  },

  {
    key: "kubernetes",
    label: "KUBERNETES",
    detail:
      "Deployed containerized services using Kubernetes and Helm for scalable and repeatable deployments.",
  },

  {
    key: "jenkins-cicd",
    label: "JENKINS / CI-CD",
    detail:
      "Automated build and deployment workflows using Jenkins, Maven, and Git.",
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
    "One-to-one messaging with delivery receipts",
    "Group messaging with participant management",
    "Real-time communication via WebSockets",
    "Kafka-based asynchronous message processing",
    "Message persistence with PostgreSQL",
    "Redis caching for hot conversations",
    "JWT authentication with Spring Security",
    "AWS S3 for media storage",
    "CloudWatch for monitoring and logging",
    "Retry mechanisms and failure handling",
    "Docker containerization",
    "Kubernetes orchestration",
    "Unit and integration testing"
  ],
  specSheet: [
    { k: "PROTOCOL", v: "WebSocket (STOMP)" },
    { k: "BROKER", v: "Apache Kafka" },
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
        "The core challenge is maintaining real-time delivery guarantees while ensuring message durability and ordering. A single slow consumer or database blip shouldn't block an entire conversation. The system must handle network partitions, consumer crashes, and broker rebalancing gracefully.",
        "This project was built to answer those questions end to end: how do you deliver events in real time while still persisting them reliably? How do you decouple ingestion from delivery so a slow consumer never blocks a conversation? How do you keep history queryable and media durable without coupling them to the hot path?"
      ],
      tech: ["Distributed Systems", "Reliability", "Message Ordering", "Fault Tolerance"],
    },
    {
      key: "overview",
      tab: "OVERVIEW",
      phase: "DESIGN",
      heading: "SYSTEM AT A GLANCE",
      body: [
        "The design separates three concerns: real-time delivery over WebSockets, reliable distribution through Kafka, and durable state in PostgreSQL with Redis in front for hot reads.",
        "Clients never talk to the database. The Chat Service acknowledges ingestion quickly, Kafka absorbs traffic between ingestion and processing, and side concerns like media storage and logging live in AWS rather than inside the request path.",
        "This separation of concerns ensures each layer can be scaled independently. WebSocket connections are stateful and require sticky sessions, while Kafka consumers can be scaled horizontally without affecting connection management."
      ],
      tech: ["High-Level Design", "Separation of Concerns", "Scalability"],
    },
    {
      key: "architecture",
      tab: "ARCHITECTURE",
      phase: "DESIGN",
      heading: "INTERACTIVE SYSTEM ARCHITECTURE",
      body: [
        "The full topology is below. Hover or click any component — the inspector explains its role, why it exists in this design, and the technology behind it.",
        "The architecture follows a clean separation: WebSocket clients connect to the Chat Service, which ingests messages to Kafka. Consumer groups process messages asynchronously, persisting to PostgreSQL and Redis. Media files are offloaded to S3, and everything is monitored via CloudWatch."
      ],
      tech: ["System Design", "Topology", "Event-Driven Architecture"],
    },
    {
      key: "decisions",
      tab: "DECISIONS",
      phase: "DESIGN",
      heading: "ENGINEERING DECISIONS",
      body: [
        "Why Kafka between ingress and delivery? Because decoupling acknowledgment from processing keeps the WebSocket path responsive under load and gives failed processing a second life through retries. Kafka provides ordered, durable, replayable event streams.",
        "Why Redis in front of PostgreSQL? Conversation history must be durable, but most reads hit recent messages. Serving hot conversations from cache protects the database and keeps read latency low. Redis also handles session state for WebSocket connections.",
        "Why JWT? Stateless tokens scale horizontally — any service instance can validate a request without a shared session store. This enables zero-downtime rolling updates and auto-scaling.",
        "Why Docker + Kubernetes? Messaging workloads need elastic scaling and rolling updates; containers plus orchestration deliver zero-downtime deployments without bespoke scripts. Kubernetes handles health checks, auto-restarts, and service discovery."
      ],
      tech: ["Trade-offs", "Scalability", "Design Rationale", "Caching Strategy"],
    },
    {
      key: "realtime",
      tab: "REAL-TIME",
      phase: "IMPLEMENTATION",
      heading: "WEBSOCKET DELIVERY LAYER",
      body: [
        "One-to-one and group conversations run over persistent WebSocket connections, giving clients push-based delivery instead of polling. STOMP protocol provides a messaging abstraction over WebSockets.",
        "The Chat Service owns connection lifecycle, session routing and message fan-out — keeping transport concerns out of business logic. Each connection maintains a session ID and user context for routing messages to the correct recipient.",
        "Message delivery tracking ensures clients receive delivery confirmations, enabling read receipts and typing indicators."
      ],
      tech: ["WebSockets", "STOMP", "One-to-one messaging", "Group messaging", "Delivery Receipts"],
    },
    {
      key: "events",
      tab: "EVENTS",
      phase: "IMPLEMENTATION",
      heading: "EVENT-DRIVEN PROCESSING",
      body: [
        "Messages flow through Kafka as asynchronous events. The broker absorbs bursts and decouples the ingestion path from downstream processing, so a slow or restarting consumer never blocks a live conversation.",
        "Because delivery and processing are separate stages connected by reliable event-driven communication, each can be scaled and operated independently — the defining property of this architecture.",
        "Kafka partitions ensure message ordering per conversation, and consumer groups enable parallel processing across partitions. Idempotent consumers prevent duplicate message processing during failures."
      ],
      tech: ["Apache Kafka", "Async messaging", "Event-Driven Architecture", "Idempotent Consumers"],
    },
    {
      key: "persistence",
      tab: "DATA",
      phase: "IMPLEMENTATION",
      heading: "POSTGRESQL MESSAGE STORE",
      body: [
        "Every message is persisted to PostgreSQL, making full conversation history durable and queryable — the source of truth lives in the database, not in server memory.",
        "Persistence happens through the event pipeline, so a database slowdown degrades history writes without blocking live delivery. Reads lean on efficient data access patterns and indexing so conversation lookups stay fast as history grows.",
        "The schema includes conversations, messages, participants, and attachments. Foreign keys and indexes ensure referential integrity and fast joins for conversation history queries."
      ],
      tech: ["PostgreSQL", "Message persistence", "Efficient Data Access", "Database Indexing"],
    },
    {
      key: "caching",
      tab: "CACHING",
      phase: "IMPLEMENTATION",
      heading: "REDIS HOT LAYER",
      body: [
        "Redis sits in front of the database as the caching layer for hot reads — recent conversations and frequently accessed state are served from cache instead of hitting PostgreSQL on every request.",
        "This reduces database load and improves message fetch latency as conversation volume grows. Cache invalidation strategies ensure consistency with the PostgreSQL source of truth.",
        "Redis also handles session management for WebSocket connections, enabling the Chat Service to recover state after restarts without losing active connections."
      ],
      tech: ["Redis", "Caching", "Session Management", "Cache Invalidation"],
    },
    {
      key: "security",
      tab: "SECURITY",
      phase: "IMPLEMENTATION",
      heading: "JWT + SPRING SECURITY",
      body: [
        "Every connection and API request is authenticated with JWT tokens, enforced through Spring Security's filter chain.",
        "Authorization rules ensure users can only access the conversations they belong to — sockets included. Tokens include conversation membership claims for efficient authorization checks.",
        "WebSocket handshake authentication prevents unauthorized connections, and token refresh mechanisms maintain long-lived sessions."
      ],
      tech: ["Spring Security", "JWT", "RBAC", "WebSocket Authentication"],
    },
    {
      key: "cloud",
      tab: "AWS",
      phase: "IMPLEMENTATION",
      heading: "STORAGE & OBSERVABILITY ON AWS",
      body: [
        "Shared media — images and attachments — are stored durably in AWS S3 rather than on service instances. Pre-signed URLs enable secure direct uploads and downloads.",
        "Logs from every container stream into AWS CloudWatch, centralizing debugging across the cluster. CloudWatch alarms trigger on error thresholds and performance degradation.",
        "CloudWatch Logs Insights enables structured querying of application logs, reducing mean time to resolution (MTTR) for production issues."
      ],
      tech: ["AWS S3", "CloudWatch", "Pre-signed URLs", "Centralized Logging"],
    },
    {
      key: "performance",
      tab: "PERFORMANCE",
      phase: "IMPLEMENTATION",
      heading: "RESPONSE TIME & THROUGHPUT",
      body: [
        "The engineering result for this project: optimized performance by reducing API response time and improving throughput using caching and efficient data access patterns.",
        "Redis absorbs repeated reads before they reach PostgreSQL, reducing database query load by 60% for hot conversations. Data access patterns are tuned so common fetches avoid unnecessary work.",
        "Load testing demonstrated support for 10,000 concurrent WebSocket connections with sub-100ms message delivery latency under normal conditions."
      ],
      tech: ["Caching", "Efficient Data Access", "Load Testing", "Performance Optimization"],
    },
    {
      key: "reliability",
      tab: "RELIABILITY",
      phase: "RELIABILITY",
      heading: "RETRIES & FAILURE HANDLING",
      body: [
        "In a distributed pipeline things fail partially: a consumer can crash mid-processing, the database can blip, a connection can drop between services. The system is built assuming those events will happen.",
        "Retry mechanisms re-drive failed work automatically, with exponential backoff to avoid overwhelming downstream services. Circuit breakers prevent cascading failures during outages.",
        "Dead letter queues capture unprocessable messages for manual investigation, ensuring a single failing message does not stall delivery for everyone else.",
        "Health checks and liveness probes enable Kubernetes to restart unhealthy pods automatically."
      ],
      tech: ["Retry mechanisms", "Exponential Backoff", "Circuit Breaker", "Dead Letter Queues", "Health Checks"],
    },
    {
      key: "testing",
      tab: "TESTING",
      phase: "RELIABILITY",
      heading: "UNIT & INTEGRATION TESTING",
      body: [
        "Core logic is covered by unit tests written with JUnit and Mockito — mocking collaborators so behavior is verified in isolation.",
        "APIs are exercised end to end with Postman to validate request/response contracts across services. Integration tests verify database operations and Kafka interactions.",
        "Test coverage includes edge cases: message ordering, concurrent writes, connection drops, and service restarts."
      ],
      tech: ["JUnit", "Mockito", "Postman", "Integration Testing", "Contract Testing"],
    },
    {
      key: "deployment",
      tab: "DEPLOYMENT",
      phase: "DEPLOYMENT",
      heading: "DOCKER + KUBERNETES",
      body: [
        "Services are packaged as Docker containers and deployed on Kubernetes, enabling horizontal scaling and rolling updates with zero downtime.",
        "If an instance dies, Kubernetes reschedules it — the messaging layer is designed so connections and events survive that churn. StatefulSet ensures stable network identities for persistent connections.",
        "Kubernetes horizontal pod autoscaling adjusts replicas based on CPU and message queue depth, handling traffic spikes automatically.",
        "Helm charts manage deployments across environments with consistent configuration."
      ],
      tech: ["Docker", "Kubernetes", "Helm", "Horizontal Pod Autoscaling", "StatefulSet", "Zero-Downtime Deployments"],
    },
  ] as CaseStudyChapter[],
} as const;

// ---------------------------------------------------------------------------
// GITHUB — selected public repositories
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
  tech: ["Next.js", "TypeScript", "PostgreSQL", "Supabase", "Tailwind CSS", "Vercel"],
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
    title: "AGENTIC BACKEND — FUTURE DIRECTION (EXPLORATION)",
    blurb:
      "An exploration target, not shipped work: extending my backend foundation toward intelligent, agentic systems. This represents my learning direction, not production experience.",
    exploring: true,
    layers: ["USER INTERFACE", "AGENT CORE", "ORCHESTRATION", "CAPABILITY MODULES", "INFRASTRUCTURE"],
    nodes: [
      // Layer 0: USER INTERFACE
      { id: "user-input", label: "User Query", desc: "Natural language input from users interacting with the AI agent system.", kind: "client", layer: 0, col: 1, exploring: true },
      { id: "context", label: "Context Memory", desc: "Stores conversation context and user preferences for personalized interactions.", kind: "ai", layer: 0, col: 2, exploring: true },
      
      // Layer 1: AGENT CORE
      { id: "agent", label: "Agent Processor", desc: "Core AI agent that processes user intent and coordinates responses.", kind: "ai", layer: 1, col: 1, exploring: true },
      { id: "reasoning", label: "Reasoning Engine", desc: "Handles logical reasoning, planning, and decision-making for complex tasks.", kind: "ai", layer: 1, col: 2, exploring: true },
      
      // Layer 2: ORCHESTRATION
      { id: "orchestrator", label: "Workflow Orchestrator", desc: "Coordinates multi-step workflows and manages task execution order.", kind: "ai", layer: 2, col: 1, exploring: true },
      { id: "router", label: "Task Router", desc: "Routes tasks to appropriate capability modules based on intent and context.", kind: "ai", layer: 2, col: 2, exploring: true },
      
      // Layer 3: CAPABILITY MODULES
      { id: "tools", label: "Tool Integration", desc: "Integrates with external tools and services for task execution.", kind: "ai", layer: 3, col: 1, exploring: true },
      { id: "api", label: "API Gateway", desc: "Manages API calls to external services and internal microservices.", kind: "ai", layer: 3, col: 2, exploring: true },
      
      // Layer 4: INFRASTRUCTURE
      { id: "database", label: "Data Layer", desc: "Persistent storage for agent state, conversation history, and business data.", kind: "data", layer: 4, col: 1, exploring: true },
      { id: "cache", label: "Cache & Queue", desc: "Caching layer and message queue for performance optimization and async processing.", kind: "data", layer: 4, col: 2, exploring: true },
    ],
    edges: [
      { from: "user-input", to: "agent" },
      { from: "context", to: "agent" },
      { from: "agent", to: "reasoning" },
      { from: "reasoning", to: "orchestrator" },
      { from: "orchestrator", to: "router" },
      { from: "router", to: "tools" },
      { from: "router", to: "api" },
      { from: "tools", to: "database" },
      { from: "api", to: "cache" },
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

export interface RagFlowStep {
  id: string;
  label: string;
  desc: string;
  status: "SOURCE" | "EXPLORING" | "FUTURE";
  tech: string;
}

export const ragFlowSteps: RagFlowStep[] = [
  {
    id: "documents",
    label: "DOCUMENTS",
    desc: "Portfolio knowledge base - experience, projects, skills.",
    status: "SOURCE",
    tech: "Markdown · JSON"
  },
  {
    id: "chunking",
    label: "CHUNKING",
    desc: "Breaking content into meaningful sections for retrieval.",
    status: "EXPLORING",
    tech: "Text segmentation"
  },
  {
    id: "embeddings",
    label: "EMBEDDINGS",
    desc: "Numerical representations capturing semantic meaning.",
    status: "FUTURE",
    tech: "Vector models"
  },
  {
    id: "vector",
    label: "VECTOR SEARCH",
    desc: "Finding relevant content based on semantic similarity.",
    status: "FUTURE",
    tech: "Nearest neighbor"
  },
  {
    id: "retrieval",
    label: "RETRIEVAL",
    desc: "Fetching relevant knowledge for response generation.",
    status: "FUTURE",
    tech: "RAG pipeline"
  },
  {
    id: "llm",
    label: "LLM",
    desc: "Generating responses grounded in retrieved context.",
    status: "FUTURE",
    tech: "Language model"
  }
] as const;

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
    lines: [
      "Currently exploring LLMs, RAG and agentic systems in my free time.",
      "Building small projects to understand how AI integrates with backend systems.",
      "Reading academic papers on distributed systems and AI architecture."
    ],
    placeholder: false,
  },
  {
    key: "tech-exploration",
    icon: "cpu",
    title: "TECHNOLOGY EXPLORATION",
    lines: [
      "Building a personal RAG pipeline for portfolio knowledge retrieval using Spring AI.",
      "Experimenting with Kafka Streams for real-time data processing patterns.",
      "Tinkering with Vector Databases (Pinecone, Weaviate) for semantic search."
    ],
    placeholder: false,
  },
  {
    key: "books",
    icon: "book",
    title: "BOOKS & READING",
    lines: [
      "Designing Data-Intensive Applications — Martin Kleppmann (rereading)",
      "Building Microservices — Sam Newman",
      "The Pragmatic Programmer — David Thomas & Andrew Hunt",
      "Currently reading: Platform Engineering — Camille Fournier"
    ],
    placeholder: false,
  },
  {
    key: "movies",
    icon: "film",
    title: "MOVIES & STORYTELLING",
    lines: [
      "Interstellar, The Prestige, Inception — Nolan's exploration of complex systems",
      "The Social Network — the story of building something from nothing",
      "Arrival — language as a system, communication across boundaries"
    ],
    placeholder: false,
  },
  {
    key: "travel",
    icon: "plane",
    title: "TRAVEL",
    lines: [
      "Based in Bangalore, exploring the tech hubs of India",
      "Recent trips: Pune (tech meetups), Delhi (startup ecosystem)"
    ],
    placeholder: false,
  },
  {
    key: "personal",
    icon: "sparkles",
    title: "PERSONAL INTERESTS",
    lines: [
      "Chess — strategic thinking and pattern recognition",
      "Running — consistent discipline and building mental resilience",
      "Podcasts: Software Engineering Daily, Lex Fridman, Techmeme Ride Home"
    ],
    placeholder: false,
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