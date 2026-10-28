# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New terminal commands: `/model_list`, `/switchmodels`, `/togglefilters`
- Interactive model picker with free/paid/uncensored categorization
- Filter toggle between Unfiltered and Censored modes
- README documentation for all new commands

### Changed
- Removed PyPI install option from README (source-only distribution)
- Updated README with new command documentation

### Fixed
- OpenRouter model `cognitivecomputations/dolphin-mixtral-8x7b` deprecated → replaced with current models
- React web UI compilation errors fixed (Header, ModelSelector, Sidebar, ProviderSelector, ChatArea, App)
- ChatArea message variable bug (`message` → `msg`)
- ProviderSelector OAuth hook ordering (useState before early return)
- Header.js `llama-cpp` key quoting
- Sidebar.js duplicate SectionTitle import
- ModelSelector categories array syntax

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

---

For the latest changes, see [GitHub Releases](https://github.com/pixel-1coder/vox-cli/releases).