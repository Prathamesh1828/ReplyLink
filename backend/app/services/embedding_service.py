from sentence_transformers import SentenceTransformer

print("Loading BGE Base model...")

model = SentenceTransformer(
    "BAAI/bge-base-en-v1.5"
)


def generate_embedding(
    text: str,
    is_query: bool = False
):
    """
    Generate embeddings for documents or queries.
    """

    if is_query:
        text = (
            "Represent this sentence for searching "
            "relevant passages: " + text
        )

    embedding = model.encode(
        text,
        normalize_embeddings=True
    )

    return embedding.tolist()