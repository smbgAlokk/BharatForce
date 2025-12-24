






import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LeaveTypes } from './Leave/LeaveTypes';
import { LeavePolicies } from './Leave/LeavePolicies';
import { HolidayCalendars } from './Leave/HolidayCalendars';
import { LeavePolicyMappings } from './Leave/LeavePolicyMappings';
import { LeaveBalances } from './Leave/LeaveBalances';
import { LeaveAccruals } from './Leave/LeaveAccruals';
import { LeavePeriodClosure } from './Leave/LeavePeriodClosure';
import { ApplyLeave } from './Leave/ApplyLeave';
import { MyApplications } from './Leave/MyApplications';
import { TeamApprovals } from './Leave/TeamApprovals';
import { LeaveConsole } from './Leave/LeaveConsole';
import { LeaveEncashmentView } from './Leave/LeaveEncashment';
import { LeaveSummary } from './Leave/LeaveSummary';
import { TeamLeaveSummary } from './Leave/TeamLeaveSummary';
import { LeavePayrollSyncView } from './Leave/LeavePayrollSync';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Leave: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useApp();
  const [activeTab, setActiveTab] = useState('types');

  // Check active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/types')) setActiveTab('types');
    else if (path.includes('/policies')) setActiveTab('policies');
    else if (path.includes('/holidays')) setActiveTab('holidays');
    else if (path.includes('/mappings')) setActiveTab('mappings');
    else if (path.includes('/balances')) setActiveTab('balances');
    else if (path.includes('/accruals')) setActiveTab('accruals');
    else if (path.includes('/closure')) setActiveTab('closure');
    else if (path.includes('/apply')) setActiveTab('apply');
    else if (path.includes('/my-applications')) setActiveTab('my-applications');
    else if (path.includes('/team-approvals')) setActiveTab('team-approvals');
    else if (path.includes('/console')) setActiveTab('console');
    else if (path.includes('/encashment')) setActiveTab('encashment');
    else if (path.includes('/summary')) setActiveTab('summary');
    else if (path.includes('/team-summary')) setActiveTab('team-summary');
    else if (path.includes('/payroll-sync')) setActiveTab('payroll-sync');
    else {
        // Default redirect logic
        if (userRole === UserRole.EMPLOYEE) setActiveTab('apply');
        else if (userRole === UserRole.MANAGER) setActiveTab('team-approvals');
        else setActiveTab('balances');
    }
  }, [location.pathname, userRole]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/leave/${tab}`);
  };

  const isHR = userRole === UserRole.COMPANY_ADMIN;
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  const isManager = userRole === UserRole.MANAGER;
  const isEmployee = userRole === UserRole.EMPLOYEE;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
        <p className="text-slate-500 mt-1">Manage leave requests, approvals, and balances.</p>
      </div>

      {/* Module Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
         <div className="flex border-b border-slate-100 overflow-x-auto custom-scrollbar">
            
            {/* Operational Views */}
            <button onClick={() => handleTabChange('apply')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'apply' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
               Apply Leave
            </button>
            <button onClick={() => handleTabChange('my-applications')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'my-applications' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
               My Applications
            </button>
            
            {(isManager || isHR) && (
               <>
                  <button onClick={() => handleTabChange('team-approvals')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'team-approvals' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Team Approvals
                  </button>
                  <button onClick={() => handleTabChange('team-summary')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'team-summary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Team Balances
                  </button>
               </>
            )}

            {isHR && (
               <>
                  <button onClick={() => handleTabChange('console')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'console' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     HR Console
                  </button>
                  <button onClick={() => handleTabChange('encashment')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'encashment' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Encashment
                  </button>
                  <button onClick={() => handleTabChange('summary')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'summary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Leave Summary
                  </button>
                  <button onClick={() => handleTabChange('payroll-sync')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'payroll-sync' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Payroll Sync
                  </button>
               </>
            )}

            {/* Admin / Config Views */}
            {(isHR || isSuperAdmin) && (
               <>
                  <div className="w-px bg-slate-200 mx-2 my-3"></div>
                  <button onClick={() => handleTabChange('balances')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'balances' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Balances
                  </button>
                  <button onClick={() => handleTabChange('accruals')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'accruals' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Accruals
                  </button>
                  <button onClick={() => handleTabChange('closure')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'closure' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Closure
                  </button>
                  <button onClick={() => handleTabChange('types')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'types' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Leave Types
                  </button>
                  <button onClick={() => handleTabChange('policies')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'policies' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Policies
                  </button>
                  <button onClick={() => handleTabChange('holidays')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'holidays' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Holidays
                  </button>
                  <button onClick={() => handleTabChange('mappings')} className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'mappings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                     Mappings
                  </button>
               </>
            )}
         </div>

         <div className="p-6 bg-slate-50 min-h-[500px]">
            <Routes>
               <Route path="apply" element={<ApplyLeave />} />
               <Route path="my-applications" element={<MyApplications />} />
               <Route path="team-approvals" element={<TeamApprovals />} />
               <Route path="console" element={<LeaveConsole />} />
               <Route path="encashment" element={<LeaveEncashmentView />} />
               <Route path="summary" element={<LeaveSummary />} />
               <Route path="team-summary" element={<TeamLeaveSummary />} />
               <Route path="payroll-sync" element={<LeavePayrollSyncView />} />
               
               {/* Admin Routes */}
               <Route path="balances" element={<LeaveBalances />} />
               <Route path="accruals" element={<LeaveAccruals />} />
               <Route path="closure" element={<LeavePeriodClosure />} />
               <Route path="types" element={<LeaveTypes />} />
               <Route path="policies" element={<LeavePolicies />} />
               <Route path="holidays" element={<HolidayCalendars />} />
               <Route path="mappings" element={<LeavePolicyMappings />} />
               
               <Route path="*" element={<Navigate to={isEmployee ? "apply" : "balances"} replace />} />
            </Routes>
         </div>
      </div>
    </div>
  );
};