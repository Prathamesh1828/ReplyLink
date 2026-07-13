from app.services.embedding_service import generate_embedding

embedding = generate_embedding(
    "Our plans start at ₹999/month."
)

print(f"Embedding length: {len(embedding)}")
print(embedding[:10])