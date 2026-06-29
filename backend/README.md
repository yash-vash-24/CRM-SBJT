# ⚡ VoltFlow CRM — Backend API Documentation & Architecture Guide

Welcome to the backend of the **VoltFlow CRM (Electrical Contractor CRM)**. This backend is specifically designed for college students and beginners to understand MVC architecture, relational database operations, file uploads, and session-based authentication in Node.js & Express.js.

---

## 📊 Project Status (Mid-Development Stage: ~65-70% Complete)

This project represents a realistic mid-development stage for an internship evaluation:
* **Fully Implemented**: User Authentication (Admins & Clients), Client Management (CRUD), Project Management (CRUD), and SQLite database auto-migration/seeding.
* **In-Progress (Boilerplate placeholders & mock API responses)**: Document Upload, Dashboard Analytics, Notifications, Report Generation, and Search & Filter.

---

## 🏗️ Folder Structure & MVC Architecture

This backend follows the clean **MVC (Model-View-Controller)** pattern. In a backend-only REST API, the **View** is replaced by JSON responses returned to the client.

```text
backend/
├── server.js               # Main entry point (starts Express, registers routes & middlewares)
├── .env                    # Environment variables (port config, database filename)
├── package.json            # Project dependencies and startup scripts
├── config/
│   └── database.js         # SQLite connection, schema runner, and user seeding
├── models/
│   └── schema.sql          # Relational SQL table definitions
├── middleware/
│   ├── auth.js             # Role-Based Access Control (RBAC) & session validation
│   └── upload.js           # Multer file storage & type filtering configuration
├── routes/
│   ├── auth.js             # Auth endpoint mappings (login, logout, me)
│   ├── clients.js          # Client management endpoint mappings (CRUD)
│   ├── projects.js         # Project management endpoint mappings (CRUD)
│   └── documents.js        # Document upload and download endpoint mappings
├── controllers/
│   ├── authController.js   # Parses auth requests & sends HTTP status responses
│   ├── clientController.js # Handles request/response logic for client CRUD
│   ├── projectController.js# Handles request/response logic for projects (with RBAC check)
│   └── documentController.js# Handles uploads, downloads, and disk cleaning for project files
├── services/
│   ├── authService.js      # Core auth logic, password checking, and session token store
│   ├── clientService.js    # Performs client queries on the SQLite database
│   ├── projectService.js   # Performs project queries and SQL JOINs on the database
│   └── documentService.js  # Logs document uploads and fetches document metadata
└── uploads/                # Directory where uploaded documents are stored physically
```

### How Requests Flow Through This Architecture:
```text
Client App / Postman
       │
       ▼
  server.js (Starts Server & Middlewares)
       │
       ▼
  routes/ (Matches URI path)
       │
       ▼
  middleware/auth.js (Checks session tokens and role permissions)
       │
       ▼
  controllers/ (Parses incoming variables & formats JSON output)
       │
       ▼
  services/ (Executes SQL queries and business logic)
       │
       ▼
  config/database.js (SQLite Database Instance)
```

---

## 🔑 Authentication System (Simplified Stateful Sessions)

Instead of using complex **JWT (JSON Web Tokens)**, which involve cryptographic keys, expirations, and signing algorithms, this CRM uses **Stateful In-Memory Sessions**:
1. When a user logs in, the server generates a random string (e.g. `sess_abc123...`).
2. This string is stored in a simple JavaScript object (`activeSessions`) mapped to the user's profile (`{ userId, name, email, role }`).
3. The server sends this token back in the login response.
4. For all subsequent requests, the client includes this token in the `Authorization` header (`Bearer sess_abc123...`).
5. The `verifySession` middleware checks if the token exists in the `activeSessions` map. If found, it attaches the session data to `req.user` and permits the request.

This approach is highly educational because it clearly demonstrates **stateful session tracking** under the hood without hiding it behind heavy library abstractions.

---

## 🗄️ Database Schema & Seeding

The database uses **SQLite3** for simplicity (no server setup, data is stored in a single file `database.sqlite`). 
When you start the server (`npm start`), the database configuration automatically:
1. Opens `database.sqlite` (creating it if it doesn't exist).
2. Executes `models/schema.sql` to establish tables.
3. Checks if an administrator account exists, and if not, automatically seeds a default Admin and Client.

### Database Tables (Relational Design)

1. **`users` Table**: Stores both admin and client credentials.
2. **`projects` Table**: Linked to `users.id` via foreign key `clientId`.
3. **`documents` Table**: Linked to `projects.id` via foreign key `projectId`.

---

## ⚡ REST API Reference

All protected endpoints require the header `Authorization: Bearer <sessionToken>`.

### 1. Authentication Endpoints

#### Admin Login
* **URL:** `POST /api/auth/admin/login`
* **Body:**
  ```json
  {
    "email": "admin@voltflow.com",
    "password": "admin123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "Admin login successful.",
    "sessionToken": "sess_n9x3yv1687948281",
    "user": {
      "id": 1,
      "name": "VoltFlow Admin",
      "email": "admin@voltflow.com",
      "role": "admin",
      "company": "VoltFlow Corp"
    }
  }
  ```

#### Client Login
* **URL:** `POST /api/auth/client/login`
* **Body:**
  ```json
  {
    "email": "client@voltflow.com",
    "password": "client123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "Client login successful.",
    "sessionToken": "sess_8z4s1m1687948312",
    "user": {
      "id": 2,
      "name": "DHBVN Utility Client",
      "email": "client@voltflow.com",
      "role": "client",
      "company": "DHBVN Haryana"
    }
  }
  ```

#### Get Current Session ("Me" Profile)
* **URL:** `GET /api/auth/me`
* **Response (200 OK):**
  ```json
  {
    "user": {
      "userId": 1,
      "name": "VoltFlow Admin",
      "email": "admin@voltflow.com",
      "role": "admin",
      "company": "VoltFlow Corp"
    }
  }
  ```

#### Logout
* **URL:** `POST /api/auth/logout`
* **Response (200 OK):**
  ```json
  {
    "message": "Logout successful."
  }
  ```

---

### 2. Client Management (Admin Only)

#### Get Client List
* **URL:** `GET /api/clients`
* **Response (200 OK):**
  ```json
  [
    {
      "id": 2,
      "name": "DHBVN Utility Client",
      "email": "client@voltflow.com",
      "role": "client",
      "company": "DHBVN Haryana",
      "phone": "987-654-3210",
      "address": "Substation Sector 14, Sirsa",
      "createdAt": "2026-06-29 11:15:30"
    }
  ]
  ```

#### Add Client
* **URL:** `POST /api/clients`
* **Body:**
  ```json
  {
    "name": "New Client Name",
    "email": "newclient@example.com",
    "password": "securepwd123",
    "company": "City Grid Ltd",
    "phone": "555-0199",
    "address": "Sector 9, Panchkula"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "message": "Client created successfully.",
    "client": {
      "id": 3,
      "name": "New Client Name",
      "email": "newclient@example.com",
      "role": "client",
      "company": "City Grid Ltd",
      "phone": "555-0199",
      "address": "Sector 9, Panchkula"
    }
  }
  ```

#### Update Client
* **URL:** `PUT /api/clients/:id`
* **Body:**
  ```json
  {
    "name": "Updated Client Name",
    "email": "newclient@example.com",
    "company": "City Grid Operations",
    "phone": "555-9999",
    "address": "Sector 9, Panchkula",
    "password": "" // Leave empty to keep unchanged, or input to update
  }
  ```

#### Delete Client
* **URL:** `DELETE /api/clients/:id`

---

### 3. Project Management

#### Get Projects List
* **URL:** `GET /api/projects`
* **Access Control:** Admins receive *all* projects. Clients receive *only* projects matching their own ID.
* **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "33KV Substation Commisioning",
      "description": "Erection of transformer poles, breaker panels and earthings.",
      "clientId": 2,
      "status": "in_progress",
      "createdAt": "2026-06-29 11:20:00",
      "updatedAt": "2026-06-29 11:20:00",
      "clientName": "DHBVN Utility Client",
      "clientCompany": "DHBVN Haryana"
    }
  ]
  ```

#### Get Project Details
* **URL:** `GET /api/projects/:id`
* **Access Control:** Admin can fetch details of any project. Clients can only fetch details for their own projects (verified via project's `clientId`).
* **Response (200 OK):**
  ```json
  {
    "id": 1,
    "name": "33KV Substation Commisioning",
    "description": "Erection of transformer poles, breaker panels and earthings.",
    "clientId": 2,
    "status": "in_progress",
    "createdAt": "2026-06-29 11:20:00",
    "updatedAt": "2026-06-29 11:20:00",
    "clientName": "DHBVN Utility Client",
    "clientEmail": "client@voltflow.com",
    "clientCompany": "DHBVN Haryana",
    "clientPhone": "987-654-3210"
  }
  ```

#### Create Project (Admin Only)
* **URL:** `POST /api/projects`
* **Body:**
  ```json
  {
    "name": "Substation Pole Erection",
    "description": "Erection of 100 concrete poles",
    "clientId": 2,
    "status": "pending"
  }
  ```

#### Update Project (Admin Only)
* **URL:** `PUT /api/projects/:id`
* **Body:**
  ```json
  {
    "name": "Substation Pole Erection",
    "description": "Erection of 100 concrete poles",
    "clientId": 2,
    "status": "in_progress"
  }
  ```

#### Delete Project (Admin Only)
* **URL:** `DELETE /api/projects/:id`

---

### 4. Document Management

#### Upload Document (Admin Only)
* **URL:** `POST /api/documents`
* **Headers:** `Content-Type: multipart/form-data`
* **Body (Form-Data):**
  * `projectId`: `1` (Text value)
  * `file`: `[select PDF/Blueprint file]` (File upload field)
* **Response (201 Created):**
  ```json
  {
    "message": "Document uploaded and logged successfully.",
    "document": {
      "id": 1,
      "projectId": 1,
      "name": "substation_drawing.pdf",
      "filename": "16879492102-substation_drawing.pdf",
      "filepath": "/home/yash/Electrical-CRM/backend/uploads/16879492102-substation_drawing.pdf",
      "uploadedBy": 1
    }
  }
  ```

#### Retrieve Project Documents
* **URL:** `GET /api/documents/project/:projectId`
* **Access Control:** Admin can view documents of any project. Clients can only see documents if the project is theirs.
* **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "projectId": 1,
      "name": "substation_drawing.pdf",
      "filename": "16879492102-substation_drawing.pdf",
      "filepath": "/home/yash/Electrical-CRM/backend/uploads/16879492102-substation_drawing.pdf",
      "uploadedBy": 1,
      "uploadedAt": "2026-06-29 11:32:00",
      "uploaderName": "VoltFlow Admin"
    }
  ]
  ```

#### Download Document File
* **URL:** `GET /api/documents/:id/download`
* **Access Control:** Admin can download any document. Clients can only download if the project matches their account.
* **Response:** File attachment stream (triggers save-as dialog in browsers).

#### Delete Document (Admin Only)
* **URL:** `DELETE /api/documents/:id`

---

## 🎓 Internship Evaluation Talking Points (For the Student)

If asked about this backend during an internship evaluation or project viva, the student can use these talking points:

1. **Why Express.js and Node.js?**
   > *"Express is a minimalist web framework for Node.js. It is single-threaded and handles async I/O using an Event Loop, making it highly efficient for standard REST API servers that perform heavy database queries and file transfers."*

2. **Why SQLite over PostgreSQL/MySQL?**
   > *"For development, prototyping, or light applications, SQLite is a zero-configuration, serverless relational database engine. All data is saved in a local file. This eliminates network overhead and simplifies setup, while still supporting standard SQL queries, constraint checks, and foreign key relations."*

3. **Why Custom Session Tokens instead of JWT?**
   > *"JWT is stateless and cryptographically signed, but it is harder to revoke (logout) on demand without keeping a denylist. For simplicity, security, and ease of understanding, I built a stateful session store in-memory. It gives the server full immediate control over revoking tokens on logout, which is more secure and beginner-friendly to debug."*

4. **Explain the SQL Table Joins Used.**
   > *"Instead of making multiple slow database calls, I used SQL JOINs. For example, when fetching projects, I used a LEFT JOIN on the users table (`FROM projects p LEFT JOIN users u ON p.clientId = u.id`) to fetch both the project progress details and the assigned client's company name in a single database round-trip."*

5. **How is File Upload Handled Safely?**
   > *"We use Multer, which parses multipart/form-data. It does two main things for security: first, it filters file extensions using a whitelist (blocking dangerous files like `.exe` or `.js`); second, it generates unique randomized filenames on disk using timestamps to prevent file overwrites. In addition, if a database logging transaction fails after upload, the controller automatically deletes the physical file from disk to prevent storage leaks."*
