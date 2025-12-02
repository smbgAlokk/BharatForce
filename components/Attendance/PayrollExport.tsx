
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Download, Lock, Calendar } from 'lucide-react';

export const PayrollExport: React.FC = () => {
  const { 
    attendancePayrollSummaries, attendancePeriodClosures, employees, currentTenant, 
    generatePayrollSummary, closeAttendancePeriod 
  } = useApp();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Filter summaries for display
  const mySummaries = attendancePayrollSummaries.filter(s => 
    s.companyId === currentTenant?.id && 
    s.periodStartDate === startDate && 
    s.periodEndDate === endDate
  );

  const isPeriodClosed = attendancePeriodClosures.some(c => 
    c.companyId === currentTenant?.id && 
    c.periodStartDate === startDate && 
    c.periodEndDate === endDate
  );

  const handleGenerate = () => {
     if (!startDate || !endDate) {
        alert('Select date range');
        return;
     }
     generatePayrollSummary(startDate, endDate, currentTenant!.id);
  };

  const handleClosePeriod = () => {
     if (!startDate || !endDate) return;
     if (isPeriodClosed) return;
     
     if (window.confirm(`Close attendance period ${startDate} to ${endDate}? This will prevent further edits.`)) {
        const result = closeAttendancePeriod(startDate, endDate, currentTenant!.id);
        alert(result.message);
     }
  };

  const handleExport = () => {
     if (mySummaries.length === 0) {
        alert('No data generated to export.');
        return;
     }
     // Mock Export
     console.log('Exporting Payroll CSV:', mySummaries);
     alert(`Exported ${mySummaries.length} records to CSV.`);
  };

  const getEmpName = (id: string) => {
     const e = employees.find(em => em.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };
  
  const getEmpCode = (id: string) => {
     const e = employees.find(em => em.id === id);
     return e ? e.employeeCode : '-';
  };

  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-lg font-bold text-slate-900">Attendance Payroll Export</h2>
          <p className="text-sm text-slate-500">Generate monthly attendance summaries and close payroll period.</p>
       </div>

       <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end mb-6 pb-6 border-b border-slate-100">
             <div>
                <label className="block text-sm font-medium text-slate-700">Period Start</label>
                <input type="date" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                   value={startDate} onChange={e => setStartDate(e.target.value)} />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Period End</label>
                <input type="date" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                   value={endDate} onChange={e => setEndDate(e.target.value)} />
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={handleGenerate} 
                  disabled={!startDate || !endDate || isPeriodClosed}
                  className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${isPeriodClosed ? 'bg-slate-300 text-white cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                >
                   <Play className="w-4 h-4 mr-2" /> Generate Summary
                </button>
             </div>
          </div>

          {isPeriodClosed && (
             <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex items-center text-red-700">
                <Lock className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">This period is CLOSED. Data cannot be regenerated or modified.</span>
             </div>
          )}

          {mySummaries.length > 0 && (
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <h3 className="font-bold text-slate-800">Generated Summary ({mySummaries.length} Employees)</h3>
                   <div className="flex gap-2">
                      <button onClick={handleExport} className="px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center">
                         <Download className="w-4 h-4 mr-2" /> Export CSV
                      </button>
                      {!isPeriodClosed && (
                         <button onClick={handleClosePeriod} className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 flex items-center">
                            <Lock className="w-4 h-4 mr-2" /> Close Period
                         </button>
                      )}
                   </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                   <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                         <tr>
                            <th className="px-4 py-2 text-left font-medium text-slate-500">Employee</th>
                            <th className="px-4 py-2 text-left font-medium text-slate-500">Code</th>
                            <th className="px-4 py-2 text-right font-medium text-slate-500">Paid Days</th>
                            <th className="px-4 py-2 text-right font-medium text-slate-500">LOP Days</th>
                            <th className="px-4 py-2 text-right font-medium text-slate-500">OT (Mins)</th>
                            <th className="px-4 py-2 text-right font-medium text-slate-500">Weekly Off</th>
                            <th className="px-4 py-2 text-right font-medium text-slate-500">Holidays</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                         {mySummaries.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50">
                               <td className="px-4 py-2 font-medium text-slate-900">{getEmpName(s.employeeId)}</td>
                               <td className="px-4 py-2 text-slate-500 font-mono">{getEmpCode(s.employeeId)}</td>
                               <td className="px-4 py-2 text-right font-bold text-green-600">{s.totalPaidDays}</td>
                               <td className="px-4 py-2 text-right text-red-600">{s.totalLopDays}</td>
                               <td className="px-4 py-2 text-right text-slate-700">{s.totalOtMinutes}</td>
                               <td className="px-4 py-2 text-right text-slate-500">{s.totalWeeklyOffDays}</td>
                               <td className="px-4 py-2 text-right text-slate-500">{s.totalHolidayDays}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}
          
          {startDate && endDate && mySummaries.length === 0 && (
             <div className="text-center py-8 text-slate-500 italic">
                No summary generated for this period. Ensure attendance is processed and locked.
             </div>
          )}
       </div>
    </div>
  );
};
