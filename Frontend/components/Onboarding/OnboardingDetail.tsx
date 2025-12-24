
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { OnboardingStatus, UserRole } from '../../types';
import { ArrowLeft, Calendar, MapPin, Briefcase, CheckCircle, XCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { OnboardingChecklist } from './OnboardingChecklist';

export const OnboardingDetail: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const { onboardingRecords, updateOnboarding, candidates, jobPositions, employees, branches, departments, userRole } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'checklists' | 'notes'>('overview');

  const record = onboardingRecords.find(r => r.id === id);
  
  if (!record) return <div>Record not found</div>;

  const candidate = candidates.find(c => c.id === record.candidateId);
  const position = jobPositions.find(p => p.id === record.jobPositionId);
  const hiringManager = employees.find(e => e.id === record.hiringManagerId);
  const dept = departments.find(d => d.id === position?.departmentId);
  const branch = branches.find(b => b.id === record.branchId);

  const handleStatusChange = (newStatus: OnboardingStatus) => {
     if (window.confirm(`Change status to ${newStatus}?`)) {
        let updates: any = { status: newStatus };
        if (newStatus === OnboardingStatus.JOINED) {
           updates.actualDoj = new Date().toISOString().split('T')[0];
        }
        updateOnboarding({ ...record, ...updates });
     }
  };

  const isHR = userRole === UserRole.COMPANY_ADMIN;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
       <button onClick={() => navigate('/onboarding')} className="flex items-center text-sm text-slate-500 hover:text-slate-700">
         <ArrowLeft className="w-4 h-4 mr-1" /> Back to Onboarding List
       </button>

       {/* Header */}
       <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
             <div>
                <h1 className="text-2xl font-bold text-slate-900">{candidate?.firstName} {candidate?.lastName}</h1>
                <div className="flex flex-wrap items-center gap-x-4 text-sm text-slate-600 mt-2">
                   <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1 text-slate-400"/> {position?.title}</span>
                   <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-slate-400"/> {branch?.name} ({record.workLocationType})</span>
                   <span className="flex items-center"><Calendar className="w-4 h-4 mr-1 text-slate-400"/> DOJ: {new Date(record.tentativeDoj).toLocaleDateString()}</span>
                </div>
             </div>
             
             <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full 
                     ${record.status === OnboardingStatus.JOINED ? 'bg-green-100 text-green-800' : 
                       record.status === OnboardingStatus.PLANNED ? 'bg-blue-100 text-blue-800' : 
                       record.status === OnboardingStatus.DELAYED ? 'bg-yellow-100 text-yellow-800' :
                       'bg-red-100 text-red-800'}`}>
                     {record.status}
                </span>
                
                {isHR && record.status === OnboardingStatus.PLANNED && (
                  <div className="relative group">
                     <button className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                        Update Status
                     </button>
                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 hidden group-hover:block border border-slate-100">
                        <button onClick={() => handleStatusChange(OnboardingStatus.JOINED)} className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50">Mark Joined</button>
                        <button onClick={() => handleStatusChange(OnboardingStatus.DELAYED)} className="block w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50">Mark Delayed</button>
                        <button onClick={() => handleStatusChange(OnboardingStatus.NO_SHOW)} className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50">Mark No-show</button>
                     </div>
                  </div>
                )}
             </div>
          </div>
       </div>

       {/* Tabs */}
       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden min-h-[500px]">
          <div className="border-b border-slate-200 px-6">
             <nav className="-mb-px flex space-x-8">
                <button onClick={() => setActiveTab('overview')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Overview</button>
                <button onClick={() => setActiveTab('checklists')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'checklists' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Checklists</button>
                <button onClick={() => setActiveTab('notes')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'notes' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Notes & History</button>
             </nav>
          </div>

          <div className="p-6">
             {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                         <h4 className="text-sm font-bold text-slate-900 uppercase mb-4">Candidate Details</h4>
                         <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-3">
                               <span className="text-slate-500">Full Name</span>
                               <span className="col-span-2 font-medium">{candidate?.firstName} {candidate?.lastName}</span>
                            </div>
                            <div className="grid grid-cols-3">
                               <span className="text-slate-500">Email</span>
                               <span className="col-span-2 font-medium">{candidate?.email}</span>
                            </div>
                            <div className="grid grid-cols-3">
                               <span className="text-slate-500">Mobile</span>
                               <span className="col-span-2 font-medium">{candidate?.mobile}</span>
                            </div>
                            <div className="grid grid-cols-3">
                               <span className="text-slate-500">Current City</span>
                               <span className="col-span-2 font-medium">{candidate?.currentCity}</span>
                            </div>
                         </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                         <h4 className="text-sm font-bold text-slate-900 uppercase mb-4">Joining Info</h4>
                         <div className="space-y-3 text-sm">
                             <div className="grid grid-cols-3">
                               <span className="text-slate-500">Tentative DOJ</span>
                               <span className="col-span-2 font-medium">{record.tentativeDoj}</span>
                            </div>
                             <div className="grid grid-cols-3">
                               <span className="text-slate-500">Actual DOJ</span>
                               <span className="col-span-2 font-medium">{record.actualDoj || '-'}</span>
                            </div>
                             <div className="grid grid-cols-3">
                               <span className="text-slate-500">Work Location</span>
                               <span className="col-span-2 font-medium">{branch?.name} ({record.workLocationType})</span>
                            </div>
                             <div className="grid grid-cols-3">
                               <span className="text-slate-500">Employment</span>
                               <span className="col-span-2 font-medium">{record.employmentType}</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                         <h4 className="text-sm font-bold text-slate-900 uppercase mb-4">Job & Hierarchy</h4>
                         <div className="space-y-3 text-sm">
                             <div className="grid grid-cols-3">
                               <span className="text-slate-500">Position</span>
                               <span className="col-span-2 font-medium">{position?.title}</span>
                            </div>
                            <div className="grid grid-cols-3">
                               <span className="text-slate-500">Department</span>
                               <span className="col-span-2 font-medium">{dept?.name}</span>
                            </div>
                            <div className="grid grid-cols-3">
                               <span className="text-slate-500">Hiring Manager</span>
                               <span className="col-span-2 font-medium">{hiringManager?.firstName} {hiringManager?.lastName}</span>
                            </div>
                            <div className="grid grid-cols-3">
                               <span className="text-slate-500">Probation</span>
                               <span className="col-span-2 font-medium">{record.probationPeriod} Months</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'checklists' && (
                <OnboardingChecklist record={record} />
             )}
             
             {activeTab === 'notes' && (
                <div className="text-slate-500 text-sm italic">
                  Notes and History timeline will be implemented here.
                </div>
             )}
          </div>
       </div>
    </div>
  );
};
