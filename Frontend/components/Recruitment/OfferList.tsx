
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole, OfferStatus } from '../../types';
import { Search, Eye, User, Calendar } from 'lucide-react';

export const OfferList: React.FC = () => {
  const navigate = useNavigate();
  const { offers, candidates, jobPositions, currentTenant, userRole, currentUser } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Filter Logic
  const myOffers = offers.filter(o => {
    if (o.companyId !== currentTenant?.id) return false;
    
    if (userRole === UserRole.MANAGER) {
      return o.hiringManagerId === currentUser.employeeId;
    }
    return true;
  });

  const filtered = myOffers.filter(o => {
    const cand = candidates.find(c => c.id === o.candidateId);
    const name = cand ? `${cand.firstName} ${cand.lastName}` : '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter !== 'All' ? o.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });

  const getCandidateName = (id: string) => {
    const c = candidates.find(cand => cand.id === id);
    return c ? `${c.firstName} ${c.lastName}` : id;
  };

  const getPositionTitle = (id: string) => jobPositions.find(p => p.id === id)?.title || 'Unknown';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
         <div className="flex space-x-2 items-center w-full sm:w-auto">
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
               <option value="Draft">Draft</option>
               <option value="Sent">Sent</option>
               <option value="Accepted">Accepted</option>
               <option value="Rejected">Rejected</option>
               <option value="Withdrawn">Withdrawn</option>
             </select>
         </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Offered CTC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Joining Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No offers found.</td></tr>
            ) : (
              filtered.map(off => (
                <tr key={off.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(off.id)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{getCandidateName(off.candidateId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                     {getPositionTitle(off.jobPositionId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                     ₹ {(off.ctc / 100000).toFixed(2)} LPA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                     <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                        {new Date(off.joiningDate).toLocaleDateString()}
                     </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className={`px-2 py-1 text-xs font-medium rounded-full 
                        ${off.status === 'Accepted' ? 'bg-green-100 text-green-800' : 
                          off.status === 'Sent' ? 'bg-blue-100 text-blue-800' : 
                          off.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-800'}`}>
                        {off.status}
                     </span>
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
