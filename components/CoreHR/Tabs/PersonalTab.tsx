
import React, { useState } from 'react';
import { Employee, Address } from '../../../types';
import { Save, X, Edit2 } from 'lucide-react';

interface Props {
  employee: Employee;
  isReadOnly: boolean;
  onSave: (data: Partial<Employee>) => void;
  isSelfService?: boolean;
  onRequestChange?: (category: string, fieldPath: string, label: string, currentValue: any) => void;
}

export const PersonalTab: React.FC<Props> = ({ employee, isReadOnly, onSave, isSelfService, onRequestChange }) => {
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

  const handleFamilyChange = (field: string, value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      familyDetails: { ...prev.familyDetails, [field]: value } 
    }));
  };

  const handleGovtIdChange = (field: string, value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      governmentIds: { ...prev.governmentIds, [field]: value } 
    }));
  };

  const handleAddressChange = (type: 'permanentAddress' | 'communicationAddress', field: keyof Address, value: string) => {
    setFormData(prev => {
      const updated = { 
        ...prev, 
        [type]: { ...prev[type], [field]: value } 
      };
      if (updated.isCommunicationSameAsPermanent && type === 'permanentAddress') {
        updated.communicationAddress = updated.permanentAddress;
      }
      return updated;
    });
  };

  const toggleAddressSync = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isCommunicationSameAsPermanent: checked,
      communicationAddress: checked ? prev.permanentAddress : prev.communicationAddress
    }));
  };

  const renderRequestBtn = (field: string, label: string, val: any, category: string = 'Personal Details') => {
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

  // Address Block Component Helper
  const AddressBlock = ({ title, type, data, disabled }: { title: string, type: 'permanentAddress' | 'communicationAddress', data?: Address, disabled: boolean }) => (
    <div className="space-y-4">
      <h5 className="text-sm font-medium text-slate-700 border-b pb-1">
        {title}
      </h5>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500">Address Line 1 {renderRequestBtn(`${type}.line1`, `${title} Line 1`, data?.line1, 'Address')}</label>
          <input disabled={disabled} type="text" value={data?.line1 || ''} onChange={e => handleAddressChange(type, 'line1', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm text-sm p-2 border disabled:bg-slate-50" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500">Address Line 2 {renderRequestBtn(`${type}.line2`, `${title} Line 2`, data?.line2, 'Address')}</label>
          <input disabled={disabled} type="text" value={data?.line2 || ''} onChange={e => handleAddressChange(type, 'line2', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm text-sm p-2 border disabled:bg-slate-50" />
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div>
            <label className="block text-xs font-medium text-slate-500">City {renderRequestBtn(`${type}.city`, `${title} City`, data?.city, 'Address')}</label>
            <input disabled={disabled} type="text" value={data?.city || ''} onChange={e => handleAddressChange(type, 'city', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm text-sm p-2 border disabled:bg-slate-50" />
          </div>
           <div>
            <label className="block text-xs font-medium text-slate-500">State {renderRequestBtn(`${type}.state`, `${title} State`, data?.state, 'Address')}</label>
            <input disabled={disabled} type="text" value={data?.state || ''} onChange={e => handleAddressChange(type, 'state', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm text-sm p-2 border disabled:bg-slate-50" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div>
            <label className="block text-xs font-medium text-slate-500">Pincode {renderRequestBtn(`${type}.pincode`, `${title} Pincode`, data?.pincode, 'Address')}</label>
            <input disabled={disabled} type="text" value={data?.pincode || ''} onChange={e => handleAddressChange(type, 'pincode', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm text-sm p-2 border disabled:bg-slate-50" />
          </div>
           <div>
            <label className="block text-xs font-medium text-slate-500">Country</label>
            <input disabled={disabled} type="text" value={data?.country || 'India'} onChange={e => handleAddressChange(type, 'country', e.target.value)} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm text-sm p-2 border disabled:bg-slate-50" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-slate-900">Personal & Family Details</h3>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Family Details */}
        <div className="md:col-span-2">
           <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Family Details</h4>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Father's Name {renderRequestBtn('familyDetails.fatherName', 'Father Name', formData.familyDetails?.fatherName, 'Family')}</label>
                <input 
                  disabled={!isEditing} type="text" value={formData.familyDetails?.fatherName || ''} onChange={e => handleFamilyChange('fatherName', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Mother's Name {renderRequestBtn('familyDetails.motherName', 'Mother Name', formData.familyDetails?.motherName, 'Family')}</label>
                <input 
                  disabled={!isEditing} type="text" value={formData.familyDetails?.motherName || ''} onChange={e => handleFamilyChange('motherName', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Spouse Name {renderRequestBtn('familyDetails.spouseName', 'Spouse Name', formData.familyDetails?.spouseName, 'Family')}</label>
                <input 
                  disabled={!isEditing} type="text" value={formData.familyDetails?.spouseName || ''} onChange={e => handleFamilyChange('spouseName', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">No. of Dependents</label>
                <input 
                  disabled={!isEditing} type="number" value={formData.familyDetails?.dependents || ''} onChange={e => handleFamilyChange('dependents', parseInt(e.target.value))}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2" 
                />
              </div>
           </div>
        </div>

        {/* Addresses */}
        <div className="md:col-span-2">
           <div className="flex items-center justify-between border-b pb-2 mb-4">
             <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Address Details</h4>
             <div className="flex items-center">
                <input 
                  id="sameAddr" type="checkbox" 
                  disabled={!isEditing}
                  checked={formData.isCommunicationSameAsPermanent || false}
                  onChange={e => toggleAddressSync(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-slate-300 rounded"
                />
                <label htmlFor="sameAddr" className="ml-2 block text-sm text-slate-900">Same as Permanent Address</label>
             </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AddressBlock 
                title="Permanent Address" 
                type="permanentAddress" 
                data={formData.permanentAddress} 
                disabled={!isEditing} 
              />
              <AddressBlock 
                title="Communication Address" 
                type="communicationAddress" 
                data={formData.communicationAddress} 
                disabled={!isEditing || !!formData.isCommunicationSameAsPermanent} 
              />
           </div>
        </div>

        {/* Government IDs */}
        <div className="md:col-span-2">
           <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Government Identifiers</h4>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div>
                <label className="block text-sm font-medium text-slate-700">Aadhaar Number {renderRequestBtn('governmentIds.aadhaar', 'Aadhaar', formData.governmentIds?.aadhaar, 'IDs')}</label>
                <input 
                  disabled={!isEditing} type="text" value={formData.governmentIds?.aadhaar || ''} onChange={e => handleGovtIdChange('aadhaar', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">PAN Number {renderRequestBtn('governmentIds.pan', 'PAN', formData.governmentIds?.pan, 'IDs')}</label>
                <input 
                  disabled={!isEditing} type="text" value={formData.governmentIds?.pan || ''} onChange={e => handleGovtIdChange('pan', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2 uppercase" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Passport Number {renderRequestBtn('governmentIds.passport', 'Passport', formData.governmentIds?.passport, 'IDs')}</label>
                <input 
                  disabled={!isEditing} type="text" value={formData.governmentIds?.passport || ''} onChange={e => handleGovtIdChange('passport', e.target.value)}
                  className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-50 border p-2 uppercase" 
                />
              </div>
           </div>
        </div>

      </div>
    </form>
  );
};
