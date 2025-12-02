




import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FeedbackRequest } from '../../types';
import { X, MessageSquare } from 'lucide-react';

interface Props {
  request: FeedbackRequest;
  onClose: () => void;
}

export const FeedbackResultView: React.FC<Props> = ({ request, onClose }) => {
  const { feedbackResponses, raterAssignments, raterTypes, questionBank, feedbackTemplates } = useApp();

  const responses = feedbackResponses.filter(r => r.feedbackRequestId === request.id);
  const assignments = raterAssignments.filter(a => a.feedbackRequestId === request.id);
  const template = feedbackTemplates.find(t => t.id === request.templateId);

  // Aggregate answers by question
  // We need to iterate all questions in the template (across all rater types)
  const allQuestionIds = new Set<string>();
  if (template) {
     Object.values(template.questionSets).forEach((set: any) => {
        set.forEach((q: any) => allQuestionIds.add(q.questionId));
     });
  }

  const questions = Array.from(allQuestionIds).map(id => questionBank.find(q => q.id === id)).filter(Boolean) as any[];

  const getRaterTypeName = (assignmentId: string) => {
     const assign = assignments.find(a => a.id === assignmentId);
     return raterTypes.find(t => t.id === assign?.raterTypeId)?.name || 'Unknown';
  };

  // Helper to check if response exists
  const getAnswersForQuestion = (qId: string) => {
     return responses.map(resp => ({
        raterType: getRaterTypeName(resp.raterAssignmentId),
        answer: resp.answers[qId]
     })).filter(item => item.answer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
       <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-0 h-[85vh] flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <h3 className="text-lg font-bold text-slate-900">Feedback Results</h3>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
             {/* Summary Stats */}
             <div className="grid grid-cols-4 gap-4 text-center">
                <div className="bg-indigo-50 p-3 rounded">
                   <div className="text-xs text-slate-500 uppercase">Total Responses</div>
                   <div className="text-xl font-bold text-indigo-700">{responses.length}</div>
                </div>
                {/* Can add avg rating calculation here later */}
             </div>

             {/* Question Breakdown */}
             <div className="space-y-6">
                {questions.map((q, idx) => {
                   const answers = getAnswersForQuestion(q.id);
                   if (answers.length === 0) return null;

                   return (
                      <div key={q.id} className="border border-slate-200 rounded-lg overflow-hidden">
                         <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-medium text-slate-800 text-sm">
                            Q{idx+1}. {q.text}
                         </div>
                         <div className="divide-y divide-slate-100">
                            {answers.map((item, i) => (
                               <div key={i} className="p-3 flex gap-4">
                                  <div className="w-32 flex-shrink-0 text-xs font-bold text-slate-500 uppercase pt-1">
                                     {item.raterType}
                                  </div>
                                  <div className="flex-1 text-sm">
                                     {item.answer.rating && (
                                        <div className="mb-1">
                                           <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded text-xs font-bold">Rating: {item.answer.rating}</span>
                                        </div>
                                     )}
                                     <div className="text-slate-700">{item.answer.comment || <span className="italic text-slate-400">No comment</span>}</div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   );
                })}
             </div>

             {/* Overall Comments */}
             <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-bold text-slate-900">
                   Overall Summary Comments
                </div>
                <div className="divide-y divide-slate-100">
                   {responses.filter(r => r.overallComments).map((r, i) => (
                      <div key={i} className="p-3 flex gap-4">
                         <div className="w-32 flex-shrink-0 text-xs font-bold text-slate-500 uppercase pt-1">
                            {getRaterTypeName(r.raterAssignmentId)}
                         </div>
                         <div className="flex-1 text-sm text-slate-700">
                            {r.overallComments}
                         </div>
                      </div>
                   ))}
                </div>
             </div>

          </div>
       </div>
    </div>
  );
};