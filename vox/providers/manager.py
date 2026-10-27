"""
Provider manager - Handles provider instantiation and routing
"""

from typing import Dict, Optional, List
from vox.providers import BaseProvider
from vox.providers.ollama import OllamaProvider
from vox.providers.openrouter import OpenRouterProvider
from vox.providers.grok import GrokProvider
from vox.providers.openai_compat import OpenAICompatibleProvider
from vox.providers.llama_cpp import LlamaCppProvider
from vox.config import Config


class ProviderManager:
    """Manages all LLM providers"""

    PROVIDER_CLASSES = {
        "ollama": OllamaProvider,
        "openrouter": OpenRouterProvider,
        "grok": GrokProvider,
        "openai": OpenAICompatibleProvider,
        "anthropic": OpenAICompatibleProvider,
        "custom": OpenAICompatibleProvider,
        "llama-cpp": LlamaCppProvider,
    }

    def __init__(self, config: Config):
        self.config = config
        self._providers: Dict[str, BaseProvider] = {}

    def get_provider(self, name: str, host: Optional[str] = None) -> Optional[BaseProvider]:
        """Get or create provider instance"""
        name = name.lower()

        # Check cache
        cache_key = f"{name}:{host or ''}"
        if cache_key in self._providers:
            provider = self._providers[cache_key]
            if host:
                provider.config["host"] = host
            return provider

        # Get provider class
        provider_class = self.PROVIDER_CLASSES.get(name)
        if not provider_class:
            return None

        # Get config for this provider
        provider_config = self.config.get_provider_config(name).copy()

        # Override host if provided
        if host:
            provider_config["host"] = host

        # Set provider type for OpenAI-compatible
        if name in ("openai", "anthropic", "custom"):
            provider_config["provider_type"] = name

        # Create instance
        provider = provider_class(provider_config)
        self._providers[cache_key] = provider
        return provider

    def list_providers(self) -> List[str]:
        """List available provider names"""
        return list(self.PROVIDER_CLASSES.keys())

    def get_default_provider(self) -> str:
        """Get default provider name"""
        return self.config.get("default_provider", "ollama")

    async def test_all(self) -> Dict[str, bool]:
        """Test connection to all configured providers"""
        results = {}
        for name in self.PROVIDER_CLASSES:
            provider = self.get_provider(name)
            if provider:
                try:
                    results[name] = await provider.test_connection()
                except Exception:
                    results[name] = False
        return results