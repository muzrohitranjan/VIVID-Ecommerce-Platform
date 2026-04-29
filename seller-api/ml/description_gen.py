from transformers import pipeline
import torch

# Load once
generator = pipeline("text-generation", model="gpt2", device=0 if torch.cuda.is_available() else -1)

def generate_description(name: str, category: str, price: str) -> str:
    prompt = f"Product: {name}. Category: {category}. Price: ${price}. Description: This is a premium "
    result = generator(prompt, max_length=100, num_return_sequences=1)[0]['generated_text']
    return result[len(prompt):].strip()[:500]

