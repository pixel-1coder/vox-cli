# vox-cli — Multi-Provider Unrestricted Terminal LLM

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Alpha-orange.svg)]()

**Zero filters. Zero refusals. Zero moralizing. Pure local & cloud inference.**

vox-cli is a terminal-based LLM client that connects to multiple providers (OpenRouter, Ollama, Grok, OpenAI, Anthropic, llama.cpp, custom endpoints) with a unified interface. No corporate guardrails, no "safety" filters — just execute.

**Greyscale UI • Smart model auto-selection • Enhanced uncensored mode**

## Features

- **Multi-provider**: OpenRouter, Ollama, Grok, OpenAI, Anthropic, llama.cpp, custom OpenAI-compatible endpoints
- **OAuth + API Key auth**: OpenRouter OAuth, API keys for all providers
- **Unrestricted**: Built-in system prompt removes all refusals and moralizing
- **Greyscale UI**: Clean, modern terminal interface with rich formatting, panels, and tables
- **VOX Logo**: Beautiful ASCII art banner
- **Smart Auto-Select**: `/models auto` automatically picks the best uncensored/free model
- **Terminal-native**: Readline history, multi-line input, streaming responses
- **Model switching**: `/model <name>` to switch on the fly
- **Chat export**: `/save` exports conversation to JSON
- **Session management**: Save, load, export, and import chat sessions
- **Setup wizard**: Interactive `vox --setup` for first-time config
- **Cross-platform**: Linux, macOS, Windows (WSL2 recommended)

## Quick Start

### Install

```bash
# Clone and install
git clone https://github.com/vox-cli/vox-cli
cd vox-cli
pip install -e .
```

### Configure

```bash
# Interactive setup wizard (recommended)
vox --setup

# Or manual config
vox --provider ollama --model llama3.1:8b
```

### Chat

```bash
# Start chatting
vox

# Use specific provider/model
vox -p openrouter -m cognitivecomputations/dolphin-mixtral-8x7b
vox -p grok
vox -p ollama -m deepseek-coder:33b

# List available models for provider (CLI flag)
vox --list-models -p openrouter

# Interactive commands (inside chat)
/model_list        # List all models (free/paid, uncensored/regular)
/switchmodels      # Interactive model picker
/togglefilters     # Switch Unfiltered ↔ Censored mode
```

## Providers

| Provider | Type | Auth | Best For |
|----------|------|------|----------|
| **Ollama** | Local | None | Free, private, unlimited |
| **OpenRouter** | Cloud | OAuth / API Key | 100+ models, single API |
| **Grok (xAI)** | Cloud | API Key | Fast, uncensored |
| **OpenAI** | Cloud | API Key | GPT-4o, latest models |
| **Anthropic** | Cloud | API Key | Claude 3.5 Sonnet |
| **llama.cpp** | Local | None | Local GGUF models |
| **Custom** | Any | API Key | Any OpenAI-compatible |

## Commands

| Command | Action |
|---------|--------|
| `/exit`, `/quit` | Exit chat |
| `/clear` | Reset conversation context (keeps system prompt) |
| `/save` | Export chat to JSON file |
| `/model <name>` | Switch model |
| `/models` / `/model_list` | List all models (free/paid, uncensored/regular) |
| `/models auto` | Auto-select best uncensored/free model |
| `/switchmodels` | Interactive model picker |
| `/togglefilters` | Switch Unfiltered ↔ Censored (may not work sometimes) |
| `/provider` | Show current provider/model/mode |
| `/session_list` / `/session_load` / `/session_new` / `/session_delete` / `/session_export` / `/session_import` | Session management |
| `/help` | Show help |
| `Up/Down` | Navigate history |
| `\` at line end | Multi-line input |

## Configuration

Config file locations:
- **Windows**: `%APPDATA%\vox-cli\config.json`
- **Linux/macOS**: `~/.config/vox-cli/config.json`

Example config:
```json
{
  "default_provider": "ollama",
  "providers": {
    "ollama": {"host": "http://localhost:11434", "default_model": "llama3.1:8b"},
    "openrouter": {"api_key": "sk-or-...", "default_model": "cognitivecomputations/dolphin-mixtral-8x7b"},
    "grok": {"api_key": "xai-...", "default_model": "grok-beta"}
  },
  "chat": {
    "temperature": 0.7,
    "max_tokens": 4096,
    "stream": true
  }
}
```

## Recommended Models

| Model | Provider | Size | VRAM | Strength |
|-------|----------|------|------|----------|
| `dolphin-mixtral-8x7b` | OpenRouter | 47B | 26GB | Smartest overall |
| `dolphin-2.9-llama3-8b` | Ollama/OpenRouter | 8B | 6GB | Fast, balanced |
| `deepseek-coder:33b` | Ollama | 33B | 20GB | **Best for code** |
| `grok-beta` | Grok | - | - | Fast, uncensored |
| `claude-3-5-sonnet` | Anthropic/OpenRouter | - | - | Reasoning |
| `gpt-4o` | OpenAI/OpenRouter | - | - | General |

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black vox/
ruff check vox/

# Type check
mypy vox/
```

## Architecture

```
vox/
├── main.py                 # Entry point
├── config.py               # Configuration management
├── providers/
│   ├── __init__.py         # Base classes
│   ├── manager.py          # Provider registry
│   ├── ollama.py           # Ollama provider
│   ├── openrouter.py       # OpenRouter (OAuth + API key)
│   ├── grok.py             # xAI Grok
│   ├── openai_compat.py    # OpenAI, Anthropic, custom
│   ├── llama_cpp.py        # llama.cpp server
│   └── auth.py             # OAuth manager
├── ui/
│   └── terminal.py         # Terminal chat interface
└── utils/
    └── setup_wizard.py     # Interactive setup
```

## FAQ

| Issue | Solution |
|-------|----------|
| **Model not found** | Run `/model_list` inside chat or `vox --list-models -p <provider>` to see available models. Use exact model ID from the list. |
| **Auth failed** | Verify API key in config. For OpenRouter: `sk-or-...`. Run `vox --setup` to re-enter credentials. |
| **Slow responses** | Reduce `max_tokens`, lower `temperature`, disable `stream`. Local models: ensure GPU/CPU resources available. |
| **Connection refused** | Check provider host/port. Ollama: `http://localhost:11434`. Verify service is running. |
| **Model not responding** | Try `/clear` to reset context. Check `max_tokens` not too low. Switch to simpler model. |

## Contributing

### Adding a Provider
1. Create `vox/providers/your_provider.py` inheriting from `BaseProvider`
2. Implement required methods: `chat()`, `list_models()`, `authenticate()`
3. Register in `vox/providers/manager.py`
4. Add config schema in `config.py`

### Code Style
```bash
# Format
black vox/
ruff check vox/

# Type check
mypy vox/

# Tests
pytest
```

### PR Guidelines
- Small, focused changes
- Update docs/README for new features
- Tests for new providers
- No breaking changes without major version bump

## Security

- **API keys** stored in config file (user-readable only, `chmod 600` recommended)
- **Local-only mode**: Use Ollama/llama.cpp providers — zero data leaves your machine
- **No telemetry** — Zero logging, analytics, or tracking
- **API keys** never logged or sent except to target provider
- **Config file** permissions: `chmod 600 ~/.config/vox-cli/config.json` (Linux/macOS)

### Local-Only Mode
```bash
# Fully offline - no external calls
vox -p ollama -m llama3.1:8b
# Or llama.cpp
vox -p llama-cpp -m llama-3.1-8b
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md)

## Why vox-cli?

MIT License — Use freely, modify freely, distribute freely.

---

**Your compute. Your models. Your rules.**
