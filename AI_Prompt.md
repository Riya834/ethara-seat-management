# AI System Specification & Master Prompt
## Project: Ethara Enterprise Seat & Facility Management System

This document contains the master AI specification, prompts, architecture guidelines, and engineering requirements used to build the **Ethara Workplace Seating & Facility Management Portal**.

---

## 🎯 1. System Vision & Objective
Build a modern, high-performance, enterprise-grade Workplace Seating & Desk Management System tailored for **5,000+ employees**, featuring:
- Dynamic Floor Plan Visualizations & Seat Allocation Engine.
- Crextio-inspired aesthetic design system (warm cream `#FAF7F2`, apricot `#FBC48B` CTAs, pillar sidebars, doodle artwork).
- Role-Based Access Control (Admin, HR, PM, Employee).
- Project Block Reservations & Team Member Assignment.
- Floating AI Assistant FAB Widget & NLP Desk Search.
- MongoDB Atlas Cloud Database Integration with Multi-stage Local/In-Memory Failover.
- Strict **Two-Folder Architecture** (`frontend/` and `backend/`).

---

## 🎨 2. Design System & Aesthetics Guidelines

### Color Palette Tokens
| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Warm Background** | `#FAF7F2` | Body background, card container fill |
| **Warm Cream Card** | `#FFFFFF` / `#FAF7F2` | Container surfaces with 24px-36px rounded corners |
| **Apricot Primary CTA** | `#FBC48B` | Main Action Buttons, Pill Badges, Floating AI FAB |
| **Apricot Hover** | `#f7b674` | Hover states for primary buttons |
| **Border Soft Cream** | `#EFE8DC` | Subtle container borders |
| **Text Primary** | `#0F172A` / `#1E293B` | High contrast slate headings |
| **Text Secondary** | `#64748B` | Subtitles, captions, metadata labels |

### UI Design Components
1. **Vertical Pillar Sidebar**:
   - Floating rounded vertical pill rail (`bg-slate-900`, `rounded-full` or `rounded-[32px]`).
   - Icon navigation links with active state highlight in `#FBC48B`.
2. **Crextio Horizontal Pill Tabs**:
   - Smooth rounded tab buttons (`rounded-full`) for filtering departments, floors, and statuses.
3. **People Directory Card Grid**:
   - 3x2 responsive card grid matching Crextio "Best for You" design.
   - Includes employee avatar, name, designation, department pill badge, floor/seat allocation, and action buttons (`Profile`, `Map`, `Delete`).
4. **Vector Illustrations & Doodle Curves**:
   - Blueprint grid lines, polka-dot abstract shapes, and doodle curves across page headers and card banners.
5. **Floating AI Assistant Widget**:
   - Permanent FAB button (`#FBC48B`) positioned at `fixed bottom-6 right-6`.
   - Opens AI Assistant chat modal with NLP desk search and seating recommendations.

---

## ⚙️ 3. Core Features & Functional Requirements

### A. 5,000 Employee Scale Capability
- Seeded database & mock fallback store supporting 5,000 employee records (`ETH-00001` to `ETH-05000`).
- Server-side pagination (`limit`, `page`), search indexing, and optimized Mongoose queries.
- Facility setup across 10 floors, 30 zones, and 3,450+ physical desk seats.

### B. People Directory & HR Actions
- Interactive table and card views for managing employees.
- HR & Admin privilege to add new employees, update details, assign desks, and delete employee records.
- Pre-filled auto-generated Employee IDs (`ETH-XXXXX`).

### C. Projects & Block Seat Allocation
- Interactive project cards with live metrics: Headcount, Reserved Block Seats, and Utilization %.
- **Manage Team Members Modal**:
  - View current assigned team members with avatar, designation, and allocated seat desk.
  - Search & select dropdown to add employees to the project block.
  - 1-click removal of team members from project blocks.

### D. MongoDB Atlas & Deployment Failover
- Primary connection to MongoDB Atlas Cloud Cluster (`ethara_seat_db`).
- Multi-stage connection failover in `backend/src/index.ts`:
  1. Primary MongoDB Atlas (`mongodb+srv://...`).
  2. Fallback to Local MongoDB (`mongodb://127.0.0.1:27017/ethara_seat_db`).
  3. Fallback to In-Memory Mock Store (`mockStore.ts`) if offline.
- `/api/health` inspection endpoint returning real-time database connection status.
- Render Cloud Deployment support with `cors({ origin: true, credentials: true })` and `autoSeedIfEmpty()`.

---

## 📁 4. Project Directory Structure Rules
The project MUST be strictly organized into **EXACTLY TWO root directories**:

```text
ethara-seat-management/
├── AI_Prompt.md                  # Master AI System Prompt & Project Specification
├── README.md                     # Project Overview & Setup Guide
├── backend/                      # Backend Express Node.js TypeScript Application
│   ├── src/
│   │   ├── config/               # Database & Mock Store Config
│   │   ├── controllers/          # Request Handler Controllers (auth, employee, project, seat, etc.)
│   │   ├── middleware/           # Auth JWT & Role Verification Middleware
│   │   ├── models/               # Mongoose Data Models
│   │   ├── routes/               # Express API Route Definitions
│   │   ├── seed/                 # Seeding & Auto-Seed Scripts
│   │   ├── services/             # LLM AI Services
│   │   ├── utils/                # Audit Logging Helpers
│   │   └── index.ts              # Express Server Entry Point
│   ├── .env                      # Environment Variables
│   ├── package.json
│   └── tsconfig.json
└── frontend/                     # Frontend React Vite TypeScript Application
    ├── src/
    │   ├── components/           # Navbar, Sidebar, AIChatWidget, GlobalSearchModal
    │   ├── context/              # AuthContext & Session Provider
    │   ├── pages/                # Dashboard, Directory, SeatMap, Projects, NewJoiners, Requests, BulkImport, Login
    │   ├── services/             # Axios API Service Client
    │   ├── types/                # TypeScript Interfaces
    │   ├── App.tsx               # Main Router Layout
    │   ├── index.css             # Tailwind Design System Tokens
    │   ├── main.tsx
    │   └── vite-env.d.ts         # Vite Environment Type Definitions
    ├── package.json
    ├── tailwind.config.js        # Design System Tokens (#FAF7F2, #FBC48B)
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 🔑 5. Verified Demo User Accounts

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@ethara.com` | `Password123!` | Full Admin Rights, Facilities, Approvals, Projects, Audits |
| **HR Lead** | `hr@ethara.com` | `Password123!` | Employee Directory, Add/Edit/Delete Employees, Project Members |
| **Project Manager** | `pm.atlas@ethara.com` | `Password123!` | Team Seating Requests, Project Block Allocations, Member Assignment |
| **Employee (John)** | `emp.john@ethara.com` | `Password123!` | View Seat Map, Request Seat Shift, Profile |
| **Employee (Pooja)** | `pooja@ethara.com` | `Password123!` | View Seat Map, Request Seat Shift, Profile |

---

## 🚀 6. Execution & Build Commands

### Backend Server (`/backend`):
```bash
# Development Server
npm run dev

# Production Build
npm run build

# Seed MongoDB Atlas Database
npx ts-node src/seed/ensureDefaultUsers.ts
```

### Frontend Web Portal (`/frontend`):
```bash
# Development Server
npm run dev

# Production Build
npm run build
```
