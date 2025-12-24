
import React from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseAdvance, UserRole } from '../../types';
import { CheckCircle, XCircle, User } from 'lucide-react';

export const AdvanceApprovals: React.FC = () => {
  const { expenseAdvances, employees, currentUser, userRole, approveAdvanceRequest, rejectAdvanceRequest } = useApp();

  const getEmpName = (id: string) => {
     const e = employees.find(em => em.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };

  // Filter Logic
  const pendingAdvances = expenseAdvances.filter(adv => {
     if (adv.status === 'Rejected' || adv.status === 'Closed' || adv.status === 'HR Approved') return false;

     if (userRole === UserRole.MANAGER) {
        const emp = employees.find(e => e.id === adv.employeeId);
        return emp?.reportingManagerId === currentUser.employeeId && adv.status === 'Submitted';
     }
     if (userRole === UserRole.COMPANY_ADMIN) {
        // HR sees Manager Approved (if 2-level) or Submitted (if HR acts directly)
        // For simplicity, HR sees anything not yet HR Approved
        return adv.status === 'Submitted' || adv.status === 'Manager Approved';
     }
     return false;
  });

  const handleApprove = (adv: ExpenseAdvance) => {
     approveAdvanceRequest(adv, currentUser.employeeId || 'HR', userRole === UserRole.MANAGER ? 'Manager' : 'HR');
  };

  const handleReject = (adv: ExpenseAdvance) => {
     rejectAdvanceRequest(adv, currentUser.employeeId || 'HR', userRole === UserRole.MANAGER ? 'Manager' : 'HR');
  };

  return (
    <div className="space-y-6">
       <h2 className="text-lg font-bold text-slate-900">Advance Request Approvals</h2>

       <div className="grid grid-cols-1 gap-4">
          {pendingAdvances.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">No pending advance requests.</div>
          ) : (
             pendingAdvances.map(adv => (
                <div key={adv.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-500" />
                         </div>
                         <div>
                            <div className="font-bold text-slate-900">{getEmpName(adv.employeeId)}</div>
                            <div className="text-sm text-slate-500">{adv.reason}</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-lg font-bold text-slate-900">₹ {adv.amount.toLocaleString()}</div>
                         <span className="text-xs bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded">{adv.status}</span>
                      </div>
                   </div>
                   <div className="mt-4 flex justify-end gap-3 border-t pt-3">
                      <button onClick={() => handleReject(adv)} className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center">
                         <XCircle className="w-4 h-4 mr-1" /> Reject
                      </button>
                      <button onClick={() => handleApprove(adv)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium flex items-center">
                         <CheckCircle className="w-4 h-4 mr-1" /> Approve
                      </button>
                   </div>
                </div>
             ))
          )}
       </div>
    </div>
  );
};
