


import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FeedbackRequest, FeedbackRequestStatus, UserRole } from '../../types';
import { Plus, Search, Users, Eye, Send, XCircle, CheckCircle } from 'lucide-react';
import { RaterSelectionModal } from './RaterSelectionModal';
import { FeedbackResultView } from './FeedbackResultView';

export const FeedbackRequests: React.FC = () => {
  const { feedbackRequests, appraisalCycles, employees, feedbackTemplates, raterAssignments, currentTenant, addFeedbackRequest, updateFeedbackRequest, userRole, currentUser } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  
  const [configRequest, setConfigRequest] = useState<FeedbackRequest | null>(null);
  const [resultRequest, setResultRequest] = useState<FeedbackRequest | null>(null);

  const myRequests = feedbackRequests.filter(r => r.companyId === currentTenant?.id);
  const activeCycles = appraisalCycles.filter(c => c.companyId === currentTenant?.id && c.status === 'Active');
  const myEmployees = employees.filter(e => e.companyId === currentTenant?.id && e.status === 'Active');

  const handleCreateRequest = () => {
     if (!selectedCycle || !selectedEmployee) {
        alert('Please select an appraisal cycle and an employee.');
        return;
     }
     
     const employee = employees.find(e => e.id === selectedEmployee);
     if (!employee) return;

     const newReq: FeedbackRequest = {
        id: `freq-${Date.now()}`,
        companyId: currentTenant!.id,
        appraisalCycleId: selectedCycle,
        employeeId: employee.id,
        managerId: employee.reportingManagerId || '',
        templateId: '', // Will be resolved in action
        status: 'Draft',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.name
     };

     addFeedbackRequest(newReq);
     setIsModalOpen(false);
     // Open config immediately? Or let user find it in list
  };

  const handleStatusChange = (req: FeedbackRequest, newStatus: FeedbackRequestStatus) => {
     if (newStatus === 'Open') {
        // Validate if mandatory raters added?
        // For now just open
     }
     updateFeedbackRequest({ ...req, status: newStatus });
  };

  const getEmpName = (id: string) => {
     const e = employees.find(emp => emp.id === id);
     return e ? `${e.firstName} ${e.lastName}` : 'Unknown';
  };

  const getCycleName = (id: string) => appraisalCycles.find(c => c.id === id)?.name || '-';
  const getTemplateName = (id: string) => feedbackTemplates.find(t => t.id === id)?.name || 'Auto-Assigning...';

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">360 Feedback Requests</h2>
             <p className="text-sm text-slate-500">Manage feedback cycles and raters.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
             <Plus className="h-4 w-4 mr-2" /> Initiate Request
          </button>
       </div>

       <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cycle</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Template</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Raters</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {myRequests.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No requests found.</td></tr>
                ) : (
                   myRequests.map(req => {
                      const assignments = raterAssignments.filter(a => a.feedbackRequestId === req.id);
                      const submittedCount = assignments.filter(a => a.status === 'Submitted').length;

                      return (
                         <tr key={req.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                               <div className="text-sm font-medium text-slate-900">{getEmpName(req.employeeId)}</div>
                               <div className="text-xs text-slate-500">ID: {req.id}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">{getCycleName(req.appraisalCycleId)}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{getTemplateName(req.templateId)}</td>
                            <td className="px-6 py-4 text-center text-sm">
                               <span className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-medium">
                                  {submittedCount} / {assignments.length}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                               <span className={`px-2 py-1 text-xs font-medium rounded-full border 
                                  ${req.status === 'Open' ? 'bg-green-50 text-green-700 border-green-200' : 
                                    req.status === 'Draft' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    req.status === 'Closed' ? 'bg-slate-100 text-slate-700 border-slate-200' : 
                                    'bg-red-50 text-red-700 border-red-200'}`}>
                                  {req.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium flex justify-end items-center gap-3">
                               {req.status === 'Draft' && (
                                  <button onClick={() => setConfigRequest(req)} className="text-indigo-600 hover:text-indigo-900 flex items-center" title="Configure Raters">
                                     <Users className="w-4 h-4 mr-1" /> Raters
                                  </button>
                               )}
                               {req.status === 'Draft' && (
                                  <button onClick={() => handleStatusChange(req, 'Open')} className="text-green-600 hover:text-green-900 flex items-center" title="Open Request">
                                     <Send className="w-4 h-4" />
                                  </button>
                               )}
                               {(req.status === 'Open' || req.status === 'Closed') && (
                                  <button onClick={() => setResultRequest(req)} className="text-slate-600 hover:text-slate-900 flex items-center" title="View Results">
                                     <Eye className="w-4 h-4 mr-1" /> Results
                                  </button>
                               )}
                               {req.status === 'Open' && (
                                  <button onClick={() => handleStatusChange(req, 'Closed')} className="text-red-600 hover:text-red-900 flex items-center" title="Close Request">
                                     <XCircle className="w-4 h-4" />
                                  </button>
                               )}
                            </td>
                         </tr>
                      );
                   })
                )}
             </tbody>
          </table>
       </div>

       {/* Create Modal */}
       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">Initiate 360 Feedback</h3>
                <div className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Appraisal Cycle</label>
                      <select className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 sm:text-sm border" value={selectedCycle} onChange={e => setSelectedCycle(e.target.value)}>
                         <option value="">Select Cycle</option>
                         {activeCycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Select Employee</label>
                      <select className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 sm:text-sm border" value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
                         <option value="">Select Employee</option>
                         {myEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                      </select>
                   </div>
                   <div className="flex justify-end space-x-3 mt-6">
                      <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button onClick={handleCreateRequest} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Create Draft</button>
                   </div>
                </div>
             </div>
          </div>
       )}

       {/* Rater Config Modal */}
       {configRequest && (
          <RaterSelectionModal 
             request={configRequest} 
             onClose={() => setConfigRequest(null)} 
          />
       )}

       {/* Results Viewer */}
       {resultRequest && (
          <FeedbackResultView 
             request={resultRequest}
             onClose={() => setResultRequest(null)}
          />
       )}
    </div>
  );
};