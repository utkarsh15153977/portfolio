import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { profile } from "@/lib/portfolio-data";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s // ${profile.systemName}`,
  },
  description:
    "Utkarsh Singh — Java Backend Developer with 3+ years building scalable backend systems, microservices, event-driven architectures and cloud infrastructure. Exploring AI, LLMs, RAG and agentic systems.",
  keywords: [
    "Java Backend Developer",
    "Spring Boot",
    "Microservices",
    "Kafka",
    "Distributed Systems",
    "Event-Driven Architecture",
    "AWS",
    "Kubernetes",
    "Utkarsh Singh",
  ],
  authors: [{ name: profile.name }],
  openGraph: {
    title: `${profile.name} — ${profile.role}`,
    description:
      "3+ years building scalable backend systems with Java, Spring Boot, microservices and event-driven architecture — exploring intelligent systems.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070b",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  email: `mailto:${profile.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bangalore",
    addressCountry: "IN",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Birla Institute of Technology, Mesra",
  },
  knowsAbout: [
    "Java",
    "Spring Boot",
    "Microservices",
    "Apache Kafka",
    "PostgreSQL",
    "Redis",
    "AWS",
    "Docker",
    "Kubernetes",
    "Distributed Systems",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd),
          }}
        />

        {children}
      </body>
    </html>
  );
}