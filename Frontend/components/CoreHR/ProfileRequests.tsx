
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ChangeRequestStatus, ProfileChangeRequest } from '../../types';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

export const ProfileRequests: React.FC = () => {
  const { profileRequests, approveProfileRequest, rejectProfileRequest, currentTenant } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [viewReq, setViewReq] = useState<ProfileChangeRequest | null>(null);
  const [hrRemarks, setHrRemarks] = useState('');

  const myRequests = profileRequests.filter(r => r.companyId === currentTenant?.id);
  
  const filtered = myRequests.filter(r => {
    if (filterStatus !== 'All' && r.status !== filterStatus) return false;
    return true;
  });

  // Sort Pending first, then date
  filtered.sort((a, b) => {
    if (a.status === ChangeRequestStatus.PENDING && b.status !== ChangeRequestStatus.PENDING) return -1;
    if (a.status !== ChangeRequestStatus.PENDING && b.status === ChangeRequestStatus.PENDING) return 1;
    return new Date(b.requestedOn).getTime() - new Date(a.requestedOn).getTime();
  });

  const handleApprove = () => {
    if (viewReq) {
      approveProfileRequest(viewReq.id, hrRemarks);
      setViewReq(null);
      setHrRemarks('');
    }
  };

  const handleReject = () => {
     if (viewReq) {
      rejectProfileRequest(viewReq.id, hrRemarks);
      setViewReq(null);
      setHrRemarks('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Profile Change Requests</h1>
           <p className="text-slate-500 mt-1">Review and approve employee profile updates.</p>
        </div>
        <div className="flex space-x-2">
           <select 
             className="block pl-3 pr-8 py-2 border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
             value={filterStatus}
             onChange={e => setFilterStatus(e.target.value)}
           >
             <option value="All">All Status</option>
             <option value="Pending">Pending</option>
             <option value="Approved">Approved</option>
             <option value="Rejected">Rejected</option>
           </select>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
         <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Request ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
               {filtered.length === 0 ? (
                 <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No requests found.</td></tr>
               ) : (
                 filtered.map(req => (
                   <tr key={req.id} className="hover:bg-slate-50">
                     <td className="px-6 py-4 text-sm font-mono text-slate-500">{req.id}</td>
                     <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{req.employeeName}</div>
                        <div className="text-xs text-slate-500">{req.employeeCode}</div>
                     </td>
                     <td className="px-6 py-4 text-sm text-slate-900">{req.category}</td>
                     <td className="px-6 py-4 text-sm text-slate-500">{new Date(req.requestedOn).toLocaleDateString()}</td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full 
                          ${req.status === ChangeRequestStatus.APPROVED ? 'bg-green-100 text-green-800' : 
                            req.status === ChangeRequestStatus.REJECTED ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {req.status}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right text-sm font-medium">
                        <button onClick={() => setViewReq(req)} className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end ml-auto">
                           <Eye className="h-4 w-4 mr-1" /> View
                        </button>
                     </td>
                   </tr>
                 ))
               )}
            </tbody>
         </table>
      </div>

      {/* Detail Modal */}
      {viewReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
           <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
              <div className="border-b pb-4 mb-4">
                 <h3 className="text-lg font-bold text-slate-900">Review Request</h3>
                 <div className="flex justify-between mt-1">
                    <span className="text-sm text-slate-500">Ref: {viewReq.id}</span>
                    <span className="text-sm font-medium">{viewReq.employeeName}</span>
                 </div>
              </div>
              
              <div className="space-y-4 mb-6">
                 <h4 className="text-sm font-medium text-slate-700 uppercase">Changes Requested</h4>
                 {viewReq.changes.map((c, i) => (
                   <div key={i} className="bg-slate-50 p-3 rounded border border-slate-200 text-sm">
                      <div className="text-xs text-slate-500 uppercase mb-1">{c.label}</div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <div className="text-xs text-slate-400">Old Value</div>
                            <div className="font-medium text-slate-700 line-through">{c.oldValue || '(Empty)'}</div>
                         </div>
                         <div>
                            <div className="text-xs text-indigo-400">New Value</div>
                            <div className="font-bold text-indigo-700">{c.newValue}</div>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>

              {viewReq.status === ChangeRequestStatus.PENDING ? (
                 <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1">HR Remarks</label>
                    <textarea 
                      className="block w-full border border-slate-300 rounded-md py-2 px-3 text-sm" 
                      rows={2}
                      value={hrRemarks}
                      onChange={e => setHrRemarks(e.target.value)}
                      placeholder="Add a note..."
                    />
                 </div>
              ) : (
                 <div className="mb-6 bg-slate-50 p-3 rounded">
                    <div className="text-xs text-slate-500 uppercase">HR Remarks</div>
                    <div className="text-sm">{viewReq.hrRemarks || '-'}</div>
                 </div>
              )}

              <div className="flex justify-end space-x-3">
                 <button onClick={() => setViewReq(null)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Close</button>
                 {viewReq.status === ChangeRequestStatus.PENDING && (
                   <>
                     <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 flex items-center">
                        <XCircle className="w-4 h-4 mr-1" /> Reject
                     </button>
                     <button onClick={handleApprove} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" /> Approve & Apply
                     </button>
                   </>
                 )}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};
