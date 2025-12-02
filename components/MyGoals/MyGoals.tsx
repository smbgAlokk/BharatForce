


import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Target, Star } from 'lucide-react';

export const MyGoals: React.FC = () => {
  const { performanceCycles, currentTenant, currentUser, getOrCreatePerformancePlan } = useApp();
  
  // Simple cycle selector
  const activeCycle = performanceCycles.find(c => c.companyId === currentTenant?.id && c.status === 'Active');
  const [selectedCycleId, setSelectedCycleId] = useState(activeCycle?.id || '');
  const myCycles = performanceCycles.filter(c => c.companyId === currentTenant?.id);

  const plan = selectedCycleId && currentUser.employeeId 
    ? getOrCreatePerformancePlan(currentUser.employeeId, selectedCycleId) 
    : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">My Goals & Performance</h1>
           <p className="text-slate-500 mt-1">View your assigned goals and core values for the review period.</p>
        </div>
        <select 
           className="block w-64 border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 sm:text-sm border"
           value={selectedCycleId}
           onChange={e => setSelectedCycleId(e.target.value)}
        >
           <option value="">Select Cycle</option>
           {myCycles.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {!plan ? (
         <div className="text-center py-12 bg-white rounded-lg border border-slate-200 shadow-sm">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No performance plan found for the selected cycle.</p>
         </div>
      ) : (
         <div className="space-y-8">
            {/* Summary Card */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-6 flex justify-between items-center">
               <div>
                  <h3 className="font-bold text-indigo-900 text-lg">{activeCycle?.name || 'Performance Cycle'}</h3>
                  <p className="text-indigo-700 text-sm mt-1">{new Date(activeCycle?.startDate || '').toLocaleDateString()} to {new Date(activeCycle?.endDate || '').toLocaleDateString()}</p>
               </div>
               <div className="text-right">
                  <div className="text-xs text-indigo-500 uppercase font-bold tracking-wider">Status</div>
                  <div className="text-lg font-bold text-indigo-900">{plan.status}</div>
               </div>
            </div>

            {/* KPIs */}
            <div className="space-y-4">
               <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-indigo-600" /> My KPIs
               </h3>
               <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <table className="min-w-full divide-y divide-slate-200">
                     <thead className="bg-slate-50">
                        <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Goal</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Target</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Weightage</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Frequency</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-200">
                        {plan.goals.length === 0 ? (
                           <tr><td colSpan={4} className="px-6 py-6 text-center text-slate-500">No KPIs assigned.</td></tr>
                        ) : (
                           plan.goals.map(goal => (
                              <tr key={goal.id}>
                                 <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-slate-900">{goal.name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{goal.description}</div>
                                 </td>
                                 <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                                    {goal.isNumericTarget ? `${goal.targetValue} ${goal.targetUnit || ''}` : 'N/A'}
                                 </td>
                                 <td className="px-6 py-4 text-sm text-slate-500">{goal.weightage}%</td>
                                 <td className="px-6 py-4 text-sm text-slate-500">{goal.frequency}</td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

             {/* Core Values */}
             <div className="space-y-4">
               <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-amber-500" /> Core Values
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {plan.coreValues.map(val => (
                     <div key={val.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold text-slate-900">{val.name}</h4>
                           <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium">Weight: {val.weightage}%</span>
                        </div>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap mb-3">{val.behaviouralIndicators}</p>
                     </div>
                  ))}
                  {plan.coreValues.length === 0 && (
                     <div className="col-span-2 text-center py-6 text-slate-500 bg-white rounded-lg border border-slate-200">No core values assigned.</div>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};