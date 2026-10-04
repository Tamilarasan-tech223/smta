"""Thin wrapper around external social APIs.

Uses completely FREE, no-API-key data sources:
  - Mastodon   : public hashtag timeline (mastodon.social), no auth needed
  - Bluesky    : public post search (public.api.bsky.app), no auth needed
  - DEV.to     : public articles API (dev.to), no auth needed
  - Hacker News: Algolia's free search API (hn.algolia.com), no auth needed

None of these services require signup, payment, or credentials of any
kind. If all live sources are unreachable (offline, rate limit),
`fetch_posts` clearly returns demo data instead of silently faking a
live connection.
"""
import html
import re
import uuid
from datetime import datetime, timezone

import requests

from app.config import settings
from app.services.demo_data import generate_posts

MASTODON_TAG_URL = "https://mastodon.social/api/v1/timelines/tag/{tag}"
BLUESKY_SEARCH_URL = "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts"
DEVTO_ARTICLES_URL = "https://dev.to/api/articles"
HN_SEARCH_URL = "https://hn.algolia.com/api/v1/search"

_TAG_RE = re.compile(r"[^a-z0-9_]+")
_HTML_RE = re.compile(r"<[^>]+>")


def _plain_text(raw: str) -> str:
    """Mastodon returns HTML content; strip tags and unescape entities."""
    return html.unescape(_HTML_RE.sub(" ", raw or "")).strip()


def _fetch_from_mastodon(query: str, max_results: int) -> list[dict]:
    """Fetch recent public posts for a hashtag from a Mastodon instance.

    No authentication required. `query` is sanitized into a single hashtag
    (e.g. "climate change" -> "climate"); generic queries fall back to
    "news".
    """
    tag = _TAG_RE.sub("", query.lower().split()[0]) if query.split() else ""
    if not tag or tag in {"trending", "latest"}:
        tag = "news"

    resp = requests.get(
        MASTODON_TAG_URL.format(tag=tag),
        params={"limit": min(max_results, 40)},
        headers={"Accept": "application/json"},
        timeout=10,
    )
    resp.raise_for_status()

    posts = []
    for item in resp.json():
        if item.get("reblog"):  # skip pure reposts
            continue
        created = item.get("created_at")
        posts.append({
            "id": f"mastodon-{item.get('id', uuid.uuid4().hex[:7])}",
            "text": _plain_text(item.get("content", "")),
            "url": item.get("url") or item.get("uri", ""),
            "platform": "Mastodon",
            "author": f"@{item.get('account', {}).get('username', 'unknown')}",
            "created_at": datetime.fromisoformat(created.replace("Z", "+00:00"))
                if created else datetime.now(timezone.utc),
            "likes": item.get("favourites_count", 0),
            "comments": item.get("replies_count", 0),
            "shares": item.get("reblogs_count", 0),
            "hashtags": [t.get("name", "") for t in item.get("tags", [])],
        })
    return posts


def _fetch_from_bluesky(query: str, max_results: int) -> list[dict]:
    """Search public Bluesky posts via the unauthenticated public XRPC
    endpoint. No login or app password required."""
    q = query if query and query != "trending" else "news"
    resp = requests.get(
        BLUESKY_SEARCH_URL,
        params={"q": q, "limit": min(max_results, 25), "sort": "latest"},
        timeout=10,
    )
    resp.raise_for_status()

    posts = []
    for item in resp.json().get("posts", []):
        record = item.get("record", {})
        created = item.get("indexedAt") or record.get("createdAt")
        handle = item.get("author", {}).get("handle", "unknown")
        rkey = item.get("uri", "").rsplit("/", 1)[-1]
        posts.append({
            "id": f"bluesky-{rkey or uuid.uuid4().hex[:7]}",
            "text": record.get("text", ""),
            "url": f"https://bsky.app/profile/{handle}/post/{rkey}" if rkey else "",
            "platform": "Bluesky",
            "author": f"@{handle}",
            "created_at": datetime.fromisoformat(created.replace("Z", "+00:00"))
                if created else datetime.now(timezone.utc),
            "likes": item.get("likeCount", 0),
            "comments": item.get("replyCount", 0),
            "shares": item.get("repostCount", 0),
            "hashtags": [w.lstrip("#") for w in record.get("text", "").split()
                         if w.startswith("#")],
        })
    return posts


def _fetch_from_devto(query: str, max_results: int) -> list[dict]:
    """Fetch recent DEV.to articles for a tag via Forem's public API.
    No API key required."""
    resp = requests.get(
        DEVTO_ARTICLES_URL,
        params={
            "tag": _TAG_RE.sub("", query.lower().split()[0]) if query.split() else "news",
            "per_page": min(max_results, 30),
            "top": 7,
        },
        timeout=10,
    )
    resp.raise_for_status()

    posts = []
    for item in resp.json():
        created = item.get("published_at")
        text = (item.get("title", "") + ". " + _plain_text(item.get("description", ""))).strip()
        posts.append({
            "id": f"devto-{item.get('id', uuid.uuid4().hex[:7])}",
            "text": text,
            "url": item.get("url", ""),
            "platform": "DEV.to",
            "author": f"@{item.get('user', {}).get('username', 'unknown')}",
            "created_at": datetime.fromisoformat(created.replace("Z", "+00:00"))
                if created else datetime.now(timezone.utc),
            "likes": item.get("positive_reactions_count", 0),
            "comments": item.get("comments_count", 0),
            "shares": 0,
            "hashtags": item.get("tags", []),
        })
    return posts


def _fetch_from_hackernews(query: str, max_results: int) -> list[dict]:
    """Search Hacker News stories via Algolia's free API. No auth needed.

    Maps HN's data model onto our shared post schema:
    points -> likes, num_comments -> comments, shares default to 0.
    """
    resp = requests.get(
        HN_SEARCH_URL,
        params={
            "query": query if query and query != "trending" else "technology",
            "tags": "story",
            "hitsPerPage": min(max_results, 100),
        },
        timeout=10,
    )
    resp.raise_for_status()

    posts = []
    for item in resp.json().get("hits", []):
        title = item.get("title") or ""
        story_text = item.get("story_text") or ""
        text = (title + ". " + _plain_text(story_text)).strip()
        created = item.get("created_at")
        object_id = item.get("objectID", "")
        posts.append({
            "id": f"hn-{object_id or uuid.uuid4().hex[:7]}",
            "text": text,
            "url": f"https://news.ycombinator.com/item?id={object_id}" if object_id else "",
            "platform": "Hacker News",
            "author": item.get("author", "unknown"),
            "created_at": datetime.fromisoformat(created.replace("Z", "+00:00"))
                if created else datetime.now(timezone.utc),
            "likes": item.get("points", 0) or 0,
            "comments": item.get("num_comments", 0) or 0,
            "shares": 0,
            "hashtags": [w for w in text.split() if w.startswith("#")],
        })
    return posts


def fetch_posts(query: str = "trending", max_results: int = 100) -> tuple[list[dict], str]:
    """Returns (posts, mode) where mode is "live" or "demo".

    Fetches from all four free sources (Mastodon, Bluesky, DEV.to,
    Hacker News) and merges the results. Never raises on a broken live
    connection -- it degrades to demo data and lets the caller/UI decide
    how to surface that.
    """
    live_posts: list[dict] = []

    for source in (_fetch_from_mastodon, _fetch_from_bluesky,
                   _fetch_from_devto, _fetch_from_hackernews):
        try:
            live_posts += source(query, max_results)
        except Exception:
            # Network error, rate limit, API change, etc. -- try the next
            # source, then fall through to demo data instead of crashing.
            pass

    if live_posts:
        return live_posts[:max_results], "live"

    return generate_posts(n=max_results, seed=hash(query) % 10_000), "demo"
