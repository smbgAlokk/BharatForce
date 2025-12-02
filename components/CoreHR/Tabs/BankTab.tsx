
import React, { useState } from 'react';
import { Employee, PaymentMode } from '../../../types';
import { Save, X, Edit2 } from 'lucide-react';

interface Props {
  employee: Employee;
  isReadOnly: boolean;
  onSave: (data: Partial<Employee>) => void;
}

export const BankTab: React.FC<Props> = ({ employee, isReadOnly, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Employee>(employee);

  const handleCancel = () => {
    setFormData(employee);
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsEditing(false);
  };

  const handleBankChange = (field: string, value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      bankDetails: { ...prev.bankDetails, [field]: value } as any
    }));
  };

  const handlePayrollChange = (field: string, value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      payrollSettings: { ...prev.payrollSettings, [field]: value } 
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-slate-900">Bank & Payroll Identifiers</h3>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Bank Details */}
        <div className="md:col-span-2">
           <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Bank Account Details</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Bank Name</label>
                <input 
                  disabled={!isEditing} type="text" value={formData.bankDetails?.bankName || ''} onChange={e => handleBankChange('bankName', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2" 
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700">Branch Name</label>
                <input 
                  disabled={!isEditing} type="text" value={formData.bankDetails?.branchName || ''} onChange={e => handleBankChange('branchName', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">IFSC Code</label>
                <input 
                  disabled={!isEditing} type="text" value={formData.bankDetails?.ifscCode || ''} onChange={e => handleBankChange('ifscCode', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2 uppercase" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Account Number</label>
                <input 
                  disabled={!isEditing} type="text" value={formData.bankDetails?.accountNumber || ''} onChange={e => handleBankChange('accountNumber', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Account Holder Name</label>
                <input 
                  disabled={!isEditing} type="text" value={formData.bankDetails?.accountHolderName || ''} onChange={e => handleBankChange('accountHolderName', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Payment Mode</label>
                <select
                  disabled={!isEditing}
                  value={formData.bankDetails?.paymentMode || 'Bank Transfer'} onChange={e => handleBankChange('paymentMode', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2" 
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                  <option value="Other">Other</option>
                </select>
              </div>
           </div>
        </div>

        {/* Payroll Identifiers */}
        <div className="md:col-span-2">
           <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Payroll Identifiers (Structure Only)</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Annual CTC</label>
                <input 
                  disabled={!isEditing} type="number" value={formData.payrollSettings?.ctc || ''} onChange={e => handlePayrollChange('ctc', parseInt(e.target.value))}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Employee Category</label>
                 <input 
                  disabled={!isEditing} type="text" value={formData.payrollSettings?.employeeCategory || ''} onChange={e => handlePayrollChange('employeeCategory', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Payroll Group / Cycle</label>
                 <select
                  disabled={!isEditing}
                  value={formData.payrollSettings?.payrollGroup || 'Monthly'} onChange={e => handlePayrollChange('payrollGroup', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2" 
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-Weekly">Bi-Weekly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Internal Payroll Code</label>
                 <input 
                  disabled={!isEditing} type="text" value={formData.payrollSettings?.internalCode || ''} onChange={e => handlePayrollChange('internalCode', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2" 
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700">Salary Structure Template</label>
                 <select
                  disabled={!isEditing}
                  value={formData.payrollSettings?.salaryStructureId || ''} onChange={e => handlePayrollChange('salaryStructureId', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2" 
                >
                  <option value="">Select Template</option>
                  <option value="temp-001">Standard Salary Structure A</option>
                  <option value="temp-002">Executive Salary Structure</option>
                  <option value="temp-003">Contractor Structure</option>
                </select>
              </div>
           </div>
        </div>

      </div>
    </form>
  );
};
