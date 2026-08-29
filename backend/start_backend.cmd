@echo off
set SPRING_AI_OLLAMA_CHAT_MODEL=qwen2.5-coder:3b
set PORTFOLIO_AI_AGENT_ENABLED=true
mvn spring-boot:run > run.log 2>&1