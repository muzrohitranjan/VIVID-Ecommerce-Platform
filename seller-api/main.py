from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import shutil
from datetime import datetime
import uuid

try:
    from database import products_collection
    from schemas import ProductCreate, Product, ProductUpdate
    from crud import create_product, get_products, get_product, update_product, delete_product
except Exception as e:
    print(f"Import error (likely no MongoDB): {e}")
    # Mock functions
    products_collection = None
    async def create_product(product):
        return "mock_id"
    async def get_products():
        return []
    async def get_product(id):
        return None
    async def update_product(id, data):
        return None
    async def delete_product(id):
        pass

app = FastAPI(title="Seller Module API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for images
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {"message": "Seller Module API - http://localhost:8000/docs"}

@app.post("/api/products", response_model=dict)
async def add_product(product: ProductCreate):
    product_id = await create_product(product)
    return {"id": product_id, "message": "Product created"}

@app.get("/api/products", response_model=list[Product])
async def list_products():
    prods = await get_products()
    return prods

@app.get("/api/products/{product_id}", response_model=dict)
async def get_product_detail(product_id: str):
    prod = await get_product(product_id)
    if not prod:
        raise HTTPException(404, "Product not found")
    return prod

@app.put("/api/products/{product_id}")
async def edit_product(product_id: str, update_data: ProductUpdate):
    updated = await update_product(product_id, update_data)
    if not updated:
        raise HTTPException(404, "Product not found")
    return {"message": "Updated"}

@app.delete("/api/products/{product_id}")
async def remove_product(product_id: str):
    result = await delete_product(product_id)
    if result.deleted_count == 0:
        raise HTTPException(404, "Product not found")
    return {"message": "Deleted"}

# Image upload
@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Invalid image")
    
    filename = f"{uuid.uuid4()}.{file.filename.split('.')[-1]}"
    path = f"static/uploads/{filename}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"image_url": f"/static/uploads/{filename}"}

# ML placeholders - implement next
@app.post("/api/ml/generate-desc")
async def generate_description(name: str = Form(...), category: str = Form(...), price: str = Form(...)):
    try:
        from .ml.description_gen import generate_description
        desc = generate_description(name, category, price)
    except:
        desc = f"Premium {category}: {name} - ${price}. Great quality!"
    return {"description": desc}

@app.post("/api/ml/translate")
async def translate_text(text: str = Form(...), lang: str = Form("ta")):
    try:
        from .ml.translation import translate_to_en
        translated = translate_to_en(text, lang)
    except:
        translated = text
    return {"translated": translated}

@app.post("/api/ml/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    try:
        from .ml.stt import transcribe_audio
        audio_bytes = await audio.read()
        text = transcribe_audio(audio_bytes)
    except:
        text = "Speech to text mock"
    return {"text": text}

# Full Pipeline: Voice → STT → Translation → AI Description
@app.post("/api/seller/ml/full-pipeline")
async def full_pipeline(audio: UploadFile = File(...)):
    """
    Complete chained pipeline:
    1. Speech-to-Text (Kannada/Tamil)
    2. Translate to English
    3. AI Description Generation
    """
    try:
        # Step 1: STT
        audio_bytes = await audio.read()
        from .ml.stt import transcribe_audio
        transcribed_text = transcribe_audio(audio_bytes)
        
        # Step 2: Translation
        from .ml.translation import translate_to_en
        # Auto-detect language or default to Tamil
        try:
            translated_text = translate_to_en(transcribed_text, "ta")
        except:
            translated_text = transcribed_text
        
        # Step 3: AI Description Generation (using translated text as context)
        from .ml.description_gen import generate_description
        # Use translated text as name for AI description generation
        ai_description = generate_description(translated_text, "Handcrafted Product", "")
        
        return {
            "success": True,
            "transcribed_text": transcribed_text,
            "translated_text": translated_text,
            "ai_description": ai_description,
            "final_description": ai_description
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "transcribed_text": "",
            "translated_text": "",
            "ai_description": "",
            "final_description": ""
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

