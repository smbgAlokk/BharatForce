
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole, RequisitionStatus } from '../../types';
import { Plus, Search, Filter, Eye, Edit2 } from 'lucide-react';

export const RequisitionList: React.FC = () => {
  const navigate = useNavigate();
  const { jobRequisitions, currentUser, currentTenant, userRole, departments } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Filter Logic
  const myRequisitions = jobRequisitions.filter(req => {
    if (req.companyId !== currentTenant?.id) return false;
    
    // Role scoping
    if (userRole === UserRole.MANAGER) {
      // Managers see what they requested OR what they are hiring manager for
      return req.requestedBy === currentUser.id || req.hiringManagerId === currentUser.employeeId;
    }
    // HR/Admin sees all
    return true;
  });

  const filtered = myRequisitions.filter(req => {
    if (filterStatus && req.status !== filterStatus) return false;
    return true;
  });

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || '-';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex space-x-2 items-center w-full sm:w-auto">
          <div className="relative rounded-md shadow-sm flex-1">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <Search className="h-4 w-4 text-slate-400" />
             </div>
             <input type="text" className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Search ID or Title" />
          </div>
          <select 
            className="block pl-3 pr-8 py-2 border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value={RequisitionStatus.DRAFT}>Draft</option>
            <option value={RequisitionStatus.SUBMITTED}>Submitted</option>
            <option value={RequisitionStatus.APPROVED}>Approved</option>
            <option value={RequisitionStatus.REJECTED}>Rejected</option>
          </select>
        </div>

        <button 
          onClick={() => navigate('new')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Requisition
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Req ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Job Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Needed By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Headcount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No requisitions found.</td></tr>
            ) : (
              filtered.map(req => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{req.requisitionCode}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{req.title}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{getDeptName(req.departmentId)}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(req.neededBy).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 text-center">{req.requestedHeadcount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full 
                      ${req.status === RequisitionStatus.APPROVED ? 'bg-green-100 text-green-800' : 
                        req.status === RequisitionStatus.REJECTED ? 'bg-red-100 text-red-800' : 
                        req.status === RequisitionStatus.SUBMITTED ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                     <button 
                       onClick={() => navigate(req.id)} 
                       className="text-slate-400 hover:text-indigo-600" title="View"
                     >
                       <Eye className="h-4 w-4" />
                     </button>
                     {(req.status === RequisitionStatus.DRAFT || (userRole === UserRole.COMPANY_ADMIN && req.status === RequisitionStatus.SUBMITTED)) && (
                       <button 
                        onClick={() => navigate(`edit/${req.id}`)} 
                        className="text-slate-400 hover:text-indigo-600" title="Edit"
                       >
                         <Edit2 className="h-4 w-4" />
                       </button>
                     )}
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
