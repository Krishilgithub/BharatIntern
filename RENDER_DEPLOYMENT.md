# Render Deployment Configuration

## Environment Variables Required

### Frontend (Next.js)

NEXT_PUBLIC_API_URL=https://bharatintern-backend.onrender.com
NODE_ENV=production
PORT=10000

### Backend (FastAPI)

PYTHON_VERSION=3.11.0
PORT=10000
HOST=0.0.0.0
UVICORN_HOST=0.0.0.0
UVICORN_PORT=10000

### Optional API Keys (Set in Render Dashboard)

OPENAI_API_KEY=your_openai_key_here
GOOGLE_API_KEY=your_google_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_key_here

## Deployment Commands

### Frontend

Build Command: `npm install && npm run build`
Start Command: `npm start`

### Backend

Build Command: `cd backend && pip install -r requirements.txt`
Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

## Health Check Endpoints

- Frontend: `/`
- Backend: `/health`

## Important Notes

1. Make sure to set environment variables in Render dashboard
2. Backend will be available at: https://bharatintern-backend.onrender.com
3. Frontend will be available at: https://bharatintern-frontend.onrender.com
4. Free tier services may sleep after inactivity
