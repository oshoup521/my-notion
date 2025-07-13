# My Notion Frontend - Vercel Deployment Guide

## Prerequisites
- GitHub repository with your frontend code
- Vercel account (free at vercel.com)
- Backend deployed and running at: https://my-notion-plc9.onrender.com

## Deployment Steps

### 1. Prepare Your Repository
Make sure these files are committed to your GitHub repository:
- `vercel.json` (updated with backend URL)
- `.env.production` (production environment variables)
- `package.json` (with all dependencies)
- Updated `.gitignore`

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Login to Vercel**
   - Go to https://vercel.com
   - Sign in with your GitHub account

2. **Import Project**
   - Click "New Project"
   - Import your `my-notion` repository
   - Select the `frontend` folder as the root directory

3. **Configure Project**
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend` (if your frontend is in a subdirectory)
   - **Build Command**: `yarn build` (or `npm run build`)
   - **Output Directory**: `build`

4. **Environment Variables**
   Add the following environment variable:
   - **Name**: `REACT_APP_BACKEND_URL`
   - **Value**: `https://my-notion-plc9.onrender.com`

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (usually 1-3 minutes)

#### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory**
   ```bash
   cd frontend
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - What's your project's name? `my-notion-frontend`
   - In which directory is your code located? `./`

### 3. Configure Environment Variables (if using CLI)

After initial deployment, add environment variables:
```bash
vercel env add REACT_APP_BACKEND_URL
# Enter: https://my-notion-plc9.onrender.com
# Select: Production
```

Then redeploy:
```bash
vercel --prod
```

### 4. Test Your Deployment
Once deployed, you'll get a URL like: `https://my-notion-frontend.vercel.app`

Test these features:
- ✅ App loads correctly
- ✅ Can create new tasks
- ✅ Can view task dashboard
- ✅ Drag and drop functionality works
- ✅ API calls to backend work
- ✅ Theme toggle works

### 5. Custom Domain Setup
Your custom domain: `taskflow.oshoupadhyay.in`

1. **Add Domain in Vercel Dashboard**
   - Go to your project settings in Vercel
   - Navigate to "Domains" section
   - Click "Add Domain"
   - Enter: `taskflow.oshoupadhyay.in`

2. **DNS Configuration**
   Add these DNS records in your domain provider:
   ```
   Type: CNAME
   Name: taskflow
   Value: cname.vercel-dns.com
   ```
   
   Or if using A record:
   ```
   Type: A
   Name: taskflow
   Value: 76.76.19.61
   ```

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Your site will be available at: `https://taskflow.oshoupadhyay.in`

### 6. Test Your Custom Domain
Once DNS propagates (usually 5-60 minutes):
- ✅ Visit `https://taskflow.oshoupadhyay.in`
- ✅ Test all application features
- ✅ Verify API calls work correctly
- ✅ Check that redirects work properly

## Automatic Deployments
- Vercel automatically deploys on every push to main branch
- Preview deployments are created for pull requests
- Environment variables are automatically applied

## Troubleshooting

### Common Issues:
1. **API calls failing**: Check that REACT_APP_BACKEND_URL is set correctly
2. **Build failures**: Ensure all dependencies are in package.json
3. **Blank page**: Check browser console for JavaScript errors

### Debug Steps:
1. Check Vercel deployment logs in dashboard
2. Verify environment variables are set
3. Test API endpoints manually
4. Check CORS settings on backend

### Backend CORS Configuration
Make sure your backend (Render) allows requests from your Vercel domain:
```python
# In your FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.vercel.app", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Performance Optimization
- Vercel automatically optimizes React builds
- Images are automatically optimized
- CDN distribution is global
- Gzip compression is enabled

## Cost
- Vercel Hobby plan is free for personal projects
- Includes:
  - Unlimited personal repositories
  - 100GB bandwidth per month
  - 1,000 serverless function invocations per day
  - Global CDN

## Monitoring
- Check Vercel dashboard for:
  - Deployment status
  - Performance metrics
  - Error tracking
  - Usage analytics
