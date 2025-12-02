
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LetterTemplate, ProposalType, UserRole } from '../../types';
import { Plus, Edit2, X } from 'lucide-react';

export const LetterTemplates: React.FC = () => {
  const { letterTemplates, currentTenant, addLetterTemplate, updateLetterTemplate, userRole, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LetterTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<LetterTemplate>>({ isActive: true, type: ProposalType.INCREMENT });

  const myTemplates = letterTemplates.filter(t => t.companyId === currentTenant?.id);
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleOpenModal = (template?: LetterTemplate) => {
    if (isReadOnly) return;
    setEditingTemplate(template || null);
    setFormData(template || { isActive: true, type: ProposalType.INCREMENT, bodyContent: 'Dear {{EmployeeName}},\n\n...' });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !formData.name) return;

    const now = new Date().toISOString();
    const base = {
       ...formData as LetterTemplate,
       companyId: currentTenant.id,
       updatedAt: now,
       updatedBy: currentUser.name
    };

    if (editingTemplate) {
       updateLetterTemplate(base);
    } else {
       addLetterTemplate({
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
             <h2 className="text-lg font-bold text-slate-900">Letter Templates</h2>
             <p className="text-sm text-slate-500">Configure templates for promotion and increment letters.</p>
          </div>
          {!isReadOnly && (
             <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> New Template
             </button>
          )}
       </div>

       <div className="grid grid-cols-1 gap-4">
          {myTemplates.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">No templates found.</div>
          ) : (
             myTemplates.map(tmpl => (
                <div key={tmpl.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex justify-between items-center">
                   <div>
                      <div className="font-bold text-slate-900">{tmpl.name}</div>
                      <div className="text-sm text-slate-500">{tmpl.type}</div>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${tmpl.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                         {tmpl.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {!isReadOnly && (
                         <button onClick={() => handleOpenModal(tmpl)} className="text-indigo-600 hover:text-indigo-900">
                            <Edit2 className="w-4 h-4" />
                         </button>
                      )}
                   </div>
                </div>
             ))
          )}
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold">{editingTemplate ? 'Edit Template' : 'Create Template'}</h3>
                   <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                </div>
                <form onSubmit={handleSave} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Template Name</label>
                      <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                         value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Type</label>
                      <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ProposalType})}
                      >
                         <option value={ProposalType.INCREMENT}>Increment Only</option>
                         <option value={ProposalType.PROMOTION}>Promotion Only</option>
                         <option value={ProposalType.BOTH}>Promotion + Increment</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Body Content</label>
                      <p className="text-xs text-slate-500 mb-1">Available placeholders: &#123;&#123;EmployeeName&#125;&#125;, &#123;&#123;NewCTC&#125;&#125;, &#123;&#123;EffectiveDate&#125;&#125;, etc.</p>
                      <textarea required rows={10} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm font-mono"
                         value={formData.bodyContent || ''} onChange={e => setFormData({...formData, bodyContent: e.target.value})} />
                   </div>
                   <div className="flex items-center">
                      <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2 rounded text-indigo-600"/>
                      <label className="text-sm text-slate-700">Active</label>
                   </div>
                   <div className="flex justify-end space-x-3 mt-4">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Template</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};
