
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { RequisitionStatus, UserRole } from '../../types';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const RequisitionDetail: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const { jobRequisitions, approveJobRequisition, rejectJobRequisition, userRole, employees, departments, branches } = useApp();
  
  const req = jobRequisitions.find(r => r.id === id);
  const [remarks, setRemarks] = useState('');

  if (!req) return <div>Requisition not found</div>;

  const getEmpName = (id: string) => {
    const e = employees.find(em => em.id === id);
    return e ? `${e.firstName} ${e.lastName}` : id;
  };
  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || '-';
  const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || '-';

  const handleApprove = () => {
    if (window.confirm('Approve this requisition? This will automatically create a Job Position.')) {
       approveJobRequisition(req, remarks || 'Approved');
       navigate('/recruitment/requisitions');
    }
  };

  const handleReject = () => {
    if (!remarks) {
      alert('Please enter remarks for rejection.');
      return;
    }
    if (window.confirm('Reject this requisition?')) {
       rejectJobRequisition(req, remarks);
       navigate('/recruitment/requisitions');
    }
  };

  const canAction = userRole === UserRole.COMPANY_ADMIN && req.status === RequisitionStatus.SUBMITTED;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
       <button onClick={() => navigate('/recruitment/requisitions')} className="flex items-center text-sm text-slate-500 hover:text-slate-700">
         <ArrowLeft className="w-4 h-4 mr-1" /> Back to List
       </button>

       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-start">
             <div>
                <h1 className="text-2xl font-bold text-slate-900">{req.title}</h1>
                <div className="flex items-center space-x-4 mt-1 text-sm text-slate-500">
                   <span className="font-mono bg-slate-100 px-1.5 rounded">{req.requisitionCode}</span>
                   <span>{getDeptName(req.departmentId)}</span>
                   <span>{getBranchName(req.branchId)}</span>
                </div>
             </div>
             <div className="flex flex-col items-end">
                <span className={`px-3 py-1 text-sm font-medium rounded-full 
                   ${req.status === RequisitionStatus.APPROVED ? 'bg-green-100 text-green-800' : 
                     req.status === RequisitionStatus.REJECTED ? 'bg-red-100 text-red-800' : 
                     req.status === RequisitionStatus.SUBMITTED ? 'bg-blue-100 text-blue-800' :
                     'bg-slate-100 text-slate-800'}`}>
                   {req.status}
                </span>
                <span className="text-xs text-slate-400 mt-1">Created: {new Date(req.createdAt).toLocaleDateString()}</span>
             </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="md:col-span-2 space-y-6">
                
                <section>
                   <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">Job Description</h3>
                   <p className="text-slate-600 text-sm whitespace-pre-wrap">{req.jobSummary}</p>
                </section>

                <section>
                   <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">Responsibilities</h3>
                   <p className="text-slate-600 text-sm whitespace-pre-wrap">{req.responsibilities}</p>
                </section>

                 <section>
                   <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">Requirements</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-3 rounded text-sm">
                         <span className="block text-xs text-slate-500 uppercase">Skills</span>
                         <span className="font-medium">{req.requiredSkills}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded text-sm">
                         <span className="block text-xs text-slate-500 uppercase">Experience</span>
                         <span className="font-medium">{req.experienceRange || 'Not specified'}</span>
                      </div>
                       <div className="bg-slate-50 p-3 rounded text-sm">
                         <span className="block text-xs text-slate-500 uppercase">Education</span>
                         <span className="font-medium">{req.educationRequirements || 'Not specified'}</span>
                      </div>
                   </div>
                </section>

             </div>

             <div className="space-y-6">
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                   <h4 className="text-sm font-bold text-indigo-900 mb-3">Hiring Details</h4>
                   <ul className="space-y-3 text-sm">
                      <li className="flex justify-between">
                        <span className="text-indigo-700">Hiring Manager</span>
                        <span className="font-medium text-indigo-900">{getEmpName(req.hiringManagerId)}</span>
                      </li>
                       <li className="flex justify-between">
                        <span className="text-indigo-700">Headcount</span>
                        <span className="font-medium text-indigo-900">{req.requestedHeadcount}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-indigo-700">Type</span>
                        <span className="font-medium text-indigo-900">{req.employmentType}</span>
                      </li>
                       <li className="flex justify-between">
                        <span className="text-indigo-700">Budget</span>
                        <span className="font-medium text-indigo-900">{req.budgetedCtcRange || '-'}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-indigo-700">Target Date</span>
                        <span className="font-medium text-indigo-900">{new Date(req.neededBy).toLocaleDateString()}</span>
                      </li>
                   </ul>
                </div>
                
                {req.status !== RequisitionStatus.DRAFT && (
                   <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h4 className="text-sm font-bold text-slate-900 mb-2">Approval Trail</h4>
                      <div className="text-xs space-y-2">
                         <div>
                            <span className="text-slate-500">Requested By:</span> {req.requestedBy} <br/>
                            <span className="text-slate-400">{new Date(req.requestedOn).toLocaleString()}</span>
                         </div>
                         {req.approvedBy && (
                            <div className="text-green-700">
                               <CheckCircle className="w-3 h-3 inline mr-1" /> Approved by {req.approvedBy} <br/>
                               <span className="text-slate-400">{new Date(req.approvedOn!).toLocaleString()}</span>
                            </div>
                         )}
                         {req.status === RequisitionStatus.REJECTED && (
                            <div className="text-red-700">
                               <XCircle className="w-3 h-3 inline mr-1" /> Rejected <br/>
                               <span className="italic">"{req.approvalRemarks}"</span>
                            </div>
                         )}
                      </div>
                   </div>
                )}

                {/* Actions for HR */}
                {canAction && (
                   <div className="bg-white border border-yellow-200 rounded-lg p-4 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center">
                        <AlertCircle className="w-4 h-4 text-yellow-500 mr-1" /> HR Action
                      </h4>
                      <textarea 
                        className="w-full text-sm border-slate-300 rounded-md mb-3" 
                        rows={2} 
                        placeholder="Enter remarks..."
                        value={remarks}
                        onChange={e => setRemarks(e.target.value)}
                      />
                      <div className="grid grid-cols-2 gap-3">
                         <button onClick={handleReject} className="w-full py-2 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm font-medium hover:bg-red-100">Reject</button>
                         <button onClick={handleApprove} className="w-full py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">Approve</button>
                      </div>
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};
