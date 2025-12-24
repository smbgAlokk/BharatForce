
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CandidateStage, CANDIDATE_STAGES, UserRole } from '../../types';
import { User } from 'lucide-react';

export const PipelineBoard: React.FC = () => {
  const navigate = useNavigate();
  const { candidates, jobPositions, currentTenant, userRole, currentUser, updateCandidate } = useApp();
  const [selectedPosId, setSelectedPosId] = useState<string>(jobPositions[0]?.id || '');

  // Drag State
  const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null);

  const myPositions = jobPositions.filter(p => {
    if (p.companyId !== currentTenant?.id) return false;
    if (userRole === UserRole.MANAGER) return p.hiringManagerId === currentUser.employeeId;
    return true;
  });

  // Ensure we have a selected position if available
  if (!selectedPosId && myPositions.length > 0) {
    setSelectedPosId(myPositions[0].id);
  }

  const filteredCandidates = candidates.filter(c => c.jobPositionId === selectedPosId);

  const onDragStart = (e: React.DragEvent, candId: string) => {
    setDraggedCandidateId(candId);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const onDrop = (e: React.DragEvent, stage: CandidateStage) => {
    e.preventDefault();
    if (draggedCandidateId) {
      const candidate = candidates.find(c => c.id === draggedCandidateId);
      if (candidate && candidate.stage !== stage) {
        updateCandidate({ ...candidate, stage });
      }
      setDraggedCandidateId(null);
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-200px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
           <label className="text-sm font-medium text-slate-700">Job Position:</label>
           <select 
            className="block w-64 pl-3 pr-8 py-2 border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={selectedPosId}
            onChange={e => setSelectedPosId(e.target.value)}
           >
             {myPositions.map(p => (
               <option key={p.id} value={p.id}>{p.title}</option>
             ))}
           </select>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto custom-scrollbar pb-4">
        <div className="inline-flex h-full space-x-4 min-w-max">
          {CANDIDATE_STAGES.map(stage => {
            const stageCandidates = filteredCandidates.filter(c => c.stage === stage);
            
            return (
              <div 
                key={stage} 
                className="w-72 flex-shrink-0 bg-slate-100 rounded-lg flex flex-col border border-slate-200"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, stage)}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-lg">
                  <h4 className="font-semibold text-slate-700 text-sm">{stage}</h4>
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {stageCandidates.length}
                  </span>
                </div>
                
                {/* Cards Container */}
                <div className="p-2 flex-1 overflow-y-auto custom-scrollbar space-y-2">
                   {stageCandidates.map(cand => (
                     <div 
                        key={cand.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, cand.id)}
                        onClick={() => navigate(`/recruitment/candidates/${cand.id}`)}
                        className="bg-white p-3 rounded border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                     >
                        <div className="flex items-start justify-between">
                           <div className="font-medium text-slate-900 text-sm truncate">{cand.firstName} {cand.lastName}</div>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{cand.currentRole}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{cand.currentCompany}</div>
                        
                        <div className="mt-3 flex items-center justify-between">
                           <div className="flex items-center text-xs text-slate-500">
                             <User className="w-3 h-3 mr-1" />
                             {cand.totalExperience || '0 Exp'}
                           </div>
                           {cand.expectedCtc && (
                              <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                                {cand.expectedCtc}
                              </span>
                           )}
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
