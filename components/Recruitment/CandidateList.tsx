
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole, Candidate } from '../../types';
import { Plus, Search, Eye, Phone, Mail } from 'lucide-react';

export const CandidateList: React.FC = () => {
  const navigate = useNavigate();
  const { candidates, jobPositions, departments, currentTenant, userRole, currentUser, addCandidate } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('');

  // Filter Logic
  const myCandidates = candidates.filter(c => {
    if (c.companyId !== currentTenant?.id) return false;
    
    if (userRole === UserRole.MANAGER) {
      // Managers see candidates for positions they own
      return c.hiringManagerId === currentUser.employeeId;
    }
    return true;
  });

  const filtered = myCandidates.filter(c => {
    const matchesSearch = 
      c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPos = filterPosition ? c.jobPositionId === filterPosition : true;
    
    return matchesSearch && matchesPos;
  });

  const getPositionTitle = (id: string) => jobPositions.find(p => p.id === id)?.title || 'Unknown Position';
  const getDeptNameFromPos = (posId: string) => {
     const pos = jobPositions.find(p => p.id === posId);
     if (!pos) return '-';
     return departments.find(d => d.id === pos.departmentId)?.name || '-';
  };

  const handleAddCandidate = () => {
     // Create dummy candidate for demo
     const newCand: Candidate = {
        id: `cand-${Date.now()}`,
        companyId: currentTenant!.id,
        firstName: 'New',
        lastName: 'Candidate',
        email: 'new.candidate@example.com',
        mobile: '9999900000',
        currentCity: 'Remote',
        jobPositionId: jobPositions[0]?.id || '',
        hiringManagerId: currentUser.employeeId || '',
        skills: [],
        stage: 'New / Applied',
        status: 'Active',
        source: 'Direct',
        dateApplied: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        createdBy: currentUser.name
     };
     addCandidate(newCand);
     navigate(newCand.id);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-1 space-x-2 items-center w-full sm:w-auto">
          <div className="relative rounded-md shadow-sm flex-1 max-w-xs">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search className="h-4 w-4 text-slate-400" />
             </div>
             <input 
               type="text" 
               className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
               placeholder="Search Name, Email" 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
          <select 
            className="block pl-3 pr-8 py-2 border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filterPosition}
            onChange={e => setFilterPosition(e.target.value)}
          >
            <option value="">All Positions</option>
            {jobPositions.filter(p => p.companyId === currentTenant?.id).map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        {userRole === UserRole.COMPANY_ADMIN && (
          <button 
            onClick={handleAddCandidate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Candidate
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Applied For</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Experience</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Source</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No candidates found.</td></tr>
            ) : (
              filtered.map(cand => (
                <tr key={cand.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(cand.id)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                       <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {cand.firstName.charAt(0)}{cand.lastName.charAt(0)}
                       </div>
                       <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{cand.firstName} {cand.lastName}</div>
                          <div className="text-xs text-slate-500 flex flex-col sm:flex-row sm:gap-3">
                             <span className="flex items-center"><Mail className="w-3 h-3 mr-1"/> {cand.email}</span>
                             <span className="flex items-center"><Phone className="w-3 h-3 mr-1"/> {cand.mobile}</span>
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm font-medium text-slate-900">{getPositionTitle(cand.jobPositionId)}</div>
                     <div className="text-xs text-slate-500">{getDeptNameFromPos(cand.jobPositionId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {cand.stage}
                     </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                     <div>{cand.totalExperience || '-'}</div>
                     {cand.currentCompany && <div className="text-xs text-slate-400">{cand.currentCompany}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                     {cand.source}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                     <button className="text-indigo-600 hover:text-indigo-900">
                        <Eye className="h-4 w-4" />
                     </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
