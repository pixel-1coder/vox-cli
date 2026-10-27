"""
Ollama provider - Local LLM inference
"""

import aiohttp
import json
from typing import List, AsyncGenerator
from vox.providers import BaseProvider, Model, Message


class OllamaProvider(BaseProvider):
    """Ollama local provider"""

    def __init__(self, config: dict):
        super().__init__(config)
        self.host = config.get("host", "http://localhost:11434")
        self.default_model = config.get("default_model", "llama3.1:8b")

    async def chat(
        self,
        messages: List[Message],
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        stream: bool = True,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Stream chat from Ollama"""
        url = f"{self.host}/api/chat"

        payload = {
            "model": model,
            "messages": self.format_messages(messages),
            "stream": stream,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
                **kwargs.get("options", {})
            }
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as resp:
                if resp.status != 200:
                    error = await resp.text()
                    yield f"[Error] Ollama: {error}"
                    return

                if stream:
                    async for line in resp.content:
                        if line:
                            try:
                                data = json.loads(line)
                                if "message" in data and "content" in data["message"]:
                                    yield data["message"]["content"]
                                if data.get("done", False):
                                    break
                            except json.JSONDecodeError:
                                continue
                else:
                    data = await resp.json()
                    yield data.get("message", {}).get("content", "")

    async def list_models(self) -> List[Model]:
        """List available Ollama models"""
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.host}/api/tags") as resp:
                if resp.status != 200:
                    return []

                data = await resp.json()
                models = []
                for m in data.get("models", []):
                    models.append(Model(
                        id=m["name"],
                        name=m["name"],
                        description=f"Size: {m.get('size', 0) / 1e9:.1f}GB",
                        context_length=4096  # Default, varies by model
                    ))
                return models

    async def test_connection(self) -> bool:
        """Test Ollama connection"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.host}/api/tags", timeout=aiohttp.ClientTimeout(total=5)) as resp:
                    return resp.status == 200
        except Exception:
            return False

    async def pull_model(self, model: str) -> AsyncGenerator[str, None]:
        """Pull a model from Ollama registry"""
        url = f"{self.host}/api/pull"
        payload = {"name": model, "stream": True}

        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as resp:
                async for line in resp.content:
                    if line:
                        try:
                            data = json.loads(line)
                            if "status" in data:
                                yield data["status"]
                        except json.JSONDecodeError:
                            continue