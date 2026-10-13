from pathlib import Path
import json
import re

from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, VectorParams, Distance

from src.config import (
    QDRANT_URL,
    QDRANT_API_KEY,
    QDRANT_HOST,
    QDRANT_PORT,
    COLLECTION_NAME,
)


BASE_DIR = Path(__file__).resolve().parent.parent

EMBEDDINGS_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "embeddings.json"
)

def extract_po_id(text):
    """
    Extract the Purchase Order ID from the document text.

    Example:
        Purchase Order: PO-00012
    """

    match = re.search(
        r"Purchase Order:\s*(PO-\d+)",
        text,
        re.IGNORECASE
    )

    if match:
        return match.group(1).upper()

    return None


def index_embeddings():

    print("=" * 60)
    print("PROCURE BOT - QDRANT INDEXING")
    print("=" * 60)

    # ---------------------------------------------------------
    # Connect to Qdrant
    # ---------------------------------------------------------

    
    if QDRANT_URL:
        client = QdrantClient(
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY or None,
            timeout=30,
        )
    else:
        client = QdrantClient(
            host=QDRANT_HOST,
            port=QDRANT_PORT,
        )

    # ---------------------------------------------------------
    # Load embeddings
    # ---------------------------------------------------------

    with open(
        EMBEDDINGS_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        embeddings_data = json.load(file)

    print(
        f"Embeddings loaded: {len(embeddings_data)}"
    )

    points = []

    # ---------------------------------------------------------
    # Prepare Qdrant points
    # ---------------------------------------------------------

    for index, item in enumerate(
        embeddings_data
    ):

        document_id = item["document_id"]
        text = item["text"]
        embedding = item["embedding"]

        po_id = extract_po_id(text)

        point = PointStruct(
            id=index,
            vector=embedding,
            payload={
                "document_id": document_id,
                "po_id": po_id,
                "text": text,
            }
        )

        points.append(point)

    print(
        f"Points prepared: {len(points)}"
    )

    # ---------------------------------------------------------
    # Upload points to Qdrant
    # ---------------------------------------------------------

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )

    print()
    print(
        f"Points uploaded: {len(points)}"
    )

    # ---------------------------------------------------------
    # Verify collection
    # ---------------------------------------------------------

    collection_info = client.get_collection(
        COLLECTION_NAME
    )

    print()
    print(
        "Vectors stored:",
        collection_info.points_count
    )

    print()
    print("=" * 60)
    print("QDRANT INDEXING COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    index_embeddings()