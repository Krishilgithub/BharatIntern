import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
export const apiService = {
  // Authentication
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  
  // Resume
  analyzeResume: (fileData) => api.post('/resume/analyze', fileData),
  
  // Recommendations
  getRecommendations: (userId, limit = 10) => 
    api.get(`/recommendations?user_id=${userId}&limit=${limit}`),
  
  // Applications
  getApplications: (userId) => api.get(`/applications?user_id=${userId}`),
  
  // Postings
  getPostings: () => api.get('/postings'),
  createPosting: (posting) => api.post('/postings', posting),
  
  // Company
  getShortlist: (companyId) => api.get(`/company/shortlist?company_id=${companyId}`),
  
  // Admin
  getAdminStats: () => api.get('/admin/dashboard-stats'),
  runMatching: () => api.post('/admin/run-matching'),
  getAllocations: () => api.get('/admin/allocations'),
  
  // Health check
  healthCheck: () => api.get('/health'),
};

export default apiService;
