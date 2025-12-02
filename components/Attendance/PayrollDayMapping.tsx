
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendancePayrollMapping, AttendanceStatus, PayrollDayType, UserRole } from '../../types';
import { Plus, Edit2, Save, X } from 'lucide-react';

const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  'Present', 'Absent', 'Half Day', 'Weekly Off', 'Holiday', 'Leave', 'On Duty', 'Work From Home'
];

const PAYROLL_TYPES: PayrollDayType[] = [
  'Paid_Full', 'Paid_Half', 'LOP_Full', 'LOP_Half', 'Paid_WeeklyOff', 'Paid_Holiday', 'Paid_OnDuty', 'Paid_WFH', 'Custom'
];

export const PayrollDayMapping: React.FC = () => {
  const { attendancePayrollMappings, currentTenant, addPayrollMapping, updatePayrollMapping, userRole, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AttendancePayrollMapping | null>(null);
  const [formData, setFormData] = useState<Partial<AttendancePayrollMapping>>({
    multiplier: 1.0
  });

  const myMappings = attendancePayrollMappings.filter(m => m.companyId === currentTenant?.id);
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleOpenModal = (item?: AttendancePayrollMapping) => {
    if (isReadOnly) return;
    setEditingItem(item || null);
    setFormData(item || { multiplier: 1.0 });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !formData.attendanceStatus || !formData.payrollDayType) return;

    const now = new Date().toISOString();
    const base = {
       ...formData as AttendancePayrollMapping,
       companyId: currentTenant.id,
       updatedAt: now,
       updatedBy: currentUser.name
    };

    if (editingItem) {
       updatePayrollMapping(base);
    } else {
       addPayrollMapping({
          ...base,
          id: `pmap-${Date.now()}`,
          createdAt: now,
          createdBy: currentUser.name
       });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div>
            <h2 className="text-lg font-bold text-slate-900">Payroll Day Mapping</h2>
            <p className="text-sm text-slate-500">Map attendance statuses to payroll day codes and multipliers.</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Attendance Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Payroll Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Multiplier</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Custom Code / Notes</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
               {myMappings.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No mappings defined.</td></tr>
               ) : (
                  myMappings.map(map => (
                     <tr key={map.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{map.attendanceStatus}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{map.payrollDayType}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">{map.multiplier}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{map.customCode || map.notes || '-'}</td>
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
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
               <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Mapping' : 'New Mapping'}</h3>
               <form onSubmit={handleSave} className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700">Attendance Status</label>
                     <select required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                        value={formData.attendanceStatus} onChange={e => setFormData({...formData, attendanceStatus: e.target.value as AttendanceStatus})}
                     >
                        <option value="">Select Status</option>
                        {ATTENDANCE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700">Payroll Day Type</label>
                     <select required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                        value={formData.payrollDayType} onChange={e => setFormData({...formData, payrollDayType: e.target.value as PayrollDayType})}
                     >
                        <option value="">Select Type</option>
                        {PAYROLL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700">Multiplier (Day Count)</label>
                     <input type="number" step="0.1" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                        value={formData.multiplier} onChange={e => setFormData({...formData, multiplier: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700">Custom Code (Optional)</label>
                     <input type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                        placeholder="e.g., LOP_01"
                        value={formData.customCode || ''} onChange={e => setFormData({...formData, customCode: e.target.value})} />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700">Notes</label>
                     <input type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                        value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} />
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
