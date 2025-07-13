# My Notion Backend - Render Deployment Guide

## Prerequisites
- GitHub repository with your backend code
- Render account (free at render.com)

## Deployment Steps

### 1. Prepare Your Repository
Make sure all the created files are committed to your GitHub repository:
- `Dockerfile`
- `render.yaml`
- `start.sh`
- Updated `requirements.txt`
- Updated `server.py` with health checks
- Updated `database.py` for environment variables

### 2. Deploy to Render Web Service

1. **Login to Render Dashboard**
   - Go to https://render.com
   - Sign in with your GitHub account

2. **Create New Web Service**
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub repository
   - Select the `my-notion` repository

3. **Configure Web Service**
   - **Name**: `my-notion-backend`
   - **Environment**: `Python 3`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend` (if your backend is in a subdirectory)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`

4. **Environment Variables** (Optional)
   - `PYTHON_VERSION`: `3.11.0`
   - Add any other environment variables if needed

5. **Advanced Settings**
   - **Auto-Deploy**: Enable (deploys on every git push)
   - **Plan**: Free (sufficient for development)

### 3. Deploy
- Click "Create Web Service"
- Render will automatically build and deploy your application
- Wait for the deployment to complete (usually 2-5 minutes)

### 4. Test Your Deployment
Once deployed, you'll get a URL like: `https://my-notion-backend.onrender.com`

Test these endpoints:
- `GET /` - Health check
- `GET /health` - Health status
- `GET /api/tasks` - Your API endpoints

## Database Persistence
- For production, consider upgrading to PostgreSQL
- Render offers free PostgreSQL databases
- Update `DATABASE_URL` environment variable accordingly

## Custom Domain (Optional)
- You can add a custom domain in the Render dashboard
- Follow Render's documentation for domain setup

## Monitoring
- Render provides built-in monitoring and logs
- Check the "Logs" tab in your service dashboard for debugging

## Cost
- Free tier includes:
  - 750 hours/month of runtime
  - Auto-sleep after 15 minutes of inactivity
  - Automatic SSL certificates

## Next Steps
1. Update your frontend to use the new backend URL
2. Set up environment-specific configurations
3. Consider adding database migrations for production
4. Set up monitoring and error tracking

## Troubleshooting
- Check logs in Render dashboard for deployment issues
- Ensure all dependencies are in requirements.txt
- Verify environment variables are set correctly
- Test endpoints locally before deploying
