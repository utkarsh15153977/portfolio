package com.utkarsh.portfolio.tools;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeLoader;
import org.springframework.ai.document.Document;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Phase 4.4 — read-only portfolio tools exposed through Spring AI's
 * method-based tool calling API ({@link Tool}) so the Phase 4.5 agent can
 * invoke them during conversations.
 *
 * Design constraints (deliberate):
 * - READ-ONLY: every tool derives its answers exclusively from the generated
 *   knowledge file (classpath:knowledge/portfolio-knowledge.json, itself
 *   extracted from lib/portfolio-data.ts — the single source of truth).
 *   No database access, no mutations, no network calls, no web browsing.
 * - NO INVENTION: tools never generate facts. They filter and rank existing
 *   knowledge chunks deterministically (keyword scoring) and return the chunk
 *   text verbatim with its metadata.
 * - HONEST POSITIONING: production facts stay strictly separated from
 *   exploration / future-direction material — skills are split into
 *   production vs exploring buckets, architecture chunks carry an explicit
 *   production vs planned-exploration classification.
 *
 * The methods are inert until a chat integration attaches them to a model
 * call (Phase 4.5); this phase ships the implementations plus deterministic
 * HTTP coverage via AiToolsController.
 */
@Component
public class PortfolioTools {

    /** Hard cap per returned chunk so model context stays concise. */
    static final int MAX_TEXT_CHARS = 700;

    /** Lowercased markers identifying exploration / future-direction content. */
    private static final List<String> EXPLORATION_MARKERS = List.of(
            "exploration", "exploring", "not implemented", "not shipped", "not production");

    private static final String SECTION_SKILLS = "skills";
    private static final String KEY_ENGINEERING_PRACTICES = "engineering-practices";
    private static final String SKILLS_TITLE_PREFIX = "SKILLS:";

    /** Immutable snapshot of the portfolio knowledge, loaded once at startup. */
    private final List<Document> documents;

    public PortfolioTools(PortfolioKnowledgeLoader loader) {
        this.documents = List.copyOf(loader.loadAll());
    }

    // -- Tools -----------------------------------------------------------------

    @Tool(name = "searchProjects",
            description = "Search Utkarsh Singh's portfolio PROJECTS (real repositories and the "
                    + "real-time chat case study) by keywords and return matching chunks verbatim "
                    + "from the portfolio data. Read-only; never invents projects or technologies.")
    public ToolResponse searchProjects(
            @ToolParam(required = false,
                    description = "free-text keywords such as 'kafka', 'spring boot', 'supabase'")
            String query) {
        List<KnowledgeChunk> results = ranked("projects", query);
        return new ToolResponse("projects", trimmed(query), results.size(), note(results),
                results);
    }

    @Tool(name = "getSkills",
            description = "Return Utkarsh Singh's skills split into PRODUCTION skills (professional "
                    + "experience) and EXPLORING skills (explicitly NOT production yet), plus his "
                    + "engineering practices. Read-only; sourced from the portfolio data.")
    public SkillsResponse getSkills() {
        List<SkillGroup> production = new ArrayList<>();
        List<SkillGroup> exploring = new ArrayList<>();
        List<String> practices = List.of();

        for (Document doc : section(SECTION_SKILLS)) {
            if (isPractices(doc)) {
                practices = List.copyOf(lines(doc));
            } else if (isExploratory(doc)) {
                exploring.add(new SkillGroup(category(doc), tags(doc)));
            } else {
                production.add(new SkillGroup(category(doc), tags(doc)));
            }
        }
        return new SkillsResponse(
                "tone split follows the portfolio source of truth: production = professional "
                        + "experience; exploring = NOT production yet",
                List.copyOf(production), List.copyOf(exploring), practices);
    }

    @Tool(name = "getExperience",
            description = "Return Utkarsh Singh's professional EXPERIENCE (employer, role, dates, "
                    + "domains and technologies) verbatim from the portfolio data. Never invents "
                    + "employers, roles, dates, responsibilities or technologies. Read-only.")
    public ToolResponse getExperience() {
        List<KnowledgeChunk> results = ranked("experience", "");
        return new ToolResponse("experience", null, results.size(), note(results), results);
    }

    @Tool(name = "explainArchitecture",
            description = "Explain architecture concepts and decisions represented in Utkarsh Singh's "
                    + "portfolio architecture material, matched by keywords. Each result is explicitly "
                    + "classified as 'production' (shipped professional work) or 'planned-exploration' "
                    + "(exploration target, NOT shipped). Read-only; never invents architectures.")
    public ToolResponse explainArchitecture(
            @ToolParam(required = false,
                    description = "free-text keywords such as 'kafka', 'microservices', 'agent'")
            String query) {
        List<KnowledgeChunk> results = ranked("architecture", query);
        return new ToolResponse("architecture", trimmed(query), results.size(),
                results.isEmpty()
                        ? "no matching portfolio knowledge found for this query"
                        : "classification semantics: production = shipped professional work; "
                                + "planned-exploration = exploration target, NOT shipped",
                results);
    }

    // -- Response shapes -------------------------------------------------------

    /** A single knowledge chunk returned by a tool, verbatim from the source file. */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record KnowledgeChunk(
            String id,
            String title,
            String summary,
            String text,
            boolean truncated,
            String classification,
            List<String> layers,
            List<String> tags) {
    }

    /** Uniform tool response for section-shaped queries. */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ToolResponse(
            String section,
            String query,
            int count,
            String note,
            List<KnowledgeChunk> results) {
    }

    /** One skill category with its exact skill names from the source of truth. */
    public record SkillGroup(String category, List<String> skills) {
    }

    /** Skills answer with the honest production vs exploring separation. */
    public record SkillsResponse(
            String note,
            List<SkillGroup> production,
            List<SkillGroup> exploring,
            List<String> engineeringPractices) {
    }

    // -- Deterministic selection over the knowledge snapshot --------------------

    private List<KnowledgeChunk> ranked(String sectionName, String rawQuery) {
        Set<String> tokens = tokens(rawQuery);
        boolean keywordSearch = !tokens.isEmpty();
        java.util.stream.Stream<Document> selected = documents.stream()
                .filter(doc -> sectionName.equals(sectionOf(doc)))
                .filter(doc -> !keywordSearch || score(doc, tokens) > 0);
        if (keywordSearch) {
            // Best match first; ties broken by stable id. With no keywords the
            // authoritative file order from the knowledge loader is preserved.
            selected = selected.sorted(Comparator
                    .comparingLong((Document doc) -> score(doc, tokens)).reversed()
                    .thenComparing(Document::getId));
        }
        boolean classify = "architecture".equals(sectionName);
        return selected.map(doc -> chunk(doc, classify)).toList();
    }

    /**
     * Keyword score = number of distinct query tokens present in the chunk text.
     * Pure string matching on the authoritative content — no generation.
     */
    private static long score(Document doc, Set<String> tokens) {
        String haystack = (doc.getText() + " " + String.join(" ", tags(doc))).toLowerCase(Locale.ROOT);
        long hits = 0;
        for (String token : tokens) {
            if (haystack.contains(token)) {
                hits++;
            }
        }
        return hits;
    }

    private static KnowledgeChunk chunk(Document doc, boolean classify) {
        String fullText = doc.getText();
        String[] split = fullText.split("\n", 2);
        String summary = split.length > 1 ? split[1].strip() : split[0].strip();

        boolean truncated = fullText.length() > MAX_TEXT_CHARS;
        String text = truncated ? fullText.substring(0, MAX_TEXT_CHARS) : fullText;

        return new KnowledgeChunk(
                doc.getId(),
                title(doc),
                summary,
                text,
                truncated,
                classify ? classification(doc) : null,
                layers(fullText),
                tags(doc));
    }

    private List<Document> section(String sectionName) {
        return documents.stream()
                .filter(doc -> sectionName.equals(sectionOf(doc)))
                .toList();
    }

    private static String sectionOf(Document doc) {
        Object value = doc.getMetadata().get(PortfolioKnowledgeLoader.META_SECTION);
        return value == null ? "" : value.toString();
    }

    private static String title(Document doc) {
        Object value = doc.getMetadata().get(PortfolioKnowledgeLoader.META_TITLE);
        return value == null ? doc.getId() : value.toString();
    }

    /**
     * Parses the exact skill/technology names from the generated
     * {@code Tags: a, b, c} line of the composed chunk text.
     */
    private static List<String> tags(Document doc) {
        for (String line : doc.getText().split("\n")) {
            String stripped = line.strip();
            if (stripped.regionMatches(true, 0, "Tags:", 0, "Tags:".length())) {
                List<String> tags = new ArrayList<>();
                for (String part : stripped.substring("Tags:".length()).split(",")) {
                    String tag = part.strip();
                    if (!tag.isEmpty()) {
                        tags.add(tag);
                    }
                }
                return List.copyOf(tags);
            }
        }
        return List.of();
    }

    private static boolean isExploratory(Document doc) {
        String haystack = (title(doc) + "\n" + doc.getText()).toLowerCase(Locale.ROOT);
        return EXPLORATION_MARKERS.stream().anyMatch(haystack::contains);
    }

    private static boolean isPractices(Document doc) {
        return KEY_ENGINEERING_PRACTICES.equals(practiceKey(doc))
                || title(doc).equalsIgnoreCase("ENGINEERING PRACTICES");
    }

    private static String practiceKey(Document doc) {
        int colon = doc.getId().indexOf(':');
        return colon < 0 ? "" : doc.getId().substring(colon + 1);
    }

    /** Strips the leading {@code SKILLS: } prefix from a skill chunk title. */
    private static String category(Document doc) {
        String t = title(doc);
        return t.startsWith(SKILLS_TITLE_PREFIX)
                ? t.substring(SKILLS_TITLE_PREFIX.length()).strip()
                : t;
    }

    private static List<String> lines(Document doc) {
        String[] split = doc.getText().split("\n");
        if (split.length <= 1) {
            return List.of();
        }
        List<String> lines = new ArrayList<>();
        for (int i = 1; i < split.length; i++) {
            String line = stripToneSuffix(split[i].strip());
            if (!line.isEmpty()) {
                lines.add(line);
            }
        }
        return lines;
    }

    /** Removes the generated {@code Tone: ...} annotation from a line. */
    private static String stripToneSuffix(String line) {
        int toneIndex = line.toLowerCase(Locale.ROOT).indexOf("tone:");
        if (toneIndex > 0) {
            line = line.substring(0, toneIndex).strip();
        }
        return line.replaceAll("[.]$", "").strip();
    }

    /**
     * Extracts the layer pipeline from lines like
     * {@code Layers: CLIENTS -> EDGE -> SERVICES} into a list.
     */
    private static List<String> layers(String text) {
        for (String line : text.split("\n")) {
            String stripped = line.strip();
            if (stripped.regionMatches(true, 0, "Layers:", 0, "Layers:".length())) {
                String pipeline = stripped.substring("Layers:".length());
                List<String> result = new ArrayList<>();
                for (String part : pipeline.split("->")) {
                    String layer = part.strip().replaceAll("[.]$", "").strip();
                    if (!layer.isEmpty()) {
                        result.add(layer);
                    }
                }
                return result;
            }
        }
        return null;
    }

    private static String classification(Document doc) {
        String haystack = (title(doc) + "\n" + doc.getText()).toLowerCase(Locale.ROOT);
        return EXPLORATION_MARKERS.stream().anyMatch(haystack::contains)
                ? "planned-exploration"
                : "production";
    }

    private static Set<String> tokens(String rawQuery) {
        if (rawQuery == null || rawQuery.isBlank()) {
            return Set.of();
        }
        Set<String> tokens = new LinkedHashSet<>();
        for (String token : rawQuery.toLowerCase(Locale.ROOT).split("[^a-z0-9]+")) {
            if (token.length() >= 2) {
                tokens.add(token);
            }
        }
        return tokens;
    }

    private static String trimmed(String rawQuery) {
        return rawQuery == null ? null : rawQuery.strip();
    }

    private static String note(List<KnowledgeChunk> results) {
        return results.isEmpty()
                ? "no matching portfolio knowledge found for this query"
                : "verbatim portfolio knowledge chunks";
    }
}
