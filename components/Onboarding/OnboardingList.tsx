
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { OnboardingStatus, UserRole } from '../../types';
import { Search, Eye, UserPlus } from 'lucide-react';
import { NewOnboardingModal } from './NewOnboardingModal';

export const OnboardingList: React.FC = () => {
  const navigate = useNavigate();
  const { onboardingRecords, candidates, jobPositions, departments, currentTenant, userRole, currentUser } = useApp();
  
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const myRecords = onboardingRecords.filter(rec => {
    if (rec.companyId !== currentTenant?.id) return false;
    if (userRole === UserRole.MANAGER) {
      return rec.hiringManagerId === currentUser.employeeId;
    }
    return true;
  });

  const filtered = myRecords.filter(rec => {
    const cand = candidates.find(c => c.id === rec.candidateId);
    const name = cand ? `${cand.firstName} ${cand.lastName}`.toLowerCase() : '';
    const matchesSearch = name.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter !== 'All' ? rec.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  const getCandidateName = (id: string) => {
    const c = candidates.find(cand => cand.id === id);
    return c ? `${c.firstName} ${c.lastName}` : 'Unknown';
  };

  const getPositionTitle = (id: string) => jobPositions.find(p => p.id === id)?.title || 'Unknown';
  
  const getDeptName = (posId: string) => {
     const pos = jobPositions.find(p => p.id === posId);
     if (!pos) return '-';
     return departments.find(d => d.id === pos.departmentId)?.name || '-';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Onboarding</h1>
        <p className="text-slate-500 mt-1">Track joining formalities for new hires.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div className="flex flex-1 space-x-2 items-center w-full sm:w-auto">
            <div className="relative rounded-md shadow-sm flex-1 max-w-xs">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
               </div>
               <input 
                  type="text" 
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                  placeholder="Search Candidate" 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
             <select 
               className="block pl-3 pr-8 py-2 border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
               value={statusFilter}
               onChange={e => setStatusFilter(e.target.value)}
             >
               <option value="All">All Status</option>
               <option value={OnboardingStatus.PLANNED}>Planned</option>
               <option value={OnboardingStatus.JOINED}>Joined</option>
               <option value={OnboardingStatus.DELAYED}>Delayed</option>
               <option value={OnboardingStatus.NO_SHOW}>No Show</option>
             </select>
         </div>
         
         {/* Manual add button mostly for HR */}
         {userRole === UserRole.COMPANY_ADMIN && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
               <UserPlus className="h-4 w-4 mr-2" /> New Onboarding
            </button>
         )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Position & Dept</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tentative DOJ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Progress</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No onboarding records found.</td></tr>
            ) : (
              filtered.map(rec => {
                 const completedTasks = rec.tasks.filter(t => t.status === 'Completed').length;
                 const totalTasks = rec.tasks.length;
                 const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                 return (
                  <tr key={rec.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(rec.id)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{getCandidateName(rec.candidateId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm text-slate-900">{getPositionTitle(rec.jobPositionId)}</div>
                       <div className="text-xs text-slate-500">{getDeptName(rec.jobPositionId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                       {new Date(rec.tentativeDoj).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className={`px-2 py-1 text-xs font-medium rounded-full 
                          ${rec.status === OnboardingStatus.JOINED ? 'bg-green-100 text-green-800' : 
                            rec.status === OnboardingStatus.PLANNED ? 'bg-blue-100 text-blue-800' : 
                            rec.status === OnboardingStatus.DELAYED ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}>
                          {rec.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap align-middle">
                       <div className="w-full bg-slate-200 rounded-full h-2.5 max-w-[100px]">
                          <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                       </div>
                       <div className="text-xs text-slate-500 mt-1">{progress}% ({completedTasks}/{totalTasks})</div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                       <button className="text-indigo-600 hover:text-indigo-900">
                          <Eye className="h-4 w-4" />
                       </button>
                    </td>
                  </tr>
                 );
              })
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
         <NewOnboardingModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
};
