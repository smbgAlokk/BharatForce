
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeavePolicyMapping, MappingLevel, UserRole } from '../../types';
import { Plus, Edit2, Calendar, Shield, Info } from 'lucide-react';

export const LeavePolicyMappings: React.FC = () => {
  const { leavePolicyMappings, leavePolicies, holidayCalendars, employees, designations, departments, currentTenant, addLeavePolicyMapping, updateLeavePolicyMapping, userRole, currentUser } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LeavePolicyMapping | null>(null);
  const [formData, setFormData] = useState<Partial<LeavePolicyMapping>>({ 
     isActive: true, 
     level: 'Department',
     effectiveFrom: new Date().toISOString().split('T')[0]
  });

  const myMappings = leavePolicyMappings.filter(m => m.companyId === currentTenant?.id);
  const myPolicies = leavePolicies.filter(p => p.companyId === currentTenant?.id && p.status === 'Active');
  const myCalendars = holidayCalendars.filter(c => c.companyId === currentTenant?.id && c.isActive);
  
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleOpenModal = (item?: LeavePolicyMapping) => {
    if (isReadOnly) return;
    setEditingItem(item || null);
    if (item) {
       setFormData(item);
    } else {
       setFormData({ 
          isActive: true, 
          level: 'Department',
          effectiveFrom: new Date().toISOString().split('T')[0]
       });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !formData.policyId || !formData.calendarId) return;
    // For levels other than DefaultCompany, entityId is required
    if (formData.level !== 'DefaultCompany' && !formData.entityId) return;

    const now = new Date().toISOString();
    const base = {
       ...formData as LeavePolicyMapping,
       companyId: currentTenant.id,
       updatedAt: now,
       updatedBy: currentUser.name
    };

    if (editingItem) {
       updateLeavePolicyMapping(base);
    } else {
       addLeavePolicyMapping({
          ...base,
          id: `lpm-${Date.now()}`,
          createdAt: now,
          createdBy: currentUser.name
       });
    }
    setIsModalOpen(false);
  };

  const getEntityName = (level: string, id?: string) => {
     if (!id) return 'All Company';
     if (level === 'Employee') {
        const e = employees.find(emp => emp.id === id);
        return e ? `${e.firstName} ${e.lastName}` : id;
     }
     if (level === 'Designation') return designations.find(d => d.id === id)?.name || id;
     if (level === 'Department') return departments.find(d => d.id === id)?.name || id;
     return id;
  };

  const getPolicyName = (id: string) => myPolicies.find(p => p.id === id)?.name || 'Unknown Policy';
  const getCalendarName = (id: string) => myCalendars.find(c => c.id === id)?.name || 'Unknown Calendar';

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Policy Mappings</h2>
             <p className="text-sm text-slate-500">Assign leave policies and holiday calendars to employees.</p>
          </div>
          {!isReadOnly && (
             <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> Add Mapping
             </button>
          )}
       </div>

       <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex items-start">
          <Info className="w-5 h-5 text-indigo-600 mr-3 mt-0.5" />
          <div className="text-sm text-indigo-800">
             <strong className="block mb-1">Priority Order:</strong>
             1. Employee Level (Highest) &rarr; 2. Designation &rarr; 3. Department &rarr; 4. Company Default (Lowest).
             <br/>System will pick the highest priority active mapping for each employee.
          </div>
       </div>

       <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mapping Level</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Target Entity</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Assigned Policy & Calendar</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Effective From</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {myMappings.length === 0 ? (
                   <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No mappings found.</td></tr>
                ) : (
                   myMappings.sort((a,b) => a.level.localeCompare(b.level)).map(map => (
                      <tr key={map.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 text-sm text-slate-500">{map.level}</td>
                         <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {getEntityName(map.level, map.entityId)}
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-600">
                            <div className="font-medium text-indigo-600">{getPolicyName(map.policyId)}</div>
                            <div className="text-xs text-slate-500">{getCalendarName(map.calendarId)}</div>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-500">{new Date(map.effectiveFrom).toLocaleDateString()}</td>
                         <td className="px-6 py-4 text-right">
                            {!isReadOnly && (
                               <button onClick={() => handleOpenModal(map)} className="text-indigo-600 hover:text-indigo-900">
                                  <Edit2 className="w-4 h-4" />
                               </button>
                            )}
                         </td>
                      </tr>
                   ))
                )}
             </tbody>
          </table>
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Mapping' : 'New Mapping'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Mapping Level</label>
                      <select className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as any, entityId: ''})}
                      >
                         <option value="DefaultCompany">Default Company</option>
                         <option value="Department">Department</option>
                         <option value="Designation">Designation</option>
                         <option value="Employee">Employee</option>
                      </select>
                   </div>
                   
                   {formData.level !== 'DefaultCompany' && (
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Select Target</label>
                         <select required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.entityId || ''} onChange={e => setFormData({...formData, entityId: e.target.value})}
                         >
                            <option value="">-- Select --</option>
                            {formData.level === 'Department' && departments.filter(d => d.companyId === currentTenant?.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            {formData.level === 'Designation' && designations.filter(d => d.companyId === currentTenant?.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            {formData.level === 'Employee' && employees.filter(e => e.companyId === currentTenant?.id && e.status === 'Active').map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                         </select>
                      </div>
                   )}

                   <div className="border-t pt-4 mt-4 space-y-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Leave Policy</label>
                         <select required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.policyId || ''} onChange={e => setFormData({...formData, policyId: e.target.value})}
                         >
                            <option value="">Select Policy</option>
                            {myPolicies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Holiday Calendar</label>
                         <select required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.calendarId || ''} onChange={e => setFormData({...formData, calendarId: e.target.value})}
                         >
                            <option value="">Select Calendar</option>
                            {myCalendars.map(c => <option key={c.id} value={c.id}>{c.name} ({c.year})</option>)}
                         </select>
                      </div>
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-slate-700">Effective From</label>
                      <input type="date" required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.effectiveFrom || ''} onChange={e => setFormData({...formData, effectiveFrom: e.target.value})} />
                   </div>

                   <div className="flex items-center mt-2">
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2 rounded text-indigo-600"/>
                         Active
                      </label>
                   </div>

                   <div className="flex justify-end space-x-3 mt-6">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Mapping</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};
