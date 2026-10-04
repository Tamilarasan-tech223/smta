import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """All configuration is read from environment variables.

    The live data sources (Mastodon public timeline, Hacker News via
    Algolia) are FREE and need no API keys at all -- so unlike typical
    social-API projects there is nothing secret to configure here.
    """

    mastodon_instance: str = os.getenv("MASTODON_INSTANCE", "mastodon.social")

    app_env: str = os.getenv("APP_ENV", "development")
    cors_origins: list[str] = [
        o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()
    ]
    demo_data_size: int = int(os.getenv("DEMO_DATA_SIZE", "600"))


settings = Settings()
