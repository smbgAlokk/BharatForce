


import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PerformanceCycle, CyclePeriod, CycleStatus, UserRole } from '../../types';
import { Plus, Edit2, Calendar, CheckCircle, Lock } from 'lucide-react';

export const PerformanceCycles: React.FC = () => {
  const { performanceCycles, currentTenant, addPerformanceCycle, updatePerformanceCycle, userRole, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCycle, setEditingCycle] = useState<PerformanceCycle | null>(null);
  const [formData, setFormData] = useState<Partial<PerformanceCycle>>({ status: 'Draft', period: 'Yearly' });

  const myCycles = performanceCycles.filter(c => c.companyId === currentTenant?.id);
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleOpenModal = (cycle?: PerformanceCycle) => {
    if (isReadOnly) return;
    setEditingCycle(cycle || null);
    if (cycle) {
       setFormData(cycle);
    } else {
       // Default new cycle
       const year = new Date().getFullYear();
       setFormData({
          name: `${year} Annual Appraisal`,
          period: 'Yearly',
          startDate: `${year}-01-01`,
          endDate: `${year}-12-31`,
          status: 'Draft',
          description: ''
       });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    const now = new Date().toISOString();
    const base = {
       ...formData as PerformanceCycle,
       companyId: currentTenant.id,
       updatedAt: now,
       updatedBy: currentUser.name
    };

    if (editingCycle) {
       updatePerformanceCycle(base);
    } else {
       addPerformanceCycle({
          ...base,
          id: `cycle-${Date.now()}`,
          createdAt: now,
          createdBy: currentUser.name
       });
    }
    setIsModalOpen(false);
  };

  const handleActivate = (cycle: PerformanceCycle) => {
     if (window.confirm(`Activate ${cycle.name}? This will allow goal setting.`)) {
        updatePerformanceCycle({ ...cycle, status: 'Active' });
     }
  };

  const handleCloseCycle = (cycle: PerformanceCycle) => {
     if (window.confirm(`Close ${cycle.name}? This will lock all goals and appraisals.`)) {
        updatePerformanceCycle({ ...cycle, status: 'Closed' });
     }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Performance Cycles</h2>
             <p className="text-sm text-slate-500">Define appraisal periods (Yearly, Half-Yearly, etc.)</p>
          </div>
          {!isReadOnly && (
             <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> Create Cycle
             </button>
          )}
       </div>

       <div className="grid grid-cols-1 gap-6">
          {myCycles.length === 0 ? (
             <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">
                No performance cycles found. Create one to start.
             </div>
          ) : (
             myCycles.map(cycle => (
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
                      <div className="flex items-center text-sm text-slate-500 mt-2 gap-4">
                         <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}</span>
                         <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs">{cycle.period}</span>
                      </div>
                      {cycle.description && <p className="text-sm text-slate-600 mt-2">{cycle.description}</p>}
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
                               <CheckCircle className="w-4 h-4 mr-1" /> Activate
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
                <h3 className="text-lg font-bold mb-4">{editingCycle ? 'Edit Cycle' : 'Create Performance Cycle'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Cycle Name</label>
                      <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                         value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
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

                   <div>
                      <label className="block text-sm font-medium text-slate-700">Period Type</label>
                      <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.period} onChange={e => setFormData({...formData, period: e.target.value as CyclePeriod})}
                      >
                         <option value="Yearly">Yearly</option>
                         <option value="Half-Yearly">Half-Yearly</option>
                         <option value="Quarterly">Quarterly</option>
                      </select>
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