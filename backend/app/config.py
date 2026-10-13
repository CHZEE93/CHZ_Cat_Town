import os
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql+psycopg://chz:chz_dev_only@localhost:5432/chz")
ALLOWED_ORIGINS = set(os.environ.get("ALLOWED_ORIGINS", "http://localhost:5180,http://127.0.0.1:5180,http://localhost:5173,http://127.0.0.1:5173").split(","))
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "false").lower() == "true"
SESSION_COOKIE = "chz_session"
SESSION_SECONDS = 7 * 24 * 60 * 60
STARTING_COINS = 1000
