
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { RegularisationRequest } from '../../types';

export const RegularisationApprovals: React.FC = () => {
  const { regularisationRequests, employees, currentUser, updateRegularisationRequest } = useApp();
  const [selectedReq, setSelectedReq] = useState<RegularisationRequest | null>(null);
  const [remarks, setRemarks] = useState('');

  const myTeamIds = employees.filter(e => e.reportingManagerId === currentUser.employeeId).map(e => e.id);
  
  const pendingRequests = regularisationRequests.filter(r => 
     myTeamIds.includes(r.employeeId) && 
     r.status === 'Pending Manager Approval'
  );

  const getEmpName = (id: string) => {
     const e = employees.find(em => em.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };

  const handleAction = (action: 'Approve' | 'Reject') => {
     if (!selectedReq) return;
     
     const updated: RegularisationRequest = {
        ...selectedReq,
        status: action === 'Approve' ? 'Pending HR Approval' : 'Rejected',
        managerComments: remarks,
        managerActionDate: new Date().toISOString(),
        managerId: currentUser.employeeId
     };

     updateRegularisationRequest(updated);
     setSelectedReq(null);
     setRemarks('');
  };

  return (
    <div className="space-y-6">
       <h2 className="text-lg font-bold text-slate-900">Regularisation Approvals</h2>

       <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Request</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reason</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {pendingRequests.length === 0 ? (
                   <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No pending requests.</td></tr>
                ) : (
                   pendingRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 text-sm font-medium text-slate-900">{getEmpName(req.employeeId)}</td>
                         <td className="px-6 py-4 text-sm text-slate-600">{new Date(req.attendanceDate).toLocaleDateString()}</td>
                         <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="font-medium">{req.requestType}</div>
                            {req.proposedFirstIn && <div className="text-xs text-slate-500">In: {req.proposedFirstIn}</div>}
                            {req.proposedLastOut && <div className="text-xs text-slate-500">Out: {req.proposedLastOut}</div>}
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-600">{req.reason}</td>
                         <td className="px-6 py-4 text-right">
                            <button onClick={() => setSelectedReq(req)} className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end ml-auto">
                               <Eye className="w-4 h-4 mr-1" /> Review
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
                <h3 className="text-lg font-bold mb-4">Review Request</h3>
                <div className="space-y-3 text-sm mb-4">
                   <div className="flex justify-between"><span className="text-slate-500">Employee:</span> <span className="font-medium">{getEmpName(selectedReq.employeeId)}</span></div>
                   <div className="flex justify-between"><span className="text-slate-500">Date:</span> <span className="font-medium">{selectedReq.attendanceDate}</span></div>
                   <div className="flex justify-between"><span className="text-slate-500">Type:</span> <span className="font-medium">{selectedReq.requestType}</span></div>
                   <div className="bg-slate-50 p-2 rounded border text-slate-600">{selectedReq.reason}</div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Manager Remarks</label>
                   <textarea 
                     className="w-full border border-slate-300 rounded-md p-2 text-sm" 
                     rows={2}
                     value={remarks}
                     onChange={e => setRemarks(e.target.value)}
                   />
                </div>

                <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-slate-100">
                   <button onClick={() => setSelectedReq(null)} className="px-4 py-2 border border-slate-300 rounded text-sm hover:bg-slate-50">Cancel</button>
                   <button onClick={() => handleAction('Reject')} className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center"><XCircle className="w-4 h-4 mr-1"/> Reject</button>
                   <button onClick={() => handleAction('Approve')} className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> Approve</button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
