
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ResignationRequest } from '../../types';
import { Send, Save, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export const MyResignation: React.FC = () => {
  const { resignationRequests, currentUser, currentTenant, addResignationRequest, submitResignation } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [lwd, setLwd] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const myResignation = resignationRequests.find(r => 
    r.employeeId === currentUser.employeeId && 
    r.status !== 'HR Rejected' && r.status !== 'Manager Rejected'
  ); // Assume active request if not rejected

  // If there's a rejected one, we can show it in history, but user can create new.
  // For simplicity, let's show history of all requests.
  const history = resignationRequests.filter(r => r.employeeId === currentUser.employeeId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSave = (action: 'Draft' | 'Submitted') => {
    if (!currentTenant || !currentUser.employeeId) return;
    
    const newReq: ResignationRequest = {
       id: `res-${Date.now()}`,
       companyId: currentTenant.id,
       employeeId: currentUser.employeeId,
       resignationDate: new Date().toISOString(),
       lastWorkingDay: lwd,
       reason,
       notes,
       status: action,
       createdAt: new Date().toISOString(),
       createdBy: currentUser.name,
       submittedOn: action === 'Submitted' ? new Date().toISOString() : undefined
    };

    addResignationRequest(newReq);
    setIsFormOpen(false);
  };

  const activeRequest = history.find(r => !['HR Rejected', 'Manager Rejected'].includes(r.status));

  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-lg font-bold text-slate-900">My Resignation</h2>
          <p className="text-sm text-slate-500">Submit and track your resignation request.</p>
       </div>

       {!isFormOpen && !activeRequest && (
          <div className="bg-white p-8 rounded-lg border border-slate-200 text-center">
             <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Resignation</h3>
             <p className="text-slate-500 mb-6 max-w-md mx-auto">If you wish to resign, please proceed. This action will notify your manager and HR.</p>
             <button onClick={() => setIsFormOpen(true)} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium">
                Initiate Resignation
             </button>
          </div>
       )}

       {isFormOpen && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 max-w-2xl mx-auto">
             <h3 className="text-lg font-bold text-slate-900 mb-4">New Resignation Request</h3>
             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700">Proposed Last Working Day</label>
                   <input type="date" required className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm" 
                      value={lwd} onChange={e => setLwd(e.target.value)} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700">Reason for Leaving</label>
                   <select className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm"
                      value={reason} onChange={e => setReason(e.target.value)}
                   >
                      <option value="">Select Reason</option>
                      <option value="Better Opportunity">Better Opportunity</option>
                      <option value="Personal Reasons">Personal Reasons</option>
                      <option value="Relocation">Relocation</option>
                      <option value="Higher Studies">Higher Studies</option>
                      <option value="Health Issues">Health Issues</option>
                      <option value="Other">Other</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700">Additional Notes</label>
                   <textarea rows={3} className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm" 
                      value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional details..." />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                   <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium hover:bg-slate-50">Cancel</button>
                   <button onClick={() => handleSave('Draft')} className="px-4 py-2 border border-slate-300 bg-slate-50 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-100">Save Draft</button>
                   <button onClick={() => handleSave('Submitted')} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Submit</button>
                </div>
             </div>
          </div>
       )}

       {history.length > 0 && (
          <div className="space-y-4">
             <h3 className="text-md font-bold text-slate-900">Resignation History</h3>
             {history.map(req => (
                <div key={req.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                   <div className="flex justify-between items-start">
                      <div>
                         <div className="font-bold text-slate-900">{req.reason}</div>
                         <div className="text-sm text-slate-600 mt-1">Proposed LWD: {new Date(req.lastWorkingDay).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                         <span className={`px-2 py-1 rounded-full text-xs font-medium 
                            ${req.status.includes('Approved') ? 'bg-green-100 text-green-800' : 
                              req.status.includes('Rejected') ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {req.status}
                         </span>
                         <div className="text-xs text-slate-400 mt-1">{new Date(req.createdAt).toLocaleDateString()}</div>
                      </div>
                   </div>
                   
                   {req.status === 'Draft' && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                         <button onClick={() => submitResignation(req)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
                            <Send className="w-4 h-4 mr-1" /> Submit Now
                         </button>
                      </div>
                   )}

                   {(req.managerComment || req.hrComment) && (
                      <div className="mt-4 p-3 bg-slate-50 rounded text-sm border border-slate-100">
                         {req.managerComment && <div><span className="font-medium text-slate-700">Manager:</span> {req.managerComment}</div>}
                         {req.hrComment && <div className="mt-1"><span className="font-medium text-slate-700">HR:</span> {req.hrComment}</div>}
                      </div>
                   )}
                </div>
             ))}
          </div>
       )}
    </div>
  );
};
