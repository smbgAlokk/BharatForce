
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveEncashment, EncashmentType, EncashmentStatus } from '../../types';
import { Search, Plus, CheckCircle, XCircle, IndianRupee } from 'lucide-react';

export const LeaveEncashmentView: React.FC = () => {
  const { 
    leaveEncashments, employees, leaveTypes, leaveBalances, currentTenant, 
    submitLeaveEncashment, approveLeaveEncashment, currentUser 
  } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [encashType, setEncashType] = useState<EncashmentType>('Year-End');
  const [requestDays, setRequestDays] = useState(0);
  
  // Display State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const myEncashments = leaveEncashments.filter(e => e.companyId === currentTenant?.id);
  
  const filtered = myEncashments.filter(e => {
     const emp = employees.find(emp => emp.id === e.employeeId);
     const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : '';
     const matchesSearch = name.includes(searchTerm.toLowerCase());
     const matchesStatus = filterStatus === 'All' || e.status === filterStatus;
     return matchesSearch && matchesStatus;
  });

  const getEmpName = (id: string) => employees.find(e => e.id === id)?.firstName || id;
  const getLeaveName = (id: string) => leaveTypes.find(t => t.id === id)?.code || id;

  // For Modal
  const eligibleBalances = leaveBalances.filter(b => 
      b.employeeId === selectedEmployee && 
      b.isActive && 
      b.currentBalance > 0
      // Ideally check policy flag encashmentAllowed here too
  );

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!selectedEmployee || !selectedType || requestDays <= 0) return;
     
     const bal = eligibleBalances.find(b => b.leaveTypeId === selectedType);
     if (!bal) return;

     const newEnc: LeaveEncashment = {
        id: `enc-${Date.now()}`,
        companyId: currentTenant!.id,
        employeeId: selectedEmployee,
        leaveTypeId: selectedType,
        policyId: bal.policyId,
        encashmentType: encashType,
        periodStartDate: bal.periodStartDate,
        periodEndDate: bal.periodEndDate,
        eligibleDays: bal.currentBalance, // Snapshot
        requestedDays: requestDays,
        approvedDays: requestDays, // Default to requested, HR can change
        status: 'Submitted',
        payrollSyncStatus: 'Not Sent',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.name
     };

     submitLeaveEncashment(newEnc);
     setIsModalOpen(false);
  };

  const handleApprove = (enc: LeaveEncashment) => {
     if (window.confirm(`Approve encashment of ${enc.approvedDays} days? Balance will be deducted.`)) {
        approveLeaveEncashment(enc, currentUser.employeeId || 'HR', 'Approved via Console');
     }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Leave Encashment</h2>
             <p className="text-sm text-slate-500">Manage leave payouts and requests.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
             <Plus className="h-4 w-4 mr-2" /> New Request
          </button>
       </div>

       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
             <div className="relative flex-1 max-w-xs">
                <input 
                  type="text" 
                  className="pl-8 pr-3 py-2 border border-slate-300 rounded-md text-sm w-full" 
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
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
             </select>
          </div>
          
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-white">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Days</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {filtered.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No requests found.</td></tr>
                ) : (
                   filtered.map(enc => (
                      <tr key={enc.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 text-sm font-medium text-slate-900">{getEmpName(enc.employeeId)}</td>
                         <td className="px-6 py-4 text-sm text-slate-600">{getLeaveName(enc.leaveTypeId)}</td>
                         <td className="px-6 py-4 text-sm text-slate-500">{enc.encashmentType}</td>
                         <td className="px-6 py-4 text-right text-sm font-bold text-slate-700">{enc.approvedDays}</td>
                         <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${enc.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                               {enc.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            {enc.status === 'Submitted' && (
                               <button onClick={() => handleApprove(enc)} className="text-green-600 hover:text-green-800 flex items-center justify-end w-full">
                                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                               </button>
                            )}
                            {enc.status === 'Approved' && (
                               <span className="text-xs text-slate-400 flex items-center justify-end">
                                  <IndianRupee className="w-3 h-3 mr-1" /> Sync: {enc.payrollSyncStatus}
                               </span>
                            )}
                         </td>
                      </tr>
                   ))
                )}
             </tbody>
          </table>
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">Create Encashment Request</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Employee</label>
                      <select required className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm"
                         value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
                      >
                         <option value="">Select Employee</option>
                         {employees.filter(e => e.companyId === currentTenant?.id && e.status === 'Active').map(e => (
                            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                         ))}
                      </select>
                   </div>
                   {selectedEmployee && (
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Leave Type</label>
                         <select required className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm"
                            value={selectedType} onChange={e => setSelectedType(e.target.value)}
                         >
                            <option value="">Select Leave Type</option>
                            {eligibleBalances.map(b => (
                               <option key={b.leaveTypeId} value={b.leaveTypeId}>
                                  {getLeaveName(b.leaveTypeId)} (Bal: {b.currentBalance})
                               </option>
                            ))}
                         </select>
                      </div>
                   )}
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Encashment Type</label>
                      <select className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm"
                         value={encashType} onChange={e => setEncashType(e.target.value as EncashmentType)}
                      >
                         <option value="Year-End">Year-End Processing</option>
                         <option value="Exit">Full & Final (Exit)</option>
                         <option value="Ad-hoc">Ad-hoc / Emergency</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Days to Encash</label>
                      <input required type="number" min="0.5" step="0.5" className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm"
                         value={requestDays} onChange={e => setRequestDays(parseFloat(e.target.value))} />
                   </div>

                   <div className="flex justify-end space-x-3 mt-6">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Submit</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};
