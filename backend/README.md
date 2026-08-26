# Portfolio AI Backend — Phase 4.1 Foundation

Spring Boot 3.5 + Spring AI 1.1 service that will back the portfolio's AI Lab.
Phase 4.1 is a **simple LLM integration only** — no RAG, no vector store, no
tools, no agents yet. Answers are grounded by an honest system prompt; AI work
is presented as exploration/future direction, never as professional experience.

## Requirements

- Java 17+
- Maven 3.9+

## Configuration (environment variables — never hardcoded)

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `SPRING_AI_OPENAI_API_KEY` | yes (for chat) | — | Provider API key |
| `SPRING_AI_OPENAI_BASE_URL` | no | `https://api.openai.com` | Point at any OpenAI-compatible provider |
| `SPRING_AI_OPENAI_MODEL` | no | `gpt-4o-mini` | Chat model id |
| `SPRING_AI_TEMPERATURE` | no | `0.3` | Sampling temperature |
| `PORTFOLIO_AI_SYSTEM_PROMPT` | no | honest portfolio prompt in `application.yml` | Override grounding prompt |
| `SERVER_PORT` | no | `8090` | HTTP port |

The API key is **required at startup** — Spring AI fails fast when it is
missing, so a misconfigured server never silently serves broken answers.

## Run

```bash
mvn spring-boot:run

# with a provider configured (required)
SPRING_AI_OPENAI_API_KEY=sk-... mvn spring-boot:run
```

Windows PowerShell:

```powershell
$env:SPRING_AI_OPENAI_API_KEY = "sk-..."; mvn spring-boot:run
```

> Note: `8080` is avoided by default because local Apache/XAMPP installs often
> occupy it. Override with `SERVER_PORT` if needed.

## API

### `POST /api/ai/chat`

```json
{ "message": "What technologies does Utkarsh use?" }
```

→ `200`

```json
{ "answer": "...", "source": "portfolio" }
```

Errors are structured JSON (`{"error": "..."}`): `400` validation/malformed
body, `502` provider failure, `503` missing provider configuration.

### `GET /api/ai/status`

Readiness probe for the Phase 4.6 Next.js integration — reports phase and
whether a provider key is configured, without revealing it.

## Tests

```bash
mvn verify
```

- Context test (full wiring with mocked `ChatModel`, no network)
- MockMvc endpoint tests (validation, response shape, error mapping)
- Unit test of the chat service (Mockito deep-stubbed fluent chain)

## Roadmap

| Phase | Scope |
|---|---|
| 4.1 (**this**) | Spring AI foundation, simple chat endpoint |
| 4.2 | Portfolio knowledge / RAG |
| 4.3 | Vector store |
| 4.4 | AI tools |
| 4.5 | Agent orchestration |
| 4.6 | Connect Next.js AI Lab to this backend |

Phase 4.6 is wired: the Next.js AI Lab calls this backend's
`POST /api/ai/agent/chat` through a Next.js route handler proxy
(`app/api/ai-agent-chat/route.ts`); the old frontend demo (`lib/ai-demo.ts`)
has been removed.
