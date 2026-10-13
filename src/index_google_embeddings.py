
from pathlib import Path
import json
import re
import uuid

from qdrant_client import QdrantClient
from qdrant_client.models import (
    PointStruct,
    VectorParams,
    Distance,
)

from src.config import (
    QDRANT_URL,
    QDRANT_API_KEY,
    QDRANT_HOST,
    QDRANT_PORT,
)

BASE_DIR = Path(__file__).resolve().parent.parent

EMBEDDINGS_FILE = (
    BASE_DIR / "data" / "processed" / "embeddings_google.json"
)

# A completely separate collection for Google embeddings
GOOGLE_COLLECTION_NAME = "procure_documents_google"


def extract_po_id(text):
    match = re.search(
        r"Purchase Order:\s*(PO-\d+)",
        text,
        re.IGNORECASE,
    )
    return match.group(1).upper() if match else None


def index_google_embeddings():
    print("=" * 60)
    print("PROCURE BOT - GOOGLE QDRANT INDEXING")
    print("=" * 60)

    if QDRANT_URL:
        client = QdrantClient(
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY or None,
            timeout=60,
        )
    else:
        client = QdrantClient(
            host=QDRANT_HOST,
            port=QDRANT_PORT,
            timeout=60,
        )

    with EMBEDDINGS_FILE.open("r", encoding="utf-8") as file:
        embeddings_data = json.load(file)

    if not embeddings_data:
        raise ValueError("Google embeddings file is empty.")

    if len({item["document_id"] for item in embeddings_data}) != len(embeddings_data):
        raise ValueError("Duplicate document IDs found; stopping safely.")

    for item in embeddings_data:
        if len(item["embedding"]) != 768:
            raise ValueError(
                f"Invalid embedding dimensions: {item['document_id']}"
            )

    print(f"Google embeddings loaded: {len(embeddings_data)}")

    # Create the new collection only if it does not already exist.
    # Never delete or recreate an existing collection automatically.
    existing_collections = {
        collection.name
        for collection in client.get_collections().collections
    }

    if GOOGLE_COLLECTION_NAME not in existing_collections:
        client.create_collection(
            collection_name=GOOGLE_COLLECTION_NAME,
            vectors_config=VectorParams(
                size=768,
                distance=Distance.COSINE,
            ),
        )
        print(f"Created collection: {GOOGLE_COLLECTION_NAME}")
    else:
        info = client.get_collection(GOOGLE_COLLECTION_NAME)
        if info.config.params.vectors.size != 768:
            raise ValueError(
                "Google collection already exists with an unexpected vector size. "
                "No points uploaded."
            )
        print(f"Using existing collection: {GOOGLE_COLLECTION_NAME}")

    points = []

    for item in embeddings_data:
        text = item["text"]
        document_id = item["document_id"]

        points.append(
            PointStruct(
                id=str(uuid.uuid5(uuid.NAMESPACE_URL, document_id)),
                vector=item["embedding"],
                payload={
                    "document_id": document_id,
                    "po_id": extract_po_id(text),
                    "text": text,
                    "embedding_model": "gemini-embedding-001",
                },
            )
        )

    # Upload in batches to avoid one oversized request.
    batch_size = 50

    for start in range(0, len(points), batch_size):
        batch = points[start:start + batch_size]
        client.upsert(
            collection_name=GOOGLE_COLLECTION_NAME,
            points=batch,
            wait=True,
        )
        print(f"Uploaded: {min(start + len(batch), len(points))}/{len(points)}")

    info = client.get_collection(GOOGLE_COLLECTION_NAME)

    print()
    print(f"Collection: {GOOGLE_COLLECTION_NAME}")
    print(f"Vectors stored: {info.points_count}")
    print("Google indexing completed.")


if __name__ == "__main__":
    index_google_embeddings()