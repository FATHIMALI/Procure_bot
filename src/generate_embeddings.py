from pathlib import Path
import json

import ollama


# Project root
BASE_DIR = Path(__file__).resolve().parent.parent

DOCUMENTS_DIR = (
    BASE_DIR
    / "data"
    / "processed"
    / "documents"
)

OUTPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "embeddings.json"
)

EMBEDDING_MODEL = "nomic-embed-text"


def generate_embeddings():

    print("=" * 60)
    print("PROCURE BOT - EMBEDDING GENERATION")
    print("=" * 60)

    document_files = sorted(
        DOCUMENTS_DIR.glob("*.txt")
    )

    print(f"Documents found: {len(document_files)}")
    print(f"Embedding model: {EMBEDDING_MODEL}")
    print()

    embeddings_data = []

    for index, document_file in enumerate(
        document_files,
        start=1
    ):

        text = document_file.read_text(
            encoding="utf-8"
        )

        response = ollama.embed(
            model=EMBEDDING_MODEL,
            input=text
        )

        embedding = response["embeddings"][0]

        embeddings_data.append(
            {
                "document_id": document_file.stem,
                "text": text,
                "embedding": embedding,
            }
        )

        if index % 50 == 0 or index == len(document_files):
            print(
                f"Processed: {index}/{len(document_files)}"
            )

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            embeddings_data,
            file
        )

    print()
    print(
        f"Embeddings generated: {len(embeddings_data)}"
    )

    print(
        f"Saved to: {OUTPUT_FILE}"
    )

    if embeddings_data:
        print(
            f"Embedding dimensions: "
            f"{len(embeddings_data[0]['embedding'])}"
        )

    print()
    print("=" * 60)
    print("EMBEDDING GENERATION COMPLETED")
    print("=" * 60)


if __name__ == "__main__":
    generate_embeddings()