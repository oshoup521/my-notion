# My Notion - Task Manager

A full-stack task management application built with FastAPI backend and React frontend.

## Features

- Create, read, update, and delete tasks
- Task status management (todo, in_progress, done)
- Task priorities (low, medium, high)
- Tags and checklists for tasks
- Task statistics and analytics
- Modern React UI with dark/light theme support

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Frontend
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Icons** - Icon library

## Local Development

### Prerequisites
- Python 3.8+
- Node.js 16+ and Yarn
- MongoDB (local or Atlas)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Create `.env` file:**
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=task_manager
   ```

6. **Run the server:**
   ```bash
   uvicorn server:app --reload
   ```

   Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Create environment file:**
   ```bash
   cp env.example .env
   ```

4. **Configure backend URL:**
   Edit `.env` and set:
   ```env
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

5. **Start development server:**
   ```bash
   yarn start
   ```

   Frontend will be available at `http://localhost:3000`

## Deployment

### Backend Deployment on Render

#### Prerequisites
- GitHub repository with your code
- Render account

#### Automatic Deployment (Recommended)

1. **Push your code to GitHub** (including the `backend/render.yaml` file)

2. **Go to [Render Dashboard](https://dashboard.render.com)**

3. **Click "New" → "Blueprint"**

4. **Connect your GitHub repository**

5. **Set Root Directory to `backend/`**

6. **Render will automatically:**
   - Create a MongoDB database
   - Deploy your FastAPI backend
   - Set up environment variables

#### Manual Deployment

##### 1. Create MongoDB Database
1. **Render Dashboard** → "New" → "MongoDB"
2. **Configure:**
   - Name: `my-notion-mongodb`
   - Database Name: `task_manager`
   - Plan: Free
3. **Copy the connection string**

##### 2. Deploy Backend
1. **Render Dashboard** → "New" → "Web Service"
2. **Connect your GitHub repository**
3. **Set Root Directory to `backend/`**
4. **Configure:**
   - Name: `my-notion-backend`
   - Environment: `Python`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - Plan: Free

5. **Add Environment Variables:**
   - `MONGO_URL`: Your MongoDB connection string
   - `DB_NAME`: `task_manager`

### Frontend Deployment on Vercel

#### Prerequisites
- GitHub repository with your code
- Vercel account

#### Deployment Steps

1. **Push your code to GitHub**

2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

3. **Click "New Project"**

4. **Import your GitHub repository**

5. **Configure the project:**
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn build`
   - **Output Directory**: `build`

6. **Add Environment Variables:**
   - `REACT_APP_BACKEND_URL`: Your Render backend URL (e.g., `https://your-backend-name.onrender.com`)

7. **Click "Deploy"**

#### Manual Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set environment variables:**
   ```bash
   vercel env add REACT_APP_BACKEND_URL
   ```

### Environment Variables

#### Backend (Render)
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb://user:pass@host:port/db` |
| `DB_NAME` | Database name | `task_manager` |
| `PORT` | Server port (auto-set by Render) | `10000` |

#### Frontend (Vercel)
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_BACKEND_URL` | Backend API URL | `https://your-backend-name.onrender.com` |

## API Endpoints

### Base URL
- Local: `http://localhost:8000/api`
- Production: `https://your-backend-name.onrender.com/api`

## Development Workflow

1. **Make changes** to your code
2. **Test locally** using the setup above
3. **Commit and push** to GitHub
4. **Render automatically deploys** your backend changes
5. **Vercel automatically deploys** your frontend changes

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API health check |
| GET | `/tasks` | Get all tasks |
| POST | `/tasks` | Create new task |
| GET | `/tasks/{id}` | Get specific task |
| PUT | `/tasks/{id}` | Update task |
| PATCH | `/tasks/{id}/status` | Update task status |
| DELETE | `/tasks/{id}` | Delete task |
| GET | `/tasks/stats` | Get task statistics |

### Task Model

```json
{
  "id": "uuid-string",
  "title": "Task title",
  "description": "Task description",
  "status": "todo|in_progress|done",
  "priority": "low|medium|high",
  "tags": ["tag1", "tag2"],
  "due_date": "2024-01-01T00:00:00Z",
  "checklist": [
    {
      "id": "uuid-string",
      "text": "Checklist item",
      "completed": false
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Database Schema

### Collections
- **tasks**: Main task collection

### Indexes (Recommended)
- `status`: `{"status": 1}`
- `priority`: `{"priority": 1}`
- `created_at`: `{"created_at": -1}`

## Development Workflow

1. **Make changes** to your code
2. **Test locally** using the setup above
3. **Commit and push** to GitHub
4. **Render automatically deploys** your backend changes
5. **Vercel automatically deploys** your frontend changes

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check `requirements.txt` for compatibility
   - Verify Python version in `runtime.txt`

2. **Database Connection**
   - Verify MongoDB connection string
   - Check if MongoDB service is running

3. **CORS Issues**
   - Backend allows all origins for development
   - For production, specify frontend domain

4. **Port Issues**
   - Render sets `PORT` environment variable
   - App uses `os.environ.get("PORT", 8000)`

### Free Tier Limitations

- **Render**: Services sleep after 15 minutes
- **MongoDB**: 512MB storage, shared resources
- **Cold Start**: 30-60 seconds after sleep

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

MIT License 