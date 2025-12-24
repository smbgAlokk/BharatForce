import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { WeeklyOffPattern, WeeklyOffType, UserRole } from '../../types';
import { Plus, Edit2 } from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const WeeklyOffPatterns: React.FC = () => {
  const { weeklyOffPatterns, currentTenant, addWeeklyOffPattern, updateWeeklyOffPattern, userRole, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WeeklyOffPattern | null>(null);
  const [formData, setFormData] = useState<Partial<WeeklyOffPattern>>({ 
    isActive: true, 
    type: 'Fixed',
    daysOff: ['Sunday'],
    alternateWeeks: [2, 4]
  });

  const myPatterns = weeklyOffPatterns.filter(p => p.companyId === currentTenant?.id);
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleOpenModal = (item?: WeeklyOffPattern) => {
    if (isReadOnly) return;
    setEditingItem(item || null);
    if (item) {
       setFormData(item);
    } else {
       setFormData({ 
          isActive: true, 
          type: 'Fixed',
          daysOff: ['Sunday'],
          alternateWeeks: [2, 4]
       });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !formData.name) return;

    const now = new Date().toISOString();
    const base = {
       ...formData as WeeklyOffPattern,
       companyId: currentTenant.id,
       updatedAt: now,
       updatedBy: currentUser.name
    };

    if (editingItem) {
       updateWeeklyOffPattern(base);
    } else {
       addWeeklyOffPattern({
          ...base,
          id: `wo-${Date.now()}`,
          createdAt: now,
          createdBy: currentUser.name
       });
    }
    setIsModalOpen(false);
  };

  const toggleDay = (day: string) => {
     const current = formData.daysOff || [];
     if (current.includes(day)) {
        setFormData({ ...formData, daysOff: current.filter(d => d !== day) });
     } else {
        setFormData({ ...formData, daysOff: [...current, day] });
     }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Weekly Off Patterns</h2>
             <p className="text-sm text-slate-500">Define weekend policies (Fixed, Alternate, etc.).</p>
          </div>
          {!isReadOnly && (
             <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> Add Pattern
             </button>
          )}
       </div>

       <div className="grid grid-cols-1 gap-4">
          {myPatterns.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">No patterns found.</div>
          ) : (
             myPatterns.map(pt => (
                <div key={pt.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex justify-between items-center">
                   <div>
                      <div className="flex items-center gap-3">
                         <span className="font-bold text-slate-900">{pt.name}</span>
                         <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">{pt.type}</span>
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                         Days Off: {pt.daysOff.join(', ')}
                         {pt.type === 'Alternate' && <span className="ml-2 text-xs text-indigo-600">(Weeks: {pt.alternateWeeks?.join(', ')})</span>}
                      </div>
                   </div>
                   {!isReadOnly && (
                      <button onClick={() => handleOpenModal(pt)} className="text-indigo-600 hover:text-indigo-900">
                         <Edit2 className="w-5 h-5" />
                      </button>
                   )}
                </div>
             ))
          )}
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Pattern' : 'Create Pattern'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Pattern Name</label>
                      <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                         value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>
                   
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Type</label>
                      <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as WeeklyOffType})}
                      >
                         <option value="Fixed">Fixed Days</option>
                         <option value="Alternate">Alternate (e.g. Alt Sat)</option>
                         <option value="Rotational">Rotational</option>
                      </select>
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Select Days Off</label>
                      <div className="flex flex-wrap gap-2">
                         {DAYS.map(day => (
                            <button 
                              key={day} type="button"
                              onClick={() => toggleDay(day)}
                              className={`px-3 py-1 rounded text-sm border ${formData.daysOff?.includes(day) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300'}`}
                            >
                               {day.slice(0, 3)}
                            </button>
                         ))}
                      </div>
                   </div>

                   {formData.type === 'Alternate' && (
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Alternate Weeks (e.g. for Saturday)</label>
                         <input type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                            value={formData.alternateWeeks?.join(', ') || ''} 
                            onChange={e => setFormData({...formData, alternateWeeks: e.target.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n))})} 
                            placeholder="e.g. 2, 4"
                         />
                      </div>
                   )}

                   <div className="flex justify-end space-x-3 mt-6">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Pattern</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};