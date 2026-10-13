from qdrant_client import QdrantClient
import ollama

from src.config import (
    EMBEDDING_MODEL,
    QDRANT_HOST,
    QDRANT_PORT,
    QDRANT_URL,
    QDRANT_API_KEY,
    COLLECTION_NAME,
)


def search_documents(query, top_k=5):

    print("=" * 60)
    print("PROCURE BOT - DOCUMENT RETRIEVER")
    print("=" * 60)

    print()
    print("User query:")
    print(query)

    # Generate embedding for the query
    response = ollama.embed(
        model=EMBEDDING_MODEL,
        input=query
    )

    query_vector = response["embeddings"][0]

    print()
    print("Query embedding generated.")
    print(
        "Embedding dimensions:",
        len(query_vector)
    )


    # Connect to Qdrant
    if QDRANT_URL:
        client = QdrantClient(
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY or None
        )
    else:
        client = QdrantClient(
            host=QDRANT_HOST,
            port=QDRANT_PORT
        )

    # Search Qdrant    # Search Qdrant
    search_result = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=top_k,
        with_payload=True
    )

    results = search_result.points

    print()
    print(f"Results found: {len(results)}")
    print()

    for rank, result in enumerate(
        results,
        start=1
    ):

        payload = result.payload

        print("-" * 60)
        print(f"RESULT {rank}")
        print(f"Score: {result.score}")
        print(
            f"Document ID: "
            f"{payload.get('document_id')}"
        )
        print()
        print(payload.get("text"))

    print()
    print("=" * 60)
    print("RETRIEVAL COMPLETED")
    print("=" * 60)

    return results


if __name__ == "__main__":

    query = (
        "Which supplier has high defect rates "
        "in procurement orders?"
    )

    search_documents(
        query,
        top_k=5
    )