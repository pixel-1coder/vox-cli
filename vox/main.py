#!/usr/bin/env python3
"""
vox-cli — Multi-provider unrestricted terminal LLM client
"""

import asyncio
import argparse
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from vox.config import Config
from vox.ui.terminal import TerminalChat
from vox.providers.manager import ProviderManager


def main():
    parser = argparse.ArgumentParser(
        description="vox-cli — Unrestricted multi-provider terminal LLM",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  vox                           # Interactive chat with default provider
  vox -p openrouter             # Use OpenRouter provider
  vox -p ollama -m llama3.1     # Use Ollama with specific model
  vox --setup                   # Run interactive setup wizard
  vox --list-providers          # Show available providers
  vox --list-models -p openrouter  # List models for provider
        """
    )

    parser.add_argument("-p", "--provider", help="Provider to use (openrouter, ollama, grok, openai, anthropic, llama-cpp)")
    parser.add_argument("-m", "--model", help="Model name")
    parser.add_argument("--host", help="Custom host URL (for ollama, llama-cpp, custom OpenAI-compatible)")
    parser.add_argument("--setup", action="store_true", help="Run interactive setup wizard")
    parser.add_argument("--list-providers", action="store_true", help="List available providers")
    parser.add_argument("--list-models", action="store_true", help="List models for provider")
    parser.add_argument("--auth", help="Authenticate with provider (openrouter, grok, etc.)")
    parser.add_argument("--config-oauth", nargs=3, metavar=("PROVIDER", "CLIENT_ID", "CLIENT_SECRET"),
                        help="Configure OAuth credentials: --config-oauth openrouter <client_id> <client_secret>")
    parser.add_argument("--config", help="Path to config file")
    parser.add_argument("--no-stream", action="store_true", help="Disable streaming")
    parser.add_argument("--temperature", type=float, default=0.7, help="Sampling temperature")
    parser.add_argument("--max-tokens", type=int, default=4096, help="Max tokens per response")
    parser.add_argument("--system", help="System prompt")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")

    args = parser.parse_args()

    # Load config
    config = Config(args.config)

    # Handle special commands
    if args.setup:
        asyncio.run(run_setup(config))
        return

    if args.list_providers:
        list_providers()
        return

    if args.config_oauth:
        provider, client_id, client_secret = args.config_oauth
        config.set_provider_config(provider, {
            **config.get_provider_config(provider),
            "oauth_client_id": client_id,
            "oauth_client_secret": client_secret,
        })
        config.save()
        print(f"[✓] OAuth credentials saved for {provider}")
        print(f"Run 'vox --auth {provider}' to authenticate")
        return

    if args.auth:
        asyncio.run(authenticate_provider(config, args.auth))
        return

    # Initialize provider manager
    provider_manager = ProviderManager(config)

    # Determine provider
    provider_name = args.provider or config.get("default_provider", "ollama")

    if args.list_models:
        asyncio.run(list_models(provider_manager, provider_name, args.host))
        return

    # Get provider
    provider = provider_manager.get_provider(provider_name, host=args.host)
    if not provider:
        print(f"[Error] Unknown provider: {provider_name}")
        print("Run 'vox --list-providers' to see available providers")
        sys.exit(1)

    # Set model if specified
    model = args.model or config.get(f"providers.{provider_name}.default_model")

    # Run terminal chat
    chat = TerminalChat(
        provider=provider,
        model=model,
        temperature=args.temperature,
        max_tokens=args.max_tokens,
        system_prompt=args.system,
        stream=not args.no_stream,
        verbose=args.verbose,
        config=config
    )

    try:
        asyncio.run(chat.run())
    except KeyboardInterrupt:
        print("\n[Goodbye]")
    except Exception as e:
        print(f"[Error] {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


async def run_setup(config: Config):
    """Interactive setup wizard"""
    from vox.utils.setup_wizard import SetupWizard
    wizard = SetupWizard(config)
    await wizard.run()


def list_providers():
    """List available providers"""
    print("\n[Available Providers]")
    print("  openrouter    - OpenRouter (100+ models, OAuth + API key)")
    print("  ollama        - Local Ollama server (free, unlimited)")
    print("  grok          - xAI Grok (API key)")
    print("  openai        - OpenAI API (API key)")
    print("  anthropic     - Anthropic Claude (API key)")
    print("  llama-cpp     - Local llama.cpp server (free, unlimited)")
    print("  custom        - Any OpenAI-compatible endpoint")
    print()


async def list_models(provider_manager: ProviderManager, provider_name: str, host: str = None):
    """List models for a provider"""
    provider = provider_manager.get_provider(provider_name, host=host)
    if not provider:
        print(f"[Error] Unknown provider: {provider_name}")
        return

    print(f"\n[Fetching models for {provider_name}...]")
    try:
        models = await provider.list_models()
        print(f"\n[Models for {provider_name}]")
        for model in models:
            print(f"  {model['id']} - {model.get('description', 'No description')}")
    except Exception as e:
        print(f"[Error] Failed to fetch models: {e}")


async def authenticate_provider(config: Config, provider_name: str):
    """Authenticate with a provider"""
    from vox.providers.auth import AuthManager
    auth_manager = AuthManager(config)
    await auth_manager.authenticate(provider_name)


if __name__ == "__main__":
    main()