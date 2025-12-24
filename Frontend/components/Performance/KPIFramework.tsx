
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { KPICategory, KPIType, ScoringModel, ScoringMethod, UserRole } from '../../types';
import { Plus, Edit2, Check, X } from 'lucide-react';

export const KPIFramework: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'categories' | 'types' | 'models'>('categories');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
       {/* Sidebar */}
       <div className="space-y-1">
          <button 
             onClick={() => setActiveSection('categories')}
             className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeSection === 'categories' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-white'}`}
          >
             KPI Categories
          </button>
          <button 
             onClick={() => setActiveSection('types')}
             className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeSection === 'types' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-white'}`}
          >
             KPI Types
          </button>
          <button 
             onClick={() => setActiveSection('models')}
             className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeSection === 'models' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-white'}`}
          >
             Scoring Models
          </button>
       </div>

       {/* Content */}
       <div className="lg:col-span-3">
          {activeSection === 'categories' && <CategoriesManager />}
          {activeSection === 'types' && <TypesManager />}
          {activeSection === 'models' && <ModelsManager />}
       </div>
    </div>
  );
};

const CategoriesManager: React.FC = () => {
   const { kpiCategories, currentTenant, addKPICategory, updateKPICategory, userRole, currentUser } = useApp();
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingItem, setEditingItem] = useState<KPICategory | null>(null);
   const [formData, setFormData] = useState<Partial<KPICategory>>({ isActive: true, isCoreValue: false });

   const myCategories = kpiCategories.filter(c => c.companyId === currentTenant?.id);
   const isReadOnly = userRole === UserRole.SUPER_ADMIN;

   const handleOpenModal = (item?: KPICategory) => {
      if (isReadOnly) return;
      setEditingItem(item || null);
      setFormData(item || { isActive: true, isCoreValue: false });
      setIsModalOpen(true);
   };

   const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentTenant) return;

      const now = new Date().toISOString();
      const base = {
         ...formData as KPICategory,
         companyId: currentTenant.id,
         updatedAt: now,
         updatedBy: currentUser.name
      };

      if (editingItem) {
         updateKPICategory(base);
      } else {
         addKPICategory({ ...base, id: `cat-${Date.now()}`, createdAt: now, createdBy: currentUser.name });
      }
      setIsModalOpen(false);
   };

   return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">KPI Categories</h3>
            {!isReadOnly && (
               <button onClick={() => handleOpenModal()} className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-1" /> Add Category
               </button>
            )}
         </div>
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                     <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Core Value?</th>
                     <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                     {!isReadOnly && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200">
                  {myCategories.map(item => (
                     <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{item.description || '-'}</td>
                        <td className="px-6 py-4 text-center">
                           {item.isCoreValue ? <Check className="w-4 h-4 text-green-600 mx-auto"/> : <span className="text-slate-300">-</span>}
                        </td>
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
                  ))}
               </tbody>
            </table>
         </div>

         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
               <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Category' : 'Add Category'}</h3>
                  <form onSubmit={handleSave} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Category Name</label>
                        <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <input type="text" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" />
                     </div>
                     <div className="flex items-center gap-4">
                        <label className="flex items-center text-sm text-slate-700">
                           <input type="checkbox" checked={formData.isCoreValue || false} onChange={e => setFormData({...formData, isCoreValue: e.target.checked})} className="mr-2 rounded text-indigo-600" />
                           Is Core Value?
                        </label>
                        <label className="flex items-center text-sm text-slate-700">
                           <input type="checkbox" checked={formData.isActive !== false} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2 rounded text-indigo-600" />
                           Active
                        </label>
                     </div>
                     <div className="flex justify-end space-x-3 mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save</button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

const TypesManager: React.FC = () => {
   const { kpiTypes, currentTenant, addKPIType, updateKPIType, userRole, currentUser } = useApp();
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingItem, setEditingItem] = useState<KPIType | null>(null);
   const [formData, setFormData] = useState<Partial<KPIType>>({ isActive: true });

   const myTypes = kpiTypes.filter(t => t.companyId === currentTenant?.id);
   const isReadOnly = userRole === UserRole.SUPER_ADMIN;

   const handleOpenModal = (item?: KPIType) => {
      if (isReadOnly) return;
      setEditingItem(item || null);
      setFormData(item || { isActive: true });
      setIsModalOpen(true);
   };

   const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentTenant) return;
      const now = new Date().toISOString();
      const base = { ...formData as KPIType, companyId: currentTenant.id, updatedAt: now, updatedBy: currentUser.name };
      if (editingItem) updateKPIType(base);
      else addKPIType({ ...base, id: `type-${Date.now()}`, createdAt: now, createdBy: currentUser.name });
      setIsModalOpen(false);
   };

   return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">KPI Types</h3>
            {!isReadOnly && (
               <button onClick={() => handleOpenModal()} className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-1" /> Add Type
               </button>
            )}
         </div>
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
                     <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                     {!isReadOnly && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200">
                  {myTypes.map(item => (
                     <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{item.description || '-'}</td>
                        <td className="px-6 py-4 text-center">
                           <span className={`px-2 py-1 text-xs rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                        {!isReadOnly && (
                           <td className="px-6 py-4 text-right">
                              <button onClick={() => handleOpenModal(item)} className="text-indigo-600 hover:text-indigo-900"><Edit2 className="w-4 h-4" /></button>
                           </td>
                        )}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
               <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit KPI Type' : 'Add KPI Type'}</h3>
                  <form onSubmit={handleSave} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Type Name</label>
                        <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <input type="text" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" />
                     </div>
                     <div className="flex items-center">
                        <label className="flex items-center text-sm text-slate-700">
                           <input type="checkbox" checked={formData.isActive !== false} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2 rounded text-indigo-600" />
                           Active
                        </label>
                     </div>
                     <div className="flex justify-end space-x-3 mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save</button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}

const ModelsManager: React.FC = () => {
   const { scoringModels, currentTenant, addScoringModel, updateScoringModel, userRole, currentUser } = useApp();
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingItem, setEditingItem] = useState<ScoringModel | null>(null);
   const [formData, setFormData] = useState<Partial<ScoringModel>>({ isActive: true, allowWeightage: true });

   const myModels = scoringModels.filter(m => m.companyId === currentTenant?.id);
   const isReadOnly = userRole === UserRole.SUPER_ADMIN;

   const handleOpenModal = (item?: ScoringModel) => {
      if (isReadOnly) return;
      setEditingItem(item || null);
      setFormData(item || { isActive: true, allowWeightage: true, method: 'Rating_1_5' });
      setIsModalOpen(true);
   };

   const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentTenant) return;
      const now = new Date().toISOString();
      const base = { ...formData as ScoringModel, companyId: currentTenant.id, updatedAt: now, updatedBy: currentUser.name };
      if (editingItem) updateScoringModel(base);
      else addScoringModel({ ...base, id: `score-${Date.now()}`, createdAt: now, createdBy: currentUser.name });
      setIsModalOpen(false);
   };

   return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">Scoring Models</h3>
            {!isReadOnly && (
               <button onClick={() => handleOpenModal()} className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-1" /> Add Model
               </button>
            )}
         </div>
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Method</th>
                     <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Weightage?</th>
                     <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                     {!isReadOnly && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200">
                  {myModels.map(item => (
                     <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{item.method.replace(/_/g, ' ')}</td>
                        <td className="px-6 py-4 text-center">
                           {item.allowWeightage ? <Check className="w-4 h-4 text-green-600 mx-auto"/> : <span className="text-slate-300">-</span>}
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`px-2 py-1 text-xs rounded-full ${item.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.isActive ? 'Active' : 'Inactive'}</span>
                        </td>
                        {!isReadOnly && (
                           <td className="px-6 py-4 text-right">
                              <button onClick={() => handleOpenModal(item)} className="text-indigo-600 hover:text-indigo-900"><Edit2 className="w-4 h-4" /></button>
                           </td>
                        )}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
               <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Scoring Model' : 'Add Scoring Model'}</h3>
                  <form onSubmit={handleSave} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Model Name</label>
                        <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Scoring Method</label>
                        <select 
                           className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm"
                           value={formData.method}
                           onChange={e => setFormData({...formData, method: e.target.value as ScoringMethod})}
                        >
                           <option value="Rating_1_5">1-5 Rating Scale</option>
                           <option value="Rating_1_10">1-10 Rating Scale</option>
                           <option value="Percentage">Percentage Achievement</option>
                           <option value="Binary_Yes_No">Yes/No Compliance</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <input type="text" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" />
                     </div>
                     <div className="flex items-center gap-4">
                        <label className="flex items-center text-sm text-slate-700">
                           <input type="checkbox" checked={formData.allowWeightage || false} onChange={e => setFormData({...formData, allowWeightage: e.target.checked})} className="mr-2 rounded text-indigo-600" />
                           Allow Weightage?
                        </label>
                        <label className="flex items-center text-sm text-slate-700">
                           <input type="checkbox" checked={formData.isActive !== false} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2 rounded text-indigo-600" />
                           Active
                        </label>
                     </div>
                     <div className="flex justify-end space-x-3 mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save</button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}
