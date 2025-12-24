


import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RaterType, FeedbackQuestion, FeedbackQuestionType, UserRole } from '../../types';
import { Plus, Edit2, Search, Trash2, X } from 'lucide-react';

export const FeedbackFramework: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'raters' | 'questions'>('raters');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
       {/* Sidebar */}
       <div className="space-y-1">
          <button 
             onClick={() => setActiveSection('raters')}
             className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeSection === 'raters' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-white'}`}
          >
             Rater Types
          </button>
          <button 
             onClick={() => setActiveSection('questions')}
             className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${activeSection === 'questions' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-white'}`}
          >
             Question Bank
          </button>
       </div>

       {/* Content */}
       <div className="lg:col-span-3">
          {activeSection === 'raters' && <RaterTypeManager />}
          {activeSection === 'questions' && <QuestionBankManager />}
       </div>
    </div>
  );
};

const RaterTypeManager: React.FC = () => {
   const { raterTypes, currentTenant, addRaterType, updateRaterType, userRole, currentUser } = useApp();
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingItem, setEditingItem] = useState<RaterType | null>(null);
   const [formData, setFormData] = useState<Partial<RaterType>>({ isActive: true, isInternal: true });

   const myTypes = raterTypes.filter(t => t.companyId === currentTenant?.id);
   const isReadOnly = userRole === UserRole.SUPER_ADMIN;

   const handleOpenModal = (item?: RaterType) => {
      if (isReadOnly) return;
      setEditingItem(item || null);
      setFormData(item || { isActive: true, isInternal: true });
      setIsModalOpen(true);
   };

   const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentTenant) return;

      const now = new Date().toISOString();
      const base = {
         ...formData as RaterType,
         companyId: currentTenant.id,
         updatedAt: now,
         updatedBy: currentUser.name
      };

      if (editingItem) {
         updateRaterType(base);
      } else {
         addRaterType({ ...base, id: `rt-${Date.now()}`, createdAt: now, createdBy: currentUser.name });
      }
      setIsModalOpen(false);
   };

   return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">Rater Types</h3>
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
                     <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Type</th>
                     <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                     {!isReadOnly && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200">
                  {myTypes.map(item => (
                     <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{item.description || '-'}</td>
                        <td className="px-6 py-4 text-center text-sm text-slate-500">
                           {item.isInternal ? 'Internal' : 'External'}
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
                  <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Rater Type' : 'Add Rater Type'}</h3>
                  <form onSubmit={handleSave} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Rater Name</label>
                        <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Description</label>
                        <input type="text" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" />
                     </div>
                     <div className="flex items-center gap-6">
                        <label className="flex items-center text-sm text-slate-700">
                           <input type="checkbox" checked={formData.isInternal !== false} onChange={e => setFormData({...formData, isInternal: e.target.checked})} className="mr-2 rounded text-indigo-600" />
                           Internal User?
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

const QuestionBankManager: React.FC = () => {
   const { questionBank, scoringModels, currentTenant, addQuestion, updateQuestion, userRole, currentUser } = useApp();
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editingItem, setEditingItem] = useState<FeedbackQuestion | null>(null);
   const [formData, setFormData] = useState<Partial<FeedbackQuestion>>({ isActive: true, isMandatory: false, category: 'Behavioural', questionType: 'Rating' });
   const [searchTerm, setSearchTerm] = useState('');

   const myQuestions = questionBank.filter(q => q.companyId === currentTenant?.id);
   const myModels = scoringModels.filter(m => m.companyId === currentTenant?.id);
   const isReadOnly = userRole === UserRole.SUPER_ADMIN;

   const filteredQuestions = myQuestions.filter(q => 
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.category.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const handleOpenModal = (item?: FeedbackQuestion) => {
      if (isReadOnly) return;
      setEditingItem(item || null);
      setFormData(item || { isActive: true, isMandatory: false, category: 'Behavioural', questionType: 'Rating', ratingScaleId: myModels[0]?.id });
      setIsModalOpen(true);
   };

   const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentTenant) return;

      const now = new Date().toISOString();
      const base = {
         ...formData as FeedbackQuestion,
         companyId: currentTenant.id,
         updatedAt: now,
         updatedBy: currentUser.name
      };

      if (editingItem) {
         updateQuestion(base);
      } else {
         addQuestion({ ...base, id: `q-${Date.now()}`, createdAt: now, createdBy: currentUser.name });
      }
      setIsModalOpen(false);
   };

   const getModelName = (id?: string) => myModels.find(m => m.id === id)?.name || '-';

   return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h3 className="text-lg font-bold text-slate-900">Question Bank</h3>
             <div className="flex space-x-2 items-center w-full sm:w-auto">
               <div className="relative rounded-md shadow-sm flex-1">
                  <input 
                     type="text" 
                     className="block w-full pl-3 pr-3 py-1.5 border border-slate-300 rounded-md text-sm" 
                     placeholder="Search questions..." 
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                  />
               </div>
               {!isReadOnly && (
                  <button onClick={() => handleOpenModal()} className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                     <Plus className="h-4 w-4 mr-1" /> Add Question
                  </button>
               )}
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase w-1/2">Question</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                     <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                     {!isReadOnly && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200">
                  {filteredQuestions.length === 0 ? (
                     <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No questions found.</td></tr>
                  ) : (
                     filteredQuestions.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.text}</td>
                           <td className="px-6 py-4 text-sm text-slate-500">{item.category}</td>
                           <td className="px-6 py-4 text-sm text-slate-500">
                              {item.questionType}
                              {item.questionType.includes('Rating') && <div className="text-xs text-slate-400">Scale: {getModelName(item.ratingScaleId)}</div>}
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
                     ))
                  )}
               </tbody>
            </table>
         </div>

         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
               <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                  <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Question' : 'Add Question'}</h3>
                  <form onSubmit={handleSave} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Question Text</label>
                        <textarea required rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm" 
                           value={formData.text || ''} onChange={e => setFormData({...formData, text: e.target.value})} />
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700">Category</label>
                           <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm"
                              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}
                           >
                              <option value="Behavioural">Behavioural</option>
                              <option value="Leadership">Leadership</option>
                              <option value="Core Values">Core Values</option>
                              <option value="KPI-related">KPI-related</option>
                              <option value="Other">Other</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700">Question Type</label>
                           <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm"
                              value={formData.questionType} onChange={e => setFormData({...formData, questionType: e.target.value as any})}
                           >
                              <option value="Rating">Rating Only</option>
                              <option value="Comment">Comment Only</option>
                              <option value="Rating + Comment">Rating + Comment</option>
                           </select>
                        </div>
                     </div>

                     {(formData.questionType?.includes('Rating')) && (
                        <div>
                           <label className="block text-sm font-medium text-slate-700">Rating Scale</label>
                           <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 border sm:text-sm"
                              value={formData.ratingScaleId || ''} onChange={e => setFormData({...formData, ratingScaleId: e.target.value})}
                           >
                              <option value="">Select Scale</option>
                              {myModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                           </select>
                        </div>
                     )}

                     <div className="flex items-center gap-6 pt-2">
                        <label className="flex items-center text-sm text-slate-700">
                           <input type="checkbox" checked={formData.isMandatory || false} onChange={e => setFormData({...formData, isMandatory: e.target.checked})} className="mr-2 rounded text-indigo-600" />
                           Mandatory?
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