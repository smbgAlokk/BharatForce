
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HolidayCalendar, Holiday, UserRole } from '../../types';
import { Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';

export const HolidayCalendars: React.FC = () => {
  const { holidayCalendars, holidays, branches, currentTenant, addHolidayCalendar, updateHolidayCalendar, addHoliday, updateHoliday, deleteHoliday, userRole, currentUser } = useApp();
  
  const [isCalModalOpen, setIsCalModalOpen] = useState(false);
  const [editingCal, setEditingCal] = useState<HolidayCalendar | null>(null);
  const [calFormData, setCalFormData] = useState<Partial<HolidayCalendar>>({ isActive: true, year: new Date().getFullYear(), isDefault: false });

  const [selectedCalId, setSelectedCalId] = useState<string | null>(null);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [holidayFormData, setHolidayFormData] = useState<Partial<Holiday>>({ isPaid: true, type: 'National' });

  const myCalendars = holidayCalendars.filter(c => c.companyId === currentTenant?.id);
  const myBranches = branches.filter(b => b.companyId === currentTenant?.id);
  
  // If no calendar selected, select first default
  if (!selectedCalId && myCalendars.length > 0) {
     setSelectedCalId(myCalendars[0].id);
  }

  const selectedCal = myCalendars.find(c => c.id === selectedCalId);
  const myHolidays = holidays.filter(h => h.calendarId === selectedCalId);

  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  // --- Calendar Handlers ---
  
  const handleOpenCalModal = (cal?: HolidayCalendar) => {
    if (isReadOnly) return;
    setEditingCal(cal || null);
    setCalFormData(cal || { isActive: true, year: new Date().getFullYear(), isDefault: false, branchIds: [] });
    setIsCalModalOpen(true);
  };

  const handleSaveCal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !calFormData.name) return;
    const now = new Date().toISOString();
    const base = { ...calFormData as HolidayCalendar, companyId: currentTenant.id, updatedAt: now, updatedBy: currentUser.name };
    
    if (editingCal) {
       updateHolidayCalendar(base);
    } else {
       addHolidayCalendar({ ...base, id: `hc-${Date.now()}`, createdAt: now, createdBy: currentUser.name });
    }
    setIsCalModalOpen(false);
  };

  // --- Holiday Handlers ---

  const handleOpenHolidayModal = (h?: Holiday) => {
    if (isReadOnly || !selectedCalId) return;
    setHolidayFormData(h || { calendarId: selectedCalId, isPaid: true, type: 'National', date: `${selectedCal?.year}-01-01` });
    setIsHolidayModalOpen(true);
  };

  const handleSaveHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCalId || !holidayFormData.name) return;
    
    const now = new Date().toISOString();
    const base = { ...holidayFormData as Holiday, calendarId: selectedCalId, updatedAt: now, updatedBy: currentUser.name };

    if (base.id) {
       updateHoliday(base);
    } else {
       addHoliday({ ...base, id: `h-${Date.now()}`, createdAt: now, createdBy: currentUser.name });
    }
    setIsHolidayModalOpen(false);
  };

  const getBranchNames = (ids?: string[]) => {
     if (!ids || ids.length === 0) return 'All Locations';
     return ids.map(id => myBranches.find(b => b.id === id)?.name).join(', ');
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Holiday Calendar</h2>
             <p className="text-sm text-slate-500">Manage holidays for different locations.</p>
          </div>
          {!isReadOnly && (
             <button onClick={() => handleOpenCalModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> New Calendar
             </button>
          )}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar List */}
          <div className="space-y-2">
             {myCalendars.map(cal => (
                <div 
                  key={cal.id} 
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedCalId === cal.id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                  onClick={() => setSelectedCalId(cal.id)}
                >
                   <div className="flex justify-between items-start">
                      <div>
                         <h3 className="font-medium text-slate-900">{cal.name}</h3>
                         <div className="text-xs text-slate-500 mt-1">{cal.year} • {cal.isDefault ? 'Default' : 'Custom'}</div>
                      </div>
                      {!isReadOnly && (
                         <button onClick={(e) => { e.stopPropagation(); handleOpenCalModal(cal); }} className="text-slate-400 hover:text-indigo-600">
                            <Edit2 className="w-4 h-4" />
                         </button>
                      )}
                   </div>
                </div>
             ))}
             {myCalendars.length === 0 && <div className="text-sm text-slate-400 text-center py-4">No calendars found.</div>}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
             {selectedCal ? (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                   <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                      <div>
                         <h3 className="font-bold text-slate-800">{selectedCal.name} ({selectedCal.year})</h3>
                         <div className="flex items-center text-xs text-slate-500 mt-1">
                            <MapPin className="w-3 h-3 mr-1" /> {getBranchNames(selectedCal.branchIds)}
                         </div>
                      </div>
                      {!isReadOnly && (
                         <button onClick={() => handleOpenHolidayModal()} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
                            <Plus className="w-4 h-4 mr-1" /> Add Holiday
                         </button>
                      )}
                   </div>
                   
                   <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                         <thead className="bg-white">
                            <tr>
                               <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Holiday Name</th>
                               <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                               <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Paid</th>
                               {!isReadOnly && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>}
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-200">
                            {myHolidays.length === 0 ? (
                               <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No holidays added yet.</td></tr>
                            ) : (
                               myHolidays.sort((a,b) => a.date.localeCompare(b.date)).map(h => (
                                  <tr key={h.id} className="hover:bg-slate-50">
                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                        {new Date(h.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long' })}
                                     </td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{h.name}</td>
                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <span className={`px-2 py-1 rounded-full text-xs ${h.type === 'National' ? 'bg-orange-100 text-orange-800' : h.type === 'Festival' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'}`}>
                                           {h.type}
                                        </span>
                                     </td>
                                     <td className="px-6 py-4 text-center text-sm text-slate-500">
                                        {h.isPaid ? 'Yes' : 'No'}
                                     </td>
                                     {!isReadOnly && (
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                           <button onClick={() => handleOpenHolidayModal(h)} className="text-indigo-600 hover:text-indigo-900 mr-3"><Edit2 className="w-4 h-4"/></button>
                                           <button onClick={() => deleteHoliday(h.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4"/></button>
                                        </td>
                                     )}
                                  </tr>
                               ))
                            )}
                         </tbody>
                      </table>
                   </div>
                </div>
             ) : (
                <div className="h-full flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                   Select a calendar to manage holidays.
                </div>
             )}
          </div>
       </div>

       {/* Calendar Modal */}
       {isCalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">{editingCal ? 'Edit Calendar' : 'Add Calendar'}</h3>
                <form onSubmit={handleSaveCal} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Calendar Name</label>
                      <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                         value={calFormData.name || ''} onChange={e => setCalFormData({...calFormData, name: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Year</label>
                      <input required type="number" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                         value={calFormData.year} onChange={e => setCalFormData({...calFormData, year: parseInt(e.target.value)})} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Applicable Locations</label>
                      <div className="max-h-32 overflow-y-auto border border-slate-300 rounded p-2 space-y-2">
                         {myBranches.map(b => (
                            <label key={b.id} className="flex items-center text-sm">
                               <input 
                                 type="checkbox" 
                                 checked={calFormData.branchIds?.includes(b.id)}
                                 onChange={e => {
                                    const ids = calFormData.branchIds || [];
                                    setCalFormData({
                                       ...calFormData,
                                       branchIds: e.target.checked ? [...ids, b.id] : ids.filter(id => id !== b.id)
                                    });
                                 }}
                                 className="mr-2 rounded text-indigo-600" 
                               />
                               {b.name}
                            </label>
                         ))}
                      </div>
                   </div>
                   <div className="flex items-center gap-6 mt-4">
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={calFormData.isDefault} onChange={e => setCalFormData({...calFormData, isDefault: e.target.checked})} className="mr-2 rounded text-indigo-600"/>
                         Default Calendar
                      </label>
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={calFormData.isActive} onChange={e => setCalFormData({...calFormData, isActive: e.target.checked})} className="mr-2 rounded text-indigo-600"/>
                         Active
                      </label>
                   </div>
                   <div className="flex justify-end space-x-3 mt-6">
                      <button type="button" onClick={() => setIsCalModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save</button>
                   </div>
                </form>
             </div>
          </div>
       )}

       {/* Holiday Modal */}
       {isHolidayModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">{holidayFormData.id ? 'Edit Holiday' : 'Add Holiday'}</h3>
                <form onSubmit={handleSaveHoliday} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Holiday Name</label>
                      <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                         value={holidayFormData.name || ''} onChange={e => setHolidayFormData({...holidayFormData, name: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Date</label>
                      <input required type="date" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                         value={holidayFormData.date} onChange={e => setHolidayFormData({...holidayFormData, date: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Type</label>
                      <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={holidayFormData.type} onChange={e => setHolidayFormData({...holidayFormData, type: e.target.value as any})}
                      >
                         <option value="National">National Holiday</option>
                         <option value="Festival">Festival Holiday</option>
                         <option value="Restricted">Restricted Holiday</option>
                         <option value="Optional">Optional Holiday</option>
                      </select>
                   </div>
                   <div className="flex items-center mt-4">
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={holidayFormData.isPaid} onChange={e => setHolidayFormData({...holidayFormData, isPaid: e.target.checked})} className="mr-2 rounded text-indigo-600"/>
                         Is Paid Holiday?
                      </label>
                   </div>
                   <div className="flex justify-end space-x-3 mt-6">
                      <button type="button" onClick={() => setIsHolidayModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};
