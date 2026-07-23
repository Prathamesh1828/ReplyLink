import random
from datetime import datetime
from app.services.account_service import account_service
from app.repositories.automation_repository import AutomationRepository
from app.services.meta_service import meta_service
from app.services.supabase_service import supabase

class AutomationService:
    @staticmethod
    def trigger_next_sequence_step(run_id: str, config: dict, recipient_id: str, page_access_token: str, instagram_business_id: str, step: str = "START", comment_id: str = None) -> bool:
        try:
            from app.services.meta_service import meta_service
            
            opening_enabled = config.get("openingMessageEnabled", False)
            ask_to_follow = config.get("askToFollowEnabled", False)
            
            if step == "START":
                if opening_enabled:
                    message = config.get("openingMessage", "Hello!")
                    button_label = config.get("buttonLabel", "Send Link")
                    buttons = [{"type": "postback", "title": button_label, "payload": f"AUTO_RUN_{run_id}_OPENING_CLICKED"}]
                    print(f"Sending Opening Message to {recipient_id}")
                    return meta_service.send_dm(recipient_id=recipient_id, message=message, page_access_token=page_access_token, buttons=buttons)
                else:
                    step = "OPENING_CLICKED"
                    
            if step == "OPENING_CLICKED":
                if ask_to_follow:
                    message = config.get("askToFollowMessage", "Please follow us first!")
                    button_label = config.get("imFollowingButtonLabel", "I'm Following")
                    
                    from app.services.meta_service import MetaService
                    business_username = MetaService.get_business_username(instagram_business_id, page_access_token)
                    profile_url = f"https://instagram.com/{business_username}" if business_username else "https://instagram.com"
                    
                    buttons = [
                        {"type": "web_url", "title": "Visit Profile", "url": profile_url},
                        {"type": "postback", "title": button_label, "payload": f"AUTO_RUN_{run_id}_FOLLOW_CLICKED"}
                    ]
                    print(f"Sending Ask to Follow Message to {recipient_id}")
                    return meta_service.send_dm(recipient_id=recipient_id, message=message, page_access_token=page_access_token, buttons=buttons)
                else:
                    step = "FOLLOW_CLICKED"
                    
            if step == "FOLLOW_CLICKED":
                if ask_to_follow:
                    from app.services.meta_service import MetaService
                    follows = MetaService.check_user_follows_business(recipient_id, page_access_token)
                    if not follows:
                        print(f"User {recipient_id} does not follow. Re-sending Ask to Follow.")
                        return AutomationService.trigger_next_sequence_step(run_id, config, recipient_id, page_access_token, instagram_business_id, step="OPENING_CLICKED", comment_id=comment_id)

                final_message = config.get("finalMessage", "Here is your link!")
                final_link = config.get("finalLink", "")
                final_button = config.get("finalLinkLabel", "Get Link")
                
                if final_link:
                    buttons = [{"type": "web_url", "title": final_button, "url": final_link}]
                    print(f"Sending Final Link Message to {recipient_id}")
                    return meta_service.send_dm(recipient_id=recipient_id, message=final_message, page_access_token=page_access_token, buttons=buttons)
                else:
                    print(f"Sending Final Text Message to {recipient_id}")
                    return meta_service.send_dm(recipient_id=recipient_id, message=final_message, page_access_token=page_access_token)
                    
            return True
            
        except Exception as e:
            print(f"Error in trigger_next_sequence_step: {e}")
            return False

    @staticmethod
    def handle_postback(payload: str, sender_id: str, instagram_business_id: str):
        print(f"Handling postback: {payload} from {sender_id}")
        try:
            prefix = "AUTO_RUN_"
            if not payload.startswith(prefix):
                return
                
            remaining = payload[len(prefix):]
            run_id = remaining.split("_")[0]
            step = remaining[len(run_id)+1:]
            
            print(f"Postback parsed -> Run: {run_id}, Step: {step}")
            
            run_res = supabase.table("automation_runs").select("*").eq("id", run_id).execute()
            if not run_res.data:
                print(f"Could not find run_id {run_id}")
                return
                
            run = run_res.data[0]
            automation_id = run.get("automation_id")
            
            auto_res = supabase.table("automations").select("*").eq("id", automation_id).execute()
            if not auto_res.data:
                print(f"Could not find automation {automation_id}")
                return
                
            auto = auto_res.data[0]
            config = auto.get("config", {})
            
            account = account_service.get_account_by_instagram_id(instagram_business_id)
            if not account:
                return
            page_access_token = account.get("page_access_token")
            
            AutomationService.trigger_next_sequence_step(
                run_id=run_id,
                config=config,
                recipient_id=sender_id,
                page_access_token=page_access_token,
                instagram_business_id=instagram_business_id,
                step=step
            )
            
        except Exception as e:
            print(f"Error handling postback: {e}")

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
        
        # Only process comment automations
        comment_automations = [a for a in active_automations if a.get("automation_type", "auto_dm_comments") == "auto_dm_comments"]
        
        if not comment_automations:
            print(f"No active comment automations found for user {user_id}.")
            return

        comment_text_lower = comment_text.lower()
        
        for auto in comment_automations:
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
                        step="START",
                        comment_id=comment_id
                    )
                    
                    if dm_success:
                        dm_sent = True
                    else:
                        status = "error" if not public_reply_sent else "partial_failure"
                        error_msg = error_msg + " | Failed to start DM sequence" if error_msg else "Failed to start DM sequence"
                        
                    # 6. Increment runs_count and update run status
                    new_count = auto.get("runs_count", 0) + 1
                    supabase.table("automations").update({
                        "runs_count": new_count,
                        "last_run_at": datetime.utcnow().isoformat()
                    }).eq("id", auto["id"]).execute()
                    
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

    @staticmethod
    def handle_story_reply(text: str, sender_id: str, instagram_business_id: str, message_id: str):
        print(f"Handling story reply from (ID: {sender_id}): {text}")
        
        account = account_service.get_account_by_instagram_id(instagram_business_id)
        if not account:
            return
            
        user_id = account.get("user_id")
        page_access_token = account.get("page_access_token")
        
        active_automations = AutomationRepository.get_active_automations_by_user(user_id)
        if not active_automations:
            return

        story_automations = [a for a in active_automations if a.get("automation_type") == "auto_reply_story"]
        if not story_automations:
            return

        text_lower = text.lower()
        
        for auto in story_automations:
            config = auto.get("config", {})
            keyword_type = config.get("keywordType", "specific")
            keywords = [k.lower() for k in config.get("keywords", [])]
            
            matched_keyword = "ANY"
            is_match = False
            if keyword_type == "any":
                is_match = True
            else:
                for k in keywords:
                    if k in text_lower:
                        is_match = True
                        matched_keyword = k
                        break
                        
            if is_match:
                print(f"Story Reply Match found for automation: {auto.get('name')}")
                
                try:
                    from app.services.meta_service import MetaService
                    fetched_username = MetaService.get_user_profile(sender_id, page_access_token)
                    
                    if config.get("reactToStoryReply"):
                        MetaService.react_to_message(sender_id, message_id, "❤️", page_access_token)
                    
                    run_data = {
                        "automation_id": auto["id"],
                        "comment_id": message_id,
                        "username": fetched_username or "Story Viewer", 
                        "status": "pending",
                        "instagram_account": instagram_business_id,
                        "keyword": matched_keyword,
                        "comment": text,
                        "dm_sent": False,
                        "public_reply_sent": False
                    }
                    run_res = supabase.table("automation_runs").insert(run_data).execute()
                    run_id = run_res.data[0]["id"]
                    
                    dm_success = automation_service.trigger_next_sequence_step(
                        run_id=run_id,
                        config=config,
                        recipient_id=sender_id,
                        page_access_token=page_access_token,
                        instagram_business_id=instagram_business_id,
                        step="START"
                    )
                    
                    status = "success" if dm_success else "error"
                    error_msg = None if dm_success else "Failed to start DM sequence"
                        
                    new_count = auto.get("runs_count", 0) + 1
                    supabase.table("automations").update({
                        "runs_count": new_count,
                        "last_run_at": datetime.utcnow().isoformat()
                    }).eq("id", auto["id"]).execute()
                    
                    supabase.table("automation_runs").update({
                        "status": status,
                        "error": error_msg,
                        "dm_sent": dm_success
                    }).eq("id", run_id).execute()
                    
                    break
                    
                except Exception as e:
                    print(f"Failed during story automation run execution: {e}")
                    break

    @staticmethod
    def handle_dm(text: str, sender_id: str, instagram_business_id: str, message_id: str, is_echo: bool = False, recipient_id: str = None):
        print(f"Handling DM from (ID: {sender_id}): {text} (is_echo: {is_echo})")
        
        # 1. Fetch the linked account to get user_id and access_token
        account = account_service.get_account_by_instagram_id(instagram_business_id)
        if not account:
            return
            
        user_id = account.get("user_id")
        page_access_token = account.get("page_access_token")
        
        # 1.5 Check if chat is paused for Human Handoff
        if not is_echo:
            try:
                paused_res = supabase.table("paused_chats").select("id").eq("instagram_account_id", instagram_business_id).eq("sender_id", sender_id).execute()
                if paused_res.data:
                    print(f"Chat with {sender_id} is PAUSED for human handoff. Ignoring message.")
                    return
            except Exception as e:
                print(f"Error checking paused_chats: {e}")
        
        # 2. Process Standard Keyword Automations first
        active_automations = AutomationRepository.get_active_automations_by_user(user_id)
        dm_automations = [a for a in active_automations if a.get("automation_type") in ["dm_reply", "auto_reply_dm"]] if active_automations else []
        
        matched_standard_auto = False
        text_lower = text.lower()
        
        if not is_echo and dm_automations:
            for auto in dm_automations:
                config = auto.get("config", {})
                keyword_type = config.get("keywordType", "specific")
                keywords = [k.lower() for k in config.get("keywords", [])]
                
                matched_keyword = "ANY"
                is_match = False
                if keyword_type == "any":
                    is_match = True
                else:
                    for k in keywords:
                        if k in text_lower:
                            is_match = True
                            matched_keyword = k
                            break
                            
                if is_match:
                    matched_standard_auto = True
                    print(f"DM Match found for standard automation: {auto.get('name')}")
                    
                    try:
                        from app.services.meta_service import MetaService
                        fetched_username = MetaService.get_user_profile(sender_id, page_access_token)
                        
                        run_data = {
                            "automation_id": auto["id"],
                            "comment_id": message_id,
                            "username": fetched_username or "DM Sender", 
                            "status": "pending",
                            "instagram_account": instagram_business_id,
                            "keyword": matched_keyword,
                            "comment": text,
                            "dm_sent": False,
                            "public_reply_sent": False
                        }
                        run_res = supabase.table("automation_runs").insert(run_data).execute()
                        run_id = run_res.data[0]["id"]
                        
                        dm_success = automation_service.trigger_next_sequence_step(
                            run_id=run_id,
                            config=config,
                            recipient_id=sender_id,
                            page_access_token=page_access_token,
                            instagram_business_id=instagram_business_id,
                            step="START"
                        )
                        
                        status = "success" if dm_success else "error"
                        error_msg = None if dm_success else "Failed to start DM sequence"
                            
                        new_count = auto.get("runs_count", 0) + 1
                        supabase.table("automations").update({
                            "runs_count": new_count,
                            "last_run_at": datetime.utcnow().isoformat()
                        }).eq("id", auto["id"]).execute()
                        
                        supabase.table("automation_runs").update({
                            "status": status,
                            "error": error_msg,
                            "dm_sent": dm_success
                        }).eq("id", run_id).execute()
                        
                        break # Only run one matching standard automation
                        
                    except Exception as e:
                        print(f"Failed during DM standard automation run execution: {e}")
                        break

        # 3. Process AI Agent Logic
        if matched_standard_auto:
            print("Standard automation matched. Skipping AI Agent to prevent duplicate replies.")
            return

        try:
            agent_res = supabase.table("ai_agents").select("*").eq("instagram_account_id", instagram_business_id).eq("user_id", user_id).execute()
            
            if not agent_res.data or not agent_res.data[0].get("is_active"):
                print("AI Agent is not active or not found. Ignoring AI routing.")
                return
                
            if is_echo:
                print(f"Logging AI outgoing message to {recipient_id}")
                from app.services.meta_service import MetaService
                fetched_username = MetaService.get_user_profile(recipient_id, page_access_token) or "Instagram User"
                
                ai_auto_res = supabase.table("automations").select("id").eq("user_id", user_id).eq("automation_type", "ai_agent").execute()
                if ai_auto_res.data:
                    ai_automation_id = ai_auto_res.data[0]["id"]
                    run_data = {
                        "automation_id": ai_automation_id,
                        "comment_id": message_id,
                        "username": fetched_username,
                        "status": "success",
                        "instagram_account": instagram_business_id,
                        "keyword": "AI_AGENT_REPLY",
                        "comment": text,
                        "dm_sent": True,
                        "public_reply_sent": False
                    }
                    supabase.table("automation_runs").insert(run_data).execute()
                return

            agent_settings = agent_res.data[0]
            config = agent_settings.get("config", {})
            activation = config.get("activation", "after_keyword_automation")
            automation_ids = config.get("automation_ids", [])
            
            if not config.get("activation") and config.get("aiTrigger") == "Every Incoming Message":
                activation = "all_dms"
                
            if activation == "after_keyword_automation":
                from app.services.meta_service import MetaService
                fetched_username = MetaService.get_user_profile(sender_id, page_access_token)
                
                recent_runs_res = supabase.table("automation_runs") \
                    .select("automation_id, automations(automation_type)") \
                    .eq("username", fetched_username) \
                    .eq("instagram_account", instagram_business_id) \
                    .order("created_at", desc=True) \
                    .limit(10) \
                    .execute()
                    
                allowed = False
                if recent_runs_res.data:
                    for run in recent_runs_res.data:
                        auto_meta = run.get("automations")
                        if auto_meta and isinstance(auto_meta, dict) and auto_meta.get("automation_type") == "ai_agent":
                            continue
                        
                        if run.get("automation_id") in automation_ids:
                            allowed = True
                        break
                        
                if not allowed:
                    print(f"AI Agent skipped: the most recent automation for user {fetched_username} is not enabled for AI takeover.")
                    return

            persona = agent_settings.get("persona", "You are a helpful assistant.")
            fallback = agent_settings.get("fallback_message", "I am having trouble understanding right now.")
            cal_booking_link = agent_settings.get("cal_booking_link", "")
            
            # Extract advanced config settings
            ai_goal = config.get("aiGoal", "Sales Assistant")
            tone = config.get("tone", "Friendly")
            reply_delay = config.get("replyDelay", "Instant")
            message_length = config.get("messageLength", "Short")
            use_emojis = config.get("useEmojis", True)

            # Enforce Reply Delay
            if reply_delay != "Instant":
                delay_map = {"2s": 2, "5s": 5, "10s": 10}
                delay_sec = delay_map.get(reply_delay, 0)
                if delay_sec > 0:
                    import time
                    print(f"AI Agent applying reply delay of {delay_sec} seconds...")
                    time.sleep(delay_sec)

            # Construct Advanced Persona
            emoji_instruction = "Use emojis naturally." if use_emojis else "Do NOT use any emojis. This is a strict requirement."
            length_instruction = {
                "Short": "Keep your response very short (1-2 sentences maximum). Be concise.",
                "Medium": "Keep your response medium length (3-4 sentences).",
                "Detailed": "Provide a detailed response in paragraphs."
            }.get(message_length, "Keep your response short.")
            
            advanced_persona = f"{persona}\n\nYour primary goal is: {ai_goal}.\nEnsure your tone is strictly: {tone}.\n{length_instruction}\n{emoji_instruction}"
            
            # Retrieve relevant knowledge
            from app.services.knowledge_service import search_relevant_knowledge
            from app.services.ai_service import generate_ai_response
            
            knowledge_results = search_relevant_knowledge(user_id=user_id, user_message=text, limit=3)
            
            context = ""
            if knowledge_results:
                context = "\n".join([f"Q: {k['question']}\nA: {k['answer']}" for k in knowledge_results])
                
            if not context:
                context = "No specific knowledge found. Answer generally if possible."
                
            cal_instructions = ""
            if cal_booking_link:
                formatted_link = cal_booking_link if cal_booking_link.startswith("http") else f"https://{cal_booking_link}"
                cal_instructions = f"\nYou have a Cal.com booking link available: {formatted_link}. IMPORTANT: ONLY provide this link if the user EXPLICITLY asks to book a call, schedule a meeting, or asks for next steps. Do NOT provide the link proactively in your first message unless they specifically requested a meeting. When you do share it, you MUST output the raw URL {formatted_link} with spaces around it. Do NOT use markdown like [link](url) and do NOT wrap the URL in quotes or brackets."

            # Construct Handoff Instructions
            handoff_instructions = ""
            handoff_settings = config.get("handoffSettings", {})
            if handoff_settings and handoff_settings.get("triggers"):
                triggers = handoff_settings.get("triggers", [])
                conds = []
                if "support" in triggers:
                    conds.append("asks for support, help, or to speak to a human")
                if "cannot_answer" in triggers:
                    conds.append("you absolutely cannot answer the user's question using the knowledge base")
                if "frustration" in triggers:
                    conds.append("the user expresses frustration, anger, or uses profanity")
                
                if conds:
                    handoff_instructions = f"\nIMPORTANT: If {' or '.join(conds)}, you MUST reply with exactly the secret word: [HANDOFF_TRIGGERED]. Do not say anything else in your reply."

            # Generate AI response
            prompt = f"""
{advanced_persona}
{cal_instructions}
{handoff_instructions}

You have the following knowledge base to answer the user's question:
---
{context}
---

User's message: "{text}"

If the answer is in the knowledge base, use it to answer. If not, try to be helpful or guide them appropriately based on your persona.
Do not use markdown.
"""
            ai_reply = generate_ai_response(prompt)
            
            if ai_reply:
                if "[HANDOFF_TRIGGERED]" in ai_reply.upper():
                    print(f"AI triggered Human Handoff for {sender_id}")
                    # 1. Pause chat
                    try:
                        supabase.table("paused_chats").insert({
                            "instagram_account_id": instagram_business_id,
                            "sender_id": sender_id,
                            "user_id": user_id
                        }).execute()
                    except Exception as e:
                        print(f"Failed to insert into paused_chats: {e}")
                    
                    # 2. Send Fallback Message
                    handoff_fallback = handoff_settings.get("fallbackMessage", fallback)
                    meta_service.send_dm(
                        recipient_id=sender_id,
                        message=handoff_fallback,
                        page_access_token=page_access_token
                    )
                    return

                # Strip markdown links just in case the LLM disobeys
                import re
                ai_reply = re.sub(r'\[.*?\]\((https?://.*?)\)', r' \1 ', ai_reply)
                
                print(f"AI Agent generated reply: {ai_reply}")
                meta_service.send_dm(
                    recipient_id=sender_id,
                    message=ai_reply,
                    page_access_token=page_access_token
                )
                
                # Fetch username for logging
                from app.services.meta_service import MetaService
                fetched_username = MetaService.get_user_profile(sender_id, page_access_token) or "Instagram User"
                
                # Get or create a proxy automation for the AI Agent
                ai_auto_res = supabase.table("automations").select("id").eq("user_id", user_id).eq("automation_type", "ai_agent").execute()
                if ai_auto_res.data:
                    ai_automation_id = ai_auto_res.data[0]["id"]
                else:
                    new_auto = supabase.table("automations").insert({
                        "user_id": user_id,
                        "name": "AI Agent",
                        "automation_type": "ai_agent",
                        "status": "Active",
                        "config": {},
                        "active": True,
                        "keyword": "AI_AGENT",
                        "dm_message": "AI Generated Reply",
                        "link": ""
                    }).execute()
                    ai_automation_id = new_auto.data[0]["id"]
                
                # Log to automation_runs
                run_data = {
                    "automation_id": ai_automation_id,
                    "comment_id": message_id,
                    "username": fetched_username,
                    "status": "success",
                    "instagram_account": instagram_business_id,
                    "keyword": "AI_AGENT_DM",
                    "comment": text,
                    "dm_sent": True,
                    "public_reply_sent": False
                }
                
                supabase.table("automation_runs").insert(run_data).execute()
            else:
                meta_service.send_dm(
                    recipient_id=sender_id,
                    message=fallback,
                    page_access_token=page_access_token
                )
                
        except Exception as e:
            print(f"Error handling DM with AI Agent: {e}")

automation_service = AutomationService()