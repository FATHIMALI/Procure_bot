from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams


COLLECTION_NAME = "procure_documents"
VECTOR_SIZE = 768


def create_collection():

    print("=" * 60)
    print("PROCURE BOT - QDRANT COLLECTION")
    print("=" * 60)

    client = QdrantClient(
        host="localhost",
        port=6333
    )

    existing_collections = [
        collection.name
        for collection in client.get_collections().collections
    ]

    if COLLECTION_NAME in existing_collections:

        print()
        print(
            f"Collection '{COLLECTION_NAME}' already exists."
        )

    else:

        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE
            )
        )

        print()
        print(
            f"Collection created: {COLLECTION_NAME}"
        )

    print()
    print("Vector size:", VECTOR_SIZE)
    print("Distance:", "COSINE")

    print()
    print("=" * 60)
    print("QDRANT COLLECTION SETUP COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    create_collection()