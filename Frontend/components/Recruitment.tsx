

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { RequisitionList } from './Recruitment/RequisitionList';
import { PositionList } from './Recruitment/PositionList';
import { RequisitionForm } from './Recruitment/RequisitionForm';
import { RequisitionDetail } from './Recruitment/RequisitionDetail';
import { PositionDetail } from './Recruitment/PositionDetail';
import { CandidateList } from './Recruitment/CandidateList';
import { PipelineBoard } from './Recruitment/PipelineBoard';
import { CandidateDetail } from './Recruitment/CandidateDetail';
import { OfferList } from './Recruitment/OfferList';
import { OfferForm } from './Recruitment/OfferForm';
import { OfferDetail } from './Recruitment/OfferDetail';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const Recruitment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useApp();
  const [activeTab, setActiveTab] = useState('requisitions');

  // Check active tab based on URL
  useEffect(() => {
    if (location.pathname.includes('/positions')) {
      setActiveTab('positions');
    } else if (location.pathname.includes('/candidates')) {
      setActiveTab('candidates');
    } else if (location.pathname.includes('/pipeline')) {
      setActiveTab('pipeline');
    } else if (location.pathname.includes('/offers')) {
      setActiveTab('offers');
    } else {
      setActiveTab('requisitions');
    }
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/recruitment/${tab}`);
  };

  // Manager sees this as "My Requisitions" conceptually
  const showPositions = true; // Managers can see positions they hire for (Read Only)
  const showCandidates = true; // Managers can see candidates for their positions

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Recruitment & ATS</h1>
        <p className="text-slate-500 mt-1">Manage job openings, requisitions, hiring pipelines, and offers.</p>
      </div>

      {/* Module Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
         <div className="flex border-b border-slate-100 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => handleTabChange('requisitions')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'requisitions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Job Requisitions
            </button>
            {showPositions && (
              <button
                onClick={() => handleTabChange('positions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'positions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Job Positions
              </button>
            )}
            {showCandidates && (
               <>
                 <button
                  onClick={() => handleTabChange('candidates')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'candidates' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Candidates
                </button>
                <button
                  onClick={() => handleTabChange('pipeline')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'pipeline' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Pipeline Board
                </button>
                 <button
                  onClick={() => handleTabChange('offers')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'offers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  Offers
                </button>
               </>
            )}
         </div>

         <div className="p-6">
            <Routes>
               <Route path="requisitions" element={<RequisitionList />} />
               <Route path="requisitions/new" element={<RequisitionForm />} />
               <Route path="requisitions/edit/:id" element={<RequisitionForm />} />
               <Route path="requisitions/:id" element={<RequisitionDetail />} />
               
               <Route path="positions" element={<PositionList />} />
               <Route path="positions/:id" element={<PositionDetail />} />

               <Route path="candidates" element={<CandidateList />} />
               <Route path="candidates/:id" element={<CandidateDetail />} />
               
               <Route path="pipeline" element={<PipelineBoard />} />

               <Route path="offers" element={<OfferList />} />
               <Route path="offers/new" element={<OfferForm />} />
               <Route path="offers/:id" element={<OfferDetail />} />

               <Route path="*" element={<Navigate to="requisitions" replace />} />
            </Routes>
         </div>
      </div>
    </div>
  );
};