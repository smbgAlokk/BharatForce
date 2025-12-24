

import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CandidateStage, CANDIDATE_STAGES, Interview, InterviewStatus } from '../../types';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, IndianRupee, Calendar, FileText, Clock, FileSignature } from 'lucide-react';
import { ScheduleInterviewModal } from './ScheduleInterviewModal';

export const CandidateDetail: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const { candidates, updateCandidate, jobPositions, employees, interviews, updateInterview, offers } = useApp();
  
  const candidate = candidates.find(c => c.id === id);
  const [activeTab, setActiveTab] = useState<'overview' | 'interviews'>('overview');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  if (!candidate) return <div>Candidate not found</div>;

  const position = jobPositions.find(p => p.id === candidate.jobPositionId);
  const hiringManager = employees.find(e => e.id === candidate.hiringManagerId);
  const candidateInterviews = interviews.filter(i => i.candidateId === candidate.id);
  
  // Find current offer if any
  const currentOffer = candidate.currentOfferId ? offers.find(o => o.id === candidate.currentOfferId) : null;

  const handleStageChange = (newStage: CandidateStage) => {
    updateCandidate({ ...candidate, stage: newStage });
  };

  const handleCreateOffer = () => {
     navigate(`/recruitment/offers/new?candidateId=${candidate.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
       <button onClick={() => navigate('/recruitment/candidates')} className="flex items-center text-sm text-slate-500 hover:text-slate-700">
         <ArrowLeft className="w-4 h-4 mr-1" /> Back to Candidates
       </button>

       {/* Header */}
       <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
             <div className="flex items-center">
                <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-2xl mr-4">
                   {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
                </div>
                <div>
                   <h1 className="text-2xl font-bold text-slate-900">{candidate.firstName} {candidate.lastName}</h1>
                   <p className="text-sm text-slate-500 flex items-center mt-1">
                      {candidate.currentRole} at {candidate.currentCompany}
                   </p>
                   <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                      <span className="flex items-center"><Mail className="w-3 h-3 mr-1"/> {candidate.email}</span>
                      <span className="flex items-center"><Phone className="w-3 h-3 mr-1"/> {candidate.mobile}</span>
                      <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> {candidate.currentCity}</span>
                   </div>
                </div>
             </div>
             
             <div className="flex flex-col items-end gap-2">
                <label className="text-xs font-medium text-slate-500 uppercase">Current Stage</label>
                <select 
                  value={candidate.stage} 
                  onChange={(e) => handleStageChange(e.target.value as CandidateStage)}
                  className="block w-48 border-slate-300 rounded-md shadow-sm py-1.5 pl-3 pr-8 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                   {CANDIDATE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                
                <div className="flex gap-2">
                   <button 
                     onClick={() => setShowScheduleModal(true)}
                     className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                   >
                     <Calendar className="w-4 h-4 mr-2" /> Interview
                   </button>
                   {currentOffer ? (
                      <button 
                        onClick={() => navigate(`/recruitment/offers/${currentOffer.id}`)}
                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        <FileSignature className="w-4 h-4 mr-2" /> View Offer
                      </button>
                   ) : (
                      <button 
                        onClick={handleCreateOffer}
                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <FileSignature className="w-4 h-4 mr-2" /> Create Offer
                      </button>
                   )}
                </div>
             </div>
          </div>
       </div>

       {/* Tabs */}
       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden min-h-[400px]">
          <div className="border-b border-slate-200 px-6">
             <nav className="-mb-px flex space-x-8">
                <button
                   onClick={() => setActiveTab('overview')}
                   className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                   Overview
                </button>
                <button
                   onClick={() => setActiveTab('interviews')}
                   className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'interviews' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                   Interviews ({candidateInterviews.length})
                </button>
             </nav>
          </div>

          <div className="p-6">
             {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="md:col-span-2 space-y-6">
                      <section>
                         <h3 className="text-sm font-bold text-slate-900 uppercase mb-3">Professional Summary</h3>
                         <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700">
                            {candidate.summary || 'No summary provided.'}
                         </div>
                      </section>
                       <section>
                         <h3 className="text-sm font-bold text-slate-900 uppercase mb-3">Key Skills</h3>
                         <div className="flex flex-wrap gap-2">
                            {candidate.skills.map(skill => (
                               <span key={skill} className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-sm font-medium border border-indigo-100">
                                  {skill}
                               </span>
                            ))}
                         </div>
                      </section>
                      <section>
                         <h3 className="text-sm font-bold text-slate-900 uppercase mb-3">Details</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 border rounded-lg">
                               <div className="text-xs text-slate-500 uppercase">Total Experience</div>
                               <div className="font-medium">{candidate.totalExperience}</div>
                            </div>
                             <div className="p-3 border rounded-lg">
                               <div className="text-xs text-slate-500 uppercase">Notice Period</div>
                               <div className="font-medium">{candidate.noticePeriod}</div>
                            </div>
                             <div className="p-3 border rounded-lg">
                               <div className="text-xs text-slate-500 uppercase">Current CTC</div>
                               <div className="font-medium">{candidate.currentCtc}</div>
                            </div>
                             <div className="p-3 border rounded-lg">
                               <div className="text-xs text-slate-500 uppercase">Expected CTC</div>
                               <div className="font-medium">{candidate.expectedCtc}</div>
                            </div>
                         </div>
                      </section>
                   </div>
                   
                   <div className="space-y-6">
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                         <h4 className="text-sm font-bold text-slate-900 mb-3">Application Info</h4>
                         <div className="space-y-3 text-sm">
                            <div>
                               <span className="text-slate-500 block text-xs uppercase">Applied For</span>
                               <span className="font-medium text-indigo-600">{position?.title}</span>
                            </div>
                             <div>
                               <span className="text-slate-500 block text-xs uppercase">Hiring Manager</span>
                               <span className="font-medium">{hiringManager ? `${hiringManager.firstName} ${hiringManager.lastName}` : '-'}</span>
                            </div>
                            <div>
                               <span className="text-slate-500 block text-xs uppercase">Date Applied</span>
                               <span className="font-medium">{new Date(candidate.dateApplied).toLocaleDateString()}</span>
                            </div>
                             <div>
                               <span className="text-slate-500 block text-xs uppercase">Source</span>
                               <span className="font-medium">{candidate.source}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {activeTab === 'interviews' && (
                <div className="space-y-4">
                   {candidateInterviews.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                         <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                         <p>No interviews scheduled yet.</p>
                         <button onClick={() => setShowScheduleModal(true)} className="mt-4 text-indigo-600 font-medium hover:underline">Schedule one now</button>
                      </div>
                   ) : (
                      candidateInterviews.map(int => (
                         <div key={int.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex justify-between items-start">
                               <div>
                                  <div className="flex items-center gap-2 mb-1">
                                     <span className="font-bold text-slate-900">{int.stage}</span>
                                     <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{int.type}</span>
                                  </div>
                                  <div className="text-sm text-slate-500 flex items-center gap-4">
                                     <span className="flex items-center"><Calendar className="w-3 h-3 mr-1"/> {new Date(int.scheduledAt).toLocaleDateString()}</span>
                                     <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {new Date(int.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({int.duration} mins)</span>
                                  </div>
                               </div>
                               <div className="flex flex-col items-end gap-2">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full 
                                     ${int.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                                       int.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                                       'bg-blue-100 text-blue-800'}`}>
                                     {int.status}
                                  </span>
                                  {int.status === 'Scheduled' && (
                                     <div className="flex gap-2">
                                        <button onClick={() => updateInterview({...int, status: 'Completed'})} className="text-xs text-green-600 hover:underline">Mark Complete</button>
                                        <button onClick={() => updateInterview({...int, status: 'Cancelled'})} className="text-xs text-red-600 hover:underline">Cancel</button>
                                     </div>
                                  )}
                               </div>
                            </div>
                            {int.locationLink && (
                               <div className="mt-3 text-sm bg-white p-2 border rounded text-slate-600 flex items-center">
                                  <span className="font-medium mr-2">Link:</span> 
                                  <a href={int.locationLink} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate">{int.locationLink}</a>
                               </div>
                            )}
                         </div>
                      ))
                   )}
                </div>
             )}
          </div>
       </div>

      {showScheduleModal && (
         <ScheduleInterviewModal 
            candidate={candidate}
            onClose={() => setShowScheduleModal(false)}
         />
      )}
    </div>
  );
};