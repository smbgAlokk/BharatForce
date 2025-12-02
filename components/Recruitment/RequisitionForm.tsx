
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { JobRequisition, RequisitionStatus, EmploymentType, WorkLocationType } from '../../types';
import { Save, X, Send } from 'lucide-react';

export const RequisitionForm: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  const { 
    currentTenant, currentUser, departments, designations, branches, employees, grades,
    jobRequisitions, addJobRequisition, updateJobRequisition 
  } = useApp();

  const isEdit = !!id;
  const existingReq = id ? jobRequisitions.find(r => r.id === id) : null;

  // If editing and not found, or editing a locked req (unless HR), redirect
  useEffect(() => {
    if (isEdit && !existingReq) {
       navigate('/recruitment/requisitions');
    }
  }, [isEdit, existingReq, navigate]);

  // Scoped lists
  const myDepts = departments.filter(d => d.companyId === currentTenant?.id);
  const myDesigs = designations.filter(d => d.companyId === currentTenant?.id);
  const myBranches = branches.filter(d => d.companyId === currentTenant?.id);
  const myGrades = grades.filter(d => d.companyId === currentTenant?.id);
  const myEmployees = employees.filter(e => e.companyId === currentTenant?.id); // For hiring manager

  const [formData, setFormData] = useState<Partial<JobRequisition>>({
    companyId: currentTenant?.id,
    status: RequisitionStatus.DRAFT,
    locationType: 'Onsite',
    employmentType: 'Permanent',
    requestedHeadcount: 1
  });

  useEffect(() => {
    if (existingReq) {
      setFormData(existingReq);
    }
  }, [existingReq]);

  const handleChange = (field: keyof JobRequisition, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent, action: 'save' | 'submit') => {
    e.preventDefault();
    if (!currentTenant) return;

    const now = new Date().toISOString();
    const base: JobRequisition = {
      ...formData as JobRequisition,
      updatedAt: now,
      updatedBy: currentUser.name
    };

    if (action === 'submit') {
      base.status = RequisitionStatus.SUBMITTED;
    }

    if (isEdit && existingReq) {
      updateJobRequisition(base);
    } else {
      // Create New
      const newReq: JobRequisition = {
        ...base,
        id: `req-${Date.now()}`,
        requisitionCode: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        requestedBy: currentUser.id,
        requestedOn: now,
        createdAt: now,
        createdBy: currentUser.name
      };
      addJobRequisition(newReq);
    }
    navigate('/recruitment/requisitions');
  };

  return (
    <form className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">{isEdit ? 'Edit Requisition' : 'Create New Job Requisition'}</h2>
        <button type="button" onClick={() => navigate('/recruitment/requisitions')} className="text-slate-500 hover:text-slate-700">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Section A: Basic Details */}
      <div className="bg-white shadow rounded-lg border border-slate-200 p-6 space-y-6">
         <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2">Basic Details</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
               <label className="block text-sm font-medium text-slate-700">Requisition Title (Job Title) *</label>
               <input required type="text" value={formData.title || ''} onChange={e => handleChange('title', e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700">Designation *</label>
               <select required value={formData.designationId || ''} onChange={e => handleChange('designationId', e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm">
                 <option value="">Select Designation</option>
                 {myDesigs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700">Department *</label>
               <select required value={formData.departmentId || ''} onChange={e => handleChange('departmentId', e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm">
                 <option value="">Select Department</option>
                 {myDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700">Branch / Location *</label>
               <select required value={formData.branchId || ''} onChange={e => handleChange('branchId', e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm">
                 <option value="">Select Branch</option>
                 {myBranches.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700">Hiring Manager *</label>
               <select required value={formData.hiringManagerId || ''} onChange={e => handleChange('hiringManagerId', e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm">
                 <option value="">Select Manager</option>
                 {myEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>)}
               </select>
            </div>
             <div>
               <label className="block text-sm font-medium text-slate-700">Employment Type *</label>
               <select required value={formData.employmentType} onChange={e => handleChange('employmentType', e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm">
                 <option value="Permanent">Permanent</option>
                 <option value="Contract">Contract</option>
                 <option value="Consultant">Consultant</option>
                 <option value="Intern">Intern</option>
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700">Requested Headcount *</label>
               <input required type="number" min="1" value={formData.requestedHeadcount || ''} onChange={e => handleChange('requestedHeadcount', parseInt(e.target.value))} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700">Needed By (Target Date) *</label>
               <input required type="date" value={formData.neededBy || ''} onChange={e => handleChange('neededBy', e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
            </div>
         </div>
      </div>

      {/* Section B: Job Description */}
      <div className="bg-white shadow rounded-lg border border-slate-200 p-6 space-y-6">
         <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2">Job Description</h3>
         <div>
            <label className="block text-sm font-medium text-slate-700">Job Summary *</label>
            <textarea required rows={3} value={formData.jobSummary || ''} onChange={e => handleChange('jobSummary', e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
         </div>
         <div>
            <label className="block text-sm font-medium text-slate-700">Key Responsibilities *</label>
            <textarea required rows={4} value={formData.responsibilities || ''} onChange={e => handleChange('responsibilities', e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
         </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Required Skills *</label>
            <textarea required rows={2} value={formData.requiredSkills || ''} onChange={e => handleChange('requiredSkills', e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" placeholder="e.g. React, Node.js, Communication" />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
               <label className="block text-sm font-medium text-slate-700">Education Requirements</label>
               <input type="text" value={formData.educationRequirements || ''} onChange={e => handleChange('educationRequirements', e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
            </div>
             <div>
               <label className="block text-sm font-medium text-slate-700">Experience Range</label>
               <input type="text" value={formData.experienceRange || ''} onChange={e => handleChange('experienceRange', e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" placeholder="e.g. 3-5 Years" />
            </div>
         </div>
      </div>

       {/* Section C: Compensation */}
      <div className="bg-white shadow rounded-lg border border-slate-200 p-6 space-y-6">
         <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2">Compensation & Location</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
               <label className="block text-sm font-medium text-slate-700">Grade / Band</label>
               <select value={formData.gradeId || ''} onChange={e => handleChange('gradeId', e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm">
                 <option value="">Select Grade</option>
                 {myGrades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
               </select>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700">Work Location Type</label>
                <select value={formData.locationType} onChange={e => handleChange('locationType', e.target.value as any)} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm">
                 <option value="Onsite">Onsite</option>
                 <option value="Hybrid">Hybrid</option>
                 <option value="Remote">Remote</option>
               </select>
            </div>
             <div>
               <label className="block text-sm font-medium text-slate-700">Budgeted CTC Range</label>
               <input type="text" value={formData.budgetedCtcRange || ''} onChange={e => handleChange('budgetedCtcRange', e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" placeholder="e.g. 8-12 LPA" />
            </div>
         </div>
         <div>
            <label className="block text-sm font-medium text-slate-700">Special Notes</label>
            <textarea rows={2} value={formData.notes || ''} onChange={e => handleChange('notes', e.target.value)} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
         </div>
      </div>

      <div className="flex justify-end space-x-3 pb-10">
         <button 
           type="button" 
           onClick={(e) => handleSave(e, 'save')} 
           className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
         >
           <Save className="w-4 h-4 mr-2" /> Save Draft
         </button>
         <button 
           type="button"
           onClick={(e) => handleSave(e, 'submit')} 
           className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
         >
           <Send className="w-4 h-4 mr-2" /> Submit for Approval
         </button>
      </div>

    </form>
  );
};
