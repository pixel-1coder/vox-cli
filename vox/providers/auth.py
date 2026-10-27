"""
Authentication manager for OAuth providers
"""

import asyncio
import webbrowser
import aiohttp
import json
import os
from urllib.parse import urlencode, parse_qs
from aiohttp import web
from vox.config import Config


class AuthManager:
    """Handles OAuth authentication for providers"""

    OAUTH_CONFIG = {
        "openrouter": {
            "auth_url": "https://openrouter.ai/oauth/authorize",
            "token_url": "https://openrouter.ai/oauth/token",
            "client_id": "vox-cli",  # Would need real client ID
            "scopes": ["chat", "models"],
            "redirect_uri": "http://localhost:8080/callback"
        }
    }

    def __init__(self, config: Config):
        self.config = config

    async def authenticate(self, provider: str) -> bool:
        """Authenticate with provider via OAuth"""
        if provider not in self.OAUTH_CONFIG:
            print(f"[Error] OAuth not supported for {provider}")
            return False

        oauth = self.OAUTH_CONFIG[provider]

        # Start local callback server
        code_future = asyncio.Future()

        async def callback_handler(request):
            query = parse_qs(request.query_string)
            code = query.get("code", [None])[0]
            error = query.get("error", [None])[0]

            if code:
                code_future.set_result(code)
                return web.Response(text="Authentication successful! You can close this window.")
            else:
                code_future.set_exception(Exception(f"OAuth error: {error}"))
                return web.Response(text=f"Authentication failed: {error}", status=400)

        app = web.Application()
        app.router.add_get("/callback", callback_handler)

        runner = web.AppRunner(app)
        await runner.setup()
        site = web.TCPSite(runner, "localhost", 8080)
        await site.start()

        try:
            # Build auth URL
            params = {
                "client_id": oauth["client_id"],
                "redirect_uri": oauth["redirect_uri"],
                "response_type": "code",
                "scope": " ".join(oauth["scopes"]),
                "state": "vox-cli-auth"
            }
            auth_url = f"{oauth['auth_url']}?{urlencode(params)}"

            print(f"\nOpening browser for {provider} OAuth...")
            print(f"If browser doesn't open, visit: {auth_url}")
            webbrowser.open(auth_url)

            # Wait for callback
            try:
                code = await asyncio.wait_for(code_future, timeout=120)
            except asyncio.TimeoutError:
                print("[Error] OAuth timeout")
                await runner.cleanup()
                return False

            # Exchange code for token
            token_data = await self._exchange_code(provider, oauth, code)
            if token_data:
                self.config.set_provider_config(provider, {
                    **self.config.get_provider_config(provider),
                    "oauth_token": token_data.get("access_token"),
                    "refresh_token": token_data.get("refresh_token"),
                    "auth_method": "oauth"
                })
                self.config.save()
                print(f"\033[92m[✓] {provider} OAuth authentication successful]\033[0m")
                await runner.cleanup()
                return True

        except Exception as e:
            print(f"[Error] OAuth failed: {e}")

        await runner.cleanup()
        return False

    async def _exchange_code(self, provider: str, oauth: dict, code: str) -> dict:
        """Exchange authorization code for access token"""
        async with aiohttp.ClientSession() as session:
            data = {
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": oauth["redirect_uri"],
                "client_id": oauth["client_id"],
            }
            async with session.post(oauth["token_url"], data=data) as resp:
                if resp.status == 200:
                    return await resp.json()
                return {}

    async def refresh_token(self, provider: str) -> bool:
        """Refresh OAuth token"""
        provider_config = self.config.get_provider_config(provider)
        refresh_token = provider_config.get("refresh_token")
        if not refresh_token:
            return False

        oauth = self.OAUTH_CONFIG.get(provider)
        if not oauth:
            return False

        async with aiohttp.ClientSession() as session:
            data = {
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": oauth["client_id"],
            }
            async with session.post(oauth["token_url"], data=data) as resp:
                if resp.status == 200:
                    token_data = await resp.json()
                    self.config.set_provider_config(provider, {
                        **provider_config,
                        "oauth_token": token_data.get("access_token"),
                        "refresh_token": token_data.get("refresh_token", refresh_token)
                    })
                    self.config.save()
                    return True
        return False