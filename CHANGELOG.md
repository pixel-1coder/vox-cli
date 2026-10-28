# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Greyscale UI overhaul** - Completely redesigned terminal interface with rich formatting
- **VOX logo** - ASCII art logo with greyscale gradient in banner
- **`/models` command** - Alias for `/model_list` to list all available models
- **`/models auto` / `/model auto`** - Auto-select best model based on scoring (uncensored, free, context length, quality)
- **Enhanced model display** - Beautiful tables with pricing, context, and model type indicators
- **VOX-CLI context in system prompt** - AI now knows it's running in vox-cli with available commands and features
- **Toggle note** - `/togglefilters` now shows "(this may not work sometimes)"
- **QoL commands** - `/regen`, `/retry` (regenerate last response), `/continue` (continue truncated response), `/edit` (edit last message and regenerate), `/copy` (copy last response to clipboard)
- **Power user commands** - `/attach <file>` (attach file content to context), `/attachimg <image>` (attach image for vision models), `/session_search <q>` (search saved sessions)
- **Shell passthrough** - `!<cmd>` executes shell commands and feeds output to the AI
- **Thinking spinner** - Rich live spinner while waiting for response
- **Response rendering** - Markdown rendering via rich for AI responses

### Changed
- **Uncensored mode** - Significantly stronger system prompt with explicit override instructions
- **UI styling** - Switched to greyscale theme with panels, tables, and cleaner layouts using rich
- **Help menu** - Redesigned with rich tables showing all commands including new features
- **Model selector** - Improved visual design with greyscale styling
- System prompt now properly enforced at the beginning of conversation
- System prompt correctly replaced when toggling filters
- New terminal commands: `/model_list`, `/switchmodels`, `/togglefilters`
- Interactive model picker with free/paid/uncensored categorization
- Filter toggle between Unfiltered and Censored modes
- README documentation for all new commands

### Fixed
- OpenRouter model `cognitivecomputations/dolphin-mixtral-8x7b` deprecated → replaced with current models
- React web UI compilation errors fixed (Header, ModelSelector, Sidebar, ProviderSelector, ChatArea, App)
- ChatArea message variable bug (`message` → `msg`)
- ProviderSelector OAuth hook ordering (useState before early return)
- Header.js `llama-cpp` key quoting
- Sidebar.js duplicate SectionTitle import
- ModelSelector categories array syntax
- **Terminal crash fix** - Added missing `session_title`, `_attachments`, `_images`, `_last_assistant`, `_cached_models`, `show_reasoning`, `_mcp_manager` attributes to `TerminalChat.__init__`
- **Terminal crash fix** - Cleaned duplicate system-prompt injection logic in `TerminalChat.__init__`
- **Console encoding fix** - Forced UTF-8 output on `sys.stdout`/`sys.stderr` to fix Windows banner/codec errors

### Added (continued - error handling & logs)
- **Error logging** - Errors now logged to `~/.vox_error.log` via `_log_error`
- **`/logs` command** - View error logs from the CLI
- **Chat loop resilience** - Wrapped command handling and message sending in try/except with error logging
- **MCP disabled** - Removed MCP manager integration pending re-evaluation

### Added (continued - power user / UI UX)
- **Markdown + syntax rendering** - Rich `Markdown` + `Syntax` for AI responses
- **Status bar** - Live token count, cost estimate, mode, attachment count
- **Session auto-title** - Auto-generate session title from first user message

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

### Fixed
- OAuth token refresh logic
- Config file permissions
- Provider connection handling

---

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 0.1.0 | 2024-XX-XX | Initial release |
| 0.1.1 | 2024-XX-XX | Bug fixes, new commands |
| Unreleased | 2026-10-28 | Greyscale UI, /models auto, QoL/power user, error handling, console fix |

---

For the latest changes, see [GitHub Releases](https://github.com/pixel-1coder/vox-cli/releases).