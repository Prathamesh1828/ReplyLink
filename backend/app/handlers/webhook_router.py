from app.handlers.comment_handler import process_comment
from app.handlers.button_handler import handle_button


def route_event(event: dict):
    """
    Central event router.

    Every Instagram webhook event enters here first,
    then gets routed to the appropriate handler.
    """

    event_type = event.get("type")

    if event_type == "comment":

        process_comment(
            username=event["username"],
            comment_text=event["text"]
        )

    elif event_type == "button":

        handle_button(
            username=event["username"],
            button=event["button"]
        )

    else:

        print(f"Unknown event type: {event_type}")