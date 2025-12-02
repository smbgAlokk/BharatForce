
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveAccrualRun } from '../../types';
import { Play, Eye, CheckCircle, AlertTriangle } from 'lucide-react';

export const LeaveAccruals: React.FC = () => {
  const { leaveAccrualRuns, leaveAccrualLines, currentTenant, triggerAccrualRun, employees, leaveTypes } = useApp();
  
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [runType, setRunType] = useState('Monthly');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const myRuns = leaveAccrualRuns.filter(r => r.companyId === currentTenant?.id).sort((a,b) => new Date(b.runDate).getTime() - new Date(a.runDate).getTime());

  const handleTrigger = (e: React.FormEvent) => {
     e.preventDefault();
     if (!currentTenant) return;
     triggerAccrualRun(runType, periodStart, periodEnd, currentTenant.id);
     setIsRunModalOpen(false);
  };

  const getRunLines = (runId: string) => leaveAccrualLines.filter(l => l.accrualRunId === runId);
  const getEmpName = (id: string) => employees.find(e => e.id === id)?.firstName || id;
  const getLeaveTypeName = (id: string) => leaveTypes.find(t => t.id === id)?.code || id;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Leave Accruals</h2>
             <p className="text-sm text-slate-500">Manage periodic leave credits.</p>
          </div>
          <button onClick={() => setIsRunModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
             <Play className="h-4 w-4 mr-2" /> Run Accrual
          </button>
       </div>

       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Run Name</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Period</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Run Date</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {myRuns.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No accrual runs found.</td></tr>
                ) : (
                   myRuns.map(run => (
                      <React.Fragment key={run.id}>
                         <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedRunId(selectedRunId === run.id ? null : run.id)}>
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{run.runName}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{run.runType}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{run.periodStartDate} to {run.periodEndDate}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{new Date(run.runDate).toLocaleString()}</td>
                            <td className="px-6 py-4 text-center">
                               <span className={`px-2 py-1 text-xs rounded-full ${run.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {run.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium">
                               <button className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end w-full">
                                  <Eye className="w-4 h-4 mr-1" /> Details
                               </button>
                            </td>
                         </tr>
                         {selectedRunId === run.id && (
                            <tr>
                               <td colSpan={6} className="bg-slate-50 p-4">
                                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                                     <div className="px-4 py-2 bg-slate-100 border-b text-xs font-bold text-slate-500 uppercase">Run Details ({getRunLines(run.id).length} Lines)</div>
                                     <table className="min-w-full text-sm">
                                        <thead>
                                           <tr className="bg-slate-50">
                                              <th className="px-4 py-2 text-left">Employee</th>
                                              <th className="px-4 py-2 text-left">Leave</th>
                                              <th className="px-4 py-2 text-right">Credited</th>
                                              <th className="px-4 py-2 text-right">New Bal</th>
                                           </tr>
                                        </thead>
                                        <tbody>
                                           {getRunLines(run.id).map(line => (
                                              <tr key={line.id} className="border-t border-slate-100">
                                                 <td className="px-4 py-2">{getEmpName(line.employeeId)}</td>
                                                 <td className="px-4 py-2">{getLeaveTypeName(line.leaveTypeId)}</td>
                                                 <td className="px-4 py-2 text-right font-bold text-green-600">+{line.accrualDays}</td>
                                                 <td className="px-4 py-2 text-right">{line.newBalance}</td>
                                              </tr>
                                           ))}
                                           {getRunLines(run.id).length === 0 && <tr><td colSpan={4} className="px-4 py-2 text-center text-slate-400">No updates in this run.</td></tr>}
                                        </tbody>
                                     </table>
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

       {isRunModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">Trigger Accrual Run</h3>
                <form onSubmit={handleTrigger} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Run Type</label>
                      <select className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm" value={runType} onChange={e => setRunType(e.target.value)}>
                         <option value="Monthly">Monthly</option>
                         <option value="Quarterly">Quarterly</option>
                         <option value="Yearly">Yearly</option>
                         <option value="Manual">Manual / Ad-hoc</option>
                      </select>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Period Start</label>
                         <input type="date" required className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm" 
                            value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Period End</label>
                         <input type="date" required className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm" 
                            value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
                      </div>
                   </div>
                   
                   <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 flex items-start mt-2">
                      <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" />
                      <p>This will calculate leave entitlement for all active employees based on their assigned policy and credit the balance.</p>
                   </div>

                   <div className="flex justify-end space-x-3 mt-6">
                      <button type="button" onClick={() => setIsRunModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Start Run</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};
