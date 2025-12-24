import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shift, ShiftType, UserRole } from '../../types';
import { Plus, Edit2, Clock } from 'lucide-react';

export const ShiftMaster: React.FC = () => {
  const { shifts, currentTenant, addShift, updateShift, userRole, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Shift | null>(null);
  const [formData, setFormData] = useState<Partial<Shift>>({ 
    isActive: true, 
    shiftType: 'Regular',
    startTime: '09:00',
    endTime: '18:00',
    breakDurationMins: 60,
    graceLateMins: 15,
    graceEarlyMins: 15
  });

  const myShifts = shifts.filter(s => s.companyId === currentTenant?.id);
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleOpenModal = (item?: Shift) => {
    if (isReadOnly) return;
    setEditingItem(item || null);
    if (item) {
       setFormData(item);
    } else {
       setFormData({ 
          isActive: true, 
          shiftType: 'Regular',
          startTime: '09:00',
          endTime: '18:00',
          breakDurationMins: 60,
          graceLateMins: 15,
          graceEarlyMins: 15
       });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !formData.name) return;

    const now = new Date().toISOString();
    const base = {
       ...formData as Shift,
       companyId: currentTenant.id,
       updatedAt: now,
       updatedBy: currentUser.name
    };

    if (editingItem) {
       updateShift(base);
    } else {
       addShift({
          ...base,
          id: `shift-${Date.now()}`,
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
             <h2 className="text-lg font-bold text-slate-900">Shift Master</h2>
             <p className="text-sm text-slate-500">Define shift timings and breaks.</p>
          </div>
          {!isReadOnly && (
             <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> Add Shift
             </button>
          )}
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myShifts.length === 0 ? (
             <div className="col-span-2 text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">No shifts found.</div>
          ) : (
             myShifts.map(shift => (
                <div key={shift.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                   <div className="flex justify-between items-start mb-2">
                      <div>
                         <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{shift.name}</span>
                            <span className="text-xs font-mono bg-slate-100 px-1.5 rounded text-slate-600">{shift.code}</span>
                         </div>
                         <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${shift.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {shift.isActive ? 'Active' : 'Inactive'}
                         </span>
                      </div>
                      {!isReadOnly && (
                         <button onClick={() => handleOpenModal(shift)} className="text-indigo-600 hover:text-indigo-900">
                            <Edit2 className="w-5 h-5" />
                         </button>
                      )}
                   </div>
                   <div className="grid grid-cols-2 gap-4 text-sm mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center text-slate-700">
                         <Clock className="w-4 h-4 mr-2 text-slate-400" />
                         {shift.startTime} - {shift.endTime} {shift.isNextDay && <span className="text-xs text-red-500 ml-1">(+1 Day)</span>}
                      </div>
                      <div className="text-slate-500">
                         Type: {shift.shiftType}
                      </div>
                      <div className="text-slate-500">
                         Break: {shift.breakDurationMins}m
                      </div>
                      <div className="text-slate-500">
                         Grace: {shift.graceLateMins}m
                      </div>
                   </div>
                </div>
             ))
          )}
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Shift' : 'Create Shift'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Shift Name</label>
                         <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                            value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Shift Code</label>
                         <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                            value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Start Time</label>
                         <input type="time" required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">End Time</label>
                         <input type="time" required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                      </div>
                   </div>

                   <div className="flex items-center gap-6">
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={formData.isNextDay} onChange={e => setFormData({...formData, isNextDay: e.target.checked})} className="mr-2 rounded text-indigo-600"/>
                         Ends Next Day?
                      </label>
                   </div>

                   <div className="grid grid-cols-3 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Break Duration (m)</label>
                         <input type="number" min="0" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.breakDurationMins} onChange={e => setFormData({...formData, breakDurationMins: parseInt(e.target.value)})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Grace Late (m)</label>
                         <input type="number" min="0" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.graceLateMins} onChange={e => setFormData({...formData, graceLateMins: parseInt(e.target.value)})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Grace Early (m)</label>
                         <input type="number" min="0" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.graceEarlyMins} onChange={e => setFormData({...formData, graceEarlyMins: parseInt(e.target.value)})} />
                      </div>
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-slate-700">Type</label>
                      <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.shiftType} onChange={e => setFormData({...formData, shiftType: e.target.value as ShiftType})}
                      >
                         <option value="Regular">Regular</option>
                         <option value="Rotational">Rotational</option>
                         <option value="Night">Night</option>
                      </select>
                   </div>

                   <div className="flex justify-end space-x-3 mt-6">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Shift</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};