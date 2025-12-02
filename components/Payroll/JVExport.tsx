
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Download, Eye } from 'lucide-react';
import { PayrollJVExport } from '../../types';

export const JVExport: React.FC = () => {
  const { payrollRuns, payrollJVExports, currentTenant, generateJVExport } = useApp();
  const [selectedRunId, setSelectedRunId] = useState('');
  const [viewJV, setViewJV] = useState<PayrollJVExport | null>(null);

  const myRuns = payrollRuns.filter(r => r.companyId === currentTenant?.id && r.status === 'Approved');
  const myJVs = payrollJVExports.filter(j => j.companyId === currentTenant?.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleGenerate = () => {
     if (!selectedRunId) {
        alert("Select an approved payroll run.");
        return;
     }
     generateJVExport(selectedRunId);
  };

  const getRunName = (id: string) => payrollRuns.find(r => r.id === id)?.payrollMonth || id;

  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-xl font-bold text-slate-900">Accounting Integration (JV)</h2>
          <p className="text-sm text-slate-500">Generate Journal Vouchers for finance integration.</p>
       </div>

       <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
             <label className="block text-sm font-medium text-slate-700 mb-1">Select Approved Run</label>
             <select 
               className="w-full border-slate-300 rounded-md shadow-sm p-2 text-sm"
               value={selectedRunId}
               onChange={e => setSelectedRunId(e.target.value)}
             >
                <option value="">-- Select Run --</option>
                {myRuns.map(r => (
                   <option key={r.id} value={r.id}>{r.payrollMonth}</option>
                ))}
             </select>
          </div>
          <button onClick={handleGenerate} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center mb-0.5">
             <Play className="w-4 h-4 mr-2" /> Generate JV
          </button>
       </div>

       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-700">Generated Journal Vouchers</div>
          <table className="min-w-full divide-y divide-slate-200 text-sm">
             <thead className="bg-white">
                <tr>
                   <th className="px-6 py-3 text-left font-medium text-slate-500">Month</th>
                   <th className="px-6 py-3 text-left font-medium text-slate-500">Generated On</th>
                   <th className="px-6 py-3 text-right font-medium text-slate-500">Total Debit</th>
                   <th className="px-6 py-3 text-right font-medium text-slate-500">Total Credit</th>
                   <th className="px-6 py-3 text-center font-medium text-slate-500">Status</th>
                   <th className="px-6 py-3 text-right font-medium text-slate-500">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {myJVs.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No JVs generated.</td></tr>
                ) : (
                   myJVs.map(jv => (
                      <tr key={jv.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 font-medium text-slate-900">{jv.payrollMonth}</td>
                         <td className="px-6 py-4 text-slate-500">{new Date(jv.createdAt).toLocaleDateString()}</td>
                         <td className="px-6 py-4 text-right font-mono">₹ {jv.totalDebit.toLocaleString()}</td>
                         <td className="px-6 py-4 text-right font-mono">₹ {jv.totalCredit.toLocaleString()}</td>
                         <td className="px-6 py-4 text-center">
                            <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">{jv.status}</span>
                         </td>
                         <td className="px-6 py-4 text-right flex justify-end gap-3">
                            <button onClick={() => setViewJV(jv)} className="text-indigo-600 hover:text-indigo-900"><Eye className="w-4 h-4" /></button>
                            <button className="text-slate-500 hover:text-slate-700"><Download className="w-4 h-4" /></button>
                         </td>
                      </tr>
                   ))
                )}
             </tbody>
          </table>
       </div>

       {viewJV && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold text-slate-900">JV Preview: {viewJV.payrollMonth}</h3>
                   <button onClick={() => setViewJV(null)} className="text-slate-400 hover:text-slate-600">Close</button>
                </div>
                <div className="overflow-hidden border border-slate-200 rounded-lg">
                   <table className="min-w-full text-sm">
                      <thead className="bg-slate-50">
                         <tr>
                            <th className="px-4 py-2 text-left">GL Code</th>
                            <th className="px-4 py-2 text-left">Description</th>
                            <th className="px-4 py-2 text-right">Debit</th>
                            <th className="px-4 py-2 text-right">Credit</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {viewJV.lines.map(line => (
                            <tr key={line.id}>
                               <td className="px-4 py-2 font-mono text-slate-600">{line.glCode}</td>
                               <td className="px-4 py-2">{line.glName}</td>
                               <td className="px-4 py-2 text-right">{line.debitAmount > 0 ? line.debitAmount.toLocaleString() : '-'}</td>
                               <td className="px-4 py-2 text-right">{line.creditAmount > 0 ? line.creditAmount.toLocaleString() : '-'}</td>
                            </tr>
                         ))}
                         <tr className="bg-slate-50 font-bold">
                            <td colSpan={2} className="px-4 py-2 text-right">Total</td>
                            <td className="px-4 py-2 text-right">₹ {viewJV.totalDebit.toLocaleString()}</td>
                            <td className="px-4 py-2 text-right">₹ {viewJV.totalCredit.toLocaleString()}</td>
                         </tr>
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
