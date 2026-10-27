"""
Provider base classes and manager
"""

from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, AsyncGenerator
from dataclasses import dataclass


@dataclass
class Model:
    """Model information"""
    id: str
    name: str = ""
    description: str = ""
    context_length: int = 4096
    pricing: Dict[str, float] = None
    capabilities: List[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name or self.id,
            "description": self.description,
            "context_length": self.context_length,
            "pricing": self.pricing,
            "capabilities": self.capabilities
        }


@dataclass
class Message:
    """Chat message"""
    role: str  # system, user, assistant
    content: str
    name: Optional[str] = None


class BaseProvider(ABC):
    """Base class for all LLM providers"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.name = self.__class__.__name__.replace("Provider", "").lower()

    @abstractmethod
    async def chat(
        self,
        messages: List[Message],
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 4096,
        stream: bool = True,
        **kwargs
    ) -> AsyncGenerator[str, None]:
        """Send chat request and yield response chunks"""
        pass

    @abstractmethod
    async def list_models(self) -> List[Model]:
        """List available models"""
        pass

    @abstractmethod
    async def test_connection(self) -> bool:
        """Test if provider is accessible"""
        pass

    def get_headers(self) -> Dict[str, str]:
        """Get default headers"""
        return {
            "Content-Type": "application/json",
            "User-Agent": "vox-cli/0.1.0"
        }

    def format_messages(self, messages: List[Message]) -> List[Dict[str, Any]]:
        """Format messages for API"""
        return [
            {"role": m.role, "content": m.content, **({"name": m.name} if m.name else {})}
            for m in messages
        ]