# SmartSeason Field Monitoring System

## Overview
SmartSeason is a web application designed to track crop progress across multiple fields during a growing season. It facilitates communication between Admins (Coordinators) and Field Agents.

## Live Demo
- **Frontend**: https://smartseasonapp.netlify.app
- **Backend API**: https://smartseason-api-aawo.onrender.com/api

> Note: The backend is hosted on Render's free tier and may take 50+ seconds to respond on the first request after a period of inactivity. Please allow a moment for it to wake up.

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | tanuiadmin | Kibettanui2 |
| Field Agent | Waynekigen | Waynekigen123 |
| Field Agent | Kiptooelvis | Kiptooelvis123 |

## Core Features

### 1. Users & Access
- **Admin (Coordinator)**: Has full visibility of all fields, can create fields, and assign them to agents.
- **Field Agent**: Can view only the fields assigned to them and post progress updates.
- **Authentication**: Secured via JWT (JSON Web Tokens).

### 2. Field Management
- Admins can create fields with:
  - **Name** (e.g., "North Sector")
  - **Crop Type** (e.g., "Maize")
  - **Planting Date**
  - **Initial Stage**
- Admins can assign multiple agents to a single field.

### 3. Field Updates
- **Field Agents**: Can update the lifecycle stage of a field and add notes/observations.
- **Admins**: Can monitor all updates across the entire system.

### 4. Field Stages
Fields progress through a standard lifecycle:
- **Planted**
- **Growing**
- **Ready**
- **Harvested**

### 5. Field Status Logic (Computed)
The system automatically calculates a field's **Status** based on activity:
- **Completed**: The field stage is set to `Harvested`.
- **At Risk**: No updates have been posted for the field in the last **7 days**.
- **Active**: The field is not harvested and has received an update within the last 7 days.

> Status is deliberately computed at read time rather than stored in the database. This avoids sync issues and ensures the status always reflects the latest data without requiring scheduled jobs or triggers.

### 6. Dashboard
- **Admin Dashboard**: Overview of all system-wide fields, total counts, and a breakdown of statuses and stages.
- **Agent Dashboard**: Personalized view showing stats only for fields assigned to that specific agent.

## Technical Stack
- **Backend**: Django 4.2 + Django REST Framework
- **Frontend**: React 18 (Vite)
- **Database**: SQLite (local) / PostgreSQL-ready via dj-database-url (production)
- **Auth**: JWT via djangorestframework-simplejwt
- **Hosting**: Render (backend) + Netlify (frontend)

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend
```bash
# Clone the repo
git clone https://github.com/Andrewtanui/smartseason.git
cd smartseason

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file in root folder
# DJANGO_SECRET_KEY=your-secret-key
# DEBUG=True
# ALLOWED_HOSTS=127.0.0.1,localhost
# CORS_ALLOWED_ORIGINS=http://localhost:5173

# Run migrations
python manage.py migrate

# Create a superuser
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Create .env file inside frontend folder
# VITE_API_URL=http://127.0.0.1:8000/api

# Start dev server
npm run dev
```

Frontend runs on http://localhost:5173
Backend runs on http://127.0.0.1:8000

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/users/login/ | Public | Get JWT tokens |
| POST | /api/users/register/ | Public | Register new user |
| GET | /api/users/me/ | Authenticated | Get current user |
| GET | /api/users/ | Admin only | List all users |
| GET | /api/fields/ | Authenticated | List fields |
| POST | /api/fields/ | Admin only | Create field |
| GET | /api/fields/:id/ | Authenticated | Get field detail |
| PATCH | /api/fields/:id/ | Admin only | Update field |
| DELETE | /api/fields/:id/ | Admin only | Delete field |
| GET | /api/fields/:id/updates/ | Authenticated | List field updates |
| POST | /api/fields/:id/updates/ | Agent/Admin | Add field update |
| GET | /api/fields/dashboard/ | Authenticated | Get dashboard stats |

## Design Decisions

### Custom User Model
Extended Django's `AbstractUser` with a `role` field (`admin` or `agent`) rather than using Groups/Permissions. This keeps role checks simple and readable throughout the codebase.

### Computed Status
Field status (`active`, `at_risk`, `completed`) is a computed `@property` on the model rather than a stored database column. This avoids stale data and removes the need for scheduled jobs to update statuses.

### Append-only Updates
`FieldUpdate` records are never edited or deleted — every stage change and note is a new record. This gives a full audit trail of field activity and powers the "At Risk" detection logic.

### JWT Authentication
Sessions were avoided in favour of JWT tokens so the React frontend can authenticate stateless requests cleanly without CSRF complexity.

## Assumptions
- A field can be assigned to multiple agents simultaneously.
- Only admins can create or delete fields; agents can only update them.
- The 7-day inactivity window for "At Risk" status is measured from the latest `FieldUpdate` timestamp.
- Newly created fields with no updates are immediately flagged as `at_risk` to prompt agents to begin monitoring.
