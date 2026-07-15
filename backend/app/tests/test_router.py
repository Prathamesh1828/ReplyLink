from app.handlers.webhook_router import route_event

event = {
    "type": "button",
    "username": "test_user"
}

route_event(event)