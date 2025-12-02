
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ResignationStatus, FnFStatus, FnFSettlement } from '../../types';
import { Plus, Search, Eye, Download } from 'lucide-react';

export const FnFSettlements: React.FC = () => {
  const navigate = useNavigate();
  const { fnfSettlements, resignationRequests, employees, currentTenant, addFnFSettlement, currentUser } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedResignationId, setSelectedResignationId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const mySettlements = fnfSettlements.filter(s => s.companyId === currentTenant?.id);
  
  // Eligible resignations for New F&F (HR Approved and not already in F&F)
  const eligibleResignations = resignationRequests.filter(r => 
     r.companyId === currentTenant?.id &&
     r.status === 'HR Approved' &&
     !mySettlements.some(s => s.resignationRequestId === r.id)
  );

  const filtered = mySettlements.filter(s => {
     const emp = employees.find(e => e.id === s.employeeId);
     const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : '';
     const matchesSearch = name.includes(searchTerm.toLowerCase());
     const matchesStatus = statusFilter === 'All' ? true : s.status === statusFilter;
     return matchesSearch && matchesStatus;
  });

  const getEmpName = (id: string) => {
     const e = employees.find(em => em.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };

  const handleCreate = () => {
     if (!selectedResignationId) return;
     const req = resignationRequests.find(r => r.id === selectedResignationId);
     if (!req || !currentTenant) return;

     const newFnF: FnFSettlement = {
        id: `fnf-${Date.now()}`,
        companyId: currentTenant.id,
        resignationRequestId: req.id,
        employeeId: req.employeeId,
        lastWorkingDay: req.lastWorkingDay,
        status: 'Draft',
        totalEarnings: 0,
        totalDeductions: 0,
        netPayable: 0,
        components: [],
        createdAt: new Date().toISOString(),
        createdBy: currentUser.name
     };

     addFnFSettlement(newFnF);
     setIsCreateModalOpen(false);
     navigate(`/exit/fnf/${newFnF.id}`);
  };

  const handleExport = () => {
     if (filtered.length === 0) {
        alert('No data to export');
        return;
     }
     
     const data = filtered.map(s => ({
        FnF_ID: s.id,
        Employee: getEmpName(s.employeeId),
        LWD: new Date(s.lastWorkingDay).toLocaleDateString(),
        Earnings: s.totalEarnings,
        Deductions: s.totalDeductions,
        NetPayable: s.netPayable,
        Direction: s.netPayable >= 0 ? 'Payable to Employee' : 'Recoverable',
        Status: s.status
     }));

     const headers = Object.keys(data[0]);
     const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => JSON.stringify((row as any)[h])).join(','))
     ].join('\n');

     const blob = new Blob([csv], { type: 'text/csv' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = `FnF_Settlements_${new Date().toISOString().split('T')[0]}.csv`;
     a.click();
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Full & Final Settlements</h2>
             <p className="text-sm text-slate-500">Process final payouts for exiting employees.</p>
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
             <Plus className="h-4 w-4 mr-2" /> New F&F
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
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
             >
                <option value="All">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Under Review">Under Review</option>
                <option value="Finalised">Finalised</option>
             </select>
             <button onClick={handleExport} className="ml-auto flex items-center px-3 py-2 bg-white border border-slate-300 rounded-md text-sm hover:bg-slate-50">
                <Download className="w-4 h-4 mr-2" /> Export CSV
             </button>
          </div>
          
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-white">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">LWD</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total Earnings</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total Ded.</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Net Payable</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {filtered.length === 0 ? (
                   <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No settlements found.</td></tr>
                ) : (
                   filtered.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 font-medium text-slate-900">{getEmpName(s.employeeId)}</td>
                         <td className="px-6 py-4 text-slate-600">{new Date(s.lastWorkingDay).toLocaleDateString()}</td>
                         <td className="px-6 py-4 text-right text-slate-600">{s.totalEarnings.toLocaleString()}</td>
                         <td className="px-6 py-4 text-right text-red-600">{s.totalDeductions.toLocaleString()}</td>
                         <td className={`px-6 py-4 text-right font-bold ${s.netPayable >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {s.netPayable.toLocaleString()}
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === 'Finalised' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                               {s.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button onClick={() => navigate(`/exit/fnf/${s.id}`)} className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end w-full">
                               <Eye className="w-4 h-4 mr-1" /> View
                            </button>
                         </td>
                      </tr>
                   ))
                )}
             </tbody>
          </table>
       </div>

       {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">Initiate F&F Settlement</h3>
                {eligibleResignations.length === 0 ? (
                   <div className="text-center py-4 text-slate-500">
                      No eligible resignation requests found (Must be HR Approved).
                      <div className="mt-4">
                         <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded text-sm">Close</button>
                      </div>
                   </div>
                ) : (
                   <div className="space-y-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Select Employee</label>
                         <select 
                            className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm"
                            value={selectedResignationId}
                            onChange={e => setSelectedResignationId(e.target.value)}
                         >
                            <option value="">-- Select --</option>
                            {eligibleResignations.map(r => (
                               <option key={r.id} value={r.id}>
                                  {getEmpName(r.employeeId)} (LWD: {new Date(r.lastWorkingDay).toLocaleDateString()})
                               </option>
                            ))}
                         </select>
                      </div>
                      <div className="flex justify-end space-x-3 mt-6">
                         <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                         <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Create Draft</button>
                      </div>
                   </div>
                )}
             </div>
          </div>
       )}
    </div>
  );
};