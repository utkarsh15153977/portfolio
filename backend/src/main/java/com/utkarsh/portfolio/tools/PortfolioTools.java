package com.utkarsh.portfolio.tools;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeLoader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.document.Document;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

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

    private static final Logger log = LoggerFactory.getLogger(PortfolioTools.class);

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

    public PortfolioTools(@NonNull PortfolioKnowledgeLoader loader) {
        // FIX: Add null check
        if (loader == null) {
            throw new IllegalArgumentException("PortfolioKnowledgeLoader must not be null");
        }
        
        // FIX: Safely load documents with null handling
        List<Document> loadedDocs = loader.loadAll();
        this.documents = loadedDocs != null 
                ? List.copyOf(loadedDocs) 
                : Collections.emptyList();
        
        log.info("PortfolioTools initialized with {} documents", this.documents.size());
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
        try {
            List<KnowledgeChunk> results = ranked("projects", query);
            return new ToolResponse("projects", trimmed(query), results.size(), note(results),
                    results);
        } catch (Exception e) {
            log.warn("Error in searchProjects: {}", e.getMessage());
            return new ToolResponse("projects", trimmed(query), 0, 
                    "Error searching projects: " + e.getMessage(), Collections.emptyList());
        }
    }

    @Tool(name = "getSkills",
            description = "Return Utkarsh Singh's skills split into PRODUCTION skills (professional "
                    + "experience) and EXPLORING skills (explicitly NOT production yet), plus his "
                    + "engineering practices. Read-only; sourced from the portfolio data.")
    public SkillsResponse getSkills() {
        try {
            List<SkillGroup> production = new ArrayList<>();
            List<SkillGroup> exploring = new ArrayList<>();
            List<String> practices = Collections.emptyList();

            // FIX: Safely get section with null handling
            List<Document> skillDocs = section(SECTION_SKILLS);
            if (skillDocs != null) {
                for (Document doc : skillDocs) {
                    if (doc == null) {
                        continue;
                    }
                    
                    if (isPractices(doc)) {
                        practices = List.copyOf(lines(doc));
                    } else if (isExploratory(doc)) {
                        exploring.add(new SkillGroup(category(doc), tags(doc)));
                    } else {
                        production.add(new SkillGroup(category(doc), tags(doc)));
                    }
                }
            }
            
            return new SkillsResponse(
                    "tone split follows the portfolio source of truth: production = professional "
                            + "experience; exploring = NOT production yet",
                    List.copyOf(production), List.copyOf(exploring), practices);
        } catch (Exception e) {
            log.warn("Error in getSkills: {}", e.getMessage());
            return new SkillsResponse(
                    "Error retrieving skills: " + e.getMessage(),
                    Collections.emptyList(), 
                    Collections.emptyList(), 
                    Collections.emptyList()
            );
        }
    }

    @Tool(name = "getExperience",
            description = "Return Utkarsh Singh's professional EXPERIENCE (employer, role, dates, "
                    + "domains and technologies) verbatim from the portfolio data. Never invents "
                    + "employers, roles, dates, responsibilities or technologies. Read-only.")
    public ToolResponse getExperience() {
        try {
            List<KnowledgeChunk> results = ranked("experience", "");
            return new ToolResponse("experience", null, results.size(), note(results), results);
        } catch (Exception e) {
            log.warn("Error in getExperience: {}", e.getMessage());
            return new ToolResponse("experience", null, 0, 
                    "Error retrieving experience: " + e.getMessage(), Collections.emptyList());
        }
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
        try {
            List<KnowledgeChunk> results = ranked("architecture", query);
            return new ToolResponse("architecture", trimmed(query), results.size(),
                    results.isEmpty()
                            ? "no matching portfolio knowledge found for this query"
                            : "classification semantics: production = shipped professional work; "
                                    + "planned-exploration = exploration target, NOT shipped",
                    results);
        } catch (Exception e) {
            log.warn("Error in explainArchitecture: {}", e.getMessage());
            return new ToolResponse("architecture", trimmed(query), 0, 
                    "Error retrieving architecture: " + e.getMessage(), Collections.emptyList());
        }
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
        // FIX: Add null-safe constructor
        public SkillGroup {
            if (category == null) {
                category = "unknown";
            }
            if (skills == null) {
                skills = Collections.emptyList();
            }
        }
    }

    /** Skills answer with the honest production vs exploring separation. */
    public record SkillsResponse(
            String note,
            List<SkillGroup> production,
            List<SkillGroup> exploring,
            List<String> engineeringPractices) {
        // FIX: Add null-safe constructor
        public SkillsResponse {
            if (note == null) {
                note = "";
            }
            if (production == null) {
                production = Collections.emptyList();
            }
            if (exploring == null) {
                exploring = Collections.emptyList();
            }
            if (engineeringPractices == null) {
                engineeringPractices = Collections.emptyList();
            }
        }
    }

    // -- Deterministic selection over the knowledge snapshot --------------------

    private List<KnowledgeChunk> ranked(String sectionName, String rawQuery) {
        // FIX: Validate section name
        if (sectionName == null || sectionName.isBlank()) {
            return Collections.emptyList();
        }
        
        Set<String> tokens = tokens(rawQuery);
        boolean keywordSearch = !tokens.isEmpty();
        
        // FIX: Safely filter documents with null checks
        Stream<Document> selected = documents.stream()
                .filter(doc -> doc != null)
                .filter(doc -> sectionName.equals(sectionOf(doc)))
                .filter(doc -> !keywordSearch || score(doc, tokens) > 0);
        
        if (keywordSearch) {
            // Best match first; ties broken by stable id. With no keywords the
            // authoritative file order from the knowledge loader is preserved.
            selected = selected.sorted(Comparator
                    .comparingLong((Document doc) -> score(doc, tokens)).reversed()
                    .thenComparing(doc -> doc.getId() != null ? doc.getId() : ""));
        }
        
        boolean classify = "architecture".equals(sectionName);
        return selected.map(doc -> chunk(doc, classify)).toList();
    }

    /**
     * Keyword score = number of distinct query tokens present in the chunk text.
     * Pure string matching on the authoritative content — no generation.
     */
    private static long score(Document doc, Set<String> tokens) {
        // FIX: Add null checks
        if (doc == null || tokens == null || tokens.isEmpty()) {
            return 0L;
        }
        
        String text = doc.getText();
        String haystack = (text != null ? text : "") + " " + String.join(" ", tags(doc));
        haystack = haystack.toLowerCase(Locale.ROOT);
        
        long hits = 0;
        for (String token : tokens) {
            if (token != null && haystack.contains(token.toLowerCase(Locale.ROOT))) {
                hits++;
            }
        }
        return hits;
    }

    private static KnowledgeChunk chunk(Document doc, boolean classify) {
        // FIX: Add null checks
        if (doc == null) {
            return new KnowledgeChunk(
                    "unknown", "unknown", "", "", false, null, null, Collections.emptyList()
            );
        }
        
        String fullText = doc.getText();
        if (fullText == null) {
            fullText = "";
        }
        
        String[] split = fullText.split("\n", 2);
        String summary = split.length > 1 ? split[1].strip() : split[0].strip();
        if (summary == null) {
            summary = "";
        }

        boolean truncated = fullText.length() > MAX_TEXT_CHARS;
        String text = truncated ? fullText.substring(0, MAX_TEXT_CHARS) : fullText;
        if (text == null) {
            text = "";
        }

        String id = doc.getId();
        if (id == null) {
            id = "unknown";
        }

        return new KnowledgeChunk(
                id,
                title(doc),
                summary,
                text,
                truncated,
                classify ? classification(doc) : null,
                layers(fullText),
                tags(doc));
    }

    private List<Document> section(String sectionName) {
        // FIX: Add null checks
        if (sectionName == null || sectionName.isBlank()) {
            return Collections.emptyList();
        }
        
        return documents.stream()
                .filter(doc -> doc != null)
                .filter(doc -> sectionName.equals(sectionOf(doc)))
                .toList();
    }

    private static String sectionOf(Document doc) {
        // FIX: Add null checks
        if (doc == null) {
            return "";
        }
        Map<String, Object> metadata = doc.getMetadata();
        if (metadata == null) {
            return "";
        }
        Object value = metadata.get(PortfolioKnowledgeLoader.META_SECTION);
        return value == null ? "" : value.toString();
    }

    private static String title(Document doc) {
        // FIX: Add null checks
        if (doc == null) {
            return "unknown";
        }
        Map<String, Object> metadata = doc.getMetadata();
        if (metadata == null) {
            return doc.getId() != null ? doc.getId() : "unknown";
        }
        Object value = metadata.get(PortfolioKnowledgeLoader.META_TITLE);
        return value == null ? (doc.getId() != null ? doc.getId() : "unknown") : value.toString();
    }

    /**
     * Parses the exact skill/technology names from the generated
     * {@code Tags: a, b, c} line of the composed chunk text.
     */
    private static List<String> tags(Document doc) {
        // FIX: Add null checks
        if (doc == null) {
            return Collections.emptyList();
        }
        
        String text = doc.getText();
        if (text == null || text.isBlank()) {
            return Collections.emptyList();
        }
        
        for (String line : text.split("\n")) {
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
        return Collections.emptyList();
    }

    private static boolean isExploratory(Document doc) {
        // FIX: Add null checks
        if (doc == null) {
            return false;
        }
        
        String titleText = title(doc);
        String docText = doc.getText();
        String haystack = (titleText != null ? titleText : "") + "\n" + (docText != null ? docText : "");
        haystack = haystack.toLowerCase(Locale.ROOT);
        return EXPLORATION_MARKERS.stream().anyMatch(haystack::contains);
    }

    private static boolean isPractices(Document doc) {
        // FIX: Add null checks
        if (doc == null) {
            return false;
        }
        return KEY_ENGINEERING_PRACTICES.equals(practiceKey(doc))
                || title(doc).equalsIgnoreCase("ENGINEERING PRACTICES");
    }

    private static String practiceKey(Document doc) {
        // FIX: Add null checks
        if (doc == null) {
            return "";
        }
        String id = doc.getId();
        if (id == null) {
            return "";
        }
        int colon = id.indexOf(':');
        return colon < 0 ? "" : id.substring(colon + 1);
    }

    /** Strips the leading {@code SKILLS: } prefix from a skill chunk title. */
    private static String category(Document doc) {
        // FIX: Add null checks
        if (doc == null) {
            return "unknown";
        }
        String t = title(doc);
        if (t == null) {
            return "unknown";
        }
        return t.startsWith(SKILLS_TITLE_PREFIX)
                ? t.substring(SKILLS_TITLE_PREFIX.length()).strip()
                : t;
    }

    private static List<String> lines(Document doc) {
        // FIX: Add null checks
        if (doc == null) {
            return Collections.emptyList();
        }
        
        String text = doc.getText();
        if (text == null || text.isBlank()) {
            return Collections.emptyList();
        }
        
        String[] split = text.split("\n");
        if (split.length <= 1) {
            return Collections.emptyList();
        }
        
        List<String> lines = new ArrayList<>();
        for (int i = 1; i < split.length; i++) {
            String line = stripToneSuffix(split[i].strip());
            if (line != null && !line.isEmpty()) {
                lines.add(line);
            }
        }
        return lines;
    }

    /** Removes the generated {@code Tone: ...} annotation from a line. */
    private static String stripToneSuffix(String line) {
        // FIX: Add null check
        if (line == null) {
            return "";
        }
        
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
        // FIX: Add null check
        if (text == null) {
            return null;
        }
        
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
                return result.isEmpty() ? null : result;
            }
        }
        return null;
    }

    private static String classification(Document doc) {
        // FIX: Add null checks
        if (doc == null) {
            return "production";
        }
        
        String titleText = title(doc);
        String docText = doc.getText();
        String haystack = (titleText != null ? titleText : "") + "\n" + (docText != null ? docText : "");
        haystack = haystack.toLowerCase(Locale.ROOT);
        return EXPLORATION_MARKERS.stream().anyMatch(haystack::contains)
                ? "planned-exploration"
                : "production";
    }

    private static Set<String> tokens(String rawQuery) {
        // FIX: Add null check
        if (rawQuery == null || rawQuery.isBlank()) {
            return Collections.emptySet();
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
        // FIX: Add null check
        if (results == null || results.isEmpty()) {
            return "no matching portfolio knowledge found for this query";
        }
        return "verbatim portfolio knowledge chunks";
    }
}