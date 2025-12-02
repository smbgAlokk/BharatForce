








import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AppraisalCycle, UserRole } from '../../types';
import { Plus, Edit2, Calendar, CheckCircle, Lock } from 'lucide-react';

export const AppraisalCycles: React.FC = () => {
  const { appraisalCycles, performanceCycles, currentTenant, addAppraisalCycle, updateAppraisalCycle, activateAppraisalCycle, userRole, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<AppraisalCycle | null>(null);
  
  // Default new
  const [formData, setFormData] = useState<Partial<AppraisalCycle>>({ 
    status: 'Draft', 
    performanceCycleId: performanceCycles.find(c => c.companyId === currentTenant?.id)?.id || '',
    kpiSectionWeight: 70,
    coreValueSectionWeight: 30
  });

  const myApprCycles = appraisalCycles.filter(c => c.companyId === currentTenant?.id);
  const myPerfCycles = performanceCycles.filter(c => c.companyId === currentTenant?.id);
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleOpenModal = (cycle?: AppraisalCycle) => {
    if (isReadOnly) return;
    setEditingCycle(cycle || null);
    if (cycle) {
       setFormData(cycle);
    } else {
       const year = new Date().getFullYear();
       setFormData({
          name: `${year} Q4 Appraisal`,
          status: 'Draft',
          startDate: `${year}-10-01`,
          endDate: `${year}-10-31`,
          performanceCycleId: myPerfCycles[0]?.id || '',
          kpiSectionWeight: 70,
          coreValueSectionWeight: 30
       });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    const now = new Date().toISOString();
    const base = {
       ...formData as AppraisalCycle,
       companyId: currentTenant.id,
       updatedAt: now,
       updatedBy: currentUser.name
    };

    if (editingCycle) {
       updateAppraisalCycle(base);
    } else {
       addAppraisalCycle({
          ...base,
          id: `appr-cycle-${Date.now()}`,
          createdAt: now,
          createdBy: currentUser.name
       });
    }
    setIsModalOpen(false);
  };

  const handleActivate = (cycle: AppraisalCycle) => {
     if (window.confirm(`Activate ${cycle.name}? This will generate appraisal forms for all eligible employees.`)) {
        activateAppraisalCycle(cycle);
     }
  };

  const handleCloseCycle = (cycle: AppraisalCycle) => {
     if (window.confirm(`Close ${cycle.name}? This will lock all appraisals.`)) {
        updateAppraisalCycle({ ...cycle, status: 'Closed' });
     }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Appraisal Cycles</h2>
             <p className="text-sm text-slate-500">Manage review windows and trigger form generation.</p>
          </div>
          {!isReadOnly && (
             <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> Create Appraisal Cycle
             </button>
          )}
       </div>

       <div className="grid grid-cols-1 gap-6">
          {myApprCycles.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">
                No appraisal cycles found.
             </div>
          ) : (
             myApprCycles.map(cycle => (
                <div key={cycle.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                      <div className="flex items-center gap-3">
                         <h3 className="text-lg font-bold text-slate-900">{cycle.name}</h3>
                         <span className={`px-2 py-0.5 text-xs rounded-full border ${
                            cycle.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                            cycle.status === 'Draft' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                            'bg-slate-100 text-slate-600 border-slate-200'
                         }`}>
                            {cycle.status}
                         </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                         Linked to Goal Cycle: {myPerfCycles.find(p => p.id === cycle.performanceCycleId)?.name}
                      </div>
                      <div className="flex items-center text-sm text-slate-500 mt-2 gap-4">
                         <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}</span>
                         <span className="text-xs bg-slate-100 px-2 py-1 rounded">KPI {cycle.kpiSectionWeight}% / Values {cycle.coreValueSectionWeight}%</span>
                      </div>
                   </div>

                   {!isReadOnly && (
                      <div className="flex items-center gap-3">
                         {cycle.status === 'Draft' && (
                            <button onClick={() => handleOpenModal(cycle)} className="text-slate-500 hover:text-indigo-600">
                               <Edit2 className="w-5 h-5" />
                            </button>
                         )}
                         {cycle.status === 'Draft' && (
                            <button onClick={() => handleActivate(cycle)} className="flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                               <CheckCircle className="w-4 h-4 mr-1" /> Activate & Generate Forms
                            </button>
                         )}
                         {cycle.status === 'Active' && (
                            <button onClick={() => handleCloseCycle(cycle)} className="flex items-center px-3 py-1.5 bg-slate-800 text-white text-sm rounded hover:bg-slate-900">
                               <Lock className="w-4 h-4 mr-1" /> Close Cycle
                            </button>
                         )}
                      </div>
                   )}
                </div>
             ))
          )}
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                <h3 className="text-lg font-bold mb-4">{editingCycle ? 'Edit Appraisal Cycle' : 'Create Appraisal Cycle'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Cycle Name</label>
                      <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                         value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>
                   
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Linked Performance Cycle</label>
                      <select required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.performanceCycleId || ''} onChange={e => setFormData({...formData, performanceCycleId: e.target.value})}
                      >
                         <option value="">Select Goal Cycle</option>
                         {myPerfCycles.map(c => <option key={c.id} value={c.id}>{c.name} ({c.status})</option>)}
                      </select>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Start Date</label>
                         <input required type="date" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">End Date</label>
                         <input required type="date" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.endDate || ''} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">KPI Section Weight (%)</label>
                         <input type="number" min="0" max="100" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.kpiSectionWeight || 0} onChange={e => setFormData({...formData, kpiSectionWeight: parseFloat(e.target.value)})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Values Section Weight (%)</label>
                         <input type="number" min="0" max="100" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.coreValueSectionWeight || 0} onChange={e => setFormData({...formData, coreValueSectionWeight: parseFloat(e.target.value)})} />
                      </div>
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-slate-700">Description</label>
                      <textarea rows={3} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                   </div>

                   <div className="flex justify-end space-x-3 mt-4">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Cycle</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};