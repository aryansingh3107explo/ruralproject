# GramConnect – Smart Village Complaint and Resource Management Portal

GramConnect is a high-fidelity web application prototype designed for rural development and civic management. It empowers villagers to digitally report infrastructure, utility, and sanitation issues directly to local administrators, track resolution progress on an interactive timeline, and query vital village resources (schools, clinics, transport, water facilities) served directly from a relational database.

---

## 📂 Folder Structure

```
/rural project/
├── backend/
│   ├── main.py              # FastAPI application server (routes, uploads handler, seeding)
│   ├── database.py          # SQLAlchemy base connection and session setup
│   ├── models.py            # SQLite relational database schemas (Complaints & Resources)
│   ├── schemas.py           # Pydantic data serialization and request validators
│   ├── requirements.txt     # Python dependencies manifest
│   ├── uploads/             # Directory where uploaded images are saved
│   │   └── resources/       # Generated vector illustrations for village directory cards
│   └── gramconnect.db       # SQLite local database file (created automatically on startup)
│
├── frontend/
│   ├── package.json         # Node.js dependencies configuration
│   ├── tailwind.config.js   # Tailwind style utilities, content paths, and custom themes
│   ├── postcss.config.js    # PostCSS styling directives
│   ├── index.html           # Main entry point with customized Outfit & Inter typography
│   └── src/
│       ├── main.jsx         # Vite standard bootstrapper
│       ├── App.jsx          # Root component and state-based page router and Toast manager
│       ├── index.css        # Tailwind base stylesheet with custom animations
│       ├── assets/
│       │   └── village_hero.png # Custom generated smart village hero illustration
│       ├── components/
│       │   └── Navbar.jsx   # Tab navigation header with mobile responsiveness
│       └── pages/
│           ├── Home.jsx             # Home page with introductory flow and stats widgets
│           ├── SubmitComplaint.jsx  # Forms handler, validation error borders, and copy modals
│           ├── ComplaintStatus.jsx  # Grievance lookup and interactive timeline stepper
│           ├── VillageResources.jsx # Village resource card directory with filtering and searching
│           ├── VillageMap.jsx       # Interactive SVG map displaying resources and complaints
│           ├── EmergencyContacts.jsx # Direct helplines and leadership contact directory
│           ├── SurveyAnalytics.jsx  # Survey results, respondent ages, satisfaction levels, and charts
│           └── AdminDashboard.jsx   # Metrics, CSS graphs, filtering table, and updates modal
│       └── utils/
│           └── translations.js      # English, Marathi, and Hindi translation dictionary
│
└── README.md                # Installation and technical documentation
```

---

## 🛠️ Tech Stack & Requirements

### Backend
- **FastAPI**: Python-based high-performance REST framework
- **SQLAlchemy ORM**: Relational database mapper
- **SQLite**: Local database storage
- **Uvicorn**: ASGI web server
- **Python Multipart**: Multipart form parsing for file uploads

### Frontend
- **React + Vite**: Speedy client build scaffolding
- **Tailwind CSS (v3)**: Flexible utility styling with custom palette config
- **Lucide React**: Modern outline iconography system

---

## ⚙️ Setup and Running Instructions

Ensure you have **Python 3.8+** and **Node.js 16+** installed on your system.

### 1. Backend Server Setup
From the project root:
```bash
# Initialize Python virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install required python packages
pip install -r backend/requirements.txt

# Run the FastAPI server (reloads on file change)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
Once started, the backend is accessible at `http://127.0.0.1:8000`. You can explore the interactive API docs at `http://127.0.0.1:8000/docs`.

### 2. Frontend React Setup
From the project root:
```bash
# Navigate to the frontend directory
cd frontend

# Install Node modules
npm install

# Build production assets (verifies build safety)
npm run build

# Start the local development server
npm run dev -- --host 127.0.0.1 --port 5173
```
Once started, open your web browser and navigate to `http://127.0.0.1:5173`.

---

## 🗄️ Database Schemas

SQLite database tables defined in `backend/models.py`.

### 1. `complaints` Table
| Column Name | Data Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key, Indexed | Unique code like `GC-1024` |
| `citizen_name` | String | Not Null | Full name of the reporter |
| `mobile_number` | String | Not Null | 10-digit phone number |
| `village_name` | String | Not Null | Village of origin |
| `title` | String | Not Null | Grievance title |
| `description` | Text | Not Null | Multi-line detailed explanation |
| `category` | String | Not Null | `Water Supply`, `Roads`, `Electricity`, or `Sanitation` |
| `image_path` | String | Nullable | Uploaded image path `/uploads/...` |
| `status` | String | Not Null, Default `Pending` | `Pending`, `In Progress`, or `Resolved` |
| `priority` | String | Not Null, Default `Medium` | `Low`, `Medium`, `High`, or `Emergency` |
| `resolution_notes`| Text | Nullable | Administrative notes on resolution progress |
| `created_at` | DateTime | Not Null, Server Default | Timestamp of submission |

### 2. `resources` Table
| Column Name | Data Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment | Row ID |
| `category` | String | Not Null | `Schools`, `Hospitals`, `Water Infrastructure`, `Panchayat`, `Transportation` |
| `name` | String | Not Null | Resource facility name |
| `address` | String | Not Null | Location address |
| `contact` | String | Not Null | Department phone number |
| `description` | Text | Not Null | Services outline |
| `image_url` | String | Not Null | Path to the graphic illustration |

---

## 📡 REST API Documentation

### 1. Get Live Statistics
- **Route**: `GET /stats`
- **Description**: Compiles overall statistics, status distribution, and category breakdowns.
- **Response Format**: `JSON`
- **Sample Output**:
```json
{
  "total": 4,
  "pending": 2,
  "in_progress": 1,
  "resolved": 1,
  "category_distribution": {
    "Water Supply": 1,
    "Roads": 1,
    "Electricity": 1,
    "Sanitation": 1
  },
  "status_distribution": {
    "Pending": 2,
    "In Progress": 1,
    "Resolved": 1
  }
}
```

### 2. Get Grievances List
- **Route**: `GET /complaints`
- **Description**: Returns all complaints. Supports parameters for filtering and full-text searches.
- **Query Parameters**:
  - `category` (optional String): Filter by category
  - `status` (optional String): Filter by status
  - `search` (optional String): Matches ID, title, details, name, or village.
- **Sample Output**:
```json
[
  {
    "id": "GC-5021",
    "citizen_name": "Ramesh Kumar",
    "mobile_number": "9876501234",
    "village_name": "Hirapur",
    "title": "Street Light Blown out",
    "description": "The main street light at Panchayat Chowk has been broken for three days. It gets very dark and unsafe at night.",
    "category": "Electricity",
    "status": "Pending",
    "image_path": null,
    "resolution_notes": null,
    "created_at": "2026-07-02T01:50:00"
  }
]
```

### 3. File a New Grievance
- **Route**: `POST /complaints`
- **Request Type**: `multipart/form-data`
- **Form Fields**:
  - `citizen_name` (Required String)
  - `mobile_number` (Required String, 10-digits)
  - `village_name` (Required String)
  - `title` (Required String)
  - `description` (Required String)
  - `category` (Required String: Water Supply, Roads, Electricity, Sanitation)
  - `photo` (Optional Binary File)
- **Response**: Returns the fully saved database row object with its generated unique code.

### 4. Query Single Grievance Details
- **Route**: `GET /complaints/{id}`
- **Description**: Fetches detailed information for a single complaint.
- **Response**: JSON representation of the complaint row, or `404 Not Found` if missing.

### 5. Update Status & Resolution Notes (Admin)
- **Route**: `PUT /complaints/{id}/status`
- **Request Body**: `application/json`
```json
{
  "status": "In Progress",
  "resolution_notes": "Electrical grid engineering team has been notified. Expected resolution in 4 hours."
}
```
- **Response**: Updated complaint JSON row object.

### 6. Get Resource Directory
- **Route**: `GET /resources`
- **Description**: Reads and returns all categorised village resource cards from the SQLite database.
- **Response Format**: List of resource records.

### 7. AI Complaint Classification (GramAI)
- **Route**: `POST /ai/classify`
- **Request Body**: `JSON` (`{ "description": "..." }`)
- **Description**: Automatically detects category, priority, and suggests responsible local department.
- **Response Format**: `JSON` (`{ "category": "...", "priority": "...", "department": "...", "summary": "..." }`)

### 8. Virtual Chatbot Assistant (GramAI)
- **Route**: `POST /ai/chat`
- **Request Body**: `JSON` (`{ "message": "...", "history": [...] }`)
- **Description**: Converses with user and returns answering text.
- **Response Format**: `JSON` (`{ "response": "..." }`)

### 9. AI Seasonal Predictive Insights (GramAI)
- **Route**: `GET /ai/analytics-insights`
- **Description**: Reads active database stats and generates 4 seasonal spike warnings.
- **Response Format**: `JSON` (`{ "most_common": "...", "average_resolution": "...", "predictive_alerts": [...] }`)
