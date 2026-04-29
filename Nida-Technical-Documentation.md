# Nida's Seller Module - Technical Implementation Report

## 1. Nida's Assigned Responsibilities
**Seller Module (Primary):** Artisan product upload with AI/ML enhancements  
**ML Integration:**  
- AI Product Description Generation  
- Multi-language Translation (Indic → English)  
- Speech-to-Text for voice product descriptions  

## 2. Seller Module Architecture

### Backend (FastAPI - seller-api/)
```
seller-api/
├── main.py              # FastAPI routes (/api/products, /api/upload-image)
├── schemas.py           # Pydantic models (ProductCreate, ProductUpdate)
├── crud.py              # DB operations (MongoDB mock-ready)
├── database.py          # MongoDB connection (JSON fallback)
├── ml/
│   ├── __init__.py
│   ├── description_gen.py  # GPT-like description generation
│   ├── translation.py     # IndicTrans2 + GoogleTranslate fallback
│   └── stt.py            # Faster-Whisper speech-to-text
└── static/uploads/      # Product images
```

**Key Features Implemented:**
```
POST /api/products          # Create product (with AI enhancement)
GET /api/products           # List products
GET /api/products/{id}      # Product details
PUT /api/products/{id}      # Update
DELETE /api/products/{id}   # Delete
POST /api/upload-image      # Image upload
POST /api/ml/generate-desc  # AI description
POST /api/ml/translate      # Translation  
POST /api/ml/stt            # Speech-to-text
```

### ML Implementation Details

**AI Product Description (`ml/description_gen.py`):**
```python
# Transformers + IndicTrans2 pipeline
def generate_description(name, category, price):
    prompt = f"Premium {category}: {name} - ₹{price}"
    # Mock for demo (production: GPT-4o mini)
    return f"Handcrafted {category} masterpiece. {name} features traditional techniques with modern appeal. Perfect gift."
```

**Machine Translation (`ml/translation.py`):**
```python
# ai4bharat/indictrans2-indic-en-1B (1B params)
from transformers import pipeline
translator = pipeline("translation", model="ai4bharat/indictrans2-indic-en-1B")
def translate_to_en(text, lang="ta"):
    result = translator(text)[0]['translation_text']
    return result
```

**Speech-to-Text (`ml/stt.py`):**
```python
# Faster-Whisper (10x OpenAI Whisper)
from faster_whisper import WhisperModel
model = WhisperModel("base")
def transcribe_audio(audio_bytes):
    segments, _ = model.transcribe(audio_bytes, language="ta")
    return " ".join(segment.text for segment in segments)
```

## 3. Frontend Integration (React)
```
frontend/src/pages/
├── SellerUpload.jsx       # Product form + ML buttons
├── SellerDashboard.jsx    # Product list + CRUD
└── SellerLogin.jsx        # Auth flow
```

**SellerUpload.jsx AI Flow:**
1. User records voice → STT → Tamil text
2. Tamil text → Translation → English desc  
3. Product name/category → AI desc generation
4. Upload image → Form submit → Backend

## 4. Final Architecture & Integration

```
Frontend (localhost:5173) ──proxy──> Backend (5000)
                                    │
                                    ├─── Auth/Users/Orders (JSON DB)
                                    └───proxy──> Seller API (8000)
                                                 ├── Products CRUD
                                                 ├── Image Upload
                                                 └── ML Services
```

**Proxy Configuration (vite.config.js):**
```js
proxy: {
  '/api': 'http://localhost:5000',      // Main backend
  '/api/seller': 'http://localhost:5000', // → seller-api
  '/static': 'http://localhost:8000'     // Images
}
```

**Backend Proxy (server.js):**
```js
app.use('/api/seller', createProxyMiddleware({
  target: 'http://localhost:8000',
  pathRewrite: {'^/api/seller': '/api'}
}));
```

## 5. Folder Structure
```
VIVID-Final/                    # Root monorepo
├── backend/                    # Node.js main app (5000)
│   ├── server.js              # Express + proxy
│   └── package.json
├── frontend/                   # React/Vite app (5173)
│   ├── src/pages/
│   │   ├── SellerUpload.jsx   # Nida's seller pages
│   │   └── SellerDashboard.jsx
│   └── vite.config.js         # Proxies
├── seller-api/                 # Nida's Python/ML (8000)
│   ├── main.py                # FastAPI
│   ├── ml/                    # AI models
│   └── requirements.txt
└── database.json              # Shared data
```

## 6. Database (JSON + MongoDB Ready)
- **Production:** MongoDB (`products_collection`)
- **Development:** JSON file (`database.json`)
- **Schema:** Pydantic validated

## 7. Testing & Issues Fixed

**Issues Solved:**
1. **react-icons/hi2** → Fixed imports (`lucide-react`)
2. **Backend syntax** → Removed stray 'y/', nodemailer ESM fix  
3. **seller-api MongoDB** → Mock functions for dev
4. **GitHub secrets** → Removed notebooks/HF tokens
5. **Proxy conflicts** → Vite + Express proxy chain

**End-to-End Test Flow:**
```
1. Seller register → /api/register (5000)
2. Login → JWT token  
3. Upload voice → STT (8000) → Translation (8000)
4. AI desc → Generate (8000)
5. Submit product → Proxy 5173→5000→8000
6. Dashboard → Products list via /api/seller/products
```

## 8. Tech Stack
```
Frontend: React 19 + Vite 8 + TailwindCSS + Lucide Icons
Backend: Node.js 24 + Express + http-proxy-middleware
Seller API: FastAPI + Uvicorn + Pydantic  
AI/ML: Transformers 4.45 + Faster-Whisper + IndicTrans2 (1B)
DB: JSON (dev) / MongoDB (prod)
Auth: JWT + bcrypt + OTP (nodemailer)

