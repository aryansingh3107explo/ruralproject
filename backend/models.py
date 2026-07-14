from sqlalchemy import Column, String, Text, DateTime, Integer
from sqlalchemy.sql import func

try:
    from .database import Base
except ImportError:
    from database import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, index=True)
    citizen_name = Column(String, nullable=False)
    mobile_number = Column(String, nullable=False)
    village_name = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False)
    image_path = Column(String, nullable=True)
    image_key = Column(String, nullable=True) # InsForge Storage Object Key
    status = Column(String, default="Pending", nullable=False)  # Pending, In Progress, Resolved
    priority = Column(String, default="Medium", nullable=False) # Low, Medium, High, Emergency
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Tracking & AI fields
    estimated_completion = Column(String, nullable=True)
    officer_assigned = Column(String, default="Unassigned", nullable=False)
    progress_percentage = Column(Integer, default=0, nullable=False)
    ai_detected_issue = Column(String, nullable=True)
    ai_confidence = Column(Integer, nullable=True)

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    category = Column(String, nullable=False)  # Schools, Hospitals, Water Infrastructure, Panchayat, Transportation
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    contact = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String, nullable=False)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    citizen_name = Column(String, nullable=False)
    mobile_number = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False) # SMS, Email, In-App
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

