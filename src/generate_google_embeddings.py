
from pathlib import Path
import json
import os
import time

from dotenv import load_dotenv
from google import genai
from google.genai import types

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DOCUMENTS_DIR = BASE_DIR / "data" / "processed" / "documents"
OUTPUT_FILE = BASE_DIR / "data" / "processed" / "embeddings_google.json"

EMBEDDING_MODEL = "gemini-embedding-001"
OUTPUT_DIMENSIONS = 768


def generate_embeddings():
    api_key = os.getenv("GOOGLE_API_KEY")

    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY missing. Check root .env file.")

    document_files = sorted(DOCUMENTS_DIR.glob("*.txt"))

    if not document_files:
        raise FileNotFoundError(f"No .txt documents found in {DOCUMENTS_DIR}")

    client = genai.Client(api_key=api_key)
    embeddings_data = []

    print("=" * 60)
    print("PROCURE BOT - GOOGLE EMBEDDING GENERATION")
    print("=" * 60)
    print(f"Documents found: {len(document_files)}")
    print(f"Model: {EMBEDDING_MODEL}")
    print("Original Nomic embeddings will not be modified.")
    print()

    for index, document_file in enumerate(document_files, start=1):
        text = document_file.read_text(encoding="utf-8").strip()

        if not text:
            print(f"Skipping empty document: {document_file.name}")
            continue

        for attempt in range(3):
            try:
                response = client.models.embed_content(
                    model=EMBEDDING_MODEL,
                    contents=text,
                    config=types.EmbedContentConfig(
                        output_dimensionality=OUTPUT_DIMENSIONS
                    ),
                )

                embedding = response.embeddings[0].values

                if len(embedding) != OUTPUT_DIMENSIONS:
                    raise ValueError(
                        f"Unexpected embedding dimensions: {document_file.name}"
                    )

                embeddings_data.append({
                    "document_id": document_file.stem,
                    "text": text,
                    "embedding": embedding,
                })
                break

            except Exception as error:
                if attempt == 2:
                    raise RuntimeError(
                        f"Failed on {document_file.name}: {error}"
                    ) from error

                print(f"Temporary API error on {document_file.name}; retrying...")
                time.sleep(5)

        if index % 10 == 0 or index == len(document_files):
            print(f"Processed: {index}/{len(document_files)}")

        time.sleep(0.5)

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT_FILE.open("w", encoding="utf-8") as file:
        json.dump(embeddings_data, file)

    print()
    print(f"Embeddings generated: {len(embeddings_data)}")
    print(f"Saved to: {OUTPUT_FILE}")

    if embeddings_data:
        print(f"Dimensions: {len(embeddings_data[0]['embedding'])}")

    print("GOOGLE EMBEDDING GENERATION COMPLETED")


if __name__ == "__main__":
    generate_embeddings()