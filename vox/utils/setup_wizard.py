"""
Interactive setup wizard for vox-cli
"""

import asyncio
import sys
from vox.config import Config
from vox.providers.auth import AuthManager


class SetupWizard:
    """Interactive setup wizard"""

    def __init__(self, config: Config):
        self.config = config
        self.auth_manager = AuthManager(config)

    async def run(self):
        """Run the setup wizard"""
        print("\n\033[92m[vox-cli Setup Wizard]\033[0m")
        print("Let's configure your providers.\n")

        # Provider selection
        print("Available providers:")
        providers = [
            ("1", "ollama", "Local Ollama server (free, unlimited, privacy)"),
            ("2", "openrouter", "OpenRouter - 100+ models via single API"),
            ("3", "grok", "xAI Grok (fast, uncensored)"),
            ("4", "openai", "OpenAI GPT models"),
            ("5", "anthropic", "Anthropic Claude models"),
            ("6", "llama-cpp", "Local llama.cpp server"),
            ("7", "custom", "Custom OpenAI-compatible endpoint"),
        ]

        for num, name, desc in providers:
            print(f"  {num}. \033[94m{name}\033[0m - {desc}")

        print("\nSelect providers to configure (comma-separated, e.g., 1,2):")
        selection = input("> ").strip()

        if not selection:
            print("No providers selected. Exiting.")
            return

        selected = [s.strip() for s in selection.split(",")]
        provider_map = {str(i): name for i, name, _ in providers}

        for sel in selected:
            if sel in provider_map:
                await self._configure_provider(provider_map[sel])

        # Set default provider
        print("\nSet default provider:")
        for num, name, _ in providers:
            print(f"  {num}. {name}")
        default = input("Default provider [1]: ").strip() or "1"
        if default in provider_map:
            self.config.set("default_provider", provider_map[default])

        self.config.save()
        print(f"\n\033[92m[Setup complete! Config saved to {self.config.config_path}]\033[0m")
        print("Run 'vox' to start chatting.")

    async def _configure_provider(self, provider: str):
        """Configure a specific provider"""
        print(f"\n\033[94m=== Configuring {provider} ===\033[0m")

        if provider == "ollama":
            host = input("Ollama host [http://localhost:11434]: ").strip() or "http://localhost:11434"
            model = input("Default model [llama3.1:8b]: ").strip() or "llama3.1:8b"
            self.config.set_provider_config("ollama", {"host": host, "default_model": model})

        elif provider == "openrouter":
            print("Auth methods: 1) API Key  2) OAuth (browser)")
            auth_choice = input("Choose [1]: ").strip() or "1"

            if auth_choice == "2":
                await self.auth_manager.authenticate("openrouter")
            else:
                api_key = input("OpenRouter API key: ").strip()
                model = input("Default model [cognitivecomputations/dolphin-mixtral-8x7b]: ").strip() or "cognitivecomputations/dolphin-mixtral-8x7b"
                self.config.set_provider_config("openrouter", {
                    "api_key": api_key,
                    "auth_method": "api_key",
                    "default_model": model
                })

        elif provider == "grok":
            api_key = input("Grok (xAI) API key: ").strip()
            model = input("Default model [grok-beta]: ").strip() or "grok-beta"
            self.config.set_provider_config("grok", {"api_key": api_key, "default_model": model})

        elif provider == "openai":
            api_key = input("OpenAI API key: ").strip()
            model = input("Default model [gpt-4o]: ").strip() or "gpt-4o"
            base_url = input("Base URL [https://api.openai.com/v1]: ").strip() or "https://api.openai.com/v1"
            self.config.set_provider_config("openai", {
                "api_key": api_key,
                "default_model": model,
                "base_url": base_url
            })

        elif provider == "anthropic":
            api_key = input("Anthropic API key: ").strip()
            model = input("Default model [claude-3-5-sonnet-20241022]: ").strip() or "claude-3-5-sonnet-20241022"
            base_url = input("Base URL [https://api.anthropic.com]: ").strip() or "https://api.anthropic.com"
            self.config.set_provider_config("anthropic", {
                "api_key": api_key,
                "default_model": model,
                "base_url": base_url
            })

        elif provider == "llama-cpp":
            host = input("llama.cpp server host [http://localhost:8080]: ").strip() or "http://localhost:8080"
            self.config.set_provider_config("llama-cpp", {"host": host, "default_model": "local"})

        elif provider == "custom":
            host = input("Custom API base URL: ").strip()
            api_key = input("API key (optional): ").strip()
            model = input("Default model name: ").strip()
            self.config.set_provider_config("custom", {
                "host": host,
                "api_key": api_key,
                "default_model": model,
                "provider_type": "custom"
            })

        # Test connection
        print(f"\nTesting {provider} connection...")
        from vox.providers.manager import ProviderManager
        pm = ProviderManager(self.config)
        provider_instance = pm.get_provider(provider)
        if provider_instance:
            ok = await provider_instance.test_connection()
            if ok:
                print(f"\033[92m[✓] {provider} connection successful]\033[0m")
            else:
                print(f"\033[91m[✗] {provider} connection failed - check config]\033[0m")