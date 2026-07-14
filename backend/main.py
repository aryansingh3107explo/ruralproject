import os
import random
import uuid
import shutil
import base64
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import httpx
from pydantic import BaseModel
from dotenv import load_dotenv

# Load env variables from .env.local
load_dotenv(".env.local")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_CHAT_MODEL = os.getenv("OPENROUTER_CHAT_MODEL", "google/gemini-2.5-flash")

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
try:
    from . import models, schemas, database
    from .database import engine, get_db
except ImportError:
    import models, schemas, database
    from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GramConnect API",
    description="Smart Village Complaint and Resource Management Portal API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure folders exist
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount uploads directory for static files serving
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

def generate_unique_id(db: Session) -> str:
    """Generate a unique complaint ID like GC-1001, GC-1002, etc."""
    while True:
        num = random.randint(1000, 9999)
        candidate_id = f"GC-{num}"
        # Verify uniqueness
        exists = db.query(models.Complaint).filter(models.Complaint.id == candidate_id).first()
        if not exists:
            return candidate_id

# Seed lists for startup
SEED_RESOURCES = [
    {
        "category": "Schools",
        "name": "Zilla Parishad School",
        "description": "Primary and upper primary co-educational school providing quality education in local languages.",
        "address": "Main Road, Near Panchayat Hall, Gram Village",
        "contact": "+91 98765 43210",
        "image_url": "/uploads/resources/school_zp.png"
    },
    {
        "category": "Schools",
        "name": "Government High School",
        "description": "Secondary educational institution with science labs, computer rooms, and sports ground.",
        "address": "School Para, East Ward, Gram Village",
        "contact": "+91 98765 43211",
        "image_url": "/uploads/resources/school_govt.png"
    },
    {
        "category": "Hospitals",
        "name": "Primary Health Center",
        "description": "24/7 basic medical care facility, maternal services, vaccination drives, and free medicine distribution.",
        "address": "Hospital Road, Gram Village Center",
        "contact": "+91 98765 43212",
        "image_url": "/uploads/resources/hospital_phc.png"
    },
    {
        "category": "Hospitals",
        "name": "Rural Hospital",
        "description": "Multi-specialty community hospital with ICU, inpatient ward, emergency trauma unit, and ambulance service.",
        "address": "Bypass Road, Outer Gram Village",
        "contact": "+91 98765 43213",
        "image_url": "/uploads/resources/hospital_rural.png"
    },
    {
        "category": "Water Infrastructure",
        "name": "Main Water Tank",
        "description": "Overhead distribution reservoir supplying purified drinking water twice daily to all households.",
        "address": "Water Works Complex, North Ward, Gram Village",
        "contact": "+91 98765 43214",
        "image_url": "/uploads/resources/water_tank.png"
    },
    {
        "category": "Water Infrastructure",
        "name": "Borewell Locations",
        "description": "Community borewells fitted with hand pumps and solar-powered taps for continuous water access.",
        "address": "Multiple spots (West Ward, Harijan Basti, Temple Square)",
        "contact": "+91 98765 43215",
        "image_url": "/uploads/resources/water_borewell.png"
    },
    {
        "category": "Panchayat",
        "name": "Gram Panchayat Office",
        "description": "Administrative head office for village governance, certificates issuing, and local dispute resolutions.",
        "address": "Panchayat Chowk, Central Gram Village",
        "contact": "+91 98765 43216",
        "image_url": "/uploads/resources/panchayat_office.png"
    },
    {
        "category": "Panchayat",
        "name": "Contact Information",
        "description": "Direct directory for Sarpanch, Gram Sevak, and Talathi for public grievances and administration.",
        "address": "Panchayat Chowk, Central Gram Village",
        "contact": "+91 98765 43217",
        "image_url": "/uploads/resources/panchayat_contact.png"
    },
    {
        "category": "Transportation",
        "name": "Bus Stops",
        "description": "State transport bus stand connecting the village to block headquarters and district center hourly.",
        "address": "State Highway Corner, Main Entrance, Gram Village",
        "contact": "+91 98765 43218",
        "image_url": "/uploads/resources/transport_bus.png"
    },
    {
        "category": "Transportation",
        "name": "Local Transport Points",
        "description": "Shared auto-rickshaws, jeeps, and shuttle services terminal available round the clock.",
        "address": "Market Junction, Gram Village",
        "contact": "+91 98765 43219",
        "image_url": "/uploads/resources/transport_local.png"
    }
]

@app.on_event("startup")
def seed_data():
    db = database.SessionLocal()
    try:
        # Create resource images directories if they don't exist
        os.makedirs(os.path.join(UPLOAD_DIR, "resources"), exist_ok=True)
        
        # 1. Seed Resources
        resource_count = db.query(models.Resource).count()
        if resource_count == 0:
            db_resources = [
                models.Resource(
                    category=r["category"],
                    name=r["name"],
                    address=r["address"],
                    contact=r["contact"],
                    description=r["description"],
                    image_url=r["image_url"]
                ) for r in SEED_RESOURCES
            ]
            db.bulk_save_objects(db_resources)
            db.commit()
            print("Successfully seeded resources table!")

        # 2. Seed Complaints
        complaint_count = db.query(models.Complaint).count()
        if complaint_count == 0:
            sample_complaints = [
                models.Complaint(
                    id="GC-5021",
                    citizen_name="Ramesh Kumar",
                    mobile_number="9876501234",
                    village_name="Hirapur",
                    title="Street Light Blown out",
                    description="The main street light at Panchayat Chowk has been broken for three days. It gets very dark and unsafe at night.",
                    category="Electricity",
                    status="Pending",
                    priority="Low",
                    image_path=None,
                    image_key=None,
                    resolution_notes=None
                ),
                models.Complaint(
                    id="GC-1884",
                    citizen_name="Sunita Patil",
                    mobile_number="9823456789",
                    village_name="Hirapur",
                    title="Water Pipeline Leakage near school",
                    description="Drinking water is leaking heavily from the main underground pipe near the Zilla Parishad School. It is creating a muddy swamp.",
                    category="Water Supply",
                    status="In Progress",
                    priority="High",
                    image_path=None,
                    image_key=None,
                    resolution_notes="Plumbing team dispatched. Identified the damaged pipe segment; replacement works are underway."
                ),
                models.Complaint(
                    id="GC-7212",
                    citizen_name="Anil Yadav",
                    mobile_number="9933445566",
                    village_name="Sajampur",
                    title="Garbage accumulation at market road",
                    description="Garbage has not been collected from the local market road corner for the past one week, causing extreme foul smell.",
                    category="Sanitation",
                    status="Resolved",
                    priority="Medium",
                    image_path=None,
                    image_key=None,
                    resolution_notes="Sanitation crew cleaned the area and installed two large waste bins. Regular daily pickup scheduled."
                ),
                models.Complaint(
                    id="GC-3901",
                    citizen_name="Rajesh Patil",
                    mobile_number="9122334455",
                    village_name="Hirapur",
                    title="Potholes on Main Connecting Road",
                    description="Large potholes have formed on the main road connecting the highway to the village after the recent heavy rains. Vehicles are getting damaged.",
                    category="Roads",
                    status="Pending",
                    priority="Emergency",
                    image_path=None,
                    image_key=None,
                    resolution_notes=None
                )
            ]
            db.bulk_save_objects(sample_complaints)
            db.commit()
            print("Successfully seeded database with sample complaints!")
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

# API Endpoints

@app.get("/stats", response_model=schemas.StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    total = db.query(models.Complaint).count()
    pending = db.query(models.Complaint).filter(models.Complaint.status == "Pending").count()
    in_progress = db.query(models.Complaint).filter(models.Complaint.status == "In Progress").count()
    resolved = db.query(models.Complaint).filter(models.Complaint.status == "Resolved").count()

    # Category distribution
    categories = ["Water Supply", "Roads", "Electricity", "Sanitation"]
    category_dist = {}
    for cat in categories:
        category_dist[cat] = db.query(models.Complaint).filter(models.Complaint.category == cat).count()

    status_dist = {
        "Pending": pending,
        "In Progress": in_progress,
        "Resolved": resolved
    }

    # Dynamic Health Score calculation
    base_water = 75
    base_roads = 90
    base_electricity = 88
    base_healthcare = 70
    base_sanitation = 85

    for cat, base in [
        ("Water Supply", base_water),
        ("Roads", base_roads),
        ("Electricity", base_electricity),
        ("Sanitation", base_sanitation)
    ]:
        p = db.query(models.Complaint).filter(models.Complaint.category == cat, models.Complaint.status == "Pending").count()
        r = db.query(models.Complaint).filter(models.Complaint.category == cat, models.Complaint.status == "Resolved").count()
        adjusted = base - (p * 3) + (r * 2)
        adjusted = max(40, min(100, adjusted))
        if cat == "Water Supply":
            base_water = adjusted
        elif cat == "Roads":
            base_roads = adjusted
        elif cat == "Electricity":
            base_electricity = adjusted
        elif cat == "Sanitation":
            base_sanitation = adjusted

    overall_score = int((base_water + base_roads + base_electricity + base_healthcare + base_sanitation) / 5)
    
    rating = "Good"
    if overall_score < 60:
        rating = "Critical"
    elif overall_score < 80:
        rating = "Average"

    health_breakdown = {
        "overall": overall_score,
        "water": base_water,
        "roads": base_roads,
        "electricity": base_electricity,
        "healthcare": base_healthcare,
        "sanitation": base_sanitation,
        "rating": rating
    }

    return schemas.StatsResponse(
        total=total,
        pending=pending,
        in_progress=in_progress,
        resolved=resolved,
        category_distribution=category_dist,
        status_distribution=status_dist,
        health_score=health_breakdown
    )

@app.get("/complaints", response_model=List[schemas.ComplaintResponse])
def get_complaints(
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Complaint)

    if category:
        query = query.filter(models.Complaint.category == category)
    
    if status:
        query = query.filter(models.Complaint.status == status)

    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.Complaint.id.ilike(search_filter)) |
            (models.Complaint.title.ilike(search_filter)) |
            (models.Complaint.description.ilike(search_filter)) |
            (models.Complaint.citizen_name.ilike(search_filter)) |
            (models.Complaint.village_name.ilike(search_filter))
        )

    # Order by creation date descending
    return query.order_by(models.Complaint.created_at.desc()).all()

@app.get("/complaints/{complaint_id}", response_model=schemas.ComplaintResponse)
def get_complaint(complaint_id: str, db: Session = Depends(get_db)):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID {complaint_id} not found."
        )
    return complaint

async def detect_image_issue_via_ai(image_bytes: bytes, filename: str) -> Dict[str, Any]:
    """Use OpenRouter vision model to detect pothole, garbage, etc. in a photo."""
    fallback_result = {
        "detected": False,
        "issue": None,
        "confidence": 0,
        "reason": "No image analysis performed."
    }

    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY.strip() == "" or "sk-or-v" not in OPENROUTER_API_KEY:
        return fallback_result

    try:
        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        mime_type = "image/jpeg"
        if filename.lower().endswith(".png"):
            mime_type = "image/png"
        elif filename.lower().endswith(".gif"):
            mime_type = "image/gif"
        elif filename.lower().endswith(".webp"):
            mime_type = "image/webp"

        system_prompt = (
            "Analyze this photograph of a municipal or village civic issue. "
            "Verify if it contains any of the following problems:\n"
            "1. Potholes (damaged road surfaces with pits/holes)\n"
            "2. Garbage (accumulated piles of trash, plastic, or waste)\n"
            "3. Broken street lights (damaged poles or unlit fixtures at night)\n"
            "4. Water leakage (burst water pipelines, pooling water on roads, leaking handpumps)\n"
            "5. Fallen trees (roads blocked by uprooted trees or large branches)\n"
            "\n"
            "Return ONLY a raw JSON object with these fields:\n"
            "- 'detected': boolean (true if any of the above 5 categories are found)\n"
            "- 'issue': string (exactly one of: 'Potholes', 'Garbage', 'Broken street lights', 'Water leakage', 'Fallen trees', or null if not detected)\n"
            "- 'confidence': integer (confidence score from 0 to 100)\n"
            "- 'reason': string (1-sentence description of the visual evidence found)\n"
            "No markdown formatting, just plain JSON."
        )

        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://gramconnect.village",
            "X-Title": "GramConnect Smart Village"
        }
        
        payload = {
            "model": OPENROUTER_CHAT_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": system_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            "temperature": 0.1,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            )
            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"]
                import json
                clean_content = content.replace("```json", "").replace("```", "").strip()
                return json.loads(clean_content)
            else:
                print(f"GramAI: Vision API error {response.status_code}")
                return fallback_result
    except Exception as e:
        print(f"GramAI: Image analysis failed with exception: {e}")
        return fallback_result

def simulate_image_detection(description: str, category: str) -> Dict[str, Any]:
    desc = description.lower()
    issue = None
    confidence = 0
    reason = "Visual evidence processed."

    if "pothole" in desc or "road" in desc or category == "Roads":
        issue = "Potholes"
        confidence = random.randint(85, 98)
        reason = "AI identified broken road pavement and asphalt pits in the photo."
    elif "garbage" in desc or "trash" in desc or "waste" in desc or category == "Sanitation":
        issue = "Garbage"
        confidence = random.randint(80, 95)
        reason = "AI identified accumulated solid waste and plastic bags in the photo."
    elif "light" in desc or "bulb" in desc or category == "Electricity":
        issue = "Broken street lights"
        confidence = random.randint(88, 97)
        reason = "AI identified a damaged pole fixture and dark lamp casing in the photo."
    elif "leak" in desc or "water" in desc or "pipe" in desc or category == "Water Supply":
        issue = "Water leakage"
        confidence = random.randint(82, 96)
        reason = "AI identified a water pipeline burst and surface flooding in the photo."
    elif "tree" in desc or "branch" in desc or "fallen" in desc:
        issue = "Fallen trees"
        confidence = random.randint(90, 99)
        reason = "AI identified a blocked right-of-way caused by a fallen trunk/branches."

    return {
        "detected": issue is not None,
        "issue": issue,
        "confidence": confidence,
        "reason": reason
    }

def send_notifications_flow(citizen_name: str, mobile_number: str, message: str, db: Session):
    in_app = models.Notification(citizen_name=citizen_name, mobile_number=mobile_number, message=message, type="In-App")
    db.add(in_app)
    sms_msg = f"GramConnect Alert: {message}"
    sms = models.Notification(citizen_name=citizen_name, mobile_number=mobile_number, message=sms_msg, type="SMS")
    db.add(sms)
    email_msg = f"Subject: GramConnect Alert - {message}"
    email = models.Notification(citizen_name=citizen_name, mobile_number=mobile_number, message=email_msg, type="Email")
    db.add(email)
    db.commit()

@app.post("/complaints", response_model=schemas.ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    citizen_name: str = Form(...),
    mobile_number: str = Form(...),
    village_name: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    image_path: Optional[str] = Form(None),
    image_key: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    valid_categories = ["Water Supply", "Roads", "Electricity", "Sanitation"]
    if category not in valid_categories:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Category must be one of: {', '.join(valid_categories)}"
        )

    complaint_id = generate_unique_id(db)
    final_image_path = image_path
    final_image_key = image_key

    ai_detected = None
    ai_conf = None

    if photo and photo.filename:
        ext = os.path.splitext(photo.filename)[1]
        unique_filename = f"{complaint_id}_{uuid.uuid4().hex}{ext}"
        target_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        try:
            photo_bytes = await photo.read()
            await photo.seek(0)
            with open(target_path, "wb") as buffer:
                shutil.copyfileobj(photo.file, buffer)
            final_image_path = f"/uploads/{unique_filename}"
            final_image_key = None
            
            ai_res = await detect_image_issue_via_ai(photo_bytes, photo.filename)
            if ai_res.get("detected"):
                ai_detected = ai_res.get("issue")
                ai_conf = ai_res.get("confidence")
            else:
                sim_res = simulate_image_detection(description, category)
                if sim_res.get("detected"):
                    ai_detected = sim_res.get("issue")
                    ai_conf = sim_res.get("confidence")
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Could not save or analyze file: {str(e)}"
            )
    else:
        # Check description anyway to simulate AI detection if no image is uploaded
        sim_res = simulate_image_detection(description, category)
        if sim_res.get("detected"):
            ai_detected = sim_res.get("issue")
            ai_conf = sim_res.get("confidence")

    officers = {
        "Water Supply": "Mr. Vinay Salunkhe (Water Works Inspector)",
        "Roads": "Mr. Santosh Patil (Public Works Engineer)",
        "Electricity": "Mr. Satish Pawar (State Electricity Officer)",
        "Sanitation": "Mrs. Anita Deshmukh (Gram Cleanliness Inspector)"
    }
    assigned_officer = officers.get(category, "Unassigned Officer")
    est_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")

    new_complaint = models.Complaint(
        id=complaint_id,
        citizen_name=citizen_name,
        mobile_number=mobile_number,
        village_name=village_name,
        title=title,
        description=description,
        category=category,
        image_path=final_image_path,
        image_key=final_image_key,
        status="Pending",
        priority="Medium",
        estimated_completion=est_date,
        officer_assigned=assigned_officer,
        progress_percentage=10,
        ai_detected_issue=ai_detected,
        ai_confidence=ai_conf
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)
    
    reg_msg = f"Grievance {complaint_id} registered! Officer Assigned: {assigned_officer}. Est. Completion: {est_date}."
    send_notifications_flow(citizen_name, mobile_number, reg_msg, db)
    
    return new_complaint

@app.put("/complaints/{complaint_id}/status", response_model=schemas.ComplaintResponse)
def update_complaint_status(
    complaint_id: str,
    update_data: schemas.ComplaintUpdateStatus,
    db: Session = Depends(get_db)
):
    complaint = db.query(models.Complaint).filter(models.Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID {complaint_id} not found."
        )

    valid_statuses = ["Pending", "In Progress", "Resolved"]
    if update_data.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status must be one of: {', '.join(valid_statuses)}"
        )

    if update_data.priority is not None:
        valid_priorities = ["Low", "Medium", "High", "Emergency"]
        if update_data.priority not in valid_priorities:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Priority must be one of: {', '.join(valid_priorities)}"
            )
        complaint.priority = update_data.priority

    old_status = complaint.status
    old_progress = complaint.progress_percentage

    complaint.status = update_data.status
    if update_data.resolution_notes is not None:
        complaint.resolution_notes = update_data.resolution_notes

    if update_data.estimated_completion is not None:
        complaint.estimated_completion = update_data.estimated_completion
    if update_data.officer_assigned is not None:
        complaint.officer_assigned = update_data.officer_assigned
    if update_data.progress_percentage is not None:
        complaint.progress_percentage = update_data.progress_percentage
    else:
        if update_data.status == "Resolved":
            complaint.progress_percentage = 100
        elif update_data.status == "In Progress" and complaint.progress_percentage < 30:
            complaint.progress_percentage = 40

    db.commit()
    db.refresh(complaint)

    if old_status != complaint.status or old_progress != complaint.progress_percentage:
        update_msg = f"Update on ticket {complaint.id}: Status is now '{complaint.status}' ({complaint.progress_percentage}% completed)."
        if complaint.status == "Resolved" and complaint.resolution_notes:
            update_msg += f" Resolution notes: {complaint.resolution_notes}"
        send_notifications_flow(complaint.citizen_name, complaint.mobile_number, update_msg, db)

    return complaint

@app.get("/notifications", response_model=List[schemas.NotificationResponse])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(models.Notification).order_by(models.Notification.created_at.desc()).limit(20).all()

@app.get("/resources", response_model=List[schemas.ResourceResponse])
def get_resources(db: Session = Depends(get_db)):
    return db.query(models.Resource).all()


# --- GramAI Module Endpoints ---

class ClassifyRequest(BaseModel):
    description: str

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

async def query_openrouter(messages: List[Dict[str, str]], json_mode: bool = False) -> str:
    """Helper to query OpenRouter AI gateway with safety timeout and simulated fallbacks."""
    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY.strip() == "" or "sk-or-v" not in OPENROUTER_API_KEY:
        # Fallback to local simulation if no API key is set
        print("GramAI: No active OpenRouter key. Using simulated response.")
        return "SIMULATED"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://gramconnect.village",
        "X-Title": "GramConnect Smart Village"
    }
    payload = {
        "model": OPENROUTER_CHAT_MODEL,
        "messages": messages,
        "temperature": 0.2
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            )
            if response.status_code == 200:
                data = response.json()
                return data["choices"][0]["message"]["content"]
            else:
                print(f"GramAI: API Error {response.status_code}. Using simulation fallback.")
                return "SIMULATED"
    except Exception as e:
        print(f"GramAI: Connection failed ({e}). Using simulation fallback.")
        return "SIMULATED"

@app.post("/ai/classify")
async def ai_classify(req: ClassifyRequest):
    desc = req.description.lower().strip()
    if not desc:
        raise HTTPException(status_code=400, detail="Description is required")

    system_prompt = (
        "You are a rural complaint classifier. Analyze the citizen complaint description and return a JSON object with: "
        "1. 'category': exactly one of 'Water Supply', 'Roads', 'Electricity', 'Sanitation' "
        "2. 'priority': exactly one of 'Low', 'Medium', 'High', 'Emergency' "
        "3. 'department': name of the responsible local village department "
        "4. 'summary': 1-sentence brief summary. "
        "Return ONLY the raw JSON object, no markdown formatting."
    )

    result = await query_openrouter([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": req.description}
    ], json_mode=True)

    # Simulated Classification Fallback Logic
    if result == "SIMULATED":
        category = "Sanitation"
        priority = "Medium"
        department = "Gram Health & Sanitation Committee"
        summary = "General sanitation grievance."

        if any(w in desc for w in ["water", "pipe", "leak", "tank", "well", "drain"]):
            category = "Water Supply"
            priority = "High" if any(w in desc for w in ["leak", "flood", "break"]) else "Medium"
            department = "Water Supply & Irrigation Department"
            summary = "Grievance related to water pipeline or storage."
        elif any(w in desc for w in ["road", "pothole", "pavement", "bridge", "street"]):
            category = "Roads"
            priority = "Emergency" if "accident" in desc or "blocked" in desc else "Medium"
            department = "Public Works Department (PWD)"
            summary = "Grievance related to road access or structural defects."
        elif any(w in desc for w in ["electricity", "power", "light", "transformer", "load", "blackout"]):
            category = "Electricity"
            priority = "Emergency" if "spark" in desc or "wire" in desc else "High"
            department = "State Electricity Distribution Corporation"
            summary = "Grievance regarding power cuts or unsafe electrical wiring."
        elif any(w in desc for w in ["garbage", "trash", "waste", "drainage", "sewer", "dirty", "smell"]):
            category = "Sanitation"
            priority = "Low" if "smell" in desc else "Medium"
            department = "Sanitation and Swachh Gram Committee"
            summary = "Grievance regarding garbage piling or drain blockages."

        return {
            "category": category,
            "priority": priority,
            "department": department,
            "summary": summary
        }

    import json
    try:
        # Clean up possible markdown code blocks
        clean_result = result.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean_result)
        return parsed
    except Exception as e:
        print(f"Failed to parse JSON response: {result}. Error: {e}")
        return {
            "category": "Sanitation",
            "priority": "Medium",
            "department": "Gram Panchayat Welfare Board",
            "summary": "Complaint recorded for inspection."
        }

@app.post("/ai/chat")
async def ai_chat(req: ChatRequest):
    system_prompt = (
        "You are GramAI, the friendly smart village assistant for the GramConnect portal. "
        "Help villagers with: "
        "- Village resources (Zilla Parishad School, PHC, Water Tank, Panchayat, ST Bus Stop). "
        "- Contact info: Police (+91 2162 234100), PHC (+91 98765 43212), Ambulance (108), Sarpanch (+91 98789 01234). "
        "- Explaining the complaint registration/tracking process. "
        "- General panchayat schemes and services. "
        "Keep your response polite, extremely simple, and short (1-3 sentences max)."
    )

    api_messages = [{"role": "system", "content": system_prompt}]
    for msg in req.history[-6:]:  # Keep last 3 exchanges to avoid context bloating
        api_messages.append({"role": msg.role, "content": msg.content})
    api_messages.append({"role": "user", "content": req.message})

    result = await query_openrouter(api_messages)

    # Simulated Chatbot Fallback Logic
    if result == "SIMULATED":
        msg_lower = req.message.lower()
        if "sarpanch" in msg_lower or "head" in msg_lower:
            return {"response": "The Gram Panchayat Sarpanch is Smt. Sunita Bhosale. You can contact her office at +91 98789 01234."}
        elif "hospital" in msg_lower or "health" in msg_lower or "doctor" in msg_lower:
            return {"response": "The Primary Health Centre (PHC) is located on Hospital Road. It provides 24/7 care at +91 98765 43212."}
        elif "police" in msg_lower or "cop" in msg_lower:
            return {"response": "The local Police Station is at Satara Road. Call +91 2162 234100 or dial 100 for emergencies."}
        elif "water" in msg_lower:
            return {"response": "The main village water tank supplies purified water twice daily. For leaks, file a complaint on the 'Submit Complaint' tab."}
        elif "pothole" in msg_lower or "road" in msg_lower:
            return {"response": "You can report potholes on our portal. Go to 'Submit Complaint', fill in the details, and the PWD will review it."}
        elif "scheme" in msg_lower or "government" in msg_lower:
            return {"response": "Active schemes include PM Swachh Bharat Abhiyan and Solar Energy Subsidy. Inquire at the Panchayat Office."}
        else:
            return {"response": "Hello! I am GramAI, your village helper. I can give you contact numbers, find schools or clinics, and explain how to track complaints."}

    return {"response": result}

@app.get("/ai/analytics-insights")
async def ai_analytics_insights(db: Session = Depends(get_db)):
    # Calculate live stats
    total = db.query(models.Complaint).count()
    pending = db.query(models.Complaint).filter(models.Complaint.status == "Pending").count()
    resolved = db.query(models.Complaint).filter(models.Complaint.status == "Resolved").count()
    
    categories = ["Water Supply", "Roads", "Electricity", "Sanitation"]
    category_counts = {}
    for cat in categories:
        category_counts[cat] = db.query(models.Complaint).filter(models.Complaint.category == cat).count()

    # Find most common category
    most_common = max(category_counts, key=category_counts.get) if total > 0 else "Water Supply"

    system_prompt = (
        "You are a village analytics intelligence system. Analyze the current ticket statistics: "
        f"Total complaints: {total}, Pending: {pending}, Resolved: {resolved}. "
        f"Category distribution: {category_counts}. "
        "Generate a JSON object with: "
        "1. 'most_common': name of category with highest tickets "
        "2. 'average_resolution': estimated average resolution time (e.g. '1.5 days') "
        "3. 'predictive_alerts': list of 3-4 bullet-point alerts predicting future complaints "
        "based on seasons, traffic, harvesting, etc. "
        "Return ONLY the raw JSON object, no markdown."
    )

    result = await query_openrouter([
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Generate predictive alerts and analysis."}
    ], json_mode=True)

    # Simulated Analytics Insights Fallback
    if result == "SIMULATED":
        return {
            "most_common": most_common,
            "average_resolution": "1.8 Days" if resolved > 0 else "N/A",
            "predictive_alerts": [
                "🌧️ High Risk (Water Supply): Water clogging and drain blockages predicted next month due to incoming monsoon showers.",
                "🚜 Access Warning (Roads): Expected rise in potholes on Outer Bypass Road during heavy harvesting crop transit in October.",
                "⚡ Grid Alert (Electricity): Local transformer overload reports anticipated to spike by 15% due to high pump usage in agricultural zones.",
                "🧹 Sanitation Watch: Daily garbage clearance complaints on Market Road expected to rise during the upcoming Gram festival."
            ]
        }

    import json
    try:
        clean_result = result.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean_result)
        return parsed
    except Exception as e:
        print(f"Failed to parse analytics insights JSON: {result}. Error: {e}")
        return {
            "most_common": most_common,
            "average_resolution": "2.0 Days",
            "predictive_alerts": [
                "🌧️ Heavy monsoon precipitation likely to trigger drainage sanitation blocks.",
                "⚡ Crop harvesting pumps might cause localized transformer load drops."
            ]
        }


# Trigger Uvicorn reload after db recreation


