# VIVID - Artisan E-commerce Platform w/ AI ✨

## 🎯 Features
- **Seller Dashboard** - Product CRUD + analytics
- **AI Product Enhancement** - Auto description, translation, STT
- **Multi-language** - Tamil/Kannada → English (IndicTrans2 1B)
- **Customer Flow** - Shop, cart, checkout, profile
- **Admin Panel** - Stats, user management  
- **Voice Upload** - Speech-to-text powered
- **Responsive** - Mobile-first design

## 🛠 Tech Stack
```
Frontend: React 19 + Vite 8 + TailwindCSS + Lucide
Backend: Node.js 24 + Express (5000)
Seller API: FastAPI + Uvicorn (8000) 
AI/ML: Transformers + IndicTrans2 + Faster-Whisper
DB: JSON (dev) / MongoDB (prod)
Auth: JWT + bcrypt + OTP email
```

## 🚀 Quick Start (PowerShell - 3 Terminals)

### Terminal 1: Seller API + ML (Python)
```powershell
cd "c:/Users/muzro/OneDrive/Desktop/VIVID-Final/seller-api"
.\venv\Scripts\Activate.ps1
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
**Test:** http://localhost:8000/docs

### Terminal 2: Main Backend (Node.js)  
```powershell
cd "c:/Users/muzro/OneDrive/Desktop/VIVID-Final/backend"
npm install
npm run dev
```
**Test:** http://localhost:5000/api/health

### Terminal 3: Frontend (React)
```powershell
cd "c:/Users/muzro/OneDrive/Desktop/VIVID-Final/frontend"  
npm install
npm run dev
```
**App:** http://localhost:5173

## 📁 Project Structure
```
VIVID-Final/
├── backend/          # Node.js API (auth + proxy, port 5000)
├── frontend/         # React app (port 5173)
├── seller-api/       # Nida's FastAPI + ML (port 8000)  
├── database.json     # Shared dev DB
└── README.md
```

## 🔄 API Flow
```
Frontend (5173) 
  ↓ Vite Proxy
Backend (5000)  
  ↓ Express Proxy (/api/seller → 8000)
Seller API (8000)  
  ↓ ML Services  
AI/ML Pipeline
```

## ✅ Test Flow
1. **Register seller** → localhost:5173/seller/register
2. **Login** → Get JWT  
3. **Upload product** → Voice + AI desc + image
4. **Dashboard** → localhost:5173/seller/dashboard
5. **Customer shop** → Browse + cart

## 🔧 Troubleshooting
```
❌ Backend 5000 fails → npm install && npm run dev
❌ seller-api 8000 fails → .\venv\Scripts\Activate.ps1 → pip install -r requirements.txt  
❌ Frontend 5173 icons fail → npm install lucide-react
❌ Proxy fails → Check ports 5000+8000 running first
❌ ML slow → GPU acceleration (CUDA recommended)
```

## 📊 Production Deployment
```
Docker: docker-compose up
Cloud: Vercel(frontend) + Railway(backend) + Render(FastAPI)
DB: MongoDB Atlas
Email: SendGrid/Resend
CDN: Cloudinary (images)
```

**Live Demo:** http://localhost:5173  
**Repo:** https://github.com/muzrohitranjan/VIVID-Ecommerce-Platform  
**API Docs:** http://localhost:8000/docs

