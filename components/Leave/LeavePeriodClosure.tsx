
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, CheckCircle, Calendar } from 'lucide-react';

export const LeavePeriodClosure: React.FC = () => {
  const { leavePeriodClosures, currentTenant, closeLeavePeriod } = useApp();
  
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const myClosures = leavePeriodClosures.filter(c => c.companyId === currentTenant?.id).sort((a,b) => new Date(b.closureRunDate).getTime() - new Date(a.closureRunDate).getTime());

  const handleClose = () => {
     if (!periodStart || !periodEnd) return;
     if (window.confirm(`Close leave period ${periodStart} to ${periodEnd}? This will calculate carry forwards.`)) {
        closeLeavePeriod(periodStart, periodEnd, currentTenant!.id);
     }
  };

  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-lg font-bold text-slate-900">Period Closure & Carry Forward</h2>
          <p className="text-sm text-slate-500">End the leave year and transfer balances.</p>
       </div>

       <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 mb-4">Close Current Period</h3>
          <div className="flex flex-col md:flex-row gap-4 items-end">
             <div>
                <label className="block text-sm font-medium text-slate-700">Period Start</label>
                <input type="date" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                   value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Period End</label>
                <input type="date" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                   value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
             </div>
             <button onClick={handleClose} className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 flex items-center">
                <Lock className="w-4 h-4 mr-2" /> Close & Carry Forward
             </button>
          </div>
       </div>

       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-700">Closure History</div>
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-white">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Period</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Closed On</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Closed By</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {myClosures.length === 0 ? (
                   <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No closed periods.</td></tr>
                ) : (
                   myClosures.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 text-sm font-medium text-slate-900 flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                            {c.periodStartDate} to {c.periodEndDate}
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-500">{new Date(c.closureRunDate).toLocaleString()}</td>
                         <td className="px-6 py-4 text-sm text-slate-500">{c.closedBy}</td>
                         <td className="px-6 py-4 text-center">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center justify-center w-fit mx-auto">
                               <CheckCircle className="w-3 h-3 mr-1" /> Closed
                            </span>
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
