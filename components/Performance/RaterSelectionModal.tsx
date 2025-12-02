


import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FeedbackRequest, RaterAssignment, UserRole } from '../../types';
import { X, Plus, Trash2, User, Mail } from 'lucide-react';

interface Props {
  request: FeedbackRequest;
  onClose: () => void;
}

export const RaterSelectionModal: React.FC<Props> = ({ request, onClose }) => {
  const { 
     feedbackTemplates, raterTypes, employees, raterAssignments, 
     addRaterAssignment, updateRaterAssignment, updateFeedbackRequest,
     currentTenant, currentUser
  } = useApp();

  const template = feedbackTemplates.find(t => t.id === request.templateId);
  const assignments = raterAssignments.filter(a => a.feedbackRequestId === request.id);
  const myEmployees = employees.filter(e => e.companyId === currentTenant?.id && e.status === 'Active');

  const [activeRaterTypeId, setActiveRaterTypeId] = useState<string>(template?.raterConfigs[0]?.raterTypeId || '');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [externalEmail, setExternalEmail] = useState('');

  if (!template) return <div className="p-6">Template not found.</div>;

  const activeTypeConfig = template.raterConfigs.find(c => c.raterTypeId === activeRaterTypeId);
  const activeRaterType = raterTypes.find(rt => rt.id === activeRaterTypeId);
  
  // Current assignments for this type
  const currentTypeAssignments = assignments.filter(a => a.raterTypeId === activeRaterTypeId);

  const handleAddInternal = () => {
     if (!selectedEmployeeId) return;
     // Check duplicate
     if (assignments.some(a => a.raterEmployeeId === selectedEmployeeId)) {
        alert('User already assigned.');
        return;
     }

     const newAssign: RaterAssignment = {
        id: `assign-${Date.now()}`,
        feedbackRequestId: request.id,
        raterTypeId: activeRaterTypeId,
        raterEmployeeId: selectedEmployeeId,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.name
     };
     addRaterAssignment(newAssign);
     setSelectedEmployeeId('');
  };

  const handleAddExternal = () => {
     if (!externalEmail) return;
     const newAssign: RaterAssignment = {
        id: `assign-${Date.now()}`,
        feedbackRequestId: request.id,
        raterTypeId: activeRaterTypeId,
        externalRaterEmail: externalEmail,
        externalRaterName: externalEmail.split('@')[0], // Simple fallback
        status: 'Pending',
        createdAt: new Date().toISOString(),
        createdBy: currentUser.name
     };
     addRaterAssignment(newAssign);
     setExternalEmail('');
  };

  const handleRemove = (assignId: string) => {
     // In real app, delete. Here we filter state in context? Context updateRaterAssignment is for status.
     // Assuming we need delete action. Let's just mock "remove" by setting status 'Declined' or hide it.
     // For this prototype, I'll just alert.
     alert("Deletion not implemented in prototype context. Mark as declined?");
  };

  const handleOpenRequest = () => {
     // Validate Min Counts
     const errors = [];
     template.raterConfigs.forEach(config => {
        if (config.isIncluded && config.isMandatory) {
           const count = assignments.filter(a => a.raterTypeId === config.raterTypeId).length;
           if (count < config.minCount) {
              const typeName = raterTypes.find(t => t.id === config.raterTypeId)?.name;
              errors.push(`${typeName}: Minimum ${config.minCount} required.`);
           }
        }
     });

     if (errors.length > 0) {
        alert(`Cannot open request:\n${errors.join('\n')}`);
        return;
     }

     updateFeedbackRequest({ ...request, status: 'Open' });
     onClose();
  };

  const getEmpName = (id: string) => {
     const e = employees.find(em => em.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
           <div>
             <h3 className="text-lg font-bold">Select Raters</h3>
             <p className="text-sm text-slate-500">Template: {template.name}</p>
           </div>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
           {/* Left Sidebar: Rater Types */}
           <div className="w-1/3 border-r border-slate-200 pr-4 space-y-2">
              {template.raterConfigs.filter(c => c.isIncluded).map(config => {
                 const type = raterTypes.find(t => t.id === config.raterTypeId);
                 const count = assignments.filter(a => a.raterTypeId === config.raterTypeId).length;
                 const isValid = count >= config.minCount;

                 return (
                    <button 
                       key={config.raterTypeId}
                       onClick={() => setActiveRaterTypeId(config.raterTypeId)}
                       className={`w-full text-left px-3 py-2 rounded flex justify-between items-center text-sm font-medium ${
                          activeRaterTypeId === config.raterTypeId ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'
                       }`}
                    >
                       <span>{type?.name}</span>
                       <span className={`text-xs px-2 py-0.5 rounded-full ${isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {count} / {config.minCount}
                       </span>
                    </button>
                 );
              })}
           </div>

           {/* Right Content: Add Raters */}
           <div className="flex-1 pl-6 overflow-y-auto custom-scrollbar">
              {activeRaterType && (
                 <div className="space-y-6">
                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                       <h4 className="text-sm font-bold text-slate-800 mb-3">Add {activeRaterType.name}</h4>
                       {activeRaterType.isInternal ? (
                          <div className="flex gap-2">
                             <select 
                                className="flex-1 border border-slate-300 rounded-md text-sm p-2"
                                value={selectedEmployeeId}
                                onChange={e => setSelectedEmployeeId(e.target.value)}
                             >
                                <option value="">Select Employee</option>
                                {myEmployees.map(e => (
                                   <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                                ))}
                             </select>
                             <button onClick={handleAddInternal} className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700"><Plus className="w-4 h-4"/></button>
                          </div>
                       ) : (
                          <div className="flex gap-2">
                             <input 
                                type="email" 
                                className="flex-1 border border-slate-300 rounded-md text-sm p-2" 
                                placeholder="External Email"
                                value={externalEmail}
                                onChange={e => setExternalEmail(e.target.value)}
                             />
                             <button onClick={handleAddExternal} className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700"><Plus className="w-4 h-4"/></button>
                          </div>
                       )}
                    </div>

                    <div>
                       <h4 className="text-sm font-bold text-slate-800 mb-3">Selected Raters</h4>
                       {currentTypeAssignments.length === 0 ? (
                          <div className="text-sm text-slate-500 italic">No raters assigned yet.</div>
                       ) : (
                          <div className="space-y-2">
                             {currentTypeAssignments.map(assign => (
                                <div key={assign.id} className="flex justify-between items-center p-2 border border-slate-100 rounded hover:bg-slate-50">
                                   <div className="flex items-center">
                                      {assign.raterEmployeeId ? <User className="w-4 h-4 mr-2 text-slate-400"/> : <Mail className="w-4 h-4 mr-2 text-slate-400"/>}
                                      <span className="text-sm">{assign.raterEmployeeId ? getEmpName(assign.raterEmployeeId) : assign.externalRaterEmail}</span>
                                   </div>
                                   <button onClick={() => handleRemove(assign.id)} className="text-slate-400 hover:text-red-500">
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                </div>
                             ))}
                          </div>
                       )}
                    </div>
                 </div>
              )}
           </div>
        </div>

        <div className="border-t pt-4 mt-4 flex justify-end space-x-3">
           <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded text-sm hover:bg-slate-50">Cancel</button>
           <button onClick={handleOpenRequest} className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">Open Request</button>
        </div>
      </div>
    </div>
  );
};
