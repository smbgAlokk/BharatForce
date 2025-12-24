
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveRequestStatus } from '../../types';
import { CheckCircle, XCircle, User, CheckSquare } from 'lucide-react';

export const LeaveConsole: React.FC = () => {
  const { leaveRequests, employees, leaveTypes, currentTenant, approveLeaveRequestHR, rejectLeaveRequest } = useApp();
  const [activeTab, setActiveTab] = useState<'Pending' | 'History'>('Pending');

  const myRequests = leaveRequests.filter(req => req.companyId === currentTenant?.id);

  const pendingRequests = myRequests.filter(req => req.status === LeaveRequestStatus.PENDING_HR);
  const historyRequests = myRequests.filter(req => req.status === LeaveRequestStatus.APPROVED || req.status === LeaveRequestStatus.REJECTED);

  const displayRequests = activeTab === 'Pending' ? pendingRequests : historyRequests;

  const handleApprove = (req: any) => {
     if (window.confirm(`Approve request for ${req.totalDays} days? This will deduct leave balance.`)) {
        approveLeaveRequestHR(req, 'Approved by HR');
     }
  };

  const handleReject = (req: any) => {
     const reason = prompt('Enter rejection reason:');
     if (reason) rejectLeaveRequest(req, reason, 'HR');
  };

  const getEmpName = (id: string) => {
     const e = employees.find(emp => emp.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };

  const getTypeName = (id: string) => leaveTypes.find(t => t.id === id)?.name || id;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Leave Console (HR)</h2>
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button onClick={() => setActiveTab('Pending')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'Pending' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}>Pending ({pendingRequests.length})</button>
             <button onClick={() => setActiveTab('History')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'History' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}>History</button>
          </div>
       </div>

       <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Leave Type</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Dates</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reason</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {displayRequests.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No requests found.</td></tr>
                ) : (
                   displayRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-900">{getEmpName(req.employeeId)}</div>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-600">{getTypeName(req.leaveTypeId)}</td>
                         <td className="px-6 py-4 text-sm text-slate-600">
                            <div>{new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}</div>
                            <div className="text-xs font-bold text-slate-500">{req.totalDays} Days</div>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-500 italic line-clamp-1">"{req.reason}"</td>
                         <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium 
                               ${req.status === LeaveRequestStatus.APPROVED ? 'bg-green-100 text-green-800' : 
                                 req.status === LeaveRequestStatus.REJECTED ? 'bg-red-100 text-red-800' : 
                                 'bg-blue-100 text-blue-800'}`}>
                               {req.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right flex justify-end gap-2">
                            {activeTab === 'Pending' && (
                               <>
                                 <button onClick={() => handleReject(req)} className="text-red-600 hover:text-red-800" title="Reject">
                                    <XCircle className="w-5 h-5" />
                                 </button>
                                 <button onClick={() => handleApprove(req)} className="text-green-600 hover:text-green-800" title="Approve">
                                    <CheckCircle className="w-5 h-5" />
                                 </button>
                               </>
                            )}
                            {activeTab === 'History' && <span className="text-xs text-slate-400">View Only</span>}
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
