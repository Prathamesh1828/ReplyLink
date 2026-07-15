from app.services.knowledge_service import (
    get_all_knowledge,
    find_exact_answer
)


print("========== ALL KNOWLEDGE ==========\n")

knowledge = get_all_knowledge()

for item in knowledge:
    print(item["question"])

print("\n========== SEARCH ==========\n")

answer = find_exact_answer("pricing")

print(answer)