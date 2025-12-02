
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ResignationRequest } from '../../types';
import { CheckCircle, XCircle, Search, Filter, Eye, Settings, PlayCircle } from 'lucide-react';

export const AllResignations: React.FC = () => {
  const navigate = useNavigate();
  const { resignationRequests, employees, currentTenant, currentUser, approveResignation, rejectResignation } = useApp();
  const [filterStatus, setFilterStatus] = useState('Manager Approved');
  const [searchTerm, setSearchTerm] = useState('');

  const myRequests = resignationRequests.filter(r => r.companyId === currentTenant?.id);

  const filtered = myRequests.filter(r => {
     const emp = employees.find(e => e.id === r.employeeId);
     const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : '';
     const matchesSearch = name.includes(searchTerm.toLowerCase());
     const matchesStatus = filterStatus === 'All' ? true : r.status === filterStatus;
     return matchesSearch && matchesStatus;
  });

  const getEmpName = (id: string) => {
     const e = employees.find(em => em.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };

  const handleApprove = (req: ResignationRequest) => {
     const comments = prompt("Final Approval Comments:") || 'Approved by HR';
     approveResignation(req, currentUser.employeeId || 'HR', 'HR', comments);
  };

  const handleReject = (req: ResignationRequest) => {
     const comments = prompt("Rejection Reason:") || '';
     if (comments) rejectResignation(req, currentUser.employeeId || 'HR', 'HR', comments);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">All Resignations (HR)</h2>
          <div className="flex gap-2">
             <div className="relative">
                <input 
                  type="text" 
                  className="pl-8 pr-3 py-2 border border-slate-300 rounded-md text-sm" 
                  placeholder="Search Employee..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
             </div>
             <select 
                className="border border-slate-300 rounded-md text-sm p-2"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
             >
                <option value="All">All Status</option>
                <option value="Submitted">Submitted</option>
                <option value="Manager Approved">Manager Approved</option>
                <option value="HR Approved">HR Approved</option>
                <option value="Rejected">Rejected</option>
             </select>
          </div>
       </div>

       <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase">Reason</th>
                   <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase">Date</th>
                   <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase">LWD</th>
                   <th className="px-6 py-3 text-center font-medium text-slate-500 uppercase">Status</th>
                   <th className="px-6 py-3 text-right font-medium text-slate-500 uppercase">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {filtered.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No resignations found.</td></tr>
                ) : (
                   filtered.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 font-medium text-slate-900">{getEmpName(req.employeeId)}</td>
                         <td className="px-6 py-4 text-slate-600">{req.reason}</td>
                         <td className="px-6 py-4 text-slate-500">{new Date(req.resignationDate).toLocaleDateString()}</td>
                         <td className="px-6 py-4 text-indigo-600 font-medium">{new Date(req.lastWorkingDay).toLocaleDateString()}</td>
                         <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                               ${req.status.includes('Approved') ? 'bg-green-100 text-green-800' : 
                                 req.status.includes('Rejected') ? 'bg-red-100 text-red-800' : 
                                 'bg-yellow-100 text-yellow-800'}`}>
                               {req.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            {req.status === 'Manager Approved' && (
                               <div className="flex justify-end gap-2">
                                  <button onClick={() => handleReject(req)} className="text-red-600 hover:text-red-800" title="Reject">
                                     <XCircle className="w-5 h-5" />
                                  </button>
                                  <button onClick={() => handleApprove(req)} className="text-green-600 hover:text-green-800" title="Approve">
                                     <CheckCircle className="w-5 h-5" />
                                  </button>
                               </div>
                            )}
                            {req.status === 'HR Approved' && (
                               <button onClick={() => navigate(`/exit/process/${req.id}`)} className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end ml-auto text-xs font-bold uppercase">
                                  <Settings className="w-4 h-4 mr-1" /> Manage Exit
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
