


import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { PayrollConfiguration } from './Payroll/PayrollConfiguration';
import { PayComponentMaster } from './Payroll/PayComponentMaster';
import { SalaryStructureTemplates } from './Payroll/SalaryStructureTemplates';
import { EmployeeSalaryAssignments } from './Payroll/EmployeeSalaryAssignments';
import { StatutoryConfig } from './Payroll/StatutoryConfig';
import { PayrollRunConsole } from './Payroll/PayrollRunConsole';
import { MyPayslips } from './Payroll/MyPayslips';
import { PayrollReports } from './Payroll/PayrollReports';
import { JVExport } from './Payroll/JVExport';
import { ComplianceFiles } from './Payroll/ComplianceFiles';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Payroll: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useApp();
  const [activeTab, setActiveTab] = useState('config');

  const isHR = userRole === UserRole.COMPANY_ADMIN;
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  const isEmployee = userRole === UserRole.EMPLOYEE;

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/config')) setActiveTab('config');
    else if (path.includes('/statutory')) setActiveTab('statutory');
    else if (path.includes('/components')) setActiveTab('components');
    else if (path.includes('/templates')) setActiveTab('templates');
    else if (path.includes('/assignments')) setActiveTab('assignments');
    else if (path.includes('/runs')) setActiveTab('runs');
    else if (path.includes('/payslips')) setActiveTab('payslips');
    else if (path.includes('/reports')) setActiveTab('reports');
    else if (path.includes('/jv')) setActiveTab('jv');
    else if (path.includes('/compliance')) setActiveTab('compliance');
    else {
       if (isEmployee) setActiveTab('payslips');
       else setActiveTab('runs');
    }
  }, [location.pathname, isEmployee]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/payroll/${tab}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payroll Management</h1>
        <p className="text-slate-500 mt-1">Manage salary structures, statutory compliance, and monthly processing.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
         <div className="flex border-b border-slate-100 overflow-x-auto custom-scrollbar">
            {(isHR || isSuperAdmin) && (
               <>
                  <button onClick={() => handleTabChange('runs')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'runs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Payroll Runs
                  </button>
                  <button onClick={() => handleTabChange('reports')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'reports' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Reports
                  </button>
                  <button onClick={() => handleTabChange('jv')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'jv' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     JV Export
                  </button>
                  <button onClick={() => handleTabChange('compliance')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'compliance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Compliance
                  </button>
                  <div className="w-px bg-slate-200 mx-2 my-3"></div>
                  <button onClick={() => handleTabChange('config')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'config' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Configuration
                  </button>
                  <button onClick={() => handleTabChange('statutory')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'statutory' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Statutory
                  </button>
                  <button onClick={() => handleTabChange('components')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'components' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Pay Components
                  </button>
                  <button onClick={() => handleTabChange('templates')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'templates' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Templates
                  </button>
                  <button onClick={() => handleTabChange('assignments')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'assignments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Salary Map
                  </button>
               </>
            )}
            <button onClick={() => handleTabChange('payslips')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'payslips' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
               My Payslips
            </button>
         </div>

         <div className="p-6 bg-slate-50 min-h-[500px]">
            <Routes>
               {/* Operational */}
               <Route path="runs" element={<PayrollRunConsole />} />
               <Route path="payslips" element={<MyPayslips />} />
               <Route path="reports" element={<PayrollReports />} />
               <Route path="jv" element={<JVExport />} />
               <Route path="compliance" element={<ComplianceFiles />} />

               {/* Config */}
               <Route path="config" element={<PayrollConfiguration />} />
               <Route path="statutory" element={<StatutoryConfig />} />
               <Route path="components" element={<PayComponentMaster />} />
               <Route path="templates" element={<SalaryStructureTemplates />} />
               <Route path="assignments" element={<EmployeeSalaryAssignments />} />
               
               <Route path="*" element={<Navigate to={isEmployee ? "payslips" : "runs"} replace />} />
            </Routes>
         </div>
      </div>
    </div>
  );
};
