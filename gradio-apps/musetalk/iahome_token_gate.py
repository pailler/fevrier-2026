"""
Gate d’accès MuseTalk alignée sur le système token IA Home (comme les autres sous-domaines Gradio) :

1. Côté site : POST /api/generate-access-token → JWT + débit crédits ; ouverture avec ?token=…
2. Cloudflare Worker : comme Florence-2 — GET / exige ?token= (JWT) ou, pour MuseTalk uniquement,
   le cookie de session ``musetalk_iahome_gate`` (revisit sans query dans l’URL).
3. Cette gate : valide le jeton via POST /api/validate-internal-token, pose le cookie HttpOnly,
   puis laisse passer la requête **sans 302** (l’URL peut garder ``?token=…``, même procédé que Florence-2).

Variables d’environnement :
  IAHOME_API_BASE          URL du site Next pour POST /api/validate-internal-token (défaut https://iahome.fr)
  IAHOME_APP_PUBLIC_URL    Pages web (login / compte), défaut https://iahome.fr
  MUSETALK_SKIP_TOKEN_CHECK 1 / true : désactive la gate partout (y compris prod derrière ce process)
  MUSETALK_REQUIRE_TOKEN_ON_LOCALHOST 1 : impose la gate même sur localhost (test prod-like)
  MUSETALK_COOKIE_SECRET    clé HMAC pour le cookie de session (obligatoire en prod multi-utilisateurs)
  MUSETALK_TRUST_PROXY      1 : activer ProxyHeaders (Traefik / Cloudflare). Défaut désactivé en local
                            pour éviter des X-Forwarded-* parasites (VPN) qui cassent http://localhost:7886
  MUSETALK_DISABLE_HTML_SHIM 1 : désactive le middleware d’injection HTML (debug si boucle de redirection)
  MUSETALK_PUBLIC_HOST   (voir app.py) : hostname canonique pour Gradio si le bind est 0.0.0.0

Sans variable : accès sans jeton sur loopback (localhost, 127.0.0.0/8, ::1, *.localhost).
Les autres hôtes (ex. musetalk.iahome.fr) restent protégés.
"""
from __future__ import annotations

import hashlib
import hmac
import ipaddress
import json
import logging
import os
import re
import time
from typing import Callable
from urllib.parse import quote

import requests

_logger = logging.getLogger(__name__)
from starlette.concurrency import run_in_threadpool
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.datastructures import Headers
from starlette.responses import (
    HTMLResponse,
    PlainTextResponse,
    RedirectResponse,
    Response,
    StreamingResponse,
)
from starlette.types import ASGIApp, Receive, Scope, Send

COOKIE_NAME = "musetalk_iahome_gate"
MODULE_ID = "musetalk"
DEFAULT_API_BASE = "https://iahome.fr"
MAX_AGE_SEC = 60 * 60 * 24 * 7
REQUEST_STATE_USER_KEY = "musetalk_iahome_user_id"

AUTH_MESSAGE_FR = (
    "Accès réservé : ouvrez MuseTalk depuis votre espace IA Home "
    "(bouton du module) pour obtenir un lien avec jeton."
)


def _api_base() -> str:
    return os.environ.get("IAHOME_API_BASE", DEFAULT_API_BASE).rstrip("/")


def _app_public_base() -> str:
    """Site Next (pages login / compte), sans /api."""
    return os.environ.get("IAHOME_APP_PUBLIC_URL", DEFAULT_API_BASE).rstrip("/")


def request_is_https(request: Request) -> bool:
    """Derrière Traefik / Cloudflare, l’URL interne peut être en http:9182 — le cookie doit rester Secure."""
    if request.url.scheme == "https":
        return True
    xf = (request.headers.get("x-forwarded-proto") or "").split(",")[0].strip().lower()
    return xf == "https"


def _cookie_secret() -> bytes:
    s = os.environ.get("MUSETALK_COOKIE_SECRET", "").strip()
    if not s:
        return b"musetalk-cookie-dev-secret-change-me"
    return s.encode("utf-8")


def skip_token_gate() -> bool:
    return os.environ.get("MUSETALK_SKIP_TOKEN_CHECK", "").lower() in ("1", "true", "yes")


def _request_host_without_port(request: Request) -> str:
    raw = (request.headers.get("host") or "").strip().lower()
    if raw.startswith("["):
        end = raw.find("]")
        return raw[1:end] if end > 0 else raw
    return raw.split(":")[0] if raw else ""


def _is_loopback_host(host: str) -> bool:
    """
    True si l’accès est clairement en local (pas de gate jeton).
    Inclut 127.0.0.0/8, ::1, *.localhost — sinon Gradio reçoit user=None → 401 et le SPA peut
    boucler (NS_ERROR_REDIRECT_LOOP dans Firefox).
    """
    if not host:
        return False
    h = host.strip().lower().rstrip(".")
    if h in ("localhost", "127.0.0.1", "::1"):
        return True
    if h.endswith(".localhost"):
        return True
    try:
        return ipaddress.ip_address(h).is_loopback
    except ValueError:
        return False


def gate_disabled_for_request(request: Request) -> bool:
    """True = pas de gate (accès Gradio libre pour cette requête)."""
    if skip_token_gate():
        return True
    if os.environ.get("MUSETALK_REQUIRE_TOKEN_ON_LOCALHOST", "").lower() in ("1", "true", "yes"):
        return False
    return _is_loopback_host(_request_host_without_port(request))


def validate_module_token(token: str) -> dict | None:
    url = f"{_api_base()}/api/validate-internal-token"
    try:
        r = requests.post(
            url,
            json={"token": token, "moduleId": MODULE_ID},
            headers={
                "Content-Type": "application/json",
                "User-Agent": "IAHome-MuseTalk-Gate/1.0",
                "Accept": "application/json",
            },
            timeout=30,
        )
    except requests.RequestException:
        return None
    if r.status_code != 200:
        return None
    try:
        data = r.json()
    except json.JSONDecodeError:
        return None
    if not data.get("success"):
        return None
    return data


def _make_cookie_value(user_id: str) -> str:
    exp = int(time.time()) + MAX_AGE_SEC
    body = json.dumps({"uid": user_id, "exp": exp}, separators=(",", ":"))
    sig = hmac.new(_cookie_secret(), body.encode(), hashlib.sha256).hexdigest()
    return f"{body}|{sig}"


def verify_gate_cookie(raw: str | None) -> str | None:
    if not raw or "|" not in raw:
        return None
    body, sig = raw.rsplit("|", 1)
    expected = hmac.new(_cookie_secret(), body.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected):
        return None
    try:
        obj = json.loads(body)
    except json.JSONDecodeError:
        return None
    if int(obj.get("exp", 0)) < time.time():
        return None
    uid = obj.get("uid")
    return uid if isinstance(uid, str) and uid else None


def normalize_url_path(path: str) -> str:
    """Évite les chemins du type // ou /// (navigateur / redirections) qui cassent Gradio."""
    if not path or path == "/":
        return "/"
    parts = [seg for seg in path.split("/") if seg]
    return "/" + "/".join(parts) if parts else "/"


def _is_gradio_realtime_path(path: str) -> bool:
    """
    API Gradio (SSE queue/data, join, fichiers, etc.) : pas de logique token HTML / shim sur ces chemins.
    Évite des effets de bord avec EventSource (ex. NS_BINDING_ABORTED dans Firefox si la chaîne middleware
    ou les en-têtes ne conviennent pas au streaming).
    """
    p = normalize_url_path(path or "/")
    return p.startswith("/gradio_api")


def _set_request_user(request: Request, user_id: str) -> None:
    """Expose l'utilisateur validé à auth_dependency Gradio (même requête, avant Set-Cookie)."""
    if user_id:
        setattr(request.state, REQUEST_STATE_USER_KEY, user_id)


def _request_user_id(request: Request) -> str | None:
    uid = getattr(request.state, REQUEST_STATE_USER_KEY, None)
    if isinstance(uid, str) and uid:
        return uid
    return verify_gate_cookie(request.cookies.get(COOKIE_NAME))


def make_auth_dependency() -> Callable[[Request], str | None]:
    def auth_dependency(request: Request) -> str | None:
        if gate_disabled_for_request(request):
            return "dev-local"
        uid = _request_user_id(request)
        if uid:
            return uid
        # Première visite ?token= : le cookie n’est posé qu’après call_next ; valider le JWT ici aussi.
        token_qp = request.query_params.get("token")
        if token_qp:
            data = validate_module_token(token_qp)
            if data:
                user_id = str(data.get("userId") or "")
                if user_id:
                    return user_id
        return None

    return auth_dependency


def _fix_double_slash_after_authority(url: str) -> str:
    """http://host:port//... -> http://host:port/... (Gradio / Starlette selon versions)."""
    prev = None
    while prev != url:
        prev = url
        url = re.sub(r"(https?://[^/?#]+)/{2,}", r"\1/", url)
    return url


class FixRedirectLocationDoubleSlashMiddleware:
    """
    Corrige l’en-tête Location des redirections (ex. 307 vers http://host:port//).
    À enregistrer en dernier pour envelopper le send le plus près du client.
    """

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_wrapper(message: dict) -> None:
            if message.get("type") == "http.response.start":
                headers = list(message.get("headers") or [])
                new_h: list[tuple[bytes, bytes]] = []
                for k, v in headers:
                    if k.lower() == b"location":
                        loc = v.decode("latin-1")
                        fixed = _fix_double_slash_after_authority(loc)
                        if fixed != loc:
                            v = fixed.encode("latin-1")
                    new_h.append((k, v))
                message = {**message, "headers": new_h}
            await send(message)

        await self.app(scope, receive, send_wrapper)


class MuseTalkAsgiRequestFixMiddleware:
    """
    Corrige en amont (ASGI) :
    - path avec // (évite Location http://host:port// et boucles 307)
    - Host:.../ final parasite (évite http://host// avec path /)
    Enregistrer en dernier add_middleware() pour s’exécuter en premier sur la requête.
    """

    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        new_scope: dict = dict(scope)
        path = scope.get("path") or "/"
        clean = normalize_url_path(path)
        if clean != path:
            new_scope["path"] = clean
        new_headers: list[tuple[bytes, bytes]] = []
        for k, v in scope.get("headers") or []:
            if k == b"host":
                v = v.decode("latin-1").rstrip("/").strip().encode("latin-1")
            new_headers.append((k, v))
        new_scope["headers"] = new_headers
        await self.app(new_scope, receive, send)


def _html_access_denied_page(title: str, body: str, status: int = 403) -> HTMLResponse:
    base = _app_public_base()
    return HTMLResponse(
        status_code=status,
        content=(
            f"<!DOCTYPE html><html lang=fr><head><meta charset=utf-8>"
            f"<meta name=viewport content=\"width=device-width,initial-scale=1\">"
            f"<title>{title}</title>"
            f"<style>body{{font-family:system-ui,sans-serif;max-width:36rem;margin:2rem auto;padding:0 1rem;}}"
            f"a{{color:#2563eb;}}</style></head><body>"
            f"<h1>{title}</h1><p>{body}</p>"
            f"<p><a href=\"{base}/account\">Espace compte IA Home</a> · "
            f"<a href=\"{base}/modules\">Modules</a></p></body></html>"
        ),
    )


class MuseTalkIahomeGateMiddleware(BaseHTTPMiddleware):
    """
    Combine l’ancien IahomeTokenCookieMiddleware + MuseTalkBrowserAuthRedirectMiddleware en **une** couche
    BaseHTTPMiddleware au lieu de deux : plusieurs BaseHTTPMiddleware empilés peuvent provoquer des
    coupures de connexion (NS_ERROR_NET_RESET) sur les flux SSE longs (/gradio_api/queue/data).
    """

    @staticmethod
    def _maybe_browser_redirect_on_401(request: Request, response: Response) -> Response:
        if response.status_code != 401:
            return response
        if gate_disabled_for_request(request):
            return response
        # Jeton ou session déjà validés sur cette requête : ne pas renvoyer vers /login.
        if getattr(request.state, REQUEST_STATE_USER_KEY, None):
            return response
        if request.method != "GET" and request.method != "HEAD":
            return response
        path = normalize_url_path(request.url.path or "/")
        if path != "/":
            return response
        accept = (request.headers.get("accept") or "").lower()
        if "text/html" not in accept:
            return response
        # Visite avec ?token= mais Gradio a quand même répondu 401 : fiche module, pas boucle login.
        if request.query_params.get("token"):
            return RedirectResponse(
                url=f"{_app_public_base()}/card/musetalk",
                status_code=302,
            )
        dest = f"{_app_public_base()}/login?redirect={quote(str(request.url), safe='')}"
        return RedirectResponse(url=dest, status_code=302)

    @staticmethod
    def _redirect_to_card_or_login(request: Request) -> RedirectResponse:
        """Visite directe sans jeton : renvoyer vers la fiche produit (pas un 401 Gradio)."""
        accept = (request.headers.get("accept") or "").lower()
        card_url = f"{_app_public_base()}/card/musetalk"
        if "text/html" in accept or "*/*" in accept or not accept.strip():
            return RedirectResponse(url=card_url, status_code=302)
        dest = f"{_app_public_base()}/login?redirect={quote(str(request.url), safe='')}"
        return RedirectResponse(url=dest, status_code=302)

    async def dispatch(self, request: Request, call_next) -> Response:
        norm_path = normalize_url_path(request.url.path or "/")
        path = norm_path.rstrip("/") or "/"
        if path == "/healthz":
            return await call_next(request)
        if _is_gradio_realtime_path(request.url.path or "/"):
            return await call_next(request)

        if gate_disabled_for_request(request):
            response = await call_next(request)
            return self._maybe_browser_redirect_on_401(request, response)

        token_qp = request.query_params.get("token")
        if token_qp:
            data = await run_in_threadpool(validate_module_token, token_qp)
            if not data:
                accept = (request.headers.get("accept") or "").lower()
                if "text/html" in accept:
                    return _html_access_denied_page(
                        "Accès refusé",
                        "Lien ou jeton invalide, expiré, ou module non activé sur votre compte. "
                        "Ouvrez MuseTalk depuis le bouton « Accéder » sur la carte module (débit crédits + jeton signé).",
                    )
                return PlainTextResponse(
                    "Access denied: invalid module token. Open MuseTalk from your IA Home account.",
                    status_code=403,
                )
            user_id = str(data.get("userId") or "")
            if not user_id:
                accept = (request.headers.get("accept") or "").lower()
                if "text/html" in accept:
                    return _html_access_denied_page(
                        "Accès refusé",
                        "Le serveur IA Home n’a pas renvoyé d’identifiant utilisateur pour ce jeton.",
                    )
                return PlainTextResponse(
                    "Access denied: token validation returned no user.",
                    status_code=403,
                )
            _set_request_user(request, user_id)
            response = await call_next(request)
            response.set_cookie(
                key=COOKIE_NAME,
                value=_make_cookie_value(user_id),
                max_age=MAX_AGE_SEC,
                httponly=True,
                samesite="lax",
                secure=request_is_https(request),
                path="/",
            )
            return self._maybe_browser_redirect_on_401(request, response)

        cookie_uid = verify_gate_cookie(request.cookies.get(COOKIE_NAME))
        if cookie_uid:
            _set_request_user(request, cookie_uid)
            response = await call_next(request)
            return self._maybe_browser_redirect_on_401(request, response)

        if request.method in ("GET", "HEAD") and path == "/":
            if request.method == "HEAD":
                return Response(status_code=401)
            return self._redirect_to_card_or_login(request)

        response = await call_next(request)
        return self._maybe_browser_redirect_on_401(request, response)


class MuseTalkGradioHtmlShimMiddleware(BaseHTTPMiddleware):
    """
    Réécrit le HTML de la page Gradio (GET /) :
    1) juste après <head> (exécution avant tout script Gradio dans le head) ;
    2) une seconde fois juste avant le <script … src="…/assets/index-….js"> si trouvé (ordre d’attributs
       variable selon les versions).

    Le bundle Gradio appelle window.parent.postMessage(..., "https://huggingface.co") au chargement :
    en onglet top-level, l’origine cible doit être localhost ou "*".

    Enregistrer en dernier sur l’app FastAPI pour traiter la réponse au plus près du client.
    """

    _HEAD_TAG = re.compile(rb"<head\b[^>]*>", re.IGNORECASE)
    # Ordre des attributs type / crossorigin / src variable ; on ne exige pas type=module.
    _INDEX_BUNDLE_SCRIPT = re.compile(
        rb'<script[^>]*\bsrc\s*=\s*["\'](?:\./|/)assets/index-[a-zA-Z0-9_-]+\.js["\'][^>]*>\s*</script>',
        re.IGNORECASE,
    )

    _INJECT = (
        rb'<script id="musetalk-postmessage-shim">(function(){try{'
        rb'if(window.location&&/huggingface\\.co/i.test(String(window.location.hostname||"")))return;'
        rb'if(Window.prototype.__musetalkPmWrapped)return;'
        rb'Window.prototype.__musetalkPmWrapped=1;var o='
        rb'Window.prototype.postMessage;Window.prototype.postMessage=function(m,t,r){try{'
        rb'if(typeof t==="string"&&/huggingface\\.co/i.test(t)){var ao="";try{ao=this&&'
        rb'this.location&&this.location.origin?String(this.location.origin):"";}catch(e){}'
        rb'if(!ao||/huggingface\\.co/i.test(ao)){try{if(this===window&&window.location&&'
        rb'window.location.origin)ao=String(window.location.origin);}catch(e2){}}'
        rb'if(ao&&!/huggingface\\.co/i.test(ao))t=ao;else t="*";}}catch(e){}return arguments.length>=3?'
        rb'o.call(this,m,t,r):o.call(this,m,t);};}catch(e){}})();</script>'
        rb'<script id="musetalk-zerogpu-shim">'
        rb"(function(){try{Object.defineProperty(window,'supports_zerogpu_headers',"
        rb"{configurable:true,enumerable:true,get:function(){return false;},set:function(){}});"
        rb"}catch(e){}})();"
        rb"</script>"
        rb'<style id="musetalk-font-shim">'
        rb'html,:root,body,gradio-app,[class^="gradio-container"]{'
        rb'--font:"IBM Plex Sans","Segoe UI",Roboto,Arial,sans-serif!important;'
        rb'--font-sans:"IBM Plex Sans","Segoe UI",Roboto,Arial,sans-serif!important;'
        rb'--font-mono:"IBM Plex Mono","Courier New",Consolas,monospace!important;'
        rb'font-family:"IBM Plex Sans","Segoe UI",Roboto,Arial,sans-serif!important;'
        rb"}</style>"
    )

    async def dispatch(self, request: Request, call_next):
        if request.method == "HEAD":
            return await call_next(request)
        if _is_gradio_realtime_path(request.url.path or "/"):
            return await call_next(request)
        response = await call_next(request)
        # Ne jamais réécrire les redirections / erreurs (risque de boucle côté navigateur).
        if response.status_code < 200 or response.status_code >= 300:
            return response
        path = normalize_url_path(request.url.path or "/")
        if path != "/":
            return response
        ct = (response.headers.get("content-type") or "").lower()
        if "text/html" not in ct:
            return response
        try:
            if isinstance(response, StreamingResponse):
                chunks: list[bytes] = []
                async for part in response.body_iterator:
                    chunks.append(part)
                body = b"".join(chunks)
            else:
                raw = getattr(response, "body", None)
                if raw is not None and len(raw) > 0:
                    body = raw
                else:
                    chunks = []
                    async for part in response.body_iterator:
                        chunks.append(part)
                    body = b"".join(chunks)
            if not body or b"<head" not in body.lower():
                return response
            m = self._HEAD_TAG.search(body)
            if not m:
                _logger.warning("MuseTalk HTML shim: pas de balise <head> dans la réponse GET /")
                return response
            new_body = body[: m.end()] + self._INJECT + body[m.end() :]
            im = self._INDEX_BUNDLE_SCRIPT.search(new_body)
            if im:
                new_body = new_body[: im.start()] + self._INJECT + new_body[im.start() :]
            raw = [
                (k, v)
                for k, v in response.headers.raw
                if k.lower() != b"content-length"
            ]
            raw.append((b"content-length", str(len(new_body)).encode("latin-1")))
            return Response(
                content=new_body,
                status_code=response.status_code,
                headers=Headers(raw=raw),
                media_type=response.media_type,
            )
        except Exception:
            _logger.exception("MuseTalk HTML shim: échec de réécriture du HTML (réponse non modifiée)")
            return response
