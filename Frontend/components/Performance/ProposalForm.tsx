
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PIProposal, ProposalStatus, ProposalType, UserRole, ApprovalStage } from '../../types';
import { ArrowLeft, Save, Send, CheckCircle, XCircle, FileText, Lock } from 'lucide-react';

export const ProposalForm: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const { 
     piProposals, appraisalCycles, employees, appraisalForms, grades, designations, departments, 
     promotionRules, incrementGuidelines, letterTemplates, generatedLetters,
     addPIProposal, updatePIProposal, approvePIProposal, rejectPIProposal,
     generateLetter, issueLetter, closePIProposal,
     currentTenant, currentUser, userRole 
  } = useApp();

  const isEdit = !!id;
  const existingProp = piProposals.find(p => p.id === id);
  
  const [formData, setFormData] = useState<Partial<PIProposal>>({ 
     type: ProposalType.INCREMENT, 
     status: ProposalStatus.DRAFT,
     approvalStage: ApprovalStage.DRAFT
  });
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(existingProp?.employeeId || '');
  const [selectedCycleId, setSelectedCycleId] = useState(existingProp?.appraisalCycleId || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const myEmployees = employees.filter(e => e.companyId === currentTenant?.id && e.status === 'Active');
  const myCycles = appraisalCycles.filter(c => c.companyId === currentTenant?.id);
  const myGrades = grades.filter(g => g.companyId === currentTenant?.id);
  const myDesigs = designations.filter(d => d.companyId === currentTenant?.id);
  
  // Available Templates matching proposal type
  const availableTemplates = letterTemplates.filter(t => t.companyId === currentTenant?.id && (t.type === formData.type || t.type === ProposalType.BOTH));
  
  const generatedLetter = generatedLetters.find(l => l.proposalId === id);

  useEffect(() => {
     if (!isEdit && employees.length > 0) {
        if (selectedEmployeeId) {
           const employee = employees.find(e => e.id === selectedEmployeeId);
           const appraisalForm = appraisalForms.find(f => f.employeeId === selectedEmployeeId && f.appraisalCycleId === selectedCycleId);
           if (employee) {
              setFormData(prev => ({
                 ...prev,
                 companyId: currentTenant?.id,
                 employeeId: employee.id,
                 appraisalCycleId: selectedCycleId,
                 managerId: employee.reportingManagerId,
                 currentDepartmentId: employee.departmentId,
                 currentDesignationId: employee.designationId,
                 currentGradeId: employee.gradeId,
                 currentCtc: employee.payrollSettings?.ctc || 0,
                 currentFixedPay: (employee.payrollSettings?.ctc || 0) * 0.9,
                 currentVariablePay: (employee.payrollSettings?.ctc || 0) * 0.1,
                 latestAppraisalScore: appraisalForm?.overallScore,
                 latestAppraisalBandId: appraisalForm?.overallBandId
              }));
           }
        }
     } else if (existingProp) {
        setFormData(existingProp);
        setSelectedEmployeeId(existingProp.employeeId);
        setSelectedCycleId(existingProp.appraisalCycleId);
     }
  }, [selectedEmployeeId, selectedCycleId, isEdit, existingProp]);

  const handleProposedChange = (field: keyof PIProposal, value: any) => {
     const updated = { ...formData, [field]: value };
     if (field === 'proposedFixedPay' || field === 'proposedVariablePay') {
        const fixed = field === 'proposedFixedPay' ? value : (updated.proposedFixedPay || 0);
        const variable = field === 'proposedVariablePay' ? value : (updated.proposedVariablePay || 0);
        updated.proposedCtc = Number(fixed) + Number(variable);
        if (updated.currentCtc) {
           updated.incrementPercentage = ((updated.proposedCtc - updated.currentCtc) / updated.currentCtc) * 100;
        }
     }
     setFormData(updated);
  };

  const handleSaveDraft = () => {
     if (!formData.employeeId || !formData.appraisalCycleId) return;
     const now = new Date().toISOString();
     const base = { ...formData as PIProposal, updatedAt: now, updatedBy: currentUser.name };
     if (isEdit && existingProp) updatePIProposal(base);
     else addPIProposal({ ...base, id: `prop-${Date.now()}`, createdAt: now, createdBy: currentUser.name, approvalStage: ApprovalStage.DRAFT, status: ProposalStatus.DRAFT });
     navigate('/performance/promotion-proposals');
  };

  const handleSubmit = () => {
     if (!formData.employeeId) return;
     const now = new Date().toISOString();
     const base = { ...formData as PIProposal, status: ProposalStatus.SUBMITTED, approvalStage: ApprovalStage.MANAGER, updatedAt: now, updatedBy: currentUser.name };
     if (isEdit && existingProp) updatePIProposal(base);
     else addPIProposal({ ...base, id: `prop-${Date.now()}`, createdAt: now, createdBy: currentUser.name });
     navigate('/performance/promotion-proposals');
  };

  const handleWorkflowAction = (action: 'Approve' | 'Reject') => {
     if (!existingProp) return;
     const comments = prompt(`Enter remarks for ${action}:`) || '';
     if (action === 'Approve') approvePIProposal(existingProp.id, comments);
     else rejectPIProposal(existingProp.id, comments);
     navigate('/performance/promotion-proposals');
  };

  const handleGenerateLetter = () => {
     if (!existingProp || !selectedTemplateId) return;
     generateLetter(existingProp.id, selectedTemplateId);
  };

  const handleIssueLetter = () => {
     if (!generatedLetter) return;
     if (window.confirm('Issue this letter to the employee? They will be notified.')) {
        issueLetter(generatedLetter.id);
     }
  };

  const handleCloseProposal = () => {
     if (!existingProp) return;
     if (window.confirm('Close this proposal? No further changes allowed.')) {
        closePIProposal(existingProp.id);
        navigate('/performance/promotion-proposals');
     }
  };

  const isDraft = formData.status === ProposalStatus.DRAFT;
  const isApproved = formData.status === ProposalStatus.APPROVED;
  const canEdit = isDraft || (userRole === UserRole.COMPANY_ADMIN && !['Approved', 'Rejected'].includes(formData.status || ''));
  const canApprove = existingProp && (
     (userRole === UserRole.MANAGER && existingProp.approvalStage === ApprovalStage.MANAGER && existingProp.managerId === currentUser.employeeId) ||
     (userRole === UserRole.COMPANY_ADMIN && (existingProp.approvalStage === ApprovalStage.HR || existingProp.approvalStage === ApprovalStage.MANAGEMENT))
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
       <div className="flex items-center justify-between">
         <button onClick={() => navigate('/performance/promotion-proposals')} className="flex items-center text-sm text-slate-500 hover:text-slate-700">
           <ArrowLeft className="w-4 h-4 mr-1" /> Back
         </button>
         {existingProp && (
            <div className="flex items-center gap-2">
               <span className={`px-3 py-1 text-sm font-medium rounded-full border ${formData.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : formData.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>{formData.status}</span>
               {formData.isClosed && <span className="px-3 py-1 text-sm font-medium rounded-full bg-slate-200 text-slate-600">Closed</span>}
            </div>
         )}
       </div>

       <div className="bg-white shadow rounded-lg border border-slate-200 p-6 space-y-6">
          {/* Basic Proposal Fields (Simplified for brevity, assumes code from Part 4A/B exists) */}
          {!isEdit && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-100 pb-6">
                <div>
                   <label className="block text-sm font-medium text-slate-700">Cycle</label>
                   <select className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm" value={selectedCycleId} onChange={e => setSelectedCycleId(e.target.value)}>
                      <option value="">Select</option>
                      {myCycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700">Employee</label>
                   <select className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm" value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)}>
                      <option value="">Select</option>
                      {myEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                   </select>
                </div>
             </div>
          )}

          {/* Read-only Details if Approved */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="col-span-2">
                <h4 className="font-bold text-slate-900 mb-2">Proposal Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>Proposed New CTC: <span className="font-bold">₹ {formData.proposedCtc?.toLocaleString()}</span></div>
                   <div>Increment: <span className="font-bold text-green-600">{formData.incrementPercentage?.toFixed(2)}%</span></div>
                   {formData.proposedDesignationId && <div>New Role: {myDesigs.find(d => d.id === formData.proposedDesignationId)?.name}</div>}
                </div>
             </div>
          </div>

          {/* Communication & Closure Section (Visible on Approved) */}
          {isApproved && userRole === UserRole.COMPANY_ADMIN && !formData.isClosed && (
             <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center"><FileText className="w-5 h-5 mr-2" /> Communication & Closure</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Left: Letter Generation */}
                   <div className="bg-slate-50 p-4 rounded border border-slate-200">
                      <h4 className="font-bold text-slate-800 mb-2">1. Generate Letter</h4>
                      {generatedLetter ? (
                         <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                               <span>Letter Status: <span className="font-bold">{generatedLetter.status}</span></span>
                               <button className="text-indigo-600 text-xs hover:underline">Preview</button>
                            </div>
                            {generatedLetter.status === 'Draft' && (
                               <button onClick={handleIssueLetter} className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">Issue Letter</button>
                            )}
                         </div>
                      ) : (
                         <div className="space-y-2">
                            <select className="w-full border p-2 rounded text-sm" value={selectedTemplateId} onChange={e => setSelectedTemplateId(e.target.value)}>
                               <option value="">Select Template</option>
                               {availableTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <button onClick={handleGenerateLetter} disabled={!selectedTemplateId} className="w-full py-2 bg-white border border-slate-300 rounded text-sm hover:bg-slate-100">Generate Draft</button>
                         </div>
                      )}
                   </div>

                   {/* Right: Closure */}
                   <div className="bg-slate-50 p-4 rounded border border-slate-200">
                      <h4 className="font-bold text-slate-800 mb-2">2. Final Closure</h4>
                      <div className="space-y-2 text-sm">
                         <div className="flex justify-between">
                            <span>Letter Issued?</span>
                            <span>{formData.letterIssued ? <CheckCircle className="w-4 h-4 text-green-600"/> : <XCircle className="w-4 h-4 text-red-400"/>}</span>
                         </div>
                         <div className="flex justify-between">
                            <span>Payroll Status</span>
                            <span className={`font-bold ${formData.payrollSyncStatus === 'Confirmed' ? 'text-green-600' : 'text-amber-600'}`}>{formData.payrollSyncStatus || 'Not Sent'}</span>
                         </div>
                         <button 
                           onClick={handleCloseProposal}
                           disabled={!formData.letterIssued} 
                           className={`w-full py-2 mt-2 rounded text-white text-sm ${!formData.letterIssued ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                         >
                            <Lock className="w-3 h-3 inline mr-1" /> Close Proposal
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* Standard Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
             {canEdit && !isApproved && (
                <>
                  <button onClick={handleSaveDraft} className="px-4 py-2 border rounded text-slate-700 hover:bg-slate-50">Save Draft</button>
                  <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Submit Proposal</button>
                </>
             )}
             {canApprove && (
                <>
                  <button onClick={() => handleWorkflowAction('Reject')} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center"><XCircle className="w-4 h-4 mr-1"/> Reject</button>
                  <button onClick={() => handleWorkflowAction('Approve')} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"><CheckCircle className="w-4 h-4 mr-1"/> Approve</button>
                </>
             )}
          </div>
       </div>
    </div>
  );
};
