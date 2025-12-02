
import React from 'react';
import { useApp } from '../../context/AppContext';

export const TeamLeaveSummary: React.FC = () => {
  const { leaveBalances, employees, leaveTypes, currentTenant, currentUser } = useApp();

  const myTeam = employees.filter(e => e.reportingManagerId === currentUser.employeeId && e.companyId === currentTenant?.id);
  const teamIds = myTeam.map(e => e.id);

  const teamBalances = leaveBalances.filter(b => teamIds.includes(b.employeeId) && b.isActive);

  const getEmpName = (id: string) => myTeam.find(e => e.id === id)?.firstName || id;
  const getLeaveName = (id: string) => leaveTypes.find(t => t.id === id)?.code || id;

  return (
    <div className="space-y-6">
       <h2 className="text-lg font-bold text-slate-900">Team Leave Balances</h2>

       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left font-medium text-slate-500 uppercase">Leave Type</th>
                   <th className="px-6 py-3 text-right font-medium text-slate-500 uppercase">Total Credit</th>
                   <th className="px-6 py-3 text-right font-medium text-slate-500 uppercase">Utilised</th>
                   <th className="px-6 py-3 text-right font-medium text-slate-900 uppercase">Available</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {teamBalances.length === 0 ? (
                   <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No data available for your team.</td></tr>
                ) : (
                   teamBalances.map(bal => (
                      <tr key={bal.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 font-medium text-slate-900">{getEmpName(bal.employeeId)}</td>
                         <td className="px-6 py-4 text-slate-600">{getLeaveName(bal.leaveTypeId)}</td>
                         <td className="px-6 py-4 text-right text-slate-500">{bal.openingBalance + bal.carryForwardFromPrev + bal.accruedTillDate + bal.adjustedManually}</td>
                         <td className="px-6 py-4 text-right text-red-600">{bal.availedTillDate + (bal.encashedTillDate || 0)}</td>
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
