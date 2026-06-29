# VoltFlow CRM — Electrical Infrastructure ERP & Project Management System

VoltFlow CRM is a full-featured, enterprise-grade admin dashboard and customer relationship management system specifically tailored for electrical infrastructure contracting firms. Designed for managing utility projects (such as 33/11KV substation commissioning, HT/LT transmission line construction, utility pole erection, and empanelled government works for boards like DHBVN), it integrates CRM, project logging, material inventory control, HR/attendance, and billing in one dashboard.

---

## 📊 Project Status (Mid-Development Stage: ~65-70% Complete)

This project represents an active, mid-development prototype being prepared for internship evaluation. Key core modules are fully implemented with database integration, while advanced modules contain boilerplate placeholders and developer TODO logs.

### ✅ Completed & Fully Functional Features:
- **Authentication**: Admin and Client logins with stateful session support and secure password hashing via `bcryptjs`.
- **Client Management (CRUD)**: Create, view, edit, and delete client company profiles (persisted in SQLite).
- **Project Management**: Create projects, assign clients, and update completion status/milestones.
- **Basic Dashboard**: Dashboard shell displaying project lists.
- **Database Integration**: Auto-migrating and auto-seeding SQLite database file initialization.

### 🚧 Work In Progress (Draft Endpoints & Boilerplates):
- **Document Upload**: Multer uploading works to save files to server disk. Database persistence and security scanning are pending (returning mock responses with TODO logs).
- **Dashboard Analytics**: Exposes mock REST stats on active counts and monthly revenues (SQL COUNT/SUM aggregations pending).
- **Notifications**: Exposes mock alerts endpoint (WebSocket/Socket.io real-time broadcast and DB schema pending).
- **Report Generation**: Exposes mock report download URL (PDFKit compile engine integration pending).
- **Search and Filter**: Controller triggers console logs indicating search variables are received (SQL `LIKE` query parameter filtering pending).

### 🔮 Future Enhancements (Post-Internship Goals):
- [ ] Migrate in-memory session registry to Redis.
- [ ] Deploy Docker containers for Postgres databases.
- [ ] Integrate safety inspector CEIG signoff upload signatures.

---

## ⚡ Technology Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js, SQLite3
- **Database / Infrastructure:** Local SQLite database file with no external database server required
- **Authentication:** In-memory session registry (no complex JWT/OAuth)

---

## 🏗️ System Architecture & Role-Based Access Control (RBAC)

VoltFlow CRM features a simplified, beginner-friendly MVC architecture:
1. **Admin:** Full CRUD access over Client profiles and Project logs, including access to dashboard aggregates.
2. **Client:** Read-only access to view Projects assigned specifically to their account ID.

---

## 📦 System Modules

### 1. Executive Dashboard (`/dashboard`)
An operations cockpit featuring real-time tracking widgets:
- Role-specific card grids (e.g., active projects count, low-stock notifications, outstanding invoice totals).
- Interactive SVG charts showing monthly expenditure distributions.
- Recent activity log stream capturing site actions.

### 2. Public Site & Inquiries (`/`)
A landing page featuring completed/ongoing portfolios, services catalog, and career openings. Includes a **Request a Quote** form connected to the backend API that automatically creates draft files in the Tenders pipeline.

### 3. CRM Client Management (`/dashboard/clients`)
A client register where managers can add and edit client accounts, view active projects, and check total outstanding invoice statements.

### 4. Projects Tracker (`/dashboard/projects`)
A project control sheet allowing supervisors to adjust progress sliders, assign workforce teams, and link invoices and structural blueprints.

### 5. HR & Attendance Terminal (`/dashboard/employees`)
A dual-mode workforce manager:
- **HR Ledger:** Basic employee database tracking designations, contacts, and roles.
- **Attendance Terminal:** Allows supervisors on-site to log daily worker shifts (present/absent) directly back to the database.

### 6. Material Inventory Ledger (`/dashboard/inventory`)
A stock inventory manager tracking electrical components (substation transformers, ACSR conductors, GI poles, insulating cross-arms):
- Live stock counts with low-stock warnings.
- Material ledger tracking additions and withdrawals.

### 7. Tenders Bidding Pipeline (`/dashboard/tenders`)
A tender record ledger for tracking Notice Inviting Tender (NIT) files, submission target dates, and EMD (Earnest Money Deposit) refund ledgers.

### 8. RA Invoicing & Billing (`/dashboard/invoices`)
A billing dashboard supporting RA (Running Account) bills creation, automatic client lookup based on selected project site, and a simulated invoice document layout.

### 9. Document Vault (`/dashboard/documents`)
A file storage portal indexing local drawings, CEIG regulatory inspector approvals, and contracts, filterable by file category and linked project scope.

---

## 🚀 How to Set Up and Run Locally

### 1. Backend Setup (SQLite)
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server (runs on port 5000):
   ```bash
   npm run dev
   ```
   *(Note: The SQLite database file will automatically initialize and seed default admin/client credentials upon server boot!)*

### 2. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js development server (runs on port 3000):
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📤 How to Push this Repository to your GitHub

Since terminal commands for external services are restricted inside the environment sandbox, please run the following commands in your local computer's terminal to upload the code to your GitHub account:

1. **Initialize Git in the project root folder:**
   ```bash
   cd /home/yash/Electrical-CRM
   git init
   ```

2. **Add all files to Git staging:**
   ```bash
   git add .
   ```

3. **Commit the files:**
   ```bash
   git commit -m "Initial commit — VoltFlow Electrical CRM System"
   ```

4. **Create a new repository on GitHub:**
   - Go to [github.com/new](https://github.com/new).
   - Enter `Electrical-Contractor-CRM` or `VoltFlow-CRM` as the repository name.
   - Click **Create repository**.

5. **Link the remote repository and push:**
   ```bash
   git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
   git branch -M main
   git push -u origin main
   ```
