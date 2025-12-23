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
