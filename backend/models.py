from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

Base = declarative_base()

class Task(Base):
    __tablename__ = "tasks"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    status = Column(String(50), default="todo")
    priority = Column(String(50), default="medium")
    tags = Column(JSON, default=list)
    due_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    checklist_items = relationship("ChecklistItem", back_populates="task", cascade="all, delete-orphan")

class ChecklistItem(Base):
    __tablename__ = "checklist_items"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    text = Column(String(500), nullable=False)
    completed = Column(Boolean, default=False)
    task_id = Column(String, ForeignKey("tasks.id"), nullable=False)
    task = relationship("Task", back_populates="checklist_items") 