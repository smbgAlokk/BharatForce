
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FnFSettlement, FnFComponentLine, FnFStatus } from '../../types';
import { ArrowLeft, Save, Lock, Plus, Trash2 } from 'lucide-react';

export const FnFDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fnfSettlements, updateFnFSettlement, employees, currentUser } = useApp();

  const settlement = fnfSettlements.find(s => s.id === id);
  const [formData, setFormData] = useState<FnFSettlement | null>(null);
  
  useEffect(() => {
     if (settlement) setFormData(JSON.parse(JSON.stringify(settlement)));
  }, [settlement]);

  if (!formData) return <div>Settlement not found</div>;

  const employee = employees.find(e => e.id === formData.employeeId);
  const isFinalised = formData.status === 'Finalised';

  const handleLineChange = (lineId: string, field: keyof FnFComponentLine, value: any) => {
     if (isFinalised) return;
     
     setFormData(prev => {
        if (!prev) return null;
        const updatedLines = prev.components.map(l => l.id === lineId ? { ...l, [field]: value } : l);
        return recalculateTotals({ ...prev, components: updatedLines });
     });
  };

  const addLine = (type: 'Earning' | 'Deduction') => {
     if (isFinalised) return;
     
     const newLine: FnFComponentLine = {
        id: `ln-${Date.now()}`,
        type,
        name: '',
        amount: 0
     };
     
     setFormData(prev => {
        if (!prev) return null;
        return recalculateTotals({ ...prev, components: [...prev.components, newLine] });
     });
  };

  const removeLine = (lineId: string) => {
     if (isFinalised) return;
     setFormData(prev => {
        if (!prev) return null;
        return recalculateTotals({ ...prev, components: prev.components.filter(l => l.id !== lineId) });
     });
  };

  const recalculateTotals = (data: FnFSettlement): FnFSettlement => {
     const earnings = data.components.filter(c => c.type === 'Earning').reduce((acc, c) => acc + (c.amount || 0), 0);
     const deductions = data.components.filter(c => c.type === 'Deduction').reduce((acc, c) => acc + (c.amount || 0), 0);
     return {
        ...data,
        totalEarnings: earnings,
        totalDeductions: deductions,
        netPayable: earnings - deductions
     };
  };

  const handleSave = () => {
     if (formData) {
        updateFnFSettlement({ ...formData, updatedAt: new Date().toISOString(), updatedBy: currentUser.name });
        alert('Saved successfully');
     }
  };

  const handleStatusChange = (newStatus: FnFStatus) => {
     if (!formData) return;
     if (newStatus === 'Finalised' && !window.confirm("Finalise this settlement? It will become read-only.")) return;
     
     const updated = { 
        ...formData, 
        status: newStatus,
        finalisedOn: newStatus === 'Finalised' ? new Date().toISOString() : undefined,
        finalisedBy: newStatus === 'Finalised' ? currentUser.name : undefined
     };
     updateFnFSettlement(updated);
     navigate('/exit/fnf-settlements'); // Corrected redirect path
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate('/exit/fnf-settlements')} className="text-slate-500 hover:text-slate-700"><ArrowLeft className="w-5 h-5"/></button>
             <div>
                <h2 className="text-xl font-bold text-slate-900">F&F Settlement: {employee?.firstName} {employee?.lastName}</h2>
                <div className="text-sm text-slate-500 flex gap-4">
                   <span>LWD: {new Date(formData.lastWorkingDay).toLocaleDateString()}</span>
                   <span className={`font-bold ${formData.status === 'Finalised' ? 'text-green-600' : 'text-amber-600'}`}>{formData.status}</span>
                </div>
             </div>
          </div>
          {!isFinalised && (
             <div className="flex gap-3">
                <button onClick={handleSave} className="px-4 py-2 border border-slate-300 rounded bg-white hover:bg-slate-50 flex items-center text-sm font-medium">
                   <Save className="w-4 h-4 mr-2"/> Save Draft
                </button>
                {formData.status === 'Draft' && (
                   <button onClick={() => handleStatusChange('Under Review')} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-medium">
                      Submit for Review
                   </button>
                )}
                {formData.status === 'Under Review' && (
                   <button onClick={() => handleStatusChange('Finalised')} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium flex items-center">
                      <Lock className="w-4 h-4 mr-2"/> Finalise
                   </button>
                )}
             </div>
          )}
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Earnings */}
          <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
             <div className="px-4 py-3 bg-green-50 border-b border-green-100 flex justify-between items-center">
                <h3 className="font-bold text-green-800">Earnings</h3>
                {!isFinalised && <button onClick={() => addLine('Earning')} className="text-green-700 hover:text-green-900"><Plus className="w-5 h-5"/></button>}
             </div>
             <div className="p-4 space-y-3">
                {formData.components.filter(c => c.type === 'Earning').map(line => (
                   <div key={line.id} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        className="flex-1 border border-slate-300 rounded p-1.5 text-sm" 
                        placeholder="Component Name"
                        value={line.name} 
                        onChange={e => handleLineChange(line.id, 'name', e.target.value)}
                        disabled={isFinalised}
                      />
                      <input 
                        type="number" 
                        className="w-24 border border-slate-300 rounded p-1.5 text-sm text-right" 
                        placeholder="0.00"
                        value={line.amount} 
                        onChange={e => handleLineChange(line.id, 'amount', parseFloat(e.target.value))}
                        disabled={isFinalised}
                      />
                      {!isFinalised && <button onClick={() => removeLine(line.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>}
                   </div>
                ))}
                {formData.components.filter(c => c.type === 'Earning').length === 0 && <div className="text-center text-slate-400 text-sm italic py-2">No earnings added.</div>}
             </div>
             <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-between font-bold text-sm">
                <span>Total Earnings</span>
                <span>{formData.totalEarnings.toLocaleString()}</span>
             </div>
          </div>

          {/* Deductions */}
          <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
             <div className="px-4 py-3 bg-red-50 border-b border-red-100 flex justify-between items-center">
                <h3 className="font-bold text-red-800">Deductions / Recoveries</h3>
                {!isFinalised && <button onClick={() => addLine('Deduction')} className="text-red-700 hover:text-red-900"><Plus className="w-5 h-5"/></button>}
             </div>
             <div className="p-4 space-y-3">
                {formData.components.filter(c => c.type === 'Deduction').map(line => (
                   <div key={line.id} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        className="flex-1 border border-slate-300 rounded p-1.5 text-sm" 
                        placeholder="Component Name"
                        value={line.name} 
                        onChange={e => handleLineChange(line.id, 'name', e.target.value)}
                        disabled={isFinalised}
                      />
                      <input 
                        type="number" 
                        className="w-24 border border-slate-300 rounded p-1.5 text-sm text-right" 
                        placeholder="0.00"
                        value={line.amount} 
                        onChange={e => handleLineChange(line.id, 'amount', parseFloat(e.target.value))}
                        disabled={isFinalised}
                      />
                      {!isFinalised && <button onClick={() => removeLine(line.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>}
                   </div>
                ))}
                {formData.components.filter(c => c.type === 'Deduction').length === 0 && <div className="text-center text-slate-400 text-sm italic py-2">No deductions added.</div>}
             </div>
             <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-between font-bold text-sm">
                <span>Total Deductions</span>
                <span>{formData.totalDeductions.toLocaleString()}</span>
             </div>
          </div>
       </div>

       {/* Summary */}
       <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 flex flex-col items-center text-center">
          <h3 className="text-sm font-bold text-indigo-900 uppercase mb-2">Net Settlement Amount</h3>
          <div className={`text-4xl font-bold ${formData.netPayable >= 0 ? 'text-green-700' : 'text-red-700'}`}>
             ₹ {Math.abs(formData.netPayable).toLocaleString()}
          </div>
          <div className="text-indigo-800 font-medium mt-1">
             {formData.netPayable >= 0 ? 'Payable to Employee' : 'Recoverable from Employee'}
          </div>
       </div>

       <div className="bg-white p-4 rounded-lg border border-slate-200">
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes / Remarks</label>
          <textarea 
            className="w-full border border-slate-300 rounded-md p-2 text-sm" 
            rows={3} 
            value={formData.notes || ''} 
            onChange={e => setFormData({...formData, notes: e.target.value})}
            disabled={isFinalised}
          />
       </div>
    </div>
  );
};