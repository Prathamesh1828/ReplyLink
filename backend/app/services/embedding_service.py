import requests
import os

# We use the HuggingFace Inference API to offload the heavy AI model from our tiny 512MB server.
HF_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/BAAI/bge-base-en-v1.5"
HF_TOKEN = os.getenv("HF_TOKEN") # Optional: Add a free HuggingFace token to .env if you hit rate limits

def generate_embedding(
    text: str,
    is_query: bool = False
):
    """
    Generate embeddings using the free HuggingFace Inference API instead of local PyTorch.
    This takes 0MB of RAM and allows the app to deploy on Render's free tier.
    """
    if is_query:
        text = (
            "Represent this sentence for searching "
            "relevant passages: " + text
        )

    headers = {}
    if HF_TOKEN:
        headers["Authorization"] = f"Bearer {HF_TOKEN}"
        
    response = requests.post(
        HF_API_URL, 
        headers=headers, 
        json={"inputs": text}
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error generating embedding: {response.text}")
        return []