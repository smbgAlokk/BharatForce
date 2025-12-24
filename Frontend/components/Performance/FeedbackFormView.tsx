


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { FeedbackResponse } from '../../types';
import { ArrowLeft, Send, Save } from 'lucide-react';

export const FeedbackFormView: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const { raterAssignments, feedbackRequests, feedbackTemplates, questionBank, employees, raterTypes, submitFeedbackResponse } = useApp();

  const assignment = raterAssignments.find(a => a.id === id);
  const request = feedbackRequests.find(r => r.id === assignment?.feedbackRequestId);
  const template = feedbackTemplates.find(t => t.id === request?.templateId);

  // Form State
  const [answers, setAnswers] = useState<Record<string, { rating?: number, comment?: string }>>({});
  const [overallComments, setOverallComments] = useState('');

  if (!assignment || !request || !template) return <div>Task not found</div>;

  const employee = employees.find(e => e.id === request.employeeId);
  const raterType = raterTypes.find(rt => rt.id === assignment.raterTypeId);

  // Get Questions for this Rater Type
  const questionConfig = template.questionSets[assignment.raterTypeId] || [];
  const questions = questionConfig.map(c => {
     const q = questionBank.find(qb => qb.id === c.questionId);
     return q ? { ...q, isMandatory: c.isMandatory } : null;
  }).filter(Boolean) as any[];

  // Group questions by category
  const groupedQuestions: Record<string, typeof questions> = {};
  questions.forEach(q => {
     if (!groupedQuestions[q.category]) groupedQuestions[q.category] = [];
     groupedQuestions[q.category].push(q);
  });

  const handleAnswerChange = (qId: string, field: 'rating' | 'comment', value: any) => {
     setAnswers(prev => ({
        ...prev,
        [qId]: { ...prev[qId], [field]: value }
     }));
  };

  const handleSubmit = () => {
     // Basic validation for mandatory
     const missing = questions.filter(q => q.isMandatory && (!answers[q.id]?.rating && !answers[q.id]?.comment));
     if (missing.length > 0) {
        alert(`Please answer all mandatory questions.`);
        return;
     }

     const response: FeedbackResponse = {
        id: `resp-${Date.now()}`,
        feedbackRequestId: request.id,
        raterAssignmentId: assignment.id,
        answers,
        overallComments,
        submittedOn: new Date().toISOString()
     };

     submitFeedbackResponse(response);
     alert('Feedback submitted successfully!');
     navigate('/performance/feedback-tasks');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
       <button onClick={() => navigate('/performance/feedback-tasks')} className="flex items-center text-sm text-slate-500 hover:text-slate-700">
         <ArrowLeft className="w-4 h-4 mr-1" /> Back
       </button>

       {/* Header */}
       <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">360 Feedback for {employee?.firstName} {employee?.lastName}</h1>
          <div className="flex gap-4 text-sm text-slate-500">
             <span className="bg-slate-100 px-2 py-1 rounded">Role: {raterType?.name}</span>
             <span>Due: {request.dueDate || 'ASAP'}</span>
          </div>
       </div>

       {/* Questions */}
       {Object.entries(groupedQuestions).map(([category, qs]) => (
          <div key={category} className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
             <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-800">{category}</h3>
             </div>
             <div className="p-6 space-y-8">
                {qs.map(q => (
                   <div key={q.id} className="space-y-3">
                      <div className="flex items-start justify-between">
                         <label className="block text-sm font-medium text-slate-900">
                            {q.text} {q.isMandatory && <span className="text-red-500">*</span>}
                         </label>
                      </div>
                      
                      {(q.questionType === 'Rating' || q.questionType === 'Rating + Comment') && (
                         <div className="flex gap-4 items-center">
                            <span className="text-xs text-slate-500 uppercase">Rating:</span>
                            <div className="flex gap-2">
                               {[1, 2, 3, 4, 5].map(num => (
                                  <button
                                    key={num}
                                    className={`w-8 h-8 rounded-full border text-sm font-bold transition-colors ${
                                       answers[q.id]?.rating === num ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
                                    }`}
                                    onClick={() => handleAnswerChange(q.id, 'rating', num)}
                                  >
                                     {num}
                                  </button>
                               ))}
                            </div>
                         </div>
                      )}

                      {(q.questionType === 'Comment' || q.questionType === 'Rating + Comment') && (
                         <textarea 
                           rows={2}
                           className="w-full border border-slate-300 rounded-md p-2 text-sm"
                           placeholder="Enter your comments..."
                           value={answers[q.id]?.comment || ''}
                           onChange={e => handleAnswerChange(q.id, 'comment', e.target.value)}
                         />
                      )}
                   </div>
                ))}
             </div>
          </div>
       ))}

       {/* Overall */}
       <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
          <label className="block text-sm font-bold text-slate-900 mb-2">Overall Comments / Summary</label>
          <textarea 
             rows={4}
             className="w-full border border-slate-300 rounded-md p-2 text-sm"
             placeholder="Any additional feedback..."
             value={overallComments}
             onChange={e => setOverallComments(e.target.value)}
          />
       </div>

       <div className="flex justify-end">
          <button onClick={handleSubmit} className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md font-bold shadow hover:bg-green-700 transition-all">
             <Send className="w-4 h-4 mr-2" /> Submit Feedback
          </button>
       </div>
    </div>
  );
};