from qdrant_client import QdrantClient


def test_qdrant():

    print("=" * 60)
    print("PROCURE BOT - QDRANT CONNECTION TEST")
    print("=" * 60)

    client = QdrantClient(
        host="localhost",
        port=6333
    )

    collections = client.get_collections()

    print()
    print("Qdrant connection: SUCCESS")
    print()
    print("Existing collections:")

    for collection in collections.collections:
        print("-", collection.name)

    print()
    print("=" * 60)
    print("QDRANT CONNECTION TEST COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    test_qdrant()