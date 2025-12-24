
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Lock, CheckCircle, AlertTriangle } from 'lucide-react';

export const AttendanceFinalisation: React.FC = () => {
  const { processAttendance, lockAttendance, dailyAttendance, currentTenant } = useApp();
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const myRecords = dailyAttendance.filter(d => 
    d.companyId === currentTenant?.id && 
    d.date >= startDate && d.date <= endDate
  );

  const processedCount = myRecords.filter(r => r.processingStatus === 'Processed').length;
  const lockedCount = myRecords.filter(r => r.isLocked).length;
  const pendingCount = myRecords.length - processedCount - lockedCount;

  const handleProcess = () => {
     if (!startDate || !endDate) {
        alert('Select date range');
        return;
     }
     processAttendance(startDate, endDate);
  };

  const handleLock = () => {
     if (!startDate || !endDate) return;
     if (window.confirm(`Lock attendance for ${myRecords.length} records? This cannot be undone easily.`)) {
        lockAttendance(startDate, endDate);
     }
  };

  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-lg font-bold text-slate-900">Attendance Finalisation</h2>
          <p className="text-sm text-slate-500">Calculate OT/Exceptions and Lock for Payroll.</p>
       </div>

       <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
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
             <div className="flex gap-2">
                <button onClick={handleProcess} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center">
                   <Play className="w-4 h-4 mr-2" /> Process
                </button>
                <button onClick={handleLock} className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center">
                   <Lock className="w-4 h-4 mr-2" /> Lock
                </button>
             </div>
          </div>

          {startDate && endDate && (
             <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded border border-blue-100">
                   <div className="text-xs text-blue-600 uppercase font-bold">Total Records</div>
                   <div className="text-2xl font-bold text-blue-900">{myRecords.length}</div>
                </div>
                <div className="bg-green-50 p-4 rounded border border-green-100">
                   <div className="text-xs text-green-600 uppercase font-bold">Processed & Ready</div>
                   <div className="text-2xl font-bold text-green-900">{processedCount}</div>
                </div>
                <div className="bg-slate-100 p-4 rounded border border-slate-200">
                   <div className="text-xs text-slate-600 uppercase font-bold">Locked</div>
                   <div className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      {lockedCount}
                      {lockedCount > 0 && <Lock className="w-5 h-5 text-slate-400" />}
                   </div>
                </div>
             </div>
          )}

          <div className="mt-6 border-t pt-4">
             <h4 className="font-bold text-slate-800 text-sm mb-3">Exception Summary (Preview)</h4>
             <div className="overflow-hidden border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                   <thead className="bg-slate-50">
                      <tr>
                         <th className="px-4 py-2 text-left">Status</th>
                         <th className="px-4 py-2 text-left">Count</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-200">
                      <tr><td>Present</td><td>{myRecords.filter(r => r.status === 'Present').length}</td></tr>
                      <tr><td>Absent</td><td>{myRecords.filter(r => r.status === 'Absent').length}</td></tr>
                      <tr><td>Late Marks</td><td>{myRecords.filter(r => r.isLate).length}</td></tr>
                      <tr><td>Has OT</td><td>{myRecords.filter(r => (r.otMinutes || 0) > 0).length}</td></tr>
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );
};
