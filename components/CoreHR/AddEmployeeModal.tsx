
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import { ArrowLeft, ArrowRight, X, AlertTriangle } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const AddEmployeeModal: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const { currentTenant, departments, branches, designations, grades, costCenters, addEmployee, checkEmployeeCodeExists, employees } = useApp();
  
  const [step, setStep] = useState(1); // 1: Basic, 2: Employment
  const [errors, setErrors] = useState<string[]>([]);
  
  // Initial State
  const [formData, setFormData] = useState<Partial<Employee>>({
    companyId: currentTenant?.id,
    status: 'Onboarding',
    employmentType: 'Permanent',
    probationPeriod: 6,
    country: 'India' // Hidden field context
  } as any);

  // Dropdown options
  const myDepts = departments.filter(d => d.companyId === currentTenant?.id);
  const myBranches = branches.filter(d => d.companyId === currentTenant?.id);
  const myDesigs = designations.filter(d => d.companyId === currentTenant?.id);
  const myGrades = grades.filter(d => d.companyId === currentTenant?.id);
  const myCostCenters = costCenters.filter(d => d.companyId === currentTenant?.id);
  const potentialManagers = employees.filter(e => e.companyId === currentTenant?.id);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error if user types
    if (errors.length > 0) setErrors([]);
  };

  const validateStep1 = () => {
    const newErrors = [];
    if (!formData.firstName) newErrors.push("First Name is required");
    if (!formData.lastName) newErrors.push("Last Name is required");
    if (!formData.employeeCode) newErrors.push("Employee Code is required");
    if (!formData.officialEmail) newErrors.push("Official Email is required");
    if (!formData.mobileNumber) newErrors.push("Mobile Number is required");

    if (formData.employeeCode && checkEmployeeCodeExists(formData.employeeCode)) {
      newErrors.push("Employee Code already exists in this company.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const validateStep2 = () => {
    const newErrors = [];
    if (!formData.joiningDate) newErrors.push("Date of Joining is required");
    if (!formData.designationId) newErrors.push("Designation is required");
    if (!formData.departmentId) newErrors.push("Department is required");
    if (!formData.branchId) newErrors.push("Branch is required");
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSave = () => {
    if (validateStep2()) {
      const newEmployee: Employee = {
        ...formData as Employee,
        id: `emp-${Date.now()}`,
        createdAt: new Date().toISOString(),
        createdBy: 'Admin'
      };
      addEmployee(newEmployee);
      onClose();
      navigate(`/core-hr/employee/${newEmployee.id}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-slate-900 opacity-75" onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-slate-900">
                Add New Employee
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-4 flex items-center">
              <div className={`flex-1 h-2 rounded-full ${step === 1 ? 'bg-indigo-600' : 'bg-green-500'}`}></div>
              <div className="w-1"></div>
              <div className={`flex-1 h-2 rounded-full ${step === 2 ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
            </div>
             <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Basic Information</span>
                <span>Employment Details</span>
             </div>
          </div>

          {/* Error Display */}
          {errors.length > 0 && (
            <div className="bg-red-50 p-4 m-6 mb-0 rounded-md flex items-start">
               <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
               <div className="text-sm text-red-700">
                 <ul className="list-disc pl-4 space-y-1">
                   {errors.map((e, i) => <li key={i}>{e}</li>)}
                 </ul>
               </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-slate-700">First Name *</label>
                    <input type="text" className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" 
                      value={formData.firstName || ''} onChange={e => handleChange('firstName', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Last Name *</label>
                    <input type="text" className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" 
                       value={formData.lastName || ''} onChange={e => handleChange('lastName', e.target.value)}/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Employee Code *</label>
                  <input type="text" className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" 
                     value={formData.employeeCode || ''} onChange={e => handleChange('employeeCode', e.target.value.toUpperCase())} placeholder="e.g. EMP001"/>
                  <p className="text-xs text-slate-500 mt-1">Must be unique within the company.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Official Email *</label>
                    <input type="email" className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" 
                       value={formData.officialEmail || ''} onChange={e => handleChange('officialEmail', e.target.value)}/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Mobile Number *</label>
                    <input type="tel" className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" 
                       value={formData.mobileNumber || ''} onChange={e => handleChange('mobileNumber', e.target.value)}/>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-slate-700">Gender</label>
                    <select className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                       value={formData.gender || ''} onChange={e => handleChange('gender', e.target.value)}>
                       <option value="">Select</option>
                       <option value="Male">Male</option>
                       <option value="Female">Female</option>
                       <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
               <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Date of Joining *</label>
                    <input type="date" className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" 
                       value={formData.joiningDate || ''} onChange={e => handleChange('joiningDate', e.target.value)}/>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700">Status</label>
                    <select className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                       value={formData.status || 'Onboarding'} onChange={e => handleChange('status', e.target.value)}>
                       <option value="Onboarding">Onboarding</option>
                       <option value="Active">Active</option>
                       <option value="Probation">Probation</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Designation *</label>
                    <select className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                       value={formData.designationId || ''} onChange={e => handleChange('designationId', e.target.value)}>
                       <option value="">Select</option>
                       {myDesigs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Department *</label>
                     <select className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                       value={formData.departmentId || ''} onChange={e => handleChange('departmentId', e.target.value)}>
                       <option value="">Select</option>
                       {myDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Branch *</label>
                    <select className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                       value={formData.branchId || ''} onChange={e => handleChange('branchId', e.target.value)}>
                       <option value="">Select</option>
                       {myBranches.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Cost Center</label>
                     <select className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                       value={formData.costCenterId || ''} onChange={e => handleChange('costCenterId', e.target.value)}>
                       <option value="">Select</option>
                       {myCostCenters.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Reporting Manager</label>
                     <select className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                       value={formData.reportingManagerId || ''} onChange={e => handleChange('reportingManagerId', e.target.value)}>
                       <option value="">Select Manager</option>
                       {potentialManagers.map(d => <option key={d.id} value={d.id}>{d.firstName} {d.lastName}</option>)}
                    </select>
                </div>
               </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {step === 2 ? (
               <button onClick={handleSave} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                  Finish & Create
               </button>
            ) : (
               <button onClick={handleNext} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                  Next <ArrowRight className="ml-2 w-4 h-4" />
               </button>
            )}
            
            {step === 2 && (
              <button onClick={() => setStep(1)} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                <ArrowLeft className="mr-2 w-4 h-4" /> Back
              </button>
            )}
            <button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
