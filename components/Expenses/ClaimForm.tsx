
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ExpenseClaim, ExpenseClaimLine, ClaimStatus } from '../../types';
import { ArrowLeft, Save, Send, Plus, Trash2, Paperclip, AlertTriangle } from 'lucide-react';

export const ClaimForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { expenseClaims, expenseCategories, expenseAdvances, currentTenant, currentUser, addExpenseClaim, updateExpenseClaim, submitExpenseClaim } = useApp();

  const isEdit = !!id && id !== 'new';
  const existingClaim = isEdit ? expenseClaims.find(c => c.id === id) : null;

  const myCategories = expenseCategories.filter(c => c.companyId === currentTenant?.id && c.isActive);
  
  // Find active advances for this employee
  const myApprovedAdvances = expenseAdvances.filter(a => 
     a.employeeId === currentUser.employeeId && 
     a.companyId === currentTenant?.id && 
     a.status === 'HR Approved' // Only fully approved and open
  );

  const [formData, setFormData] = useState<Partial<ExpenseClaim>>({
    claimDate: new Date().toISOString().split('T')[0],
    status: 'Draft',
    lines: []
  });

  useEffect(() => {
    if (existingClaim) {
      setFormData(existingClaim);
    } else if (!isEdit) {
      // Initialize with one empty line
      addLine();
    }
  }, [existingClaim, isEdit]);

  const addLine = () => {
    const newLine: ExpenseClaimLine = {
      id: `eline-${Date.now()}`,
      claimId: formData.id || 'temp',
      date: formData.claimDate || new Date().toISOString().split('T')[0],
      categoryId: myCategories[0]?.id || '',
      amount: 0,
      description: ''
    };
    setFormData(prev => ({ ...prev, lines: [...(prev.lines || []), newLine] }));
  };

  const removeLine = (lineId: string) => {
    setFormData(prev => ({ ...prev, lines: prev.lines?.filter(l => l.id !== lineId) }));
  };

  const updateLine = (lineId: string, field: keyof ExpenseClaimLine, value: any) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines?.map(l => l.id === lineId ? { ...l, [field]: value } : l)
    }));
  };

  const calculateTotal = () => {
    return formData.lines?.reduce((sum, l) => sum + (l.amount || 0), 0) || 0;
  };

  const totalAmount = calculateTotal();
  
  // Advance Calculation
  const linkedAdvance = formData.linkedAdvanceId ? expenseAdvances.find(a => a.id === formData.linkedAdvanceId) : null;
  const advanceAmount = linkedAdvance ? linkedAdvance.amount : 0;
  const netPayable = totalAmount - advanceAmount;

  const handleSave = (action: 'Draft' | 'Submitted') => {
    if (!currentTenant) return;
    
    if (totalAmount <= 0 && action === 'Submitted') {
      alert("Cannot submit a claim with 0 amount.");
      return;
    }

    const now = new Date().toISOString();
    const base = {
      ...formData as ExpenseClaim,
      companyId: currentTenant.id,
      employeeId: currentUser.employeeId!,
      totalAmount: totalAmount,
      status: action,
      updatedAt: now,
      updatedBy: currentUser.name,
      submittedOn: action === 'Submitted' ? now : undefined,
      netPayable: netPayable // Persist calculated net
    };

    if (isEdit && existingClaim) {
      if (action === 'Submitted') submitExpenseClaim(base);
      else updateExpenseClaim(base);
    } else {
      const newClaim = { ...base, id: `claim-${Date.now()}`, createdAt: now, createdBy: currentUser.name };
      if (action === 'Submitted') {
         addExpenseClaim(newClaim); // First add
         submitExpenseClaim(newClaim); // Then status update logic if any
      } else {
         addExpenseClaim(newClaim);
      }
    }
    navigate('/expenses/my-claims');
  };

  const isReadOnly = existingClaim && existingClaim.status !== 'Draft';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/expenses/my-claims')} className="flex items-center text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <div className="text-sm font-medium text-slate-500">
           Status: <span className={`font-bold ${formData.status === 'Draft' ? 'text-slate-700' : 'text-blue-600'}`}>{formData.status}</span>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
           <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit Claim' : 'New Expense Claim'}</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                 <label className="block text-sm font-medium text-slate-700">Claim Date</label>
                 <input 
                   type="date" 
                   disabled={isReadOnly}
                   className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm"
                   value={formData.claimDate}
                   onChange={e => setFormData({...formData, claimDate: e.target.value})}
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700">Notes / Purpose</label>
                 <input 
                   type="text" 
                   disabled={isReadOnly}
                   className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm"
                   placeholder="e.g. Client Visit to Mumbai"
                   value={formData.notes || ''}
                   onChange={e => setFormData({...formData, notes: e.target.value})}
                 />
              </div>
           </div>
        </div>

        <div className="p-6 space-y-4">
           <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm uppercase">Expense Items</h3>
              {!isReadOnly && (
                 <button onClick={addLine} className="text-sm text-indigo-600 font-medium hover:text-indigo-800 flex items-center">
                    <Plus className="w-4 h-4 mr-1" /> Add Line
                 </button>
              )}
           </div>

           <div className="space-y-3">
              {formData.lines?.map((line, idx) => (
                 <div key={line.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 bg-slate-50 border border-slate-200 rounded-lg relative group">
                    <div className="w-6 text-xs text-slate-400 font-bold text-center">{idx+1}</div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                       <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1 md:hidden">Date</label>
                          <input 
                            type="date" 
                            disabled={isReadOnly}
                            className="block w-full border border-slate-300 rounded p-1.5 text-sm"
                            value={line.date}
                            onChange={e => updateLine(line.id, 'date', e.target.value)}
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1 md:hidden">Category</label>
                          <select 
                            disabled={isReadOnly}
                            className="block w-full border border-slate-300 rounded p-1.5 text-sm"
                            value={line.categoryId}
                            onChange={e => updateLine(line.id, 'categoryId', e.target.value)}
                          >
                             {myCategories.map(c => <option key={c.id} value={c.id}>{c.categoryName}</option>)}
                          </select>
                       </div>
                       <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-slate-500 mb-1 md:hidden">Description</label>
                          <input 
                            type="text" 
                            disabled={isReadOnly}
                            className="block w-full border border-slate-300 rounded p-1.5 text-sm"
                            placeholder="Description"
                            value={line.description || ''}
                            onChange={e => updateLine(line.id, 'description', e.target.value)}
                          />
                       </div>
                    </div>

                    <div className="w-full md:w-32">
                       <label className="block text-xs font-medium text-slate-500 mb-1 md:hidden">Amount</label>
                       <input 
                         type="number" 
                         disabled={isReadOnly}
                         className="block w-full border border-slate-300 rounded p-1.5 text-sm font-bold text-right"
                         placeholder="0.00"
                         value={line.amount}
                         onChange={e => updateLine(line.id, 'amount', parseFloat(e.target.value))}
                       />
                    </div>

                    {!isReadOnly && (
                       <button onClick={() => removeLine(line.id)} className="text-slate-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    )}
                    
                    <button className="text-slate-400 hover:text-indigo-600 p-1" title="Attach Receipt">
                       <Paperclip className="w-4 h-4" />
                    </button>
                 </div>
              ))}
              {formData.lines?.length === 0 && (
                 <div className="text-center py-8 text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded">
                    No items added. Click "Add Line" to start.
                 </div>
              )}
           </div>

           <div className="border-t border-slate-200 pt-4 mt-4 space-y-3">
              {/* Advance Adjustment Section */}
              <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                 <div className="flex-1 w-full md:max-w-sm">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Adjust Against Advance (Optional)</label>
                    <select 
                       disabled={isReadOnly || myApprovedAdvances.length === 0}
                       className="block w-full border border-slate-300 rounded-md p-2 text-sm"
                       value={formData.linkedAdvanceId || ''}
                       onChange={e => setFormData({...formData, linkedAdvanceId: e.target.value})}
                    >
                       <option value="">-- Select Approved Advance --</option>
                       {myApprovedAdvances.map(adv => (
                          <option key={adv.id} value={adv.id}>
                             ₹ {adv.amount.toLocaleString()} - {adv.reason}
                          </option>
                       ))}
                    </select>
                    {myApprovedAdvances.length === 0 && !isReadOnly && (
                       <p className="text-xs text-slate-400 mt-1">No approved advances available.</p>
                    )}
                 </div>

                 <div className="text-right space-y-1 min-w-[200px]">
                    <div className="flex justify-between text-sm text-slate-500">
                       <span>Total Claim:</span>
                       <span>₹ {totalAmount.toLocaleString()}</span>
                    </div>
                    {linkedAdvance && (
                       <div className="flex justify-between text-sm text-amber-600">
                          <span>Less Advance:</span>
                          <span>- ₹ {advanceAmount.toLocaleString()}</span>
                       </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-slate-900 pt-2 border-t">
                       <span>Net Payable:</span>
                       <span className={netPayable < 0 ? 'text-red-600' : 'text-green-600'}>
                          ₹ {netPayable.toLocaleString()}
                       </span>
                    </div>
                    {netPayable < 0 && (
                       <div className="text-xs text-red-500 flex justify-end items-center">
                          <AlertTriangle className="w-3 h-3 mr-1"/> Recoverable from Salary
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {!isReadOnly && (
           <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={() => handleSave('Draft')} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-white flex items-center">
                 <Save className="w-4 h-4 mr-2" /> Save Draft
              </button>
              <button onClick={() => handleSave('Submitted')} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center">
                 <Send className="w-4 h-4 mr-2" /> Submit Claim
              </button>
           </div>
        )}
      </div>
    </div>
  );
};
