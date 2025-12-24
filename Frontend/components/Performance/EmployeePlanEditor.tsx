


import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmployeePerformancePlan, Employee, PerformanceCycle, EmployeeGoal, EmployeeCoreValue, PerformanceItem, PerformanceFrequency } from '../../types';
import { ArrowLeft, Save, Plus, Trash2, Lock } from 'lucide-react';

interface Props {
  plan: EmployeePerformancePlan;
  employee: Employee;
  cycle: PerformanceCycle;
  onBack: () => void;
}

export const EmployeePlanEditor: React.FC<Props> = ({ plan: initialPlan, employee, cycle, onBack }) => {
  const { performanceLibrary, savePerformancePlan, scoringModels } = useApp();
  const [plan, setPlan] = useState<EmployeePerformancePlan>(initialPlan);
  const [isDirty, setIsDirty] = useState(false);

  // Library Modal
  const [showLibModal, setShowLibModal] = useState<'KPI' | 'CoreValue' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isCycleActive = cycle.status === 'Active';
  // Draft check can be added here if we implement workflow locking

  const handleSave = (e?: React.FormEvent) => {
     e?.preventDefault();
     savePerformancePlan(plan);
     setIsDirty(false);
     alert('Plan saved successfully!');
  };

  // --- KPI Actions ---

  const addGoal = (item: PerformanceItem) => {
     if (plan.goals.some(g => g.performanceItemId === item.id)) return; // Prevent dupes

     const newGoal: EmployeeGoal = {
        id: `goal-${Date.now()}`,
        performanceItemId: item.id,
        name: item.name,
        description: item.description,
        category: 'Custom', // Simplified
        kpiType: 'Quantitative',
        scoringModelId: item.scoringModelId,
        weightage: item.defaultWeightage || 0,
        isMandatory: false,
        isNumericTarget: item.isNumericTarget,
        targetUnit: item.targetUnit,
        frequency: item.frequency
     };
     setPlan(prev => ({ ...prev, goals: [...prev.goals, newGoal] }));
     setIsDirty(true);
     setShowLibModal(null);
  };

  const updateGoal = (goalId: string, field: keyof EmployeeGoal, value: any) => {
     setPlan(prev => ({
        ...prev,
        goals: prev.goals.map(g => g.id === goalId ? { ...g, [field]: value } : g)
     }));
     setIsDirty(true);
  };

  const removeGoal = (goalId: string) => {
     if (window.confirm('Remove this goal?')) {
        setPlan(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== goalId) }));
        setIsDirty(true);
     }
  };

  // --- Core Value Actions ---

  const addValue = (item: PerformanceItem) => {
     if (plan.coreValues.some(v => v.performanceItemId === item.id)) return;

     const newValue: EmployeeCoreValue = {
        id: `cv-${Date.now()}`,
        performanceItemId: item.id,
        name: item.name,
        description: item.description,
        behaviouralIndicators: item.behaviouralIndicators,
        weightage: item.defaultWeightage || 0,
        isMandatory: false,
        scoringModelId: item.scoringModelId
     };
     setPlan(prev => ({ ...prev, coreValues: [...prev.coreValues, newValue] }));
     setIsDirty(true);
     setShowLibModal(null);
  };

  const updateValue = (cvId: string, field: keyof EmployeeCoreValue, value: any) => {
     setPlan(prev => ({
        ...prev,
        coreValues: prev.coreValues.map(v => v.id === cvId ? { ...v, [field]: value } : v)
     }));
     setIsDirty(true);
  };

  const removeValue = (cvId: string) => {
     if (window.confirm('Remove this value?')) {
        setPlan(prev => ({ ...prev, coreValues: prev.coreValues.filter(v => v.id !== cvId) }));
        setIsDirty(true);
     }
  };

  // Helper: Filter library items
  const libraryItems = performanceLibrary.filter(i => 
    i.isActive && 
    i.itemType === showLibModal &&
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalWeightage = [...plan.goals, ...plan.coreValues].reduce((acc, curr) => acc + (curr.weightage || 0), 0);

  return (
    <div className="space-y-6">
       {/* Header */}
       <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 sticky top-0 z-10">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-4">
                <button onClick={onBack} className="text-slate-500 hover:text-slate-700"><ArrowLeft className="w-5 h-5" /></button>
                <div>
                   <h2 className="text-xl font-bold text-slate-900">Performance Plan: {employee.firstName} {employee.lastName}</h2>
                   <div className="text-sm text-slate-500 flex items-center gap-3">
                      <span>{cycle.name}</span>
                      <span className="bg-slate-100 px-2 rounded text-xs border">{plan.status}</span>
                      {!isCycleActive && <span className="text-red-500 text-xs flex items-center"><Lock className="w-3 h-3 mr-1"/> Cycle Locked</span>}
                   </div>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <div className={`text-sm font-bold ${totalWeightage !== 100 ? 'text-red-600' : 'text-green-600'}`}>
                   Total Weightage: {totalWeightage}%
                </div>
                <button 
                  onClick={() => handleSave()} 
                  disabled={!isDirty || !isCycleActive}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                     ${isDirty && isCycleActive ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-300 cursor-not-allowed'}`}
                >
                   <Save className="w-4 h-4 mr-2" /> Save Plan
                </button>
             </div>
          </div>
       </div>

       {/* Section: KPI Goals */}
       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
             <h3 className="text-lg font-medium text-slate-900">KPI Goals</h3>
             {isCycleActive && (
                <button onClick={() => setShowLibModal('KPI')} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                   <Plus className="w-4 h-4 mr-1" /> Add Goal
                </button>
             )}
          </div>
          <div className="p-6">
             {plan.goals.length === 0 ? (
                <div className="text-center text-slate-400 py-4">No goals assigned yet.</div>
             ) : (
                <div className="space-y-4">
                   {plan.goals.map((goal, idx) => (
                      <div key={goal.id} className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                         <div className="flex justify-between items-start mb-3">
                            <div>
                               <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-sm">G{idx+1}. {goal.name}</span>
                                  {goal.isMandatory && <span className="bg-yellow-100 text-yellow-800 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Mandatory</span>}
                               </div>
                               <p className="text-xs text-slate-500 mt-1">{goal.description}</p>
                            </div>
                            {isCycleActive && !goal.isMandatory && (
                               <button onClick={() => removeGoal(goal.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            )}
                         </div>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm bg-slate-50 p-3 rounded">
                            <div>
                               <label className="block text-xs font-medium text-slate-500 mb-1">Weightage (%)</label>
                               <input 
                                 type="number" min="0" max="100"
                                 className="block w-full border-slate-300 rounded-md shadow-sm p-1.5 text-sm"
                                 value={goal.weightage}
                                 onChange={e => updateGoal(goal.id, 'weightage', parseFloat(e.target.value))}
                                 disabled={!isCycleActive}
                               />
                            </div>
                            {goal.isNumericTarget && (
                               <>
                                  <div>
                                     <label className="block text-xs font-medium text-slate-500 mb-1">Target Value</label>
                                     <input 
                                       type="number"
                                       className="block w-full border-slate-300 rounded-md shadow-sm p-1.5 text-sm"
                                       value={goal.targetValue || ''}
                                       onChange={e => updateGoal(goal.id, 'targetValue', parseFloat(e.target.value))}
                                       disabled={!isCycleActive}
                                     />
                                  </div>
                                  <div>
                                     <label className="block text-xs font-medium text-slate-500 mb-1">Unit</label>
                                     <span className="block py-1.5 text-slate-700">{goal.targetUnit || '-'}</span>
                                  </div>
                               </>
                            )}
                             <div>
                               <label className="block text-xs font-medium text-slate-500 mb-1">Frequency</label>
                               <span className="block py-1.5 text-slate-700">{goal.frequency}</span>
                            </div>
                         </div>
                         <div className="mt-3">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Manager Notes</label>
                            <input 
                              type="text"
                              className="block w-full border-slate-300 rounded-md shadow-sm p-1.5 text-xs"
                              placeholder="Add specific details..."
                              value={goal.notes || ''}
                              onChange={e => updateGoal(goal.id, 'notes', e.target.value)}
                              disabled={!isCycleActive}
                            />
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>
       </div>

       {/* Section: Core Values */}
       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
             <h3 className="text-lg font-medium text-slate-900">Core Values</h3>
             {isCycleActive && (
                <button onClick={() => setShowLibModal('CoreValue')} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                   <Plus className="w-4 h-4 mr-1" /> Add Value
                </button>
             )}
          </div>
          <div className="p-6">
             {plan.coreValues.length === 0 ? (
                <div className="text-center text-slate-400 py-4">No core values assigned yet.</div>
             ) : (
                <div className="space-y-4">
                   {plan.coreValues.map((val, idx) => (
                      <div key={val.id} className="border border-slate-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                         <div className="flex justify-between items-start mb-3">
                            <div>
                               <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-sm">V{idx+1}. {val.name}</span>
                                  {val.isMandatory && <span className="bg-yellow-100 text-yellow-800 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Mandatory</span>}
                               </div>
                               <p className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">{val.behaviouralIndicators}</p>
                            </div>
                            {isCycleActive && !val.isMandatory && (
                               <button onClick={() => removeValue(val.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            )}
                         </div>
                         <div className="flex gap-4 items-end">
                             <div className="w-32">
                               <label className="block text-xs font-medium text-slate-500 mb-1">Weightage (%)</label>
                               <input 
                                 type="number" min="0" max="100"
                                 className="block w-full border-slate-300 rounded-md shadow-sm p-1.5 text-sm"
                                 value={val.weightage}
                                 onChange={e => updateValue(val.id, 'weightage', parseFloat(e.target.value))}
                                 disabled={!isCycleActive}
                               />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>
       </div>

       {/* Library Modal */}
       {showLibModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold">Select {showLibModal === 'KPI' ? 'Goal' : 'Core Value'} from Library</h3>
                   <button onClick={() => setShowLibModal(null)}><Trash2 className="w-5 h-5 text-slate-400 hover:text-slate-600 rotate-45" /></button>
                </div>
                
                <input 
                  type="text" 
                  className="w-full border border-slate-300 rounded-md p-2 mb-4" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                   {libraryItems.map(item => (
                      <div key={item.id} className="p-3 border border-slate-200 rounded hover:bg-slate-50 flex justify-between items-center cursor-pointer" onClick={() => showLibModal === 'KPI' ? addGoal(item) : addValue(item)}>
                         <div>
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-slate-500 line-clamp-1">{item.description}</div>
                         </div>
                         <Plus className="w-4 h-4 text-indigo-600" />
                      </div>
                   ))}
                   {libraryItems.length === 0 && <div className="text-center text-slate-500 py-4">No items found.</div>}
                </div>
             </div>
          </div>
       )}

    </div>
  );
};