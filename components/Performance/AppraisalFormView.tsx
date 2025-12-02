

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { AppraisalStatus, UserRole, ScoringModel, AppraisalItemRating } from '../../types';
import { ArrowLeft, Save, Send, Lock, CheckCircle } from 'lucide-react';

export const AppraisalFormView: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const { appraisalForms, employeePerformancePlans, employees, appraisalCycles, scoringModels, currentUser, updateAppraisalForm, userRole } = useApp();

  const form = appraisalForms.find(f => f.id === id);
  const [formData, setFormData] = useState(form);
  
  const plan = employeePerformancePlans.find(p => p.id === form?.planId);
  const employee = employees.find(e => e.id === form?.employeeId);
  const cycle = appraisalCycles.find(c => c.id === form?.appraisalCycleId);
  const manager = employees.find(e => e.id === employee?.reportingManagerId);

  useEffect(() => {
     setFormData(form);
  }, [form]);

  if (!form || !plan || !employee || !cycle) return <div>Appraisal Form Not Found</div>;

  // Permissions Logic
  const isSelf = currentUser.employeeId === form.employeeId;
  const isManager = currentUser.employeeId === employee.reportingManagerId;
  const isHR = userRole === UserRole.COMPANY_ADMIN;

  const canEditSelf = isSelf && form.status === AppraisalStatus.PENDING_SELF;
  const canEditManager = isManager && form.status === AppraisalStatus.PENDING_MANAGER;
  const canEditHR = isHR && (form.status === AppraisalStatus.PENDING_HR || form.status === AppraisalStatus.FINALISED); // HR can override

  const handleSave = (e: React.FormEvent) => {
     e.preventDefault();
     if (formData) {
        updateAppraisalForm(formData);
        alert("Saved Successfully");
     }
  };

  const handleSubmit = (nextStatus: AppraisalStatus) => {
     if (formData) {
        updateAppraisalForm({ ...formData, status: nextStatus });
        navigate('/performance/appraisals');
     }
  };

  // Helper to update section fields
  const updateSection = (section: 'selfAppraisal' | 'managerAppraisal' | 'hrAppraisal', field: string, value: string) => {
     if (!formData) return;
     setFormData({
        ...formData,
        [section]: {
           ...formData[section],
           [field]: value,
           submittedBy: currentUser.id,
           submittedOn: new Date().toISOString()
        }
     });
  };

  // Helper to update Rating
  const handleRatingChange = (itemId: string, field: keyof AppraisalItemRating, value: any) => {
     if (!formData) return;
     
     const currentRatings = formData.ratings || {};
     const itemRating = currentRatings[itemId] || {};

     // Auto update Final Rating for simplicity if Manager/HR edits
     let finalRating = itemRating.finalRating;
     if (field === 'managerRating' && (canEditManager || canEditHR)) {
         finalRating = value;
     }
     // If HR explicitly edits Final Rating separately (can be added later), logic would differ
     // For now assume Manager Rating drives Final unless overridden
     
     setFormData({
        ...formData,
        ratings: {
           ...currentRatings,
           [itemId]: {
              ...itemRating,
              [field]: value,
              finalRating: finalRating
           }
        }
     });
  };

  const renderRatingDisplay = (value: number | undefined, model?: ScoringModel) => {
     if (value === undefined) return '-';
     if (!model) return value;
     if (model.method === 'Binary_Yes_No') return value === 1 ? 'Yes' : 'No';
     if (model.method === 'Percentage') return `${value}%`;
     return value;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
       <div className="flex justify-between items-center">
          <button onClick={() => navigate('/performance/appraisals')} className="flex items-center text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <div className="flex items-center gap-2">
             <span className={`px-3 py-1 text-sm font-medium rounded-full border 
                 ${form.status === AppraisalStatus.PENDING_SELF ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                   form.status === AppraisalStatus.PENDING_MANAGER ? 'bg-purple-50 text-purple-700 border-purple-200' :
                   form.status === AppraisalStatus.FINALISED ? 'bg-green-50 text-green-700 border-green-200' :
                   'bg-yellow-50 text-yellow-700 border-yellow-200'
                 }`}>
                 {form.status}
             </span>
          </div>
       </div>

       {/* Score Summary - Visible to Manager/HR always, Employee only when Finalised */}
       {(isManager || isHR || form.status === AppraisalStatus.FINALISED) && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100 bg-indigo-50">
             <h4 className="text-sm font-bold text-indigo-900 uppercase mb-3">Performance Scorecard</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white p-3 rounded border border-indigo-100">
                   <div className="text-xs text-slate-500 uppercase">KPI Score ({cycle.kpiSectionWeight}%)</div>
                   <div className="text-xl font-bold text-slate-800">{formData?.kpiScore || 0}</div>
                </div>
                <div className="bg-white p-3 rounded border border-indigo-100">
                   <div className="text-xs text-slate-500 uppercase">Values Score ({cycle.coreValueSectionWeight}%)</div>
                   <div className="text-xl font-bold text-slate-800">{formData?.coreValueScore || 0}</div>
                </div>
                <div className="bg-white p-3 rounded border border-indigo-100 ring-2 ring-indigo-100">
                   <div className="text-xs text-indigo-600 uppercase font-bold">Overall Score</div>
                   <div className="text-2xl font-bold text-indigo-600">{formData?.overallScore || 0}</div>
                </div>
             </div>
          </div>
       )}

       {/* Header Info */}
       <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Performance Appraisal: {cycle?.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
             <div>
                <label className="block text-slate-500 text-xs uppercase">Employee</label>
                <div className="font-medium text-slate-900 text-base">{employee.firstName} {employee.lastName}</div>
                <div className="text-slate-500">{employee.employeeCode}</div>
             </div>
             <div>
                <label className="block text-slate-500 text-xs uppercase">Manager</label>
                <div className="font-medium text-slate-900 text-base">{manager ? `${manager.firstName} ${manager.lastName}` : '-'}</div>
             </div>
             <div>
                <label className="block text-slate-500 text-xs uppercase">Department</label>
                <div className="font-medium text-slate-900 text-base">Engineering (Mock)</div>
             </div>
          </div>
       </div>

       {/* KPI Section */}
       <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between">
             <h3 className="text-lg font-bold text-slate-900">Goal Assessment</h3>
             {formData?.kpiScore && <span className="text-sm font-bold text-indigo-600">Section Score: {formData.kpiScore}</span>}
          </div>
          <div className="p-6 space-y-8">
             {plan.goals.map((goal, idx) => {
                const model = scoringModels.find(m => m.id === goal.scoringModelId);
                const rating = formData?.ratings?.[goal.id] || {};

                return (
                   <div key={goal.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <h4 className="font-bold text-slate-800">G{idx+1}. {goal.name}</h4>
                            <p className="text-sm text-slate-500 mt-1">{goal.description}</p>
                         </div>
                         <div className="text-right text-xs">
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded block mb-1">Weight: {goal.weightage}%</span>
                            {goal.isNumericTarget && <div className="text-slate-600">Target: {goal.targetValue} {goal.targetUnit}</div>}
                         </div>
                      </div>
                      
                      {/* Ratings Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-4">
                         
                         {/* Self Rating Section */}
                         <div className={`space-y-3 ${!canEditSelf && 'opacity-80'}`}>
                            <div className="flex items-center justify-between">
                               <label className="text-xs font-bold text-blue-600 uppercase">Self Rating</label>
                               {canEditManager && <div className="text-xs font-bold text-slate-700">{rating.selfRating || '-'}</div>}
                            </div>
                            {canEditSelf ? (
                               <RatingInput 
                                 model={model} 
                                 value={rating.selfRating} 
                                 onChange={(val) => handleRatingChange(goal.id, 'selfRating', val)} 
                               />
                            ) : (
                               <div className="text-sm text-slate-900 font-medium">{renderRatingDisplay(rating.selfRating, model)}</div>
                            )}
                            
                            {canEditSelf ? (
                               <textarea 
                                 className="w-full border-slate-300 rounded text-sm p-2" 
                                 rows={2} 
                                 placeholder="Self comments..." 
                                 value={rating.selfComments || ''}
                                 onChange={(e) => handleRatingChange(goal.id, 'selfComments', e.target.value)}
                               />
                            ) : (
                               <div className="text-sm text-slate-600 italic bg-slate-50 p-2 rounded">{rating.selfComments || 'No comments.'}</div>
                            )}
                         </div>

                         {/* Manager Rating Section - Hidden from Employee until Finalised */}
                         {(isManager || isHR || form.status === AppraisalStatus.FINALISED) && (
                            <div className={`space-y-3 ${!canEditManager && !canEditHR && 'opacity-80'}`}>
                               <div className="flex items-center justify-between">
                                  <label className="text-xs font-bold text-purple-600 uppercase">Manager Rating</label>
                                  {rating.weightedScore !== undefined && (
                                     <span className="text-xs bg-green-50 text-green-700 px-2 rounded">Score: {rating.weightedScore.toFixed(1)}</span>
                                  )}
                               </div>
                               
                               {(canEditManager || canEditHR) ? (
                                 <RatingInput 
                                    model={model} 
                                    value={rating.managerRating} 
                                    onChange={(val) => handleRatingChange(goal.id, 'managerRating', val)} 
                                 />
                               ) : (
                                 <div className="text-sm text-slate-900 font-medium">{renderRatingDisplay(rating.managerRating, model)}</div>
                               )}

                               {(canEditManager || canEditHR) ? (
                                  <textarea 
                                    className="w-full border-slate-300 rounded text-sm p-2" 
                                    rows={2} 
                                    placeholder="Manager feedback..."
                                    value={rating.managerComments || ''}
                                    onChange={(e) => handleRatingChange(goal.id, 'managerComments', e.target.value)} 
                                  />
                               ) : (
                                  <div className="text-sm text-slate-600 italic bg-slate-50 p-2 rounded">{rating.managerComments || 'No comments.'}</div>
                               )}
                            </div>
                         )}
                      </div>
                   </div>
                );
             })}
          </div>
       </div>

       {/* Core Values Section */}
       <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between">
             <h3 className="text-lg font-bold text-slate-900">Core Values Assessment</h3>
             {formData?.coreValueScore && <span className="text-sm font-bold text-indigo-600">Section Score: {formData.coreValueScore}</span>}
          </div>
          <div className="p-6 space-y-8">
             {plan.coreValues.map((cv, idx) => {
                const model = scoringModels.find(m => m.id === cv.scoringModelId);
                const rating = formData?.ratings?.[cv.id] || {};

                return (
                   <div key={cv.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <h4 className="font-bold text-slate-800">V{idx+1}. {cv.name}</h4>
                            <p className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">{cv.behaviouralIndicators}</p>
                         </div>
                         <div className="text-right text-xs">
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded block">Weight: {cv.weightage}%</span>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-4">
                         {/* Self */}
                         <div className="space-y-3">
                            <label className="text-xs font-bold text-blue-600 uppercase block">Self Rating</label>
                            {canEditSelf ? (
                               <RatingInput model={model} value={rating.selfRating} onChange={(val) => handleRatingChange(cv.id, 'selfRating', val)} />
                            ) : (
                               <div className="text-sm font-medium">{renderRatingDisplay(rating.selfRating, model)}</div>
                            )}
                         </div>

                         {/* Manager */}
                         {(isManager || isHR || form.status === AppraisalStatus.FINALISED) && (
                            <div className="space-y-3">
                               <label className="text-xs font-bold text-purple-600 uppercase block">Manager Rating</label>
                               {(canEditManager || canEditHR) ? (
                                  <RatingInput model={model} value={rating.managerRating} onChange={(val) => handleRatingChange(cv.id, 'managerRating', val)} />
                               ) : (
                                  <div className="text-sm font-medium">{renderRatingDisplay(rating.managerRating, model)}</div>
                               )}
                            </div>
                         )}
                      </div>
                   </div>
                );
             })}
          </div>
       </div>

       {/* Summary Section */}
       <div className="bg-white shadow-sm border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
             <h3 className="text-lg font-bold text-slate-900">Qualitative Summary</h3>
          </div>
          <div className="p-6 space-y-6">
             
             {/* Self Summary */}
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">1. Achievements & Self Summary</label>
                {canEditSelf ? (
                   <textarea 
                     rows={4} 
                     className="w-full border border-slate-300 rounded-md p-2"
                     value={formData?.selfAppraisal?.achievements || ''}
                     onChange={e => updateSection('selfAppraisal', 'achievements', e.target.value)}
                     placeholder="Highlight your key achievements..."
                   />
                ) : (
                   <div className="bg-slate-50 p-4 rounded border text-slate-700 whitespace-pre-wrap">{formData?.selfAppraisal?.achievements || 'No input provided.'}</div>
                )}
             </div>

             {/* Manager Summary */}
             {(isManager || isHR || form.status === AppraisalStatus.FINALISED) && (
               <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">2. Manager Summary & Feedback</label>
                  {canEditManager ? (
                     <textarea 
                        rows={4} 
                        className="w-full border border-slate-300 rounded-md p-2"
                        value={formData?.managerAppraisal?.summary || ''}
                        onChange={e => updateSection('managerAppraisal', 'summary', e.target.value)}
                        placeholder="Provide overall feedback..."
                     />
                  ) : (
                     <div className="bg-slate-50 p-4 rounded border text-slate-700 whitespace-pre-wrap">
                        {formData?.managerAppraisal?.summary || 'No input provided.'}
                     </div>
                  )}
               </div>
             )}

             {/* HR Notes */}
             {isHR && (
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">3. HR / Final Notes</label>
                   {canEditHR ? (
                      <textarea 
                        rows={3} 
                        className="w-full border border-slate-300 rounded-md p-2"
                        value={formData?.hrAppraisal?.summary || ''}
                        onChange={e => updateSection('hrAppraisal', 'summary', e.target.value)}
                      />
                   ) : (
                      <div className="bg-slate-50 p-4 rounded border text-slate-700">{formData?.hrAppraisal?.summary || '-'}</div>
                   )}
                </div>
             )}

          </div>
       </div>

       {/* Action Bar */}
       <div className="flex justify-end space-x-4 sticky bottom-6 bg-white p-4 rounded-lg border border-slate-200 shadow-lg">
          {(canEditSelf || canEditManager || canEditHR) && (
             <button onClick={handleSave} className="flex items-center px-4 py-2 border border-slate-300 rounded-md text-slate-700 font-medium hover:bg-slate-50">
                <Save className="w-4 h-4 mr-2" /> Save Draft
             </button>
          )}
          
          {canEditSelf && (
             <button onClick={() => handleSubmit(AppraisalStatus.PENDING_MANAGER)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700">
                <Send className="w-4 h-4 mr-2" /> Submit to Manager
             </button>
          )}

          {canEditManager && (
             <button onClick={() => handleSubmit(AppraisalStatus.PENDING_HR)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700">
                <Send className="w-4 h-4 mr-2" /> Submit to HR
             </button>
          )}

          {canEditHR && form.status !== AppraisalStatus.FINALISED && (
             <button onClick={() => handleSubmit(AppraisalStatus.FINALISED)} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700">
                <Lock className="w-4 h-4 mr-2" /> Finalise Appraisal
             </button>
          )}
       </div>

    </div>
  );
};

// Helper Components for Ratings

const RatingInput: React.FC<{ model?: ScoringModel, value?: number, onChange: (val: number) => void }> = ({ model, value, onChange }) => {
   if (!model) return null;

   if (model.method === 'Rating_1_5') {
      return (
         <select 
            className="block w-full border-slate-300 rounded-md shadow-sm p-2 text-sm"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
         >
            <option value="">Select Rating</option>
            <option value="1">1 - Poor</option>
            <option value="2">2 - Below Average</option>
            <option value="3">3 - Average</option>
            <option value="4">4 - Good</option>
            <option value="5">5 - Excellent</option>
         </select>
      );
   }

   if (model.method === 'Rating_1_10') {
      return (
         <select 
            className="block w-full border-slate-300 rounded-md shadow-sm p-2 text-sm"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
         >
            <option value="">Select Rating</option>
            {Array.from({length: 10}, (_, i) => i + 1).map(num => (
               <option key={num} value={num}>{num}</option>
            ))}
         </select>
      );
   }

   if (model.method === 'Binary_Yes_No') {
      return (
         <select 
            className="block w-full border-slate-300 rounded-md shadow-sm p-2 text-sm"
            value={value === undefined ? '' : value}
            onChange={(e) => onChange(Number(e.target.value))}
         >
            <option value="">Select</option>
            <option value="1">Yes</option>
            <option value="0">No</option>
         </select>
      );
   }

   if (model.method === 'Percentage') {
      return (
         <input 
            type="number" min="0" max="100"
            className="block w-full border-slate-300 rounded-md shadow-sm p-2 text-sm"
            placeholder="0-100"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
         />
      );
   }

   return null;
};
