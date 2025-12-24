


import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FeedbackTemplateMapping, UserRole } from '../../types';
import { Save, Plus, Trash2 } from 'lucide-react';

export const FeedbackMappings: React.FC = () => {
  const { grades, designations, feedbackTemplates, feedbackMappings, currentTenant, addFeedbackMapping, updateFeedbackMapping, userRole, currentUser } = useApp();
  
  const [activeTab, setActiveTab] = useState<'Grade' | 'Designation'>('Grade');
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [currentMapping, setCurrentMapping] = useState<FeedbackTemplateMapping | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const myGrades = grades.filter(g => g.companyId === currentTenant?.id);
  const myDesigs = designations.filter(d => d.companyId === currentTenant?.id);
  const myTemplates = feedbackTemplates.filter(t => t.companyId === currentTenant?.id && t.status === 'Active');
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  // Load Mapping when Entity changes
  useEffect(() => {
    if (selectedEntityId) {
       const existing = feedbackMappings.find(m => 
          m.companyId === currentTenant?.id && 
          m.entityType === activeTab && 
          m.entityId === selectedEntityId
       );
       if (existing) {
          setCurrentMapping(existing);
          setSelectedTemplateId(existing.templateId);
       } else {
          setCurrentMapping(null);
          setSelectedTemplateId('');
       }
    } else {
       setSelectedTemplateId('');
    }
  }, [selectedEntityId, activeTab, feedbackMappings, currentTenant]);

  const handleSave = () => {
     if (!currentTenant || !selectedEntityId || !selectedTemplateId) return;
     
     const now = new Date().toISOString();
     const base = {
        templateId: selectedTemplateId,
        isActive: true,
        companyId: currentTenant.id,
        updatedAt: now,
        updatedBy: currentUser.name
     };

     if (currentMapping) {
        updateFeedbackMapping({ ...currentMapping, ...base });
     } else {
        addFeedbackMapping({
           ...base,
           id: `fmap-${Date.now()}`,
           entityType: activeTab,
           entityId: selectedEntityId,
           createdAt: now,
           createdBy: currentUser.name
        });
     }
     alert('Mapping Saved Successfully!');
  };

  return (
    <div className="space-y-6">
       <div className="flex space-x-4 border-b border-slate-200 pb-1">
          <button 
            onClick={() => { setActiveTab('Grade'); setSelectedEntityId(''); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Grade' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
             Grade Mapping
          </button>
          <button 
             onClick={() => { setActiveTab('Designation'); setSelectedEntityId(''); }}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Designation' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
             Designation Mapping
          </button>
       </div>

       <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 max-w-2xl">
          <div className="space-y-6">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                   Select {activeTab}
                </label>
                <select 
                  className="block w-full border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 sm:text-sm border"
                  value={selectedEntityId}
                  onChange={e => setSelectedEntityId(e.target.value)}
                >
                   <option value="">-- Select --</option>
                   {activeTab === 'Grade' 
                      ? myGrades.map(g => <option key={g.id} value={g.id}>{g.name} ({g.level})</option>)
                      : myDesigs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                   }
                </select>
             </div>

             {selectedEntityId && (
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                   <label className="block text-sm font-medium text-slate-700 mb-2">
                      Assign 360 Feedback Template
                   </label>
                   <select 
                     className="block w-full border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 sm:text-sm border mb-4"
                     value={selectedTemplateId}
                     disabled={isReadOnly}
                     onChange={e => setSelectedTemplateId(e.target.value)}
                   >
                      <option value="">-- Select Template --</option>
                      {myTemplates.map(t => (
                         <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                   </select>
                   
                   {!isReadOnly && (
                      <div className="flex justify-end">
                         <button onClick={handleSave} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                            <Save className="h-4 w-4 mr-2" /> Save Mapping
                         </button>
                      </div>
                   )}
                </div>
             )}

             {!selectedEntityId && (
                <div className="text-center py-8 text-slate-400 text-sm">
                   Please select a {activeTab} to configure mapping.
                </div>
             )}
          </div>
       </div>
    </div>
  );
};