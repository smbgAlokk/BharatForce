
import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Employee, EmploymentStatus, EmploymentType, WorkLocationType } from '../../../types';
import { Save, X, Edit2 } from 'lucide-react';

interface Props {
  employee: Employee;
  isReadOnly: boolean;
  onSave: (data: Partial<Employee>) => void;
}

export const EmploymentTab: React.FC<Props> = ({ employee, isReadOnly, onSave }) => {
  const { currentTenant, departments, branches, designations, grades, costCenters, employees } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Employee>(employee);

  const myDepts = departments.filter(d => d.companyId === currentTenant?.id);
  const myBranches = branches.filter(d => d.companyId === currentTenant?.id);
  const myDesigs = designations.filter(d => d.companyId === currentTenant?.id);
  const myGrades = grades.filter(d => d.companyId === currentTenant?.id);
  const myCostCenters = costCenters.filter(d => d.companyId === currentTenant?.id);
  const potentialManagers = employees.filter(e => e.companyId === currentTenant?.id && e.id !== employee.id);

  const handleCancel = () => {
    setFormData(employee);
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsEditing(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Probation logic helper
  const handleProbationChange = (months: number) => {
    const joinDate = new Date(formData.joiningDate);
    if (!isNaN(joinDate.getTime())) {
       const endDate = new Date(joinDate.setMonth(joinDate.getMonth() + months));
       handleChange('probationEndDate', endDate.toISOString().split('T')[0]);
    }
    handleChange('probationPeriod', months);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-slate-900">Employment Details</h3>
        {!isReadOnly && (
          <div>
            {isEditing ? (
              <div className="flex space-x-2">
                <button type="button" onClick={handleCancel} className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                  <X className="h-4 w-4 mr-1" /> Cancel
                </button>
                <button type="submit" className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  <Save className="h-4 w-4 mr-1" /> Save
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setIsEditing(true)} className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
                <Edit2 className="h-4 w-4 mr-1" /> Edit
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Employment Status */}
        <div className="md:col-span-3">
           <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Status & Timeline</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Date of Joining <span className="text-red-500">*</span></label>
                <input 
                  disabled={!isEditing} required type="date"
                  value={formData.joiningDate} onChange={e => handleChange('joiningDate', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Probation Period (Months)</label>
                <select
                  disabled={!isEditing}
                  value={formData.probationPeriod} onChange={e => handleProbationChange(parseInt(e.target.value))}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                >
                  <option value="0">0 Months</option>
                  <option value="3">3 Months</option>
                  <option value="6">6 Months</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Probation End Date</label>
                <input 
                  disabled={!isEditing} type="date"
                  value={formData.probationEndDate || ''} onChange={e => handleChange('probationEndDate', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Employment Type <span className="text-red-500">*</span></label>
                <select
                  disabled={!isEditing} required
                  value={formData.employmentType} onChange={e => handleChange('employmentType', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Current Status <span className="text-red-500">*</span></label>
                <select
                  disabled={!isEditing} required
                  value={formData.status} onChange={e => handleChange('status', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                >
                  <option value="Onboarding">Onboarding</option>
                  <option value="Active">Active</option>
                  <option value="Probation">On Probation</option>
                  <option value="Notice Period">Notice Period</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700">Confirmation Date</label>
                <input 
                  disabled={!isEditing} type="date"
                  value={formData.confirmationDate || ''} onChange={e => handleChange('confirmationDate', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                />
              </div>
           </div>
        </div>

        {/* Organization Structure */}
        <div className="md:col-span-3">
           <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Organization Mapping</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Designation <span className="text-red-500">*</span></label>
                <select
                  disabled={!isEditing} required
                  value={formData.designationId} onChange={e => handleChange('designationId', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                >
                  <option value="">Select Designation</option>
                  {myDesigs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Department <span className="text-red-500">*</span></label>
                <select
                  disabled={!isEditing} required
                  value={formData.departmentId} onChange={e => handleChange('departmentId', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                >
                  <option value="">Select Department</option>
                  {myDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Branch <span className="text-red-500">*</span></label>
                <select
                  disabled={!isEditing} required
                  value={formData.branchId} onChange={e => handleChange('branchId', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                >
                  <option value="">Select Branch</option>
                  {myBranches.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Grade / Band</label>
                <select
                  disabled={!isEditing}
                  value={formData.gradeId || ''} onChange={e => handleChange('gradeId', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                >
                  <option value="">Select Grade</option>
                  {myGrades.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Cost Center</label>
                <select
                  disabled={!isEditing}
                  value={formData.costCenterId || ''} onChange={e => handleChange('costCenterId', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                >
                  <option value="">Select Cost Center</option>
                  {myCostCenters.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700">Work Location Type</label>
                 <select
                  disabled={!isEditing}
                  value={formData.workLocationType || ''} onChange={e => handleChange('workLocationType', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                >
                  <option value="Onsite">Onsite</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
           </div>
        </div>

         {/* Reporting */}
        <div className="md:col-span-3">
           <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Reporting Lines</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Reporting Manager</label>
                <select
                  disabled={!isEditing}
                  value={formData.reportingManagerId || ''} onChange={e => handleChange('reportingManagerId', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                >
                  <option value="">Select Manager</option>
                  {potentialManagers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName} ({d.employeeCode})</option>)}
                </select>
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700">Second Level Manager</label>
                <select
                  disabled={!isEditing}
                  value={formData.secondLevelManagerId || ''} onChange={e => handleChange('secondLevelManagerId', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                >
                  <option value="">Select Manager</option>
                  {potentialManagers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName} ({d.employeeCode})</option>)}
                </select>
              </div>
           </div>
        </div>

      </div>
    </form>
  );
};
