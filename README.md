# Ethara - Seat & Project Allocation Management System

Ethara is an enterprise-grade full-stack workplace allocation system engineered for companies with ~5,000 employees spread across multi-floor and multi-zone corporate facilities.

## Key Features

1. **Strict Role-Based Access Control (RBAC)**:
   - Middleware enforced at the API layer for **Admin**, **HR**, **Project Manager (PM)**, and **Employee** roles.
   - PMs submit seat request tickets; Admins and HR review and approve. Direct seat allocations by PMs are blocked with `403 Forbidden`.

2. **Interactive Visual Seat Map**:
   - Color-coded seat grid layout (`available`, `occupied`, `reserved`, `maintenance`).
   - Click to inspect occupant profiles, perform direct assignment/release (Admin/HR), or trigger a seat transfer request (PM).

3. **Global Search & Real-time Lookup**:
   - Instant search modal across 5,000+ records for employee name, ID (e.g. `ETH-00234`), designation, or seat number (`F1-ZA-001`).

4. **AI Workplace Assistant (RAG Tool Engine)**:
   - Natural language query endpoint (`POST /api/ai/query`) powered by MongoDB tool executions.
   - Handles queries like:
     - *"Where does Priya Sharma sit?"*
     - *"How many free seats on Floor 2?"*
     - *"What's the utilization for Project Atlas?"*
     - *"Has the new joiner starting Monday been allocated a seat?"*
   - Role-scoped: employee queries return public seating info while redacting sensitive employee fields.

5. **Bulk CSV Import with Dry-Run Validation**:
   - Multer & PapaParse ingestion supporting dry-run tests and row-level error reporting (duplicate IDs, missing fields, invalid project codes).
   - Downloadable sample CSV template.

6. **New Joiner SLA Tracking**:
   - Dashboard alert widgets highlighting onboarding new joiners with pending seat allocation beyond SLA threshold (> 3 days).

---

## Technical Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide Icons, React Router DOM, Axios.
- **Backend**: Node.js, Express (TypeScript), REST API.
- **Database**: MongoDB Atlas (Cloud-hosted) / Mongoose ORM with performance indexes.
- **Authentication**: JWT tokens (Access + Refresh), bcrypt password hashing, RBAC middleware.
- **Testing**: Jest + Supertest test suite.

---

## Quick Start & Local Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URI or Local MongoDB instance (`mongodb://127.0.0.1:27017/ethara_seat_db`)

### 1. Backend Setup & Seeding

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and set MONGODB_URI
cp .env.example .env

# Run database seed script (Populates 300+ employees, 4 floors, 12 zones, 360+ seats, 6 projects)
npm run seed

# Run server in development mode
npm run dev
```

The server will start on `http://localhost:5000`.

### 2. Frontend Setup

```bash
# Navigate to client
cd client

# Install dependencies
npm install

# Run Vite development server
npm run dev
```

The frontend will run on `http://localhost:3000`.

---

## Default Test Login Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ethara.com` | `Password123!` | Full control: Direct seat allocation, employee deletion, project creation, bulk import, requests inbox, analytics |
| **HR** | `hr@ethara.com` | `Password123!` | Full seat allocation, project creation, employee creation, bulk import, requests inbox approval |
| **PM** | `pm.atlas@ethara.com` | `Password123!` | View project scope & directory, submit seat requests for team members, view analytics |
| **Employee** | `emp.john@ethara.com` | `Password123!` | View self profile, interactive seat map lookup, AI assistant (scoped) |

---

## Automated Tests

Run Jest & Supertest API tests for RBAC enforcement and seat allocation logic:

```bash
cd server
npm test
```

---

## Folder Structure

```
ethara-seat-management/
├── server/
│   ├── src/
│   │   ├── config/          # DB connection & configs
│   │   ├── models/          # User, Employee, Project, Floor, Zone, Seat, SeatRequest, AuditLog
│   │   ├── middleware/      # Authentication & RBAC middleware
│   │   ├── controllers/     # REST API logic for all features
│   │   ├── routes/          # Express route declarations
│   │   ├── services/        # AI function-calling engine, CSV parser
│   │   ├── utils/           # Audit logger
│   │   └── seed/            # Comprehensive MongoDB seed script
│   ├── tests/               # Jest & Supertest test suite
│   ├── .env.example
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── components/      # Sidebar, Navbar, Search Modal, AI Chat Widget
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Dashboard, Directory, SeatMap, Projects, NewJoiners, Requests, BulkImport, Login
│   │   ├── services/        # Axios API client
│   │   └── types/           # TypeScript interfaces
│   ├── .env.example
│   └── package.json
│
├── README.md
└── AI_USAGE_LOG.md
```
