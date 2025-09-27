# BharatIntern - Render Deployment Guide

## 🚀 Deployment Configuration

This React application is now configured for deployment on Render.com. Follow the instructions below to deploy successfully.

## 📋 Pre-Deployment Checklist

✅ **Project Structure Updated**
- ✅ Package.json configured for React app
- ✅ Build and start scripts created
- ✅ Environment variables configured
- ✅ Production optimization enabled

## 🔧 Render Configuration Fields

Based on your Render dashboard screenshot, fill in these fields:

### **Repository & Branch**
- **Repository**: `https://github.com/Krishilgithub/BharatIntern.git`
- **Branch**: `master`

### **Basic Settings**
- **Name**: `bharatintern-app` (or your preferred name)
- **Region**: `Oregon (US West)` (as shown in your screenshot)
- **Instance Type**: `Free` (for hobby projects)

### **Build & Deploy Settings**
- **Language**: `Node.js`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `serve -s build -l $PORT`
- **Root Directory**: `.` (leave empty or use root)

### **Environment Variables**
Add these environment variables in Render dashboard:

```
NODE_ENV=production
GENERATE_SOURCEMAP=false
CI=false
DISABLE_ESLINT_PLUGIN=true
REACT_APP_API_URL=https://your-app-name.onrender.com/api
SITE_URL=https://your-app-name.onrender.com
REACT_APP_BASE_URL=https://your-app-name.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://sjmnaviyqjpiltbwffja.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbW5hdml5cWpwaWx0YndmZmphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MzQ5NDUsImV4cCI6MjA3MzQxMDk0NX0.KiH9E-eFebpC0KAyxc6agksYk88wVAOKKa7pYNDAGdA
```

## 📝 Step-by-Step Deployment Instructions

1. **Connect Repository**
   - In Render dashboard, click "New Web Service"
   - Connect your GitHub account
   - Select `Krishilgithub/BharatIntern` repository

2. **Configure Basic Settings**
   - **Name**: `bharatintern-app`
   - **Region**: `Oregon (US West)`
   - **Branch**: `master`
   - **Root Directory**: Leave empty

3. **Configure Build Settings**
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `serve -s build -l $PORT`

4. **Add Environment Variables**
   - Go to Environment tab
   - Add all the environment variables listed above
   - **Important**: Replace `your-app-name` with your actual Render app name

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the build to complete (5-10 minutes)

## 🔍 Important Notes

### **URL Updates Required After Deployment**
Once your app is deployed, you'll get a URL like `https://bharatintern-app.onrender.com`. You need to:

1. Update environment variables in Render dashboard
2. Replace `your-app-name` with your actual app name
3. Update Supabase redirect URLs to include your new domain

### **Features Included**
- ✅ Enhanced Landing Page with dynamic features
- ✅ Multi-step Registration System with AICTE integration
- ✅ Multi-factor Authentication System
- ✅ Photo capture and document upload
- ✅ Responsive design
- ✅ Production optimizations

### **Build Optimizations**
- Source maps disabled for faster builds
- ESLint warnings won't fail the build
- Optimized for production performance

## 🐛 Troubleshooting

### **Common Issues**
1. **Build fails**: Check if all dependencies are in package.json
2. **App doesn't start**: Ensure start command uses correct port `$PORT`
3. **404 errors**: Make sure `serve -s build` is serving static files correctly
4. **Environment variables**: Verify all required env vars are set in Render dashboard

### **Logs & Debugging**
- Check Render logs in the dashboard
- Monitor build and deployment processes
- Use console.log statements for debugging (they'll appear in Render logs)

## 📞 Support

If you encounter issues:
1. Check Render build logs
2. Verify environment variables
3. Ensure GitHub repository is accessible
4. Contact Render support if needed

## 🎉 Success!

Once deployed, your BharatIntern application will be live and accessible at your Render URL!

---

**Last Updated**: September 27, 2025
**Version**: 1.0.0