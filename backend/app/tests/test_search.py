from app.services.knowledge_service import search_relevant_knowledge

results = search_relevant_knowledge(
    "What are your pricing plans and do you offer a trial?"
)

print()

for item in results:

    print("-----------------------")
    print(item["question"])
    print(item["answer"])