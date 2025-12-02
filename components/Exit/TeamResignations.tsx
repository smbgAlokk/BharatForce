
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ResignationRequest } from '../../types';
import { CheckCircle, XCircle, User, Calendar } from 'lucide-react';

export const TeamResignations: React.FC = () => {
  const { resignationRequests, employees, currentUser, approveResignation, rejectResignation } = useApp();
  
  // Filter for Direct Reports and Submitted status
  const pendingRequests = resignationRequests.filter(r => {
     const emp = employees.find(e => e.id === r.employeeId);
     return emp?.reportingManagerId === currentUser.employeeId && r.status === 'Submitted';
  });

  const getEmpName = (id: string) => {
     const e = employees.find(em => em.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };

  const handleApprove = (req: ResignationRequest) => {
     const comments = prompt("Approval Comments (Optional):") || '';
     approveResignation(req, currentUser.employeeId || 'Mgr', 'Manager', comments);
  };

  const handleReject = (req: ResignationRequest) => {
     const comments = prompt("Rejection Reason:") || '';
     if (comments) rejectResignation(req, currentUser.employeeId || 'Mgr', 'Manager', comments);
  };

  return (
    <div className="space-y-6">
       <h2 className="text-lg font-bold text-slate-900">Team Resignations</h2>

       <div className="grid grid-cols-1 gap-4">
          {pendingRequests.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">No pending resignations.</div>
          ) : (
             pendingRequests.map(req => (
                <div key={req.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="font-bold text-slate-900">{getEmpName(req.employeeId)}</div>
                            <div className="text-sm text-slate-500">Reason: {req.reason}</div>
                         </div>
                      </div>
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">{req.status}</span>
                   </div>

                   <div className="mt-4 grid grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded border border-slate-100">
                      <div>
                         <span className="block text-xs text-slate-500 uppercase">Resigned On</span>
                         <span className="font-medium">{new Date(req.resignationDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                         <span className="block text-xs text-slate-500 uppercase">Proposed LWD</span>
                         <span className="font-medium text-indigo-600">{new Date(req.lastWorkingDay).toLocaleDateString()}</span>
                      </div>
                      {req.notes && (
                         <div className="col-span-2">
                            <span className="block text-xs text-slate-500 uppercase">Notes</span>
                            <span className="text-slate-700">{req.notes}</span>
                         </div>
                      )}
                   </div>

                   <div className="mt-4 flex justify-end gap-3">
                      <button onClick={() => handleReject(req)} className="flex items-center px-4 py-2 border border-red-200 text-red-700 rounded-md hover:bg-red-50 text-sm font-medium">
                         <XCircle className="w-4 h-4 mr-2" /> Reject
                      </button>
                      <button onClick={() => handleApprove(req)} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium">
                         <CheckCircle className="w-4 h-4 mr-2" /> Approve
                      </button>
                   </div>
                </div>
             ))
          )}
       </div>
    </div>
  );
};
