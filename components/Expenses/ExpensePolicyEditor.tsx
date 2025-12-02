import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpensePolicy, ExpensePolicyLine, ExpenseLimitPeriod, UserRole } from '../../types';
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  policy: ExpensePolicy | null;
  onBack: () => void;
}

export const ExpensePolicyEditor: React.FC<Props> = ({ policy, onBack }) => {
  const { expenseCategories, currentTenant, addExpensePolicy, updateExpensePolicy, currentUser, userRole } = useApp();
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const [formData, setFormData] = useState<Partial<ExpensePolicy>>({
     isActive: true,
     currency: 'INR',
     policyLines: []
  });

  const myCategories = expenseCategories.filter(c => c.companyId === currentTenant?.id && c.isActive);

  useEffect(() => {
     if (policy) {
        setFormData(policy);
     } else {
        setFormData(prev => ({ ...prev }));
     }
  }, [policy]);

  const handleHeaderChange = (field: keyof ExpensePolicy, value: any) => {
     setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addLine = () => {
     const newLine: ExpensePolicyLine = {
        id: `line-${Date.now()}`,
        policyId: policy?.id || 'temp',
        categoryId: myCategories[0]?.id || '',
        limitAmount: 0,
        limitPeriod: 'Daily'
     };
     setFormData(prev => ({ ...prev, policyLines: [...(prev.policyLines || []), newLine] }));
  };

  const updateLine = (lineId: string, field: keyof ExpensePolicyLine, value: any) => {
     setFormData(prev => ({
        ...prev,
        policyLines: prev.policyLines?.map(l => l.id === lineId ? { ...l, [field]: value } : l)
     }));
  };

  const removeLine = (lineId: string) => {
     setFormData(prev => ({
        ...prev,
        policyLines: prev.policyLines?.filter(l => l.id !== lineId)
     }));
  };

  const handleSave = (e: React.FormEvent) => {
     e.preventDefault();
     if (!currentTenant || !formData.name) return;

     const now = new Date().toISOString();
     const base = {
        ...formData as ExpensePolicy,
        companyId: currentTenant.id,
        updatedAt: now,
        updatedBy: currentUser.name
     };

     if (policy) {
        updateExpensePolicy(base);
     } else {
        addExpensePolicy({
           ...base,
           id: `ep-${Date.now()}`,
           createdAt: now,
           createdBy: currentUser.name
        });
     }
     onBack();
  };

  const getCategoryName = (id: string) => myCategories.find(c => c.id === id)?.categoryName || id;

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center text-sm text-slate-500 hover:text-slate-700">
             <ArrowLeft className="w-4 h-4 mr-1" /> Back to Policies
          </button>
          {!isReadOnly && (
             <button onClick={handleSave} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
                <Save className="w-4 h-4 mr-2" /> Save Policy
             </button>
          )}
       </div>

       <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Policy Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="block text-sm font-medium text-slate-700">Policy Name</label>
                <input type="text" disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                   value={formData.name || ''} onChange={e => handleHeaderChange('name', e.target.value)} />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Currency</label>
                <input type="text" disabled className="mt-1 block w-full border border-slate-300 bg-slate-100 rounded-md shadow-sm p-2 sm:text-sm"
                   value={formData.currency} />
             </div>
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea rows={2} disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                   value={formData.description || ''} onChange={e => handleHeaderChange('description', e.target.value)} />
             </div>
             <div className="flex items-center gap-2">
                <label className="flex items-center text-sm text-slate-700">
                   <input type="checkbox" disabled={isReadOnly} checked={formData.isActive} onChange={e => handleHeaderChange('isActive', e.target.checked)} className="mr-2 rounded text-indigo-600"/>
                   Active
                </label>
             </div>
          </div>
       </div>

       <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-slate-900">Spending Rules & Limits</h3>
             {!isReadOnly && (
                <button onClick={addLine} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                   <Plus className="w-4 h-4 mr-1" /> Add Rule
                </button>
             )}
          </div>

          <div className="space-y-3">
             {formData.policyLines?.length === 0 && <div className="text-center text-slate-400 py-4 text-sm">No limits defined. Unlimited spending assumed unless restricted.</div>}
             
             {formData.policyLines?.map((line, idx) => (
                <div key={line.id} className="flex flex-col md:flex-row gap-4 p-3 bg-slate-50 rounded border border-slate-200 items-center">
                   <div className="w-8 text-xs text-slate-400 text-center">#{idx+1}</div>
                   <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                      <select className="block w-full border-slate-300 rounded p-1.5 text-sm"
                         value={line.categoryId} onChange={e => updateLine(line.id, 'categoryId', e.target.value)}
                         disabled={isReadOnly}
                      >
                         {myCategories.map(c => <option key={c.id} value={c.id}>{c.categoryName} ({c.categoryCode})</option>)}
                      </select>
                   </div>
                   <div className="w-32">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Limit Amount</label>
                      <input type="number" min="0" className="block w-full border-slate-300 rounded p-1.5 text-sm"
                         placeholder="0 = Unlimited"
                         value={line.limitAmount} onChange={e => updateLine(line.id, 'limitAmount', parseFloat(e.target.value))}
                         disabled={isReadOnly}
                      />
                   </div>
                   <div className="w-40">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Period</label>
                      <select className="block w-full border-slate-300 rounded p-1.5 text-sm"
                         value={line.limitPeriod} onChange={e => updateLine(line.id, 'limitPeriod', e.target.value as ExpenseLimitPeriod)}
                         disabled={isReadOnly}
                      >
                         <option value="Daily">Daily</option>
                         <option value="Monthly">Monthly</option>
                         <option value="Per Request">Per Request</option>
                         <option value="Yearly">Yearly</option>
                      </select>
                   </div>
                   <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Remarks</label>
                      <input type="text" className="block w-full border-slate-300 rounded p-1.5 text-sm"
                         placeholder="e.g. Excluding Tax"
                         value={line.remarks || ''} onChange={e => updateLine(line.id, 'remarks', e.target.value)}
                         disabled={isReadOnly}
                      />
                   </div>
                   {!isReadOnly && (
                      <button type="button" onClick={() => removeLine(line.id)} className="text-slate-400 hover:text-red-600 mt-4">
                         <Trash2 className="w-4 h-4" />
                      </button>
                   )}
                </div>
             ))}
          </div>
       </div>
    </div>
  );
};