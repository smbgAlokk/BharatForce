
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Play, Download, FileText } from 'lucide-react';

export const ComplianceFiles: React.FC = () => {
  const { payrollRuns, pfBatches, esiBatches, generateComplianceBatch, currentTenant } = useApp();
  const [activeTab, setActiveTab] = useState<'PF' | 'ESI' | 'PT' | 'TDS'>('PF');
  const [selectedRunId, setSelectedRunId] = useState('');

  const myRuns = payrollRuns.filter(r => r.companyId === currentTenant?.id && r.status === 'Approved');

  const getBatches = () => {
     if (activeTab === 'PF') return pfBatches.filter(b => b.companyId === currentTenant?.id);
     if (activeTab === 'ESI') return esiBatches.filter(b => b.companyId === currentTenant?.id);
     // ... others
     return [];
  };

  const batches = getBatches();

  const handleGenerate = () => {
     if (!selectedRunId) {
        alert("Select an approved payroll run.");
        return;
     }
     generateComplianceBatch(activeTab, selectedRunId);
  };

  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-xl font-bold text-slate-900">Compliance Filing</h2>
          <p className="text-sm text-slate-500">Generate statutory return data (ECR, Returns, Challans).</p>
       </div>

       <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-100">
             {['PF', 'ESI', 'PT', 'TDS'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                   {tab} Returns
                </button>
             ))}
          </div>

          <div className="p-6 space-y-6">
             <div className="flex gap-4 items-end bg-slate-50 p-4 rounded border border-slate-200">
                <div className="flex-1">
                   <label className="block text-sm font-medium text-slate-700 mb-1">Select Month (Run)</label>
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
                   <Play className="w-4 h-4 mr-2" /> Generate Batch
                </button>
             </div>

             <div>
                <h3 className="text-sm font-bold text-slate-700 uppercase mb-3">Generated Files</h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                   <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                         <tr>
                            <th className="px-4 py-2 text-left">Month</th>
                            <th className="px-4 py-2 text-left">Generated On</th>
                            <th className="px-4 py-2 text-right">Total Liability</th>
                            <th className="px-4 py-2 text-right">Action</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {batches.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No batches generated.</td></tr>
                         ) : (
                            batches.map((batch: any) => (
                               <tr key={batch.id} className="hover:bg-slate-50">
                                  <td className="px-4 py-3 font-medium text-slate-900">{batch.monthYear}</td>
                                  <td className="px-4 py-3 text-slate-500">{new Date(batch.createdAt).toLocaleDateString()}</td>
                                  <td className="px-4 py-3 text-right font-mono">₹ {batch.totalAmount?.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-right">
                                     <button className="text-indigo-600 hover:text-indigo-800 flex items-center justify-end w-full">
                                        <Download className="w-4 h-4 mr-1" /> Download CSV
                                     </button>
                                  </td>
                               </tr>
                            ))
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};
