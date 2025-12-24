
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendancePolicy, UserRole } from '../../types';
import { Plus, Edit2, Check } from 'lucide-react';

export const PolicyMaster: React.FC = () => {
  const { attendancePolicies, currentTenant, addAttendancePolicy, updateAttendancePolicy, userRole, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AttendancePolicy | null>(null);
  const [activeTab, setActiveTab] = useState<'General' | 'Overtime' | 'Exceptions'>('General');
  
  const [formData, setFormData] = useState<Partial<AttendancePolicy>>({ 
    isActive: true, 
    allowManualMarking: true,
    minHoursFullDay: '08:00',
    minHoursHalfDay: '04:00',
    graceLateMins: 15,
    maxLateMarksPerMonth: 3,
    overtimeSettings: { isApplicable: false, minOTMinutesPerDay: 30, includeBreaks: false },
    exceptionRules: {
       lateComing: { enabled: true, graceMinutes: 15, thresholdMinutes: 60, maxLateMarksPerMonth: 3 },
       earlyExit: { enabled: true, graceMinutes: 15, thresholdMinutes: 60 },
       shortHours: { enabled: true, minFullDayMinutes: 480, minHalfDayMinutes: 240 }
    }
  });

  const myPolicies = attendancePolicies.filter(p => p.companyId === currentTenant?.id);
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleOpenModal = (item?: AttendancePolicy) => {
    if (isReadOnly) return;
    setEditingItem(item || null);
    setActiveTab('General');
    if (item) {
       // Ensure nested objects exist
       const cleanItem = JSON.parse(JSON.stringify(item));
       if (!cleanItem.overtimeSettings) cleanItem.overtimeSettings = { isApplicable: false, minOTMinutesPerDay: 30 };
       if (!cleanItem.exceptionRules) cleanItem.exceptionRules = { 
          lateComing: { enabled: true, graceMinutes: 15 }, 
          earlyExit: { enabled: true, graceMinutes: 15 },
          shortHours: { enabled: true, minFullDayMinutes: 480 }
       };
       setFormData(cleanItem);
    } else {
       setFormData({ 
          isActive: true, 
          allowManualMarking: true,
          minHoursFullDay: '08:00',
          minHoursHalfDay: '04:00',
          graceLateMins: 15,
          maxLateMarksPerMonth: 3,
          overtimeSettings: { isApplicable: false, minOTMinutesPerDay: 30, includeBreaks: false },
          exceptionRules: {
            lateComing: { enabled: true, graceMinutes: 15, thresholdMinutes: 60, maxLateMarksPerMonth: 3 },
            earlyExit: { enabled: true, graceMinutes: 15, thresholdMinutes: 60 },
            shortHours: { enabled: true, minFullDayMinutes: 480, minHalfDayMinutes: 240 }
          }
       });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !formData.name) return;

    const now = new Date().toISOString();
    const base = {
       ...formData as AttendancePolicy,
       companyId: currentTenant.id,
       updatedAt: now,
       updatedBy: currentUser.name
    };

    if (editingItem) {
       updateAttendancePolicy(base);
    } else {
       addAttendancePolicy({
          ...base,
          id: `pol-${Date.now()}`,
          createdAt: now,
          createdBy: currentUser.name
       });
    }
    setIsModalOpen(false);
  };

  // Helper to update nested states
  const updateOT = (field: string, value: any) => {
     setFormData(prev => ({ ...prev, overtimeSettings: { ...prev.overtimeSettings, [field]: value } } as any));
  };
  const updateException = (type: 'lateComing' | 'earlyExit' | 'shortHours', field: string, value: any) => {
     setFormData(prev => ({ 
        ...prev, 
        exceptionRules: { 
           ...prev.exceptionRules, 
           [type]: { ...(prev.exceptionRules as any)[type], [field]: value } 
        } 
     } as any));
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Attendance Policies</h2>
             <p className="text-sm text-slate-500">Configure late marks, OT rules, and exceptions.</p>
          </div>
          {!isReadOnly && (
             <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> Add Policy
             </button>
          )}
       </div>

       <div className="grid grid-cols-1 gap-4">
          {myPolicies.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">No policies found.</div>
          ) : (
             myPolicies.map(pol => (
                <div key={pol.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex justify-between items-center">
                   <div>
                      <div className="flex items-center gap-3">
                         <span className="font-bold text-slate-900">{pol.name}</span>
                         <span className={`px-2 py-0.5 text-xs rounded-full ${pol.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {pol.isActive ? 'Active' : 'Inactive'}
                         </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{pol.description}</p>
                      <div className="text-xs text-slate-400 mt-2 flex gap-4">
                         <span>Full Day: {pol.minHoursFullDay} hrs</span>
                         <span>Grace: {pol.graceLateMins} mins</span>
                         <span>OT: {pol.overtimeSettings?.isApplicable ? 'Yes' : 'No'}</span>
                      </div>
                   </div>
                   {!isReadOnly && (
                      <button onClick={() => handleOpenModal(pol)} className="text-indigo-600 hover:text-indigo-900">
                         <Edit2 className="w-5 h-5" />
                      </button>
                   )}
                </div>
             ))
          )}
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-0 overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                   <h3 className="text-lg font-bold">{editingItem ? 'Edit Policy' : 'Create Policy'}</h3>
                   <div className="flex space-x-2">
                      <button onClick={() => setActiveTab('General')} className={`px-3 py-1 text-sm rounded ${activeTab === 'General' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-200'}`}>General</button>
                      <button onClick={() => setActiveTab('Overtime')} className={`px-3 py-1 text-sm rounded ${activeTab === 'Overtime' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-200'}`}>Overtime</button>
                      <button onClick={() => setActiveTab('Exceptions')} className={`px-3 py-1 text-sm rounded ${activeTab === 'Exceptions' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-200'}`}>Exceptions</button>
                   </div>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                   <form id="policyForm" onSubmit={handleSave} className="space-y-6">
                      {activeTab === 'General' && (
                         <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                               <div className="col-span-2">
                                  <label className="block text-sm font-medium text-slate-700">Policy Name</label>
                                  <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                                     value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                               </div>
                               <div className="col-span-2">
                                  <label className="block text-sm font-medium text-slate-700">Description</label>
                                  <textarea rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                                     value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                               </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <div>
                                  <label className="block text-sm font-medium text-slate-700">Min Hours (Full Day)</label>
                                  <input type="time" required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                                     value={formData.minHoursFullDay} onChange={e => setFormData({...formData, minHoursFullDay: e.target.value})} />
                               </div>
                               <div>
                                  <label className="block text-sm font-medium text-slate-700">Min Hours (Half Day)</label>
                                  <input type="time" required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                                     value={formData.minHoursHalfDay} onChange={e => setFormData({...formData, minHoursHalfDay: e.target.value})} />
                               </div>
                            </div>
                            <div className="flex items-center gap-6 mt-4">
                               <label className="flex items-center text-sm text-slate-700">
                                  <input type="checkbox" checked={formData.allowManualMarking} onChange={e => setFormData({...formData, allowManualMarking: e.target.checked})} className="mr-2 rounded text-indigo-600"/>
                                  Allow Manual Marking
                               </label>
                               <label className="flex items-center text-sm text-slate-700">
                                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2 rounded text-indigo-600"/>
                                  Active
                               </label>
                            </div>
                         </div>
                      )}

                      {activeTab === 'Overtime' && (
                         <div className="space-y-4">
                             <div className="flex items-center mb-4">
                                <input type="checkbox" checked={formData.overtimeSettings?.isApplicable} onChange={e => updateOT('isApplicable', e.target.checked)} className="mr-2 h-5 w-5 text-indigo-600" />
                                <span className="font-bold text-slate-900">Enable Overtime Calculation</span>
                             </div>
                             {formData.overtimeSettings?.isApplicable && (
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded border border-slate-200">
                                   <div>
                                      <label className="block text-sm font-medium text-slate-700">Min OT Minutes (Daily)</label>
                                      <input type="number" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                                         value={formData.overtimeSettings?.minOTMinutesPerDay} onChange={e => updateOT('minOTMinutesPerDay', parseInt(e.target.value))} />
                                   </div>
                                   <div>
                                      <label className="block text-sm font-medium text-slate-700">Max OT Minutes (Daily)</label>
                                      <input type="number" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                                         value={formData.overtimeSettings?.maxOTMinutesPerDay} onChange={e => updateOT('maxOTMinutesPerDay', parseInt(e.target.value))} />
                                   </div>
                                   <div className="col-span-2">
                                      <label className="flex items-center text-sm text-slate-700">
                                         <input type="checkbox" checked={formData.overtimeSettings?.includeBreaks} onChange={e => updateOT('includeBreaks', e.target.checked)} className="mr-2 rounded text-indigo-600"/>
                                         Include Break Hours in Calculation?
                                      </label>
                                   </div>
                                </div>
                             )}
                         </div>
                      )}

                      {activeTab === 'Exceptions' && (
                         <div className="space-y-6">
                            {/* Late Coming */}
                            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                               <h4 className="font-bold text-yellow-900 text-sm mb-2">Late Coming</h4>
                               <div className="grid grid-cols-3 gap-3">
                                  <div>
                                     <label className="block text-xs font-medium text-slate-700">Grace Mins</label>
                                     <input type="number" className="w-full border border-slate-300 rounded p-1 text-sm" 
                                        value={formData.exceptionRules?.lateComing.graceMinutes} 
                                        onChange={e => updateException('lateComing', 'graceMinutes', parseInt(e.target.value))} />
                                  </div>
                                  <div>
                                     <label className="block text-xs font-medium text-slate-700">Max Late/Month</label>
                                     <input type="number" className="w-full border border-slate-300 rounded p-1 text-sm" 
                                        value={formData.exceptionRules?.lateComing.maxLateMarksPerMonth} 
                                        onChange={e => updateException('lateComing', 'maxLateMarksPerMonth', parseInt(e.target.value))} />
                                  </div>
                                  <div className="flex items-end">
                                     <label className="flex items-center text-xs text-slate-700">
                                        <input type="checkbox" checked={formData.exceptionRules?.lateComing.enabled} 
                                           onChange={e => updateException('lateComing', 'enabled', e.target.checked)} className="mr-1 rounded text-indigo-600"/>
                                        Enabled
                                     </label>
                                  </div>
                               </div>
                            </div>

                            {/* Short Hours */}
                            <div className="bg-red-50 p-3 rounded border border-red-200">
                               <h4 className="font-bold text-red-900 text-sm mb-2">Short Working Hours</h4>
                               <div className="grid grid-cols-2 gap-3">
                                  <div>
                                     <label className="block text-xs font-medium text-slate-700">Min for Full Day (Mins)</label>
                                     <input type="number" className="w-full border border-slate-300 rounded p-1 text-sm" 
                                        value={formData.exceptionRules?.shortHours.minFullDayMinutes} 
                                        onChange={e => updateException('shortHours', 'minFullDayMinutes', parseInt(e.target.value))} />
                                  </div>
                                  <div>
                                     <label className="block text-xs font-medium text-slate-700">Min for Half Day (Mins)</label>
                                     <input type="number" className="w-full border border-slate-300 rounded p-1 text-sm" 
                                        value={formData.exceptionRules?.shortHours.minHalfDayMinutes} 
                                        onChange={e => updateException('shortHours', 'minHalfDayMinutes', parseInt(e.target.value))} />
                                  </div>
                               </div>
                            </div>
                         </div>
                      )}
                   </form>
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3">
                   <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-white">Cancel</button>
                   <button type="submit" form="policyForm" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Policy</button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
