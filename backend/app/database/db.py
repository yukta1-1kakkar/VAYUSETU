import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Path handling ensuring Windows and Unix cross-platform compatibility
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")
DB_DIR = BASE_DIR / "app" / "data"
DB_DIR.mkdir(parents=True, exist_ok=True)
# Keep the legacy prototype database untouched. Its original fare table has a
# narrower schema and SQLite cannot add all ETL constraints via create_all().
DB_PATH = DB_DIR / "airindex_etl.db"

DEFAULT_DATABASE_URL = f"sqlite:///{DB_PATH.as_posix()}"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DATABASE_URL).strip()

# Prisma and SQLAlchemy share DATABASE_URL. SQLAlchemy 2 uses psycopg 3 for
# PostgreSQL, while the SQLite fallback keeps local development zero-config.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL[len("postgres://"):]
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgresql+psycopg://" + DATABASE_URL[len("postgresql://"):]

engine_options = {"echo": False, "pool_pre_ping": True}
if DATABASE_URL.startswith("sqlite"):
    engine_options["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, **engine_options)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """
    FastAPI dependency that yields a SQLAlchemy database session
    and ensures proper teardown.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
