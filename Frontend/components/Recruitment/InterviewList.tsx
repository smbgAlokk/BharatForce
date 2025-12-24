
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Interview, Feedback } from '../../types';
import { Calendar, Clock, MapPin, Video, Phone, Star } from 'lucide-react';

export const InterviewList: React.FC = () => {
  const { interviews, candidates, jobPositions, currentUser, updateInterview } = useApp();
  
  const myInterviews = interviews.filter(int => 
    int.interviewerIds.includes(currentUser.employeeId || '') &&
    int.status !== 'Cancelled'
  );

  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [feedbackForm, setFeedbackForm] = useState<Partial<Feedback>>({ rating: 3, recommendation: 'Hold' });

  const getCandidate = (id: string) => candidates.find(c => c.id === id);
  const getPosition = (id: string) => jobPositions.find(p => p.id === id);

  const openFeedback = (int: Interview) => {
     setSelectedInterview(int);
     // Check if feedback already exists
     const existing = int.feedback?.find(f => f.interviewerId === currentUser.employeeId);
     if (existing) {
        setFeedbackForm(existing);
     } else {
        setFeedbackForm({ rating: 3, recommendation: 'Hold', comments: '' });
     }
  };

  const submitFeedback = (e: React.FormEvent) => {
     e.preventDefault();
     if (!selectedInterview || !currentUser.employeeId) return;

     const newFeedback: Feedback = {
        interviewerId: currentUser.employeeId,
        rating: feedbackForm.rating || 3,
        comments: feedbackForm.comments || '',
        recommendation: feedbackForm.recommendation || 'Hold',
        submittedOn: new Date().toISOString()
     };

     const existingFeedbacks = selectedInterview.feedback || [];
     // Replace if exists or push new
     const updatedFeedbacks = existingFeedbacks.filter(f => f.interviewerId !== currentUser.employeeId);
     updatedFeedbacks.push(newFeedback);

     updateInterview({
        ...selectedInterview,
        feedback: updatedFeedbacks,
        status: 'Completed' // Auto complete for simplicity
     });
     
     setSelectedInterview(null);
  };

  return (
    <div className="space-y-6">
       <div>
         <h1 className="text-2xl font-bold text-slate-900">My Interviews</h1>
         <p className="text-slate-500 mt-1">Upcoming interviews assigned to you.</p>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
             {myInterviews.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow border border-slate-200 text-center text-slate-500">
                   You have no scheduled interviews.
                </div>
             ) : (
                myInterviews.map(int => {
                   const cand = getCandidate(int.candidateId);
                   const pos = getPosition(int.jobPositionId);
                   const isCompleted = int.status === 'Completed';
                   
                   return (
                      <div key={int.id} className="bg-white p-5 rounded-lg shadow border border-slate-200 hover:shadow-md transition-shadow">
                         <div className="flex justify-between items-start mb-3">
                            <div>
                               <h3 className="font-bold text-slate-900">{cand?.firstName} {cand?.lastName}</h3>
                               <div className="text-sm text-slate-500">{pos?.title}</div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                               {int.status}
                            </span>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-4">
                            <div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-slate-400"/> {new Date(int.scheduledAt).toLocaleDateString()}</div>
                            <div className="flex items-center"><Clock className="w-4 h-4 mr-2 text-slate-400"/> {new Date(int.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            <div className="flex items-center col-span-2">
                               {int.type === 'Video' ? <Video className="w-4 h-4 mr-2 text-slate-400"/> : int.type === 'Telephonic' ? <Phone className="w-4 h-4 mr-2 text-slate-400"/> : <MapPin className="w-4 h-4 mr-2 text-slate-400"/>}
                               {int.type}
                            </div>
                         </div>

                         <button 
                           onClick={() => openFeedback(int)}
                           className="w-full py-2 border border-indigo-600 text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-50 transition-colors"
                         >
                            {isCompleted ? 'Update Feedback' : 'Give Feedback'}
                         </button>
                      </div>
                   );
                })
             )}
          </div>

          {/* Feedback Panel */}
          {selectedInterview ? (
             <div className="bg-white p-6 rounded-lg shadow border border-slate-200 h-fit sticky top-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Interview Feedback</h3>
                <form onSubmit={submitFeedback} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Rating (1-5)</label>
                      <div className="flex gap-2">
                         {[1, 2, 3, 4, 5].map(num => (
                            <button 
                              key={num} type="button"
                              onClick={() => setFeedbackForm({...feedbackForm, rating: num})}
                              className={`p-2 rounded-full ${feedbackForm.rating && feedbackForm.rating >= num ? 'text-yellow-400' : 'text-slate-300'}`}
                            >
                               <Star className="w-6 h-6 fill-current" />
                            </button>
                         ))}
                      </div>
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Recommendation</label>
                      <select 
                        className="block w-full border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                        value={feedbackForm.recommendation}
                        onChange={e => setFeedbackForm({...feedbackForm, recommendation: e.target.value as any})}
                      >
                         <option value="Next Stage">Move to Next Stage</option>
                         <option value="Hold">Hold</option>
                         <option value="Reject">Reject</option>
                      </select>
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Comments</label>
                      <textarea 
                        required rows={4}
                        className="block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Detailed feedback..."
                        value={feedbackForm.comments}
                        onChange={e => setFeedbackForm({...feedbackForm, comments: e.target.value})}
                      />
                   </div>

                   <div className="flex justify-end space-x-3 pt-4">
                      <button type="button" onClick={() => setSelectedInterview(null)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Submit Feedback</button>
                   </div>
                </form>
             </div>
          ) : (
             <div className="hidden lg:flex items-center justify-center h-64 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                Select an interview to provide feedback.
             </div>
          )}
       </div>
    </div>
  );
};
