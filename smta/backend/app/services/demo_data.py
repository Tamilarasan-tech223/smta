"""Generates synthetic demo posts.

This is used ONLY as a stand-in when no live social media API credentials
are configured (the live sources are free, so this only happens when they are unreachable). Every post
produced here, and every response built from it, is tagged with
"source": "demo" so the UI can clearly label it and never pass it off as
real collected data.
"""
import random
import uuid
from datetime import datetime, timedelta

PLATFORMS = ["Mastodon", "Hacker News", "Bluesky", "DEV.to"]

TOPICS = {
    "Artificial Intelligence": {
        "hashtags": ["#AI", "#MachineLearning", "#DeepLearning"],
        "templates": [
            "This new {hashtag} model is changing how we build products, huge step forward",
            "Not sure the hype around {hashtag} is justified, still lots of failure cases",
            "Just published a breakdown of the latest {hashtag} research paper",
            "{hashtag} tools are saving our team hours of manual work every week",
            "Worried about job displacement from {hashtag}, we need better policy",
        ],
    },
    "Climate & Environment": {
        "hashtags": ["#ClimateAction", "#Sustainability", "#RenewableEnergy"],
        "templates": [
            "Great to see more cities investing in {hashtag} infrastructure",
            "This report on {hashtag} is honestly terrifying, we need to act now",
            "Solar prices keep dropping, {hashtag} is finally becoming mainstream",
            "Skeptical of corporate {hashtag} pledges without real accountability",
            "Attended a local {hashtag} cleanup today, small steps count",
        ],
    },
    "Sports": {
        "hashtags": ["#Football", "#Basketball", "#WorldCup"],
        "templates": [
            "What a finish to that {hashtag} match, absolutely incredible",
            "Referee decisions in {hashtag} tonight were honestly embarrassing",
            "Breaking down the tactics from last night's {hashtag} game",
            "This {hashtag} season has been full of surprises so far",
            "Ticket prices for {hashtag} games are getting out of hand",
        ],
    },
    "Startups & Business": {
        "hashtags": ["#Startup", "#VentureCapital", "#TechNews"],
        "templates": [
            "Just closed our seed round, huge thanks to everyone who believed in us {hashtag}",
            "Another {hashtag} layoff round announced today, tough market out there",
            "Here's what we learned scaling from 0 to 10k users {hashtag}",
            "{hashtag} valuations feel disconnected from actual revenue right now",
            "Excited to share our {hashtag} product launch next week",
        ],
    },
    "Entertainment": {
        "hashtags": ["#Movies", "#Music", "#Gaming"],
        "templates": [
            "That new release is easily the best {hashtag} moment of the year",
            "Really disappointed with how that {hashtag} sequel turned out",
            "Can't stop listening to this album, {hashtag} done right",
            "The {hashtag} industry needs to talk more about crunch culture",
            "Just finished the game everyone's talking about, {hashtag} masterpiece",
        ],
    },
    "Health & Wellness": {
        "hashtags": ["#MentalHealth", "#Fitness", "#Wellness"],
        "templates": [
            "Small daily habits have made a huge difference for my {hashtag} journey",
            "We still don't talk enough about {hashtag} in the workplace",
            "This new study on {hashtag} has some genuinely useful findings",
            "Burnout is real, prioritizing {hashtag} changed how I work",
            "Skeptical of yet another {hashtag} app promising overnight results",
        ],
    },
}

_AUTHORS = [f"user_{i:04d}" for i in range(1, 400)]


_DEMO_SEARCH_URLS = {
    "Mastodon": "https://mastodon.social/tags/{tag}",
    "Bluesky": "https://bsky.app/search?q=%23{tag}",
    "DEV.to": "https://dev.to/t/{tag}",
    "Hacker News": "https://hn.algolia.com/?q={tag}",
}


def _demo_url(platform: str, hashtag: str) -> str:
    """Demo posts still link somewhere real: the platform's tag/search page
    for that post's hashtag, so clicking through behaves like live mode."""
    base = _DEMO_SEARCH_URLS.get(platform, "https://www.google.com/search?q={tag}")
    return base.format(tag=hashtag.lstrip("#").lower())


def generate_posts(n: int = 600, seed: int = 7) -> list[dict]:
    rng = random.Random(seed)
    now = datetime.utcnow()
    posts = []

    for _ in range(n):
        topic_name = rng.choice(list(TOPICS.keys()))
        topic = TOPICS[topic_name]
        hashtag = rng.choice(topic["hashtags"])
        template = rng.choice(topic["templates"])
        text = template.format(hashtag=hashtag)

        extra_tags = rng.sample(topic["hashtags"], k=rng.randint(0, 2))
        all_tags = list({hashtag, *extra_tags})

        created_at = now - timedelta(
            hours=rng.randint(0, 24 * 14),
            minutes=rng.randint(0, 59),
        )

        likes = max(0, int(rng.gauss(180, 220)))
        comments = max(0, int(likes * rng.uniform(0.05, 0.3)))
        shares = max(0, int(likes * rng.uniform(0.02, 0.2)))

        platform = rng.choice(PLATFORMS)
        posts.append({
            "id": str(uuid.uuid4()),
            "text": text,
            "url": _demo_url(platform, all_tags[0]),
            "platform": platform,
            "author": rng.choice(_AUTHORS),
            "created_at": created_at,
            "likes": likes,
            "comments": comments,
            "shares": shares,
            "hashtags": all_tags,
            "_seed_topic": topic_name,  # used only to sanity-check clustering, not returned to client
        })

    posts.sort(key=lambda p: p["created_at"], reverse=True)
    return posts
