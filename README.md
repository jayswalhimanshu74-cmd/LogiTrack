# 📦 LogiTrack — Enterprise Inventory Management System (IMS)

[![Java Version](https://img.shields.io/badge/Java-21-orange.svg?style=for-the-badge&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-brightgreen.svg?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC.svg?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18.4-blue.svg?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-8.1.1-646CFF.svg?style=for-the-badge&logo=vite)](https://vite.dev/)

LogiTrack is a production-ready, enterprise-grade **Inventory Management System (IMS)** built with a secure **Spring Boot** REST API backend and a responsive, high-performance **React** frontend. It leverages a modern design system, JWT token authentication, real-time database validation constraints, and fallback demo-mode sync capabilities.

---

## 🚀 Core Platform Features

-   **Stateless JWT Security & Role Authorization:** Stateless session handling via custom filter chains, BCrypt hashing, and role checks (`STAFF`, `ADMIN`).
-   **Interactive Metrics Dashboard:** Real-time calculation of total products, low-stock warnings, out-of-stock indicators, category counts, and financial transaction ledger feeds.
-   **Robust Product Management Module:**
    -   Paginated listing, sorting columns, and fuzzy search queries.
    -   Dual-layer business validation (Zod resolver on client, `@AssertTrue` validation on DTOs).
    -   Prevents duplicate SKUs and checks price margin relationships (`Selling Price > Purchase Price`).
    -   Right-sliding details drawers and modal dialog controllers.
-   **Auditing Base Logs:** Automatic tracking of creation and modification timestamps across transaction tables.
-   **Resilience & Offline Synchronization:** Client automatically switches into offline **Demo Mode** if the REST backend becomes unreachable, ensuring uninterrupted demonstration capabilities.

---

## 🛠️ Architecture & Technical Stack

### Frontend Client
*   **Framework:** React 19 + Vite (Rolldown bundler)
*   **Styling:** Tailwind CSS v4 (Design tokens + Custom CSS variables)
*   **Forms & Validation:** React Hook Form + Zod Schema Resolver
*   **Http Client:** Axios (Custom JWT Authorization Interceptors)
*   **Animations & Icons:** Framer Motion + Lucide React Icons

### Backend API Service
*   **Runtime:** Java 21 + Spring Boot 4.1.0
*   **Data Security:** Spring Security + JWT (`jjwt` 0.12.6)
*   **Database ORM:** Hibernate JPA + HikariCP Connection Pooling
*   **Database:** PostgreSQL 18.4

---

## 📂 System Project Layout

```
Inventory-Managment-System
├── IMS_backend/                     # Spring Boot API
│   ├── src/main/java/com/.../system/
│   │   ├── auth/                    # Registration & Login endpoints
│   │   ├── config/                  # Security configuration, CORS, Seeders
│   │   ├── dashboard/               # Stats controllers & repositories
│   │   ├── exception/               # Global validation handlers
│   │   ├── product/                 # Products CRUD, JPA, DTOs
│   │   ├── security/                # JWT filters & Auth providers
│   │   └── utill/                   # Auditing & JWT utils
│   └── pom.xml                      # Maven dependencies
│
├── IMS_frontend/                    # React SPA Client
│   ├── src/
│   │   ├── api/                     # Axios instance & HTTP services
│   │   ├── components/              # Modals, Slideouts, Navigation
│   │   ├── pages/                   # Views (Dashboard, Products, Invoices)
│   │   ├── App.jsx                  # React Router mapping
│   │   └── index.css                # Tailwind theme overrides
│   ├── package.json                 # Node package configuration
│   └── vite.config.js               # Bundler settings
│
├── ARCHITECTURE.md                  # Comprehensive architectural blueprints
├── LOGITRACK_WORK_REPORT.md         # Deliverables work report
└── README.md                        # This document
```

---

## ⚙️ Quick Start Installation

> [!IMPORTANT]  
> Make sure PostgreSQL is installed and running on your host machine before starting the backend application context.

### 1. Database Setup
1. Connect via CLI or pgAdmin:
   ```bash
   psql -h localhost -U postgres
   ```
2. Create the case-sensitive database instance `"IMS"`:
   ```sql
   CREATE DATABASE "IMS";
   ```
3. Update connection parameters inside [application.properties](file:///d:/Projects/Inventory-Managment-System/IMS_backend/src/main/resources/application.properties):
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/IMS
   spring.datasource.username=postgres
   spring.datasource.password=YOUR_PG_PASSWORD
   ```

### 2. Launch Backend API Service
Navigate to the backend directory and launch using the Maven wrapper:
```bash
cd IMS_backend
./mvnw.cmd spring-boot:run
```
The server will start on port `8080` (accessible at `http://localhost:8080`).

### 3. Run Frontend Client
Navigate to the frontend directory, install npm modules, and start the development server:
```bash
cd IMS_frontend
npm install
npm run dev
```
The client dashboard will compile and open at `http://localhost:5173`.

---

## 📑 API Reference & Payloads

### JWT Authentication

#### Login Request
`POST /api/auth/login`
```json
{
  "email": "admin@logitrack.com",
  "password": "password123"
}
```

#### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBsb2dpdHJhY2suY29tIiwiaWF0IjoxN...",
  "email": "admin@logitrack.com",
  "fullName": "Administrator",
  "role": "ADMIN"
}
```

### Products Catalog

#### Create Product Request
`POST /api/products` (Header `Authorization: Bearer <Token>`)
```json
{
  "sku": "LOGI-MX3S-BLK",
  "name": "Logitech MX Master 3S Wireless Mouse",
  "category": "Electronics",
  "unit": "pcs",
  "purchasePrice": 45.00,
  "sellingPrice": 99.99,
  "quantityInStock": 25,
  "reorderLevel": 5
}
```

#### List Products (Filtered & Paginated)
`GET /api/products?page=0&size=10&sort=name,asc&search=Logitech`

---

## 🔒 Production Readiness Checklist

> [!WARNING]  
> Do not use default Spring properties or unvalidated schema configs in production environments.

- **Database Migrations:** Switch `spring.jpa.hibernate.ddl-auto` to `validate` or `none` and integrate **Flyway** or **Liquibase** to manage incremental DB changes.
- **In-Memory Testing:** Configure an H2 in-memory DB configuration inside `src/test/resources/application-test.properties` to isolate unit/integration test dependencies from your production instances.
- **Secrets Management:** Extract `app.jwt.secret` and database credentials out of git version controls into environment variables.
- **API Performance:** Configure Redis or Ehcache caches on heavy transactional endpoints (e.g. `/api/dashboard/stats`).
