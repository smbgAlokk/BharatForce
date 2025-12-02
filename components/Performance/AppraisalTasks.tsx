


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole, AppraisalStatus } from '../../types';
import { Search, ChevronRight, User, Clock } from 'lucide-react';

export const AppraisalTasks: React.FC = () => {
  const navigate = useNavigate();
  const { appraisalForms, employees, appraisalCycles, currentUser, currentTenant, userRole } = useApp();
  
  const [activeTab, setActiveTab] = useState<'Self' | 'Team' | 'HR'>('Self');

  // Determine visible tabs based on role
  const showSelf = true;
  const showTeam = userRole === UserRole.MANAGER || userRole === UserRole.COMPANY_ADMIN; // Admin can act as manager too conceptually
  const showHR = userRole === UserRole.COMPANY_ADMIN || userRole === UserRole.SUPER_ADMIN;

  // Filter Forms
  const myForms = appraisalForms.filter(f => f.companyId === currentTenant?.id);

  const selfForms = myForms.filter(f => f.employeeId === currentUser.employeeId);
  
  const teamForms = myForms.filter(f => {
     const emp = employees.find(e => e.id === f.employeeId);
     return emp?.reportingManagerId === currentUser.employeeId;
  });

  const hrForms = myForms; // HR sees all

  // Helper
  const getEmpName = (id: string) => {
     const e = employees.find(emp => emp.id === id);
     return e ? `${e.firstName} ${e.lastName}` : 'Unknown';
  };

  const getCycleName = (id: string) => appraisalCycles.find(c => c.id === id)?.name || 'Unknown Cycle';

  const renderList = (forms: typeof myForms, viewType: 'Self' | 'Team' | 'HR') => {
     if (forms.length === 0) {
        return <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200">No pending appraisals found in this view.</div>;
     }

     return (
        <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
           <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                 <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cycle</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                 {forms.map(form => (
                    <tr key={form.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/performance/appraisals/${form.id}`)}>
                       <td className="px-6 py-4">
                          <div className="flex items-center">
                             <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs mr-3">
                                <User className="w-4 h-4" />
                             </div>
                             <div>
                                <div className="text-sm font-medium text-slate-900">{getEmpName(form.employeeId)}</div>
                                <div className="text-xs text-slate-500">ID: {form.id}</div>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-sm text-slate-500">
                          {getCycleName(form.appraisalCycleId)}
                       </td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium border 
                             ${form.status === AppraisalStatus.PENDING_SELF ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                               form.status === AppraisalStatus.PENDING_MANAGER ? 'bg-purple-50 text-purple-700 border-purple-200' :
                               form.status === AppraisalStatus.FINALISED ? 'bg-green-50 text-green-700 border-green-200' :
                               'bg-yellow-50 text-yellow-700 border-yellow-200'
                             }`}>
                             {form.status}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center justify-end ml-auto">
                             Open <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
     );
  };

  return (
    <div className="space-y-6">
       <div className="flex space-x-4 border-b border-slate-200 pb-1 overflow-x-auto">
          {showSelf && (
             <button 
               onClick={() => setActiveTab('Self')}
               className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'Self' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
             >
                My Self Appraisals
             </button>
          )}
          {showTeam && (
             <button 
                onClick={() => setActiveTab('Team')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'Team' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
             >
                Team Appraisals (Pending)
             </button>
          )}
          {showHR && (
             <button 
                onClick={() => setActiveTab('HR')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'HR' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
             >
                HR Console
             </button>
          )}
       </div>

       <div>
          {activeTab === 'Self' && renderList(selfForms, 'Self')}
          
          {activeTab === 'Team' && renderList(teamForms.filter(f => f.status === AppraisalStatus.PENDING_MANAGER), 'Team')}
          
          {activeTab === 'HR' && (
             <div className="space-y-6">
                <div className="flex gap-4 items-center bg-slate-50 p-3 rounded border border-slate-200 text-sm">
                   <span className="font-bold text-slate-700">Stats:</span>
                   <span>Total: {hrForms.length}</span>
                   <span>Pending Self: {hrForms.filter(f => f.status === AppraisalStatus.PENDING_SELF).length}</span>
                   <span>Pending Manager: {hrForms.filter(f => f.status === AppraisalStatus.PENDING_MANAGER).length}</span>
                   <span>Finalised: {hrForms.filter(f => f.status === AppraisalStatus.FINALISED).length}</span>
                </div>
                {renderList(hrForms, 'HR')}
             </div>
          )}
       </div>
    </div>
  );
};