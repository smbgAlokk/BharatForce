
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle, XCircle, User, Clock } from 'lucide-react';
import { ExpenseClaim } from '../../types';

export const TeamApprovals: React.FC = () => {
  const { expenseClaims, employees, currentUser, approveExpenseClaim, rejectExpenseClaim } = useApp();
  const [activeTab, setActiveTab] = useState<'Pending' | 'History'>('Pending');

  // Filter Claims: Submitted status AND belonging to direct report
  const pendingClaims = expenseClaims.filter(c => {
     const emp = employees.find(e => e.id === c.employeeId);
     return c.status === 'Submitted' && emp?.reportingManagerId === currentUser.employeeId;
  });

  const historyClaims = expenseClaims.filter(c => {
     const emp = employees.find(e => e.id === c.employeeId);
     return (c.status !== 'Draft' && c.status !== 'Submitted') && emp?.reportingManagerId === currentUser.employeeId;
  });

  const displayClaims = activeTab === 'Pending' ? pendingClaims : historyClaims;

  const getEmpName = (id: string) => {
     const e = employees.find(em => em.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };

  const handleApprove = (claim: ExpenseClaim) => {
     approveExpenseClaim(claim, currentUser.employeeId || '', 'Manager', 'Approved by Manager');
  };

  const handleReject = (claim: ExpenseClaim) => {
     const reason = prompt('Enter rejection reason:');
     if (reason) {
        rejectExpenseClaim(claim, currentUser.employeeId || '', 'Manager', reason);
     }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Team Expense Approvals</h2>
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button onClick={() => setActiveTab('Pending')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'Pending' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}>Pending ({pendingClaims.length})</button>
             <button onClick={() => setActiveTab('History')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'History' ? 'bg-white text-indigo-600 shadow' : 'text-slate-500'}`}>History</button>
          </div>
       </div>

       <div className="grid grid-cols-1 gap-4">
          {displayClaims.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">No claims found.</div>
          ) : (
             displayClaims.map(claim => (
                <div key={claim.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-500" />
                         </div>
                         <div>
                            <div className="font-bold text-slate-900">{getEmpName(claim.employeeId)}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                               <Clock className="w-3 h-3" /> {new Date(claim.claimDate).toLocaleDateString()}
                            </div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="text-lg font-bold text-slate-900">₹ {claim.totalAmount.toLocaleString()}</div>
                         <span className={`text-xs px-2 py-0.5 rounded ${claim.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'}`}>{claim.status}</span>
                      </div>
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="text-sm text-slate-600 mb-2">
                         <span className="font-medium">Purpose:</span> {claim.notes || 'No notes'}
                      </div>
                      <div className="space-y-1">
                         {claim.lines.slice(0, 2).map((line, i) => (
                            <div key={i} className="flex justify-between text-xs text-slate-500">
                               <span>{line.description}</span>
                               <span>₹ {line.amount}</span>
                            </div>
                         ))}
                         {claim.lines.length > 2 && <div className="text-xs text-indigo-600 italic">+{claim.lines.length - 2} more items</div>}
                      </div>
                   </div>

                   {activeTab === 'Pending' && (
                      <div className="mt-4 flex justify-end gap-3">
                         <button onClick={() => handleReject(claim)} className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center">
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                         </button>
                         <button onClick={() => handleApprove(claim)} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm font-medium flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                         </button>
                      </div>
                   )}
                </div>
             ))
          )}
       </div>
    </div>
  );
};
