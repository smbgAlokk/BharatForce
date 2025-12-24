
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PerformanceItem, UserRole, PerformanceFrequency } from '../../types';
import { Plus, Edit2, Search, Filter, X } from 'lucide-react';

export const GoalLibrary: React.FC = () => {
  const { performanceLibrary, kpiCategories, kpiTypes, scoringModels, currentTenant, addPerformanceItem, updatePerformanceItem, userRole, currentUser } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PerformanceItem | null>(null);
  const [formData, setFormData] = useState<Partial<PerformanceItem>>({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');

  const myItems = performanceLibrary.filter(i => i.companyId === currentTenant?.id);
  const myCategories = kpiCategories.filter(c => c.companyId === currentTenant?.id);
  const myTypes = kpiTypes.filter(t => t.companyId === currentTenant?.id);
  const myModels = scoringModels.filter(m => m.companyId === currentTenant?.id);

  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const filteredItems = myItems.filter(item => {
     const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesType = filterType === 'All' || item.itemType === filterType;
     const matchesCat = filterCategory === 'All' || item.categoryId === filterCategory;
     return matchesSearch && matchesType && matchesCat;
  });

  const handleOpenModal = (item?: PerformanceItem) => {
     if (isReadOnly) return;
     setEditingItem(item || null);
     setFormData(item || { 
        isActive: true, 
        itemType: 'KPI', 
        frequency: 'Yearly', 
        isNumericTarget: true,
        // Default selections if available
        categoryId: myCategories[0]?.id,
        kpiTypeId: myTypes[0]?.id,
        scoringModelId: myModels[0]?.id
     });
     setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
     e.preventDefault();
     if (!currentTenant || !formData.categoryId || !formData.kpiTypeId || !formData.scoringModelId) return;
     
     const now = new Date().toISOString();
     const base = {
        ...formData as PerformanceItem,
        companyId: currentTenant.id,
        updatedAt: now,
        updatedBy: currentUser.name
     };

     if (editingItem) {
        updatePerformanceItem(base);
     } else {
        addPerformanceItem({ ...base, id: `item-${Date.now()}`, createdAt: now, createdBy: currentUser.name });
     }
     setIsModalOpen(false);
  };

  const getCategoryName = (id: string) => myCategories.find(c => c.id === id)?.name || '-';
  const getTypeName = (id: string) => myTypes.find(t => t.id === id)?.name || '-';
  const getModelName = (id: string) => myModels.find(m => m.id === id)?.name || '-';

  return (
    <div className="space-y-6">
       {/* Filters & Actions */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex flex-1 space-x-2 items-center w-full sm:w-auto">
             <div className="relative rounded-md shadow-sm flex-1 max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                   <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                   type="text" 
                   className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                   placeholder="Search Item" 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
             <select 
               className="block pl-3 pr-8 py-2 border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
               value={filterType}
               onChange={e => setFilterType(e.target.value)}
             >
                <option value="All">All Types</option>
                <option value="KPI">KPI</option>
                <option value="CoreValue">Core Value</option>
             </select>
             <select 
               className="block pl-3 pr-8 py-2 border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
               value={filterCategory}
               onChange={e => setFilterCategory(e.target.value)}
             >
                <option value="All">All Categories</option>
                {myCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
          {!isReadOnly && (
             <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> Add Item
             </button>
          )}
       </div>

       {/* List */}
       <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item Name</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category & Model</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Frequency</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                   {!isReadOnly && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>}
                </tr>
             </thead>
             <tbody className="bg-white divide-y divide-slate-200">
                {filteredItems.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No items found.</td></tr>
                ) : (
                   filteredItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-900">{item.name}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">{item.description}</div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.itemType === 'CoreValue' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                               {item.itemType === 'CoreValue' ? 'Core Value' : 'KPI'}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-500">
                            <div>{getCategoryName(item.categoryId)}</div>
                            <div className="text-xs text-slate-400">Model: {getModelName(item.scoringModelId)}</div>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-500">{item.frequency}</td>
                         <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                               {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                         </td>
                         {!isReadOnly && (
                            <td className="px-6 py-4 text-right">
                               <button onClick={() => handleOpenModal(item)} className="text-indigo-600 hover:text-indigo-900">
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

       {/* Modal */}
       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold">{editingItem ? 'Edit Performance Item' : 'Add Performance Item'}</h3>
                   <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-slate-700">Item Name *</label>
                         <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" />
                      </div>
                      
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Item Type *</label>
                         <select 
                            className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm"
                            value={formData.itemType}
                            onChange={e => {
                               const type = e.target.value as 'KPI' | 'CoreValue';
                               // Auto-set numeric target based on type for convenience
                               setFormData({...formData, itemType: type, isNumericTarget: type === 'KPI'});
                            }}
                         >
                            <option value="KPI">KPI</option>
                            <option value="CoreValue">Core Value</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Category *</label>
                         <select required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" value={formData.categoryId || ''} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                            <option value="">Select Category</option>
                            {myCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                         </select>
                      </div>

                      <div>
                         <label className="block text-sm font-medium text-slate-700">KPI Type *</label>
                         <select required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" value={formData.kpiTypeId || ''} onChange={e => setFormData({...formData, kpiTypeId: e.target.value})}>
                            <option value="">Select Type</option>
                            {myTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                         </select>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Scoring Model *</label>
                         <select required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" value={formData.scoringModelId || ''} onChange={e => setFormData({...formData, scoringModelId: e.target.value})}>
                            <option value="">Select Model</option>
                            {myModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                         </select>
                      </div>
                   </div>

                   <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700">Description</label>
                      <textarea rows={2} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" />
                   </div>

                   {formData.itemType === 'CoreValue' && (
                      <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-slate-700">Behavioural Indicators</label>
                         <textarea rows={3} value={formData.behaviouralIndicators || ''} onChange={e => setFormData({...formData, behaviouralIndicators: e.target.value})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" placeholder="e.g. Listens actively, Responds promptly..." />
                      </div>
                   )}

                   {formData.itemType === 'KPI' && (
                      <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-slate-700">Measurement Criteria</label>
                         <textarea rows={2} value={formData.measurementCriteria || ''} onChange={e => setFormData({...formData, measurementCriteria: e.target.value})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" />
                      </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Frequency</label>
                         <select className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value as PerformanceFrequency})}>
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Half-Yearly">Half-Yearly</option>
                            <option value="Yearly">Yearly</option>
                            <option value="On-demand">On-demand</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Default Weightage (%)</label>
                         <input type="number" min="0" max="100" value={formData.defaultWeightage || 0} onChange={e => setFormData({...formData, defaultWeightage: parseFloat(e.target.value)})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" />
                      </div>
                      {formData.itemType === 'KPI' && (
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Target Unit</label>
                            <input type="text" value={formData.targetUnit || ''} onChange={e => setFormData({...formData, targetUnit: e.target.value})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" placeholder="e.g. %, INR, Nos" />
                         </div>
                      )}
                   </div>

                   <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={formData.isNumericTarget || false} onChange={e => setFormData({...formData, isNumericTarget: e.target.checked})} className="mr-2 rounded text-indigo-600" />
                         Numeric Target Required?
                      </label>
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={formData.isActive !== false} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2 rounded text-indigo-600" />
                         Active
                      </label>
                   </div>

                   <div className="flex justify-end space-x-3 mt-6">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Item</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};
