"""
llama.cpp server provider - Local inference via llama.cpp server
"""

import aiohttp
import json
from typing import List, AsyncGenerator
from vox.providers import BaseProvider, Model, Message


class LlamaCppProvider(BaseProvider):
    """llama.cpp server provider (OpenAI-compatible)"""

    def __init__(self, config: dict):
        super().__init__(config)
        self.host = config.get("host", "http://localhost:8080")
        self.default_model = config.get("default_model", "local")

    async def chat(
        self,
        messages: List[Message],
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        stream: bool = True,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        url = f"{self.host}/v1/chat/completions"

        payload = {
            "model": model,
            "messages": self.format_messages(messages),
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream,
            **kwargs
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as resp:
                if resp.status != 200:
                    error = await resp.text()
                    yield f"[Error] llama.cpp: {error}"
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
        """List models loaded in llama.cpp server"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.host}/v1/models") as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        models = []
                        for m in data.get("data", []):
                            models.append(Model(
                                id=m["id"],
                                name=m.get("name", m["id"]),
                                context_length=8192
                            ))
                        return models
        except Exception:
            pass
        return [Model(id="local", name="Local Model", context_length=8192)]

    async def test_connection(self) -> bool:
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.host}/v1/models", timeout=aiohttp.ClientTimeout(total=5)) as resp:
                    return resp.status == 200
        except Exception:
            return False

    async def get_slots(self) -> dict:
        """Get llama.cpp server slots info"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.host}/slots") as resp:
                    if resp.status == 200:
                        return await resp.json()
        except Exception:
            pass
        return {}