
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmployeeLeaveBalance } from '../../types';
import { Search, Edit2, RefreshCw, History } from 'lucide-react';

export const LeaveBalances: React.FC = () => {
  const { leaveBalances, employees, leaveTypes, currentTenant, adjustLeaveBalance, leaveBalanceChangeLogs } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<EmployeeLeaveBalance | null>(null);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');

  const [showLogs, setShowLogs] = useState(false);
  const [selectedBalanceId, setSelectedBalanceId] = useState<string | null>(null);

  const myBalances = leaveBalances.filter(b => b.companyId === currentTenant?.id);
  const myEmployees = employees.filter(e => e.companyId === currentTenant?.id);
  const myTypes = leaveTypes.filter(t => t.companyId === currentTenant?.id);

  const filteredBalances = myBalances.filter(b => {
     const emp = myEmployees.find(e => e.id === b.employeeId);
     const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : '';
     const matchesSearch = name.includes(searchTerm.toLowerCase());
     const matchesType = filterType === 'All' || b.leaveTypeId === filterType;
     return matchesSearch && matchesType;
  });

  const getEmpName = (id: string) => {
     const e = myEmployees.find(emp => emp.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };
  
  const getLeaveTypeName = (id: string) => myTypes.find(t => t.id === id)?.name || id;

  const openAdjustModal = (balance: EmployeeLeaveBalance) => {
     setAdjustTarget(balance);
     setAdjustAmount(0);
     setAdjustReason('');
     setIsAdjustModalOpen(true);
  };

  const handleAdjust = (e: React.FormEvent) => {
     e.preventDefault();
     if (!adjustTarget || !adjustAmount || !adjustReason) return;
     adjustLeaveBalance(adjustTarget.id, adjustAmount, adjustReason);
     setIsAdjustModalOpen(false);
  };

  const toggleLogs = (balanceId: string) => {
     if (selectedBalanceId === balanceId && showLogs) {
        setShowLogs(false);
        setSelectedBalanceId(null);
     } else {
        setSelectedBalanceId(balanceId);
        setShowLogs(true);
     }
  };

  const currentLogs = leaveBalanceChangeLogs.filter(l => l.companyId === currentTenant?.id && (!selectedBalanceId || (l.employeeId === adjustTarget?.employeeId && l.leaveTypeId === adjustTarget?.leaveTypeId))); // Simplified filter logic

  // Better log filtering: logs linked to the specific balance context (employee + leave type)
  const getLogsForBalance = (balance: EmployeeLeaveBalance) => {
     return leaveBalanceChangeLogs.filter(l => l.employeeId === balance.employeeId && l.leaveTypeId === balance.leaveTypeId).sort((a,b) => new Date(b.changeDate).getTime() - new Date(a.changeDate).getTime());
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex flex-1 items-center gap-4 w-full">
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
                className="border border-slate-300 rounded-md text-sm p-2 w-48"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
             >
                <option value="All">All Leave Types</option>
                {myTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
             </select>
          </div>
       </div>

       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Leave Type</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Opening</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Accrued</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Availed</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Balance</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {filteredBalances.length === 0 ? (
                   <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No balances found. Try running an accrual.</td></tr>
                ) : (
                   filteredBalances.map(bal => (
                      <React.Fragment key={bal.id}>
                         <tr className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{getEmpName(bal.employeeId)}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{getLeaveTypeName(bal.leaveTypeId)}</td>
                            <td className="px-6 py-4 text-right text-sm text-slate-500">{bal.openingBalance + bal.carryForwardFromPrev}</td>
                            <td className="px-6 py-4 text-right text-sm text-green-600">+{bal.accruedTillDate}</td>
                            <td className="px-6 py-4 text-right text-sm text-red-600">-{bal.availedTillDate}</td>
                            <td className="px-6 py-4 text-right text-sm font-bold text-indigo-600">{bal.currentBalance}</td>
                            <td className="px-6 py-4 text-right flex justify-end gap-3">
                               <button onClick={() => toggleLogs(bal.id)} className="text-slate-400 hover:text-indigo-600" title="History">
                                  <History className="w-4 h-4" />
                               </button>
                               <button onClick={() => openAdjustModal(bal)} className="text-indigo-600 hover:text-indigo-900 flex items-center text-xs font-medium">
                                  <Edit2 className="w-3 h-3 mr-1" /> Adjust
                               </button>
                            </td>
                         </tr>
                         {selectedBalanceId === bal.id && showLogs && (
                            <tr>
                               <td colSpan={7} className="bg-slate-50 px-6 py-4">
                                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Balance History</h4>
                                  <div className="text-sm">
                                     {getLogsForBalance(bal).length === 0 ? (
                                        <span className="text-slate-400 italic">No history logs.</span>
                                     ) : (
                                        <ul className="space-y-1">
                                           {getLogsForBalance(bal).map(log => (
                                              <li key={log.id} className="flex justify-between text-xs border-b border-slate-200 pb-1 last:border-0">
                                                 <span>{new Date(log.changeDate).toLocaleDateString()}: <strong>{log.changeSource}</strong> - {log.remarks || ''}</span>
                                                 <span className={log.changeAmount > 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {log.changeAmount > 0 ? '+' : ''}{log.changeAmount} ({log.oldBalance} &rarr; {log.newBalance})
                                                 </span>
                                              </li>
                                           ))}
                                        </ul>
                                     )}
                                  </div>
                               </td>
                            </tr>
                         )}
                      </React.Fragment>
                   ))
                )}
             </tbody>
          </table>
       </div>

       {isAdjustModalOpen && adjustTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">Adjust Leave Balance</h3>
                <div className="mb-4 text-sm text-slate-600 bg-slate-50 p-3 rounded">
                   <div>Employee: <span className="font-medium">{getEmpName(adjustTarget.employeeId)}</span></div>
                   <div>Leave Type: <span className="font-medium">{getLeaveTypeName(adjustTarget.leaveTypeId)}</span></div>
                   <div>Current Balance: <span className="font-bold">{adjustTarget.currentBalance}</span></div>
                </div>
                <form onSubmit={handleAdjust} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Adjustment Amount (Days)</label>
                      <input 
                        type="number" step="0.5" required
                        className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm" 
                        value={adjustAmount} onChange={e => setAdjustAmount(parseFloat(e.target.value))}
                        placeholder="e.g. 1.0 or -2.5"
                      />
                      <p className="text-xs text-slate-500 mt-1">Use negative values to deduct balance.</p>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Reason</label>
                      <textarea 
                        required rows={2}
                        className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm" 
                        value={adjustReason} onChange={e => setAdjustReason(e.target.value)}
                        placeholder="Reason for adjustment..."
                      />
                   </div>
                   <div className="flex justify-end space-x-3 mt-6">
                      <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Apply Adjustment</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};
