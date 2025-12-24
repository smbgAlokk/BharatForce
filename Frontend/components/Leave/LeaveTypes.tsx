
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveType, LeaveTypeCategory, UserRole } from '../../types';
import { Plus, Edit2, Check, X } from 'lucide-react';

const CATEGORIES: LeaveTypeCategory[] = [
  LeaveTypeCategory.PAID,
  LeaveTypeCategory.UNPAID,
  LeaveTypeCategory.COMP_OFF,
  LeaveTypeCategory.SPECIAL
];

export const LeaveTypes: React.FC = () => {
  const { leaveTypes, currentTenant, addLeaveType, updateLeaveType, userRole, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LeaveType | null>(null);
  const [formData, setFormData] = useState<Partial<LeaveType>>({ 
    isActive: true, 
    category: LeaveTypeCategory.PAID,
    isPaid: true,
    genderRestriction: 'All'
  });

  const myTypes = leaveTypes.filter(t => t.companyId === currentTenant?.id);
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleOpenModal = (item?: LeaveType) => {
    if (isReadOnly) return;
    setEditingItem(item || null);
    setFormData(item || { 
       isActive: true, 
       category: LeaveTypeCategory.PAID,
       isPaid: true,
       genderRestriction: 'All'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !formData.name || !formData.code) return;

    const now = new Date().toISOString();
    const base = {
       ...formData as LeaveType,
       companyId: currentTenant.id,
       updatedAt: now,
       updatedBy: currentUser.name
    };

    if (editingItem) {
       updateLeaveType(base);
    } else {
       addLeaveType({
          ...base,
          id: `lt-${Date.now()}`,
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
             <h2 className="text-lg font-bold text-slate-900">Leave Type Master</h2>
             <p className="text-sm text-slate-500">Define types of leaves available (e.g., Sick Leave, Casual Leave).</p>
          </div>
          {!isReadOnly && (
             <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> Add Leave Type
             </button>
          )}
       </div>

       <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Code</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Paid?</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                   {!isReadOnly && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>}
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {myTypes.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No leave types defined.</td></tr>
                ) : (
                   myTypes.map(type => (
                      <tr key={type.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 text-sm font-medium text-slate-900">{type.name}</td>
                         <td className="px-6 py-4 text-sm font-mono text-slate-600">{type.code}</td>
                         <td className="px-6 py-4 text-sm text-slate-500">{type.category}</td>
                         <td className="px-6 py-4 text-center">
                            {type.isPaid ? <Check className="w-4 h-4 text-green-600 mx-auto"/> : <span className="text-slate-300">-</span>}
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${type.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                               {type.isActive ? 'Active' : 'Inactive'}
                            </span>
                         </td>
                         {!isReadOnly && (
                            <td className="px-6 py-4 text-right">
                               <button onClick={() => handleOpenModal(type)} className="text-indigo-600 hover:text-indigo-900">
                                  <Edit2 className="w-4 h-4" />
                               </button>
                            </td>
                         )}
                      </tr>
                   ))
                )}
             </tbody>
          </table>
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Leave Type' : 'Add Leave Type'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Leave Name</label>
                      <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                         value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Leave Code</label>
                      <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm uppercase" 
                         value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Category</label>
                      <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as LeaveTypeCategory})}
                      >
                         {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Gender Applicability</label>
                      <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.genderRestriction} onChange={e => setFormData({...formData, genderRestriction: e.target.value as any})}
                      >
                         <option value="All">All</option>
                         <option value="Male">Male Only</option>
                         <option value="Female">Female Only</option>
                         <option value="Other">Other</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Description</label>
                      <textarea rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                   </div>
                   
                   <div className="flex flex-col gap-2 pt-2">
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={formData.isPaid} onChange={e => setFormData({...formData, isPaid: e.target.checked})} className="mr-2 rounded text-indigo-600"/>
                         Is Paid Leave?
                      </label>
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={formData.isStatutory} onChange={e => setFormData({...formData, isStatutory: e.target.checked})} className="mr-2 rounded text-indigo-600"/>
                         Is Statutory Leave?
                      </label>
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2 rounded text-indigo-600"/>
                         Active
                      </label>
                   </div>

                   <div className="flex justify-end space-x-3 mt-6">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Type</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};
