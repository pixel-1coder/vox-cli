"""
OpenRouter provider - 100+ models via single API
Supports API key and OAuth authentication
"""

import aiohttp
import json
import os
from typing import List, AsyncGenerator
from vox.providers import BaseProvider, Model, Message


class OpenRouterProvider(BaseProvider):
    """OpenRouter provider with API key and OAuth support"""

    def __init__(self, config: dict):
        super().__init__(config)
        self.api_key = config.get("api_key", "")
        self.auth_method = config.get("auth_method", "api_key")
        self.default_model = config.get("default_model", "cognitivecomputations/dolphin-mixtral-8x7b")
        self.base_url = "https://openrouter.ai/api/v1"
        self.oauth_token = config.get("oauth_token", "")

    def get_headers(self) -> dict:
        headers = super().get_headers()
        headers["HTTP-Referer"] = "https://github.com/vox-cli"
        headers["X-Title"] = "vox-cli"

        if self.auth_method == "oauth" and self.oauth_token:
            headers["Authorization"] = f"Bearer {self.oauth_token}"
        elif self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        return headers

    async def chat(
        self,
        messages: List[Message],
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        stream: bool = True,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Stream chat from OpenRouter"""
        url = f"{self.base_url}/chat/completions"

        payload = {
            "model": model,
            "messages": self.format_messages(messages),
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream,
            **kwargs
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=self.get_headers()) as resp:
                if resp.status != 200:
                    error = await resp.text()
                    yield f"[Error] OpenRouter: {error}"
                    return

                if stream:
                    async for line in resp.content:
                        line = line.decode("utf-8").strip()
                        if line.startswith("data: "):
                            data_str = line[6:]
                            if data_str == "[DONE]":
                                break
                            try:
                                data = json.loads(data_str)
                                if "choices" in data and data["choices"]:
                                    delta = data["choices"][0].get("delta", {})
                                    if "content" in delta:
                                        yield delta["content"]
                            except json.JSONDecodeError:
                                continue
                else:
                    data = await resp.json()
                    if "choices" in data and data["choices"]:
                        yield data["choices"][0]["message"].get("content", "")

    async def list_models(self) -> List[Model]:
        """List available OpenRouter models"""
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.base_url}/models", headers=self.get_headers()) as resp:
                if resp.status != 200:
                    return []

                data = await resp.json()
                models = []
                for m in data.get("data", []):
                    models.append(Model(
                        id=m["id"],
                        name=m.get("name", m["id"]),
                        description=m.get("description", ""),
                        context_length=m.get("context_length", 4096),
                        pricing=m.get("pricing", {}),
                        capabilities=["chat"]
                    ))
                return models

    async def test_connection(self) -> bool:
        """Test OpenRouter connection"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/models", headers=self.get_headers(), timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    return resp.status == 200
        except Exception:
            return False

    def set_oauth_token(self, token: str):
        """Set OAuth token"""
        self.oauth_token = token
        self.config["oauth_token"] = token