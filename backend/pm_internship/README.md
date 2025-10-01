# PM Internship AI Engine Backend

## Setup

1. Install dependencies:
   ```
   cd backend/pm_internship
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```
2. Run the server:
   ```
   uvicorn main:app --reload
   ```

## API Docs
- OpenAPI docs at `/docs`

## Endpoints
- `/resume/analyze` — Resume parsing & skill extraction
- `/recommendations` — Get ranked internship recommendations
- `/applications` — Apply to internships
- `/company/postings` — Company internship postings
- `/admin/match`, `/admin/quotas`, `/admin/allocations` — Admin batch matching, quota management, allocations

## Notes
- Uses Supabase for authentication, RLS, and data storage
- Handles all edge cases and quota logic
- Ready for integration with React frontend
