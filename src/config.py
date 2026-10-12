import os
from pathlib import Path

from dotenv import load_dotenv

# Project root
BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env from project root
load_dotenv(BASE_DIR / ".env")


# -----------------------------
# Ollama
# -----------------------------

OLLAMA_BASE_URL = os.getenv(
    "OLLAMA_BASE_URL",
    "http://localhost:11434"
)

LLM_MODEL = os.getenv(
    "LLM_MODEL",
    "llama3.1:8b"
)

EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL",
    "nomic-embed-text"
)


# -----------------------------
# Qdrant
# -----------------------------

QDRANT_HOST = os.getenv(
    "QDRANT_HOST",
    "localhost"
)

QDRANT_PORT = int(
    os.getenv("QDRANT_PORT", "6333")
)

COLLECTION_NAME = os.getenv(
    "QDRANT_COLLECTION",
    "procure_documents"
)


# -----------------------------
# Project paths
# -----------------------------

DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"

STORAGE_DIR = BASE_DIR / "storage"
DOCUMENTS_DIR = STORAGE_DIR / "documents"
QDRANT_DIR = STORAGE_DIR / "qdrant"


print("================================")
print("Procure Bot Configuration")
print("================================")
print("LLM Model       :", LLM_MODEL)
print("Embedding Model :", EMBEDDING_MODEL)
print("Ollama URL      :", OLLAMA_BASE_URL)
print("Qdrant Host     :", QDRANT_HOST)
print("Qdrant Port     :", QDRANT_PORT)
print("Collection      :", COLLECTION_NAME)
print("================================")