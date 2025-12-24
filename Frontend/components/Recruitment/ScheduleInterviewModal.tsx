
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Candidate, Interview, InterviewType, CandidateStage } from '../../types';
import { X } from 'lucide-react';

interface Props {
  candidate: Candidate;
  onClose: () => void;
}

export const ScheduleInterviewModal: React.FC<Props> = ({ candidate, onClose }) => {
  const { addInterview, employees, currentTenant, currentUser } = useApp();

  const [formData, setFormData] = useState<Partial<Interview>>({
    type: 'Video',
    duration: 45,
    stage: candidate.stage,
    interviewerIds: []
  });

  // Filter potential interviewers (active employees in same tenant)
  const potentialInterviewers = employees.filter(e => e.companyId === currentTenant?.id && e.status === 'Active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.scheduledAt || !formData.interviewerIds?.length) return;

    const newInterview: Interview = {
      id: `int-${Date.now()}`,
      companyId: candidate.companyId,
      candidateId: candidate.id,
      jobPositionId: candidate.jobPositionId,
      status: 'Scheduled',
      
      stage: formData.stage as CandidateStage,
      type: formData.type as InterviewType,
      scheduledAt: formData.scheduledAt,
      duration: formData.duration || 45,
      locationLink: formData.locationLink,
      interviewerIds: formData.interviewerIds,
      notes: formData.notes,
      
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name
    };

    addInterview(newInterview);
    onClose();
  };

  const toggleInterviewer = (id: string) => {
    const current = formData.interviewerIds || [];
    if (current.includes(id)) {
      setFormData({...formData, interviewerIds: current.filter(i => i !== id)});
    } else {
      setFormData({...formData, interviewerIds: [...current, id]});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Schedule Interview</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-50 p-3 rounded text-sm mb-4">
             <span className="text-slate-500">Candidate:</span> <span className="font-semibold">{candidate.firstName} {candidate.lastName}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700">Interview Type</label>
                <select 
                  required 
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                >
                   <option value="Telephonic">Telephonic</option>
                   <option value="Video">Video</option>
                   <option value="In-person">In-person</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Stage</label>
                <input 
                   type="text" disabled value={formData.stage} 
                   className="mt-1 block w-full border border-slate-300 bg-slate-100 rounded-md py-2 px-3 sm:text-sm text-slate-500"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700">Date & Time</label>
                <input 
                  required type="datetime-local"
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                  value={formData.scheduledAt || ''}
                  onChange={e => setFormData({...formData, scheduledAt: e.target.value})}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">Duration (mins)</label>
                <input 
                  required type="number" min="15" step="15"
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})}
                />
             </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700">Location / Link</label>
             <input 
               type="text" 
               className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
               placeholder="Google Meet Link or Office Room"
               value={formData.locationLink || ''}
               onChange={e => setFormData({...formData, locationLink: e.target.value})}
             />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-2">Select Interviewers</label>
             <div className="max-h-32 overflow-y-auto border border-slate-300 rounded-md p-2 space-y-2">
                {potentialInterviewers.map(emp => (
                   <label key={emp.id} className="flex items-center space-x-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={formData.interviewerIds?.includes(emp.id)}
                        onChange={() => toggleInterviewer(emp.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{emp.firstName} {emp.lastName}</span>
                   </label>
                ))}
             </div>
          </div>
          
          <div>
             <label className="block text-sm font-medium text-slate-700">Notes</label>
             <textarea 
               rows={2}
               className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
               value={formData.notes || ''}
               onChange={e => setFormData({...formData, notes: e.target.value})}
             />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Schedule</button>
          </div>
        </form>
      </div>
    </div>
  );
};
