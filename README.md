# PM Internship Portal - AI-driven Internship Recommendation & Allocation Engine

A comprehensive full-stack web application for the Smart India Hackathon (SIH25034) that provides AI-driven internship matching, quota management, and seamless allocation processes for the PM Internship Scheme.

## 🎯 Problem Statement (SIH25034)

Build an AI-driven Internship Recommendation & Allocation Engine for the PM Internship Scheme. The system matches candidates with internships based on skills, qualifications, location preferences, and sector interests, while enforcing affirmative action quotas, past participation limits, and industry capacity.

## ✨ Key Features

### 🔹 For Candidates
- **Resume Analyzer**: AI-powered resume parsing and skill extraction
- **Personalized Recommendations**: Smart matching based on skills and preferences
- **Application Tracking**: Real-time status updates and progress monitoring
- **Micro-Assessments**: Skill validation tests and learning roadmaps
- **Learning Roadmap**: Personalized skill development paths

### 🔹 For Companies
- **Posting Management**: Create and manage internship opportunities
- **Auto-Shortlisting**: AI-powered candidate screening and ranking
- **Application Review**: Comprehensive candidate evaluation tools
- **Selection Workflow**: Streamlined hiring process management

### 🔹 For Administrators
- **Quota Management**: Real-time quota monitoring and configuration
- **What-If Simulator**: Test different quota scenarios and policies
- **Batch Matching**: Automated allocation algorithms
- **Allocation Review**: Comprehensive audit and approval system
- **Analytics Dashboard**: Performance metrics and insights

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Tai  lwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Notifications

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **CORS** - Cross-origin resource sharing

### Database & Authentication
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Supabase Auth** - Authentication and user management
- **Row Level Security (RLS)** - Database-level access control
- **Role-Based Access Control** - Candidate, Company, Admin roles

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Supabase account (for authentication and database)

### Supabase Setup

1. **Create Supabase project**:
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Copy your project URL and anon key

2. **Set up environment variables**:
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_APP_NAME=BharatIntern
   ```

3. **Set up database schema**:
   - Go to Supabase SQL Editor
   - Copy and run the SQL from `supabase-schema.sql`
   - This creates the profiles table and authentication triggers

4. **Configure authentication**:
   - Go to Authentication → Settings
   - Set Site URL to `http://localhost:3000`
   - Add redirect URLs: `http://localhost:3000/**`

### Frontend Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Test authentication setup**:
```bash
node test-auth.js
```

3. **Start development server**:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Create virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Start development server**:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

### API Documentation
- Interactive docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔐 Authentication System

The application uses Supabase for authentication with role-based access control:

### User Roles
- **Candidate**: Job seekers looking for internships
- **Company**: Organizations posting internship opportunities  
- **Admin**: System administrators with full access

### Authentication Features
- Email verification required
- Password reset functionality
- Role-based route protection
- Secure session management
- Row Level Security (RLS) policies

### Getting Started
1. Set up Supabase project (see setup instructions above)
2. Create accounts with different roles at `/signup`
3. Verify email addresses
4. Login and access role-specific dashboards

For detailed setup instructions, see [SUPABASE_AUTH_SETUP.md](./SUPABASE_AUTH_SETUP.md)

## 🎨 Design System

### Colors
- **Primary**: #1E6FF5 (Blue)
- **Accent**: #2DBE6F (Green)
- **Background**: #F9FAFB (Light Gray)
- **Text**: #111827 (Dark Gray)

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Primary, secondary, accent variants
- **Forms**: Clean input fields with focus states
- **Navigation**: Responsive with mobile-first approach

## 📊 Mock Data

The application includes comprehensive mock data:

### Candidates (50+ profiles)
- Diverse skill sets and experience levels
- Various educational backgrounds
- Different locations and preferences

### Companies (10+ organizations)
- Tech companies, startups, and enterprises
- Various industries and sectors
- Different posting requirements

### Internships (20+ positions)
- Software development, data science, design
- Various durations and stipends
- Different skill requirements

### Quota Data
- General, OBC, SC, ST, EWS categories
- Women reservation tracking
- Real-time compliance monitoring

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration

### Resume Analysis
- `POST /resume/analyze` - AI resume analysis

### Recommendations
- `GET /recommendations` - Get personalized matches

### Applications
- `GET /applications` - User applications
- `POST /applications` - Apply to internship

### Company Management
- `GET /company/postings` - Company postings
- `POST /company/postings` - Create posting
- `GET /company/applications` - Review applications

### Admin Functions
- `GET /admin/quotas` - Quota data
- `POST /admin/quotas` - Update quotas
- `POST /admin/match` - Run batch matching
- `GET /admin/allocations` - Review allocations

## 🏗 Project Structure

```
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts (Auth)
│   ├── pages/             # Page components
│   │   ├── candidate/     # Candidate-specific pages
│   │   ├── company/       # Company-specific pages
│   │   └── admin/         # Admin-specific pages
│   ├── App.js            # Main app component
│   └── index.js          # Entry point
├── backend/               # FastAPI backend
│   ├── main.py           # Main API file
│   ├── requirements.txt  # Python dependencies
│   └── README.md         # Backend documentation
├── package.json          # Frontend dependencies
├── tailwind.config.js    # Tailwind configuration
└── README.md            # This file
```

## 🎯 Key Features Implemented

### ✅ Candidate Features
- [x] Dashboard with personalized insights
- [x] Resume analyzer with AI-powered skill extraction
- [x] Recommendation engine with filtering
- [x] Application tracking and status updates
- [x] Micro-assessments for skill validation
- [x] Learning roadmap with progress tracking

### ✅ Company Features
- [x] Dashboard with posting overview
- [x] Create and manage internship postings
- [x] Review and shortlist candidates
- [x] Selection workflow and confirmation

### ✅ Admin Features
- [x] Comprehensive dashboard with KPIs
- [x] Quota configuration and management
- [x] What-if simulator for policy testing
- [x] Batch matching with real-time progress
- [x] Allocation review and approval system

### ✅ Technical Features
- [x] Responsive design (mobile-first)
- [x] Role-based authentication and routing
- [x] Mock API with comprehensive data
- [x] Professional UI/UX design
- [x] Accessibility considerations

## 🚀 Deployment

### Frontend (Netlify/Vercel)
1. Build the project: `npm run build`
2. Deploy the `build` folder to your hosting service

### Backend (Railway/Heroku)
1. Set up PostgreSQL database
2. Update database connection in `main.py`
3. Deploy using your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is developed for the Smart India Hackathon 2024.

## 🏆 Hackathon Submission

This project addresses **SIH25034** - AI-driven Internship Recommendation & Allocation Engine for PM Internship Scheme.

### Key Innovations
- **AI-Powered Matching**: Advanced algorithms for optimal candidate-company matching
- **Quota Management**: Intelligent enforcement of affirmative action policies
- **Real-time Analytics**: Comprehensive dashboards for all stakeholders
- **Scalable Architecture**: Built to handle large-scale deployment

### Demo Highlights
- Complete user journey for all three roles
- Real-time quota simulation and management
- AI-powered resume analysis and recommendations
- Comprehensive admin tools for policy management

---

**Built with ❤️ by Krishil Agrawal, Tirth Dalal, Dhyan Mehta, Mahek Paghadal, Dharini Thakkar, Hitarth Malviya for Smart India Hackathon 2025**
