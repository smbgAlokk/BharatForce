
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { MyResignation } from './Exit/MyResignation';
import { TeamResignations } from './Exit/TeamResignations';
import { AllResignations } from './Exit/AllResignations';
import { ClearanceConfig } from './Exit/ClearanceConfig';
import { ExitProcess } from './Exit/ExitProcess';
import { FnFSettlements } from './Exit/FnFSettlements';
import { FnFDetail } from './Exit/FnFDetail';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Exit: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useApp();
  const [activeTab, setActiveTab] = useState('my-resignation');

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/my-resignation')) setActiveTab('my-resignation');
    else if (path.includes('/team-resignations')) setActiveTab('team-resignations');
    else if (path.includes('/all-resignations')) setActiveTab('all-resignations');
    else if (path.includes('/fnf')) setActiveTab('fnf-settlements');
    else if (path.includes('/config')) setActiveTab('config');
    else if (path.includes('/process')) setActiveTab('process'); // Hidden tab context
    else {
      if (userRole === UserRole.EMPLOYEE) setActiveTab('my-resignation');
      else if (userRole === UserRole.MANAGER) setActiveTab('team-resignations');
      else setActiveTab('all-resignations');
    }
  }, [location.pathname, userRole]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/exit/${tab}`);
  };

  const isHR = userRole === UserRole.COMPANY_ADMIN;
  const isManager = userRole === UserRole.MANAGER;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Exit Management</h1>
        <p className="text-slate-500 mt-1">Manage resignations and approvals.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
         <div className="flex border-b border-slate-100 overflow-x-auto custom-scrollbar">
            <button
               onClick={() => handleTabChange('my-resignation')}
               className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'my-resignation' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
               My Resignation
            </button>

            {(isManager || isHR) && (
               <button
                  onClick={() => handleTabChange('team-resignations')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'team-resignations' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
               >
                  Team Resignations
               </button>
            )}

            {isHR && (
               <>
                  <button
                     onClick={() => handleTabChange('all-resignations')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'all-resignations' || activeTab === 'process' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     All Resignations
                  </button>
                  <button
                     onClick={() => handleTabChange('fnf-settlements')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'fnf-settlements' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     F&F Settlements
                  </button>
                  <button
                     onClick={() => handleTabChange('config')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'config' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Checklist Config
                  </button>
               </>
            )}
         </div>

         <div className="p-6 bg-slate-50 min-h-[500px]">
            <Routes>
               <Route path="my-resignation" element={<MyResignation />} />
               <Route path="team-resignations" element={<TeamResignations />} />
               <Route path="all-resignations" element={<AllResignations />} />
               
               {/* Process Routes */}
               <Route path="process/:id" element={<ExitProcess />} />
               
               {/* F&F Routes */}
               <Route path="fnf-settlements" element={<FnFSettlements />} />
               <Route path="fnf/:id" element={<FnFDetail />} />
               
               {isHR && <Route path="config" element={<ClearanceConfig />} />}
               
               <Route path="*" element={<Navigate to="my-resignation" replace />} />
            </Routes>
         </div>
      </div>
    </div>
  );
};