# ReplyLink - Interview Preparation Guide

This document covers the core technical concepts you implemented in ReplyLink and provides strategies for answering common interview questions, including how to handle the Meta App Review question.

## 1. Core Technical Concepts (Be prepared to explain these)

### 1.1. Webhooks & Event-Driven Architecture
*   **What it is:** Instead of your backend constantly asking Meta "Did I get a new message?" (polling), Meta sends an HTTP POST request to your `/webhook` endpoint the exact millisecond a message arrives.
*   **Why it's important:** It's highly efficient and enables real-time responses.
*   **Interview Talking Point:** Mention that handling webhooks requires your server to be fast. If your server takes too long to respond, Meta will assume it crashed and retry the webhook. This is why you chose **FastAPI** (it handles concurrent requests asynchronously very well).

### 1.2. OAuth 2.0 (Meta Login)
*   **What it is:** The protocol used when a user clicks "Connect Instagram". 
*   **How it works in your app:**
    1. You redirect the user to Meta's login page.
    2. Meta authenticates them and asks for permissions.
    3. Meta redirects them back to your backend with a temporary "authorization code".
    4. Your backend secretly exchanges that code with Meta for a "Long-Lived Page Access Token".
*   **Interview Talking Point:** Emphasize security. You never see the user's password; you only store the access token securely in your database.

### 1.3. Retrieval-Augmented Generation (RAG)
*   **What it is:** LLMs (like Groq or Google GenAI) only know what they were trained on. RAG is the process of retrieving your user's specific business data (their Knowledge Base) and injecting it into the prompt before asking the LLM to generate a reply.
*   **Interview Talking Point:** Explain that this prevents "hallucinations" (the AI making things up) and allows the AI agent to answer highly specific questions about a user's business (like store hours or pricing).

### 1.4. JWT and Row Level Security (RLS)
*   **What it is:** You use Supabase for authentication. When a user logs in, they get a JSON Web Token (JWT). Supabase PostgreSQL uses Row Level Security (RLS).
*   **Interview Talking Point:** Explain that RLS ensures that even if a hacker found a way to query your database directly from the frontend, the database itself rejects the query if the user's JWT doesn't match the `user_id` on the row they are trying to read.

---

## 2. Tackling the "Meta App Review" Question

It is extremely common for independent developers to have portfolio projects that rely on major APIs (Meta, Google, X) stuck in "Development Mode." Interviewers know this.

If an interviewer asks: *"Is this app live? Can I use it with my own Instagram account right now?"*

**Here is the perfect way to answer:**

> *"Currently, the app is in Meta's 'Development Mode.' From a purely technical perspective, the application is 100% complete and production-ready. However, Meta requires a formal 'Business Verification' process—which requires legal business registration documents—before they will approve the app for public 'Live Mode'.*
>
> *Because this is a portfolio project, I haven't incorporated an LLC to pass that specific bureaucratic hurdle. Right now, I can add anyone as a 'Tester' in the Meta Developer portal to demonstrate the exact live functionality, but a random public user cannot connect their account just yet. The technical implementation for OAuth and Webhooks remains exactly the same regardless of the app's review status."*

### Why this is a great answer:
1. **It shows you understand the platform:** You know the difference between Development Mode and Live Mode, and you know about the Business Verification requirement.
2. **It sets a boundary:** It clearly explains that the block is legal/bureaucratic, not a lack of your technical skill.
3. **It proves it works:** Offering the "Tester" workaround proves that the code functions perfectly.

---

## 3. Anticipated System Design Questions

**Q: How would you scale the webhook receiver if the app got 10,000 users?**
*   **Answer:** I would decouple the webhook receiving from the AI processing. When Meta hits the `/webhook` endpoint, I would immediately push the JSON payload to a message broker (like Redis, RabbitMQ, or AWS SQS) and return a `200 OK` to Meta within milliseconds. Then, background worker instances would pull from that queue, call the LLM, and send the replies at their own pace.

**Q: Why did you choose Vercel for Frontend and Render for Backend instead of putting it all in one place?**
*   **Answer:** Vercel is specifically engineered to optimize Next.js (Edge caching, serverless rendering). However, Vercel's serverless functions have strict timeout limits (e.g., 10 to 60 seconds), which can be risky when waiting on LLM API responses. By putting the FastAPI backend on Render, I get a dedicated, long-running server that can handle slow AI generations without timing out, while still getting Vercel's ultra-fast frontend delivery.
