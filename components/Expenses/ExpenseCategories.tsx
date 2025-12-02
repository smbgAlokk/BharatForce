
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, UserRole } from '../../types';
import { Plus, Edit2, Check, X } from 'lucide-react';

export const ExpenseCategories: React.FC = () => {
  const { expenseCategories, currentTenant, addExpenseCategory, updateExpenseCategory, userRole, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseCategory | null>(null);
  const [formData, setFormData] = useState<Partial<ExpenseCategory>>({ 
    isActive: true, 
    isBillRequired: true
  });

  const myCategories = expenseCategories.filter(c => c.companyId === currentTenant?.id);
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleOpenModal = (item?: ExpenseCategory) => {
    if (isReadOnly) return;
    setEditingItem(item || null);
    setFormData(item || { 
       isActive: true, 
       isBillRequired: true
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !formData.categoryName || !formData.categoryCode) return;

    const now = new Date().toISOString();
    const base = {
       ...formData as ExpenseCategory,
       companyId: currentTenant.id,
       updatedAt: now,
       updatedBy: currentUser.name
    };

    if (editingItem) {
       updateExpenseCategory(base);
    } else {
       addExpenseCategory({
          ...base,
          id: `ec-${Date.now()}`,
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
             <h2 className="text-lg font-bold text-slate-900">Expense Categories</h2>
             <p className="text-sm text-slate-500">Define categories for expense claims (e.g., Travel, Food).</p>
          </div>
          {!isReadOnly && (
             <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> Add Category
             </button>
          )}
       </div>

       <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Code</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Bill Required</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                   {!isReadOnly && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>}
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {myCategories.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No categories defined.</td></tr>
                ) : (
                   myCategories.map(cat => (
                      <tr key={cat.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 text-sm font-mono text-slate-600">{cat.categoryCode}</td>
                         <td className="px-6 py-4 text-sm font-medium text-slate-900">{cat.categoryName}</td>
                         <td className="px-6 py-4 text-sm text-slate-500">{cat.description || '-'}</td>
                         <td className="px-6 py-4 text-center">
                            {cat.isBillRequired ? <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">Yes</span> : <span className="text-xs text-slate-400">No</span>}
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                               {cat.isActive ? 'Active' : 'Inactive'}
                            </span>
                         </td>
                         {!isReadOnly && (
                            <td className="px-6 py-4 text-right">
                               <button onClick={() => handleOpenModal(cat)} className="text-indigo-600 hover:text-indigo-900">
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
                <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Category' : 'Add Expense Category'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Category Name</label>
                      <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                         value={formData.categoryName || ''} onChange={e => setFormData({...formData, categoryName: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Category Code</label>
                      <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm uppercase" 
                         value={formData.categoryCode || ''} onChange={e => setFormData({...formData, categoryCode: e.target.value.toUpperCase()})} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Description</label>
                      <textarea rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                   </div>
                   
                   <div className="flex flex-col gap-3 pt-2">
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={formData.isBillRequired} onChange={e => setFormData({...formData, isBillRequired: e.target.checked})} className="mr-2 rounded text-indigo-600"/>
                         Is Bill/Receipt Required?
                      </label>
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2 rounded text-indigo-600"/>
                         Active
                      </label>
                   </div>

                   <div className="flex justify-end space-x-3 mt-6">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Category</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};
