"""
Authentication manager for OAuth providers
Supports: OpenRouter, GitHub, Google, etc. with browser-based auth
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
            "scopes": ["chat", "models", "models.read"],
            "redirect_uri": "http://localhost:8080/callback",
            "help_url": "https://openrouter.ai/settings/keys"
        },
        "github": {
            "auth_url": "https://github.com/login/oauth/authorize",
            "token_url": "https://github.com/login/oauth/access_token",
            "scopes": ["read:user", "user:email"],
            "redirect_uri": "http://localhost:8080/callback",
            "help_url": "https://github.com/settings/developers"
        }
    }

    def __init__(self, config: Config):
        self.config = config

    async def authenticate(self, provider: str) -> bool:
        """Authenticate with provider via OAuth - opens browser tab"""
        if provider not in self.OAUTH_CONFIG:
            print(f"[Error] OAuth not supported for {provider}")
            print(f"Supported: {', '.join(self.OAUTH_CONFIG.keys())}")
            return False

        oauth = self.OAUTH_CONFIG[provider]

        # Get client credentials from config
        client_id = self.config.get(f"providers.{provider}.oauth_client_id")
        client_secret = self.config.get(f"providers.{provider}.oauth_client_secret")

        if not client_id or not client_secret:
            print(f"\n[Setup Required] {provider} OAuth needs Client ID & Secret")
            print(f"1. Go to: {oauth['help_url']}")
            print(f"2. Create OAuth App with redirect: {oauth['redirect_uri']}")
            print(f"3. Run: vox --config-oauth {provider} <client_id> <client_secret>")
            return False

        # Start local callback server
        code_future = asyncio.Future()

        async def callback_handler(request):
            query = parse_qs(request.query_string)
            code = query.get("code", [None])[0]
            error = query.get("error", [None])[0]

            if code:
                code_future.set_result(code)
                return web.Response(
                    text="<h1>✓ Authentication successful!</h1><p>You can close this window.</p>",
                    content_type="text/html"
                )
            else:
                code_future.set_exception(Exception(f"OAuth error: {error}"))
                return web.Response(
                    text=f"<h1>✗ Authentication failed</h1><p>{error}</p>",
                    content_type="text/html",
                    status=400
                )

        app = web.Application()
        app.router.add_get("/callback", callback_handler)

        runner = web.AppRunner(app)
        await runner.setup()
        site = web.TCPSite(runner, "localhost", 8080)
        await site.start()

        try:
            # Build auth URL
            params = {
                "client_id": client_id,
                "redirect_uri": oauth["redirect_uri"],
                "response_type": "code",
                "scope": " ".join(oauth["scopes"]),
                "state": "vox-cli-auth",
                "access_type": "offline",
                "prompt": "consent"
            }
            auth_url = f"{oauth['auth_url']}?{urlencode(params)}"

            print(f"\n[Auth] Opening browser for {provider} OAuth...")
            print(f"[Auth] URL: {auth_url}")
            webbrowser.open(auth_url)

            # Wait for callback
            try:
                code = await asyncio.wait_for(code_future, timeout=180)
            except asyncio.TimeoutError:
                print("[Error] OAuth timeout (3 min)")
                await runner.cleanup()
                return False

            # Exchange code for token
            token_data = await self._exchange_code(provider, oauth, code, client_id, client_secret)
            if token_data:
                self.config.set_provider_config(provider, {
                    **self.config.get_provider_config(provider),
                    "oauth_token": token_data.get("access_token"),
                    "refresh_token": token_data.get("refresh_token"),
                    "auth_method": "oauth",
                    "oauth_expires_at": self._calc_expiry(token_data.get("expires_in", 3600))
                })
                self.config.save()
                print(f"\033[92m[✓] {provider} OAuth authentication successful]\033[0m")
                await runner.cleanup()
                return True

        except Exception as e:
            print(f"[Error] OAuth failed: {e}")

        await runner.cleanup()
        return False

    async def _exchange_code(self, provider: str, oauth: dict, code: str, client_id: str, client_secret: str) -> dict:
        """Exchange authorization code for access token"""
        async with aiohttp.ClientSession() as session:
            data = {
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": oauth["redirect_uri"],
                "client_id": client_id,
                "client_secret": client_secret,
            }
            headers = {"Accept": "application/json"}
            async with session.post(oauth["token_url"], data=data, headers=headers) as resp:
                if resp.status == 200:
                    return await resp.json()
                error_text = await resp.text()
                print(f"[Error] Token exchange failed: {resp.status} - {error_text}")
                return {}

    def _calc_expiry(self, expires_in: int) -> float:
        import time
        return time.time() + expires_in - 60  # 60s buffer

    async def refresh_token(self, provider: str) -> bool:
        """Refresh OAuth token"""
        provider_config = self.config.get_provider_config(provider)
        refresh_token = provider_config.get("refresh_token")
        if not refresh_token:
            return False

        oauth = self.OAUTH_CONFIG.get(provider)
        if not oauth:
            return False

        client_id = self.config.get(f"providers.{provider}.oauth_client_id")
        client_secret = self.config.get(f"providers.{provider}.oauth_client_secret")
        if not client_id or not client_secret:
            return False

        async with aiohttp.ClientSession() as session:
            data = {
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": client_id,
                "client_secret": client_secret,
            }
            headers = {"Accept": "application/json"}
            async with session.post(oauth["token_url"], data=data, headers=headers) as resp:
                if resp.status == 200:
                    token_data = await resp.json()
                    self.config.set_provider_config(provider, {
                        **provider_config,
                        "oauth_token": token_data.get("access_token"),
                        "refresh_token": token_data.get("refresh_token", refresh_token),
                        "oauth_expires_at": self._calc_expiry(token_data.get("expires_in", 3600))
                    })
                    self.config.save()
                    return True
        return False

    def get_valid_token(self, provider: str) -> str | None:
        """Get valid access token, refreshing if needed"""
        provider_config = self.config.get_provider_config(provider)
        if provider_config.get("auth_method") != "oauth":
            return provider_config.get("api_key")

        token = provider_config.get("oauth_token")
        expires_at = provider_config.get("oauth_expires_at", 0)

        import time
        if token and time.time() < expires_at:
            return token

        # Try refresh
        import asyncio
        if asyncio.run(self.refresh_token(provider)):
            return self.config.get_provider_config(provider).get("oauth_token")
        return None