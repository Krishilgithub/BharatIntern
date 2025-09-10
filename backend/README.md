# PM Internship Portal Backend

FastAPI backend for the PM Internship Portal - AI-driven Internship Recommendation & Allocation Engine.

## Features

- **Authentication**: User login/signup with role-based access
- **Resume Analysis**: AI-powered resume parsing and skill extraction
- **Recommendations**: Personalized internship recommendations
- **Application Management**: Track and manage applications
- **Company Management**: Posting creation and candidate review
- **Admin Functions**: Quota management, batch matching, allocation review
- **Mock Data**: Comprehensive mock data for development and testing

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration

### Resume Analysis
- `POST /resume/analyze` - Analyze uploaded resume

### Recommendations
- `GET /recommendations` - Get personalized recommendations

### Applications
- `GET /applications` - Get user applications

### Company
- `GET /company/postings` - Get company postings
- `POST /company/postings` - Create new posting
- `GET /company/applications` - Get company applications

### Admin
- `GET /admin/quotas` - Get quota data
- `POST /admin/quotas` - Update quota data
- `POST /admin/match` - Run batch matching
- `GET /admin/allocations` - Get allocations

### Health
- `GET /health` - Health check

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the development server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:
- Interactive API docs: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`

## Mock Data

The API includes comprehensive mock data for:
- Users (candidates, companies, admins)
- Internship postings
- Applications
- Quota data
- Allocations

## Development

This is a mock API for development purposes. In production, you would:
- Connect to a real database (PostgreSQL)
- Implement proper authentication with JWT tokens
- Add real AI/ML services for resume analysis
- Implement actual matching algorithms
- Add data validation and error handling
- Add logging and monitoring
