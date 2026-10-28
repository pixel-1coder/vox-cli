"""
MCP (Model Context Protocol) support for vox-cli
Enables LLM tool use via MCP servers
"""

from .client import MCPClient, MCPTool
from .servers import FilesystemServer, GitServer, ShellServer, WebSearchServer
from .registry import MCPRegistry, discover_servers

__all__ = [
    "MCPClient",
    "MCPTool",
    "FilesystemServer",
    "GitServer", 
    "ShellServer",
    "WebSearchServer",
    "MCPRegistry",
    "discover_servers",
]