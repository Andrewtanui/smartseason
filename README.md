# SmartSeason Field Monitoring System

## Overview
SmartSeason is a web application designed to track crop progress across multiple fields during a growing season. It facilitates communication between Admins (Coordinators) and Field Agents.

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
- **Admins**: Can monitor all updates in real-time across the entire system.

### 4. Field Stages
Fields progress through a standard lifecycle:
- **Planted**
- **Growing**
- **Ready**
- **Harvested**

### 5. Field Status Logic (Computed)
The system automatically calculates a field's **Status** based on activity:
- **Completed**: The field stage is set to `Harvested`.
- **At Risk**: No updates have been posted for the field in the last **7 days**. This ensures that stagnant fields are flagged for attention.
- **Active**: The field is not harvested and has received an update within the last 7 days.

### 6. Dashboard
- **Admin Dashboard**: Overview of all system-wide fields, total counts, and a breakdown of statuses and stages.
- **Agent Dashboard**: Personalized view showing stats only for fields assigned to that specific agent.

## Technical Stack
- **Backend**: Django REST Framework (Python)
- **Frontend**: React (Vite, JavaScript)
- **Database**: SQLite (default)
- **Styling**: Modern CSS-in-JS (React)

## Setup Instructions

### Backend
1. `cd backend` (or root if manage.py is there)
2. `pip install -r requirements.txt` (if applicable)
3. `python manage.py migrate`
4. `python manage.py runserver`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`
