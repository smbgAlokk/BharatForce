




import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PromotionRule, IncrementGuideline, UserRole } from '../../types';
import { Plus, Edit2, Check } from 'lucide-react';

export const PromotionFramework: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Rules' | 'Guidelines'>('Rules');

  return (
     <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
       <div className="space-y-1">
          <button 
             onClick={() => setActiveTab('Rules')}
             className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'Rules' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-white'}`}
          >
             Promotion Rules
          </button>
          <button 
             onClick={() => setActiveTab('Guidelines')}
             className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeTab === 'Guidelines' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-white'}`}
          >
             Increment Guidelines
          </button>
       </div>

       <div className="lg:col-span-3">
          {activeTab === 'Rules' && <RulesManager />}
          {activeTab === 'Guidelines' && <GuidelinesManager />}
       </div>
     </div>
  );
};

const RulesManager: React.FC = () => {
   const { promotionRules, currentTenant, grades, designations, ratingSchemes, addPromotionRule, updatePromotionRule, userRole, currentUser } = useApp();
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingItem, setEditingItem] = useState<PromotionRule | null>(null);
   const [formData, setFormData] = useState<Partial<PromotionRule>>({ isActive: true });

   const myRules = promotionRules.filter(r => r.companyId === currentTenant?.id);
   const myGrades = grades.filter(g => g.companyId === currentTenant?.id);
   const myDesigs = designations.filter(d => d.companyId === currentTenant?.id);
   const defaultScheme = ratingSchemes.find(s => s.companyId === currentTenant?.id && s.isDefault);
   const bands = defaultScheme ? defaultScheme.bands : [];
   const isReadOnly = userRole === UserRole.SUPER_ADMIN;

   const handleOpenModal = (rule?: PromotionRule) => {
      if (isReadOnly) return;
      setEditingItem(rule || null);
      setFormData(rule || { isActive: true, minTenureMonths: 12 });
      setIsModalOpen(true);
   };

   const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentTenant) return;
      const now = new Date().toISOString();
      const base = { ...formData as PromotionRule, companyId: currentTenant.id, updatedAt: now, updatedBy: currentUser.name };
      if (editingItem) updatePromotionRule(base);
      else addPromotionRule({ ...base, id: `rule-${Date.now()}`, createdAt: now, createdBy: currentUser.name });
      setIsModalOpen(false);
   };

   const getGradeName = (id?: string) => myGrades.find(g => g.id === id)?.name || 'Any';
   const getBandName = (id?: string) => bands.find(b => b.id === id)?.name || 'Any';

   return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">Promotion Rules</h3>
            {!isReadOnly && (
               <button onClick={() => handleOpenModal()} className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-1" /> Add Rule
               </button>
            )}
         </div>

         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rule Name</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Criteria</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Increment Range</th>
                     <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                     {!isReadOnly && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200">
                  {myRules.map(rule => (
                     <tr key={rule.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{rule.name}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                           <div>Grade: {getGradeName(rule.fromGradeId)} &rarr; {getGradeName(rule.toGradeId)}</div>
                           <div>Min Rating: {getBandName(rule.minRatingBandId)}</div>
                           <div>Min Tenure: {rule.minTenureMonths}m</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                           {rule.minIncrementPercent}% - {rule.maxIncrementPercent}%
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`px-2 py-1 text-xs rounded-full ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                              {rule.isActive ? 'Active' : 'Inactive'}
                           </span>
                        </td>
                        {!isReadOnly && (
                           <td className="px-6 py-4 text-right">
                              <button onClick={() => handleOpenModal(rule)} className="text-indigo-600 hover:text-indigo-900">
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
               <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                  <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Rule' : 'Add Promotion Rule'}</h3>
                  <form onSubmit={handleSave} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Rule Name</label>
                        <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700">From Grade</label>
                           <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" value={formData.fromGradeId || ''} onChange={e => setFormData({...formData, fromGradeId: e.target.value})}>
                              <option value="">Any</option>
                              {myGrades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700">To Grade</label>
                           <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" value={formData.toGradeId || ''} onChange={e => setFormData({...formData, toGradeId: e.target.value})}>
                              <option value="">Any</option>
                              {myGrades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                           </select>
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Min Rating Band</label>
                        <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" value={formData.minRatingBandId || ''} onChange={e => setFormData({...formData, minRatingBandId: e.target.value})}>
                           <option value="">Any</option>
                           {bands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                     </div>
                     <div className="grid grid-cols-3 gap-4">
                        <div>
                           <label className="block text-xs font-medium text-slate-700">Min Tenure (M)</label>
                           <input type="number" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" value={formData.minTenureMonths || 0} onChange={e => setFormData({...formData, minTenureMonths: parseInt(e.target.value)})} />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-slate-700">Min Inc %</label>
                           <input type="number" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" value={formData.minIncrementPercent || 0} onChange={e => setFormData({...formData, minIncrementPercent: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-slate-700">Max Inc %</label>
                           <input type="number" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" value={formData.maxIncrementPercent || 0} onChange={e => setFormData({...formData, maxIncrementPercent: parseFloat(e.target.value)})} />
                        </div>
                     </div>
                     <div className="flex justify-end space-x-3 mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Rule</button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

const GuidelinesManager: React.FC = () => {
   const { incrementGuidelines, currentTenant, ratingSchemes, addIncrementGuideline, updateIncrementGuideline, userRole, currentUser } = useApp();
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingItem, setEditingItem] = useState<IncrementGuideline | null>(null);
   const [formData, setFormData] = useState<Partial<IncrementGuideline>>({ isActive: true });

   const myGuidelines = incrementGuidelines.filter(g => g.companyId === currentTenant?.id);
   const defaultScheme = ratingSchemes.find(s => s.companyId === currentTenant?.id && s.isDefault);
   const bands = defaultScheme ? defaultScheme.bands : [];
   const isReadOnly = userRole === UserRole.SUPER_ADMIN;

   const handleOpenModal = (gl?: IncrementGuideline) => {
      if (isReadOnly) return;
      setEditingItem(gl || null);
      setFormData(gl || { isActive: true });
      setIsModalOpen(true);
   };

   const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentTenant || !formData.appraisalBandId) return;
      const now = new Date().toISOString();
      const base = { ...formData as IncrementGuideline, companyId: currentTenant.id, updatedAt: now, updatedBy: currentUser.name };
      if (editingItem) updateIncrementGuideline(base);
      else addIncrementGuideline({ ...base, id: `ig-${Date.now()}`, createdAt: now, createdBy: currentUser.name });
      setIsModalOpen(false);
   };

   const getBandName = (id: string) => bands.find(b => b.id === id)?.name || id;

   return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">Increment Guidelines</h3>
            {!isReadOnly && (
               <button onClick={() => handleOpenModal()} className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-1" /> Add Guideline
               </button>
            )}
         </div>
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Guideline Name</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rating Band</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Range</th>
                     <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                     {!isReadOnly && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200">
                  {myGuidelines.map(gl => (
                     <tr key={gl.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{gl.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{getBandName(gl.appraisalBandId)}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{gl.minPercent}% - {gl.maxPercent}%</td>
                        <td className="px-6 py-4 text-center">
                           <span className={`px-2 py-1 text-xs rounded-full ${gl.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                              {gl.isActive ? 'Active' : 'Inactive'}
                           </span>
                        </td>
                        {!isReadOnly && (
                           <td className="px-6 py-4 text-right">
                              <button onClick={() => handleOpenModal(gl)} className="text-indigo-600 hover:text-indigo-900">
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
               <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                  <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Guideline' : 'Add Guideline'}</h3>
                  <form onSubmit={handleSave} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Name</label>
                        <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Rating Band</label>
                        <select required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" value={formData.appraisalBandId || ''} onChange={e => setFormData({...formData, appraisalBandId: e.target.value})}>
                           <option value="">Select Band</option>
                           {bands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700">Min Percent</label>
                           <input required type="number" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" value={formData.minPercent || 0} onChange={e => setFormData({...formData, minPercent: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700">Max Percent</label>
                           <input required type="number" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" value={formData.maxPercent || 0} onChange={e => setFormData({...formData, maxPercent: parseFloat(e.target.value)})} />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Notes</label>
                        <textarea rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} />
                     </div>
                     <div className="flex justify-end space-x-3 mt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Guideline</button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};