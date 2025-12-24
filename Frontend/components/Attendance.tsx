


import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { PolicyMaster } from './Attendance/PolicyMaster';
import { ShiftMaster } from './Attendance/ShiftMaster';
import { WeeklyOffPatterns } from './Attendance/WeeklyOffPatterns';
import { AttendanceMappings } from './Attendance/AttendanceMappings';
import { DailyConsole } from './Attendance/DailyConsole';
import { TeamAttendance } from './Attendance/TeamAttendance';
import { MyAttendance } from './Attendance/MyAttendance';
import { GeoFenceConfig } from './Attendance/GeoFenceConfig';
import { RegularisationApprovals } from './Attendance/RegularisationApprovals';
import { RegularisationConsole } from './Attendance/RegularisationConsole';
import { AttendanceFinalisation } from './Attendance/AttendanceFinalisation';
import { OTSummary } from './Attendance/OTSummary';
import { TeamOTSummary } from './Attendance/TeamOTSummary';
import { PayrollDayMapping } from './Attendance/PayrollDayMapping';
import { PayrollExport } from './Attendance/PayrollExport';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Attendance: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useApp();
  const [activeTab, setActiveTab] = useState('policies');

  // Check active tab based on URL
  useEffect(() => {
    if (location.pathname.includes('/policies')) {
      setActiveTab('policies');
    } else if (location.pathname.includes('/shifts')) {
      setActiveTab('shifts');
    } else if (location.pathname.includes('/weekly-offs')) {
      setActiveTab('weekly-offs');
    } else if (location.pathname.includes('/mappings')) {
      setActiveTab('mappings');
    } else if (location.pathname.includes('/daily')) {
      setActiveTab('daily');
    } else if (location.pathname.includes('/team')) {
      setActiveTab('team');
    } else if (location.pathname.includes('/my-attendance')) {
      setActiveTab('my-attendance');
    } else if (location.pathname.includes('/geofencing')) {
      setActiveTab('geofencing');
    } else if (location.pathname.includes('/approvals')) {
      setActiveTab('approvals');
    } else if (location.pathname.includes('/regularisation')) {
      setActiveTab('regularisation');
    } else if (location.pathname.includes('/finalisation')) {
      setActiveTab('finalisation');
    } else if (location.pathname.includes('/ot-summary')) {
      setActiveTab('ot-summary');
    } else if (location.pathname.includes('/team-ot')) {
      setActiveTab('team-ot');
    } else if (location.pathname.includes('/payroll-mapping')) {
      setActiveTab('payroll-mapping');
    } else if (location.pathname.includes('/payroll-export')) {
      setActiveTab('payroll-export');
    } else {
      // Default redirects
      if (userRole === UserRole.EMPLOYEE) setActiveTab('my-attendance');
      else if (userRole === UserRole.MANAGER) setActiveTab('team');
      else setActiveTab('daily');
    }
  }, [location.pathname, userRole]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/attendance/${tab}`);
  };

  // Role Scoping
  const isHR = userRole === UserRole.COMPANY_ADMIN;
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  const isManager = userRole === UserRole.MANAGER;
  const isEmployee = userRole === UserRole.EMPLOYEE;

  const canConfig = isHR || isSuperAdmin;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Attendance Management</h1>
        <p className="text-slate-500 mt-1">Track daily attendance, shifts, and regularization.</p>
      </div>

      {/* Module Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
         <div className="flex border-b border-slate-100 overflow-x-auto custom-scrollbar">
            {(isHR || isSuperAdmin) && (
               <>
                  <button
                     onClick={() => handleTabChange('daily')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'daily' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Daily Console
                  </button>
                  <button
                     onClick={() => handleTabChange('regularisation')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'regularisation' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Regularisation
                  </button>
                  <button
                     onClick={() => handleTabChange('finalisation')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'finalisation' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Finalisation
                  </button>
                  <button
                     onClick={() => handleTabChange('payroll-export')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'payroll-export' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Payroll Export
                  </button>
                  <button
                     onClick={() => handleTabChange('ot-summary')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'ot-summary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     OT Summary
                  </button>
                  <button
                     onClick={() => handleTabChange('policies')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'policies' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Policies
                  </button>
                  <button
                     onClick={() => handleTabChange('payroll-mapping')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'payroll-mapping' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Pay Mapping
                  </button>
                  <button
                     onClick={() => handleTabChange('shifts')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'shifts' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Shifts
                  </button>
                  <button
                     onClick={() => handleTabChange('weekly-offs')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'weekly-offs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Weekly Offs
                  </button>
                  <button
                     onClick={() => handleTabChange('mappings')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'mappings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Mappings
                  </button>
               </>
            )}
            {(isManager || isHR || isSuperAdmin) && (
               <>
                 <button
                    onClick={() => handleTabChange('team')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'team' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                 >
                    Team Attendance
                 </button>
                 <button
                    onClick={() => handleTabChange('team-ot')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'team-ot' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                 >
                    Team OT
                 </button>
                 <button
                    onClick={() => handleTabChange('approvals')}
                    className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'approvals' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                 >
                    Approvals
                 </button>
               </>
            )}
            <button
               onClick={() => handleTabChange('my-attendance')}
               className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'my-attendance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
               My Attendance
            </button>
         </div>

         <div className="p-6 bg-slate-50 min-h-[500px]">
            <Routes>
               <Route path="daily" element={<DailyConsole />} />
               <Route path="team" element={<TeamAttendance />} />
               <Route path="my-attendance" element={<MyAttendance />} />
               <Route path="approvals" element={<RegularisationApprovals />} />
               <Route path="regularisation" element={<RegularisationConsole />} />
               <Route path="finalisation" element={<AttendanceFinalisation />} />
               <Route path="ot-summary" element={<OTSummary />} />
               <Route path="team-ot" element={<TeamOTSummary />} />
               
               {canConfig && (
                  <>
                     <Route path="policies" element={<PolicyMaster />} />
                     <Route path="shifts" element={<ShiftMaster />} />
                     <Route path="weekly-offs" element={<WeeklyOffPatterns />} />
                     <Route path="mappings" element={<AttendanceMappings />} />
                     <Route path="geofencing" element={<GeoFenceConfig />} />
                     <Route path="payroll-mapping" element={<PayrollDayMapping />} />
                     <Route path="payroll-export" element={<PayrollExport />} />
                  </>
               )}
               
               <Route path="*" element={<Navigate to={isEmployee ? "my-attendance" : (isManager ? "team" : "daily")} replace />} />
            </Routes>
         </div>
      </div>
    </div>
  );
};
