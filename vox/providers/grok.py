"""
Grok (xAI) provider
"""

import aiohttp
import json
from typing import List, AsyncGenerator
from vox.providers import BaseProvider, Model, Message


class GrokProvider(BaseProvider):
    """xAI Grok provider"""

    def __init__(self, config: dict):
        super().__init__(config)
        self.api_key = config.get("api_key", "")
        self.default_model = config.get("default_model", "grok-beta")
        self.base_url = "https://api.x.ai/v1"

    def get_headers(self) -> dict:
        headers = super().get_headers()
        if self.api_key:
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
                    yield f"[Error] Grok: {error}"
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
        return [
            Model(id="grok-beta", name="Grok Beta", description="xAI's Grok beta model", context_length=131072),
            Model(id="grok-vision-beta", name="Grok Vision Beta", description="Grok with vision capabilities", context_length=131072),
        ]

    async def test_connection(self) -> bool:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get("https://api.x.ai/v1/models", headers=self.get_headers(), timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    return resp.status == 200
        except Exception:
            return False