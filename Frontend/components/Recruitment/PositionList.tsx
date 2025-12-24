
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole, PositionStatus } from '../../types';
import { Search, Eye, Users } from 'lucide-react';

export const PositionList: React.FC = () => {
  const navigate = useNavigate();
  const { jobPositions, currentUser, currentTenant, userRole, departments } = useApp();

  // Filter Logic
  const myPositions = jobPositions.filter(pos => {
    if (pos.companyId !== currentTenant?.id) return false;
    
    // Role scoping
    if (userRole === UserRole.MANAGER) {
      return pos.hiringManagerId === currentUser.employeeId;
    }
    return true;
  });

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || '-';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
         <div className="relative rounded-md shadow-sm max-w-sm w-full">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search className="h-4 w-4 text-slate-400" />
             </div>
             <input type="text" className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none sm:text-sm" placeholder="Search Positions" />
          </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Position Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Job Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Headcount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {myPositions.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No active positions found.</td></tr>
            ) : (
              myPositions.map(pos => (
                <tr key={pos.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{pos.positionCode}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{pos.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{getDeptName(pos.departmentId)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                     <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1 text-slate-400" />
                        {pos.openHeadcount} Open / {pos.approvedHeadcount} Total
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full 
                      ${pos.status === PositionStatus.OPEN ? 'bg-green-100 text-green-800' : 
                        pos.status === PositionStatus.PAUSED ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-slate-100 text-slate-800'}`}>
                      {pos.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                     <button 
                       onClick={() => navigate(pos.id)} 
                       className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end ml-auto"
                     >
                       View <Eye className="h-4 w-4 ml-1" />
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
