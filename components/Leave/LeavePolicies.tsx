
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeavePolicy, UserRole } from '../../types';
import { Plus, Edit2, Calendar } from 'lucide-react';
import { LeavePolicyEditor } from './LeavePolicyEditor';

export const LeavePolicies: React.FC = () => {
  const { leavePolicies, currentTenant, userRole } = useApp();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null);

  const myPolicies = leavePolicies.filter(p => p.companyId === currentTenant?.id);
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleCreate = () => {
    setEditingPolicy(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (policy: LeavePolicy) => {
    setEditingPolicy(policy);
    setIsEditorOpen(true);
  };

  if (isEditorOpen) {
     return <LeavePolicyEditor policy={editingPolicy} onBack={() => setIsEditorOpen(false)} />;
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Leave Policies</h2>
             <p className="text-sm text-slate-500">Configure entitlement and accrual rules per policy group.</p>
          </div>
          {!isReadOnly && (
             <button onClick={handleCreate} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> Create Policy
             </button>
          )}
       </div>

       <div className="grid grid-cols-1 gap-4">
          {myPolicies.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">No leave policies found.</div>
          ) : (
             myPolicies.map(policy => (
                <div key={policy.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                      <div className="flex items-center gap-3">
                         <h3 className="text-lg font-bold text-slate-900">{policy.name}</h3>
                         <span className={`px-2 py-0.5 text-xs rounded-full border ${policy.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {policy.status}
                         </span>
                      </div>
                      {policy.description && <p className="text-sm text-slate-500 mt-1">{policy.description}</p>}
                      <div className="flex items-center text-sm text-slate-500 mt-2 gap-4">
                         <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> Effective: {new Date(policy.effectiveFrom).toLocaleDateString()}</span>
                         <span className="text-xs bg-slate-100 px-2 py-1 rounded">{policy.policyLines.length} Leave Types Configured</span>
                      </div>
                   </div>

                   {!isReadOnly && (
                      <button onClick={() => handleEdit(policy)} className="text-indigo-600 hover:text-indigo-900 flex items-center text-sm font-medium">
                         <Edit2 className="w-4 h-4 mr-2" /> Configure Rules
                      </button>
                   )}
                </div>
             ))
          )}
       </div>
    </div>
  );
};
