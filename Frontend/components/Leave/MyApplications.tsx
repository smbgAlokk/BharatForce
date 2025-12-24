
import React from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveRequestStatus } from '../../types';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const MyApplications: React.FC = () => {
  const { leaveRequests, leaveTypes, currentUser } = useApp();

  const myRequests = leaveRequests.filter(req => req.employeeId === currentUser.employeeId)
    .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getTypeName = (id: string) => leaveTypes.find(t => t.id === id)?.name || id;

  const getStatusBadge = (status: LeaveRequestStatus) => {
     switch(status) {
        case LeaveRequestStatus.APPROVED: return <span className="flex items-center text-green-700 bg-green-50 px-2 py-1 rounded text-xs font-medium"><CheckCircle className="w-3 h-3 mr-1"/> Approved</span>;
        case LeaveRequestStatus.REJECTED: return <span className="flex items-center text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-medium"><XCircle className="w-3 h-3 mr-1"/> Rejected</span>;
        case LeaveRequestStatus.PENDING_MANAGER: return <span className="flex items-center text-amber-700 bg-amber-50 px-2 py-1 rounded text-xs font-medium"><Clock className="w-3 h-3 mr-1"/> Pending Manager</span>;
        case LeaveRequestStatus.PENDING_HR: return <span className="flex items-center text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs font-medium"><Clock className="w-3 h-3 mr-1"/> Pending HR</span>;
        default: return <span className="text-slate-500 text-xs">{status}</span>;
     }
  };

  return (
    <div className="space-y-6">
       <h2 className="text-lg font-bold text-slate-900">My Leave History</h2>

       <div className="space-y-4">
          {myRequests.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">
                No leave applications found.
             </div>
          ) : (
             myRequests.map(req => (
                <div key={req.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-indigo-200 transition-colors">
                   <div className="flex justify-between items-start">
                      <div>
                         <div className="font-bold text-slate-900">{getTypeName(req.leaveTypeId)}</div>
                         <div className="flex items-center text-sm text-slate-600 mt-1">
                            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                            {new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()}
                            <span className="mx-2">•</span>
                            {req.totalDays} Days
                         </div>
                         <div className="text-sm text-slate-500 mt-2 italic">"{req.reason}"</div>
                      </div>
                      <div className="text-right">
                         {getStatusBadge(req.status)}
                         <div className="text-xs text-slate-400 mt-1">{new Date(req.createdAt).toLocaleDateString()}</div>
                      </div>
                   </div>
                   {req.status === LeaveRequestStatus.REJECTED && (
                      <div className="mt-3 p-2 bg-red-50 text-xs text-red-700 rounded border border-red-100 flex items-start">
                         <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                         <div>
                            <strong>Rejection Reason: </strong> 
                            {req.managerStatus === 'Rejected' ? req.managerComments : req.hrComments}
                         </div>
                      </div>
                   )}
                </div>
             ))
          )}
       </div>
    </div>
  );
};
