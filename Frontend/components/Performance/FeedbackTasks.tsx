


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole, RaterStatus } from '../../types';
import { MessageCircleHeart, CheckCircle, Clock } from 'lucide-react';

export const FeedbackTasks: React.FC = () => {
  const navigate = useNavigate();
  const { raterAssignments, feedbackRequests, employees, raterTypes, currentUser } = useApp();
  
  // Find assignments for current user
  const myTasks = raterAssignments.filter(a => a.raterEmployeeId === currentUser.employeeId);

  const getRequest = (id: string) => feedbackRequests.find(r => r.id === id);
  const getEmpName = (id: string) => {
     const e = employees.find(emp => emp.id === id);
     return e ? `${e.firstName} ${e.lastName}` : 'Unknown';
  };
  const getRaterType = (id: string) => raterTypes.find(t => t.id === id)?.name || '-';

  return (
    <div className="space-y-6">
       <div>
         <h1 className="text-2xl font-bold text-slate-900">My Feedback Tasks</h1>
         <p className="text-slate-500 mt-1">Provide 360 feedback for your colleagues.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myTasks.length === 0 ? (
             <div className="col-span-2 text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">
                You have no pending feedback requests.
             </div>
          ) : (
             myTasks.map(task => {
                const req = getRequest(task.feedbackRequestId);
                if (!req) return null;
                
                const isPending = task.status === 'Pending' || task.status === 'Started';
                
                return (
                   <div key={task.id} className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg mr-3">
                               {getEmpName(req.employeeId).charAt(0)}
                            </div>
                            <div>
                               <h3 className="font-bold text-slate-900">{getEmpName(req.employeeId)}</h3>
                               <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">As {getRaterType(task.raterTypeId)}</span>
                            </div>
                         </div>
                         <span className={`px-2 py-1 text-xs font-medium rounded-full ${isPending ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {task.status}
                         </span>
                      </div>

                      <div className="text-sm text-slate-600 mb-4">
                         <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-slate-400" /> Due Date: {req.dueDate ? new Date(req.dueDate).toLocaleDateString() : 'ASAP'}
                         </div>
                         <div className="text-xs text-slate-400">Cycle ID: {req.appraisalCycleId}</div>
                      </div>

                      <button 
                        onClick={() => navigate(`/performance/feedback/${task.id}`)}
                        disabled={!isPending}
                        className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${
                           isPending 
                             ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                             : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                         {isPending ? 'Give Feedback' : 'Feedback Submitted'}
                      </button>
                   </div>
                );
             })
          )}
       </div>
    </div>
  );
};