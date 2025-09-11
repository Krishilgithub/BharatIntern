# Vercel Deployment Guide

This project has been configured for Vercel deployment with both frontend (React) and backend (Python FastAPI) components.

## Project Structure for Vercel

```
├── api/
│   └── index.py          # Python FastAPI serverless function
├── src/                  # React frontend source
├── public/               # Static assets
├── build/                # React build output (generated)
├── vercel.json           # Vercel configuration
├── requirements.txt      # Python dependencies for Vercel
├── package.json          # Node.js dependencies
└── .env                  # Environment variables
```

## Deployment Steps

### 1. Prerequisites

- Vercel CLI installed: `npm i -g vercel`
- GitHub repository connected to Vercel

### 2. Environment Variables

The following environment variables are configured:

- `REACT_APP_API_URL=/api` (Frontend API endpoint)

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
vercel --prod
```

#### Option B: Using GitHub Integration

1. Push code to GitHub
2. Connect repository to Vercel dashboard
3. Vercel will automatically deploy on push

### 4. Build Configuration

The project uses:

- **Frontend**: `@vercel/static-build` - Builds React app to `/build` directory
- **Backend**: `@vercel/python` - Deploys FastAPI as serverless functions

### 5. API Routes

All API routes are accessible at `/api/*`:

- `/api/` - API health check
- `/api/auth/login` - User login
- `/api/auth/signup` - User registration
- `/api/recommendations` - Get recommendations
- `/api/applications` - Get applications
- `/api/postings` - Manage job postings
- `/api/admin/*` - Admin endpoints

### 6. Frontend Configuration

The React app is configured to:

- Use `/api` as the base URL for API calls
- Build static files to `/build` directory
- Handle client-side routing with fallback to `index.html`

## Local Development

### Frontend

```bash
npm start
```

### Backend (for local testing)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

## Troubleshooting

### Common Issues

1. **Build Failures Due to ESLint Warnings**: 
   - **Problem**: Vercel treats warnings as errors in CI mode
   - **Solution**: Added `CI=false` environment variable and `cross-env` package
   - **Fixed**: Build scripts now use `cross-env CI=false react-scripts build`

2. **API Not Working**: Ensure API routes start with `/api/` and serverless function is at `api/index.py`
3. **CORS Issues**: CORS is configured to allow all origins in production (update for security)

### Vercel Logs

```bash
vercel logs [deployment-url]
```

### Environment Variables in Vercel Dashboard

1. Go to Project Settings
2. Navigate to Environment Variables
3. Add required variables for production

## Production Considerations

1. **Security**: Update CORS origins to match your domain
2. **Database**: Configure production database connection
3. **Authentication**: Implement proper JWT token handling
4. **Rate Limiting**: Add API rate limiting for production
5. **Monitoring**: Set up error tracking and monitoring
