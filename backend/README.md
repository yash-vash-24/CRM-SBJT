# ⚡ VoltFlow CRM — Simplified Backend API Documentation & Architecture Guide

Welcome to the backend of the **VoltFlow CRM (Electrical Contractor CRM)**. This backend has been redesigned specifically for college students and beginners to understand MVC architecture, relational database operations, and session-based authentication in Node.js & Express.js.

---

## 🏗️ Folder Structure & MVC Architecture

This backend follows the clean **MVC (Model-View-Controller)** pattern:
- **Model**: Defined by `/models/schema.sql` (defining database tables) and managed via `/services/` files (which handle raw database queries).
- **View**: Since this is a REST API, the "View" is represented by JSON payloads returned directly to the client.
- **Controller**: Code in `/controllers/` files intercepts requests, validates input parameters, and returns responses.
- **Routes**: Code in `/routes/` files maps URL paths to controller actions.

```
backend/
├── server.js            # Entry point for the server
├── package.json         # Node.js dependencies and run scripts
├── .env                 # Port and database configuration variables
│
├── config/
│   └── database.js      # SQLite connection & database seeder
│
├── middleware/
│   └── auth.js          # In-memory session auth & admin check
│
├── models/
│   └── schema.sql       # SQL script defining users and projects
│
├── routes/
│   ├── authRoutes.js    # Routes for admin/client login and sessions
│   ├── clientRoutes.js  # CRUD routes for client company profiles
│   └── projectRoutes.js # CRUD routes for electrical projects & stats
│
├── controllers/
│   ├── authController.js   # Controllers for logins/logout
│   ├── clientController.js # Controllers for client CRUD operations
│   └── projectController.js# Controllers for project CRUD & dashboard stats
│
└── services/
    ├── authService.js    # Services for credentials checks and session management
    ├── clientService.js  # Services for raw Client SQL database operations
    └── projectService.js # Services for raw Project SQL database operations & counts
```

---

## 💾 Relational Database Schema (SQLite)

The database consists of **two tables** linked by a foreign key relationship:

### 1. `users` Table
* Stores account details for both **Admins** and **Clients**.
* Role-Based Access is determined by the `role` field.
* Fields:
  * `id` (INTEGER, Primary Key, Auto-increment)
  * `name` (TEXT, Not Null)
  * `email` (TEXT, Not Null, Unique)
  * `password` (TEXT, Not Null, Hashed via bcrypt)
  * `role` (TEXT, Check: either 'admin' or 'client')
  * `company` (TEXT, Client company name)
  * `phone` (TEXT)
  * `createdAt` (DATETIME, Defaults to current timestamp)

### 2. `projects` Table
* Stores electrical infrastructure projects.
* Fields:
  * `id` (INTEGER, Primary Key, Auto-increment)
  * `name` (TEXT, Not Null)
  * `description` (TEXT)
  * `clientId` (INTEGER, Foreign Key referencing `users(id)`, Nullable on Client delete)
  * `status` (TEXT, Check: 'pending', 'in_progress', 'completed')
  * `createdAt` (DATETIME, Defaults to current timestamp)

---

## ⚡ API Endpoint Reference

All protected endpoints require an `Authorization` header containing the session token.

### 1. Authentication (`/api/auth`)
* `POST /login/admin`: Log in as an administrator.
  * Request Body: `{ "email": "admin@voltflow.com", "password": "admin123" }`
* `POST /login/client`: Log in as an assigned client.
  * Request Body: `{ "email": "client@voltflow.com", "password": "client123" }`
* `POST /logout`: Invalidates the session token.
* `GET /me`: Returns the logged-in user profile.

### 2. Client Management (`/api/clients`)
* `GET /`: Lists all client users (Admin/Client).
* `GET /:id`: Retrieves details of a specific client (Admin/Client).
* `POST /`: Registers a new client company (Admin only).
  * Request Body: `{ "name": "...", "email": "...", "password": "...", "company": "...", "phone": "..." }`
* `PUT /:id`: Modifies client details (Admin only).
* `DELETE /:id`: Removes a client profile (Admin only).

### 3. Project Management (`/api/projects`)
* `GET /`: Lists projects (Clients only see their own projects, Admins see all).
* `GET /:id`: Retrieves details of a project (Admin/Client).
* `POST /`: Creates a new project (Admin only).
  * Request Body: `{ "name": "...", "description": "...", "clientId": 1 }`
* `PATCH /:id/status`: Modifies completion status (Admin only).
  * Request Body: `{ "status": "in_progress" }`
* `GET /dashboard/stats`: Returns Simple Dashboard aggregates (`totalClients`, `totalProjects`).

---

## 🎓 Internship Evaluation Talking Points (Viva Preparation)

Be prepared to answer these questions during your evaluation:
1. **How is Authentication implemented?**
   *"We use a custom, stateful session dictionary in memory. When a user logs in, we verify their credentials against SQLite using `bcryptjs` for security. If valid, we generate a unique session token string, map it to the user object in memory, and send it back to the client. Subsequent requests check the authorization header against our session dictionary."*
2. **What happens if a Client is deleted?**
   *"In `projects` table schema, we defined `clientId INTEGER FOREIGN KEY REFERENCES users(id) ON DELETE SET NULL`. If a client is deleted, all their projects will remain in the database, but their `clientId` will automatically be set to `NULL` (marking them as unassigned). This prevents data loss and orphan project rows."*
3. **What is the MVC request flow?**
   *"A request hits `server.js` -> goes to matching router in `routes/` -> passes through `middleware/auth.js` -> executes the controller function in `controllers/` -> controller triggers database logic in `services/` -> service runs SQL queries on SQLite via `config/database.js` -> results return back to the controller, which formats and sends a JSON response."*
