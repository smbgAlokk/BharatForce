
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LeavePolicy, LeavePolicyLine, AccrualFrequency, AccrualMode, UserRole } from '../../types';
import { ArrowLeft, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  policy: LeavePolicy | null;
  onBack: () => void;
}

export const LeavePolicyEditor: React.FC<Props> = ({ policy, onBack }) => {
  const { leaveTypes, currentTenant, addLeavePolicy, updateLeavePolicy, currentUser, userRole } = useApp();
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const [formData, setFormData] = useState<Partial<LeavePolicy>>({
     status: 'Active',
     policyLines: [],
     effectiveFrom: new Date().toISOString().split('T')[0]
  });

  const [expandedLine, setExpandedLine] = useState<string | null>(null);

  useEffect(() => {
     if (policy) {
        setFormData(policy);
     } else {
        // New Policy: Auto-populate lines for active leave types
        const initialLines: LeavePolicyLine[] = leaveTypes
           .filter(lt => lt.companyId === currentTenant?.id && lt.isActive)
           .map(lt => ({
              id: `line-${Date.now()}-${lt.id}`,
              leaveTypeId: lt.id,
              entitlement: 0,
              accrualFrequency: 'Yearly',
              accrualMode: 'Start of Period',
              carryForwardAllowed: false,
              encashmentAllowed: false,
              allowNegativeBalance: false,
              halfDayAllowed: true
           }));
        
        setFormData(prev => ({ ...prev, policyLines: initialLines }));
     }
  }, [policy, leaveTypes, currentTenant]);

  const handleHeaderChange = (field: keyof LeavePolicy, value: any) => {
     setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLineChange = (lineId: string, field: keyof LeavePolicyLine, value: any) => {
     setFormData(prev => ({
        ...prev,
        policyLines: prev.policyLines?.map(l => l.id === lineId ? { ...l, [field]: value } : l)
     }));
  };

  const handleSave = (e: React.FormEvent) => {
     e.preventDefault();
     if (!currentTenant || !formData.name) return;

     const now = new Date().toISOString();
     const base = {
        ...formData as LeavePolicy,
        companyId: currentTenant.id,
        updatedAt: now,
        updatedBy: currentUser.name
     };

     if (policy) {
        updateLeavePolicy(base);
     } else {
        addLeavePolicy({
           ...base,
           id: `lp-${Date.now()}`,
           createdAt: now,
           createdBy: currentUser.name
        });
     }
     onBack();
  };

  const getLeaveTypeName = (id: string) => leaveTypes.find(t => t.id === id)?.name || 'Unknown';
  const getLeaveTypeCode = (id: string) => leaveTypes.find(t => t.id === id)?.code || '-';

  const toggleExpand = (lineId: string) => {
     setExpandedLine(expandedLine === lineId ? null : lineId);
  };

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center text-sm text-slate-500 hover:text-slate-700">
             <ArrowLeft className="w-4 h-4 mr-1" /> Back to Policies
          </button>
          {!isReadOnly && (
             <button onClick={handleSave} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">
                <Save className="w-4 h-4 mr-2" /> Save Policy
             </button>
          )}
       </div>

       <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Policy Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Policy Name</label>
                <input type="text" disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                   value={formData.name || ''} onChange={e => handleHeaderChange('name', e.target.value)} />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Status</label>
                <select disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                   value={formData.status} onChange={e => handleHeaderChange('status', e.target.value)}
                >
                   <option value="Active">Active</option>
                   <option value="Inactive">Inactive</option>
                </select>
             </div>
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea rows={2} disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                   value={formData.description || ''} onChange={e => handleHeaderChange('description', e.target.value)} />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Effective From</label>
                <input type="date" disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                   value={formData.effectiveFrom} onChange={e => handleHeaderChange('effectiveFrom', e.target.value)} />
             </div>
          </div>
       </div>

       <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Leave Rules Configuration</h3>
          {formData.policyLines?.map((line) => (
             <div key={line.id} className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
                <div 
                  className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => toggleExpand(line.id)}
                >
                   <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                         {getLeaveTypeCode(line.leaveTypeId)}
                      </div>
                      <div>
                         <span className="font-medium text-slate-900">{getLeaveTypeName(line.leaveTypeId)}</span>
                         <div className="text-xs text-slate-500">
                            Entitlement: {line.entitlement} • Freq: {line.accrualFrequency}
                         </div>
                      </div>
                   </div>
                   <div className="text-slate-400">
                      {expandedLine === line.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                   </div>
                </div>
                
                {expandedLine === line.id && (
                   <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                      <div>
                         <label className="block font-medium text-slate-700 mb-1">Annual Entitlement</label>
                         <input type="number" min="0" disabled={isReadOnly} className="w-full border border-slate-300 rounded-md p-1.5"
                            value={line.entitlement} onChange={e => handleLineChange(line.id, 'entitlement', parseFloat(e.target.value))} />
                      </div>
                      <div>
                         <label className="block font-medium text-slate-700 mb-1">Accrual Frequency</label>
                         <select disabled={isReadOnly} className="w-full border border-slate-300 rounded-md p-1.5"
                            value={line.accrualFrequency} onChange={e => handleLineChange(line.id, 'accrualFrequency', e.target.value)}
                         >
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Yearly">Yearly</option>
                            <option value="On DOJ Anniversary">On DOJ Anniversary</option>
                            <option value="Lump Sum">Lump Sum</option>
                         </select>
                      </div>
                      <div>
                         <label className="block font-medium text-slate-700 mb-1">Accrual Mode</label>
                         <select disabled={isReadOnly} className="w-full border border-slate-300 rounded-md p-1.5"
                            value={line.accrualMode} onChange={e => handleLineChange(line.id, 'accrualMode', e.target.value)}
                         >
                            <option value="Start of Period">Start of Period</option>
                            <option value="End of Period">End of Period</option>
                            <option value="Pro-rated by DOJ">Pro-rated by DOJ</option>
                         </select>
                      </div>
                      
                      <div className="md:col-span-3 border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="space-y-3">
                            <label className="flex items-center">
                               <input type="checkbox" disabled={isReadOnly} checked={line.carryForwardAllowed} onChange={e => handleLineChange(line.id, 'carryForwardAllowed', e.target.checked)} className="mr-2 rounded text-indigo-600"/>
                               Carry Forward Allowed?
                            </label>
                            {line.carryForwardAllowed && (
                               <div>
                                  <label className="block text-xs font-medium text-slate-500 mb-1">Max Carry Forward Days</label>
                                  <input type="number" min="0" disabled={isReadOnly} className="w-full border border-slate-300 rounded-md p-1.5"
                                     value={line.maxCarryForwardDays || 0} onChange={e => handleLineChange(line.id, 'maxCarryForwardDays', parseFloat(e.target.value))} />
                               </div>
                            )}
                         </div>

                         <div className="space-y-3">
                            <label className="flex items-center">
                               <input type="checkbox" disabled={isReadOnly} checked={line.encashmentAllowed} onChange={e => handleLineChange(line.id, 'encashmentAllowed', e.target.checked)} className="mr-2 rounded text-indigo-600"/>
                               Encashment Allowed?
                            </label>
                            {line.encashmentAllowed && (
                               <div>
                                  <label className="block text-xs font-medium text-slate-500 mb-1">Max Encashable Days</label>
                                  <input type="number" min="0" disabled={isReadOnly} className="w-full border border-slate-300 rounded-md p-1.5"
                                     value={line.encashmentMaxDays || 0} onChange={e => handleLineChange(line.id, 'encashmentMaxDays', parseFloat(e.target.value))} />
                               </div>
                            )}
                         </div>

                         <div className="space-y-3">
                             <label className="flex items-center">
                               <input type="checkbox" disabled={isReadOnly} checked={line.allowNegativeBalance} onChange={e => handleLineChange(line.id, 'allowNegativeBalance', e.target.checked)} className="mr-2 rounded text-indigo-600"/>
                               Allow Negative Balance?
                            </label>
                            <label className="flex items-center">
                               <input type="checkbox" disabled={isReadOnly} checked={line.halfDayAllowed} onChange={e => handleLineChange(line.id, 'halfDayAllowed', e.target.checked)} className="mr-2 rounded text-indigo-600"/>
                               Half-Day Allowed?
                            </label>
                         </div>
                      </div>
                   </div>
                )}
             </div>
          ))}
       </div>
    </div>
  );
};
