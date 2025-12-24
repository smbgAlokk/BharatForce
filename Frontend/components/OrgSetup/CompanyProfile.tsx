import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Save } from 'lucide-react';
import { Company } from '../../types';

export const CompanyProfile: React.FC = () => {
  const { currentTenant, updateCompany, currentUser } = useApp();
  const [formData, setFormData] = useState<Company | null>(currentTenant);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentTenant) {
      setFormData(currentTenant);
    }
  }, [currentTenant]);

  if (!formData) return <div>Loading company profile...</div>;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    
    // We send the data to AppContext, which handles the API call
    updateCompany({
      ...formData,
      // Ensure we keep the ID and Role for the backend check
      role: currentUser.role 
    });
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Handler for top-level fields (Name, PAN, Phone, etc.)
  const handleChange = (field: string, value: any) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  // Handler specifically for nested Address fields
  const handleAddressChange = (field: string, value: any) => {
    if (formData) {
      setFormData({
        ...formData,
        address: {
          ...(formData.address || {}), // Keep existing address fields
          [field]: value
        }
      });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium leading-6 text-slate-900">Company Profile</h2>
          <p className="mt-1 text-sm text-slate-500">General information and contact details visible across the platform.</p>
        </div>
        {saved && <span className="text-green-600 text-sm font-medium">Saved Successfully!</span>}
      </div>

      <form onSubmit={handleSave} className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-4 py-5 sm:p-6 space-y-6">
          
          {/* Branding Section */}
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 border-b border-slate-100 pb-6">
            <div className="sm:col-span-6 flex items-center">
              <div className="h-16 w-16 rounded-lg flex items-center justify-center text-white font-bold text-2xl mr-4"
                   style={{ backgroundColor: formData?.primaryColor || '#000' }}>
                {formData?.name?.substring(0, 2).toUpperCase() || 'CO'}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Brand Color</label>
                <input 
                  type="color" 
                  value={formData?.primaryColor || '#000000'} 
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="h-9 w-20 border border-slate-300 p-1 rounded mt-1"
                />
              </div>
            </div>
          </div>

          {/* Basic Details */}
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-slate-700">Company Name</label>
              <input type="text" value={formData?.name || ''} onChange={e => handleChange('name', e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
             <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-slate-700">Legal Name</label>
              <input type="text" value={formData?.legalName || ''} onChange={e => handleChange('legalName', e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">PAN</label>
              <input type="text" value={formData?.pan || ''} onChange={e => handleChange('pan', e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">GSTIN</label>
              <input type="text" value={formData?.gstin || ''} onChange={e => handleChange('gstin', e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
             <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">CIN</label>
              <input type="text" value={formData?.cin || ''} onChange={e => handleChange('cin', e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          </div>

          {/* Address - Updated to handle Nested Object correctly */}
          <div className="border-t border-slate-100 pt-6">
             <h3 className="text-sm font-medium text-slate-900 mb-4">Head Office Address</h3>
             <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
               <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-slate-700">Address Line 1</label>
                  <input type="text" 
                    value={formData?.address?.line1 || ''} 
                    onChange={e => handleAddressChange('line1', e.target.value)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">City</label>
                  <input type="text" 
                    value={formData?.address?.city || ''} 
                    onChange={e => handleAddressChange('city', e.target.value)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">State</label>
                  <input type="text" 
                    value={formData?.address?.state || ''} 
                    onChange={e => handleAddressChange('state', e.target.value)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Pincode</label>
                  <input type="text" 
                    value={formData?.address?.pincode || ''} 
                    onChange={e => handleAddressChange('pincode', e.target.value)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
             </div>
          </div>

           {/* Contact */}
           <div className="border-t border-slate-100 pt-6">
             <h3 className="text-sm font-medium text-slate-900 mb-4">Primary Contact</h3>
             <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-slate-700">Contact Person</label>
                  <input type="text" value={formData?.contactPerson || ''} onChange={e => handleChange('contactPerson', e.target.value)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                 <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-slate-700">Official Email</label>
                  <input type="email" value={formData?.email || ''} onChange={e => handleChange('email', e.target.value)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                 <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-slate-700">Phone</label>
                  <input type="text" value={formData?.phone || ''} onChange={e => handleChange('phone', e.target.value)}
                    className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
             </div>
          </div>

        </div>
        <div className="bg-slate-50 px-4 py-3 text-right sm:px-6">
          <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};