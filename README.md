# ETHARA SEAT MANAGEMENT SYSTEM

A full-stack spatial workplace intelligence and seat allocation system designed for **Ethara** to manage 5,000+ employees across 25 projects, 5 floors, and 8 zones.

Designed strictly after the soft claymorphic pastel aesthetic featuring floating rounded cards, warm off-white canvas (`#F6F5F0`), amber primary CTA buttons, soft pastel progress cards, and an integrated Spatial AI assistant.

---

## Key Features

- **Workforce Scale**: Pre-seeded dataset of **5,000 Employees**, **25 Projects**, **5 Floors**, **8 Zones**, and **2,500 Seats**.
- **Role-Based Portals (RBAC)**: Admin, HR, Project Manager, Employee.
- **Interactive Spatial Seat Map**: Color-coded 2D grid maps (🟢 Available, 🔴 Occupied, 🟡 Reserved, ⚪ Maintenance) with real-time seat assignment, release, and transfer drawers.
- **Intelligent Spatial AI Assistant**: Dual NLP engine capable of resolving natural language queries like:
  - *"Where is Rahul seated?"*
  - *"Show vacant seats on Floor 2"*
  - *"Employees in Project Alpha"*
  - *"Employees without seats"*
  - *"Who occupies seat F1-ZA004?"*
- **Bulk CSV Import**: Import hundreds of employee records instantly.
- **Multi-Format Exports**: Download audit reports in CSV Excel format or generate print-ready executive PDFs.

---

## AI Prompt Documentation & Code Validation Log

As required by the specification, below is the complete documentation of prompts used and validation methodology applied:

### Prompts Documented:
1. **Architecture & Schema Prompt**:
   > *"Design a full-stack spatial seat allocation system for 5,000 employees at Ethara. Structure models for User, Employee, Project, Seat, Floor, Zone, Announcement, and ActivityLog with high-speed paginated search."*
2. **Claymorphic UI Aesthetic Prompt**:
   > *"Implement UI strictly styled after Eduhouse soft pastel claymorphic mockup: warm off-white background `#f6f5f0`, rounded floating cards `rounded-3xl` with soft drop shadows, soft pastel widget cards, amber primary CTA buttons `#f59e0b`, pill search bar, and mentor list style employee rows."*
3. **AI Chatbot Engine Prompt**:
   > *"Build a dual-mode Spatial AI assistant controller resolving employee location, floor vacancy, project headcount, and unallocated joiner queries with fallback rule engine and OpenAI integration."*

### Validation Methodology:
- **Runtime API Verification**: Verified REST endpoints (`/api/auth/login`, `/api/employees`, `/api/seats`, `/api/dashboard`, `/api/ai/chat`) under zero network errors.
- **Data Integrity & Scale**: Validated that 5,000 employees load with instant pagination without browser frame drop or backend memory spikes.
- **Role Authorization Testing**: Tested JWT bearer token authentication across Admin, HR, Project Manager, and Employee credentials.

---

## Pre-Seeded Demo Login Credentials

You can use the built-in quick demo switcher on the login page or enter:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@ethara.com` | `admin123` |
| **HR** | `hr@ethara.com` | `hr123` |
| **Project Manager** | `pm@ethara.com` | `pm123` |
| **Employee** | `employee@ethara.com` | `emp123` |

---

## Quick Start / Installation Guide

### 1. Start Backend Server
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000` and automatically seeds 5,000 employees on first startup.*

### 2. Start Frontend App
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`.*
