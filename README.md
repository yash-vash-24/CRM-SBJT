<p align="center">
  <h1 align="center">⚡ VoltFlow CRM</h1>
  <p align="center">
    <strong>Enterprise Resource Planning & CRM for Electrical Infrastructure Contractors</strong>
  </p>
  <p align="center">
    <a href="#-quick-start">Quick Start</a> · <a href="#-modules">Modules</a> · <a href="#-api-reference">API Reference</a> · <a href="#-roadmap">Roadmap</a>
  </p>
</p>

---

## 📋 Overview

VoltFlow CRM is a domain-specific ERP system built for electrical infrastructure contracting firms. It consolidates **CRM, project tracking, HR & attendance, material inventory, tender management, invoicing, and document storage** into a single unified dashboard.

**Target Domain** — Utility-scale electrical projects: 33/11 KV substation commissioning, HT/LT transmission lines, utility pole erection, and empanelled government works (DHBVN and similar state electricity boards).

### Key Capabilities

| Capability | Description |
|---|---|
| **Client Management** | Full CRUD lifecycle for client company profiles |
| **Project Tracking** | Progress sliders, workforce assignment, milestone tracking |
| **HR & Attendance** | Employee ledger with daily shift logging (present/absent) |
| **Material Inventory** | Stock counts, low-stock alerts, movement ledger (IN/OUT) |
| **Tender Pipeline** | NIT tracking, submission deadlines, EMD deposit management |
| **RA Invoicing** | Running Account bill creation with auto client lookup |
| **Document Vault** | Indexed file storage for blueprints, contracts, and CEIG approvals |
| **Role-Based Access** | Admin, Supervisor, Client, and Worker permission tiers |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript | Server-side rendering, file-based routing |
| **Styling** | Tailwind CSS 4, Lucide React Icons | Utility-first responsive design |
| **Backend** | Node.js, Express.js 4 | RESTful API server |
| **Database** | SQLite 3 (file-based) | Zero-config relational storage |
| **Auth** | bcryptjs + in-memory session registry | Stateful token-based authentication |
| **DevOps** | Docker Compose (Postgres-ready), Shell scripts | Containerised deployment path |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                        │
│          Next.js 16 App Router · React 19 · TypeScript       │
└──────────────────────┬───────────────────────────────────────┘
                       │  HTTP (REST JSON)
                       │  Port 3000 → Port 5000
┌──────────────────────▼───────────────────────────────────────┐
│                    API SERVER (Express.js)                    │
│                                                              │
│  ┌─────────┐  ┌────────────┐  ┌──────────────────────────┐  │
│  │ Routes  │→ │ Middleware  │→ │      Controllers         │  │
│  │         │  │ (Auth/RBAC) │  │  (Business Logic)        │  │
│  └─────────┘  └────────────┘  └────────────┬─────────────┘  │
│                                             │                │
│                                ┌────────────▼─────────────┐  │
│                                │   SQLite Database Layer   │  │
│                                │   (Auto-migrate & seed)   │  │
│                                └──────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Architectural Pattern — Layered MVC

The backend follows a **Routes → Middleware → Controllers → Database** pipeline:

| Layer | Responsibility | Files |
|---|---|---|
| **Routes** | HTTP verb mapping, parameter validation | `routes/*.js` |
| **Middleware** | Authentication (`verifySession`), RBAC (`requireAdmin`, `requireAdminOrSupervisor`) | `middleware/auth.js` |
| **Controllers** | Business logic, SQL queries, response formatting | `controllers/*.js` |
| **Models** | Schema definitions, auto-migration, seed data | `models/schema.sql`, `config/database.js` |

### Why This Architecture?

- **Zero-config database** — SQLite requires no external server, auto-initialises on first boot, and self-seeds default credentials.
- **Clean separation of concerns** — Each layer has a single responsibility, making the codebase easy to navigate and extend.
- **Role-based middleware chain** — Auth guards are composable and applied declaratively at the route level.
- **Decoupled frontend** — Next.js communicates exclusively via REST, allowing independent deployment and future mobile client integration.
- **Production migration path** — Docker Compose config is pre-configured for PostgreSQL, enabling a seamless transition from SQLite for production deployments.

---

## 📦 Modules

### Frontend Pages

| Route | Module | Description |
|---|---|---|
| `/` | Public Site | Landing page with portfolio, services, careers, and "Request a Quote" form |
| `/login` | Authentication | Role-based login for Admin and Client users |
| `/dashboard` | Executive Dashboard | KPI cards, activity feed, chart widgets |
| `/dashboard/clients` | Client Management | Client company CRUD with invoice summaries |
| `/dashboard/projects` | Project Tracker | Progress tracking, workforce assignment, milestone management |
| `/dashboard/employees` | HR & Attendance | Employee ledger and daily shift attendance logging |
| `/dashboard/inventory` | Material Inventory | Stock register with low-stock alerts and movement logs |
| `/dashboard/tenders` | Tender Pipeline | NIT records, deadline tracking, EMD ledger |
| `/dashboard/invoices` | RA Invoicing | Running Account bill creation and management |
| `/dashboard/documents` | Document Vault | File storage indexed by category and project |

### Backend API Endpoints

| Prefix | Resource | Key Operations |
|---|---|---|
| `/api/auth` | Authentication | Login, logout, session validation |
| `/api/clients` | Clients | CRUD operations (Admin-only write access) |
| `/api/projects` | Projects | CRUD, progress updates, worker assignment |
| `/api/employees` | Employees | CRUD, attendance records |
| `/api/reports` | Reports | Aggregated report generation |
| `/health` | Health Check | Server status and uptime |

---

## 🗄️ Database Schema

9 relational tables with enforced foreign keys (`PRAGMA foreign_keys = ON`):

| Table | Purpose | Key Relationships |
|---|---|---|
| `users` | Authentication & role management (admin, supervisor, client, worker) | — |
| `employees` | HR ledger (designation, salary, attendance) | → `users` |
| `projects` | Utility infrastructure jobs with progress tracking | → `users` (client, supervisor) |
| `project_workers` | Many-to-many project ↔ employee mapping | → `projects`, `employees` |
| `inventory` | Material stock register (8 categories) | — |
| `stock_logs` | Inventory movement audit trail (IN/OUT) | → `inventory` |
| `tenders` | Bidding pipeline with EMD tracking | — |
| `invoices` | RA billing with status lifecycle | → `projects`, `users` |
| `documents` | File metadata (contracts, blueprints, clearances) | → `projects`, `tenders` |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### 1. Backend

```bash
cd backend
npm install
npm run dev          # Starts on http://localhost:5000
```

> The SQLite database auto-initialises and seeds default admin/client credentials on first boot.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev          # Starts on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

### Docker (Optional — PostgreSQL)

```bash
docker-compose up -d     # Starts PostgreSQL 15 on port 5432
```

---

## 📁 Project Structure

```
VoltFlow-CRM/
├── backend/
│   ├── config/              # Database connection & initialisation
│   ├── controllers/         # Business logic (auth, clients, projects, employees, reports)
│   ├── middleware/           # Authentication & RBAC guards
│   ├── models/              # SQL schema definitions
│   ├── routes/              # Express route handlers
│   ├── services/            # Service layer utilities
│   ├── uploads/             # File upload directory
│   └── server.js            # Application entry point
├── frontend/
│   └── src/
│       ├── app/             # Next.js App Router pages & layouts
│       └── context/         # React context providers
├── docker-compose.yml       # PostgreSQL container config
└── start_dev.sh             # Development startup script
```

---

## 🗺️ Roadmap

- [ ] Migrate session storage from in-memory to Redis
- [ ] Complete PostgreSQL migration with Docker deployment
- [ ] Wire dashboard analytics with live SQL aggregations
- [ ] Integrate real-time notifications via WebSocket
- [ ] Add PDF report generation with PDFKit
- [ ] Implement full-text search with parameterised SQL filtering
- [ ] Add CEIG inspector digital signoff workflow

---

## 📄 License

This project is proprietary software developed for internal use.

---

<p align="center">
  Built with ⚡ for the electrical infrastructure industry
</p>
