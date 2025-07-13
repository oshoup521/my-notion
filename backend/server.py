from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

# Models
class ChecklistItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str
    completed: bool = False

class Task(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    tags: List[str] = []
    due_date: Optional[datetime] = None
    checklist: List[ChecklistItem] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    priority: TaskPriority = TaskPriority.MEDIUM
    tags: List[str] = []
    due_date: Optional[datetime] = None
    checklist: List[ChecklistItem] = []

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None
    checklist: Optional[List[ChecklistItem]] = None

class TaskStatusUpdate(BaseModel):
    status: TaskStatus

class TaskStats(BaseModel):
    total: int
    todo: int
    in_progress: int
    done: int
    priority_breakdown: dict
    tag_breakdown: dict

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Task Manager API"}

@api_router.post("/tasks", response_model=Task)
async def create_task(task_data: TaskCreate):
    task = Task(**task_data.dict())
    await db.tasks.insert_one(task.dict())
    return task

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks():
    tasks = await db.tasks.find().to_list(1000)
    return [Task(**task) for task in tasks]

# Stats endpoint moved before the task_id endpoint to avoid routing conflict
@api_router.get("/tasks/stats", response_model=TaskStats)
async def get_task_stats():
    tasks = await db.tasks.find().to_list(1000)
    
    total = len(tasks)
    todo = len([t for t in tasks if t["status"] == "todo"])
    in_progress = len([t for t in tasks if t["status"] == "in_progress"])
    done = len([t for t in tasks if t["status"] == "done"])
    
    # Priority breakdown
    priority_breakdown = {"low": 0, "medium": 0, "high": 0}
    for task in tasks:
        priority_breakdown[task["priority"]] += 1
    
    # Tag breakdown
    tag_breakdown = {}
    for task in tasks:
        for tag in task.get("tags", []):
            tag_breakdown[tag] = tag_breakdown.get(tag, 0) + 1
    
    return TaskStats(
        total=total,
        todo=todo,
        in_progress=in_progress,
        done=done,
        priority_breakdown=priority_breakdown,
        tag_breakdown=tag_breakdown
    )

@api_router.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: str):
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return Task(**task)

@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task_update: TaskUpdate):
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.tasks.update_one({"id": task_id}, {"$set": update_data})
    updated_task = await db.tasks.find_one({"id": task_id})
    return Task(**updated_task)

@api_router.patch("/tasks/{task_id}/status")
async def update_task_status(task_id: str, status_update: TaskStatusUpdate):
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await db.tasks.update_one(
        {"id": task_id}, 
        {"$set": {"status": status_update.status, "updated_at": datetime.utcnow()}}
    )
    updated_task = await db.tasks.find_one({"id": task_id})
    return Task(**updated_task)

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    result = await db.tasks.delete_one({"id": task_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Add this at the end of the file
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)