
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PayrollRunStatus } from '../../types';
import { Play, Lock, Plus, Trash2, Eye, CheckCircle, Download, Calculator } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PayrollRunConsole: React.FC = () => {
  const { payrollRuns, createPayrollRun, calculatePayroll, approvePayrollRun, deletePayrollRun, runLines, currentTenant } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [viewRunId, setViewRunId] = useState<string | null>(null);

  const myRuns = payrollRuns.filter(r => r.companyId === currentTenant?.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleCreate = () => {
     const start = `${selectedMonth}-01`;
     // simplified end of month
     const date = new Date(selectedMonth + "-01");
     const end = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
     
     const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
     createPayrollRun(monthName, start, end);
     setIsModalOpen(false);
  };

  const handleCalculate = (runId: string) => {
     calculatePayroll(runId);
  };

  const handleApprove = (runId: string) => {
     if(window.confirm("Approve and Lock Payroll? This will generate payslips.")) {
        approvePayrollRun(runId);
     }
  };

  // View Detail
  const activeRun = viewRunId ? payrollRuns.find(r => r.id === viewRunId) : null;
  const activeLines = viewRunId ? runLines.filter(l => l.runId === viewRunId) : [];

  if (activeRun) {
     return (
        <div className="space-y-6">
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <button onClick={() => setViewRunId(null)} className="text-sm text-indigo-600 hover:underline">&larr; Back</button>
                 <h2 className="text-xl font-bold text-slate-900">{activeRun.payrollMonth}</h2>
                 <span className={`px-3 py-1 text-xs rounded-full border ${activeRun.status === 'Approved' ? 'bg-green-100 border-green-200 text-green-800' : 'bg-yellow-100 border-yellow-200 text-yellow-800'}`}>
                    {activeRun.status}
                 </span>
              </div>
              <div className="flex gap-2">
                 {activeRun.status !== PayrollRunStatus.APPROVED && (
                    <>
                      <button onClick={() => handleCalculate(activeRun.id)} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                         <Calculator className="w-4 h-4 mr-2" /> {activeRun.status === 'Draft' ? 'Run Calculation' : 'Re-Calculate'}
                      </button>
                      <button onClick={() => handleApprove(activeRun.id)} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                         <Lock className="w-4 h-4 mr-2" /> Approve & Lock
                      </button>
                    </>
                 )}
                 {activeRun.status === PayrollRunStatus.APPROVED && (
                    <button className="flex items-center px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-md text-sm hover:bg-slate-50">
                       <Download className="w-4 h-4 mr-2" /> Bank File
                    </button>
                 )}
              </div>
           </div>

           {/* Stats Cards */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                 <div className="text-xs text-slate-500 uppercase">Total Employees</div>
                 <div className="text-2xl font-bold text-slate-900">{activeLines.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                 <div className="text-xs text-slate-500 uppercase">Total Gross</div>
                 <div className="text-2xl font-bold text-slate-900">₹ {activeLines.reduce((s,l) => s + l.grossEarnings, 0).toLocaleString()}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                 <div className="text-xs text-slate-500 uppercase">Total Deductions</div>
                 <div className="text-2xl font-bold text-red-600">₹ {activeLines.reduce((s,l) => s + l.totalDeductions, 0).toLocaleString()}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                 <div className="text-xs text-slate-500 uppercase">Net Pay</div>
                 <div className="text-2xl font-bold text-green-600">₹ {activeLines.reduce((s,l) => s + l.netPay, 0).toLocaleString()}</div>
              </div>
           </div>

           {/* Detailed Grid */}
           <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                 <thead className="bg-slate-50">
                    <tr>
                       <th className="px-6 py-3 text-left font-medium text-slate-500">Employee</th>
                       <th className="px-6 py-3 text-left font-medium text-slate-500">Dept</th>
                       <th className="px-6 py-3 text-right font-medium text-slate-500">Paid Days</th>
                       <th className="px-6 py-3 text-right font-medium text-slate-500">Gross</th>
                       <th className="px-6 py-3 text-right font-medium text-slate-500">Deductions</th>
                       <th className="px-6 py-3 text-right font-bold text-slate-700">Net Pay</th>
                       <th className="px-6 py-3 text-center font-medium text-slate-500">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-200">
                    {activeLines.map(line => (
                       <tr key={line.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900">{line.employeeName}</td>
                          <td className="px-6 py-4 text-slate-500">{line.department}</td>
                          <td className="px-6 py-4 text-right text-slate-600">{line.paidDays}</td>
                          <td className="px-6 py-4 text-right text-slate-600">₹ {line.grossEarnings.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-red-500">₹ {line.totalDeductions.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-bold text-green-700">₹ {line.netPay.toLocaleString()}</td>
                          <td className="px-6 py-4 text-center">
                             <span className={`text-xs px-2 py-1 rounded ${line.status === 'Calculated' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                {line.status}
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
     );
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-xl font-bold text-slate-900">Payroll Runs</h2>
             <p className="text-sm text-slate-500">Process monthly salaries and generate payslips.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
             <Plus className="w-4 h-4 mr-2" /> New Pay Run
          </button>
       </div>

       <div className="grid grid-cols-1 gap-4">
          {myRuns.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">
                No payroll runs found. Create one to start.
             </div>
          ) : (
             myRuns.map(run => (
                <div key={run.id} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center hover:border-indigo-200 transition-colors">
                   <div>
                      <div className="flex items-center gap-3">
                         <h3 className="text-lg font-bold text-slate-900">{run.payrollMonth}</h3>
                         <span className={`px-2 py-0.5 text-xs rounded-full border ${run.status === 'Approved' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
                            {run.status}
                         </span>
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                         Period: {new Date(run.payrollPeriodStart).toLocaleDateString()} - {new Date(run.payrollPeriodEnd).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-400 mt-2">
                         Employees: {run.totalEmployees} • Net Pay: ₹ {run.totalNetPay?.toLocaleString() || 0}
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <button onClick={() => setViewRunId(run.id)} className="flex items-center px-3 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded text-sm font-medium hover:bg-white">
                         <Eye className="w-4 h-4 mr-2" /> View
                      </button>
                      {run.status !== PayrollRunStatus.APPROVED && (
                         <button onClick={() => deletePayrollRun(run.id)} className="text-red-500 hover:text-red-700 p-2">
                            <Trash2 className="w-5 h-5" />
                         </button>
                      )}
                   </div>
                </div>
             ))
          )}
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                <h3 className="text-lg font-bold mb-4">Create Payroll Run</h3>
                <div className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Select Month</label>
                      <input 
                        type="month" 
                        className="mt-1 block w-full border border-slate-300 rounded-md p-2"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                      />
                   </div>
                   <div className="flex justify-end space-x-3 mt-6">
                      <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded text-sm hover:bg-slate-50">Cancel</button>
                      <button onClick={handleCreate} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">Create</button>
                   </div>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
