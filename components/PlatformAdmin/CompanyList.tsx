
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Company } from '../../types';
import { Search, Plus, MoreHorizontal, Building, Edit, Shield } from 'lucide-react';

export const CompanyList: React.FC = () => {
  const { companies, addCompany, updateCompany } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Simple Form State
  const [formData, setFormData] = useState<Partial<Company>>({});

  const handleOpenModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData(company);
    } else {
      setEditingCompany(null);
      setFormData({
        country: 'India',
        status: 'Active',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        primaryColor: '#3A5BA0'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    
    if (editingCompany) {
      updateCompany({
        ...editingCompany,
        ...formData as Company,
        updatedAt: now,
        updatedBy: 'Super Admin'
      });
    } else {
      addCompany({
        id: `tenant-${Date.now()}`,
        ...formData as Company,
        createdAt: now,
        createdBy: 'Super Admin'
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Client Companies</h1>
          <p className="text-slate-500 mt-1">Manage tenants and their access status.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </button>
      </div>

      {/* List */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Industry</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div 
                      className="flex-shrink-0 h-10 w-10 rounded-md flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: company.primaryColor }}
                    >
                      {company.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">{company.name}</div>
                      <div className="text-xs text-slate-500">ID: {company.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {company.industry}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">{company.contactPerson}</div>
                  <div className="text-xs text-slate-500">{company.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {company.city}, {company.state}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    company.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {company.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleOpenModal(company)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-slate-900 opacity-75" onClick={() => setIsModalOpen(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSave}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-slate-900 mb-4">
                    {editingCompany ? 'Edit Company' : 'Add New Company'}
                  </h3>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    {/* Basic Info */}
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-slate-700">Company Name</label>
                      <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-slate-700">Legal Name</label>
                      <input type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.legalName || ''} onChange={e => setFormData({...formData, legalName: e.target.value})} />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-slate-700">Industry</label>
                      <input type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.industry || ''} onChange={e => setFormData({...formData, industry: e.target.value})} />
                    </div>
                     <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-slate-700">Status</label>
                      <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.status || 'Active'} 
                        onChange={e => setFormData({...formData, status: e.target.value as any})}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    {/* IDs */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700">PAN</label>
                      <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.pan || ''} onChange={e => setFormData({...formData, pan: e.target.value})} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700">GSTIN</label>
                      <input type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.gstin || ''} onChange={e => setFormData({...formData, gstin: e.target.value})} />
                    </div>
                     <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700">Primary Color</label>
                      <div className="flex items-center mt-1">
                        <input type="color" className="h-8 w-8 border-0 p-0 rounded"
                          value={formData.primaryColor || '#3A5BA0'} onChange={e => setFormData({...formData, primaryColor: e.target.value})} />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-slate-700">Address</label>
                      <input type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.addressLine1 || ''} onChange={e => setFormData({...formData, addressLine1: e.target.value})} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700">City</label>
                      <input type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700">State</label>
                      <input type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.state || ''} onChange={e => setFormData({...formData, state: e.target.value})} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700">Pincode</label>
                      <input type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.pincode || ''} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                    </div>

                    {/* Contact */}
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-slate-700">Contact Person</label>
                      <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.contactPerson || ''} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-slate-700">Email</label>
                      <input required type="email" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                    Save Company
                  </button>
                  <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
