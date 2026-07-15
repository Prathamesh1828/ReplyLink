from app.handlers.comment_handler import process_comment


print("\n--- PRICE TEST ---")
process_comment(
    username="test_user",
    comment_text="PRICE"
)


print("\n--- DEMO TEST ---")
process_comment(
    username="test_user",
    comment_text="DEMO"
)