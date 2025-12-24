
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Download, Filter } from 'lucide-react';

export const PayrollReports: React.FC = () => {
  const { runLines, payrollRuns, currentTenant } = useApp();
  const [selectedRunId, setSelectedRunId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeReport, setActiveReport] = useState<'Register' | 'Summary' | 'Statutory'>('Register');

  const myRuns = payrollRuns.filter(r => r.companyId === currentTenant?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Default select latest run
  if (!selectedRunId && myRuns.length > 0) {
     setSelectedRunId(myRuns[0].id);
  }

  const currentLines = runLines.filter(l => l.runId === selectedRunId);
  const filteredLines = currentLines.filter(l => l.employeeName.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleExport = () => {
     alert(`Downloading ${activeReport} Report for run ${selectedRunId}... (Mock)`);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h2 className="text-xl font-bold text-slate-900">Payroll Reports</h2>
             <p className="text-sm text-slate-500">View and download detailed payroll registers and summaries.</p>
          </div>
          <div className="flex gap-2">
             <select 
               className="border-slate-300 rounded-md text-sm p-2 w-48"
               value={selectedRunId}
               onChange={e => setSelectedRunId(e.target.value)}
             >
                {myRuns.map(r => (
                   <option key={r.id} value={r.id}>{r.payrollMonth} ({r.status})</option>
                ))}
             </select>
             <button onClick={handleExport} className="px-4 py-2 border border-slate-300 rounded-md bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 flex items-center">
                <Download className="w-4 h-4 mr-2" /> Export
             </button>
          </div>
       </div>

       <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveReport('Register')} className={`px-6 py-3 text-sm font-medium border-b-2 ${activeReport === 'Register' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Payroll Register</button>
          <button onClick={() => setActiveReport('Summary')} className={`px-6 py-3 text-sm font-medium border-b-2 ${activeReport === 'Summary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Component Summary</button>
          <button onClick={() => setActiveReport('Statutory')} className={`px-6 py-3 text-sm font-medium border-b-2 ${activeReport === 'Statutory' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Statutory Summary</button>
       </div>

       {activeReport === 'Register' && (
          <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
             <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <div className="relative max-w-xs w-full">
                   <input 
                     type="text" 
                     className="pl-8 pr-3 py-2 border border-slate-300 rounded-md text-sm w-full" 
                     placeholder="Search Employee..." 
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                   />
                   <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                </div>
                <div className="text-sm text-slate-500">Total Records: {filteredLines.length}</div>
             </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                   <thead className="bg-slate-50">
                      <tr>
                         <th className="px-4 py-3 text-left font-medium text-slate-500">Employee</th>
                         <th className="px-4 py-3 text-left font-medium text-slate-500">Department</th>
                         <th className="px-4 py-3 text-right font-medium text-slate-500">Paid Days</th>
                         <th className="px-4 py-3 text-right font-medium text-slate-500">Gross Earnings</th>
                         <th className="px-4 py-3 text-right font-medium text-slate-500">Total Ded.</th>
                         <th className="px-4 py-3 text-right font-medium text-slate-500">Net Pay</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-200">
                      {filteredLines.map(line => (
                         <tr key={line.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-900">{line.employeeName}</td>
                            <td className="px-4 py-3 text-slate-500">{line.department}</td>
                            <td className="px-4 py-3 text-right text-slate-600">{line.paidDays}</td>
                            <td className="px-4 py-3 text-right text-slate-600">₹ {line.grossEarnings.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-red-600">₹ {line.totalDeductions.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-bold text-indigo-600">₹ {line.netPay.toLocaleString()}</td>
                         </tr>
                      ))}
                      {filteredLines.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No data found.</td></tr>}
                   </tbody>
                </table>
             </div>
          </div>
       )}

       {activeReport === 'Summary' && (
          <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
             <div className="text-center text-slate-500 italic">Component-wise breakdown visualization would go here.</div>
          </div>
       )}

       {activeReport === 'Statutory' && (
          <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
             <div className="text-center text-slate-500 italic">Statutory liability summary (PF/ESI/PT/TDS) would go here.</div>
          </div>
       )}
    </div>
  );
};
