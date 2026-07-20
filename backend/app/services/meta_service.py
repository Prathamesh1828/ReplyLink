import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings

class MetaService:
    BASE_URL = "https://graph.facebook.com/v19.0"

    @staticmethod
    def exchange_code_for_token(code: str) -> Optional[str]:
        """Exchanges an OAuth code for a short-lived user access token."""
        url = f"{MetaService.BASE_URL}/oauth/access_token"
        params = {
            "client_id": settings.META_APP_ID,
            "redirect_uri": settings.META_REDIRECT_URI,
            "client_secret": settings.META_APP_SECRET,
            "code": code
        }
        with httpx.Client() as client:
            response = client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                return data.get("access_token")
            print(f"Error exchanging code: {response.text}")
            return None

    @staticmethod
    def get_long_lived_token(short_lived_token: str) -> Optional[str]:
        """Exchanges a short-lived token for a long-lived user access token."""
        url = f"{MetaService.BASE_URL}/oauth/access_token"
        params = {
            "grant_type": "fb_exchange_token",
            "client_id": settings.META_APP_ID,
            "client_secret": settings.META_APP_SECRET,
            "fb_exchange_token": short_lived_token
        }
        with httpx.Client() as client:
            response = client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                return data.get("access_token")
            print(f"Error getting long-lived token: {response.text}")
            return None

    @staticmethod
    def get_user_pages(user_access_token: str) -> List[Dict[str, Any]]:
        """Fetches the Facebook Pages the user manages, including linked IG accounts."""
        url = f"{MetaService.BASE_URL}/me/accounts"
        params = {
            "access_token": user_access_token,
            "fields": "id,name,access_token,instagram_business_account"
        }
        with httpx.Client() as client:
            response = client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                return data.get("data", [])
            print(f"Error fetching pages: {response.text}")
            return []
    @staticmethod
    def subscribe_page_to_webhooks(page_id: str, page_access_token: str) -> bool:
        """Subscribes the Facebook Page to the App's webhooks (crucial for receiving comments/DMs)."""
        url = f"{MetaService.BASE_URL}/{page_id}/subscribed_apps"
        params = {
            "subscribed_fields": "feed",
            "access_token": page_access_token
        }
        with httpx.Client() as client:
            response = client.post(url, params=params)
            if response.status_code == 200 and response.json().get("success"):
                print(f"Successfully subscribed page {page_id} to webhooks.")
                return True
            print(f"Error subscribing page {page_id}: {response.text}")
            return False

    @staticmethod
    def reply_to_comment(comment_id: str, message: str, page_access_token: str) -> bool:
        """Replies publicly to an Instagram comment."""
        url = f"{MetaService.BASE_URL}/{comment_id}/replies"
        payload = {
            "message": message,
            "access_token": page_access_token
        }
        with httpx.Client() as client:
            response = client.post(url, json=payload)
            if response.status_code == 200:
                return True
            print(f"Error replying to comment: {response.text}")
            return False

    @staticmethod
    def send_dm(recipient_id: str, message: str, button_label: str = "", link_url: str = "", page_access_token: str = "", buttons: list = None, image_url: str = None, comment_id: str = None) -> bool:
        """Sends a direct message to a user on Instagram."""
        url = f"{MetaService.BASE_URL}/me/messages"
        
        # Build the structured message payload if there are buttons or link
        if buttons or (link_url and button_label):
            if image_url:
                # Use generic template if we have an image
                message_payload = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": [
                                {
                                    "title": message[:80] if message else "Message",
                                    "image_url": image_url,
                                    "subtitle": message[80:160] if len(message) > 80 else "",
                                    "buttons": buttons if buttons else [
                                        {
                                            "type": "web_url",
                                            "url": link_url,
                                            "title": button_label
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                }
            else:
                # Use button template if we only have text and buttons
                message_payload = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "button",
                            "text": message[:640], # Button template text limit is 640 chars
                            "buttons": buttons if buttons else [
                                {
                                    "type": "web_url",
                                    "url": link_url,
                                    "title": button_label
                                }
                            ]
                        }
                    }
                }
        elif image_url:
            # Send just an image if no buttons
            message_payload = {
                "attachment": {
                    "type": "image",
                    "payload": {
                        "url": image_url
                    }
                }
            }
        else:
            message_payload = {"text": message}

        if comment_id:
            payload = {
                "recipient": {"comment_id": comment_id},
                "message": message_payload,
                "access_token": page_access_token
            }
        else:
            payload = {
                "recipient": {"id": recipient_id},
                "message": message_payload,
                "access_token": page_access_token
            }
        
        with httpx.Client() as client:
            response = client.post(url, json=payload)
            if response.status_code == 200:
                return True
            print(f"Error sending DM: {response.text}")
            return False

    @staticmethod
    def react_to_message(recipient_id: str, message_id: str, emoji: str, page_access_token: str) -> bool:
        """Sends a reaction to an Instagram DM/story reply."""
        url = f"{MetaService.BASE_URL}/me/messages"
        payload = {
            "recipient": {"id": recipient_id},
            "sender_action": "react",
            "payload": {
                "message_id": message_id,
                "reaction": emoji
            },
            "access_token": page_access_token
        }
        with httpx.Client() as client:
            response = client.post(url, json=payload)
            if response.status_code == 200:
                return True
            print(f"Error reacting to message: {response.text}")
            return False

    @staticmethod
    def check_user_follows_business(user_id: str, page_access_token: str) -> bool:
        """Checks if a user (via their IG-scoped ID) follows the business account."""
        url = f"{MetaService.BASE_URL}/{user_id}"
        params = {
            "fields": "is_user_follow_business",
            "access_token": page_access_token
        }
        try:
            with httpx.Client() as client:
                response = client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    return data.get("is_user_follow_business", False)
                print(f"Error checking follow status: {response.text}")
                return False
        except Exception as e:
            print(f"Exception checking follow status: {e}")
            return False

    @staticmethod
    def get_business_username(business_id: str, access_token: str) -> str:
        """Fetches the Instagram business account username."""
        url = f"{MetaService.BASE_URL}/{business_id}"
        params = {
            "fields": "username",
            "access_token": access_token
        }
        try:
            with httpx.Client() as client:
                response = client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    return data.get("username", "")
        except Exception as e:
            print(f"Exception fetching username: {e}")
        return ""

    @staticmethod
    def get_user_profile(user_id: str, access_token: str) -> Optional[str]:
        """Fetches the Instagram user's username using their IG-scoped ID."""
        url = f"{MetaService.BASE_URL}/{user_id}"
        params = {
            "fields": "username",
            "access_token": access_token
        }
        try:
            with httpx.Client() as client:
                response = client.get(url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    return data.get("username")
                print(f"Error fetching user profile: {response.text}")
                return None
        except Exception as e:
            print(f"Exception fetching user profile: {e}")
            return None

    @staticmethod
    def get_instagram_media(instagram_id: str, access_token: str) -> List[Dict[str, Any]]:
        """Fetches the user's Instagram media (posts, reels, carousels)."""
        url = f"{MetaService.BASE_URL}/{instagram_id}/media"
        params = {
            "fields": "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count",
            "access_token": access_token,
            "limit": 50 # Fetch up to 50 recent posts
        }
        with httpx.Client() as client:
            response = client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                return data.get("data", [])
            print(f"Error fetching Instagram media: {response.text}")
            return []

    @staticmethod
    def get_instagram_stories(instagram_id: str, access_token: str) -> List[Dict[str, Any]]:
        """Fetches the user's active Instagram stories (last 24 hours)."""
        url = f"{MetaService.BASE_URL}/{instagram_id}/stories"
        params = {
            "fields": "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count",
            "access_token": access_token,
            "limit": 50
        }
        with httpx.Client() as client:
            response = client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                return data.get("data", [])
            print(f"Error fetching Instagram stories: {response.text}")
            return []

meta_service = MetaService()
