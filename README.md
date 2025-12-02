## BharatForce – HR Super App (Demo Frontend)

**BharatForce** is a demo **HR, Payroll & Workforce Management** frontend built with React + Vite.  
It simulates a full‑fledged HR platform for a single tenant using in‑memory data and rich UI flows for:

- **Platform admin (multi‑tenant view)**
- **Company HR / Admin**
- **People managers**
- **Employees (self‑service)**

The app is designed as a **product demo / prototype** – no backend or authentication, but realistic modules, screens and mock data.

---

## Tech Stack

- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Routing**: `react-router-dom` (hash router)
- **State Management**: Custom context via `AppContext` (`context/AppContext.tsx`)
- **Charts & Visualizations**: `recharts`
- **Icons**: `lucide-react`
- **Styling**: Tailwind‑style utility classes (compiled via Vite setup)

---

## Project Structure (High Level)

- `index.tsx` – React bootstrap + Vite entry
- `App.tsx` – Router configuration and module routes, wrapped with `AppProvider`
- `context/AppContext.tsx` – **Single source of truth** for:
  - Current user, tenant, companies and role switching
  - In‑memory data stores (employees, jobs, attendance, leave, payroll, expenses, exit, performance, etc.)
  - Business functions (approve/reject flows, calculations stubs, mock side‑effects)
- `components/Layout.tsx` – **Shell layout**:
  - Sidebar navigation, role‑based menu, tenant switcher (for Super Admin)
  - Global search (employees, job requisitions, candidates)
  - Header with breadcrumbs and notifications
- `components/Dashboard.tsx` – Role‑specific dashboards:
  - Super Admin, Company Admin, Manager, and Employee views
- `components/*` – Feature modules, each with its own nested routes and screens
- `types.ts` – All domain types (User, Company, Employee, Leave, Payroll, etc.)
- `constants.ts` – Menu configuration and mock data (e.g. expense claims, resignations)

---

## Major Modules & What They Do

### 1. Platform Admin
- **File**: `components/PlatformAdmin/CompanyList.tsx`
- **Key capabilities**:
  - View list of tenant companies.
  - Super Admin can **switch tenant** using tenant dropdown in the header.

### 2. Org Setup
- **Entry**: Route `/org-setup/*` → `components/OrgSetup/OrgStructure.tsx`
- **Includes tabs** (under `components/OrgSetup/Tabs/*`):
  - `CompanyProfile` – Basic company & statutory information (placeholder UI).
  - `Branches`, `Departments`, `Designations`, `Grades`, `CostCenters` – Master data management UIs backed by `AppContext` CRUD helpers.

### 3. Core HR (Employee Master & Self Service)

- **Entry**: `/core-hr` → `components/CoreHR.tsx`
- **Key screens**:
  - Employee list with filters by **department**, **branch**, **status**, plus export and “Add Employee” modal (`AddEmployeeModal.tsx`).
  - Row actions to open full employee profile.
- **Employee profile**: `/core-hr/employee/:id` and `/my-profile` → `components/CoreHR/EmployeeProfile.tsx`
  - Tabbed profile with:
    - `BasicInfoTab.tsx` – Identification, contact and personal details.
    - `PersonalTab.tsx` – Additional personal information.
    - `EmploymentTab.tsx` – Job/position and employment metadata.
    - `BankTab.tsx` – Banking and payment data.
    - `EducationTab.tsx` – Education history.
    - `DocumentsTab.tsx` – HR document listing placeholders.
  - **Edit vs Read‑only** modes and **“Request Change”** self‑service flows for fields, raising profile change requests via `ProfileRequests`.
- **Profile Requests**:
  - `/core-hr/requests` → `components/CoreHR/ProfileRequests.tsx`
  - HR can review and act on change requests initiated from self‑service screens.

### 4. Recruitment

- **Entry**: `/recruitment/*` → `components/Recruitment.tsx`
- **Features (under `components/Recruitment/*`)**:
  - Job requisition lifecycle (form, list, detail).
  - Position list and pipeline view (`PipelineBoard.tsx`).
  - Candidate list and detail, interview scheduling (`ScheduleInterviewModal.tsx`), and interview list (`InterviewList.tsx`).
  - Offers – offer form, list and detail, status management.
- **Business logic** (in `AppContext`):
  - Approving a job requisition automatically creates a **JobPosition**.
  - Candidate and interview updates stay in in‑memory context state.

### 5. Onboarding

- **Entry**: `/onboarding/*` → `components/Onboarding.tsx`
- **Screens**:
  - `OnboardingList.tsx` – All onboarding records.
  - `OnboardingDetail.tsx` – Checklists and status.
  - `OnboardingChecklist.tsx` – Task breakdown for new joiners.
  - `NewOnboardingModal.tsx` – Creating onboarding records from hires.
- All actions are persisted in `onboardingRecords` via `AppContext`.

### 6. Attendance

- **Entry**: `/attendance/*` → `components/Attendance.tsx`
- **Role‑aware tabs**:
  - **HR / Super Admin**: Daily Console, Regularisation, Finalisation, Payroll Export, OT Summary, Attendance Policies, Payroll Mapping, Shifts, Weekly Offs, Mappings, Geofencing.
  - **Managers / HR**: Team Attendance, Team OT, Approvals.
  - **Employees**: My Attendance.
- **Key feature components** (under `components/Attendance/*`):
  - Policy setup (`PolicyMaster.tsx`), shifts (`ShiftMaster.tsx`), weekly off patterns, employee mappings, geofencing config, and payroll day mapping.
  - Consoles for daily attendance, team view, regularisation approvals, OT summary, attendance finalisation, and payroll export.
- **Business logic**:
  - Punching in/out from Employee Dashboard updates `attendancePunches` (via `addPunch`).
  - `isPeriodClosed` checks if a date lies within closed attendance periods.
  - Process/lock, summary generation and closures are stubbed but wired to context for future implementation.

### 7. Leave Management

- **Entry**: `/leave/*` → `components/Leave.tsx`
- **Screens** (under `components/Leave/*`):
  - Leave types & policies (`LeaveTypes.tsx`, `LeavePolicies.tsx`, `LeavePolicyEditor.tsx`, `LeavePolicyMappings.tsx`).
  - Holiday calendars and holidays.
  - Employee leave balances, accruals, accrual runs and history.
  - Leave summary and analytics.
  - Employee self‑service (Apply Leave, My Applications) and team approvals.
  - Payroll sync, encashment, and period closure tools.
- **Context support**:
  - In‑memory arrays for policies, balances, accrual runs, requests and encashments.
  - Approve/reject stubs plus a working `submitLeaveApplication` that returns a success object.

### 8. Payroll

- **Entry**: `/payroll/*` → `components/Payroll.tsx`
- **Screens** (under `components/Payroll/*`):
  - Payroll configuration & statutory config (`PayrollConfiguration.tsx`, `StatutoryConfig.tsx`).
  - Pay component master & salary structure templates.
  - Employee salary assignments.
  - Payroll run console, JV exports, compliance file generation (`ComplianceFiles.tsx`).
  - My Payslips and payslip viewer.
- **Context logic**:
  - In‑memory payroll configurations, templates, assignments, runs and outputs.
  - Realistic upsert helpers for PF/ESI/PT configuration.
  - Stubs for creating runs, calculating, approving, deleting, JV export and compliance batches.

### 9. Performance Management

- **Entry**: `/performance/*` → `components/Performance.tsx`
- **Sub‑modules** (under `components/Performance/*`):
  - KPI framework, goal library and mappings.
  - Performance cycles, appraisal cycles, forms and rating bands.
  - Employee performance plans (with `getOrCreatePerformancePlan` helper).
  - Feedback: templates, mappings, tasks, requests and responses.
  - Promotion and increment proposals, with approve/reject stubs and letter templates.
  - Payroll sync integration for performance outcomes.

### 10. Expenses

- **Entry**: `/expenses/*` → `components/Expenses.tsx`
- **Features**:
  - Expense categories, policies, and policy mappings.
  - Employee expense claims and advances (self‑service + approvals).
  - Team approvals and company‑wide expense reports.
- **Mock data & logic**:
  - Initial expense claims and advances are seeded from `MOCK_EXPENSE_CLAIMS` and `MOCK_EXPENSE_ADVANCES`.
  - Approval flows for claims and advances, including auto‑closing linked advances when claims are HR‑approved.

### 11. Exit Management

- **Entry**: `/exit/*` → `components/Exit.tsx`
- **Tabs**:
  - My Resignation, Team Resignations, All Resignations.
  - F&F settlements, F&F detail, and checklist configuration.
- **Context logic**:
  - Resignation workflow: submit, approve/reject by Manager or HR, with role‑specific statuses.
  - Exit checklist initialization based on company‑specific `ExitClearanceItem` master.
  - Exit completion sets `isExitCompleted` on the resignation.
  - Mock F&F settlements, exit assets and HR exit forms, all stored in context.

### 12. Self‑Service Extras

- **My Team**: `/my-team` → team list view for managers.
- **My Goals**: `/my-goals` → basic performance self‑service entry point.
- **My Letters**: `/my-letters` → generated letter view (backed by `generatedLetters` in context).

### 13. Generic Placeholders

Some modules are represented via `GenericModule.tsx` for future expansion:

- Learning & Development (`/lms`)
- Assets & Expenses (`/assets`)
- Employee Engagement (`/engagement`)
- Documents (`/documents`)
- Settings (`/settings`)

---

## Roles & Demo Behaviour

The app is **single-page, no login**, but you can simulate roles:

- Open the **user panel** in the left sidebar footer and use **“Switch Role (Demo)”**:
  - Company Admin (HR)
  - Manager (Rohan)
  - Employee (Priya)
  - Super Admin
- The selected role drives:
  - **Sidebar menu** (different navigation sets per role).
  - **Dashboard view** (Super Admin / Admin / Manager / Employee dashboards).
  - **Module visibility and scoping** (e.g. attendance tabs, exit tabs, approvals).

---

## Running the Project Locally

**Prerequisites**

- Node.js (LTS recommended)

**Steps**

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run the dev server**

   ```bash
   npm run dev
   ```

3. **Open the app**

   - Visit the URL printed by Vite (typically `http://localhost:5173/`).
   - The app uses **hash‑based routing**, so URLs look like `http://localhost:5173/#/core-hr`.

No `.env` or API keys are required; all data is mocked in the browser.

---

## Development Notes

- **State is in‑memory** – refreshing the browser resets all mock data.
- **Business logic**:
  - Complex operations (payroll calculations, leave accrual engines, etc.) are **stubbed** but wired to real domain types ready for backend integration.
  - Where flows are implemented (e.g. recruitments, exit approvals, expense approvals), they update context state and often stamp metadata (dates, approver names).
- **Styling**:
  - Layout, tables and forms use Tailwind‑style utility classes for a modern SaaS‑style UI.
  - Icons and charts are chosen to mimic a production HR analytics dashboard.

This project is intended as a **functional prototype / demo** for BharatForce – a full‑stack implementation would replace the mocks in `AppContext` with real API calls and persistence. 
