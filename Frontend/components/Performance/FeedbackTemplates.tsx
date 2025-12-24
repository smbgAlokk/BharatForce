


import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FeedbackTemplate, TemplateRaterConfig, TemplateQuestionConfig, UserRole } from '../../types';
import { Plus, Edit2, Trash2, Search, X, Check } from 'lucide-react';

export const FeedbackTemplates: React.FC = () => {
  const { feedbackTemplates, raterTypes, questionBank, currentTenant, addFeedbackTemplate, updateFeedbackTemplate, userRole, currentUser } = useApp();
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<FeedbackTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<FeedbackTemplate>>({});
  
  // Sub-editor state for rater specific questions
  const [activeRaterTab, setActiveRaterTab] = useState<string>('');

  const myTemplates = feedbackTemplates.filter(t => t.companyId === currentTenant?.id);
  const myRaters = raterTypes.filter(r => r.companyId === currentTenant?.id && r.isActive);
  const myQuestions = questionBank.filter(q => q.companyId === currentTenant?.id && q.isActive);
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleOpenEditor = (template?: FeedbackTemplate) => {
     if (isReadOnly) return;
     setEditingTemplate(template || null);
     if (template) {
        setFormData(template);
        setActiveRaterTab(template.raterConfigs[0]?.raterTypeId || '');
     } else {
        setFormData({
           name: '', description: '', status: 'Draft',
           raterConfigs: [],
           questionSets: {}
        });
        setActiveRaterTab('');
     }
     setIsEditorOpen(true);
  };

  const handleSave = () => {
     if (!currentTenant || !formData.name) return;

     const now = new Date().toISOString();
     const base = {
        ...formData as FeedbackTemplate,
        companyId: currentTenant.id,
        updatedAt: now,
        updatedBy: currentUser.name
     };

     if (editingTemplate) {
        updateFeedbackTemplate(base);
     } else {
        addFeedbackTemplate({ ...base, id: `ft-${Date.now()}`, createdAt: now, createdBy: currentUser.name });
     }
     setIsEditorOpen(false);
  };

  // --- Rater Config Handlers ---

  const toggleRater = (raterId: string) => {
     const configs = formData.raterConfigs || [];
     const exists = configs.find(c => c.raterTypeId === raterId);
     
     if (exists) {
        // Remove
        const newConfigs = configs.filter(c => c.raterTypeId !== raterId);
        const newQuestionSets = { ...formData.questionSets };
        delete newQuestionSets[raterId];
        
        setFormData({ ...formData, raterConfigs: newConfigs, questionSets: newQuestionSets });
        if (activeRaterTab === raterId) setActiveRaterTab(newConfigs[0]?.raterTypeId || '');
     } else {
        // Add default
        setFormData({
           ...formData,
           raterConfigs: [...configs, { raterTypeId: raterId, isIncluded: true, minCount: 1, isMandatory: true }],
           questionSets: { ...formData.questionSets, [raterId]: [] }
        });
        if (!activeRaterTab) setActiveRaterTab(raterId);
     }
  };

  const updateRaterConfig = (raterId: string, field: keyof TemplateRaterConfig, value: any) => {
     const configs = formData.raterConfigs || [];
     setFormData({
        ...formData,
        raterConfigs: configs.map(c => c.raterTypeId === raterId ? { ...c, [field]: value } : c)
     });
  };

  // --- Question Handlers ---

  const toggleQuestion = (raterId: string, qId: string) => {
     const currentSet = formData.questionSets?.[raterId] || [];
     const exists = currentSet.find(q => q.questionId === qId);

     if (exists) {
        setFormData({
           ...formData,
           questionSets: {
              ...formData.questionSets,
              [raterId]: currentSet.filter(q => q.questionId !== qId)
           }
        });
     } else {
        setFormData({
           ...formData,
           questionSets: {
              ...formData.questionSets,
              [raterId]: [...currentSet, { questionId: qId, isMandatory: true }]
           }
        });
     }
  };

  return (
    <div className="space-y-6">
       {!isEditorOpen ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900">360 Feedback Templates</h3>
                {!isReadOnly && (
                   <button onClick={() => handleOpenEditor()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4 mr-2" /> Create Template
                   </button>
                )}
             </div>
             
             <div className="grid grid-cols-1 gap-4">
                {myTemplates.length === 0 ? (
                   <div className="text-center py-8 text-slate-500">No templates found.</div>
                ) : (
                   myTemplates.map(template => (
                      <div key={template.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-center hover:bg-slate-50">
                         <div>
                            <div className="font-bold text-slate-900">{template.name}</div>
                            <div className="text-sm text-slate-500">{template.description}</div>
                            <div className="text-xs text-slate-400 mt-1">
                               Raters: {template.raterConfigs.map(r => myRaters.find(rt => rt.id === r.raterTypeId)?.name).join(', ')}
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${template.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                               {template.status}
                            </span>
                            {!isReadOnly && (
                               <button onClick={() => handleOpenEditor(template)} className="text-indigo-600 hover:text-indigo-900">
                                  <Edit2 className="w-5 h-5" />
                               </button>
                            )}
                         </div>
                      </div>
                   ))
                )}
             </div>
          </div>
       ) : (
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col h-[calc(100vh-160px)]">
             {/* Header */}
             <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900">{editingTemplate ? 'Edit Template' : 'New Template'}</h3>
                <div className="flex space-x-3">
                   <button onClick={() => setIsEditorOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-white">Cancel</button>
                   <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Template</button>
                </div>
             </div>

             <div className="flex-1 overflow-hidden flex">
                {/* Left: Basic Info & Rater Selection */}
                <div className="w-1/3 border-r border-slate-200 p-6 overflow-y-auto custom-scrollbar">
                   <div className="space-y-4 mb-6">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Template Name</label>
                         <input type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                            value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Description</label>
                         <textarea rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                            value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Status</label>
                         <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}
                         >
                            <option value="Draft">Draft</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                         </select>
                      </div>
                   </div>

                   <h4 className="font-bold text-slate-900 mb-3 border-b pb-2">Participating Raters</h4>
                   <div className="space-y-3">
                      {myRaters.map(rater => {
                         const config = formData.raterConfigs?.find(c => c.raterTypeId === rater.id);
                         return (
                            <div key={rater.id} className={`p-3 rounded border ${config ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200'}`}>
                               <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm">{rater.name}</span>
                                  <input 
                                    type="checkbox" 
                                    checked={!!config} 
                                    onChange={() => toggleRater(rater.id)}
                                    className="rounded text-indigo-600 h-5 w-5"
                                  />
                               </div>
                               {config && (
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                     <div>
                                        <label>Min Count</label>
                                        <input type="number" min="0" className="w-full border rounded p-1" 
                                          value={config.minCount} onChange={e => updateRaterConfig(rater.id, 'minCount', parseInt(e.target.value))} />
                                     </div>
                                     <div>
                                        <label>Max Count</label>
                                        <input type="number" min="0" className="w-full border rounded p-1" 
                                          value={config.maxCount || ''} onChange={e => updateRaterConfig(rater.id, 'maxCount', parseInt(e.target.value))} />
                                     </div>
                                     <div className="col-span-2 flex items-center mt-1">
                                        <input type="checkbox" checked={config.isMandatory} onChange={e => updateRaterConfig(rater.id, 'isMandatory', e.target.checked)} className="mr-2" />
                                        Mandatory Group?
                                     </div>
                                  </div>
                               )}
                            </div>
                         );
                      })}
                   </div>
                </div>

                {/* Right: Question Assignment */}
                <div className="flex-1 flex flex-col">
                   {/* Rater Tabs */}
                   <div className="border-b border-slate-200 bg-slate-50 px-4 pt-2 flex space-x-2 overflow-x-auto">
                      {formData.raterConfigs?.map(config => {
                         const raterName = myRaters.find(r => r.id === config.raterTypeId)?.name;
                         return (
                            <button
                               key={config.raterTypeId}
                               onClick={() => setActiveRaterTab(config.raterTypeId)}
                               className={`px-4 py-2 text-sm font-medium border-t border-l border-r rounded-t-md transition-colors 
                                  ${activeRaterTab === config.raterTypeId ? 'bg-white border-slate-200 -mb-px text-indigo-600' : 'bg-slate-100 text-slate-500 border-transparent hover:bg-slate-200'}`}
                            >
                               {raterName} ({formData.questionSets?.[config.raterTypeId]?.length || 0})
                            </button>
                         );
                      })}
                   </div>

                   {/* Questions List */}
                   <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                      {activeRaterTab ? (
                         <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                               <h4 className="font-bold text-slate-800">Questions for {myRaters.find(r => r.id === activeRaterTab)?.name}</h4>
                               <span className="text-xs text-slate-500">Select questions from the bank below</span>
                            </div>

                            {myQuestions.map(q => {
                               const isSelected = formData.questionSets?.[activeRaterTab]?.some(sq => sq.questionId === q.id);
                               return (
                                  <div key={q.id} 
                                    className={`p-3 border rounded-lg cursor-pointer hover:bg-slate-50 flex items-start justify-between transition-all ${isSelected ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200' : 'border-slate-200'}`}
                                    onClick={() => toggleQuestion(activeRaterTab, q.id)}
                                  >
                                     <div>
                                        <div className="text-sm font-medium text-slate-900">{q.text}</div>
                                        <div className="text-xs text-slate-500 mt-1 flex gap-3">
                                           <span className="bg-white border px-1 rounded">{q.category}</span>
                                           <span className="bg-white border px-1 rounded">{q.questionType}</span>
                                        </div>
                                     </div>
                                     <div className={`h-5 w-5 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                        {isSelected && <Check className="w-3 h-3 text-white" />}
                                     </div>
                                  </div>
                               );
                            })}
                         </div>
                      ) : (
                         <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                            Select a Rater Group from the left to assign questions.
                         </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};