"""
OpenAI-compatible provider - Works with any OpenAI-compatible API
Supports: OpenAI, Anthropic, custom endpoints, local proxies
"""

import aiohttp
import json
from typing import List, AsyncGenerator
from vox.providers import BaseProvider, Model, Message


class OpenAICompatibleProvider(BaseProvider):
    """Generic OpenAI-compatible API provider"""

    def __init__(self, config: dict):
        super().__init__(config)
        self.api_key = config.get("api_key", "")
        self.base_url = config.get("base_url", "https://api.openai.com/v1").rstrip("/")
        self.default_model = config.get("default_model", "gpt-4o")
        self.provider_type = config.get("provider_type", "openai")  # openai, anthropic, custom

    def get_headers(self) -> dict:
        headers = super().get_headers()
        if self.api_key:
            if self.provider_type == "anthropic":
                headers["x-api-key"] = self.api_key
                headers["anthropic-version"] = "2023-06-01"
            else:
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
        # Anthropic uses different endpoint format
        if self.provider_type == "anthropic":
            return await self._chat_anthropic(messages, model, temperature, max_tokens, stream, **kwargs)
        else:
            return await self._chat_openai(messages, model, temperature, max_tokens, stream, **kwargs)

    async def _chat_openai(
        self,
        messages: List[Message],
        model: str,
        temperature: float,
        max_tokens: int,
        stream: bool,
        **kwargs
    ) -> AsyncGenerator[str, None]:
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
                    yield f"[Error] {self.provider_type}: {error}"
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

    async def _chat_anthropic(
        self,
        messages: List[Message],
        model: str,
        temperature: float,
        max_tokens: int,
        stream: bool,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        url = f"{self.base_url}/v1/messages"

        # Convert messages to Anthropic format
        system_msg = None
        anthropic_messages = []
        for m in messages:
            if m.role == "system":
                system_msg = m.content
            else:
                anthropic_messages.append({"role": m.role, "content": m.content})

        payload = {
            "model": model,
            "messages": anthropic_messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": stream,
            **kwargs
        }
        if system_msg:
            payload["system"] = system_msg

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, headers=self.get_headers()) as resp:
                if resp.status != 200:
                    error = await resp.text()
                    yield f"[Error] Anthropic: {error}"
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
                                if data.get("type") == "content_block_delta":
                                    delta = data.get("delta", {})
                                    if delta.get("type") == "text_delta":
                                        yield delta.get("text", "")
                            except json.JSONDecodeError:
                                continue
                else:
                    data = await resp.json()
                    if "content" in data:
                        for block in data["content"]:
                            if block.get("type") == "text":
                                yield block.get("text", "")

    async def list_models(self) -> List[Model]:
        if self.provider_type == "anthropic":
            return [
                Model(id="claude-3-5-sonnet-20241022", name="Claude 3.5 Sonnet", context_length=200000),
                Model(id="claude-3-opus-20240229", name="Claude 3 Opus", context_length=200000),
                Model(id="claude-3-haiku-20240307", name="Claude 3 Haiku", context_length=200000),
            ]
        else:
            # Try to fetch from API
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(f"{self.base_url}/models", headers=self.get_headers()) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            models = []
                            for m in data.get("data", []):
                                models.append(Model(
                                    id=m["id"],
                                    name=m.get("name", m["id"]),
                                    context_length=4096
                                ))
                            return models
            except Exception:
                pass
            # Fallback
            return [
                Model(id="gpt-4o", name="GPT-4o", context_length=128000),
                Model(id="gpt-4o-mini", name="GPT-4o Mini", context_length=128000),
                Model(id="gpt-4-turbo", name="GPT-4 Turbo", context_length=128000),
            ]

    async def test_connection(self) -> bool:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.base_url}/models", headers=self.get_headers(), timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    return resp.status == 200
        except Exception:
            return False