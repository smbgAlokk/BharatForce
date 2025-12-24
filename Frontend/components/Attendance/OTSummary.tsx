
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search } from 'lucide-react';

export const OTSummary: React.FC = () => {
  const { dailyAttendance, employees, currentTenant } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Group by Employee
  const stats = employees.filter(e => e.companyId === currentTenant?.id).map(emp => {
     const records = dailyAttendance.filter(d => d.employeeId === emp.id && d.companyId === currentTenant?.id);
     const totalOT = records.reduce((acc, r) => acc + (r.otMinutes || 0), 0);
     const totalLate = records.filter(r => r.isLate).length;
     const shortDays = records.filter(r => r.exceptionTags?.includes('Short Hours')).length;
     
     return {
        id: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        deptId: emp.departmentId,
        totalOT,
        totalLate,
        shortDays
     };
  }).filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">OT & Exceptions Summary</h2>
          <div className="relative">
             <input 
               type="text" 
               className="pl-8 pr-3 py-2 border border-slate-300 rounded-md text-sm" 
               placeholder="Search Employee..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
             <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
          </div>
       </div>

       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total OT (Mins)</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total OT (Hrs)</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Late Days</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Short Days</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {stats.map(stat => (
                   <tr key={stat.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{stat.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{stat.totalOT}</td>
                      <td className="px-6 py-4 text-sm text-indigo-600 font-medium">{(stat.totalOT / 60).toFixed(1)}</td>
                      <td className="px-6 py-4 text-sm text-amber-600">{stat.totalLate}</td>
                      <td className="px-6 py-4 text-sm text-red-600">{stat.shortDays}</td>
                   </tr>
                ))}
             </tbody>
          </table>
       </div>
    </div>
  );
};
