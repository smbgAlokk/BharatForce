import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
  href,
} from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { Login } from "./components/Auth/Login";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { UserRole } from "./types";

// Module Imports
import { ForgotPassword } from "./components/Auth/ForgotPassword";
import { ResetPassword } from "./components/Auth/ResetPassword";
import { CoreHR } from "./components/CoreHR";
import { Recruitment } from "./components/Recruitment";
import { Onboarding } from "./components/Onboarding";
import { Payroll } from "./components/Payroll";
import { Performance } from "./components/Performance";
import { Attendance } from "./components/Attendance";
import { Leave } from "./components/Leave";
import { Expenses } from "./components/Expenses";
import { Exit } from "./components/Exit";
import { GenericModule } from "./components/GenericModule";
import { CompanyList } from "./components/PlatformAdmin/CompanyList";
import { OrgStructure } from "./components/OrgSetup/OrgStructure";
import { EmployeeProfile } from "./components/CoreHR/EmployeeProfile";
import { ProfileRequests } from "./components/CoreHR/ProfileRequests";
import { TeamList } from "./components/MyTeam/TeamList";
import { InterviewList } from "./components/Recruitment/InterviewList";
import { MyGoals } from "./components/MyGoals/MyGoals";
import { MyLetters } from "./components/MyLetters/MyLetters";

// ✅ HELPER CONSTANTS FOR ROLES
const ALL_ROLES = [
  UserRole.SUPER_ADMIN,
  UserRole.COMPANY_ADMIN,
  UserRole.MANAGER,
  UserRole.EMPLOYEE,
];
const COMPANY = [UserRole.COMPANY_ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE];
const ADMIN_ROLES = [UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN];
const ADMIN_MANAGER = [UserRole.COMPANY_ADMIN, UserRole.MANAGER];
const HR = UserRole.COMPANY_ADMIN;
const MANAGER = UserRole.MANAGER;
function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* 1. PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* 2. PROTECTED ROUTES */}
          <Route
            path="/*"
            element={
              <ProtectedRoute allowedRoles={ALL_ROLES}>
                <Layout>
                  <Routes>
                    {/* --- DASHBOARD (Accessible to All) --- */}
                    <Route path="/" element={<Dashboard />} />
                    <Route
                      path="/dashboard"
                      element={<Navigate to="/" replace />}
                    />

                    {/* --- SUPER ADMIN ONLY --- */}
                    <Route
                      path="/platform/companies"
                      element={
                        <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                          <CompanyList />
                        </ProtectedRoute>
                      }
                    />

                    {/* --- ADMIN ONLY MODULES --- */}
                    <Route
                      path="/org-setup/*"
                      element={
                        <ProtectedRoute allowedRoles={HR}>
                          <OrgStructure />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/core-hr"
                      element={
                        <ProtectedRoute allowedRoles={HR}>
                          <CoreHR />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/core-hr/requests"
                      element={
                        <ProtectedRoute allowedRoles={HR}>
                          <ProfileRequests />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/payroll/*"
                      element={
                        <ProtectedRoute allowedRoles={HR}>
                          <Payroll />
                        </ProtectedRoute>
                      }
                    />

                    {/* --- ADMIN & MANAGER MODULES --- */}
                    <Route
                      path="/recruitment/*"
                      element={
                        <ProtectedRoute allowedRoles={ADMIN_MANAGER}>
                          <Recruitment />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/onboarding/*"
                      element={
                        <ProtectedRoute allowedRoles={ADMIN_MANAGER}>
                          <Onboarding />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-team"
                      element={
                        <ProtectedRoute allowedRoles={MANAGER}>
                          <TeamList />
                        </ProtectedRoute>
                      }
                    />

                    {/* --- ALL EMPLOYEES (Self Service) --- */}
                    <Route
                      path="/my-profile"
                      element={
                        <ProtectedRoute
                          allowedRoles={[
                            "EMPLOYEE",
                            "MANAGER",
                            "COMPANY_ADMIN",
                          ]}
                        >
                          <EmployeeProfile />
                        </ProtectedRoute>
                      }
                    />
                    {/* View ANY employee profile (Usually restricted to Admin/Manager, but can be open for directory) */}
                    <Route
                      path="/core-hr/employee/:id"
                      element={
                        <ProtectedRoute allowedRoles={ADMIN_MANAGER}>
                          <EmployeeProfile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-goals"
                      element={
                        <ProtectedRoute allowedRoles={COMPANY}>
                          <MyGoals />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-letters"
                      element={
                        <ProtectedRoute allowedRoles={COMPANY}>
                          <MyLetters />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-interviews"
                      element={
                        <ProtectedRoute allowedRoles={COMPANY}>
                          <InterviewList />
                        </ProtectedRoute>
                      }
                    />

                    {/* --- MODULES WITH INTERNAL PERMISSIONS (Mixed Access) --- */}
                    {/* Example: Everyone can see Attendance, but only Admins see "Settings" inside it. 
                        Note: The Module component itself should handle internal tab protection. 
                        Here we allow entry to the module. */}
                    <Route
                      path="/attendance/*"
                      element={
                        <ProtectedRoute allowedRoles={COMPANY}>
                          <Attendance />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/leave/*"
                      element={
                        <ProtectedRoute allowedRoles={COMPANY}>
                          <Leave />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/expenses/*"
                      element={
                        <ProtectedRoute allowedRoles={COMPANY}>
                          <Expenses />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/performance/*"
                      element={
                        <ProtectedRoute allowedRoles={COMPANY}>
                          <Performance />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/exit/*"
                      element={
                        <ProtectedRoute allowedRoles={COMPANY}>
                          <Exit />
                        </ProtectedRoute>
                      }
                    />

                    {/* --- GENERIC MODULES --- */}
                    <Route
                      path="/lms"
                      element={
                        <ProtectedRoute allowedRoles={COMPANY}>
                          <GenericModule title="L & D" description="Training" />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/assets"
                      element={
                        <ProtectedRoute allowedRoles={COMPANY}>
                          <GenericModule
                            title="Assets"
                            description="Asset Tracking"
                          />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/engagement"
                      element={
                        <ProtectedRoute allowedRoles={COMPANY}>
                          <GenericModule
                            title="Engagement"
                            description="Surveys"
                          />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/documents"
                      element={
                        <ProtectedRoute allowedRoles={COMPANY}>
                          <GenericModule
                            title="Documents"
                            description="Policies"
                          />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                          <GenericModule
                            title="Settings"
                            description="Configuration"
                          />
                        </ProtectedRoute>
                      }
                    />

                    {/* Catch-all Redirect */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
