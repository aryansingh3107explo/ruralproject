from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict

class ComplaintBase(BaseModel):
    citizen_name: str
    mobile_number: str
    village_name: str
    title: str
    description: str
    category: str

class ComplaintCreate(ComplaintBase):
    pass

class ComplaintUpdateStatus(BaseModel):
    status: str = Field(..., description="Status must be one of: Pending, In Progress, Resolved")
    priority: Optional[str] = Field(None, description="Priority must be one of: Low, Medium, High, Emergency")
    resolution_notes: Optional[str] = None
    estimated_completion: Optional[str] = None
    officer_assigned: Optional[str] = None
    progress_percentage: Optional[int] = None

class ComplaintResponse(ComplaintBase):
    id: str
    status: str
    priority: str
    image_path: Optional[str] = None
    image_key: Optional[str] = None
    created_at: datetime
    resolution_notes: Optional[str] = None
    estimated_completion: Optional[str] = None
    officer_assigned: str
    progress_percentage: int
    ai_detected_issue: Optional[str] = None
    ai_confidence: Optional[int] = None

    class Config:
        from_attributes = True

class HealthScoreBreakdown(BaseModel):
    overall: int
    water: int
    roads: int
    electricity: int
    healthcare: int
    sanitation: int
    rating: str

class StatsResponse(BaseModel):
    total: int
    pending: int
    in_progress: int
    resolved: int
    category_distribution: Dict[str, int]
    status_distribution: Dict[str, int]
    health_score: HealthScoreBreakdown

class ResourceResponse(BaseModel):
    id: int
    category: str
    name: str
    address: str
    contact: str
    description: str
    image_url: str

    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: int
    citizen_name: str
    mobile_number: str
    message: str
    type: str
    created_at: datetime

    class Config:
        from_attributes = True
