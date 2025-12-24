
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeavePayrollSync } from '../../types';
import { Play, Download, CheckCircle } from 'lucide-react';

export const LeavePayrollSyncView: React.FC = () => {
  const { leavePayrollSyncs, currentTenant, generateLeavePayrollSync, employees } = useApp();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [payrollMonth, setPayrollMonth] = useState('');

  const mySyncs = leavePayrollSyncs.filter(s => s.companyId === currentTenant?.id);

  const handleGenerate = () => {
     if (!startDate || !endDate || !payrollMonth) {
        alert("Please select date range and payroll month code.");
        return;
     }
     generateLeavePayrollSync(startDate, endDate, payrollMonth, currentTenant!.id);
  };

  const getEmpName = (id: string) => employees.find(e => e.id === id)?.firstName || id;

  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-lg font-bold text-slate-900">Leave Payroll Data Sync</h2>
          <p className="text-sm text-slate-500">Generate LOP and Encashment data for payroll processing.</p>
       </div>

       <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
             <div>
                <label className="block text-sm font-medium text-slate-700">Payroll Month (Code)</label>
                <input type="month" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                   value={payrollMonth} onChange={e => setPayrollMonth(e.target.value)} />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">From Date</label>
                <input type="date" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                   value={startDate} onChange={e => setStartDate(e.target.value)} />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">To Date</label>
                <input type="date" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                   value={endDate} onChange={e => setEndDate(e.target.value)} />
             </div>
             <button onClick={handleGenerate} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center mb-0.5">
                <Play className="w-4 h-4 mr-2" /> Generate Data
             </button>
          </div>

          {mySyncs.length > 0 && (
             <div className="space-y-6">
                {mySyncs.map(sync => (
                   <div key={sync.id} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                         <div>
                            <span className="font-bold text-slate-800">{sync.payrollMonth}</span>
                            <span className="text-xs text-slate-500 ml-2">({sync.periodStartDate} to {sync.periodEndDate})</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">{sync.status}</span>
                            <button className="text-slate-500 hover:text-indigo-600"><Download className="w-4 h-4" /></button>
                         </div>
                      </div>
                      <div className="p-0">
                         <table className="min-w-full text-sm">
                            <thead>
                               <tr className="bg-white border-b border-slate-100">
                                  <th className="px-4 py-2 text-left font-medium text-slate-500">Employee</th>
                                  <th className="px-4 py-2 text-right font-medium text-slate-500">Total LOP Days</th>
                                  <th className="px-4 py-2 text-right font-medium text-slate-500">Encashment Days</th>
                                  <th className="px-4 py-2 text-left font-medium text-slate-500">Breakdown</th>
                               </tr>
                            </thead>
                            <tbody>
                               {sync.lines?.map(line => (
                                  <tr key={line.id} className="border-b border-slate-50 last:border-0">
                                     <td className="px-4 py-2 font-medium text-slate-900">{getEmpName(line.employeeId)}</td>
                                     <td className="px-4 py-2 text-right text-red-600 font-bold">{line.totalLopDays}</td>
                                     <td className="px-4 py-2 text-right text-green-600 font-bold">{line.totalEncashmentDays}</td>
                                     <td className="px-4 py-2 text-slate-500 text-xs">{line.breakdown}</td>
                                  </tr>
                               ))}
                               {(!sync.lines || sync.lines.length === 0) && (
                                  <tr><td colSpan={4} className="px-4 py-4 text-center text-slate-400 italic">No LOP or Encashment data for this period.</td></tr>
                               )}
                            </tbody>
                         </table>
                      </div>
                   </div>
                ))}
             </div>
          )}
       </div>
    </div>
  );
};
