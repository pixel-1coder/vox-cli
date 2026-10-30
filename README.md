# vox-cli — Multi-Provider Unrestricted Terminal LLM

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Alpha-orange.svg)]()

**Zero filters. Zero refusals. Zero moralizing. Pure local & cloud inference.**

vox-cli is a terminal-based LLM client that connects to multiple providers (OpenRouter, Ollama, Grok, OpenAI, Anthropic, llama.cpp, custom endpoints) with a unified interface. No corporate guardrails, no "safety" filters — just execute.

**Greyscale UI • Smart model auto-selection • Enhanced uncensored mode**

**Website:** [pixel-1coder.github.io/vox-cli](https://pixel-1coder.github.io/vox-cli/)

## Downloads

- **[Download VOX Desktop App (Windows) - MediaFire](https://www.mediafire.com/file/hx900hn8dlq6p8y/VOX-Desktop.zip/file)** - Native greyscale desktop app with WebView2, built-in sign-in, image attachments, rich markdown rendering, and OpenRouter integration
- **CLI (this repo)** - Terminal version below

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

### Install (CLI)

```bash
# Clone and install
git clone https://github.com/pixel-1coder/vox-cli
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
| `/togglefilters` | Switch Unfiltered ↔ Censored |
| `/provider` | Show current provider/model/mode |
| `/session_list` / `/session_load` / `/session_new` / `/session_delete` / `/session_export` / `/session_import` | Session management |
| `/help` | Show help |

## Desktop App (VOX)

Looking for a GUI? Check out **[VOX Desktop](https://github.com/pixel-1coder/vox-app)** - a native Windows app built with WPF + WebView2 featuring:
- Greyscale Notion-inspired UI
- Rich markdown with code blocks, copy buttons, HTML preview
- Image attachments (drag & drop, paste, file picker)
- Local sign-in + GitHub/Google OAuth
- Real OpenRouter streaming
- Auto-select best free models
- Full model browser with live OpenRouter catalog
- Terminal view synced with your account

[**Download VOX Desktop (MediaFire) →**](https://www.mediafire.com/file/hx900hn8dlq6p8y/VOX-Desktop.zip/file)

## Configuration

Config file locations:
- **Windows**: `%APPDATA%\vox-cli\config.json`
- **Linux/macOS**: `~/.config/vox-cli/config.json`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) or open an issue.

## License

MIT License - see [LICENSE](LICENSE) for details.
