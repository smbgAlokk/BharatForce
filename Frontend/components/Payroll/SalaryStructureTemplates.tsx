


import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SalaryStructureTemplate, SalaryStructureLine, UserRole, AllocationType } from '../../types';
import { Plus, Edit2, Trash2, ChevronRight, Save, X } from 'lucide-react';

export const SalaryStructureTemplates: React.FC = () => {
  const { salaryTemplates, payComponents, currentTenant, addSalaryTemplate, updateSalaryTemplate, userRole, currentUser } = useApp();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SalaryStructureTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<SalaryStructureTemplate>>({ isActive: true, lines: [] });

  const myTemplates = salaryTemplates.filter(t => t.companyId === currentTenant?.id);
  const myComponents = payComponents.filter(c => c.companyId === currentTenant?.id && c.isActive);
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleCreate = () => {
     setEditingTemplate(null);
     setFormData({ isActive: true, lines: [] });
     setIsEditorOpen(true);
  };

  const handleEdit = (template: SalaryStructureTemplate) => {
     setEditingTemplate(template);
     setFormData(JSON.parse(JSON.stringify(template))); // Deep copy
     setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
     e.preventDefault();
     if (!currentTenant || !formData.name) return;

     const now = new Date().toISOString();
     const base = {
        ...formData as SalaryStructureTemplate,
        companyId: currentTenant.id,
        updatedAt: now,
        updatedBy: currentUser.name
     };

     if (editingTemplate) {
        updateSalaryTemplate(base);
     } else {
        addSalaryTemplate({ ...base, id: `st-${Date.now()}`, createdAt: now, createdBy: currentUser.name });
     }
     setIsEditorOpen(false);
  };

  // Line Management
  const addLine = () => {
     const newLine: SalaryStructureLine = {
        id: `line-${Date.now()}`,
        templateId: editingTemplate?.id || 'temp',
        componentId: myComponents[0]?.id || '',
        allocationType: 'Percentage of CTC',
        allocationValue: 0,
        priorityOrder: formData.lines!.length + 1
     };
     setFormData(prev => ({ ...prev, lines: [...(prev.lines || []), newLine] }));
  };

  const updateLine = (lineId: string, field: keyof SalaryStructureLine, value: any) => {
     setFormData(prev => ({
        ...prev,
        lines: prev.lines!.map(l => l.id === lineId ? { ...l, [field]: value } : l)
     }));
  };

  const removeLine = (lineId: string) => {
     setFormData(prev => ({
        ...prev,
        lines: prev.lines!.filter(l => l.id !== lineId)
     }));
  };

  const getComponentName = (id: string) => myComponents.find(c => c.id === id)?.name || id;

  if (isEditorOpen) {
     return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900">{editingTemplate ? 'Edit Template' : 'Create Structure Template'}</h3>
              <button onClick={() => setIsEditorOpen(false)} className="text-slate-500 hover:text-slate-700"><X className="w-6 h-6"/></button>
           </div>
           
           <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Template Name</label>
                    <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                       value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Status</label>
                    <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                       value={formData.isActive ? 'Active' : 'Inactive'} onChange={e => setFormData({...formData, isActive: e.target.value === 'Active'})}
                    >
                       <option value="Active">Active</option>
                       <option value="Inactive">Inactive</option>
                    </select>
                 </div>
                 <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-700">Description</label>
                    <textarea rows={2} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                       value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                 </div>
              </div>

              <div className="border-t pt-4">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-slate-800 uppercase">Breakup Rules</h4>
                    <button type="button" onClick={addLine} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                       <Plus className="w-4 h-4 mr-1" /> Add Component
                    </button>
                 </div>
                 
                 <div className="space-y-3">
                    {formData.lines?.sort((a,b) => a.priorityOrder - b.priorityOrder).map((line, idx) => (
                       <div key={line.id} className="flex flex-col md:flex-row gap-4 p-3 bg-slate-50 rounded border border-slate-200 items-center">
                          <div className="w-10 text-xs text-slate-400 text-center">#{idx+1}</div>
                          <div className="flex-1">
                             <select className="block w-full border-slate-300 rounded p-1.5 text-sm"
                                value={line.componentId} onChange={e => updateLine(line.id, 'componentId', e.target.value)}
                             >
                                {myComponents.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                             </select>
                          </div>
                          <div className="flex-1">
                             <select className="block w-full border-slate-300 rounded p-1.5 text-sm"
                                value={line.allocationType} onChange={e => updateLine(line.id, 'allocationType', e.target.value as AllocationType)}
                             >
                                <option value="Percentage of CTC">% of CTC</option>
                                <option value="Percentage of Basic">% of Basic</option>
                                <option value="Percentage of Remaining CTC">% of Remaining CTC</option>
                                <option value="Flat Amount (Monthly)">Flat (Monthly)</option>
                                <option value="Flat Amount (Yearly)">Flat (Yearly)</option>
                             </select>
                          </div>
                          <div className="w-32">
                             <input type="number" className="block w-full border-slate-300 rounded p-1.5 text-sm"
                                placeholder="Value"
                                value={line.allocationValue} onChange={e => updateLine(line.id, 'allocationValue', parseFloat(e.target.value))} 
                             />
                          </div>
                          <div className="w-20">
                             <input type="number" className="block w-full border-slate-300 rounded p-1.5 text-sm"
                                placeholder="Order" title="Priority Order"
                                value={line.priorityOrder} onChange={e => updateLine(line.id, 'priorityOrder', parseInt(e.target.value))} 
                             />
                          </div>
                          <button type="button" onClick={() => removeLine(line.id)} className="text-slate-400 hover:text-red-600">
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    ))}
                    {formData.lines?.length === 0 && <div className="text-center text-slate-400 py-4 text-sm">No components added.</div>}
                 </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                 <button type="button" onClick={() => setIsEditorOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-white">Cancel</button>
                 <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Template</button>
              </div>
           </form>
        </div>
     );
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Salary Structure Templates</h2>
             <p className="text-sm text-slate-500">Define reusable CTC breakup structures.</p>
          </div>
          {!isReadOnly && (
             <button onClick={handleCreate} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> Create Template
             </button>
          )}
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myTemplates.length === 0 ? (
             <div className="col-span-2 text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">No templates found.</div>
          ) : (
             myTemplates.map(template => (
                <div key={template.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:border-indigo-200 transition-colors">
                   <div className="flex justify-between items-start">
                      <div>
                         <h3 className="font-bold text-slate-900">{template.name}</h3>
                         <p className="text-sm text-slate-500 mt-1">{template.description}</p>
                         <div className="mt-3 flex flex-wrap gap-2">
                            {template.lines.slice(0, 3).map(l => (
                               <span key={l.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                  {getComponentName(l.componentId)}
                               </span>
                            ))}
                            {template.lines.length > 3 && <span className="text-xs text-slate-400 self-center">+{template.lines.length - 3} more</span>}
                         </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                         <span className={`px-2 py-0.5 text-xs rounded-full ${template.isActive ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-slate-100 text-slate-600'}`}>
                            {template.isActive ? 'Active' : 'Inactive'}
                         </span>
                         {!isReadOnly && (
                            <button onClick={() => handleEdit(template)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mt-2 flex items-center">
                               Edit <ChevronRight className="w-4 h-4" />
                            </button>
                         )}
                      </div>
                   </div>
                </div>
             ))
          )}
       </div>
    </div>
  );
};