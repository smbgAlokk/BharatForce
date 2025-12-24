# 🇮🇳 BharatForce

## Enterprise Core HR SaaS Platform

BharatForce is a **production-grade, multi-tenant Core HR Software-as-a-Service (SaaS)** platform designed to manage the complete employee lifecycle—from onboarding to offboarding—while enforcing **strict tenant isolation, role-based access control (RBAC), and enterprise-level security standards**.

This platform is engineered with **SaaS-first principles**, ensuring scalability, maintainability, and zero cross-tenant data leakage.

---

## 📌 Table of Contents

1. Overview
2. Core Objectives
3. Tech Stack
4. System Architecture
5. Architecture Diagrams
6. Key Features
7. Security & Compliance
8. Security Threat Model
9. API Documentation (OpenAPI Style)
10. Installation & Setup
11. Project Structure
12. Operational Practices
13. Current Implementation Status
14. Daily Changelog
15. Future Roadmap

---

## 1. Overview

BharatForce enables organizations to:

- Manage employees securely within isolated tenant boundaries
- Enforce role-based access across all resources
- Store and manage sensitive documents securely
- Maintain predictable, auditable backend behavior

Each tenant operates in **complete isolation** while sharing a common SaaS infrastructure.

---

## 2. Core Objectives

- True multi-tenancy with zero data leakage
- Security-by-design across API, database, and storage layers
- Atomic operations for critical workflows
- Scalable architecture without premature microservices
- Maintainable and audit-friendly codebase

---

## 3. Tech Stack

### Frontend

- React 18 (Vite)
- TypeScript (Strict Mode)
- Tailwind CSS
- React Context API
- Axios (Interceptors)
- React Router DOM v6
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB (Mongoose ODM)
- JWT Authentication
- Cloudinary (File Storage)
- Nodemailer (SMTP)

### Infrastructure & Tooling

- Monolithic SaaS Architecture (MVC Pattern)
- bcryptjs, helmet, cors
- Git Version Control

---

## 4. System Architecture

- Single backend serving all tenants
- Tenant context injected via middleware
- Role validation enforced at controller level
- Stateless authentication using JWT
- External services for email and file storage

---

## 5. Architecture Diagrams

### 5.1 High-Level SaaS Architecture

```text
┌─────────────┐
│   Browser   │
│ (React App) │
└──────┬──────┘
       │ HTTPS (JWT)
       ▼
┌───────────────────────┐
│  Express API Gateway  │
│  - Auth Middleware   │
│  - Tenant Context    │
│  - RBAC Enforcement  │
└──────┬────────┬───────┘
       │        │
       │        │
       ▼        ▼
┌──────────┐  ┌──────────────┐
│ MongoDB  │  │ Cloudinary   │
│ (Tenant  │  │ (Documents)  │
│ Isolated)│  └──────────────┘
└──────────┘
       │
       ▼
┌──────────────┐
│ SMTP Service │
│ (Emails)     │
└──────────────┘

```

## 5.2 Secure Request Lifecycle

```text

Client Request
     │
     ▼
JWT Verification
     │
Tenant Context Injection
     │
Role Authorization
     │
Ownership Validation
     │
Controller Execution
     │
Tenant-Scoped DB Query
```

---

## 6. Key Features

### 6.1 Multi-Tenant Architecture

- Every query scoped by tenantId / companyId
- No shared data access
- Tenant context injected server-side only

### 6.2 Role-Based Access Control (RBAC)

### 6.2 Role-Based Access Control (RBAC)

| Role              | Access Level                                        |
| ----------------- | --------------------------------------------------- |
| **SUPER_ADMIN**   | Platform-level administration and tenant management |
| **COMPANY_ADMIN** | Full employee lifecycle and document management     |
| **MANAGER**       | Limited team-level visibility and access            |
| **EMPLOYEE**      | Self-profile and personal document access only      |

---

### 6.3 Employee Lifecycle Management

#### Atomic Onboarding

- Uses MongoDB transactions to ensure consistency
- User and Employee records are created atomically
- Automatic rollback if any step in the process fails

#### Smart Synchronization

- Updates to HR profile fields (name, email, role) automatically sync with the authentication user record

#### Credential Rotation

- Email updates trigger automatic password invalidation
- Secure re-invitation email sent with fresh credentials

#### Deep-Clean Offboarding

- Deletes employee HR profile and authentication user
- Physically removes all associated documents from Cloudinary
- Ensures zero orphaned records or files

---

### 6.4 Document Management System (DMS)

- Secure, Cloudinary-backed document storage
- Automatic deletion of old files on document replacement
- Signed URLs for controlled access and downloads
- Guarantees zero orphaned documents in cloud storage

---

## 7. Security & Compliance

### Implemented Controls

- JWT signature verification with expiration enforcement
- Password hashing using bcrypt with double-hash prevention logic
- BOLA / IDOR protection via ownership validation
- Role-based and resource-level authorization checks
- Secure HTTP headers enforced using Helmet
- Strict Cross-Origin Resource Sharing (CORS) policies

**Security Principle**

> The backend is the final authority.  
> Frontend optimizations never replace server-side validation.

---

## 8. Security Threat Model

### STRIDE-Based SaaS Threat Modeling

#### Spoofing

- JWT signature validation
- Token expiration enforcement to prevent reuse

#### Tampering

- Tenant and ownership context injected server-side only
- Request payloads are never trusted for authorization decisions

#### Repudiation

- Controlled and deterministic API responses
- Predictable error handling without sensitive data leakage

#### Information Disclosure

- Tenant-scoped database queries enforced at controller level
- Ownership checks applied to every protected resource

#### Denial of Service

- Restricted and minimal exposed endpoints
- Expensive operations blocked for unauthorized users

#### Elevation of Privilege

- Explicit RBAC enforcement on every protected route
- No trust placed on frontend role assertions

## 9. API Documentation (OpenAPI Style)

**Base Path**

```bash
/api
```

**Authentication**

```yaml
security:
  bearerAuth: []
```

**Employees API**

1. **GET /employees/{tenantId}**

   ```yaml
   roles: COMPANY_ADMIN
   responses:
     200: Employee list
     403: Forbidden
   ```

2. **GET /employees/me**

   ```yaml
   roles: AUTHENTICATED
   responses:
     200: Own profile
   ```

3. **GET /employees/detail/{id}**

   ```yaml
   roles: OWNER | COMPANY_ADMIN
   responses:
     200: Employee details
     403: Unauthorized
   ```

**Document API**

**POST /upload**

```yaml
consumes: multipart/form-data
responses:
  201: File uploaded
```

---

## 10. Installation & Setup

**Prerequisites**

- Node.js v18+
- MongoDB Atlas
- Cloudinary Account
- SMTP Service
- Clone Repository

**Clone Repository**

```bash
git clone https://github.com/yourusername/bharatforce.git
cd bharatforce

```

**Backend Setup**

```bash
cd Backend
npm install
touch .env

```

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

EMAIL_SERVICE=gmail
EMAIL_USER=your_email
EMAIL_PASS=your_password

CLOUDINARY_CLOUD_NAME=cloud_name
CLOUDINARY_API_KEY=api_key
CLOUDINARY_API_SECRET=api_secret

```

```bash
npm start

```

**_Frontend Setup_**

```bash
cd Frontend
npm install
npm run dev
```

---

## 11. Project Structure

```test
BharatForce/
├── Backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
└── Frontend/
    └── src/
```

## 12. Operational Practices

- Secrets managed via environment variables only
- No credentials committed to Git
- Backend authorization is the single source of truth
- Production-safe logging

---

## 13. Current Implementation Status

- Multi-Tenancy: ✅
- RBAC: ✅
- Secure Authentication: ✅
- Document Management: ✅
- Atomic Transactions: ✅
- IDOR / BOLA Protection: ✅

---

## 14. Daily Changelog

- This section is updated daily based on engineering reports.
- Authentication middleware hardened
- Tenant-bound authorization enforced
- Token verification standardized

---

## 15. Future Roadmap

- Leave Management System
- Attendance with Geo-Fencing
- Payroll Engine
- Audit Logs
- WhatsApp & Email Notification Engine

---

## BharatForce is a living SaaS platform.

**_This README evolves daily with the product._**
