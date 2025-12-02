
import React from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveRequestStatus } from '../../types';
import { CheckCircle, XCircle, User } from 'lucide-react';

export const TeamApprovals: React.FC = () => {
  const { leaveRequests, employees, leaveTypes, currentUser, approveLeaveRequest, rejectLeaveRequest } = useApp();

  // Get pending requests for direct reports
  const myPendingRequests = leaveRequests.filter(req => {
     const emp = employees.find(e => e.id === req.employeeId);
     return emp?.reportingManagerId === currentUser.employeeId && req.status === LeaveRequestStatus.PENDING_MANAGER;
  });

  const handleApprove = (req: any) => {
     approveLeaveRequest(req, 'Approved by Manager');
  };

  const handleReject = (req: any) => {
     const reason = prompt('Enter rejection reason:');
     if (reason) rejectLeaveRequest(req, reason, 'Manager');
  };

  const getEmpName = (id: string) => {
     const e = employees.find(emp => emp.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };

  const getTypeName = (id: string) => leaveTypes.find(t => t.id === id)?.name || id;

  return (
    <div className="space-y-6">
       <h2 className="text-lg font-bold text-slate-900">Team Approvals</h2>

       <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Leave Type</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Duration</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reason</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {myPendingRequests.length === 0 ? (
                   <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No pending approvals.</td></tr>
                ) : (
                   myPendingRequests.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4">
                            <div className="flex items-center">
                               <User className="w-8 h-8 text-slate-400 bg-slate-100 rounded-full p-1 mr-3" />
                               <div className="text-sm font-medium text-slate-900">{getEmpName(req.employeeId)}</div>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-600">{getTypeName(req.leaveTypeId)}</td>
                         <td className="px-6 py-4 text-sm text-slate-600">
                            <div>{new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}</div>
                            <div className="text-xs font-bold text-slate-500">{req.totalDays} Days</div>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-500 italic">"{req.reason}"</td>
                         <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button onClick={() => handleReject(req)} className="text-red-600 hover:text-red-800" title="Reject">
                               <XCircle className="w-6 h-6" />
                            </button>
                            <button onClick={() => handleApprove(req)} className="text-green-600 hover:text-green-800" title="Approve">
                               <CheckCircle className="w-6 h-6" />
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
