
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { ExpenseClaim } from '../../types';

export const AllClaims: React.FC = () => {
  const { expenseClaims, employees, currentUser, approveExpenseClaim, rejectExpenseClaim, currentTenant } = useApp();
  const [filterStatus, setFilterStatus] = useState('Manager Approved');
  const [searchTerm, setSearchTerm] = useState('');

  const myClaims = expenseClaims.filter(c => c.companyId === currentTenant?.id);

  const filtered = myClaims.filter(c => {
     const emp = employees.find(e => e.id === c.employeeId);
     const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : '';
     const matchesSearch = name.includes(searchTerm.toLowerCase());
     const matchesStatus = filterStatus === 'All' ? true : c.status === filterStatus;
     return matchesSearch && matchesStatus;
  });

  const getEmpName = (id: string) => {
     const e = employees.find(em => em.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };

  const handleApprove = (claim: ExpenseClaim) => {
     approveExpenseClaim(claim, currentUser.employeeId || 'HR', 'HR', 'Approved by HR');
  };

  const handleReject = (claim: ExpenseClaim) => {
     const reason = prompt('Enter rejection reason:');
     if (reason) {
        rejectExpenseClaim(claim, currentUser.employeeId || 'HR', 'HR', reason);
     }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">All Expense Claims</h2>
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
                <option value="Submitted">Submitted (Pending Mgr)</option>
                <option value="Manager Approved">Manager Approved (Pending HR)</option>
                <option value="HR Approved">HR Approved</option>
                <option value="Rejected">Rejected</option>
             </select>
          </div>
       </div>

       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase">Date</th>
                   <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase">Amount</th>
                   <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase">Status</th>
                   <th className="px-6 py-3 text-right font-medium text-slate-500 uppercase">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {filtered.length === 0 ? (
                   <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No claims found.</td></tr>
                ) : (
                   filtered.map(claim => (
                      <tr key={claim.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 font-medium text-slate-900">{getEmpName(claim.employeeId)}</td>
                         <td className="px-6 py-4 text-slate-600">{new Date(claim.claimDate).toLocaleDateString()}</td>
                         <td className="px-6 py-4 font-bold text-slate-900">₹ {claim.totalAmount.toLocaleString()}</td>
                         <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium 
                               ${claim.status === 'HR Approved' ? 'bg-green-100 text-green-800' : 
                                 claim.status === 'Manager Approved' ? 'bg-purple-100 text-purple-800' :
                                 claim.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                 'bg-yellow-100 text-yellow-800'}`}>
                               {claim.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            {claim.status === 'Manager Approved' && (
                               <div className="flex justify-end gap-3">
                                  <button onClick={() => handleReject(claim)} className="text-red-600 hover:text-red-800"><XCircle className="w-5 h-5"/></button>
                                  <button onClick={() => handleApprove(claim)} className="text-green-600 hover:text-green-800"><CheckCircle className="w-5 h-5"/></button>
                               </div>
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
