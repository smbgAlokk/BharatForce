
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole, ProposalStatus, ApprovalStage } from '../../types';
import { Plus, Search, Eye, Edit2, CheckCircle, XCircle, Clock } from 'lucide-react';

export const PromotionProposals: React.FC = () => {
  const navigate = useNavigate();
  const { piProposals, appraisalCycles, employees, currentTenant, userRole, currentUser, approvePIProposal, rejectPIProposal } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'Action' | 'All'>('Action');

  // Filter Logic
  const myProposals = piProposals.filter(p => p.companyId === currentTenant?.id);

  // Proposals needing current user's action
  const pendingActionProposals = myProposals.filter(p => {
     // If Final/Approved/Rejected, no action
     if (p.status === ProposalStatus.APPROVED || p.status === ProposalStatus.REJECTED) return false;

     if (userRole === UserRole.MANAGER) {
        // Manager acts when stage is Manager (Submitted) AND they are the initiator/manager
        return p.approvalStage === ApprovalStage.MANAGER && p.managerId === currentUser.employeeId;
     }
     if (userRole === UserRole.COMPANY_ADMIN) {
        // HR acts when stage is HR
        // Also HR often acts as Management in this simplified roleset, or sees all
        return p.approvalStage === ApprovalStage.HR || p.approvalStage === ApprovalStage.MANAGEMENT;
     }
     return false;
  });

  const filteredList = activeTab === 'Action' ? pendingActionProposals : myProposals;

  const filteredByName = filteredList.filter(p => {
     const emp = employees.find(e => e.id === p.employeeId);
     const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : '';
     return name.includes(searchTerm.toLowerCase());
  });

  const getEmpName = (id: string) => {
     const e = employees.find(em => em.id === id);
     return e ? `${e.firstName} ${e.lastName}` : 'Unknown';
  };

  const getCycleName = (id: string) => appraisalCycles.find(c => c.id === id)?.name || '-';

  const handleApprove = (id: string) => {
     const comments = prompt("Approval Remarks (Optional):") || '';
     approvePIProposal(id, comments);
  };

  const handleReject = (id: string) => {
      const comments = prompt("Rejection Reason:") || '';
      if (comments) rejectPIProposal(id, comments);
  };

  // Can the current user approve/reject this specific proposal row?
  const canAct = (p: any) => {
     if (userRole === UserRole.MANAGER && p.approvalStage === ApprovalStage.MANAGER && p.managerId === currentUser.employeeId) return true;
     if (userRole === UserRole.COMPANY_ADMIN && (p.approvalStage === ApprovalStage.HR || p.approvalStage === ApprovalStage.MANAGEMENT)) return true;
     return false;
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Promotion & Increment Proposals</h2>
             <p className="text-sm text-slate-500">Manage career progression requests.</p>
          </div>
          <div className="flex gap-2">
             <div className="relative">
                <input 
                  type="text" 
                  className="pl-8 pr-3 py-2 border border-slate-300 rounded-md text-sm" 
                  placeholder="Search Employee..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
             </div>
             {(userRole === UserRole.MANAGER || userRole === UserRole.COMPANY_ADMIN) && (
                <button onClick={() => navigate('new')} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                   <Plus className="h-4 w-4 mr-2" /> New Proposal
                </button>
             )}
          </div>
       </div>

       <div className="flex space-x-4 border-b border-slate-200">
          <button 
             onClick={() => setActiveTab('Action')}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Action' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
             Pending My Action ({pendingActionProposals.length})
          </button>
          <button 
             onClick={() => setActiveTab('All')}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'All' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
             All Proposals
          </button>
       </div>

       <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Proposed Inc %</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Current Stage</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {filteredByName.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No proposals found.</td></tr>
                ) : (
                   filteredByName.map(prop => (
                      <tr key={prop.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-900">{getEmpName(prop.employeeId)}</div>
                            <div className="text-xs text-slate-500">{getCycleName(prop.appraisalCycleId)}</div>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-500">{prop.type}</td>
                         <td className="px-6 py-4 text-sm font-bold text-slate-700">{prop.incrementPercentage?.toFixed(2)}%</td>
                         <td className="px-6 py-4 text-sm text-slate-500">
                            <div className="flex items-center">
                               <Clock className="w-3 h-3 mr-1" />
                               {prop.approvalStage}
                            </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium border 
                               ${prop.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : 
                                 prop.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
                                 prop.status === 'Submitted' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                               {prop.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right text-sm font-medium flex justify-end items-center gap-2">
                            <button onClick={() => navigate(prop.id)} className="text-slate-500 hover:text-indigo-600">
                               {prop.status === 'Draft' ? <Edit2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            {canAct(prop) && (
                               <>
                                  <button onClick={() => handleApprove(prop.id)} className="text-green-600 hover:text-green-800" title="Approve">
                                     <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleReject(prop.id)} className="text-red-600 hover:text-red-800" title="Reject">
                                     <XCircle className="w-4 h-4" />
                                  </button>
                               </>
                            )}
                         </td>
                      </tr>
                   ))
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
};
