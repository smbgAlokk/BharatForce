
import React, { useState } from 'react';
import { Employee, Education, Experience } from '../../../types';
import { Plus, Edit2, Trash2, GraduationCap, Briefcase, X } from 'lucide-react';

interface Props {
  employee: Employee;
  isReadOnly: boolean;
  onSave: (data: Partial<Employee>) => void;
}

export const EducationTab: React.FC<Props> = ({ employee, isReadOnly, onSave }) => {
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [expModalOpen, setExpModalOpen] = useState(false);
  
  const [currentEdu, setCurrentEdu] = useState<Partial<Education>>({});
  const [currentExp, setCurrentExp] = useState<Partial<Experience>>({});

  // Education Handlers
  const openEduModal = (item?: Education) => {
    setCurrentEdu(item || {});
    setEduModalOpen(true);
  };

  const saveEducation = (e: React.FormEvent) => {
    e.preventDefault();
    const newEdu = { ...currentEdu, id: currentEdu.id || `edu-${Date.now()}` } as Education;
    const updatedList = currentEdu.id 
      ? (employee.education || []).map(x => x.id === currentEdu.id ? newEdu : x)
      : [...(employee.education || []), newEdu];
    
    onSave({ education: updatedList });
    setEduModalOpen(false);
  };

  const deleteEducation = (id: string) => {
    if (window.confirm('Delete this education record?')) {
      const updatedList = (employee.education || []).filter(x => x.id !== id);
      onSave({ education: updatedList });
    }
  };

  // Experience Handlers
  const openExpModal = (item?: Experience) => {
    setCurrentExp(item || {});
    setExpModalOpen(true);
  };

  const saveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp = { ...currentExp, id: currentExp.id || `exp-${Date.now()}` } as Experience;
    const updatedList = currentExp.id 
      ? (employee.experience || []).map(x => x.id === currentExp.id ? newExp : x)
      : [...(employee.experience || []), newExp];
    
    onSave({ experience: updatedList });
    setExpModalOpen(false);
  };

  const deleteExperience = (id: string) => {
    if (window.confirm('Delete this experience record?')) {
      const updatedList = (employee.experience || []).filter(x => x.id !== id);
      onSave({ experience: updatedList });
    }
  };

  return (
    <div className="space-y-8">
      
      {/* SECTION 1: EDUCATION */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div className="flex items-center">
             <GraduationCap className="w-5 h-5 text-slate-500 mr-2" />
             <h3 className="text-lg font-medium text-slate-900">Education Details</h3>
          </div>
          {!isReadOnly && (
            <button onClick={() => openEduModal()} className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-1" /> Add Education
            </button>
          )}
        </div>
        
        <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
          {(employee.education && employee.education.length > 0) ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Degree / Qualification</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Institution / University</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Grade / %</th>
                  {!isReadOnly && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {employee.education.map(edu => (
                  <tr key={edu.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      {edu.degree}
                      <div className="text-xs text-slate-500">{edu.specialization}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{edu.institution}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{edu.yearOfPassing}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{edu.grade}</td>
                    {!isReadOnly && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                         <button onClick={() => openEduModal(edu)} className="text-indigo-600 hover:text-indigo-900"><Edit2 className="h-4 w-4"/></button>
                         <button onClick={() => deleteEducation(edu.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4"/></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-slate-500 text-sm">No education records found.</div>
          )}
        </div>
      </div>

      {/* SECTION 2: EXPERIENCE */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div className="flex items-center">
             <Briefcase className="w-5 h-5 text-slate-500 mr-2" />
             <h3 className="text-lg font-medium text-slate-900">Previous Employment</h3>
          </div>
          {!isReadOnly && (
            <button onClick={() => openExpModal()} className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-1" /> Add Experience
            </button>
          )}
        </div>
        
        <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
          {(employee.experience && employee.experience.length > 0) ? (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Last CTC</th>
                  {!isReadOnly && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {employee.experience.map(exp => (
                  <tr key={exp.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{exp.companyName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{exp.jobTitle}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {exp.startDate} to {exp.endDate || 'Present'}
                      <div className="text-xs text-slate-400">{exp.reasonForLeaving}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{exp.lastCtc}</td>
                    {!isReadOnly && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                         <button onClick={() => openExpModal(exp)} className="text-indigo-600 hover:text-indigo-900"><Edit2 className="h-4 w-4"/></button>
                         <button onClick={() => deleteExperience(exp.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4"/></button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-slate-500 text-sm">No previous experience records found.</div>
          )}
        </div>
      </div>

      {/* Education Modal */}
      {eduModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{currentEdu.id ? 'Edit' : 'Add'} Education</h3>
              <button onClick={() => setEduModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={saveEducation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Degree / Qualification *</label>
                <input required type="text" value={currentEdu.degree || ''} onChange={e => setCurrentEdu({...currentEdu, degree: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Specialization</label>
                <input type="text" value={currentEdu.specialization || ''} onChange={e => setCurrentEdu({...currentEdu, specialization: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Institution / University *</label>
                <input required type="text" value={currentEdu.institution || ''} onChange={e => setCurrentEdu({...currentEdu, institution: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700">Year of Passing</label>
                  <input type="number" value={currentEdu.yearOfPassing || ''} onChange={e => setCurrentEdu({...currentEdu, yearOfPassing: parseInt(e.target.value)})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700">Grade / %</label>
                  <input type="text" value={currentEdu.grade || ''} onChange={e => setCurrentEdu({...currentEdu, grade: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setEduModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {expModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
             <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{currentExp.id ? 'Edit' : 'Add'} Experience</h3>
              <button onClick={() => setExpModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={saveExperience} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Company Name *</label>
                <input required type="text" value={currentExp.companyName || ''} onChange={e => setCurrentExp({...currentExp, companyName: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Job Title / Role *</label>
                <input required type="text" value={currentExp.jobTitle || ''} onChange={e => setCurrentExp({...currentExp, jobTitle: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700">Start Date *</label>
                  <input required type="date" value={currentExp.startDate || ''} onChange={e => setCurrentExp({...currentExp, startDate: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700">End Date</label>
                  <input type="date" value={currentExp.endDate || ''} onChange={e => setCurrentExp({...currentExp, endDate: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Last CTC</label>
                <input type="text" value={currentExp.lastCtc || ''} onChange={e => setCurrentExp({...currentExp, lastCtc: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700">Reason for Leaving</label>
                <input type="text" value={currentExp.reasonForLeaving || ''} onChange={e => setCurrentExp({...currentExp, reasonForLeaving: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setExpModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
