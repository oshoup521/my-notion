from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum

# Import database and models
from database import get_db, engine
from models import Base, Task, ChecklistItem

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create database tables
Base.metadata.create_all(bind=engine)

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
async def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    # Create task
    db_task = Task(
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        tags=task_data.tags,
        due_date=task_data.due_date
    )
    
    # Add checklist items
    for item in task_data.checklist:
        checklist_item = ChecklistItem(
            text=item.text,
            completed=item.completed
        )
        db_task.checklist_items.append(checklist_item)
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Convert to response model
    response_task = Task(
        id=db_task.id,
        title=db_task.title,
        description=db_task.description,
        status=db_task.status,
        priority=db_task.priority,
        tags=db_task.tags or [],
        due_date=db_task.due_date,
        checklist=[ChecklistItem(id=item.id, text=item.text, completed=item.completed) for item in db_task.checklist_items],
        created_at=db_task.created_at,
        updated_at=db_task.updated_at
    )
    
    return response_task

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(db: Session = Depends(get_db)):
    db_tasks = db.query(Task).all()
    tasks = []
    
    for db_task in db_tasks:
        task = Task(
            id=db_task.id,
            title=db_task.title,
            description=db_task.description,
            status=db_task.status,
            priority=db_task.priority,
            tags=db_task.tags or [],
            due_date=db_task.due_date,
            checklist=[ChecklistItem(id=item.id, text=item.text, completed=item.completed) for item in db_task.checklist_items],
            created_at=db_task.created_at,
            updated_at=db_task.updated_at
        )
        tasks.append(task)
    
    return tasks

# Stats endpoint moved before the task_id endpoint to avoid routing conflict
@api_router.get("/tasks/stats", response_model=TaskStats)
async def get_task_stats(db: Session = Depends(get_db)):
    tasks = db.query(Task).all()
    
    total = len(tasks)
    todo = len([t for t in tasks if t.status == "todo"])
    in_progress = len([t for t in tasks if t.status == "in_progress"])
    done = len([t for t in tasks if t.status == "done"])
    
    # Priority breakdown
    priority_breakdown = {"low": 0, "medium": 0, "high": 0}
    for task in tasks:
        priority_breakdown[task.priority] += 1
    
    # Tag breakdown
    tag_breakdown = {}
    for task in tasks:
        for tag in task.tags or []:
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
async def get_task(task_id: str, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = Task(
        id=db_task.id,
        title=db_task.title,
        description=db_task.description,
        status=db_task.status,
        priority=db_task.priority,
        tags=db_task.tags or [],
        due_date=db_task.due_date,
        checklist=[ChecklistItem(id=item.id, text=item.text, completed=item.completed) for item in db_task.checklist_items],
        created_at=db_task.created_at,
        updated_at=db_task.updated_at
    )
    return task

@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task_update: TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Update fields
    if task_update.title is not None:
        db_task.title = task_update.title
    if task_update.description is not None:
        db_task.description = task_update.description
    if task_update.status is not None:
        db_task.status = task_update.status
    if task_update.priority is not None:
        db_task.priority = task_update.priority
    if task_update.tags is not None:
        db_task.tags = task_update.tags
    if task_update.due_date is not None:
        db_task.due_date = task_update.due_date
    
    db_task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_task)
    
    task = Task(
        id=db_task.id,
        title=db_task.title,
        description=db_task.description,
        status=db_task.status,
        priority=db_task.priority,
        tags=db_task.tags or [],
        due_date=db_task.due_date,
        checklist=[ChecklistItem(id=item.id, text=item.text, completed=item.completed) for item in db_task.checklist_items],
        created_at=db_task.created_at,
        updated_at=db_task.updated_at
    )
    return task

@api_router.patch("/tasks/{task_id}/status")
async def update_task_status(task_id: str, status_update: TaskStatusUpdate, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db_task.status = status_update.status
    db_task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_task)
    
    task = Task(
        id=db_task.id,
        title=db_task.title,
        description=db_task.description,
        status=db_task.status,
        priority=db_task.priority,
        tags=db_task.tags or [],
        due_date=db_task.due_date,
        checklist=[ChecklistItem(id=item.id, text=item.text, completed=item.completed) for item in db_task.checklist_items],
        created_at=db_task.created_at,
        updated_at=db_task.updated_at
    )
    return task

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
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

# Add this at the end of the file
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)