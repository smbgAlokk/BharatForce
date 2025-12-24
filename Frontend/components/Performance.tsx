








import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { KPIFramework } from './Performance/KPIFramework';
import { GoalLibrary } from './Performance/GoalLibrary';
import { Mappings } from './Performance/Mappings';
import { KPIAssignmentPreview } from './Performance/KPIAssignmentPreview'; // Added import
import { PerformanceCycles } from './Performance/PerformanceCycles';
import { GoalSetting } from './Performance/GoalSetting';
import { AppraisalCycles } from './Performance/AppraisalCycles';
import { AppraisalTasks } from './Performance/AppraisalTasks';
import { AppraisalFormView } from './Performance/AppraisalFormView';
import { RatingBands } from './Performance/RatingBands';
import { FeedbackFramework } from './Performance/FeedbackFramework';
import { FeedbackTemplates } from './Performance/FeedbackTemplates';
import { FeedbackMappings } from './Performance/FeedbackMappings';
import { FeedbackRequests } from './Performance/FeedbackRequests';
import { FeedbackTasks } from './Performance/FeedbackTasks';
import { FeedbackFormView } from './Performance/FeedbackFormView';
import { PromotionFramework } from './Performance/PromotionFramework';
import { PromotionProposals } from './Performance/PromotionProposals';
import { ProposalForm } from './Performance/ProposalForm';
import { LetterTemplates } from './Performance/LetterTemplates';
import { PayrollSync } from './Performance/PayrollSync';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Performance: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useApp();
  const [activeTab, setActiveTab] = useState('cycles');

  // Check active tab based on URL
  useEffect(() => {
    if (location.pathname.includes('/framework')) {
      setActiveTab('framework');
    } else if (location.pathname.includes('/library')) {
      setActiveTab('library');
    } else if (location.pathname.includes('/mappings')) {
      setActiveTab('mappings');
    } else if (location.pathname.includes('/assignment-preview')) { // Added check
      setActiveTab('assignment-preview');
    } else if (location.pathname.includes('/goals')) {
      setActiveTab('goals');
    } else if (location.pathname.includes('/appraisal-cycles')) {
      setActiveTab('appraisal-cycles');
    } else if (location.pathname.includes('/appraisals')) {
      setActiveTab('appraisals');
    } else if (location.pathname.includes('/rating-bands')) {
      setActiveTab('rating-bands');
    } else if (location.pathname.includes('/360-framework')) {
      setActiveTab('360-framework');
    } else if (location.pathname.includes('/360-templates')) {
      setActiveTab('360-templates');
    } else if (location.pathname.includes('/360-mappings')) {
      setActiveTab('360-mappings');
    } else if (location.pathname.includes('/360-requests')) {
      setActiveTab('360-requests');
    } else if (location.pathname.includes('/feedback-tasks')) {
      setActiveTab('feedback-tasks');
    } else if (location.pathname.includes('/promotion-rules')) {
      setActiveTab('promotion-rules');
    } else if (location.pathname.includes('/promotion-proposals')) {
      setActiveTab('promotion-proposals');
    } else if (location.pathname.includes('/letter-templates')) {
      setActiveTab('letter-templates');
    } else if (location.pathname.includes('/payroll-sync')) {
      setActiveTab('payroll-sync');
    } else {
      setActiveTab('cycles');
    }
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/performance/${tab}`);
  };

  // Role Scoping
  const isManager = userRole === UserRole.MANAGER;
  const isEmployee = userRole === UserRole.EMPLOYEE;
  const isHR = userRole === UserRole.COMPANY_ADMIN;

  // Employee Redirect
  if (isEmployee && !location.pathname.includes('/appraisals') && !location.pathname.includes('/feedback-tasks')) {
     return <Navigate to="/my-goals" replace />;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Performance Management</h1>
        <p className="text-slate-500 mt-1">Configure KPIs, set goals, and manage appraisals.</p>
      </div>

      {/* Module Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
         <div className="flex border-b border-slate-100 overflow-x-auto custom-scrollbar">
            {!isManager && !isEmployee && (
               <>
                  <button
                     onClick={() => handleTabChange('cycles')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'cycles' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Performance Cycles
                  </button>
                  <button
                     onClick={() => handleTabChange('appraisal-cycles')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'appraisal-cycles' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Appraisal Cycles
                  </button>
                  <button
                     onClick={() => handleTabChange('framework')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'framework' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     KPI Framework
                  </button>
                  <button
                     onClick={() => handleTabChange('library')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'library' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Goal Library
                  </button>
                  <button
                     onClick={() => handleTabChange('mappings')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'mappings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     KPI Mappings
                  </button>
                  <button
                     onClick={() => handleTabChange('assignment-preview')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'assignment-preview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Assignment Preview
                  </button>
                   <button
                     onClick={() => handleTabChange('rating-bands')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'rating-bands' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Rating Bands
                  </button>
                  <button
                     onClick={() => handleTabChange('360-framework')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === '360-framework' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     360 Framework
                  </button>
                  <button
                     onClick={() => handleTabChange('360-templates')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === '360-templates' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     360 Templates
                  </button>
                  <button
                     onClick={() => handleTabChange('360-mappings')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === '360-mappings' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     360 Mappings
                  </button>
                  <button
                     onClick={() => handleTabChange('360-requests')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === '360-requests' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     360 Requests
                  </button>
                   <button
                     onClick={() => handleTabChange('promotion-rules')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'promotion-rules' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Promotion Rules
                  </button>
                  <button
                     onClick={() => handleTabChange('letter-templates')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'letter-templates' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Letter Templates
                  </button>
                  <button
                     onClick={() => handleTabChange('payroll-sync')}
                     className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'payroll-sync' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  >
                     Payroll Sync
                  </button>
               </>
            )}
            {!isEmployee && (
               <button
                  onClick={() => handleTabChange('goals')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'goals' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
               >
                  Employee Goal Setting
               </button>
            )}
            <button
               onClick={() => handleTabChange('appraisals')}
               className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'appraisals' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
               Appraisal Tasks
            </button>
            <button
               onClick={() => handleTabChange('feedback-tasks')}
               className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'feedback-tasks' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
               My Feedback Tasks
            </button>
             {!isEmployee && (
               <button
                  onClick={() => handleTabChange('promotion-proposals')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'promotion-proposals' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
               >
                  Promotion Proposals
               </button>
            )}
         </div>

         <div className="p-6 bg-slate-50 min-h-[500px]">
            <Routes>
               {/* Admin Config Routes */}
               <Route path="cycles" element={<PerformanceCycles />} />
               <Route path="appraisal-cycles" element={<AppraisalCycles />} />
               <Route path="framework" element={<KPIFramework />} />
               <Route path="library" element={<GoalLibrary />} />
               <Route path="mappings" element={<Mappings />} />
               <Route path="assignment-preview" element={<KPIAssignmentPreview />} /> {/* Added Route */}
               <Route path="rating-bands" element={<RatingBands />} />
               
               <Route path="360-framework" element={<FeedbackFramework />} />
               <Route path="360-templates" element={<FeedbackTemplates />} />
               <Route path="360-mappings" element={<FeedbackMappings />} />
               <Route path="360-requests" element={<FeedbackRequests />} />

               <Route path="promotion-rules" element={<PromotionFramework />} />
               <Route path="letter-templates" element={<LetterTemplates />} />
               <Route path="payroll-sync" element={<PayrollSync />} />
               
               {/* Shared Routes */}
               <Route path="goals" element={<GoalSetting />} />
               <Route path="appraisals" element={<AppraisalTasks />} />
               <Route path="appraisals/:id" element={<AppraisalFormView />} />
               
               <Route path="feedback-tasks" element={<FeedbackTasks />} />
               <Route path="feedback/:id" element={<FeedbackFormView />} />

               <Route path="promotion-proposals" element={<PromotionProposals />} />
               <Route path="promotion-proposals/new" element={<ProposalForm />} />
               <Route path="promotion-proposals/:id" element={<ProposalForm />} />
               
               <Route path="*" element={<Navigate to={isEmployee ? "appraisals" : (isManager ? "goals" : "cycles")} replace />} />
            </Routes>
         </div>
      </div>
    </div>
  );
};
