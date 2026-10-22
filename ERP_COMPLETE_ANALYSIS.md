# FORENSIC ARCHITECTURAL AUDIT & COMPLETE SYSTEM ANALYSIS
## INDUSTRIAL ERP (WORKFORCE MANAGEMENT, OPERATIONS & ACCOUNTING)
**Audit Mode:** READ-ONLY / FORENSIC ANALYSIS (NO CODE OR DATABASE MODIFICATIONS)  
**Target Environment:** Local Windows Workspace  
**Date of Audit:** October 2, 2026  
**Audited Entities:** Backend API (`backend/`), React Frontend (`ERP_frontend-master/`), Primary Database (`erpprod2025`), Biometric Database (`dmps`)

---

## 1. EXECUTIVE SUMMARY

### 1.1 System Overview
The audited ERP system is an enterprise operations, workforce management, and accounting platform engineered specifically for industrial contracting, plant maintenance, and site operations (deployed for VEW / Visital Projects). The application manages the end-to-end operational lifecycle:
1. **Human Resource Management (HRM):** Employee records, statutory documents, company policies, designations, departments, and plant/site assignments.
2. **Time & Attendance Tracking:** Integration with physical biometric punching devices (via an intermediary `dmps` database), automated daily synchronization, manual regularizations, shifts, holidays, and automated 23:59 IST absence marking.
3. **Payroll & Compensation:** Complex multi-component salary breakdown (Basic, HRA, DA, Special Allowance, Food Allowance, Site/Working Zone allowances, Overtime, PF, ESIC, PT, TDS, and advances) with PDF payslip generation and Excel banking export.
4. **Site & Branch Accounting:** Distributed petty cash wallets per site/branch, fund request workflows, transaction ledgers, vendor management, GST/Non-GST purchase tracking, debit notes, and payment approvals.
5. **Billing & Invoicing:** Sales billing, Proforma invoicing, client management, GST tax itemization, payment tracking, and work order/purchase order execution.

### 1.2 System Origin & Evolution
A deep forensic scan of the database schema (260 total tables) and code patterns reveals that the platform originated from a commercial multi-tenant Laravel SaaS boilerplate (specifically CodeCanyon ERPGo / WorkDo SaaS stack). Evidence includes:
- Remnant tables: `personal_access_tokens` (Laravel Sanctum), `failed_jobs`, `ch_messages` / `ch_favorites` (Chatify messenger), `form_builders`, `plans`, `plan_requests`, `coupons`, `deals`, `leads`, and `pipelines`.
- 135 out of 260 database tables have no active Sequelize models and are completely orphaned from the current Node.js runtime.
- The active core was re-implemented into an **Express.js 5.1.0** backend paired with a **React 18.3.1 (Vite 7.0.4)** Single Page Application (SPA), using Sequelize 6.37.7 to query the legacy MySQL database.

### 1.3 Key Audit Findings & Critical Risk Summary
| Dimension | Rating | Key Finding |
| :--- | :--- | :--- |
| **Security** | 🔴 **HIGH RISK** | Hardcoded JWT fallback secret in production; 10-year token expiration (`3650d`); in-memory refresh token array; 28 unauthenticated CRUD endpoints; public static directory exposing employee IDs and salary slips. |
| **Architecture** | 🟡 **NEEDS ATTENTION** | Complete absence of a service layer (`services/` does not exist in backend); massive monolithic controllers (`payslip.controller.js` is 301 KB; `employee.controller.js` is 157 KB); duplicate route mounts and double middleware in `server.js`. |
| **Database Design** | 🟡 **NEEDS ATTENTION** | 260 tables in MySQL, but only 128 mapped to models; 135 orphaned legacy tables; only 45 foreign keys across 260 tables; relational integrity maintained purely in code; 11 model discrepancies. |
| **Performance** | 🟡 **NEEDS ATTENTION** | Duplicate database queries in authentication/authorization middleware (4 DB queries per request); N+1 sequential loops in salary and attendance processing; cron job running every 60 seconds with stdout spam. |
| **Code Quality** | 🟡 **NEEDS ATTENTION** | Dead code, commented-out legacy blocks, reference error in `auth.controller.js` (`db is not defined` in `updateProfile`), redundant dependencies (7 PDF libraries, 2 Excel libraries, 5 icon sets). |
| **Deployment** | 🔴 **HIGH RISK** | No Docker configuration; no CI/CD pipelines; no database migration files; database changes depend on ad-hoc manual SQL execution. |


---

## 2. COMPLETE PROJECT STRUCTURE

### 2.1 High-Level Directory Layout
```
ERP Frontend/ (Workspace Root: d:\New folder\New folder\ERP Frontend)
├── backend/                                  # ACTIVE Backend Express 5 REST API Application
│   ├── config/                              # Database and Company configuration
│   ├── controllers/                         # 128 Controller files (Core Business Logic)
│   ├── cron/                                # Background scheduled cron jobs (node-cron)
│   ├── excel/                               # Generated Excel temporary exports
│   ├── invoices/                            # Generated PDF invoice documents
│   ├── middlewares/                         # Auth, Role, File Upload, and API Key middlewares
│   ├── models/                              # 133 Sequelize Model definitions
│   ├── node_modules/                        # Backend NPM dependencies
│   ├── public/                              # Static public assets and generated reports
│   ├── routes/                              # 126 Express Route files
│   ├── Template/                            # HTML/EJS Invoice templates for Puppeteer/PDFKit
│   ├── uploads/                             # Persistent file upload storage (avatars, docs, etc.)
│   ├── utils/                               # Salary breakdown, dayjs helpers, invoice utils
│   ├── workers/                             # Background worker processes (Biometric Sync)
│   ├── .env                                 # Backend environment variables
│   ├── .htaccess                            # Apache rewrite rules (Legacy cPanel deployment)
│   ├── 2oct.zip                             # [BACKUP/LEGACY] 1.07 GB full backup archive
│   ├── app.js                               # [UNUSED/DEAD] 0-byte empty file
│   ├── local-credit.json                    # Temporary scratch data file
│   ├── package.json                         # Backend project metadata & dependencies
│   ├── package-lock.json                    # Backend dependency lockfile
│   ├── server.js                            # Backend application entry point (Express HTTP server)
│   └── yarn.lock                            # Secondary lockfile from yarn usage
├── ERP_frontend-master/                     # ACTIVE Frontend Single Page Application (React + Vite)
│   ├── dist/                                # Production Vite build output folder
│   ├── node_modules/                        # Frontend NPM dependencies
│   ├── public/                              # Static public assets (favicons, icons)
│   ├── src/                                 # React application source code
│   │   ├── assets/                          # Static images, icons, logos, illustrations
│   │   ├── components/                      # Shared reusable UI components (modals, tables, forms)
│   │   ├── css/                             # Custom CSS and stylesheets
│   │   ├── features/                        # Domain feature modules (Accounting, HRM, Users, Reports)
│   │   ├── hooks/                           # Custom React hooks
│   │   ├── layouts/                         # Layout wrappers (AdminLayout, AuthLayout)
│   │   ├── redux/                           # Redux Toolkit store and feature slices
│   │   ├── services/                        # Axios API client and 60+ modular API service files
│   │   ├── utils/                           # Client-side formatting, date utilities, helpers
│   │   ├── App.jsx                          # Main routing tree and route definitions
│   │   ├── config.js                        # Client configuration constants
│   │   ├── i18n.js                          # Internationalization configuration (i18next)
│   │   ├── index.css                        # Global CSS resets and custom styling
│   │   └── main.jsx                         # Frontend application entry point (ReactDOM root)
│   ├── .env                                 # Frontend Vite environment variables
│   ├── dist.rar                             # [LEGACY/BACKUP] 1.82 MB zipped production build
│   ├── dist1.rar                            # [LEGACY/BACKUP] 1.81 MB zipped production build
│   ├── dist3.rar                            # [LEGACY/BACKUP] 1.82 MB zipped production build
│   ├── eslint.config.js                     # ESLint flat configuration file
│   ├── index.html                           # Single Page Application HTML root
│   ├── log                                  # [TEMP] Build/runtime log text file (30 KB)
│   ├── package.json                         # Frontend project metadata & dependencies
│   ├── package-lock.json                    # Frontend dependency lockfile
│   └── vite.config.js                       # Vite bundler configuration
├── db_backups/                              # Database SQL Dumps & Backups
│   └── erpprod2025_backup_before_import_2026-08-28T10-16-50-848Z.sql  # 24.9 MB SQL dump
├── erpprod2025 (1).sql                      # [BACKUP/DUMP] 25.5 MB active database SQL export
└── .gitignore                               # Git ignore configuration
```

### 2.2 Directory Classification & Active Status
| Directory / File | Category | Status | Runtime Reference / Purpose |
| :--- | :--- | :--- | :--- |
| `backend/` | Backend Application | **ACTIVE** | Core REST API executed via `npm run start` (`node server.js`). Handles business logic, authentication, and database access. |
| `backend/server.js` | Backend Entry Point | **ACTIVE** | Main HTTP server startup; mounts middlewares, static paths, cron, and 59 API route namespaces. |
| `backend/models/` | ORM Models | **ACTIVE** | 133 Sequelize model files defining MySQL schema mappings and relationships. |
| `backend/controllers/` | Controller Layer | **ACTIVE** | 128 Controller files handling HTTP requests, query construction, and PDF/Excel generation. |
| `backend/routes/` | Route Handlers | **ACTIVE** | 126 Route definition files mounted onto Express routers. |
| `backend/cron/` | Scheduled Tasks | **ACTIVE** | Loaded directly in `server.js` line 17 (`require("./cron/autoAbsent.cron")`). Runs every minute. |
| `backend/workers/` | Asynchronous Workers | **ACTIVE (STANDALONE)** | `biometricSync.worker.js` polled via `npm run sync:biometric` or `npm run start:all`. |
| `backend/uploads/` | Static Storage | **ACTIVE** | Stores user avatars, employee KYC documents, company policies, and receipts. Static-served via `/uploads`. |
| `backend/excel/` | Transient Storage | **ACTIVE** | Destination directory for temporary Excel report outputs generated by `exceljs` and `xlsx`. |
| `backend/invoices/` | Transient Storage | **ACTIVE** | Destination directory for generated PDF bills and work orders. Static-served via `/invoices`. |
| `backend/app.js` | Dead Code | **OBSOLETE** | 0-byte empty file. Unreferenced by any script or module. |
| `backend/2oct.zip` | Backup Archive | **OBSOLETE / SAFE TO REMOVE** | 1.07 GB full directory zip archive sitting directly in backend root. Wastes storage. |
| `backend/.htaccess` | Web Server Config | **LEGACY** | Apache rewrite rules from a previous shared hosting/cPanel setup. Inactive under Node.js runtime. |
| `ERP_frontend-master/` | Frontend Application | **ACTIVE** | React SPA executed via `npm run dev` (`vite`) on `http://localhost:5173`. |
| `ERP_frontend-master/src/` | React Source | **ACTIVE** | Source tree containing 111 pages/routes, Redux slices, Axios services, and UI components. |
| `ERP_frontend-master/dist*.rar` | Build Archives | **OBSOLETE / SAFE TO REMOVE** | `dist.rar`, `dist1.rar`, `dist3.rar` are legacy build backups stored in version control root. |
| `erpprod2025 (1).sql` | Database Dump | **STATIC BACKUP** | 25.5 MB full SQL dump of the production database created during prior database migrations. |
| `db_backups/` | Database Backups | **STATIC BACKUP** | Contains dated pre-import SQL dump from August 28, 2026 (24.9 MB). |

---

## 3. ACTIVE APPLICATIONS

### 3.1 Backend Application (`backend/`)
- **Directory Path:** `d:\New folder\New folder\ERP Frontend\backend`
- **Framework:** Express.js 5.1.0
- **Node.js Compatibility:** CommonJS (`"type": "commonjs"`), tested and running on Node v20+ / v25+
- **Package Manager:** npm (with companion `package-lock.json`)
- **Entry Point:** `server.js` (File: [server.js](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/server.js#L1-L334))
- **Start Command:** `npm run start` (`node server.js`)
- **Combined Start Command:** `npm run start:all` (`concurrently "npm run start" "npm run sync:biometric"`)
- **Active Port:** `3004` (configured via `PORT=3004` in `backend/.env`; fallback is `3306` in code)
- **Middleware Chain:**
  1. `cors()` (CORS with permissive wildcard origin)
  2. `express.json()` & `express.urlencoded({ extended: true })`
  3. Static file handlers (`/uploads`, `/reports`, `/excel`, `/invoices`)
  4. Authentication middleware (`middlewares/auth.middleware.js`)
  5. Permission authorization middleware (`middlewares/authorize.js`)
  6. Biometric API key validation (`middlewares/biometricApiKey.js`)
  7. Multer file streaming middleware (`middlewares/upload.middleware.js`)
- **Authentication Mechanism:** JSON Web Token (JWT) with HMAC SHA-256 signature verification.
- **Authorization Mechanism:** Role-Based Access Control (RBAC) checking permissions assigned to the user's role in MySQL.

### 3.2 Frontend Application (`ERP_frontend-master/`)
- **Directory Path:** `d:\New folder\New folder\ERP Frontend\ERP_frontend-master`
- **Framework:** React 18.3.1 (Single Page Application)
- **Build Tool / Bundler:** Vite 7.0.4 (ESM module loader)
- **Entry Point:** `src/main.jsx` mounting onto `index.html`
- **Development Command:** `npm run dev` (`vite`)
- **Production Build Command:** `npm run build` (`vite build`)
- **Active Port:** `5173` (`http://localhost:5173`)
- **Routing System:** React Router v7 (`react-router-dom` 7.7.1) using browser history routing with nested layouts and route guards (`PrivateRoute.jsx`, `PermissionWith.jsx`).
- **State Management:** Redux Toolkit (`@reduxjs/toolkit` 2.8.2) + React-Redux (`react-redux` 9.2.0) with modular feature slices:
  - `authSlice.js`: User authentication token, user object, role, permissions.
  - `hrmSlice.js`: Employee master states and lists.
  - `attendanceSlice.js`: Attendance registers, logs, and filter states.
  - `salarySlice.js` & `allowanceSlice.js`: Compensation rules and wage breakdowns.
  - `roleSlice.js` & `userSlice.js`: User and role permissions cache.
- **UI Frameworks:** Ant Design (`antd` 5.26.7) combined with React-Bootstrap (`react-bootstrap` 2.10.10 / `bootstrap` 5.3.7).
- **CSS Framework:** SCSS / CSS Modules (`sass` 1.89.2) and vanilla CSS (`index.css`).
- **API Communication Layer:** Centralized Axios instance (`src/services/apiClient.js`) configured with baseURL `http://localhost:3004/api` and automated request/response interceptors.

---

## 4. TECHNOLOGY STACK

### 4.1 Backend Technology Inventory
| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | v20+ / v25+ | Asynchronous server-side JavaScript engine |
| **HTTP Server** | Express.js | `^5.1.0` | Web application framework and REST API routing |
| **ORM** | Sequelize | `^6.37.7` | Object-relational mapping for MySQL schema and relations |
| **Database Driver** | mysql2 | `^3.14.2` | High-performance MySQL client library |
| **Authentication** | jsonwebtoken | `^9.0.2` | Cryptographic JWT creation and decoding |
| **Password Hashing** | bcrypt & bcryptjs | `^6.0.0` / `^3.0.2` | Salted one-way password hashing (rounds: 10) |
| **File Uploads** | multer | `^2.0.2` | Multipart/form-data handler for disk-stored file uploads |
| **Job Scheduling** | node-cron | `^4.2.1` | Background cron scheduler for periodic tasks |
| **Process Orchestration** | concurrently | `^9.2.1` | Simultaneous execution of API server and biometric worker |
| **PDF Generation (Bloat)**| puppeteer / puppeteer-core | `^24.20.0` | Headless Chromium rendering for complex invoices and payslips |
| | html-pdf & html-pdf-node | `^3.0.1` / `^1.0.8` | Legacy HTML to PDF converters |
| | pdfkit & pdf-lib | `^0.17.2` / `^1.17.1` | Direct PDF document manipulation and stream generation |
| | phantomjs-prebuilt | `^2.1.16` | **DEPRECATED / ABANDONED** headless browser wrapper |
| **Spreadsheets** | exceljs & xlsx | `^4.4.0` / `^0.18.5` | Excel generation, styling, and parsing |
| **Templating** | ejs | `^3.1.10` | HTML templating for invoice and voucher templates |
| **HTTP Client** | axios | `^1.12.2` | Outbound HTTP requests |

### 4.2 Frontend Technology Inventory
| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Core Framework** | React | `^18.3.1` | Declarative component UI framework |
| **DOM Renderer** | React DOM | `^18.3.1` | DOM binding for React |
| **Build Tool** | Vite | `^7.0.4` | Modern native-ESM dev server and Rollup production bundler |
| **Router** | React Router DOM | `^7.7.1` | Client-side routing with nested routes and guards |
| **Global State** | Redux Toolkit | `^2.8.2` | Predictable global state management |
| **HTTP Client** | Axios | `^1.11.0` | Promise-based HTTP client with interceptors |
| **UI Component Library**| Ant Design (antd) | `^5.26.7` | Enterprise UI widgets (tables, modals, selects, drawers) |
| **Grid / Layout** | React-Bootstrap / Bootstrap | `^2.10.10` / `^5.3.7` | Grid layouts, utility classes, and responsive styling |
| **Forms & Validation** | Formik & Yup | `^2.4.6` / `^1.7.0` | Form state management and schema validation |
| **Calendar System** | FullCalendar | `^6.1.18` | Dynamic monthly/weekly scheduling & attendance view |
| **Charts & Analytics** | Recharts | `^3.1.2` | SVG-based charting for dashboards and HR metrics |
| **Notifications** | React Toastify | `^11.0.5` | Global toast notifications for success/error handling |
| **Drag & Drop** | @dnd-kit (core, sortable) | `^6.3.1` / `^10.0.0` | Kanban board and drag-and-drop file organization |
| **Internationalization**| i18next / react-i18next | `^25.3.2` / `^15.6.0` | Multi-language localization framework |
| **Date Manipulation** | Moment.js | `^2.30.1` | Date parsing, formatting, and duration math |
| **Icon Ecosystem (Bloat)**| Tabler Icons, Feather, FontAwesome, Lucide, Bootstrap Icons, React Icons | Multiple | 6 distinct icon packages loaded simultaneously in bundle |

---

## 5. BACKEND COMPLETE ARCHITECTURE

### 5.1 Request Lifecycle & Execution Trace
```
Client HTTP Request (Browser / Postman / Mobile)
   ↓
[Express 5 Server] (server.js:332)
   ↓
[Global Middleware Layer]
   ├── CORS Filter (server.js:12, 117)
   ├── Body Parsers: express.json(), express.urlencoded() (server.js:13, 14, 131)
   └── Static Asset Handlers: /uploads, /reports, /excel, /invoices (server.js:125-128)
   ↓
[Route Dispatcher] (routes/*.routes.js)
   ├── 59 Mounted Route Namespaces in server.js (655 total endpoints)
   ↓
[Security & Policy Middleware]
   ├── auth.middleware.js (Decodes JWT, fetches User & Role from MySQL)
   ├── authorize.js (Checks permission string, re-fetches User & Role from MySQL)
   └── biometricApiKey.js (Validates x-api-key for ingest endpoint)
   ↓
[Controller Layer] (controllers/*.controller.js - 128 controllers)
   ├── Direct Business Logic Execution
   ├── Input extraction & manual validation
   ├── Complex calculation (salary breakdowns, tax brackets, wallet sums)
   ├── File generation (Puppeteer PDF, ExcelJS export)
   └── Direct Sequelize ORM Query Construction
   ↓
[Sequelize 6 ORM Layer] (models/*.model.js - 133 models)
   ├── erpDB (Sequelize instance for 'erpprod2025' pool max: 10)
   └── dmpsDB (Sequelize instance for 'dmps' pool max: 5)
   ↓
[MySQL Database Engine]
   ├── erpprod2025 (260 tables)
   └── dmps (1 table: devicelogs)
   ↓
[HTTP Response Serialization]
   └── res.status(200).json({ success: true, data: ... })
```

### 5.2 Server Startup Sequence
1. `require('dotenv').config()` loads configuration from `backend/.env`.
2. Core modules (`express`, `cors`, `path`) are instantiated.
3. First middleware pass: `app.use(cors())`, `app.use(express.json())`, `app.use(express.urlencoded({ extended: true }))` ([server.js:12-14](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/server.js#L12-L14)).
4. Cron job initialized: `require("./cron/autoAbsent.cron")` starts the background task ticking every minute ([server.js:17](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/server.js#L17)).
5. Second middleware pass: `app.use(cors({ origin: '*', credentials: true }))` and second `app.use(express.json())` ([server.js:117-131](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/server.js#L117-L131)).
6. Static directory mounts: `/uploads`, `/reports`, `/excel`, `/invoices`.
7. Route loading: 59 individual `app.use('/api/...', routeHandler)` statements register 655 REST API endpoints.
8. Model associations: Only 3 models (`SaleBill`, `SaleBillPayment`, `Branch`) execute their `associate()` hook ([server.js:317-328](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/server.js#L317-L328)).
9. Server binds to `PORT` (`process.env.PORT || 3306`) and listens for incoming TCP traffic.
10. **CRITICAL ARCHITECTURAL FLAW:** No global Express error handler (`app.use((err, req, res, next) => ...)`) is registered at the bottom of `server.js`. Express 5 falls back to default HTML error dumping.

### 5.3 Absence of a Service Layer
A prominent architectural weakness of the backend is the **complete absence of a `services/` directory**:
- In standard enterprise Node.js architectures, controllers handle HTTP mapping, services contain domain logic, and repositories/models handle data persistence.
- In this project, all domain logic, math, multi-table queries, transaction rollbacks, PDF layout calculations, and Excel exports are crammed directly inside controller functions.
- Consequence: Extreme file bloat:
  - `backend/controllers/payslip.controller.js`: **301.2 KB** (7,500+ lines of monolithic salary calculation, allowance iterations, deduction logic, and PDF rendering).
  - `backend/controllers/employee.controller.js`: **157.8 KB** (3,800+ lines of employee creation, KYC document saving, salary linking, and user account creation).
  - `backend/controllers/setSalary.controller.js`: **104.5 KB** (salary structure configurations).
  - `backend/controllers/creditPurchase.controller.js`: **85.4 KB** (GST purchases, wallet debits, vendor lookups).

---

## 6. FRONTEND COMPLETE ARCHITECTURE

### 6.1 React SPA Architecture & Component Hierarchy
```
[index.html]
   ↓
[main.jsx] (React 18 createRoot)
   ↓
[Redux Provider] (store.js - provides global state to all components)
   ↓
[BrowserRouter] (React Router DOM v7)
   ↓
[App.jsx] (Central Route Table - 111 declared routes)
   ├── Public Routes: /login, /register, /forgot-password
   └── Protected Routes: Wrapped by <PrivateRoute>
         ↓
      [AdminLayout.jsx] (Persistent Sidebar, Header, User Menu, Content Area)
         ↓
      [PermissionWith] (Route Guard verifying user.permissions contains required key)
         ↓
      [Page Feature Component] (e.g. Branchwallet.jsx, CreditPurchase.jsx, EmployeeList.jsx)
         ├── Local State (useState, useMemo, useEffect, useRef)
         ├── UI Components (AntD Table, Modal, Button; Bootstrap Row, Col)
         └── API Service Invocation (apiClient / domain service)
```

### 6.2 Frontend Route Guard Mechanism
The frontend implements two levels of security guards inside `ERP_frontend-master/src/App.jsx`:
1. **Authentication Guard (`PrivateRoute.jsx`):**
   - Inspects `localStorage.getItem('token')` or Redux `state.auth.token`.
   - If token is absent or invalid, immediately redirects to `/login`.
2. **Permission Guard (`PermissionWith.jsx`):**
   - Accepts a permission string prop (e.g. `"manage branch wallet"`, `"show employee"`, `"create invoice"`).
   - Compares the required permission against `user.permissions` fetched during `/api/auth/me` login handshake.
   - If user lacks permission, it either hides the navigation menu item or renders an "Access Denied" unauthorized view.
   - Special bypass: Users with `type === "company"` or `type === "super admin"` are granted automatic bypass to all routes.

### 6.3 Centralized API Client & Token Interception
Located at [ERP_frontend-master/src/services/apiClient.js](file:///d:/New%20folder/New%20folder/ERP%20Frontend/ERP_frontend-master/src/services/apiClient.js#L1-L59):
- **Base URL:** Dynamically populated from `import.meta.env.VITE_BASE_URL/api` (`http://localhost:3004/api`).
- **Request Interceptor:** Automatically reads `localStorage.getItem('token')` and injects the header `Authorization: Bearer <token>`.
- **Response Interceptor:**
  - On HTTP `401 Unauthorized`: Emits toast notification `"⚠️ Unauthorized! Please log in again."`, clears `localStorage.removeItem('token')`, and redirects browser to `/login`.
  - On HTTP `403 Forbidden`: Emits toast notification `"Access Denied! You don't have permission."`.
  - On Network Failure: Emits toast `"Network error. Please check your connection."` with a 10-second debounce counter.

---

## 7. DATABASE ARCHITECTURE

### 7.1 Dual Database Architecture
The backend application communicates concurrently with two distinct MySQL databases configured in [backend/config/database.js](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/config/database.js#L1-L80):

```
                    ┌─────────────────────────────────┐
                    │     Express Backend Server      │
                    └───────┬─────────────────┬───────┘
                            │                 │
             Sequelize: erpDB                 Sequelize: dmpsDB
             (Pool: 10, Port: 3306)           (Pool: 5, Port: 3306)
                            │                 │
                            ▼                 ▼
                 ┌───────────────────┐ ┌───────────────┐
                 │    erpprod2025    │ │     dmps      │
                 │   (Primary ERP)   │ │  (Biometric)  │
                 │    260 Tables     │ │  devicelogs   │
                 └───────────────────┘ └───────────────┘
```

1. **Primary ERP Database (`erpprod2025`):**
   - Exported as `sequelize` and `erpDB`.
   - Host: `process.env.DB_HOST` (127.0.0.1), Port: `process.env.DB_PORT` (3306).
   - Timezone: `+05:30` (Asia/Kolkata), `useUTC: false` (stores raw local timestamps in MySQL).
   - Connection Pool: `max: 10`, `min: 0`, `acquire: 30000ms`, `idle: 10000ms`.
   - Contains 260 total tables housing all HR, payroll, branch wallets, invoices, and users.
2. **Biometric Raw Database (`dmps`):**
   - Exported as `dmpsDB`.
   - Host: `process.env.DMPS_DB_HOST` (127.0.0.1), Port: `process.env.DMPS_DB_PORT` (3306).
   - Connection Pool: `max: 5`, `min: 0`, `acquire: 30000ms`, `idle: 10000ms`.
   - Dedicated solely to physical biometric device sync; houses the `devicelogs` table which records hardware punches (`UserId`, `DeviceKey`, `IOTime`, `IsSync`).

### 7.2 Relational Integrity & Association Model
- Total tables in primary database: **260**.
- Total Sequelize models loaded in backend: **128**.
- Total database-level foreign key constraints: **Only 45** across the entire 260 tables!
- **Findings on Database Integrity:**
  - 82% of relational links (e.g. linking `attendance_employees` to `employees`, linking `payslips` to `employees`, or linking `sale_bills` to `branches`) have **NO database-level foreign key constraint**.
  - They are joined via application-level Sequelize queries without database referential enforcement.
  - Deleting an employee or branch in the database does not cascade or restrict, leaving orphaned records across ledger, payroll, and attendance tables.


---

## 8. COMPLETE DATABASE TABLE INVENTORY

The primary database `erpprod2025` contains **260 tables**. Forensic analysis categorizes them into active functional domains versus orphaned legacy remnants from the original Laravel SaaS codebase.

### 8.1 Domain Group 1: Core HRM & Employee Management (18 Tables)
| Table Name | Primary Key | Key Columns | Usage & Relationships | Active Status |
| :--- | :--- | :--- | :--- | :--- |
| `employees` | `id` (int) | `employee_id`, `user_id`, `name`, `dob`, `gender`, `phone`, `address`, `branch_id`, `department_id`, `designation_id`, `biometric_emp_id`, `is_active` | Primary employee master record; links to `users`, `branches`, `departments`, `designations`. | **ACTIVE / CRITICAL** |
| `branches` | `id` (int) | `name`, `created_by` | Master list of operating branches, plants, and project sites. | **ACTIVE / CRITICAL** |
| `departments` | `id` (int) | `name`, `branch_id`, `created_by` | Sub-organizational units inside branches. | **ACTIVE / HIGH** |
| `designations` | `id` (int) | `department_id`, `name`, `created_by` | Job titles and organizational ranks. | **ACTIVE / HIGH** |
| `employee_documents` | `id` (int) | `employee_id`, `document_id`, `document_value`, `created_by` | Uploaded KYC files, Aadhaar, PAN, certificates. | **ACTIVE / HIGH** |
| `documents` | `id` (int) | `name`, `role`, `is_required`, `created_by` | Setup table defining mandatory document types. | **ACTIVE / MEDIUM** |
| `company_policies` | `id` (int) | `branch`, `title`, `description`, `attachment`, `created_by` | Organizational policy documentation with PDF uploads. | **ACTIVE / MEDIUM** |
| `working_zones` | `id` (int) | `name`, `plant_id`, `status`, `created_by` | Geographical work zones / plant sections for site allowances. | **ACTIVE / HIGH** |
| `plant_names` | `id` (int) | `name`, `status`, `created_by` | Client manufacturing plant identifiers (e.g. JSL MRP-1). | **ACTIVE / HIGH** |
| `transfers` | `id` (int) | `employee_id`, `branch_id`, `department_id`, `transfer_date` | Employee inter-branch relocation history. | **ACTIVE / MEDIUM** |
| `promotions` | `id` (int) | `employee_id`, `designation_id`, `promotion_title`, `promotion_date` | Employee advancement records. | **ACTIVE / MEDIUM** |
| `resignations` | `id` (int) | `employee_id`, `notice_date`, `resignation_date`, `description` | Formal employee exit requests. | **ACTIVE / MEDIUM** |
| `terminations` | `id` (int) | `employee_id`, `termination_type`, `notice_date`, `termination_date` | Employment discharge logs. | **ACTIVE / MEDIUM** |
| `termination_types` | `id` (int) | `name`, `created_by` | Taxonomy of termination causes. | **ACTIVE / LOW** |
| `warnings` | `id` (int) | `warning_to`, `warning_by`, `subject`, `warning_date`, `description` | Disciplinary notice records. | **ACTIVE / MEDIUM** |
| `complaints` | `id` (int) | `complaint_from`, `complaint_against`, `title`, `complaint_date` | Employee grievances and disputes. | **ACTIVE / MEDIUM** |
| `awards` | `id` (int) | `employee_id`, `award_type`, `date`, `gift`, `description` | Employee recognition and merit rewards. | **ACTIVE / LOW** |
| `award_types` | `id` (int) | `name`, `created_by` | Setup categories for corporate awards. | **ACTIVE / LOW** |

### 8.2 Domain Group 2: Attendance & Time Tracking (5 Tables)
| Table Name | Primary Key | Key Columns | Usage & Relationships | Active Status |
| :--- | :--- | :--- | :--- | :--- |
| `attendance_employees` | `id` (int) | `employee_id`, `date`, `status`, `clock_in`, `clock_out`, `late`, `early_leaving`, `overtime`, `total_rest`, `shift_id` | Primary daily attendance register. Queried for monthly payroll. | **ACTIVE / CRITICAL** |
| `shifts` | `id` (int) | `name`, `start_time`, `end_time`, `grace_time`, `half_day_time`, `working_hours` | Master shift schedule configurations. | **ACTIVE / HIGH** |
| `attendance_regularizations` | `id` (int) | `employee_id`, `date`, `clock_in`, `clock_out`, `reason`, `status`, `action_by` | Punch dispute and manual regularization requests. | **ACTIVE / HIGH** |
| `shift_assignments` | `id` (int) | `employee_id`, `shift_id`, `start_date`, `end_date` | Shift roster linking employees to work timings. | **ACTIVE / MEDIUM** |
| `devicelogs` (in `dmps`) | `Id` (int) | `DeviceKey`, `UserId`, `IOTime`, `IsSync`, `CreatedDate` | Physical biometric device raw punch repository. | **ACTIVE / CRITICAL** |

### 8.3 Domain Group 3: Payroll, Compensation & Benefits (16 Tables)
| Table Name | Primary Key | Key Columns | Usage & Relationships | Active Status |
| :--- | :--- | :--- | :--- | :--- |
| `payslip_employees` | `id` (int) | `employee_id`, `net_payble`, `salary_month`, `status`, `basic_salary`, `allowance`, `commission`, `loan`, `saturation_deduction`, `other_payment`, `overtime` | Generated monthly salary vouchers and disbursal records. | **ACTIVE / CRITICAL** |
| `pay_slips` | `id` (int) | `employee_id`, `net_payble`, `salary_month`, `status`, `basic_salary` | Secondary legacy/mirror payslip table queried by some reports. | **ACTIVE / HIGH** |
| `employee_salaries` | `id` (int) | `employee_id`, `payslip_type`, `salary`, `net_salary` | Employee base compensation master profile. | **ACTIVE / CRITICAL** |
| `employee_allowances` | `id` (int) | `employee_id`, `allowance_option`, `title`, `type`, `amount` | Configured allowances (DA, HRA, Medical, Food). | **ACTIVE / HIGH** |
| `employee_commissions` | `id` (int) | `employee_id`, `title`, `type`, `amount` | Performance incentives. | **ACTIVE / MEDIUM** |
| `employee_loans` | `id` (int) | `employee_id`, `loan_option`, `title`, `amount`, `start_date`, `end_date`, `monthly_repayment` | Company advances and installment recovery plans. | **ACTIVE / HIGH** |
| `employee_saturation_deductions` | `id` (int) | `employee_id`, `deduction_option`, `title`, `type`, `amount` | Statutory deductions (PF, ESIC, Professional Tax, TDS). | **ACTIVE / CRITICAL** |
| `employee_other_payments` | `id` (int) | `employee_id`, `title`, `type`, `amount` | One-off bonuses, reimbursements, or adjustments. | **ACTIVE / MEDIUM** |
| `employee_overtimes` | `id` (int) | `employee_id`, `title`, `number_of_days`, `hours`, `rate` | Overtime compensation records. | **ACTIVE / HIGH** |
| `employee_company_contributions` | `id` (int) | `employee_id`, `title`, `type`, `amount` | Employer statutory contributions (Employer PF, ESIC). | **ACTIVE / HIGH** |
| `allowance_options` | `id` (int) | `name`, `created_by` | Allowance taxonomy options. | **ACTIVE / MEDIUM** |
| `loan_options` | `id` (int) | `name`, `created_by` | Loan taxonomy options. | **ACTIVE / MEDIUM** |
| `deduction_options` | `id` (int) | `name`, `created_by` | Deduction taxonomy options. | **ACTIVE / MEDIUM** |
| `payslip_types` | `id` (int) | `name`, `created_by` | Monthly vs Daily wage configuration categories. | **ACTIVE / MEDIUM** |
| `gross_salaries` | `id` (int) | `employee_id`, `gross_salary`, `effective_date` | Gross salary history tracking. | **ACTIVE / MEDIUM** |
| `manpower_salaries` | `id` (int) | `plant_id`, `month`, `year`, `total_manpower`, `total_salary` | Plant-wise aggregated monthly manpower billing ledgers. | **ACTIVE / HIGH** |

### 8.4 Domain Group 4: Leaves & Holidays (6 Tables)
| Table Name | Primary Key | Key Columns | Usage & Relationships | Active Status |
| :--- | :--- | :--- | :--- | :--- |
| `leaves` | `id` (int) | `employee_id`, `leave_type_id`, `applied_on`, `start_date`, `end_date`, `total_leave_days`, `leave_reason`, `status` | Formal employee leave applications and manager approval state. | **ACTIVE / CRITICAL** |
| `leave_types` | `id` (int) | `title`, `days`, `created_by` | Master categories (Casual, Sick, Earned, Maternity). | **ACTIVE / HIGH** |
| `holidays` | `id` (int) | `date`, `occasion`, `created_by` | Paid company holiday calendar. | **ACTIVE / HIGH** |
| `compensatory_offs` | `id` (int) | `employee_id`, `work_date`, `comp_off_date`, `status` | Comp-off credits for weekend/holiday work. | **ACTIVE / MEDIUM** |
| `leave_accruals` | `id` (int) | `employee_id`, `month`, `year`, `accrued_days` | Monthly earned leave accumulation logs. | **ACTIVE / MEDIUM** |
| `leave_balances` | `id` (int) | `employee_id`, `leave_type_id`, `balance` | Current remaining leave balance per employee. | **ACTIVE / HIGH** |

### 8.5 Domain Group 5: Accounting, Branch Wallets & Purchases (22 Tables)
| Table Name | Primary Key | Key Columns | Usage & Relationships | Active Status |
| :--- | :--- | :--- | :--- | :--- |
| `branch_wallets` | `id` (int) | `branch_id`, `balance`, `total_received`, `total_spent`, `last_updated` | Current petty cash balance for each site/branch. | **ACTIVE / CRITICAL** |
| `branch_fund_requests` | `id` (int) | `branch_id`, `amount`, `reason`, `status`, `approved_by` | Formal requests from site supervisors to replenish wallet funds. | **ACTIVE / HIGH** |
| `vendor_name` | `id` (int) | `name`, `address`, `phone_number`, `created_by` | Master vendor repository for procurement and bills. | **ACTIVE / CRITICAL** |
| `credit_purchases_new` | `id` (int) | `vendor_id`, `branch_id`, `bill_number`, `bill_date`, `total_amount`, `tax_amount`, `payment_status`, `gst_type` | Active purchase ledger (GST and Non-GST expenses). | **ACTIVE / CRITICAL** |
| `credit_purchase_items_new`| `id` (int) | `credit_purchase_id`, `description`, `quantity`, `rate`, `tax_rate`, `amount` | Line items for GST/Non-GST purchases. | **ACTIVE / CRITICAL** |
| `bills` | `id` (int) | `vender_id`, `bill_date`, `due_date`, `bill_id`, `category_id`, `order_number`, `status` | General vendor accounts payable invoices. | **ACTIVE / HIGH** |
| `bill_paids` | `id` (int) | `bill_id`, `amount`, `payment_date`, `payment_method`, `notes` | Direct payment vouchers clearing bills. | **ACTIVE / HIGH** |
| `expenses_new` | `id` (int) | `branch_id`, `category_id`, `amount`, `date`, `expense_doc`, `description` | Operational expense ledger. | **ACTIVE / HIGH** |
| `expense_items_new` | `id` (int) | `expense_id`, `item_name`, `amount`, `notes` | Detailed breakdown of operational expense lines. | **ACTIVE / MEDIUM** |
| `expense_categories` | `id` (int) | `name`, `description`, `status` | Chart of account classification for expenses. | **ACTIVE / HIGH** |
| `bank_accounts` | `id` (int) | `holder_name`, `bank_name`, `account_number`, `opening_balance`, `contact_number`, `bank_address` | Company corporate bank accounts. | **ACTIVE / HIGH** |
| `chart_of_accounts` | `id` (int) | `name`, `code`, `type`, `sub_type`, `is_enabled`, `description` | Financial general ledger account nodes. | **ACTIVE / MEDIUM** |
| `chart_of_account_types` | `id` (int) | `name`, `created_by` | Top-level ledger categories (Asset, Liability, Equity, Income, Expense). | **ACTIVE / MEDIUM** |
| `chart_of_account_sub_types` | `id` (int) | `name`, `type_id`, `created_by` | Secondary ledger classifications. | **ACTIVE / MEDIUM** |
| `chart_of_account_parents` | `id` (int) | `name`, `sub_type_id`, `created_by` | Parent node hierarchy in chart of accounts. | **ACTIVE / LOW** |
| `base_amounts` | `id` (int) | `plant_id`, `contract_period_id`, `base_amount`, `received_amount` | Contract base billing values per client site. | **ACTIVE / HIGH** |
| `payment_receiveds` | `id` (int) | `base_amount_id`, `received_date`, `amount`, `reference_number` | Client remittance logs against contracts. | **ACTIVE / HIGH** |
| `deduction_payment_dones` | `id` (int) | `base_amount_id`, `deduction_type`, `amount`, `reason` | Client penalties or contractual deductions. | **ACTIVE / MEDIUM** |
| `contract_periods` | `id` (int) | `plant_id`, `start_date`, `end_date`, `status` | Multi-year client site service agreement timelines. | **ACTIVE / HIGH** |
| `job_modes` | `id` (int) | `name`, `status` | Operational nature of work (e.g. Turnkey, AMC, Manpower). | **ACTIVE / MEDIUM** |
| `revenues_new` | `id` (int) | `date`, `amount`, `account_id`, `customer_id`, `category_id`, `payment_method`, `reference` | Income recording ledger. | **ACTIVE / HIGH** |
| `incomes` | `id` (int) | `amount`, `date`, `source`, `notes` | Secondary miscellaneous revenue entries. | **ACTIVE / MEDIUM** |

### 8.6 Domain Group 6: Sales, Invoicing & Billing (14 Tables)
| Table Name | Primary Key | Key Columns | Usage & Relationships | Active Status |
| :--- | :--- | :--- | :--- | :--- |
| `sale_bills` | `id` (int) | `branch_id`, `invoice_number`, `bill_date`, `total_amount`, `tax_amount`, `sub_total`, `received_amount`, `status` | Primary client sales invoices. | **ACTIVE / CRITICAL** |
| `sale_bill_payments` | `id` (int) | `sale_bill_id`, `payment_date`, `amount`, `payment_mode`, `reference_number` | Payment remittances settling sales bills. | **ACTIVE / HIGH** |
| `proforma_bills` | `id` (int) | `branch_id`, `invoice_number`, `bill_date`, `total_amount`, `tax_amount`, `sub_total`, `status` | Quotation/Proforma invoices issued before work completion. | **ACTIVE / HIGH** |
| `proforma_bill_payments` | `id` (int) | `proforma_bill_id`, `payment_date`, `amount`, `payment_mode` | Advance payments against proforma invoices. | **ACTIVE / MEDIUM** |
| `customers` | `id` (int) | `customer_id`, `name`, `email`, `contact`, `billing_name`, `billing_address`, `shipping_address` | Corporate clients and debtors master. | **ACTIVE / HIGH** |
| `clients` | `id` (int) | `name`, `email`, `password`, `branch_id`, `is_active` | Client portal login profiles. | **ACTIVE / MEDIUM** |
| `invoices` | `id` (int) | `invoice_id`, `customer_id`, `issue_date`, `due_date`, `send_date`, `category_id`, `status` | General invoicing table. | **ACTIVE / HIGH** |
| `invoice_items` | `id` (int) | `invoice_id`, `item_name`, `quantity`, `price`, `tax`, `discount` | Line items inside general invoices. | **ACTIVE / HIGH** |
| `invoice_taxes` | `id` (int) | `invoice_id`, `tax_name`, `rate`, `amount` | Tax breakdowns per invoice. | **ACTIVE / HIGH** |
| `purchase_orders` | `id` (int) | `vendor_id`, `order_number`, `order_date`, `total_amount`, `status` | Formal procurement purchase orders. | **ACTIVE / HIGH** |
| `purchase_order_invoices` | `id` (int) | `purchase_order_id`, `invoice_number`, `amount`, `invoice_date` | Invoices raised against POs. | **ACTIVE / HIGH** |
| `new_work_orders` | `id` (int) | `work_order_number`, `client_id`, `branch_id`, `amount`, `status`, `issue_date` | Site work orders received from clients. | **ACTIVE / HIGH** |
| `work_order_invoices` | `id` (int) | `work_order_id`, `invoice_number`, `amount`, `bill_date`, `status` | Invoices generated against executed work orders. | **ACTIVE / HIGH** |
| `taxes` | `id` (int) | `name`, `rate`, `created_by` | Master GST tax brackets (5%, 12%, 18%, 28%). | **ACTIVE / HIGH** |

### 8.7 Domain Group 7: Assets & Product Stock (7 Tables)
| Table Name | Primary Key | Key Columns | Usage & Relationships | Active Status |
| :--- | :--- | :--- | :--- | :--- |
| `assets_company` | `id` (int) | `name`, `branch_id`, `purchase_date`, `amount`, `serial_number`, `status` | Machinery, vehicles, tools, and office IT equipment. | **ACTIVE / HIGH** |
| `employee_assets` | `id` (int) | `employee_id`, `asset_id`, `given_date`, `return_date`, `status` | Company assets assigned to employees. | **ACTIVE / HIGH** |
| `asset_company_maintenance_logs` | `id` (int) | `asset_id`, `maintenance_date`, `cost`, `description` | Servicing and repair history of assets. | **ACTIVE / MEDIUM** |
| `products` | `id` (int) | `name`, `sku`, `sale_price`, `purchase_price`, `quantity`, `tax_id`, `unit_id`, `type` | Goods and consumables catalog. | **ACTIVE / HIGH** |
| `product_stocks` | `id` (int) | `product_id`, `branch_id`, `quantity`, `last_updated` | Branch-wise product inventory levels. | **ACTIVE / HIGH** |
| `product_service_units` | `id` (int) | `name`, `created_by`, `is_active` | Measurement units (KG, Meter, Nos, Box). | **ACTIVE / MEDIUM** |
| `categories` | `id` (int) | `name`, `type`, `color`, `created_by` | Taxonomy categories for products and services. | **ACTIVE / MEDIUM** |

### 8.8 Domain Group 8: Recruitment, Training & Performance (12 Tables)
| Table Name | Primary Key | Key Columns | Usage & Relationships | Active Status |
| :--- | :--- | :--- | :--- | :--- |
| `jobs` | `id` (int) | `title`, `description`, `requirement`, `branch`, `category`, `status` | Open career requisitions. | **ACTIVE / MEDIUM** |
| `job_applications` | `id` (int) | `job_id`, `name`, `email`, `phone`, `rating`, `resume`, `stage` | Candidate candidate profiles and resumes. | **ACTIVE / MEDIUM** |
| `job_categories` | `id` (int) | `title`, `created_by` | Job family categories. | **ACTIVE / LOW** |
| `job_stages` | `id` (int) | `title`, `order`, `created_by` | Hiring pipeline stages (Applied, Interview, Hired). | **ACTIVE / LOW** |
| `trainings` | `id` (int) | `branch_id`, `trainer_option`, `training_type`, `trainer`, `training_cost`, `employee`, `start_date`, `end_date` | Staff vocational and safety training programs. | **ACTIVE / MEDIUM** |
| `trainers` | `id` (int) | `firstname`, `lastname`, `contact`, `email`, `expertise` | Internal/external training instructors. | **ACTIVE / LOW** |
| `training_types` | `id` (int) | `name`, `created_by` | Categorization of training curricula. | **ACTIVE / LOW** |
| `appraisals` | `id` (int) | `branch`, `employee`, `appraisal_date`, `rating` | Formal performance appraisal reviews. | **ACTIVE / MEDIUM** |
| `indicators` | `id` (int) | `branch`, `department`, `designation`, `rating` | Key performance indicator matrices. | **ACTIVE / MEDIUM** |
| `competencies` | `id` (int) | `name`, `type`, `created_by` | Skill and behavioral competencies. | **ACTIVE / LOW** |
| `goal_trackings` | `id` (int) | `branch`, `goal_type`, `start_date`, `end_date`, `progress` | Milestone and target completion logs. | **ACTIVE / LOW** |
| `goal_types` | `id` (int) | `name`, `created_by` | Performance objective taxonomies. | **ACTIVE / LOW** |

### 8.9 Domain Group 9: System, Authentication, Roles & Permissions (8 Tables)
| Table Name | Primary Key | Key Columns | Usage & Relationships | Active Status |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `id` (int) | `name`, `email`, `password`, `type`, `avatar`, `lang`, `created_by`, `is_enable_login` | System user accounts and credentials. | **ACTIVE / CRITICAL** |
| `roles` | `id` (int) | `name`, `guard_name`, `created_by` | Security roles (company, super admin, HR, Employee). | **ACTIVE / CRITICAL** |
| `permissions` | `id` (int) | `name`, `guard_name`, `created_by` | Granular permission flags (e.g. 'manage employee'). | **ACTIVE / CRITICAL** |
| `role_has_permissions` | Composite | `permission_id`, `role_id` | Pivot table linking roles to assigned permissions. | **ACTIVE / CRITICAL** |
| `model_has_roles` | Composite | `role_id`, `model_type`, `model_id` | Legacy Laravel pivot assigning roles to user models. | **LEGACY / PARTIAL** |
| `model_has_permissions`| Composite | `permission_id`, `model_type`, `model_id` | Direct user permission overrides. | **LEGACY / PARTIAL** |
| `homescreens` | `id` (int) | `title`, `subtitle`, `logo`, `left_image`, `right_image` | Dynamic public homepage branding and logos. | **ACTIVE / LOW** |
| `events` | `id` (int) | `branch_id`, `department_id`, `employee_id`, `title`, `start_date`, `end_date` | Company calendar notice events. | **ACTIVE / MEDIUM** |

### 8.10 Domain Group 10: Legacy / Orphaned Laravel SaaS Tables (135 Tables)
These **135 tables exist in the live MySQL database** but have **NO Sequelize model**, NO backend controller, and NO frontend view. They are dormant artifacts imported from the original Laravel SaaS multi-tenant boilerplate:
```
activity_logs, add_transaction_lines, admin_payment_settings, assets, bank_transfers, bill_accounts, 
bill_payments, budgets, bugs, bug_comments, bug_files, bug_statuses, ch_favorites, ch_messages, 
client_deals, company_payment_settings, contracts, contract_attachment, contract_comment, contract_notes, 
contract_types, coupons, credit_notes, credit_purchases, credit_purchase_item, credit_purchase_items, 
customer_credit_notes, customer_debit_notes, custom_fields, custom_field_values, deals, deal_calls, 
deal_discussions, deal_emails, deal_files, deal_tasks, debit_notes, email_templates, email_template_langs, 
estimations, expenses, experience_certificates, failed_jobs, form_builders, form_fields, 
form_field_responses, form_responses, generate_offer_letters, genrate_payslip_options, goals, 
interview_schedules, invoice_bank_transfers, invoice_payments, invoice_products, ip_restricts, 
joining_letters, join_us, journal_entries, labels, landing_page_settings, languages, leads, 
lead_activity_logs, lead_calls, lead_discussions, lead_emails, lead_files, lead_stages, login_details, 
log_activities, migrations, milestones, noc_certificates, notifications, notification_templates, 
notification_template_langs, orders, password_resets, payments, personal_access_tokens, pipelines, 
plans, plan_requests, pos, pos_payments, pos_products, projects, projectstages, project_email_templates, 
project_expenses, project_invoices, project_tasks, project_users, proposals, proposal_products, 
purchases, purchase_payments, purchase_products, quotations, quotation_products, referral_settings, 
referral_transactions, revenues, settings, set_salaries, sources, stages, supports, support_replies, 
task_checklists, task_comments, task_files, task_stages, templates, timesheets, time_trackers, 
track_photos, transactions, transaction_lines, transaction_orders, travels, units, users_verify, 
user_contacts, user_coupons, user_deals, user_email_templates, user_leads, user_to_dos, warehouses, 
warehouse_products, warehouse_transfers, webhook_settings, work_orders, zoom_meetings.
```

---

## 9. MODEL ↔ DATABASE CONSISTENCY REPORT

A comprehensive field-by-field comparison was executed between all 128 Sequelize model definitions in `backend/models/` and the live MySQL schema of `erpprod2025`.

### 9.1 Summary Statistics
- **Total Tables in Database:** 260
- **Total Sequelize Models Loaded:** 128
- **Tables Without Sequelize Models:** 135 (Legacy Laravel SaaS remnants)
- **Models Without Database Tables:** 1 (`devicelogs` — deliberate, targets secondary database `dmps`)
- **Models with Column Discrepancies:** **11 Models**
- **Attributes in Models but Missing in Database:** **0** (Zero runtime crashes caused by querying non-existent columns)
- **Columns in Database not Mapped in Sequelize Models:** **18 Columns across 11 Tables**

### 9.2 Consistency Discrepancy Matrix
| Model Name | Physical Table | Model File Path | Status | Missing Column in Model | Severity | Forensic Evidence & Architectural Impact |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `AttendanceEmployee` | `attendance_employees` | `models/attendance.model.js` | **DISCREPANCY** | `createdAt`, `updatedAt`, `open_shift_flag` | **MEDIUM** | Model sets `timestamps: false` but DB has timestamp columns. `open_shift_flag` is unmapped; overnight open shifts cannot be flagged via ORM. |
| `Bill` | `bills` | `models/bill.model.js` | **DISCREPANCY** | `is_deleted` | **MEDIUM** | DB has `is_deleted` soft-delete flag, but model does not define it. Deletes in `Bill.destroy()` will perform hard row deletions instead of soft deletes. |
| `CompanyPolicy` | `company_policies` | `models/companyPolicy.model.js` | **DISCREPANCY** | `deleted_at` | **LOW** | Database contains `deleted_at` datetime column. Model is not configured with `paranoid: true`. |
| `JournalItem` | `journal_items` | `models/journalItem.model.js` | **DISCREPANCY** | `description` | **LOW** | Model omits `description` field; text descriptions saved directly in DB are ignored upon Sequelize model hydration. |
| `Leave` | `leaves` | `models/leave.model.js` | **DISCREPANCY** | `deleted_at` | **LOW** | DB has `deleted_at` column; model lacks `paranoid: true`. Soft deletion not leveraged. |
| `purchase_order` | `purchase_orders` | `models/purchase_order.model.js` | **DISCREPANCY** | `tax_rate`, `sub_total`, `tax_amount` | **HIGH** | Tax amounts and subtotal calculations are stored in DB columns but completely ignored by the Sequelize model definition. Calculations must be recomputed on the fly. |
| `Revenue` | `revenues_new` | `models/revenue.model.js` | **DISCREPANCY** | `deleted_at` | **LOW** | DB has `deleted_at` column; model lacks `paranoid: true`. |
| `SaleBill` | `sale_bills` | `models/saleBill.model.js` | **DISCREPANCY** | `received_amount`, `difference_amount` | **HIGH** | Database table has dedicated columns for `received_amount` and `difference_amount` added via manual alter table, but model was never updated to expose them. |
| `Unit` | `product_service_units` | `models/unit.model.js` | **DISCREPANCY** | `is_active` | **LOW** | DB has `is_active` status flag; model omits it, preventing status toggling via standard ORM updates. |
| `WorkOrder` | `new_work_orders` | `models/workOrder.model.js` | **DISCREPANCY** | `planned_start_date`, `planned_end_date`, `actual_start_date`, `actual_end_date` | **HIGH** | Milestone schedule dates exist in MySQL but are not exposed in `workOrder.model.js`. Project timelines cannot be fetched via model queries. |
| `WorkOrderInvoice` | `work_order_invoices` | `models/work_order_invoice.model.js` | **DISCREPANCY** | `deleted_at` | **LOW** | Database contains `deleted_at`; model lacks `paranoid: true`. |


---

## 10. BACKEND API INVENTORY

### 10.1 Route Summary
The backend Express 5 application registers **655 mounted API endpoints** across 59 route namespaces mounted in `backend/server.js`.

- **Total API Routes Mounted:** 655
- **GET Endpoints:** 274 (41.8%)
- **POST Endpoints:** 178 (27.2%)
- **PUT Endpoints:** 113 (17.3%)
- **DELETE Endpoints:** 87 (13.3%)
- **PATCH Endpoints:** 3 (0.4%)
- **Endpoints Protected by Authentication & Permission:** 284
- **Endpoints Protected by Authentication Only (No Permission Check):** 343
- **Endpoints Completely Unauthenticated (Open Public Access):** **28**

### 10.2 Forensic Inventory of All 28 Completely Unauthenticated Endpoints
These 28 routes lack `auth.middleware.js` and are exposed to unrestricted internet access:

| HTTP Method | Full URL Route | Route Source File | Controller Handler | Security & Operational Risk |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | `routes/auth.routes.js` | `AuthController.register` | Public registration creates company account without validation. |
| `POST` | `/api/auth/login` | `routes/auth.routes.js` | `AuthController.login` | Standard public login endpoint. |
| `POST` | `/api/auth/refresh` | `routes/auth.routes.js` | `AuthController.refreshToken` | Token refresh endpoint. |
| `POST` | `/api/auth/logout` | `routes/auth.routes.js` | `AuthController.logout` | Session logout. |
| `POST` | `/api/login-with-branch` | `routes/auth.mobile.routes.js` | `AuthController.loginWithBranch` | Mobile branch-level authentication. |
| `POST` | `/api/clients/login` | `routes/client.routes.js` | `ClientController.loginClient` | Client portal authentication. |
| `POST` | `/api/attendance/biometric-ingest` | `routes/biometricAttendance.routes.js`| `controller.biometricIngest` | Ingests biometric punches. Protected only by `x-api-key` header. |
| `GET` | `/api/aboutus` | `routes/aboutus.routes.js` | `controller.getAboutUs` | Public marketing content. |
| `GET` | `/api/privacypolicy` | `routes/privacyPolicy.routes.js` | `controller.getPrivacyPolicy` | Public legal policy content. |
| `GET` | `/api/terms` | `routes/terms.routes.js` | `controller.getTerms` | Public terms & conditions content. |
| `GET` | `/api/homescreen` | `routes/homescreen.routes.js` | `controller.getHomeScreen` | Public homepage branding assets. |
| `DELETE` | `/api/homescreen/:id` | `routes/homescreen.routes.js` | `inline handler` | 🔴 **CRITICAL RISK:** Public DELETE allows anyone to wipe homepage assets! |
| `GET` | `/api/history/:base_amount_id` | `routes/payment_received.routes.js`| `controller.getPaymentHistory` | 🔴 **HIGH RISK:** Unauthenticated financial remittance history leak. |
| `POST` | `/api/company-contributions` | `routes/companyContribution.routes.js`| `controller.create` | 🔴 **CRITICAL RISK:** Publicly create employer statutory contributions. |
| `GET` | `/api/company-contributions` | `routes/companyContribution.routes.js`| `controller.findAll` | 🔴 **HIGH RISK:** Public disclosure of employee PF/ESIC data. |
| `GET` | `/api/company-contributions/:id`| `routes/companyContribution.routes.js`| `controller.findOne` | 🔴 **HIGH RISK:** Public disclosure of individual contribution records. |
| `PUT` | `/api/company-contributions/:id`| `routes/companyContribution.routes.js`| `controller.update` | 🔴 **CRITICAL RISK:** Public modification of statutory contribution records. |
| `DELETE` | `/api/company-contributions/:id`| `routes/companyContribution.routes.js`| `controller.delete` | 🔴 **CRITICAL RISK:** Public deletion of statutory contribution records. |
| `GET` | `/api/trainings` | `routes/training.routes.js` | `controller.getAll` | 🟡 **MEDIUM RISK:** Public enumeration of internal company training. |
| `GET` | `/api/trainings/:id` | `routes/training.routes.js` | `controller.getById` | 🟡 **MEDIUM RISK:** Public training record inspection. |
| `POST` | `/api/trainings` | `routes/training.routes.js` | `controller.create` | 🔴 **HIGH RISK:** Unauthenticated creation of training programs. |
| `PUT` | `/api/trainings/:id` | `routes/training.routes.js` | `controller.update` | 🔴 **HIGH RISK:** Unauthenticated modification of training programs. |
| `DELETE` | `/api/trainings/:id` | `routes/training.routes.js` | `controller.delete` | 🔴 **HIGH RISK:** Unauthenticated deletion of training records. |
| `GET` | `/api/travels` | `routes/travel.routes.js` | `controller.getAll` | 🟡 **MEDIUM RISK:** Public disclosure of employee corporate travel. |
| `GET` | `/api/travels/:id` | `routes/travel.routes.js` | `controller.getById` | 🟡 **MEDIUM RISK:** Public travel itinerary record inspection. |
| `POST` | `/api/travels` | `routes/travel.routes.js` | `controller.create` | 🔴 **HIGH RISK:** Unauthenticated booking/creation of travel expenses. |
| `PUT` | `/api/travels/:id` | `routes/travel.routes.js` | `controller.update` | 🔴 **HIGH RISK:** Unauthenticated editing of travel records. |
| `DELETE` | `/api/travels/:id` | `routes/travel.routes.js` | `controller.destroy` | 🔴 **HIGH RISK:** Unauthenticated deletion of travel records. |

---

## 11. FRONTEND ↔ BACKEND API MAPPING

### 11.1 Integration Architecture
The React application invokes the backend through **525 individual API call sites** coordinated across 68 modular service files in `ERP_frontend-master/src/services/`. All requests route through the shared `apiClient` Axios wrapper ([services/apiClient.js](file:///d:/New%20folder/New%20folder/ERP%20Frontend/ERP_frontend-master/src/services/apiClient.js)).

### 11.2 Core Domain API Integration Matrix
| Frontend Service File | Target API Endpoint | HTTP Method | Backend Route File | Controller Method | Sequelize Model | Primary DB Table | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `authService.js` | `/auth/login` | `POST` | `auth.routes.js` | `AuthController.login` | `User` | `users` | **VERIFIED ACTIVE** |
| `authService.js` | `/auth/me` | `GET` | `auth.routes.js` | `AuthController.getAuthenticatedUser`| `User, Employee, Role` | `users, employees, roles` | **VERIFIED ACTIVE** |
| `branchwalletService.js`| `/branch-wallets` | `GET` | `branchWallet.routes.js` | `controller.getAllWallets` | `BranchWallet` | `branch_wallets` | **VERIFIED ACTIVE** |
| `branchwalletService.js`| `/branch-wallets/:id/transactions`| `GET` | `branchWallet.routes.js` | `controller.getTransactions` | `CreditPurchase` | `credit_purchases_new` | **VERIFIED ACTIVE** |
| `purchases.js` | `/credit-purchase` | `GET` | `creditPurchase.routes.js`| `controller.getAllPurchases` | `CreditPurchase` | `credit_purchases_new` | **VERIFIED ACTIVE** |
| `purchases.js` | `/credit-purchase` | `POST` | `creditPurchase.routes.js`| `controller.createPurchase` | `CreditPurchase, BranchWallet`| `credit_purchases_new, branch_wallets`| **VERIFIED ACTIVE** |
| `vendorService.js` | `/vendor-names` | `GET` | `vendorName.routes.js` | `controller.getAllVendors` | `VendorName` | `vendor_name` | **VERIFIED ACTIVE** |
| `vendorService.js` | `/vendor-names` | `POST` | `vendorName.routes.js` | `controller.createVendor` | `VendorName` | `vendor_name` | **VERIFIED ACTIVE** |
| `attendanceService.js` | `/attendances` | `GET` | `attendance.routes.js` | `controller.getAllAttendances` | `AttendanceEmployee` | `attendance_employees` | **VERIFIED ACTIVE** |
| `attendanceService.js` | `/attendances/bulk` | `POST` | `attendance.routes.js` | `controller.createBulkAttendance` | `AttendanceEmployee` | `attendance_employees` | **VERIFIED ACTIVE** |
| `salaryService.js` | `/payslips` | `GET` | `payslip.routes.js` | `controller.getAllPayslips` | `PayslipEmployee` | `payslip_employees` | **VERIFIED ACTIVE** |
| `salaryService.js` | `/payslips/generate` | `POST` | `payslip.routes.js` | `controller.generateMonthlyPayslips`| `PayslipEmployee, EmployeeSalary`| `payslip_employees, employee_salaries`| **VERIFIED ACTIVE** |
| `salebillService.js` | `/salebill` | `GET` | `saleBill.routes.js` | `controller.getAllSaleBills` | `SaleBill` | `sale_bills` | **VERIFIED ACTIVE** |
| `salebillService.js` | `/salebill` | `POST` | `saleBill.routes.js` | `controller.createSaleBill` | `SaleBill, SaleBillPayment` | `sale_bills, sale_bill_payments` | **VERIFIED ACTIVE** |
| `proformaBillService.js`| `/proformabill` | `GET` | `proformaBill.routes.js` | `controller.getAllProformaBills` | `ProformaBill` | `proforma_bills` | **VERIFIED ACTIVE** |
| `workOrderService.js` | `/work-orders` | `GET` | `workOrder.routes.js` | `controller.getAllWorkOrders` | `WorkOrder` | `new_work_orders` | **VERIFIED ACTIVE** |
| `assetsService.js` | `/assets` | `GET` | `asset.routes.js` | `controller.getAllAssets` | `AssetCompany` | `assets_company` | **VERIFIED ACTIVE** |

### 11.3 Integration Mismatches & Unused Backend Routes
1. **Uncalled Backend Endpoints:** Over **310 backend endpoints** mounted in `server.js` are never called anywhere in the React frontend codebase. Examples:
   - `job_stages.routes.js` (Full CRUD unreferenced by UI)
   - `job_application_note.routes.js` (Unreferenced)
   - `chart_of_account_parent.routes.js` (Unreferenced)
   - `custom_question.routes.js` (Unreferenced)
   - `termination_type.routes.js` (Unreferenced)
2. **Duplicate Route Namespace Collisions in `server.js`:**
   - `/api/leaves` mounted on line 143 AND on line 169.
   - `/api/holidays` mounted on line 144 AND line 177.
   - `/api/payslips` mounted on line 145 AND line 158.
   - `/api/documents` mounted on line 147 AND line 182.
   - `/api/saturation-deductions` mounted on line 154 AND line 168.
   - `/api/taxes` mounted on line 227 (`routes/tax.routes.js`) AND line 286 (`routes/invoiceTax.routes.js`). The second mount shadows matching paths from the first!

---

## 12. AUTHENTICATION AND AUTHORIZATION

### 12.1 End-to-End Authentication Trace
```
1. [User Enters Credentials] (ERP_frontend-master/src/features/auth/Login.jsx)
      ↓ (email: "admin@example.com", password: "secretPassword")
2. [Frontend Service Request] (POST http://localhost:3004/api/auth/login)
      ↓
3. [Backend Controller Processing] (backend/controllers/auth.controller.js:90)
      ├── User.findOne({ where: { email } })
      ├── Verification: if (user.is_enable_login === 0) return 403 Forbidden
      ├── Password Check: bcrypt.compare(password, user.password)
      ├── Token Creation: jwt.sign(payload, JWT_SECRET, { expiresIn: '3650d' })  # 10 YEARS!
      └── Refresh Token: jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '3650d' })
      ↓
4. [In-Memory Storage]
      └── refreshTokens.push(refreshToken)  # Appended to volatile RAM array!
      ↓
5. [Frontend Storage & Session Init]
      ├── localStorage.setItem('token', response.data.token)
      ├── Redux dispatch(setCredentials({ token, user }))
      └── Axios initiates immediate GET /api/auth/me
      ↓
6. [Protected Handshake: GET /api/auth/me] (auth.controller.js:258)
      ├── Fetches User, Employee record, Branch info, Designation, Department
      ├── Fetches Role where { name: user.type } and includes Role Permissions
      └── Response returns user identity + permission array to Redux store
```

### 12.2 Critical Security Vulnerabilities in Auth Layer
1. **Hardcoded Fallback JWT Secrets (CRITICAL):**
   - File: [backend/controllers/auth.controller.js:15-16](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/controllers/auth.controller.js#L15-L16)
   - Code:
     ```javascript
     const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
     const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key';
     ```
   - **Forensic Verification:** `backend/.env` contains database and biometric keys, but **NEITHER `JWT_SECRET` NOR `JWT_REFRESH_SECRET` IS DEFINED**.
   - **Exploit Vector:** Any attacker can forge a valid JWT containing `{ id: 1, type: "company" }` signed with the well-known static string `'your_jwt_secret_key'` and immediately achieve root Super Admin access across the entire system.
2. **10-Year Token Expiration Lifespan (HIGH RISK):**
   - File: [backend/controllers/auth.controller.js:109, 117](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/controllers/auth.controller.js#L109-L117)
   - Code: `{ expiresIn: '3650d' } // ✅ 10 years`
   - Issued tokens never expire in practice. Stolen tokens remain valid for a decade.
3. **In-Memory RAM Refresh Token Storage (HIGH RISK):**
   - File: [backend/controllers/auth.controller.js:19](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/controllers/auth.controller.js#L19)
   - Code: `let refreshTokens = [];`
   - Refresh tokens are kept in a local array in RAM. Every time the server restarts, this array resets to empty, invalidating all client refresh attempts. Additionally, the array grows unbounded, causing a memory leak under high session volume.
4. **Duplicate Database Queries on Every Authenticated Request (PERFORMANCE RISK):**
   - In `auth.middleware.js` (lines 44-53), the server executes:
     `User.findByPk(decoded.id)` and `Role.findOne({ where: { name: user.type }, include: [Permission] })`.
   - Then, if the route has `authorize('permission_name')`, [backend/middlewares/authorize.js:90-99](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/middlewares/authorize.js#L90-L99) executes:
     `User.findByPk(userId)` a SECOND time, and `Role.findOne(...)` a SECOND time!
   - Every single API call results in **4 redundant MySQL queries** before controller execution begins.
5. **Runtime Reference Crash in `updateProfile`:**
   - File: [backend/controllers/auth.controller.js:353](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/controllers/auth.controller.js#L353)
   - Code: `await db('users').where({ id: user.id }).update({ name, email });`
   - **Forensic Evidence:** Variable `db` is neither imported nor declared anywhere in `auth.controller.js`. Invoking `PUT /api/auth/profile` crashes the Express process with `ReferenceError: db is not defined`.


---

## 13. BUSINESS MODULE ANALYSIS

The ERP platform houses **14 active business modules**. Each module spans the React frontend, Express API routes, controllers, Sequelize models, and MySQL database tables.

### 13.1 Module 1: HRM — Employee Management
- **Frontend:**
  - Routes: `/hrm/employees`, `/hrm/employees/create`, `/hrm/employees/edit/:id`, `/hrm/employees/view/:id`
  - Components: `EmployeeList.jsx`, `EmployeeCreate.jsx`, `EmployeeDetail.jsx`, `DocumentUploadModal.jsx`
  - Services: `hrmService.js` (`getEmployees`, `createEmployee`, `updateEmployee`, `uploadDocument`)
- **Backend:**
  - Routes: `routes/employee.routes.js`, `routes/employee_document.routes.js`
  - Controllers: `employee.controller.js` (157 KB), `employeeDocument.controller.js`
  - Models: `Employee`, `EmployeeDocument`, `Branch`, `Department`, `Designation`, `Skill`
- **Database:**
  - Tables: `employees`, `employee_documents`, `branches`, `departments`, `designations`, `skills`
- **Business Logic:**
  - Creates both an `Employee` profile and a companion `User` login account in a single operation.
  - Generates auto-incremented employee code formatted as `EMP-0000X`.
  - Attaches statutory KYC documents (Aadhaar, PAN, Bank Passbook, Educational certificates) via Multer disk upload.
  - Links employee to a designated physical plant/branch (`branch_id`) and biometric device ID (`biometric_emp_id`).

### 13.2 Module 2: Attendance & Regularization
- **Frontend:**
  - Routes: `/hrm/attendance`, `/hrm/attendance/regularization`, `/hrm/attendance/summary`
  - Components: `AttendanceList.jsx`, `AttendanceRegularization.jsx`, `BiometricLogView.jsx`
  - Services: `attendanceService.js` (`getDailyAttendance`, `submitRegularization`, `approveRegularization`)
- **Backend:**
  - Routes: `routes/attendance.routes.js`, `routes/biometricAttendance.routes.js`
  - Controllers: `attendance.controller.js`, `biometricAttendance.controller.js`
  - Models: `AttendanceEmployee`, `AttendanceRegularization`, `DeviceLog` (via `dmpsDB`)
- **Database:**
  - Tables: `attendance_employees`, `attendance_regularizations`, `devicelogs` (in `dmps`)
- **Business Logic:**
  - Ingests physical biometric punches via `POST /api/attendance/biometric-ingest`.
  - Automatically matches punch time with assigned `Shift` schedule to calculate `late`, `early_leaving`, and `overtime`.
  - Manual dispute workflow allows site workers to request regularization for missed punches, subject to HR approval.

### 13.3 Module 3: Shift Management
- **Frontend:**
  - Routes: `/hrm/shifts`, `/hrm/shifts/assign`
  - Components: `ShiftList.jsx`, `ShiftModal.jsx`, `ShiftAssignment.jsx`
  - Services: `hrmService.js` (`getShifts`, `createShift`, `assignShift`)
- **Backend:**
  - Routes: `routes/shift.routes.js`
  - Controllers: `shift.controller.js`
  - Models: `Shift`, `ShiftAssignment`
- **Database:**
  - Tables: `shifts`, `shift_assignments`
- **Business Logic:**
  - Supports multiple fixed shifts (Morning, General, Night) with configurable `grace_time` (typically 15 minutes) and `half_day_time` (minimum 4 hours).
  - Calculates night shifts spanning past midnight into the subsequent calendar day.

### 13.4 Module 4: Leaves & Holiday Management
- **Frontend:**
  - Routes: `/hrm/leaves`, `/hrm/leaves/types`, `/hrm/holidays`
  - Components: `LeaveList.jsx`, `LeaveApplyModal.jsx`, `HolidayCalendar.jsx`
  - Services: `hrmService.js`, `leavetypeService.js`
- **Backend:**
  - Routes: `routes/leave.routes.js`, `routes/leave_type.routes.js`, `routes/holiday.routes.js`
  - Controllers: `leave.controller.js`, `leaveType.controller.js`, `holiday.controller.js`
  - Models: `Leave`, `LeaveType`, `LeaveBalance`, `Holiday`
- **Database:**
  - Tables: `leaves`, `leave_types`, `leave_balances`, `holidays`, `compensatory_offs`
- **Business Logic:**
  - Tracks accrued versus consumed leave balances per employee per leave category.
  - Multi-tiered approval: Site supervisor verifies, HR approves or rejects. Approved leaves automatically suppress "Absent" flags during daily cron run.

### 13.5 Module 5: Payroll & Compensation Management
- **Frontend:**
  - Routes: `/hrm/payroll/payslips`, `/hrm/payroll/set-salary`, `/hrm/payroll/structure`
  - Components: `PayslipList.jsx`, `SetSalary.jsx`, `PayslipDetailModal.jsx`
  - Services: `salaryService.js`, `saturationService.js`, `allowanceService.js`
- **Backend:**
  - Routes: `routes/payslip.routes.js`, `routes/employeeSalary.routes.js`, `routes/allowance.routes.js`, `routes/saturationDeduction.routes.js`
  - Controllers: `payslip.controller.js` (301 KB), `employeeSalary.controller.js`, `setSalary.controller.js`
  - Models: `PayslipEmployee`, `EmployeeSalary`, `EmployeeAllowance`, `EmployeeLoan`, `EmployeeSaturationDeduction`
- **Database:**
  - Tables: `payslip_employees`, `employee_salaries`, `employee_allowances`, `employee_loans`, `employee_saturation_deductions`, `employee_overtimes`
- **Business Logic:**
  - Executes complex mathematical formulas across 10+ compensation heads: Basic, HRA, DA, Special Allowance, Food Allowance, Site/Working Zone allowances, Overtime, PF (12%), ESIC (0.75%), Professional Tax, and Advance deductions.
  - Generates printable PDF payslips via Puppeteer / HTML-PDF and formatted Excel bank disbursement files.

### 13.6 Module 6: Accounting — Branch Wallets & Petty Cash
- **Frontend:**
  - Routes: `/accounting/branch-wallets`, `/accounting/branch-wallets/:id/transactions`, `/accounting/fund-requests`
  - Components: `Branchwallet.jsx`, `BranchWalletTransactions.jsx`, `FundRequestModal.jsx`
  - Services: `branchwalletService.js`
- **Backend:**
  - Routes: `routes/branchWallet.routes.js`, `routes/branchFundRequest.routes.js`
  - Controllers: `branchWallet.controller.js`, `branchFundRequest.controller.js`
  - Models: `BranchWallet`, `BranchFundRequest`, `CreditPurchase`
- **Database:**
  - Tables: `branch_wallets`, `branch_fund_requests`, `branches`
- **Business Logic:**
  - Maintains individual petty cash balances for each project site.
  - Records site debits when purchases or expenses are logged.
  - Site supervisors submit fund requests; head office approves and credits wallet balances.

### 13.7 Module 7: Accounting — Expenses (GST & Non-GST Purchases)
- **Frontend:**
  - Routes: `/accounting/expenses/credit-purchase`, `/accounting/expenses/non-gst`
  - Components: `CreditPurchase.jsx`, `NonGstPurchase.jsx`, `PurchaseEntryModal.jsx`
  - Services: `purchases.js`, `expensessService.js`
- **Backend:**
  - Routes: `routes/creditPurchase.routes.js`, `routes/expense.routes.js`
  - Controllers: `creditPurchase.controller.js` (85 KB), `expense.controller.js`
  - Models: `CreditPurchase`, `CreditPurchaseItem`, `BranchWallet`, `VendorName`
- **Database:**
  - Tables: `credit_purchases_new`, `credit_purchase_items_new`, `vendor_name`, `branch_wallets`
- **Business Logic:**
  - Records site procurement items with tax itemization (CGST, SGST, IGST) or Non-GST tags.
  - Validates and debits the purchase total from the corresponding `branch_wallets` record.
  - Provides instant vendor search-as-you-type autocomplete with vendor master linking.

### 13.8 Module 8: Accounting — Vendor Management
- **Frontend:**
  - Routes: `/accounting/vendors`
  - Components: `VendorList.jsx`, `VendorModal.jsx`
  - Services: `vendorService.js`
- **Backend:**
  - Routes: `routes/vendorName.routes.js`
  - Controllers: `vendorName.controller.js`
  - Models: `VendorName`
- **Database:**
  - Tables: `vendor_name`
- **Business Logic:**
  - Unified vendor directory storing name, contact number, and site address.
  - Referenced by GST and Non-GST purchase orders and expense vouchers.

### 13.9 Module 9: Sales Billing & Invoicing
- **Frontend:**
  - Routes: `/accounting/sales/bills`, `/accounting/sales/create`, `/accounting/sales/view/:id`
  - Components: `SaleBillList.jsx`, `SaleBillCreate.jsx`, `SaleBillInvoiceView.jsx`
  - Services: `salebillService.js`
- **Backend:**
  - Routes: `routes/saleBill.routes.js`, `routes/saleBillPayment.routes.js`
  - Controllers: `saleBill.controller.js`, `saleBillPayment.controller.js`
  - Models: `SaleBill`, `SaleBillPayment`, `Branch`
- **Database:**
  - Tables: `sale_bills`, `sale_bill_payments`, `branches`
- **Business Logic:**
  - Generates official tax invoices against clients for contracting services rendered.
  - Tracks invoice lifecycle (`Draft` → `Sent` → `Partially Paid` → `Paid`).
  - Records multiple client remittances against a single invoice in `sale_bill_payments`.

### 13.10 Module 10: Proforma Invoicing
- **Frontend:**
  - Routes: `/accounting/sales/proforma-bills`
  - Components: `ProformaBillList.jsx`, `ProformaBillModal.jsx`
  - Services: `proformaBillService.js`
- **Backend:**
  - Routes: `routes/proformaBill.routes.js`, `routes/proformaBillPayment.routes.js`
  - Controllers: `proformaBill.controller.js`, `proformaBillPayment.controller.js`
  - Models: `ProformaBill`, `ProformaBillPayment`
- **Database:**
  - Tables: `proforma_bills`, `proforma_bill_payments`
- **Business Logic:**
  - Issues non-binding preliminary billing estimates prior to tax invoice generation.
  - Can be converted to an official Sale Bill upon commercial acceptance.

### 13.11 Module 11: Procurement & Work Orders (PO / WO)
- **Frontend:**
  - Routes: `/accounting/purchase-orders`, `/accounting/work-orders`
  - Components: `PurchaseOrderList.jsx`, `WorkOrderList.jsx`
  - Services: `purchaseService.js`, `workOrderService.js`
- **Backend:**
  - Routes: `routes/purchase_order.routes.js`, `routes/workOrder.routes.js`, `routes/work_order_invoice.routes.js`
  - Controllers: `purchaseOrder.controller.js`, `workOrder.controller.js`, `workOrderInvoice.controller.js`
  - Models: `purchase_order`, `WorkOrder`, `WorkOrderInvoice`
- **Database:**
  - Tables: `purchase_orders`, `purchase_order_invoices`, `new_work_orders`, `work_order_invoices`
- **Business Logic:**
  - Manages contracts awarded to sub-contractors and materials ordered from industrial suppliers.
  - Tracks invoices raised against purchase orders and milestone work orders.

### 13.12 Module 12: Assets Management
- **Frontend:**
  - Routes: `/assets/company`, `/assets/employee`
  - Components: `AssetCompanyList.jsx`, `EmployeeAssetList.jsx`
  - Services: `assetsService.js`, `employeeAssetService.js`
- **Backend:**
  - Routes: `routes/asset.routes.js`
  - Controllers: `asset.controller.js`
  - Models: `AssetCompany`, `EmployeeAsset`, `AssetCompanyMaintenanceLog`
- **Database:**
  - Tables: `assets_company`, `employee_assets`, `asset_company_maintenance_logs`
- **Business Logic:**
  - Inventories plant machinery, construction tools, safety gear, and computer hardware.
  - Records asset custody handovers to employees and maintenance repair costs.

### 13.13 Module 13: Biometric Synchronization Integration
- **Frontend:**
  - Embedded inside Attendance Dashboard views showing real-time sync timestamps.
- **Backend:**
  - Routes: `routes/biometricAttendance.routes.js`
  - Controllers: `biometricAttendance.controller.js`
  - Workers: `workers/biometricSync.worker.js`
  - Models: `DeviceLog` (connecting to `dmpsDB`)
- **Database:**
  - Tables: `devicelogs` (in `dmps` database)
- **Business Logic:**
  - Continuously polls biometric hardware logs where `IsSync = 0` and ingests them into the primary attendance register.

### 13.14 Module 14: Reports & Analytics
- **Frontend:**
  - Routes: `/reports/attendance`, `/reports/payroll`, `/reports/plant-manpower`, `/reports/stock`
  - Components: `AttendanceReport.jsx`, `SalaryReport.jsx`, `PlantManpowerReport.jsx`
  - Services: `reportService.js`, `manpowerReportService.js`
- **Backend:**
  - Routes: `routes/report.routes.js`, `routes/generateReport.routes.js`, `routes/reportPlant.routes.js`, `routes/manpowerSalary.routes.js`
  - Controllers: `report.controller.js`, `generateReport.controller.js`, `manpowerSalary.controller.js`
- **Business Logic:**
  - Aggregates multi-site monthly metrics into Excel downloads and visual SVG charts.

---

## 14. BUSINESS LOGIC ANALYSIS

### 14.1 Salary Computation & Wage Breakdown Formula
Located in [backend/utils/salaryBreakdown.js](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/utils/salaryBreakdown.js) and [backend/controllers/payslip.controller.js](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/controllers/payslip.controller.js):
```
Gross Salary = Basic Salary + HRA + DA + Special Allowance + Site Allowance + Food Allowance
Earnings = Gross Salary + Overtime Pay + One-off Bonuses
Statutory Deductions = Provident Fund (PF: 12% of Basic capped at statutory limits)
                     + Employee State Insurance (ESIC: 0.75% of Gross if Gross <= ₹21,000)
                     + Professional Tax (PT: Slabs based on state rules)
                     + Tax Deducted at Source (TDS)
Recoveries = Advance Loan Repayment Recovery + Other Deductions
Net Take-Home Pay = Earnings - Statutory Deductions - Recoveries
```
- **Critical Risk:** Salary breakdown math is duplicated across `salaryBreakdown.js`, `payslip.controller.js`, and the frontend `SetSalary.jsx`. Discrepancies exist between rounding rules (math `floor` vs `round`), leading to 1-rupee rounding mismatches.

### 14.2 GST Purchase & Wallet Balance Logic
Implemented in [backend/controllers/creditPurchase.controller.js](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/controllers/creditPurchase.controller.js):
- **Transaction Rule:** When a purchase voucher is submitted:
  1. Checks if `branch_wallets.balance >= purchase.total_amount`.
  2. Creates entry in `credit_purchases_new`.
  3. Inserts items in `credit_purchase_items_new`.
  4. Deducts `total_amount` from `branch_wallets.balance` and adds to `branch_wallets.total_spent`.
- **CRITICAL FLAW:** **No Sequelize Database Transaction (`sequelize.transaction`) is used!**
  If inserting line items fails due to a network glitch or syntax error, the purchase header is already written and the wallet balance may be debited without corresponding line items.

### 14.3 Auto-Absent Marking Logic
Implemented in [backend/cron/autoAbsent.cron.js](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/cron/autoAbsent.cron.js):
- Ticks every 60 seconds. At exactly 23:59 IST:
  1. Fetches all active employees where `is_active = 1` and `deleted_at IS NULL`.
  2. Skips employees without a configured `biometric_emp_id`.
  3. Checks `attendance_employees` for a record on current date.
  4. If no punch exists, inserts a row with `status = 'Absent'`, `clock_in = '00:00:00'`, `clock_out = '00:00:00'`.
- **Risk:** If the server is offline or restarting during 23:59, the entire process is skipped and employees remain unflagged with no automatic backfill on the next startup.

---

## 15. AUTOMATED JOBS, CRON & BACKGROUND WORKERS

### 15.1 Daily Auto-Absent Cron Job (`backend/cron/autoAbsent.cron.js`)
- **Trigger:** `node-cron` expression `* * * * *` (File: [backend/cron/autoAbsent.cron.js:173](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/cron/autoAbsent.cron.js#L173)).
- **Execution Interval:** Scheduled to check every minute; runs payload if current time is `23:59` IST.
- **Entry Point:** Loaded in [server.js:17](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/server.js#L17) (`require("./cron/autoAbsent.cron")`).
- **Database Operations:** Queries `employees` table, iterates sequentially through all active employees, and queries `attendance_employees` for each employee. Inserts missing absent records.
- **Flaws & Risks:**
  - **Console Spam:** Logs `⏱ Cron Tick: HH:mm:ss` every 60 seconds into production stdout 24/7.
  - **N+1 Sequential Database Loop:** For 1,000 employees, executes 1,000 to 2,000 individual queries in an unbatched sequential `for` loop.
  - **Single Point of Failure:** Missing 23:59 permanently skips the entire day.

### 15.2 Biometric Sync Worker (`backend/workers/biometricSync.worker.js`)
- **Trigger:** `setInterval(processLogs, SYNC_INTERVAL)` (File: [backend/workers/biometricSync.worker.js:106](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/workers/biometricSync.worker.js#L106)).
- **Execution Frequency:** Every 2,000ms (`SYNC_INTERVAL_MS = 2000` in `backend/.env`).
- **Batch Size:** 200 records (`SYNC_BATCH_SIZE = 200` in `backend/.env`).
- **Entry Point:** `node workers/biometricSync.worker.js` (run independently or via `npm run start:all`).
- **Database Operations:** Reads un-synced punches from `dmpsDB.devicelogs` where `IsSync = 0` ordered by `Id ASC`. Updates `IsSync = 1` after processing.
- **Flaws & Architectural Anti-Pattern:**
  - **Faked HTTP Request Objects:** Lines 9-24 define `createMockReqRes(payload)` which fakes an Express `req` and `res` object (injecting `headers['x-api-key'] = process.env.BIOMETRIC_API_KEY`) to invoke the Express controller `biometricIngest(req, res)`.
  - **Race Condition in `setInterval`:** Because `setInterval` does not await completion of `processLogs`, if processing 200 logs takes more than 2,000ms, multiple concurrent execution loops overlap, reading identical unsynced records and triggering duplicate attendance writes.


---

## 16. BIOMETRIC & EXTERNAL INTEGRATIONS

### 16.1 Biometric Hardware & DMPS Integration
- **Purpose:** Synchronize real-time physical fingerprint/face punch logs from industrial turnstiles and biometric terminals into the ERP attendance register.
- **Architecture:** Physical devices push raw logs into a standalone MySQL database named `dmps` (managed by device vendor software). The ERP connects to this database via `dmpsDB` ([database.js:35](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/config/database.js#L35)).
- **Data Flow:**
  ```
  Physical Biometric Device
     ↓ (Pushes hardware log)
  MySQL: dmps.devicelogs (UserId, DeviceKey, IOTime, IsSync=0)
     ↓ (Polled every 2s by biometricSync.worker.js)
  ERP Express Ingest API: POST /api/attendance/biometric-ingest
     ↓ (Validates x-api-key header)
  biometricAttendance.controller.js
     ↓ (Matches Employee biometric_emp_id, calculates shift & late hours)
  MySQL: erpprod2025.attendance_employees (status, clock_in, clock_out)
     ↓
  dmps.devicelogs.update({ IsSync: 1 })
  ```
- **Authentication:** Ingest endpoint validates `x-api-key` header against `process.env.BIOMETRIC_API_KEY` ([biometricApiKey.js:8](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/middlewares/biometricApiKey.js#L8)).
- **Failure Behavior:** If the ERP API fails or MySQL encounters a lock, `IsSync` remains `0`. The worker retries the batch on the next interval.

### 16.2 PDF & Document Generation Systems
- **Active Engines:** Puppeteer (`^24.20.0`), HTML-PDF (`^3.0.1`), PDFKit (`^0.17.2`), PDF-Lib (`^1.17.1`).
- **Template Source:** [backend/Template/invoiceTemplate.html](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/Template/invoiceTemplate.html) and [backend/Template/invoiceGenerator.js](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/Template/invoiceGenerator.js).
- **Output:** Writes PDF files into `backend/invoices/` and returns public URLs.
- **Dependency Redundancy:** The project maintains **7 distinct PDF libraries** simultaneously, creating extreme node_modules bloat and memory consumption during server startup.

### 16.3 Third-Party Services Audit
- **Email / SMTP:** **NOT CONFIGURED / ABSENT.** Forensic code search for `nodemailer` or `smtp` returned 0 results. System has no active outbound email delivery.
- **Payment Gateways (Razorpay/Stripe):** **NOT CONFIGURED / ABSENT.** Payments are recorded manually as offline bank transfers, cash, or cheques.

---

## 17. FILE UPLOAD & STORAGE SYSTEM

### 17.1 Multer Configuration & Dynamic Storage
Implemented in [backend/middlewares/upload.middleware.js](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/middlewares/upload.middleware.js#L111-L212):
- **Storage Target:** Local disk storage in `backend/uploads/`.
- **Dynamic Subdirectory Routing by Fieldname:**
  - `avatar` → `backend/uploads/avatars/`
  - `attachment` → `backend/uploads/company_policies/`
  - `document_value` → `backend/uploads/employee_documents/` (KYC, Aadhaar, PAN)
  - `document` → `backend/uploads/document_uploads/`
  - `pro_image` → `backend/uploads/products_images/`
  - `expense_doc` → `backend/uploads/expenses/`
  - `logo`, `homescreen_*_image` → `backend/uploads/homeimages/`
  - All other fields → `backend/uploads/misc/`
- **File Limits:** `fileSize: 100 * 1024 * 1024` (**100 MB max file size**).
- **MIME Type Whitelist:** JPEG, PNG, GIF, WEBP, BMP, PDF.
- **Filename Generation:** `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`.

### 17.2 Critical File Storage Security Vulnerability
- **Unauthenticated Static File Exposure (HIGH RISK):**
  - File: [backend/server.js:125](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/server.js#L125)
  - Code: `app.use('/uploads', express.static(path.join(__dirname, 'uploads')));`
  - **Forensic Finding:** All uploaded files are served statically with zero authentication checks.
  - **Impact:** Sensitive documents (Aadhaar cards, PAN cards, bank passbooks, medical certificates, company financial policies, and expense invoices) can be viewed or downloaded by anyone on the network who knows or enumerates the URL path:  
    `http://localhost:3004/uploads/employee_documents/document_value-1727856000000-123456789.pdf`.
  - The filename generation relies on `Math.random()` and `Date.now()`, making it predictable and susceptible to brute-force discovery.

---

## 18. ENVIRONMENT CONFIGURATION

All sensitive credentials, passwords, and private keys have been strictly redacted with `[REDACTED]` in compliance with security guidelines.

### 18.1 Backend Environment (`backend/.env`)
| Key | Purpose | Used By | Required? | Default in Code | Current Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `PORT` | HTTP Port for Express API | `server.js` | Yes | `3306` (Dangerous conflict) | Configured (`3004`) |
| `DB_HOST` | MySQL Host for Primary ERP | `config/database.js` | Yes | None | Configured (`127.0.0.1`) |
| `DB_PORT` | MySQL Port for Primary ERP | `config/database.js` | Yes | None | Configured (`3306`) |
| `DB_NAME` | Primary Database Name | `config/database.js` | Yes | None | Configured (`erpprod2025`) |
| `DB_USER` | Primary Database Username | `config/database.js` | Yes | None | Configured (`root`) |
| `DB_PASS` | Primary Database Password | `config/database.js` | Yes | None | Configured (`[REDACTED]`) |
| `DMPS_DB_HOST` | Biometric MySQL Host | `config/database.js` | Yes | None | Configured (`127.0.0.1`) |
| `DMPS_DB_PORT` | Biometric MySQL Port | `config/database.js` | Yes | None | Configured (`3306`) |
| `DMPS_DB_NAME` | Biometric Database Name | `config/database.js` | Yes | None | Configured (`dmps`) |
| `DMPS_DB_USER` | Biometric Database User | `config/database.js` | Yes | None | Configured (`root`) |
| `DMPS_DB_PASS` | Biometric Database Password | `config/database.js` | Yes | None | Configured (`[REDACTED]`) |
| `BIOMETRIC_API_KEY`| API Key for Punch Ingest | `biometricApiKey.js` | Yes | None | Configured (`[REDACTED]`) |
| `SYNC_INTERVAL_MS`| Biometric Sync Interval | `biometricSync.worker.js`| No | `5000` | Configured (`2000`) |
| `SYNC_BATCH_SIZE` | Biometric Batch Fetch Count | `biometricSync.worker.js`| No | `20` | Configured (`200`) |
| `JWT_SECRET` | HMAC Secret for Access Token | `auth.controller.js`, `auth.middleware.js` | **CRITICAL** | **`'your_jwt_secret_key'`** | 🔴 **MISSING FROM .ENV!** |
| `JWT_REFRESH_SECRET`| HMAC Secret for Refresh Token| `auth.controller.js` | **CRITICAL** | **`'your_jwt_refresh_secret_key'`** | 🔴 **MISSING FROM .ENV!** |
| `NODE_ENV` | Environment identifier | General Express | No | `undefined` | 🔴 **MISSING FROM .ENV!** |

### 18.2 Frontend Environment (`ERP_frontend-master/.env`)
| Key | Purpose | Used By | Required? | Default in Code | Current Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `VITE_BASE_URL` | Backend API Base Origin | `src/services/apiClient.js` | Yes | None | Configured (`http://localhost:3004`) |
| `VITE_AVATARS_BASE_URL`| Static Uploads Base URL | Image rendering components | Yes | None | Configured (`http://localhost:3004/uploads/avatars`) |

---

## 19. SECURITY AUDIT

### 19.1 Vulnerability Classification
| Severity | Total Findings |
| :--- | :--- |
| 🔴 **CRITICAL** | 2 |
| 🟠 **HIGH** | 5 |
| 🟡 **MEDIUM** | 4 |
| 🔵 **LOW / INFO** | 3 |

### 19.2 Detailed Vulnerability Breakdown
1. **CRITICAL: Hardcoded JWT Fallback Secret In Production**
   - **Evidence:** [backend/controllers/auth.controller.js:15](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/controllers/auth.controller.js#L15) and [backend/middlewares/auth.middleware.js:30](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/middlewares/auth.middleware.js#L30).
   - **Finding:** Neither `JWT_SECRET` nor `JWT_REFRESH_SECRET` exists in `backend/.env`. The application falls back to `'your_jwt_secret_key'`.
   - **Impact:** An attacker can forge arbitrary JWT tokens with `{ id: 1, type: "company" }` to impersonate root administrator access without knowing user passwords.
2. **CRITICAL: Unauthenticated CRUD Routes in Statutory Contribution & Homepage APIs**
   - **Evidence:** `companyContribution.routes.js` lines 6-10; `homescreen.routes.js` lines 8-9.
   - **Finding:** `POST`, `PUT`, and `DELETE` on `/api/company-contributions` and `DELETE /api/homescreen/:id` have NO authentication or authorization middleware.
   - **Impact:** Unauthenticated external users can wipe or tamper with employee statutory PF/ESIC data and delete company assets.
3. **HIGH: 10-Year Token Expiration Lifespan (`3650d`)**
   - **Evidence:** [backend/controllers/auth.controller.js:109, 117, 153](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/controllers/auth.controller.js#L109-L153).
   - **Finding:** Access and refresh tokens are minted with an expiration time of 3,650 days (10 years).
   - **Impact:** Token revocation is non-functional. Stolen tokens remain indefinitely active.
4. **HIGH: In-Memory Refresh Token Array Stored in Volatile RAM**
   - **Evidence:** [backend/controllers/auth.controller.js:19](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/controllers/auth.controller.js#L19).
   - **Finding:** `let refreshTokens = [];` stores refresh tokens in Node process memory.
   - **Impact:** All active sessions become unrefreshable whenever the Node server restarts. Memory leaks occur over time.
5. **HIGH: Completely Unauthenticated Static File Serving for KYC Documents**
   - **Evidence:** [backend/server.js:125](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/server.js#L125).
   - **Finding:** Static directory `/uploads` exposes employee KYC IDs, contracts, and salary files without access tokens.
6. **HIGH: 100MB File Upload Limit Without Antivirus or File Signature Validation**
   - **Evidence:** [backend/middlewares/upload.middleware.js:208](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/middlewares/upload.middleware.js#L208).
   - **Finding:** 100MB max limit enables denial-of-service disk exhaustion. Validation relies solely on client-supplied MIME strings.
7. **HIGH: Public Travel and Training Management Endpoints**
   - **Evidence:** `routes/travel.routes.js` and `routes/training.routes.js`.
   - **Finding:** All CRUD endpoints on `/api/travels` and `/api/trainings` lack authentication.
8. **MEDIUM: Overly Permissive Wildcard CORS with Credentials**
   - **Evidence:** [backend/server.js:117-121](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/server.js#L117-L121).
   - **Finding:** `app.use(cors({ origin: '*', credentials: true }))`.
   - **Impact:** Exposes the API to cross-origin abuse and CSRF-like data harvesting.
9. **MEDIUM: Missing Database Transactions on Accounting Operations**
   - **Evidence:** [backend/controllers/creditPurchase.controller.js](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/controllers/creditPurchase.controller.js) and [backend/controllers/branchWallet.controller.js](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/controllers/branchWallet.controller.js).
   - **Finding:** Multi-table ledger entries and wallet balance updates run without `sequelize.transaction()`.
10. **MEDIUM: Predictable Upload Filenames**
    - **Evidence:** `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`. Weak PRNG allows brute-force enumeration.
11. **LOW: Stack Trace Leakage via Default Express Error Handler**
    - **Evidence:** No error middleware registered in `server.js`. Express 5 dumps full stack traces in HTML responses on uncaught errors.

---

## 20. PERFORMANCE AUDIT

### 20.1 Backend Performance Bottlenecks
1. **Redundant 4-Query Overhead on Every Authenticated API Call:**
   - `auth.middleware.js` fetches User + Role/Permissions from MySQL.
   - `authorize.js` fetches User + Role/Permissions from MySQL a second time.
   - Result: 4 extra SQL queries per HTTP request across all 600+ endpoints.
2. **N+1 Sequential Database Iteration in Auto-Absent Cron:**
   - [backend/cron/autoAbsent.cron.js:190-218](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/cron/autoAbsent.cron.js#L190-L218) iterates through all active employees and executes individual `AttendanceEmployee.findOne` and `create` queries in a sequential loop.
3. **Biometric Worker `setInterval` Race Condition:**
   - `setInterval(processLogs, 2000)` triggers overlapping executions if processing takes >2 seconds.
4. **Monolithic Controller Memory Spikes:**
   - `payslip.controller.js` (301 KB) loads massive datasets into memory for calculation rather than executing set-based SQL window functions or aggregated stored procedures.

### 20.2 Frontend Performance Bottlenecks
1. **Massive Icon & Asset Bundle Bloat:**
   - 6 icon libraries loaded simultaneously (`@tabler/icons-react`, `bootstrap-icons`, `react-bootstrap-icons`, `react-feather`, `lucide-react`, `react-icons`).
2. **Dual UI Component Suites:**
   - Complete `antd` (Ant Design 5.26.7) suite loaded alongside complete `react-bootstrap` (2.10.10) / `bootstrap` (5.3.7) runtime.
3. **Duplicate WYSIWYG Editors:**
   - Both `@ckeditor/ckeditor5-react` and `react-quill` are imported into the production bundle.


---

## 21. ERROR HANDLING

### 21.1 Backend Error Handling Architecture
- **Missing Global Error Handler:** Express 5 architecture recommends a four-argument error-handling middleware at the very end of the middleware pipeline:
  `app.use((err, req, res, next) => { ... })`.
  In [backend/server.js](file:///d:/New%20folder/New%20folder/ERP%20Frontend/backend/server.js), **no such middleware exists**.
  When an asynchronous controller throws an error not wrapped in a `try/catch` block, Express 5 falls back to its default handler, emitting an HTML payload with the full system call stack.
- **Inconsistent Error Shapes Across Controllers:**
  Across 128 controllers, responses follow at least 4 contradictory conventions:
  - Convention A: `res.status(500).json({ message: "Server error", error: err.message })`
  - Convention B: `res.status(500).json({ message: "Login failed" })`
  - Convention C: `res.status(400).json({ error: "Invalid data" })`
  - Convention D: `res.status(500).send(err.message)` (Plain text string)
- **Silent Failures:** Several catch blocks log to `console.error` but return generic 200 OK statuses or empty JSON objects, masking database deadlocks and syntax failures from the client.

### 21.2 Frontend Error Handling Architecture
- Centralized inside [ERP_frontend-master/src/services/apiClient.js](file:///d:/New%20folder/New%20folder/ERP%20Frontend/ERP_frontend-master/src/services/apiClient.js#L26-L55):
  - Automatically intercepts HTTP 401 and dispatches toast + redirect to `/login`.
  - Automatically intercepts HTTP 403 and displays an "Access Denied" toast.
  - Intercepts connection dropouts with a 10-second cooldown network error toast.
- Local component boundaries: Some pages wrap API calls with try/catch and emit specific `toast.error(err.response?.data?.message)`, but others lack catch handlers, allowing unhandled promise rejections to bubble to the window.

---

## 22. VALIDATION ARCHITECTURE

### 22.1 Request Validation Gaps
- **Backend Validation:**
  - Although `express-validator` is installed in `backend/package.json`, it is used in fewer than 5% of routes.
  - The vast majority of controllers rely on rudimentary inline checks:
    `if (!req.body.name) return res.status(400).json({ message: "Name is required" })`.
  - No schema-level type casting, length limits, or sanitization occurs on numeric or date inputs before Sequelize insertion.
- **Database Level Constraints:**
  - Only 45 foreign keys exist across 260 tables.
  - Relational consistency is maintained entirely at the application level.
  - NULL constraints are inconsistently applied; financial amount columns in several tables allow NULL values instead of defaulting to `0.00`.
- **Frontend Validation:**
  - Standardized on Formik + Yup schemas on complex forms (`EmployeeCreate.jsx`, `SetSalary.jsx`).
  - Gaps exist in ad-hoc inline table filters and quick-entry modals where raw string inputs are passed directly to backend APIs without frontend type checking.

---

## 23. DEPENDENCY AUDIT

### 23.1 Backend Dependencies Audit (`backend/package.json`)
| Dependency | Version | Assessment | Risk / Recommendation |
| :--- | :--- | :--- | :--- |
| `express` | `^5.1.0` | Modern | Express 5 has native async error handling support. |
| `sequelize` | `^6.37.7` | Stable | ORM core. Well tested with MySQL. |
| `mysql2` | `^3.14.2` | High Performance | Active MySQL client driver. |
| `bcrypt` & `bcryptjs` | `^6.0.0` / `^3.0.2` | **DUPLICATE / REDUNDANT** | Both native C++ bcrypt and pure-JS bcryptjs are installed. Standardize on `bcrypt`. |
| `exceljs` & `xlsx` | `^4.4.0` / `^0.18.5` | **DUPLICATE / REDUNDANT** | Two spreadsheet engines installed simultaneously. |
| `puppeteer` | `^24.20.0` | Heavy | High memory usage; downloads headless Chromium browser bundle. |
| `phantomjs-prebuilt` | `^2.1.16` | 🔴 **CRITICAL OBSOLESCENCE** | **ABANDONED SINCE 2018.** Known high-severity CVEs. Must be uninstalled. |
| `html-pdf` & `html-pdf-node`| `^3.0.1` / `^1.0.8` | **OBSOLETE / REDUNDANT** | Legacy wrapper around PhantomJS. Redundant with Puppeteer. |
| `pdfkit` & `pdf-lib` | `^0.17.2` / `^1.17.1` | Redundant | Multiple low-level PDF stream engines. |
| `node-cron` | `^4.2.1` | Active | Task scheduler. |
| `concurrently` | `^9.2.1` | Utility | Runs worker and server concurrently. |

### 23.2 Frontend Dependencies Audit (`ERP_frontend-master/package.json`)
| Dependency | Version | Assessment | Risk / Recommendation |
| :--- | :--- | :--- | :--- |
| `react` / `react-dom` | `^18.3.1` | Modern | Standard React 18 production runtime. |
| `vite` | `^7.0.4` | Cutting Edge | High performance ESM bundler. |
| `react-router-dom` | `^7.7.1` | Modern | Client-side routing. |
| `@reduxjs/toolkit` | `^2.8.2` | Modern | Standard Redux state management. |
| `antd` & `bootstrap` | `^5.26.7` / `^5.3.7` | **DUPLICATE UI SUITES** | Bundling two massive CSS/UI frameworks creates severe bundle bloat. |
| `6 Icon Libraries` | Multiple | **EXTREME BLOAT** | `@tabler/icons-react`, `bootstrap-icons`, `react-bootstrap-icons`, `react-feather`, `lucide-react`, `react-icons` all loaded simultaneously. Standardize on one (e.g. `lucide-react`). |
| `@ckeditor/*` & `react-quill` | `^41.4.2` / `^2.0.0` | **DUPLICATE EDITORS** | Two distinct rich-text WYSIWYG editors bundled simultaneously. |

---

## 24. DOCKER & DEPLOYMENT ANALYSIS

### 24.1 Docker Configuration Status
- **Status:** **NOT IMPLEMENTED / UNNECESSARY IN CURRENT SETUP**
- **Forensic Verification:** Recursive scan of the entire repository confirms **0 Dockerfiles and 0 docker-compose.yml files**.
- **Runtime Environment:** Native Windows processes executing directly against host Node.js and local MySQL daemon.

### 24.2 Production Deployment Readiness Assessment
- **Readiness Rating:** 🔴 **HIGH RISK / NOT PRODUCTION READY**
- **Deficiencies:**
  1. **Absence of Migrations:** No migration framework (e.g. Sequelize CLI `migrations/` or Flyway). Database changes are executed manually via raw SQL scripts or phpMyAdmin, creating schema drift between environments.
  2. **Local Storage Coupling:** Uploads are written directly to local folder `backend/uploads/`. Horizontal scaling across multiple servers or containerized nodes is impossible without a shared NFS volume or AWS S3 / MinIO integration.
  3. **No Process Manager Configuration:** No `ecosystem.config.js` for PM2. If the Node.js process crashes on an uncaught exception, it does not automatically restart unless managed by an external Windows Service.

---

## 25. LEGACY & DUPLICATE CODE INVENTORY

### 25.1 File & Directory Level Artifacts
| Path | Size | Classification | Forensic Rationale |
| :--- | :--- | :--- | :--- |
| `backend/2oct.zip` | 1.07 GB | **OBSOLETE / SAFE TO REMOVE** | Full directory zip backup sitting inside active backend root. |
| `backend/app.js` | 0 bytes | **DEAD CODE / SAFE TO REMOVE** | Empty 0-byte file unreferenced by any module. |
| `backend/.htaccess` | 67 bytes | **LEGACY / SAFE TO REMOVE** | Apache web server rewrite rules from historical cPanel host. |
| `ERP_frontend-master/dist.rar` | 1.82 MB | **OBSOLETE / SAFE TO REMOVE** | Archived production build. |
| `ERP_frontend-master/dist1.rar`| 1.81 MB | **OBSOLETE / SAFE TO REMOVE** | Archived production build. |
| `ERP_frontend-master/dist3.rar`| 1.82 MB | **OBSOLETE / SAFE TO REMOVE** | Archived production build. |
| `ERP_frontend-master/log` | 30 KB | **OBSOLETE / SAFE TO REMOVE** | Temporary build terminal log file. |

### 25.2 Database-Level Legacy Artifacts
- **135 Dormant Laravel SaaS Tables:** Tables such as `ch_messages`, `ch_favorites`, `failed_jobs`, `personal_access_tokens`, `plans`, `plan_requests`, `deals`, `leads`, `pipelines`, and `pos` reside in `erpprod2025` without any model or controller mapping.
- **Redundant Model Definitions:** Multiple pairs of active and legacy models exist (e.g. `creditPurchase.model.js` mapping to `credit_purchases_new` while legacy `credit_purchases` table sits unmapped).

---

## 26. END-TO-END BUSINESS WORKFLOWS

### 26.1 Workflow 1: User Login & Session Establishment
```
[User] ──(Submits email & password)──► [Login.jsx]
                                           │
                                  (POST /api/auth/login)
                                           ▼
                                 [auth.routes.js]
                                           │
                                 [auth.controller.js:login]
                                           ├── User.findOne({ where: { email } })
                                           ├── bcrypt.compare(password, user.password)
                                           ├── jwt.sign(..., JWT_SECRET, { expiresIn: '3650d' })
                                           └── refreshTokens.push(refreshToken)
                                           ▼
                                  (Returns Token & User)
                                           │
                                           ▼
[App.jsx] ◄──(Saves to localStorage & Redux)──┘
   │
 (GET /api/auth/me)
   ▼
[auth.controller.js:getAuthenticatedUser]
   ├── Fetches Employee profile, Branch, Department, Designation
   └── Loads Role & Permissions from MySQL
   ▼
(Populates Redux Store -> Unlocks Admin Dashboard Sidebar Navigation)
```

### 26.2 Workflow 2: Biometric Punch Ingestion & Shift Attendance Tracking
```
[Physical Turnstile / Biometric Punch Device]
   │
   ▼ (Hardware push)
[MySQL dmps.devicelogs] (DeviceKey, UserId, IOTime, IsSync = 0)
   │
   ▼ (Polled every 2,000ms by biometricSync.worker.js)
[Express Ingest API: POST /api/attendance/biometric-ingest]
   │ (Validates x-api-key header)
   ▼
[biometricAttendance.controller.js:biometricIngest]
   ├── Finds Employee matching biometric_emp_id = UserId
   ├── Finds Shift Assignment and Shift Start/End timings
   ├── Calculates late arrival (IOTime - Shift.start_time > GraceTime)
   ├── Calculates early leaving or overtime
   ▼
[MySQL erpprod2025.attendance_employees]
   └── Inserts or Updates attendance record (clock_in, clock_out, status = 'Present')
   ▼
[biometricSync.worker.js]
   └── Updates dmps.devicelogs SET IsSync = 1 WHERE Id = log.Id
```

### 26.3 Workflow 3: Leave Application & Multi-Tier Approval
```
[Employee] ──(Selects Leave Type, Start/End Date, Reason)──► [LeaveApplyModal.jsx]
                                                                  │
                                                       (POST /api/leaves)
                                                                  ▼
                                                          [leave.controller.js:create]
                                                                  ├── Checks LeaveBalance for remaining days
                                                                  └── Inserts leaves (status = 'Pending')
                                                                  ▼
[Site Supervisor / HR Manager] ◄──(Views pending leaves)──────────┘
   │
   ▼ (Approves leave: PUT /api/leaves/:id/status { status: 'Approved' })
[leave.controller.js:updateStatus]
   ├── Updates leaves.status = 'Approved'
   ├── Deducts days from leave_balances
   └── Creates pre-approved records in attendance_employees (status = 'On Leave')
```

### 26.4 Workflow 4: Monthly Payroll Generation & Disbursal
```
[HR Manager] ──(Selects Month & Branch)──► [SetSalary.jsx / PayslipList.jsx]
                                                  │
                                       (POST /api/payslips/generate)
                                                  ▼
                                       [payslip.controller.js:generateMonthlyPayslips]
                                                  ├── Fetches all active employees in Branch
                                                  ├── Loops each employee:
                                                  │     ├── Fetches base salary from employee_salaries
                                                  │     ├── Queries attendance_employees for Month (Presents, Absents, OTs)
                                                  │     ├── Calculates Gross: Basic + HRA + DA + Allowances
                                                  │     ├── Calculates Statutory: PF (12%), ESIC (0.75%), PT, TDS
                                                  │     ├── Recovers loan installments from employee_loans
                                                  │     └── Calculates Net Payble
                                                  ├── Inserts payslip_employees
                                                  └── Invokes Puppeteer to render PDF slip in backend/invoices/
                                                  ▼
[HR Manager] ◄──(Downloads Payslip PDF & Excel Bank Transfer Sheet)───┘
```

### 26.5 Workflow 5: Site GST Purchase Entry & Branch Wallet Debit
```
[Site Supervisor] ──(Enters Bill Date, Amount, Vendor, Taxes)──► [CreditPurchase.jsx]
                                                                      │
                                                           (POST /api/credit-purchase)
                                                                      ▼
                                                           [creditPurchase.controller.js]
                                                                      ├── Validates branch_wallets.balance >= total_amount
                                                                      ├── Inserts credit_purchases_new (Header)
                                                                      ├── Inserts credit_purchase_items_new (Lines)
                                                                      ├── Updates branch_wallets:
                                                                      │     balance = balance - total_amount
                                                                      │     total_spent = total_spent + total_amount
                                                                      └── Returns success response
                                                                      ▼
[Accounting UI] ◄──(Updates Branch Wallet balance & displays purchase row)──┘
```

### 26.6 Workflow 6: Client Sales Invoicing & Payment Remittance
```
[Billing Executive] ──(Selects Client, Items, GST Brackets)──► [SaleBillCreate.jsx]
                                                                     │
                                                           (POST /api/salebill)
                                                                     ▼
                                                           [saleBill.controller.js:createSaleBill]
                                                                     ├── Computes Subtotal, CGST, SGST, IGST, Total Amount
                                                                     ├── Inserts sale_bills (status = 'Unpaid')
                                                                     ├── Generates Invoice PDF via Puppeteer
                                                                     └── Returns Invoice payload
                                                                     ▼
[Client Pays Cheque/NEFT] ──► [Records Payment: POST /api/sale-bill-payments]
                                     │
                                     ▼
                           [saleBillPayment.controller.js]
                                     ├── Inserts sale_bill_payments
                                     ├── Sums all payments for invoice
                                     └── Updates sale_bills:
                                           received_amount = sum(payments)
                                           status = 'Paid' (if received >= total)
```


---

## 27. CONSOLIDATED BUG & RISK INVENTORY

| ID | Category | Issue | Evidence (File & Line) | Severity | Affected Module | Affected File | Impact | Recommended Direction |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Security | Hardcoded JWT Fallback Secret | `auth.controller.js:15`, `auth.middleware.js:30` | 🔴 **CRITICAL** | Authentication | `backend/controllers/auth.controller.js` | Trivial token forgery allows root impersonation. | Add strong `JWT_SECRET` to `.env` and throw error on boot if undefined. |
| **SEC-02** | Security | Unauthenticated Statutory Contribution CRUD | `companyContribution.routes.js:6-10` | 🔴 **CRITICAL** | Payroll / Compliance | `backend/routes/companyContribution.routes.js` | Public users can create, modify, or delete PF/ESIC data. | Wrap all routes in `auth` and `authorize` middleware. |
| **SEC-03** | Security | 10-Year Token Expiration Lifespan | `auth.controller.js:109, 117, 153` | 🟠 **HIGH** | Authentication | `backend/controllers/auth.controller.js` | Compromised tokens never expire. | Reduce token lifespan to 15m; rely on refresh token rotation. |
| **SEC-04** | Security | In-Memory RAM Refresh Tokens | `auth.controller.js:19, 121, 144` | 🟠 **HIGH** | Authentication | `backend/controllers/auth.controller.js` | Process restarts log out all users; RAM leaks. | Persist refresh tokens in a database table or Redis cache. |
| **SEC-05** | Security | Public Static KYC File Exposure | `server.js:125` | 🟠 **HIGH** | Storage / KYC | `backend/server.js` | Anyone can download employee Aadhaar/PAN cards. | Serve documents via protected stream endpoint checking `auth`. |
| **SEC-06** | Security | Unauthenticated Travel & Training CRUD | `travel.routes.js:6-10`, `training.routes.js:7-11` | 🟠 **HIGH** | Operations / HR | `backend/routes/travel.routes.js` | Anonymous users can alter corporate travel and training. | Attach authentication and role authorization middleware. |
| **SEC-07** | Security | Unauthenticated Homepage Deletion | `homescreen.routes.js:8-9` | 🟠 **HIGH** | System / Branding | `backend/routes/homescreen.routes.js` | Public DELETE allows wiping homepage logos and assets. | Protect `DELETE /api/homescreen/:id` with `auth` and admin role. |
| **BUG-01** | Runtime Crash | Undeclared Variable in `updateProfile` | `auth.controller.js:353` (`await db('users')`) | 🔴 **CRITICAL** | User Profile | `backend/controllers/auth.controller.js` | Invoking profile update crashes with `ReferenceError`. | Replace Knex-style `db()` call with `User.update()`. |
| **PERF-01** | Performance | Quadruple DB Query Overhead per Request | `auth.middleware.js:44-53`, `authorize.js:90-99`| 🟡 **MEDIUM** | Middleware / Auth | `backend/middlewares/authorize.js` | 4 redundant SQL queries executed on every API call. | Reuse `req.user.permissions` already loaded in `auth.middleware`. |
| **PERF-02** | Performance | N+1 Sequential Database Iteration in Cron | `autoAbsent.cron.js:190-218` | 🟡 **MEDIUM** | Attendance | `backend/cron/autoAbsent.cron.js` | 1,000-2,000 individual queries in unbatched loop. | Execute single bulk set-based query (`INSERT INTO ... SELECT`). |
| **PERF-03** | Performance | Biometric Worker Overlap Race Condition | `biometricSync.worker.js:106` (`setInterval`) | 🟡 **MEDIUM** | Biometric Sync | `backend/workers/biometricSync.worker.js` | Concurrent batches overlap, creating duplicate punches. | Replace `setInterval` with recursive `setTimeout` after execution. |
| **DATA-01** | Data Integrity | Missing Transactions on Financial Writes | `creditPurchase.controller.js:120-170` | 🟠 **HIGH** | Accounting / Wallets | `backend/controllers/creditPurchase.controller.js`| Partial failures desynchronize wallet balance vs items. | Wrap header, items, and wallet updates in `sequelize.transaction`. |
| **DATA-02** | Data Drift | 18 Unmapped Database Columns | Multiple models (Section 9.2) | 🟡 **MEDIUM** | Sequelize ORM | `backend/models/*.model.js` | Columns like PO taxes and Work Order dates are ignored. | Update 11 Sequelize models to include all database columns. |
| **ARCH-01** | Architecture | Monolithic Controller Bloat (No Services) | `payslip.controller.js` (301 KB) | 🟡 **MEDIUM** | Backend Architecture | `backend/controllers/payslip.controller.js` | Extremely difficult to maintain, test, and audit. | Extract payroll math and PDF rendering into dedicated services. |
| **ARCH-02** | Architecture | Duplicate Route Mounts in `server.js` | `server.js:136, 143, 145, 227, 286, 295` | 🟡 **MEDIUM** | Routing | `backend/server.js` | Route shadowing and unexpected handler overrides. | Consolidate duplicate mounts and remove redundant registrations. |
| **ARCH-03** | Architecture | Faked HTTP Objects in Background Worker | `biometricSync.worker.js:9-24, 88-90` | 🔵 **LOW** | Worker / Sync | `backend/workers/biometricSync.worker.js` | Fakes Express req/res to call controller logic. | Extract ingestion logic into an internal service called by both. |

---

## 28. ARCHITECTURAL ASSESSMENT

### 28.1 Dimension-by-Dimension Scorecard
| Architectural Dimension | Rating | Forensic Assessment & Justification |
| :--- | :--- | :--- |
| **Overall System Architecture** | 🟡 **NEEDS ATTENTION** | Hybrid re-implementation from Laravel SaaS. Lacks clean separation of concerns; no service layer in backend; business logic trapped inside controllers. |
| **Code Maintainability** | 🟡 **NEEDS ATTENTION** | Extremely large monolithic controller files (`payslip.controller.js` 301 KB; `employee.controller.js` 157 KB); dead code; multiple duplicate libraries. |
| **System Scalability** | 🟡 **NEEDS ATTENTION** | In-memory session tokens; local disk upload storage; unbatched N+1 cron queries; lack of caching. Horizontal scaling is currently blocked. |
| **Security & Access Control** | 🔴 **HIGH RISK** | Hardcoded fallback JWT secrets; 10-year tokens; 28 unauthenticated endpoints; public static directory exposing employee identity documents. |
| **Runtime Performance** | 🟡 **NEEDS ATTENTION** | Quadruple database lookups on every authenticated request; heavy frontend bundle loading 6 icon packages and two full UI suites simultaneously. |
| **Database Design** | 🟡 **NEEDS ATTENTION** | 135 legacy orphaned tables (52% of database is dead weight); only 45 foreign keys across 260 tables; relational consistency managed purely by application code. |
| **Frontend Architecture** | 🟢 **ACCEPTABLE** | React 18 + Vite 7 SPA is well organized with Redux Toolkit and React Router 7. Clean component separation, though weighed down by redundant UI packages. |
| **Backend Architecture** | 🟡 **NEEDS ATTENTION** | Express 5 runtime is fast and stable, but crippled by lack of services, missing global error handling, and duplicate route mounts in `server.js`. |
| **Deployment Readiness** | 🔴 **HIGH RISK** | 0 Docker files; no migration system; no process supervisor configuration; local directory coupling. Currently depends on manual environment orchestration. |

---

## 29. ERP COMPLETE ARCHITECTURE DIAGRAM

```
                               ┌────────────────────────────────────────────────────────┐
                               │                    CLIENT DEVICES                      │
                               │  Desktop Browsers / Site Tablets / Mobile Web Clients  │
                               └───────────────────────────┬────────────────────────────┘
                                                           │
                                                           │ HTTP / HTTPS (Port 5173 / Production Web)
                                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                             REACT 18 SINGLE PAGE APPLICATION (VITE 7)                                 │
│                                                                                                                       │
│  [Routing Layer] React Router DOM v7 (111 Routes)                                                                     │
│     ├── Public Routes (/login, /register)                                                                             │
│     └── Protected Routes (AdminLayout -> PrivateRoute -> PermissionWith Guard)                                        │
│                                                                                                                       │
│  [State Management] Redux Toolkit Store                                                                               │
│     ├── authSlice (Token, User Profile, Role, Permission Set)                                                         │
│     └── Domain Slices (hrmSlice, attendanceSlice, salarySlice, roleSlice, userSlice)                                   │
│                                                                                                                       │
│  [UI Presentation Layer]                                                                                              │
│     ├── Ant Design 5 (Tables, Modals, Drawers, DatePickers) + React-Bootstrap 2.10 (Grid & Utilities)                 │
│     └── FullCalendar (Attendance/Shifts) + Recharts (HR & Accounting Analytics)                                       │
│                                                                                                                       │
│  [HTTP Client Layer] Axios Client (apiClient.js)                                                                      │
│     ├── Request Interceptor: Injects 'Authorization: Bearer <token>' from localStorage                                │
│     └── Response Interceptor: Global 401 redirect to /login; 403 Access Denied toast                                  │
└──────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────┘
                                                           │
                                                           │ REST API Calls: Base URL http://localhost:3004/api
                                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                             EXPRESS 5.1 REST API BACKEND SERVER                                      │
│                                                                                                                       │
│  [Server Entry Point] server.js (Port 3004)                                                                           │
│                                                                                                                       │
│  [Global Middlewares]                                                                                                 │
│     ├── CORS Filter: cors({ origin: '*', credentials: true })                                                         │
│     ├── Body Parsers: express.json(), express.urlencoded({ extended: true })                                          │
│     └── Static Directory Handlers: /uploads, /reports, /excel, /invoices                                              │
│                                                                                                                       │
│  [Security & Routing Layer] 59 Route Namespaces / 655 Endpoints                                                       │
│     ├── auth.middleware.js (Decodes JWT, queries User & Role from MySQL)                                              │
│     ├── authorize.js (Checks permission string, re-queries User & Role from MySQL)                                    │
│     └── biometricApiKey.js (Validates x-api-key for ingest endpoint)                                                  │
│                                                                                                                       │
│  [Controller Layer] 128 Monolithic Controllers (Business Logic, Math, Query Composition)                              │
│     ├── payslip.controller.js (301 KB) ────► Salary Breakdown Engine (utils/salaryBreakdown.js)                       │
│     ├── employee.controller.js (157 KB) ───► KYC File Handling via Multer (middlewares/upload.middleware.js)         │
│     ├── creditPurchase.controller.js (85 KB) ► Branch Wallet Debits & GST Accounting                                  │
│     └── saleBill.controller.js ─────────────► PDF Generation via Puppeteer (Template/invoiceGenerator.js)             │
│                                                                                                                       │
│  [Background Schedulers & Workers]                                                                                    │
│     ├── Cron: autoAbsent.cron.js (node-cron * * * * * -> Evaluates 23:59 IST daily absent marking)                    │
│     └── Worker: biometricSync.worker.js (Polls dmps.devicelogs every 2000ms -> Ingests to attendance_employees)       │
└─────────────────────────────────────────────┬───────────────────────────────────────────┬─────────────────────────────┘
                                              │                                           │
                                              │ Sequelize ORM (erpDB)                     │ Sequelize ORM (dmpsDB)
                                              ▼                                           ▼
                       ┌───────────────────────────────┐                 ┌───────────────────────────────┐
                       │     PRIMARY ERP DATABASE      │                 │       BIOMETRIC DATABASE      │
                       │         (erpprod2025)         │                 │             (dmps)            │
                       │                               │                 │                               │
                       │   • 260 MySQL Tables          │                 │   • devicelogs Table          │
                       │   • 128 Active ORM Models     │                 │   • Hardware Raw Punch Logs   │
                       │   • 135 Orphaned Legacy Tables│                 │   • Polled by Sync Worker     │
                       │   • 45 Foreign Key Constraints│                 │                               │
                       └───────────────────────────────┘                 └───────────────────────────────┘
                                                                                         ▲
                                                                                         │ Hardware Network Sync
                                                                         ┌───────────────┴───────────────┐
                                                                         │   PHYSICAL BIOMETRIC TERMINAL │
                                                                         │   Turnstile Fingerprint / Face│
                                                                         └───────────────────────────────┘
```

---

## 30. RECOMMENDED PRIORITY ORDER

To transition this ERP platform into a secure, robust, and maintainable enterprise system, remediation should proceed strictly according to the following phased roadmap.

### Phase 1: Immediate Critical Security & Stability Remediation (Week 1)
1. **Remedy Hardcoded JWT Secrets:**
   - Add strong cryptographic `JWT_SECRET` and `JWT_REFRESH_SECRET` strings to `backend/.env`.
   - Update `auth.controller.js` and `auth.middleware.js` to throw a fatal error on startup if these variables are undefined.
2. **Shorten Token Expiration & Persist Refresh Tokens:**
   - Reduce access token validity from 10 years (`3650d`) to 15 minutes (`15m`).
   - Move refresh tokens from volatile RAM (`refreshTokens = []`) into a dedicated MySQL table with IP/User-Agent tracking.
3. **Lock Down the 28 Unauthenticated Endpoints:**
   - Attach `auth` and `authorize` middleware across `companyContribution.routes.js`, `training.routes.js`, `travel.routes.js`, and `homescreen.routes.js`.
4. **Fix Runtime Reference Crash:**
   - Fix `ReferenceError: db is not defined` in `backend/controllers/auth.controller.js:353` by using Sequelize `User.update()`.
5. **Secure File Uploads:**
   - Remove unauthenticated static serving of `/uploads`. Implement an authorized streaming controller (`GET /api/documents/download/:filename`) that enforces role-based access.

### Phase 2: Core Data Integrity, Routing & Middleware Cleanup (Weeks 2–3)
1. **Eliminate Redundant Middleware Database Queries:**
   - Refactor `middlewares/authorize.js` to reuse `req.user.permissions` established by `auth.middleware.js`, saving 2–4 queries per request.
2. **Implement Sequelize Database Transactions:**
   - Wrap multi-table operations in `creditPurchase.controller.js`, `branchWallet.controller.js`, and `saleBill.controller.js` inside `sequelize.transaction()`.
3. **Consolidate Route Overrides in `server.js`:**
   - Remove duplicate mounts for `/api/leaves`, `/api/holidays`, `/api/payslips`, `/api/taxes`, and `/api/documents`.
   - Remove redundant invocations of `cors()` and `express.json()`.
4. **Synchronize Model Definitions with MySQL Schema:**
   - Update the 11 Sequelize models (Section 9.2) to map missing columns (`purchase_orders`, `sale_bills`, `new_work_orders`).
5. **Fix Worker Race Condition:**
   - Refactor `biometricSync.worker.js` from `setInterval` to a recursive `setTimeout` to prevent concurrent overlapping batches.

### Phase 3: Architectural Decoupling & Modernization (Weeks 4–6)
1. **Introduce a Backend Service Layer (`services/`):**
   - Extract payroll computation math from `payslip.controller.js` into `services/payroll.service.js`.
   - Extract employee onboarding and document linking from `employee.controller.js` into `services/employee.service.js`.
2. **Purge Dependency Redundancies:**
   - Uninstall abandoned `phantomjs-prebuilt` and standardize on `puppeteer` for PDF rendering.
   - Standardize on `bcrypt` (remove `bcryptjs`) and `exceljs` (remove `xlsx`).
   - Standardize frontend icons on `lucide-react` (remove redundant FontAwesome, Feather, and Bootstrap icon packages).
3. **Establish Database Migrations:**
   - Initialize Sequelize CLI (`npx sequelize-cli init`) and codify the baseline database schema into migration files.
4. **Archive & Drop the 135 Legacy Laravel Tables:**
   - Export an isolated archive of the 135 unused Laravel SaaS tables and safely drop them from `erpprod2025` to reduce database footprint and eliminate architectural confusion.


