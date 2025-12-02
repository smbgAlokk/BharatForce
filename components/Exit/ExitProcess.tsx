
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Lock, Plus, Trash2 } from 'lucide-react';
import { ExitClearanceStatus, ExitAsset, ExitHRForm, ResignationStatus } from '../../types';

export const ExitProcess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    resignationRequests, employees, departments, 
    exitClearanceStatuses, updateClearanceStatus, initializeExitChecklist,
    exitAssets, addExitAsset, updateExitAsset,
    exitHRForms, submitHRExitForm, completeExit,
    currentTenant, currentUser, userRole 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Clearance' | 'Assets' | 'HR'>('Clearance');
  const [assetName, setAssetName] = useState('');
  const [hrForm, setHrForm] = useState<Partial<ExitHRForm>>({ reasonForLeaving: '', recommendation: 'Eligible for Re-hire' });

  const req = resignationRequests.find(r => r.id === id);
  const employee = employees.find(e => e.id === req?.employeeId);

  useEffect(() => {
     if (req && currentTenant) {
        initializeExitChecklist(req.id, currentTenant.id);
        const existingForm = exitHRForms.find(f => f.resignationRequestId === req.id);
        if (existingForm) setHrForm(existingForm);
     }
  }, [req, currentTenant, exitHRForms]);

  if (!req || !employee) return <div>Request not found</div>;

  const myClearances = exitClearanceStatuses.filter(s => s.resignationRequestId === req.id);
  const myAssets = exitAssets.filter(a => a.resignationRequestId === req.id);

  // Logic for Final Closure
  const allCleared = myClearances.every(c => c.status === 'Cleared');
  const allReturned = myAssets.every(a => a.status === 'Returned');
  const hrFormSubmitted = !!exitHRForms.find(f => f.resignationRequestId === req.id);
  
  const canComplete = allCleared && allReturned && hrFormSubmitted && !req.isExitCompleted;

  const handleClearanceUpdate = (item: ExitClearanceStatus) => {
     if (item.status === 'Cleared') return; // Already done
     if (window.confirm(`Mark ${item.itemName} as Cleared?`)) {
        updateClearanceStatus({
           ...item,
           status: 'Cleared',
           clearedOn: new Date().toISOString(),
           clearedBy: currentUser.name
        });
     }
  };

  const handleAddAsset = () => {
     if (!assetName) return;
     addExitAsset({
        id: `asset-${Date.now()}`,
        resignationRequestId: req.id,
        assetName,
        status: 'Pending'
     });
     setAssetName('');
  };

  const handleReturnAsset = (asset: ExitAsset) => {
     if (asset.status === 'Returned') return;
     if (window.confirm(`Confirm return of ${asset.assetName}?`)) {
        updateExitAsset({ ...asset, status: 'Returned', returnedOn: new Date().toISOString() });
     }
  };

  const handleHRSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!hrForm.reasonForLeaving) return;
     
     submitHRExitForm({
        ...hrForm as ExitHRForm,
        id: hrForm.id || `hrf-${Date.now()}`,
        resignationRequestId: req.id,
        submittedOn: new Date().toISOString(),
        submittedBy: currentUser.name
     });
     alert('HR Form Submitted');
  };

  const handleFinalClose = () => {
     if (canComplete && window.confirm("Mark exit process as fully complete? Employee will be marked as separated.")) {
        completeExit(req.id);
        navigate('/exit/all-resignations');
     }
  };

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || id;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
             <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700"><ArrowLeft className="w-5 h-5"/></button>
             <div>
                <h2 className="text-xl font-bold text-slate-900">Exit Process: {employee.firstName} {employee.lastName}</h2>
                <p className="text-sm text-slate-500">LWD: {new Date(req.lastWorkingDay).toLocaleDateString()}</p>
             </div>
          </div>
          {req.isExitCompleted && (
             <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" /> Exit Completed
             </span>
          )}
       </div>

       <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-100">
             <button onClick={() => setActiveTab('Clearance')} className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'Clearance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}>Clearance Checklist</button>
             <button onClick={() => setActiveTab('Assets')} className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'Assets' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}>Asset Return</button>
             <button onClick={() => setActiveTab('HR')} className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'HR' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500'}`}>HR Exit Form</button>
          </div>

          <div className="p-6 min-h-[400px]">
             {activeTab === 'Clearance' && (
                <div className="space-y-4">
                   {myClearances.length === 0 ? (
                      <div className="text-center text-slate-500 italic">No clearance items initialized.</div>
                   ) : (
                      <table className="min-w-full divide-y divide-slate-200">
                         <thead className="bg-slate-50">
                            <tr>
                               <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Department</th>
                               <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
                               <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                               <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Cleared By</th>
                               <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-200">
                            {myClearances.map(c => (
                               <tr key={c.id}>
                                  <td className="px-4 py-3 text-sm text-slate-600">{getDeptName(c.departmentId)}</td>
                                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{c.itemName}</td>
                                  <td className="px-4 py-3 text-center">
                                     <span className={`px-2 py-1 rounded-full text-xs ${c.status === 'Cleared' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {c.status}
                                     </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-500">
                                     {c.clearedBy ? `${c.clearedBy} on ${new Date(c.clearedOn!).toLocaleDateString()}` : '-'}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                     {c.status === 'Pending' && !req.isExitCompleted && (
                                        <button onClick={() => handleClearanceUpdate(c)} className="text-indigo-600 hover:text-indigo-900 text-xs font-medium">Mark Cleared</button>
                                     )}
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   )}
                </div>
             )}

             {activeTab === 'Assets' && (
                <div className="space-y-6">
                   {!req.isExitCompleted && (
                      <div className="flex gap-2 max-w-md">
                         <input 
                           type="text" 
                           className="flex-1 border border-slate-300 rounded-md p-2 text-sm" 
                           placeholder="Add Asset (e.g. Access Card)" 
                           value={assetName}
                           onChange={e => setAssetName(e.target.value)}
                         />
                         <button onClick={handleAddAsset} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">Add</button>
                      </div>
                   )}

                   <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-200">
                         <thead className="bg-slate-50">
                            <tr>
                               <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Asset Name</th>
                               <th className="px-4 py-2 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                               <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Returned On</th>
                               <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-200">
                            {myAssets.map(a => (
                               <tr key={a.id}>
                                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{a.assetName}</td>
                                  <td className="px-4 py-3 text-center">
                                     <span className={`px-2 py-1 rounded-full text-xs ${a.status === 'Returned' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {a.status}
                                     </span>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-slate-500">
                                     {a.returnedOn ? new Date(a.returnedOn).toLocaleDateString() : '-'}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                     {a.status === 'Pending' && !req.isExitCompleted && (
                                        <button onClick={() => handleReturnAsset(a)} className="text-green-600 hover:text-green-900 text-xs font-medium">Mark Returned</button>
                                     )}
                                  </td>
                               </tr>
                            ))}
                            {myAssets.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No assets logged.</td></tr>}
                         </tbody>
                      </table>
                   </div>
                </div>
             )}

             {activeTab === 'HR' && (
                <form onSubmit={handleHRSubmit} className="max-w-2xl space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Reason for Leaving</label>
                      <select 
                        className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm"
                        value={hrForm.reasonForLeaving} onChange={e => setHrForm({...hrForm, reasonForLeaving: e.target.value})}
                        disabled={hrFormSubmitted || req.isExitCompleted} required
                      >
                         <option value="">Select Reason</option>
                         <option value="Better Salary">Better Salary</option>
                         <option value="Role Change">Role Change</option>
                         <option value="Company Culture">Company Culture</option>
                         <option value="Personal">Personal</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Employee Feedback Summary</label>
                      <textarea 
                        className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm" rows={3}
                        value={hrForm.feedback || ''} onChange={e => setHrForm({...hrForm, feedback: e.target.value})}
                        disabled={hrFormSubmitted || req.isExitCompleted}
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">HR Notes (Confidential)</label>
                      <textarea 
                        className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm" rows={2}
                        value={hrForm.notes || ''} onChange={e => setHrForm({...hrForm, notes: e.target.value})}
                        disabled={hrFormSubmitted || req.isExitCompleted}
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Recommendation</label>
                      <select 
                        className="mt-1 block w-full border border-slate-300 rounded-md p-2 text-sm"
                        value={hrForm.recommendation} onChange={e => setHrForm({...hrForm, recommendation: e.target.value})}
                        disabled={hrFormSubmitted || req.isExitCompleted}
                      >
                         <option value="Eligible for Re-hire">Eligible for Re-hire</option>
                         <option value="Not Eligible">Not Eligible</option>
                         <option value="Conditional">Conditional</option>
                      </select>
                   </div>
                   
                   {!hrFormSubmitted && !req.isExitCompleted && (
                      <div className="pt-4">
                         <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700">Submit Form</button>
                      </div>
                   )}
                </form>
             )}
          </div>

          {/* Footer Action */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
             <div className="text-sm text-slate-600">
                Status: <span className="font-bold">{req.isExitCompleted ? 'Completed' : 'In Progress'}</span>
             </div>
             {!req.isExitCompleted && (
                <button 
                  onClick={handleFinalClose} 
                  disabled={!canComplete}
                  className={`px-6 py-2 rounded-md text-sm font-bold flex items-center 
                     ${canComplete ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                >
                   <Lock className="w-4 h-4 mr-2" /> Mark Exit Complete
                </button>
             )}
          </div>
       </div>
    </div>
  );
};
