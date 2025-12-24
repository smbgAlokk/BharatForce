
import React from 'react';
import { useApp } from '../../context/AppContext';

export const TeamOTSummary: React.FC = () => {
  const { dailyAttendance, employees, currentTenant, currentUser } = useApp();

  // Filter Direct Reports
  const myTeam = employees.filter(e => e.companyId === currentTenant?.id && e.reportingManagerId === currentUser.employeeId);

  const stats = myTeam.map(emp => {
     const records = dailyAttendance.filter(d => d.employeeId === emp.id && d.companyId === currentTenant?.id);
     const totalOT = records.reduce((acc, r) => acc + (r.otMinutes || 0), 0);
     const totalLate = records.filter(r => r.isLate).length;
     
     return {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        totalOT,
        totalLate
     };
  });

  return (
    <div className="space-y-6">
       <h2 className="text-lg font-bold text-slate-900">Team OT & Exceptions</h2>

       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">OT Hours</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Late Marks</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {stats.length === 0 ? (
                   <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No team members.</td></tr>
                ) : (
                   stats.map(stat => (
                      <tr key={stat.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 text-sm font-medium text-slate-900">{stat.name}</td>
                         <td className="px-6 py-4 text-sm text-indigo-600 font-bold">{(stat.totalOT / 60).toFixed(1)}</td>
                         <td className="px-6 py-4 text-sm text-amber-600">{stat.totalLate}</td>
                      </tr>
                   ))
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
};
