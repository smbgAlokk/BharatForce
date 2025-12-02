
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { CoreHR } from './components/CoreHR';
import { Recruitment } from './components/Recruitment';
import { Onboarding } from './components/Onboarding';
import { Payroll } from './components/Payroll';
import { Performance } from './components/Performance';
import { Attendance } from './components/Attendance';
import { Leave } from './components/Leave';
import { Expenses } from './components/Expenses';
import { Exit } from './components/Exit';
import { GenericModule } from './components/GenericModule';

// New Components
import { CompanyList } from './components/PlatformAdmin/CompanyList';
import { OrgStructure } from './components/OrgSetup/OrgStructure';
import { EmployeeProfile } from './components/CoreHR/EmployeeProfile';
import { ProfileRequests } from './components/CoreHR/ProfileRequests';
import { TeamList } from './components/MyTeam/TeamList';
import { InterviewList } from './components/Recruitment/InterviewList';
import { MyGoals } from './components/MyGoals/MyGoals';
import { MyLetters } from './components/MyLetters/MyLetters';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            
            {/* Platform Admin Routes */}
            <Route path="/platform/companies" element={<CompanyList />} />
            
            {/* Module 1: Org Structure */}
            <Route path="/org-setup/*" element={<OrgStructure />} />

            {/* Module 2: Core HR (Employee Master) */}
            <Route path="/core-hr" element={<CoreHR />} />
            <Route path="/core-hr/requests" element={<ProfileRequests />} />
            <Route path="/core-hr/employee/:id" element={<EmployeeProfile />} />

            {/* Module 2 Part 4: Self Service & Manager */}
            <Route path="/my-profile" element={<EmployeeProfile />} />
            <Route path="/my-team" element={<TeamList />} />
            <Route path="/my-goals" element={<MyGoals />} />
            <Route path="/my-letters" element={<MyLetters />} />

            {/* Module 3: Recruitment */}
            <Route path="/recruitment/*" element={<Recruitment />} />
            <Route path="/my-interviews" element={<InterviewList />} />

            {/* Module 4: Onboarding */}
            <Route path="/onboarding/*" element={<Onboarding />} />
            
            {/* Module 5: Attendance */}
            <Route path="/attendance/*" element={<Attendance />} />

            {/* Module 6: Leave Management */}
            <Route path="/leave/*" element={<Leave />} />

            {/* Module 8: Performance */}
            <Route path="/performance/*" element={<Performance />} />

            {/* Module 7: Payroll */}
            <Route path="/payroll/*" element={<Payroll />} />

            {/* Module 9: Expenses */}
            <Route path="/expenses/*" element={<Expenses />} />

            {/* Module 10: Exit */}
            <Route path="/exit/*" element={<Exit />} />

            {/* Placeholders */}
            <Route path="/lms" element={<GenericModule title="Learning & Development" description="Course catalog and training tracking." />} />
            <Route path="/assets" element={<GenericModule title="Assets & Expenses" description="Track company assets and process expense reimbursements." />} />
            <Route path="/engagement" element={<GenericModule title="Employee Engagement" description="Surveys, announcements, and helpdesk." />} />
            <Route path="/documents" element={<GenericModule title="Documents" description="Central repository for HR policies and letters." />} />
            <Route path="/settings" element={<GenericModule title="Settings" description="Tenant configuration, roles, and statutory settings." />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;
