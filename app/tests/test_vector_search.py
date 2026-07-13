from app.services.knowledge_service import search_relevant_knowledge

results = search_relevant_knowledge(
    "Can I try ReplyLink before paying?"
)

print("\n========== RESULTS ==========\n")

for item in results:
    print(item["question"])
    print(item["answer"])
    print(f"Similarity: {item['similarity']:.3f}")
    print("-" * 40)