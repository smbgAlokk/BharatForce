
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProposalStatus, PayrollSyncStatus } from '../../types';
import { Download, CheckCircle, Send } from 'lucide-react';

export const PayrollSync: React.FC = () => {
  const { piProposals, employees, currentTenant, updatePayrollSyncStatus } = useApp();
  const [filterStatus, setFilterStatus] = useState<PayrollSyncStatus | 'All'>('All');

  const approvedProposals = piProposals.filter(p => 
    p.companyId === currentTenant?.id && 
    p.status === ProposalStatus.APPROVED && 
    (filterStatus === 'All' || p.payrollSyncStatus === filterStatus)
  );

  const getEmpName = (id: string) => {
     const e = employees.find(em => em.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };

  const handleStatusUpdate = (id: string, status: PayrollSyncStatus) => {
     if (window.confirm(`Mark as ${status}?`)) {
        updatePayrollSyncStatus(id, status);
     }
  };

  const handleExport = () => {
     alert("Exporting CSV for Payroll System... (Mock Download)");
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Payroll Sync</h2>
             <p className="text-sm text-slate-500">Handoff approved increments to payroll.</p>
          </div>
          <button onClick={handleExport} className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
             <Download className="h-4 w-4 mr-2" /> Export CSV
          </button>
       </div>

       <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
             <select 
               className="border-slate-300 rounded-md text-sm p-1.5"
               value={filterStatus}
               onChange={e => setFilterStatus(e.target.value as any)}
             >
                <option value="All">All Status</option>
                <option value="Not Sent">Not Sent</option>
                <option value="Sent">Sent to Payroll</option>
                <option value="Confirmed">Confirmed</option>
             </select>
          </div>
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Effective Date</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">New CTC</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {approvedProposals.length === 0 ? (
                   <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No records found.</td></tr>
                ) : (
                   approvedProposals.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 text-sm font-medium text-slate-900">{getEmpName(p.employeeId)}</td>
                         <td className="px-6 py-4 text-sm text-slate-500">{new Date(p.effectiveDate || '').toLocaleDateString()}</td>
                         <td className="px-6 py-4 text-sm font-bold text-slate-700">₹ {p.proposedCtc?.toLocaleString()}</td>
                         <td className="px-6 py-4 text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                               p.payrollSyncStatus === 'Confirmed' ? 'bg-green-100 text-green-800' :
                               p.payrollSyncStatus === 'Sent' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                               {p.payrollSyncStatus}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right flex justify-end gap-2">
                            {p.payrollSyncStatus === 'Not Sent' && (
                               <button onClick={() => handleStatusUpdate(p.id, 'Sent')} className="text-blue-600 hover:text-blue-900 text-xs font-medium flex items-center">
                                  <Send className="w-3 h-3 mr-1" /> Mark Sent
                               </button>
                            )}
                            {p.payrollSyncStatus === 'Sent' && (
                               <button onClick={() => handleStatusUpdate(p.id, 'Confirmed')} className="text-green-600 hover:text-green-900 text-xs font-medium flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" /> Confirm
                               </button>
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
