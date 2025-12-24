
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseAdvance } from '../../types';
import { Plus, IndianRupee, Clock, CheckCircle, XCircle, Lock } from 'lucide-react';

export const MyAdvances: React.FC = () => {
  const { expenseAdvances, currentUser, currentTenant, addExpenseAdvance } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [reason, setReason] = useState('');

  const myAdvances = expenseAdvances.filter(a => a.employeeId === currentUser.employeeId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!currentTenant || !currentUser.employeeId || amount <= 0) return;

     const newAdv: ExpenseAdvance = {
        id: `adv-${Date.now()}`,
        companyId: currentTenant.id,
        employeeId: currentUser.employeeId,
        amount,
        reason,
        status: 'Submitted',
        requestedOn: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: currentUser.name
     };

     addExpenseAdvance(newAdv);
     setIsModalOpen(false);
     setAmount(0);
     setReason('');
  };

  const getStatusBadge = (status: string) => {
     switch(status) {
        case 'Submitted': return <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-medium flex items-center"><Clock className="w-3 h-3 mr-1"/> Pending</span>;
        case 'Manager Approved': return <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded text-xs font-medium flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Mgr Approved</span>;
        case 'HR Approved': return <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-medium flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Active</span>;
        case 'Rejected': return <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-medium flex items-center"><XCircle className="w-3 h-3 mr-1"/> Rejected</span>;
        case 'Closed': return <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded text-xs font-medium flex items-center"><Lock className="w-3 h-3 mr-1"/> Settled</span>;
        default: return null;
     }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">My Advances</h2>
             <p className="text-sm text-slate-500">Request cash advances for official expenses.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
             <Plus className="w-4 h-4 mr-2" /> Request Advance
          </button>
       </div>

       <div className="grid grid-cols-1 gap-4">
          {myAdvances.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">No advance requests found.</div>
          ) : (
             myAdvances.map(adv => (
                <div key={adv.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                   <div className="flex justify-between items-start">
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-slate-500">{new Date(adv.requestedOn).toLocaleDateString()}</span>
                            <span className="font-mono text-xs bg-slate-100 px-1 rounded text-slate-500">{adv.id}</span>
                         </div>
                         <div className="font-bold text-slate-900 text-lg">₹ {adv.amount.toLocaleString()}</div>
                         <div className="text-sm text-slate-600 mt-1">{adv.reason}</div>
                      </div>
                      <div className="flex flex-col items-end">
                         {getStatusBadge(adv.status)}
                         {adv.approvedOn && <div className="text-xs text-slate-400 mt-1">Approved: {new Date(adv.approvedOn).toLocaleDateString()}</div>}
                      </div>
                   </div>
                </div>
             ))
          )}
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">Request Advance</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Amount (₹)</label>
                      <input type="number" required min="1" className="mt-1 block w-full border border-slate-300 rounded-md p-2" 
                         value={amount || ''} onChange={e => setAmount(parseFloat(e.target.value))} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Reason / Purpose</label>
                      <textarea required rows={2} className="mt-1 block w-full border border-slate-300 rounded-md p-2" 
                         value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Travel to Delhi" />
                   </div>
                   <div className="flex justify-end space-x-3 mt-6">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Submit Request</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};
