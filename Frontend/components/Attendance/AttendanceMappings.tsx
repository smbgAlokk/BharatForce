import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceMapping, MappingLevel, UserRole } from '../../types';
import { Plus, Edit2, Trash2, ArrowRight } from 'lucide-react';

export const AttendanceMappings: React.FC = () => {
  const { 
    attendanceMappings, attendancePolicies, shifts, weeklyOffPatterns,
    employees, designations, departments, branches,
    currentTenant, addAttendanceMapping, updateAttendanceMapping, 
    userRole, currentUser 
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AttendanceMapping | null>(null);
  const [formData, setFormData] = useState<Partial<AttendanceMapping>>({ 
    isActive: true, 
    level: 'Department',
    effectiveFrom: new Date().toISOString().split('T')[0]
  });

  const myMappings = attendanceMappings.filter(m => m.companyId === currentTenant?.id);
  const myPolicies = attendancePolicies.filter(p => p.companyId === currentTenant?.id);
  const myShifts = shifts.filter(s => s.companyId === currentTenant?.id);
  const myPatterns = weeklyOffPatterns.filter(w => w.companyId === currentTenant?.id);

  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleOpenModal = (item?: AttendanceMapping) => {
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
    if (!currentTenant || !formData.entityId) return;

    const now = new Date().toISOString();
    const base = {
       ...formData as AttendanceMapping,
       companyId: currentTenant.id,
       updatedAt: now,
       updatedBy: currentUser.name
    };

    if (editingItem) {
       updateAttendanceMapping(base);
    } else {
       addAttendanceMapping({
          ...base,
          id: `amap-${Date.now()}`,
          createdAt: now,
          createdBy: currentUser.name
       });
    }
    setIsModalOpen(false);
  };

  const getEntityName = (level: MappingLevel, id: string) => {
     if (level === 'Employee') {
        const e = employees.find(emp => emp.id === id);
        return e ? `${e.firstName} ${e.lastName}` : id;
     }
     if (level === 'Designation') return designations.find(d => d.id === id)?.name || id;
     if (level === 'Department') return departments.find(d => d.id === id)?.name || id;
     return id;
  };

  const getPolicyName = (id: string) => myPolicies.find(p => p.id === id)?.name || '-';
  const getShiftName = (id: string) => myShifts.find(s => s.id === id)?.name || '-';
  const getPatternName = (id: string) => myPatterns.find(w => w.id === id)?.name || '-';

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Policy Mappings</h2>
             <p className="text-sm text-slate-500">Assign policies to employees or groups.</p>
          </div>
          {!isReadOnly && (
             <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> Add Mapping
             </button>
          )}
       </div>

       <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Level</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Entity</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Policy & Shift</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Effective</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {myMappings.length === 0 ? (
                   <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No mappings found.</td></tr>
                ) : (
                   myMappings.map(map => (
                      <tr key={map.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 text-sm text-slate-500">{map.level}</td>
                         <td className="px-6 py-4 text-sm font-medium text-slate-900">{getEntityName(map.level, map.entityId)}</td>
                         <td className="px-6 py-4 text-sm text-slate-600 space-y-1">
                            <div><span className="text-xs uppercase text-slate-400">Pol:</span> {getPolicyName(map.policyId)}</div>
                            <div><span className="text-xs uppercase text-slate-400">Shf:</span> {getShiftName(map.shiftId)}</div>
                            <div><span className="text-xs uppercase text-slate-400">Off:</span> {getPatternName(map.weeklyOffPatternId)}</div>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-500">{map.effectiveFrom}</td>
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
                         value={formData.level} onChange={e => setFormData({...formData, level: e.target.value as MappingLevel, entityId: ''})}
                      >
                         <option value="Department">Department</option>
                         <option value="Designation">Designation</option>
                         <option value="Employee">Employee</option>
                      </select>
                   </div>
                   
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Select Entity</label>
                      <select className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.entityId || ''} onChange={e => setFormData({...formData, entityId: e.target.value})}
                      >
                         <option value="">-- Select --</option>
                         {formData.level === 'Department' && departments.filter(d => d.companyId === currentTenant?.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                         {formData.level === 'Designation' && designations.filter(d => d.companyId === currentTenant?.id).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                         {formData.level === 'Employee' && employees.filter(e => e.companyId === currentTenant?.id).map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                      </select>
                   </div>

                   <div className="border-t pt-4 mt-4 space-y-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Attendance Policy</label>
                         <select className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.policyId || ''} onChange={e => setFormData({...formData, policyId: e.target.value})}
                         >
                            <option value="">Select Policy</option>
                            {myPolicies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Default Shift</label>
                         <select className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.shiftId || ''} onChange={e => setFormData({...formData, shiftId: e.target.value})}
                         >
                            <option value="">Select Shift</option>
                            {myShifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.startTime}-{s.endTime})</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Weekly Off Pattern</label>
                         <select className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.weeklyOffPatternId || ''} onChange={e => setFormData({...formData, weeklyOffPatternId: e.target.value})}
                         >
                            <option value="">Select Pattern</option>
                            {myPatterns.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                      </div>
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-slate-700">Effective From</label>
                      <input type="date" required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.effectiveFrom || ''} onChange={e => setFormData({...formData, effectiveFrom: e.target.value})} />
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