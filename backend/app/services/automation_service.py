import random
from app.services.account_service import account_service
from app.repositories.automation_repository import AutomationRepository
from app.services.meta_service import meta_service
from app.services.supabase_service import supabase

class AutomationService:
    @staticmethod
    def handle_comment(comment_text: str, username: str, commenter_id: str, comment_id: str, instagram_business_id: str, media_id: str = "Unknown"):
        print(f"Handling comment from {username} (ID: {commenter_id}): {comment_text} on Media ID: {media_id}")
        
        # 1. Fetch the linked account to get user_id and access_token
        account = account_service.get_account_by_instagram_id(instagram_business_id)
        if not account:
            print(f"No active account found for IG ID {instagram_business_id}")
            return
            
        user_id = account.get("user_id")
        page_access_token = account.get("page_access_token")
        
        # 2. Fetch active automations for the user via Repository
        active_automations = AutomationRepository.get_active_automations_by_user(user_id)
        
        if not active_automations:
            print(f"No active automations found for user {user_id}.")
            return

        comment_text_lower = comment_text.lower()
        
        for auto in active_automations:
            config = auto.get("config", {})
            
            # Post Filtering
            post_selection = config.get("postSelection", "all")
            if post_selection == "manual":
                selected_post_ids = config.get("selectedPostIds", [])
                if media_id not in selected_post_ids and media_id != "Unknown":
                    print(f"Skipping automation {auto.get('name')}: Post ID {media_id} not in selected posts.")
                    continue
                    
            keyword_type = config.get("keywordType", "specific")
            keywords = [k.lower() for k in config.get("keywords", [])]
            
            matched_keyword = "ANY"
            is_match = False
            if keyword_type == "any":
                is_match = True
            else:
                for k in keywords:
                    if k in comment_text_lower:
                        is_match = True
                        matched_keyword = k
                        break
                        
            if is_match:
                print(f"Match found for automation: {auto.get('name')}")
                
                dm_sent = False
                public_reply_sent = False
                status = "success"
                error_msg = None
                
                try:
                    # 3. Prevent duplicate replies by logging the run immediately
                    run_data = {
                        "automation_id": auto["id"],
                        "comment_id": comment_id,
                        "username": username,
                        "status": "pending",
                        "instagram_account": instagram_business_id,
                        "keyword": matched_keyword,
                        "comment": comment_text,
                        "dm_sent": False,
                        "public_reply_sent": False
                    }
                    # We assume `automation_runs` enforces uniqueness on `comment_id` + `automation_id`
                    run_res = supabase.table("automation_runs").insert(run_data).execute()
                    run_id = run_res.data[0]["id"]
                    
                    # 4. Execute Public Reply (if enabled)
                    if config.get("publicReplyEnabled"):
                        replies = config.get("publicReplies", [])
                        if replies:
                            reply_text = random.choice(replies)
                            print(f"Replying to comment with: {reply_text}")
                            success = meta_service.reply_to_comment(
                                comment_id=comment_id, 
                                message=reply_text, 
                                page_access_token=page_access_token
                            )
                            if success:
                                public_reply_sent = True
                            else:
                                status = "partial_failure"
                                error_msg = "Failed to send public reply"

                    # 5. Execute DM Sequence (State Machine)
                    dm_success = automation_service.trigger_next_sequence_step(
                        run_id=run_id,
                        config=config,
                        recipient_id=commenter_id,
                        page_access_token=page_access_token,
                        instagram_business_id=instagram_business_id,
                        step="START"
                    )
                    
                    if dm_success:
                        dm_sent = True
                    else:
                        status = "error" if not public_reply_sent else "partial_failure"
                        error_msg = error_msg + " | Failed to start DM sequence" if error_msg else "Failed to start DM sequence"
                        
                    # 6. Increment runs_count and update run status
                    new_count = auto.get("runs_count", 0) + 1
                    supabase.table("automations").update({"runs_count": new_count}).eq("id", auto["id"]).execute()
                    
                    supabase.table("automation_runs").update({
                        "status": status,
                        "error": error_msg,
                        "dm_sent": dm_sent,
                        "public_reply_sent": public_reply_sent
                    }).eq("id", run_id).execute()
                    
                    break
                    
                except Exception as e:
                    print(f"Failed during automation run execution: {e}")
                    break

    def trigger_next_sequence_step(self, run_id: str, config: dict, recipient_id: str, page_access_token: str, instagram_business_id: str, step: str) -> bool:
        """State machine for DM sequence."""
        try:
            if step == "START":
                if config.get("openingMessageEnabled") and config.get("openingMessage"):
                    # Send Opening Message with Postback
                    next_step = "FOLLOW" if config.get("askToFollowEnabled") else "FINAL"
                    buttons = [{
                        "type": "postback",
                        "title": config.get("buttonLabel", "Click Here"),
                        "payload": f"AUTO_RUN_{run_id}_STEP_{next_step}"
                    }]
                    return meta_service.send_dm(
                        recipient_id=recipient_id,
                        message=config.get("openingMessage"),
                        page_access_token=page_access_token,
                        buttons=buttons
                    )
                else:
                    # Skip opening message, go directly to next logical step
                    return self.trigger_next_sequence_step(run_id, config, recipient_id, page_access_token, instagram_business_id, "FOLLOW" if config.get("askToFollowEnabled") else "FINAL")
                    
            elif step == "FOLLOW":
                if config.get("askToFollowEnabled") and config.get("askToFollowMessage"):
                    # Send Follow Gate Message
                    # Fetch the business username to build a direct profile link
                    business_username = meta_service.get_business_username(instagram_business_id, page_access_token)
                    profile_url = f"https://instagram.com/{business_username}" if business_username else "https://instagram.com/"
                    
                    buttons = [
                        {
                            "type": "web_url",
                            "url": profile_url,
                            "title": config.get("profileButtonLabel", "Visit Profile")
                        },
                        {
                            "type": "postback",
                            "title": config.get("imFollowingButtonLabel", "I'm following ✅"),
                            "payload": f"AUTO_RUN_{run_id}_STEP_VERIFY_FOLLOW"
                        }
                    ]
                    return meta_service.send_dm(
                        recipient_id=recipient_id,
                        message=config.get("askToFollowMessage"),
                        page_access_token=page_access_token,
                        buttons=buttons
                    )
                else:
                    return self.trigger_next_sequence_step(run_id, config, recipient_id, page_access_token, instagram_business_id, "FINAL")
            
            elif step == "VERIFY_FOLLOW":
                print(f"Verifying follow status for {recipient_id}")
                is_following = meta_service.check_user_follows_business(recipient_id, page_access_token)
                if is_following:
                    print("User is following! Proceeding to FINAL.")
                    return self.trigger_next_sequence_step(run_id, config, recipient_id, page_access_token, instagram_business_id, "FINAL")
                else:
                    print("User is NOT following. Looping back to FOLLOW.")
                    return self.trigger_next_sequence_step(run_id, config, recipient_id, page_access_token, instagram_business_id, "FOLLOW")
                    
            elif step == "FINAL":
                if config.get("finalMessage"):
                    buttons = [{
                        "type": "web_url",
                        "url": config.get("finalLink", "https://google.com"),
                        "title": config.get("finalLinkLabel", "App ❤️")
                    }]
                    return meta_service.send_dm(
                        recipient_id=recipient_id,
                        message=config.get("finalMessage"),
                        page_access_token=page_access_token,
                        buttons=buttons
                    )
                return True
                
        except Exception as e:
            print(f"Error triggering sequence step {step}: {e}")
            return False

    def handle_postback(self, payload: str, sender_id: str, instagram_business_id: str):
        print(f"Handling postback: {payload} from {sender_id}")
        if not payload.startswith("AUTO_RUN_"):
            return
            
        parts = payload.split("_STEP_")
        if len(parts) != 2:
            return
            
        run_id = parts[0].replace("AUTO_RUN_", "")
        step = parts[1]
        
        # 1. Fetch the run
        run_res = supabase.table("automation_runs").select("*").eq("id", run_id).execute()
        if not run_res.data:
            print(f"Run {run_id} not found.")
            return
            
        run = run_res.data[0]
        automation_id = run["automation_id"]
        
        # 2. Fetch the automation config
        auto_res = supabase.table("automations").select("*").eq("id", automation_id).execute()
        if not auto_res.data:
            print(f"Automation {automation_id} not found.")
            return
            
        config = auto_res.data[0].get("config", {})
        
        # 3. Fetch account
        account = account_service.get_account_by_instagram_id(instagram_business_id)
        if not account:
            return
            
        page_access_token = account.get("page_access_token")
        
        # 4. Trigger next step
        self.trigger_next_sequence_step(run_id, config, sender_id, page_access_token, instagram_business_id, step)

automation_service = AutomationService()