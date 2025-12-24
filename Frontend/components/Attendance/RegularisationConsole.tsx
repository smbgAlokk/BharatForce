
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RegularisationRequest, RequestStatus } from '../../types';
import { CheckCircle, XCircle, Eye, Search, CheckSquare } from 'lucide-react';

export const RegularisationConsole: React.FC = () => {
  const { regularisationRequests, employees, currentUser, approveRegularisation, rejectRegularisation, currentTenant } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('Pending HR Approval');
  const [selectedReq, setSelectedReq] = useState<RegularisationRequest | null>(null);
  const [remarks, setRemarks] = useState('');

  const myRequests = regularisationRequests.filter(r => r.companyId === currentTenant?.id);
  
  const filtered = myRequests.filter(r => {
     if (filterStatus !== 'All' && r.status !== filterStatus) return false;
     return true;
  });

  const getEmpName = (id: string) => {
     const e = employees.find(em => em.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };

  const handleAction = (action: 'Approve' | 'Reject') => {
     if (!selectedReq) return;
     
     if (action === 'Approve') {
        approveRegularisation(selectedReq, remarks);
     } else {
        rejectRegularisation(selectedReq, remarks);
     }
     setSelectedReq(null);
     setRemarks('');
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Regularisation Console</h2>
          <select 
             className="border-slate-300 rounded-md shadow-sm text-sm p-2 w-48"
             value={filterStatus}
             onChange={e => setFilterStatus(e.target.value)}
          >
             <option value="All">All Requests</option>
             <option value="Pending HR Approval">Pending HR Approval</option>
             <option value="Approved">Approved</option>
             <option value="Rejected">Rejected</option>
          </select>
       </div>

       <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Request Details</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Manager Review</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {filtered.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No requests found.</td></tr>
                ) : (
                   filtered.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 text-sm font-medium text-slate-900">{getEmpName(req.employeeId)}</td>
                         <td className="px-6 py-4 text-sm text-slate-600">{new Date(req.attendanceDate).toLocaleDateString()}</td>
                         <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="font-medium text-indigo-600">{req.requestType}</div>
                            <div className="text-xs text-slate-500 mt-1">{req.reason}</div>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-600">
                            {req.managerActionDate ? (
                               <div>
                                  <div className="text-xs font-medium">Reviewed on {new Date(req.managerActionDate).toLocaleDateString()}</div>
                                  <div className="italic text-xs text-slate-500">"{req.managerComments || 'Approved'}"</div>
                               </div>
                            ) : (
                               <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Pending Manager</span>
                            )}
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${req.status === 'Approved' ? 'bg-green-100 text-green-800' : req.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                               {req.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button onClick={() => setSelectedReq(req)} className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end ml-auto">
                               <Eye className="w-4 h-4 mr-1" /> View
                            </button>
                         </td>
                      </tr>
                   ))
                )}
             </tbody>
          </table>
       </div>

       {selectedReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">Final Approval</h3>
                <div className="space-y-3 text-sm mb-4 border-b pb-4 border-slate-100">
                   <div className="flex justify-between"><span className="text-slate-500">Employee:</span> <span className="font-medium">{getEmpName(selectedReq.employeeId)}</span></div>
                   <div className="flex justify-between"><span className="text-slate-500">Type:</span> <span className="font-medium">{selectedReq.requestType}</span></div>
                   <div className="flex justify-between"><span className="text-slate-500">Date:</span> <span className="font-medium">{selectedReq.attendanceDate}</span></div>
                   {selectedReq.proposedFirstIn && <div className="flex justify-between"><span className="text-slate-500">In Time:</span> <span className="font-bold text-green-600">{selectedReq.proposedFirstIn}</span></div>}
                   {selectedReq.proposedLastOut && <div className="flex justify-between"><span className="text-slate-500">Out Time:</span> <span className="font-bold text-red-600">{selectedReq.proposedLastOut}</span></div>}
                   <div className="bg-slate-50 p-2 rounded border text-slate-600 mt-2">Reason: {selectedReq.reason}</div>
                </div>

                {selectedReq.status === 'Pending HR Approval' && (
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">HR Remarks</label>
                      <textarea 
                        className="w-full border border-slate-300 rounded-md p-2 text-sm" 
                        rows={2}
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                        placeholder="Final comments..."
                      />
                      <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-slate-100">
                         <button onClick={() => setSelectedReq(null)} className="px-4 py-2 border border-slate-300 rounded text-sm hover:bg-slate-50">Cancel</button>
                         <button onClick={() => handleAction('Reject')} className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center"><XCircle className="w-4 h-4 mr-1"/> Reject</button>
                         <button onClick={() => handleAction('Approve')} className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> Final Approve</button>
                      </div>
                   </div>
                )}
                {selectedReq.status !== 'Pending HR Approval' && (
                   <div className="text-center">
                      <p className="text-sm text-slate-500 italic mb-4">This request has already been processed.</p>
                      <button onClick={() => setSelectedReq(null)} className="px-4 py-2 border border-slate-300 rounded text-sm hover:bg-slate-50">Close</button>
                   </div>
                )}
             </div>
          </div>
       )}
    </div>
  );
};
