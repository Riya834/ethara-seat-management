# AI Usage & Prompt Engineering Log

**Project**: Ethara Seat & Project Allocation Management System  
**Date**: August 13, 2026  

---

## Overview

This log documents the iterative AI prompt engineering, design review, and code validation steps used to build the Ethara Seat & Project Allocation Management System.

---

## Log Entries

### Entry 1: Architecture & Technology Selection
- **Prompt**: *"Build a full-stack Seat & Project Allocation Management System for Ethara (~5,000 employees, multi-floor/zone)..."*
- **AI Action**: Designed monorepo architecture (`/server` Node.js + Express TypeScript + MongoDB Mongoose ORM, `/client` React + Vite + Tailwind CSS + Recharts).
- **Validation**: Verified strict RBAC matrix enforcement at backend route middleware level rather than UI hiding.

### Entry 2: MongoDB Schemas & Performance Indexing
- **Prompt**: *"Define Mongoose schemas for users, employees, projects, floors, zones, seats, seatRequests, and auditLogs with high performance..."*
- **AI Action**: Created Mongoose models with indexes on `employeeId`, `email`, `seatNumber`, `projectId`, `seatId`, `status`, and text search indexes for 5,000+ employees.
- **Validation**: Audited foreign key references (`ref: 'Employee'`, `ref: 'Seat'`, `ref: 'Project'`) to ensure populate operations execute smoothly.

### Entry 3: Strict RBAC & Seat Request Workflow
- **Prompt**: *"Implement middleware that checks role on every mutating endpoint. Admin & HR can assign directly; PMs submit requests for approval..."*
- **AI Action**: Created `authorizeRoles(...roles)` middleware returning `403 Forbidden` if PM attempts direct seat assignment. Created `SeatRequest` workflow controller with auto seat state updates upon approval.
- **Validation**: Added unit test `rbac.test.ts` using Supertest to verify that unauthorized roles receive `403` status.

### Entry 4: AI Assistant Function-Calling Engine
- **Prompt**: *"An LLM-backed chat endpoint that has tool/function access to query the MongoDB collections (RAG-style: real data)..."*
- **AI Action**: Implemented `aiService.ts` with tool functions (`findEmployeeSeat`, `getAvailableSeats`, `getProjectUtilization`, `getNewJoinerStatus`). Built role-scoping inside function execution layer.
- **Validation**: Verified queries like *"Where does Priya Sharma sit?"* and *"How many free seats on Floor 2?"* return exact data from seeded collections.

### Entry 5: Interactive Seat Map & UI Design
- **Prompt**: *"Take reference from the attached dashboard mockups for UI styling..."*
- **AI Action**: Crafted React frontend with light theme, soft rounded cards, color-coded seat boxes (`available`, `occupied`, `reserved`, `maintenance`), floating AI chat drawer, and global search modal.
- **Validation**: Tested click-to-assign modal with live state updates on the seat map.

---

## Acceptance Verification Summary
All components compiled without errors, seed data populated 300+ employees and 360+ seats, RBAC middleware tests passed, and end-to-end role access was validated.
