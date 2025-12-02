

import React, { useState } from 'react';
import { Employee } from '../../../types';
import { Save, X, Edit2, MessageSquarePlus } from 'lucide-react';

interface Props {
  employee: Employee;
  isReadOnly: boolean;
  onSave: (data: Partial<Employee>) => void;
  isSelfService?: boolean;
  onRequestChange?: (category: string, fieldPath: string, label: string, currentValue: any) => void;
}

export const BasicInfoTab: React.FC<Props> = ({ employee, isReadOnly, onSave, isSelfService, onRequestChange }) => {
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

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmergencyChange = (field: string, value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      emergencyContact: { ...prev.emergencyContact, [field]: value } as any
    }));
  };

  // Helper to render Request Change Button (Self Service)
  const renderRequestBtn = (field: string, label: string, val: any, category: string = 'Contact Details') => {
    if (!isSelfService || !onRequestChange) return null;
    return (
      <button 
        type="button"
        onClick={() => onRequestChange(category, field, label, val)}
        className="text-xs text-indigo-600 hover:text-indigo-800 underline ml-2"
      >
        Request Change
      </button>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-slate-900">Basic Information</h3>
        {!isReadOnly && !isSelfService && (
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
        {isSelfService && <span className="text-sm text-slate-500 italic">View Only. Use "Request Change" for updates.</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Identification */}
        <div className="md:col-span-3">
           <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Identification</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">First Name</label>
                <input 
                  disabled={!isEditing} required
                  type="text" value={formData.firstName} onChange={e => handleChange('firstName', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Middle Name</label>
                <input 
                  disabled={!isEditing}
                  type="text" value={formData.middleName || ''} onChange={e => handleChange('middleName', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Last Name</label>
                <input 
                  disabled={!isEditing} required
                  type="text" value={formData.lastName} onChange={e => handleChange('lastName', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Employee Code</label>
                <input 
                  disabled={true} 
                  type="text" value={formData.employeeCode} 
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm bg-slate-100 text-slate-500 sm:text-sm border p-2" 
                />
              </div>
           </div>
        </div>

        {/* Contact */}
        <div className="md:col-span-3">
           <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Contact Details</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Official Email
                </label>
                <input 
                  disabled={!isEditing} required type="email"
                  value={formData.officialEmail} onChange={e => handleChange('officialEmail', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Mobile Number 
                  {renderRequestBtn('mobileNumber', 'Mobile Number', formData.mobileNumber)}
                </label>
                <input 
                  disabled={!isEditing} required type="tel"
                  value={formData.mobileNumber} onChange={e => handleChange('mobileNumber', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Personal Email
                  {renderRequestBtn('personalEmail', 'Personal Email', formData.personalEmail)}
                </label>
                <input 
                  disabled={!isEditing} type="email"
                  value={formData.personalEmail || ''} onChange={e => handleChange('personalEmail', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2" 
                />
              </div>
           </div>
        </div>

        {/* Personal */}
        <div className="md:col-span-3">
           <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Personal Details</h4>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
                <input 
                  disabled={!isEditing}
                  type="date"
                  value={formData.dob || ''} 
                  onChange={e => handleChange('dob', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 disabled:text-slate-500 border p-2"
                />
              </div>
            </div>
          </div>
        </div>
    </form>
  );
};
            
export default BasicInfoTab;
             