# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **VOX Desktop App** - Native Windows app now available ([vox-app repo](https://github.com/pixel-1coder/vox-app))
- **Desktop download link** - Added to README
- **Greyscale UI overhaul** - Completely redesigned terminal interface with rich formatting
- **VOX logo** - ASCII art logo with greyscale gradient in banner
- **`/models` command** - Alias for `/model_list` to list all available models
- **`/models auto` / `/model auto`** - Auto-select best model based on scoring (uncensored, free, context length, quality)
- **Enhanced model display** - Beautiful tables with pricing, context, and model type indicators
- **VOX-CLI context in system prompt** - AI now knows it's running in vox-cli with available commands and features
- **QoL commands** - `/regen`, `/retry` (regenerate last response), `/continue` (continue truncated response), `/edit` (edit last message and regenerate), `/copy` (copy last response to clipboard)
- **Power user commands** - `/attach <file>` (attach file content to context), `/attachimg <image>` (attach image for vision models), `/session_search <q>` (search saved sessions)
- **Shell passthrough** - `!<cmd>` executes shell commands and feeds output to the AI
- **Thinking spinner** - Rich live spinner while waiting for response
- **Response rendering** - Markdown rendering via rich for AI responses
- **Error logging** - Errors now logged to `~/.vox_error.log` via `_log_error`
- **`/logs` command** - View error logs from the CLI
- **Markdown + syntax rendering** - Rich `Markdown` + `Syntax` for AI responses
- **Status bar** - Live token count, cost estimate, mode, attachment count
- **Session auto-title** - Auto-generate session title from first user message

### Changed
- **Uncensored mode** - Significantly stronger system prompt with explicit override instructions
- **UI styling** - Switched to greyscale theme with panels, tables, and cleaner layouts using rich
- **Help menu** - Redesigned with rich tables showing all commands
- **Model selector** - Improved visual design with greyscale styling

### Fixed
- OpenRouter model `cognitivecomputations/dolphin-mixtral-8x7b` deprecated → replaced with current models
- Terminal crash fixes and console encoding fixes for Windows
- Various UI bugs

## [0.1.0] - 2024-XX-XX

### Added
- Initial release of vox-cli
- Multi-provider support: OpenRouter, Ollama, Grok, OpenAI, Anthropic, llama.cpp
- OAuth + API Key authentication
- Terminal-native chat with readline history
- Model switching with `/model` command
- Streaming responses
- Configuration management
- Provider manager architecture
- Interactive setup wizard (`vox --setup`)

### Security
- Local-only mode (Ollama/llama.cpp)
- API key encryption in config
- No telemetry/analytics

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 0.1.0 | 2024-XX-XX | Initial release |
| Unreleased | 2026-10-30 | Desktop app release, greyscale UI, /models auto, QoL/power user features |

---

For the latest changes, see [GitHub Releases](https://github.com/pixel-1coder/vox-cli/releases).
For the desktop app, see [vox-app Releases](https://github.com/pixel-1coder/vox-app/releases).
