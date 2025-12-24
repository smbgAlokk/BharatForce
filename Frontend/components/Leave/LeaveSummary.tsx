
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Download } from 'lucide-react';

export const LeaveSummary: React.FC = () => {
  const { leaveBalances, employees, leaveTypes, currentTenant } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const myBalances = leaveBalances.filter(b => b.companyId === currentTenant?.id);

  const filteredBalances = myBalances.filter(b => {
     const emp = employees.find(e => e.id === b.employeeId);
     const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : '';
     return name.includes(searchTerm.toLowerCase());
  }).sort((a,b) => a.employeeId.localeCompare(b.employeeId));

  const getEmpName = (id: string) => employees.find(e => e.id === id)?.firstName || id;
  const getLeaveName = (id: string) => leaveTypes.find(t => t.id === id)?.code || id;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Leave Balance Summary (HR)</h2>
          <div className="flex gap-2">
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
             <button className="px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50">
                <Download className="w-4 h-4" />
             </button>
          </div>
       </div>

       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase">Leave Type</th>
                   <th className="px-6 py-3 text-right font-medium text-slate-500 uppercase">Opening</th>
                   <th className="px-6 py-3 text-right font-medium text-slate-500 uppercase">Accrued</th>
                   <th className="px-6 py-3 text-right font-medium text-slate-500 uppercase">Taken</th>
                   <th className="px-6 py-3 text-right font-medium text-slate-500 uppercase">Encashed</th>
                   <th className="px-6 py-3 text-right font-medium text-slate-900 uppercase">Closing Bal</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {filteredBalances.length === 0 ? (
                   <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No balances found.</td></tr>
                ) : (
                   filteredBalances.map(bal => (
                      <tr key={bal.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 font-medium text-slate-900">{getEmpName(bal.employeeId)}</td>
                         <td className="px-6 py-4 text-slate-600">{getLeaveName(bal.leaveTypeId)}</td>
                         <td className="px-6 py-4 text-right text-slate-500">{bal.openingBalance + bal.carryForwardFromPrev}</td>
                         <td className="px-6 py-4 text-right text-green-600">+{bal.accruedTillDate}</td>
                         <td className="px-6 py-4 text-right text-red-600">-{bal.availedTillDate}</td>
                         <td className="px-6 py-4 text-right text-amber-600">-{bal.encashedTillDate || 0}</td>
                         <td className="px-6 py-4 text-right font-bold text-indigo-600">{bal.currentBalance}</td>
                      </tr>
                   ))
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
};
