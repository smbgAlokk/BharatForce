
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ExpenseCategories } from './Expenses/ExpenseCategories';
import { ExpensePolicies } from './Expenses/ExpensePolicies';
import { ExpensePolicyMappings } from './Expenses/ExpensePolicyMappings';
import { MyClaims } from './Expenses/MyClaims';
import { ClaimForm } from './Expenses/ClaimForm';
import { TeamApprovals } from './Expenses/TeamApprovals';
import { AllClaims } from './Expenses/AllClaims';
import { MyAdvances } from './Expenses/MyAdvances';
import { AdvanceApprovals } from './Expenses/AdvanceApprovals';
import { ExpenseReports } from './Expenses/ExpenseReports';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Expenses: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useApp();
  const [activeTab, setActiveTab] = useState('categories');

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/categories')) setActiveTab('categories');
    else if (path.includes('/policies')) setActiveTab('policies');
    else if (path.includes('/mappings')) setActiveTab('mappings');
    else if (path.includes('/my-claims')) setActiveTab('my-claims');
    else if (path.includes('/team-approvals')) setActiveTab('team-approvals');
    else if (path.includes('/all-claims')) setActiveTab('all-claims');
    else if (path.includes('/my-advances')) setActiveTab('my-advances');
    else if (path.includes('/advance-approvals')) setActiveTab('advance-approvals');
    else if (path.includes('/reports')) setActiveTab('reports');
    else {
      if (userRole === UserRole.EMPLOYEE) setActiveTab('my-claims');
      else if (userRole === UserRole.MANAGER) setActiveTab('team-approvals');
      else setActiveTab('categories');
    }
  }, [location.pathname, userRole]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/expenses/${tab}`);
  };

  const isHR = userRole === UserRole.COMPANY_ADMIN;
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  const isManager = userRole === UserRole.MANAGER;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Expense Management</h1>
        <p className="text-slate-500 mt-1">Manage expense categories, policies, claims, and advances.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
         <div className="flex border-b border-slate-100 overflow-x-auto custom-scrollbar">
            <button
               onClick={() => handleTabChange('my-claims')}
               className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'my-claims' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
               My Claims
            </button>
            <button
               onClick={() => handleTabChange('my-advances')}
               className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'my-advances' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
               My Advances
            </button>

            {(isManager || isHR) && (
               <>
                  <button
                     onClick={() => handleTabChange('team-approvals')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'team-approvals' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Team Claims
                  </button>
                  <button
                     onClick={() => handleTabChange('advance-approvals')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'advance-approvals' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Advance Approvals
                  </button>
               </>
            )}

            {(isHR || isSuperAdmin) && (
               <>
                  <button
                     onClick={() => handleTabChange('all-claims')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'all-claims' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     All Claims (HR)
                  </button>
                  <button
                     onClick={() => handleTabChange('reports')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'reports' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Reports
                  </button>
                  <div className="w-px bg-slate-200 mx-2 my-3"></div>
                  <button
                     onClick={() => handleTabChange('categories')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'categories' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Categories
                  </button>
                  <button
                     onClick={() => handleTabChange('policies')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'policies' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Policies
                  </button>
                  <button
                     onClick={() => handleTabChange('mappings')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'mappings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Mappings
                  </button>
               </>
            )}
         </div>

         <div className="p-6 bg-slate-50 min-h-[500px]">
            <Routes>
               <Route path="my-claims" element={<MyClaims />} />
               <Route path="my-claims/new" element={<ClaimForm />} />
               <Route path="my-claims/edit/:id" element={<ClaimForm />} />
               
               <Route path="my-advances" element={<MyAdvances />} />
               
               <Route path="team-approvals" element={<TeamApprovals />} />
               <Route path="advance-approvals" element={<AdvanceApprovals />} />
               <Route path="all-claims" element={<AllClaims />} />
               <Route path="reports" element={<ExpenseReports />} />

               {/* Admin Routes */}
               <Route path="categories" element={<ExpenseCategories />} />
               <Route path="policies" element={<ExpensePolicies />} />
               <Route path="mappings" element={<ExpensePolicyMappings />} />
               
               <Route path="*" element={<Navigate to="my-claims" replace />} />
            </Routes>
         </div>
      </div>
    </div>
  );
};
