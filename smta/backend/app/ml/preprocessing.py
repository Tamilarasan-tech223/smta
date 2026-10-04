"""Text preprocessing pipeline.

Kept as small, composable functions (rather than one monolithic method) so
any single step can be swapped out without touching the rest of the ML
pipeline -- e.g. dropping in spaCy lemmatization instead of NLTK stemming.
"""
import re
import string

try:
    import nltk
    from nltk.corpus import stopwords

    for pkg in ("stopwords",):
        try:
            nltk.data.find(f"corpora/{pkg}")
        except LookupError:
            nltk.download(pkg, quiet=True)
    _STOPWORDS = set(stopwords.words("english"))
except Exception:
    # If NLTK data can't be downloaded (e.g. no network access), fall back
    # to a small built-in stopword list so the app still runs end to end.
    _STOPWORDS = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "and",
        "or", "but", "if", "of", "at", "by", "for", "with", "about",
        "against", "between", "into", "through", "during", "to", "from",
        "in", "on", "off", "over", "under", "again", "further", "then",
        "once", "here", "there", "all", "any", "both", "each", "few",
        "more", "most", "other", "some", "such", "no", "nor", "not",
        "only", "own", "same", "so", "than", "too", "very", "s", "t",
        "can", "will", "just", "don", "should", "now", "i", "you", "he",
        "she", "it", "we", "they", "this", "that", "these", "those",
    }

URL_RE = re.compile(r"https?://\S+|www\.\S+")
MENTION_RE = re.compile(r"@\w+")
NON_ALNUM_RE = re.compile(r"[^a-z0-9#\s]")
WHITESPACE_RE = re.compile(r"\s+")
HASHTAG_RE = re.compile(r"#(\w+)")


def extract_hashtags(text: str) -> list[str]:
    return [f"#{h}" for h in HASHTAG_RE.findall(text)]


def clean_text(text: str) -> str:
    """Lowercase, strip URLs/mentions/punctuation, collapse whitespace."""
    text = text.lower()
    text = URL_RE.sub(" ", text)
    text = MENTION_RE.sub(" ", text)
    text = NON_ALNUM_RE.sub(" ", text)
    text = WHITESPACE_RE.sub(" ", text).strip()
    return text


def tokenize(text: str) -> list[str]:
    return text.split()


def remove_stopwords(tokens: list[str]) -> list[str]:
    return [t for t in tokens if t not in _STOPWORDS and len(t) > 2]


def preprocess(text: str) -> str:
    """Full pipeline: clean -> tokenize -> remove stopwords -> rejoin.
    Returns a string, ready to be fed into TfidfVectorizer."""
    cleaned = clean_text(text)
    tokens = remove_stopwords(tokenize(cleaned))
    return " ".join(tokens)


def preprocess_batch(texts: list[str]) -> list[str]:
    return [preprocess(t) for t in texts]
