
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PositionStatus, UserRole } from '../../types';
import { ArrowLeft, Briefcase, MapPin, CheckCircle } from 'lucide-react';

export const PositionDetail: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const { jobPositions, updateJobPosition, userRole, employees, branches, departments } = useApp();
  
  const pos = jobPositions.find(p => p.id === id);
  const [editStatus, setEditStatus] = useState(false);

  if (!pos) return <div>Position not found</div>;

  const getEmpName = (id: string) => {
      const e = employees.find(em => em.id === id);
      return e ? `${e.firstName} ${e.lastName}` : id;
  };
  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || '-';
  const getBranchName = (id: string) => branches.find(b => b.id === id)?.name || '-';

  const handleStatusChange = (newStatus: PositionStatus) => {
    updateJobPosition({ ...pos, status: newStatus });
    setEditStatus(false);
  };

  const canEdit = userRole === UserRole.COMPANY_ADMIN;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate('/recruitment/positions')} className="flex items-center text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Positions
      </button>

      <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
         {/* Banner / Header */}
         <div className="px-6 py-6 bg-slate-50 border-b border-slate-200">
            <div className="flex justify-between items-start">
               <div>
                  <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                    {pos.title}
                    <span className="ml-3 text-sm font-normal text-slate-500 font-mono bg-white border px-2 rounded">{pos.positionCode}</span>
                  </h1>
                   <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                     <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1 text-slate-400"/> {getDeptName(pos.departmentId)}</span>
                     <span className="flex items-center"><MapPin className="w-4 h-4 mr-1 text-slate-400"/> {getBranchName(pos.branchId)}</span>
                     <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-medium">{pos.employmentType}</span>
                  </div>
               </div>
               <div className="text-right">
                  {editStatus ? (
                    <select 
                      value={pos.status} 
                      onChange={(e) => handleStatusChange(e.target.value as PositionStatus)}
                      className="block w-32 pl-3 pr-8 py-1.5 border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value={PositionStatus.OPEN}>Open</option>
                      <option value={PositionStatus.PAUSED}>Paused</option>
                      <option value={PositionStatus.CLOSED}>Closed</option>
                    </select>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                       <span className={`px-3 py-1 text-sm font-medium rounded-full 
                          ${pos.status === PositionStatus.OPEN ? 'bg-green-100 text-green-800' : 
                            pos.status === PositionStatus.PAUSED ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-slate-100 text-slate-800'}`}>
                          {pos.status}
                       </span>
                       {canEdit && (
                         <button onClick={() => setEditStatus(true)} className="text-xs text-indigo-600 hover:underline">Change</button>
                       )}
                    </div>
                  )}
               </div>
            </div>
         </div>

         <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Content: JD */}
            <div className="md:col-span-2 space-y-6">
                <section>
                   <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">About the Role</h3>
                   <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{pos.jobSummary}</p>
                </section>
                <section>
                   <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">Key Responsibilities</h3>
                   <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{pos.responsibilities}</p>
                </section>
                 <section>
                   <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">Skills & Experience</h3>
                   <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm space-y-2">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-slate-500">Required Skills:</div>
                        <div className="col-span-2 font-medium">{pos.requiredSkills}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-slate-500">Experience:</div>
                        <div className="col-span-2 font-medium">{pos.experienceRange}</div>
                      </div>
                   </div>
                </section>
            </div>

            {/* Right Sidebar: Stats */}
            <div className="space-y-6">
               <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">Hiring Progress</h4>
                  
                  <div className="flex items-center justify-between mb-2 text-sm">
                     <span className="text-slate-500">Total Approved:</span>
                     <span className="font-bold">{pos.approvedHeadcount}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4 text-sm">
                     <span className="text-slate-500">Still Open:</span>
                     <span className="font-bold text-indigo-600">{pos.openHeadcount}</span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                     <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${((pos.approvedHeadcount - pos.openHeadcount) / pos.approvedHeadcount) * 100}%` }}></div>
                  </div>
                  <div className="text-xs text-center text-slate-400">
                     {(pos.approvedHeadcount - pos.openHeadcount)} filled
                  </div>
               </div>

               <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm space-y-3">
                   <div className="flex justify-between">
                      <span className="text-slate-500">Hiring Manager:</span>
                      <span className="font-medium">{getEmpName(pos.hiringManagerId)}</span>
                   </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Budget:</span>
                      <span className="font-medium">{pos.budgetedCtcRange || '-'}</span>
                   </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
