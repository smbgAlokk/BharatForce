
import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Branch } from '../../../types';
import { Plus, MapPin, Trash2, Edit2 } from 'lucide-react';

export const Branches: React.FC = () => {
  const { currentTenant, branches, addBranch, updateBranch, deleteBranch } = useApp();
  const myBranches = branches.filter(b => b.companyId === currentTenant?.id);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Partial<Branch>>({});

  const handleOpenModal = (item?: Branch) => {
    setEditingItem(item || null);
    setFormData(item || { country: 'India', isHeadOffice: false });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    const base = {
      ...formData as Branch,
      companyId: currentTenant.id,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin'
    };

    // If setting HO, unset others
    if (base.isHeadOffice) {
       myBranches.forEach(b => {
         if (b.isHeadOffice && b.id !== editingItem?.id) {
           updateBranch({ ...b, isHeadOffice: false });
         }
       });
    }

    if (editingItem) {
      updateBranch(base);
    } else {
      addBranch({ ...base, id: `br-${Date.now()}`, createdAt: new Date().toISOString(), createdBy: 'Admin' });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white shadow rounded-lg border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900">Branches / Locations</h3>
        <button onClick={() => handleOpenModal()} className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" /> Add Branch
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Branch Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">City</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Head Office</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {myBranches.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-500">No branches found.</td></tr>
            ) : (
              myBranches.map(branch => (
                <tr key={branch.id}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {branch.name}
                    <div className="text-xs text-slate-500">{branch.code}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{branch.city}, {branch.state}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{branch.contactNumber}</td>
                  <td className="px-6 py-4 text-center">
                    {branch.isHeadOffice ? <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Yes</span> : '-'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                    <button onClick={() => handleOpenModal(branch)} className="text-indigo-600 hover:text-indigo-900"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => deleteBranch(branch.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Branch' : 'Add Branch'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Branch Name</label>
                <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Branch Code</label>
                <input required type="text" value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-slate-700">City</label>
                  <input required type="text" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-700">State</label>
                  <input required type="text" value={formData.state || ''} onChange={e => setFormData({...formData, state: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
                </div>
              </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700">Address</label>
                  <input type="text" value={formData.addressLine1 || ''} onChange={e => setFormData({...formData, addressLine1: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                 <label className="block text-sm font-medium text-slate-700">Contact Number</label>
                 <input type="text" value={formData.contactNumber || ''} onChange={e => setFormData({...formData, contactNumber: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="isHO" checked={formData.isHeadOffice || false} onChange={e => setFormData({...formData, isHeadOffice: e.target.checked})} className="h-4 w-4 text-indigo-600 border-slate-300 rounded" />
                <label htmlFor="isHO" className="ml-2 block text-sm text-slate-900">Is Head Office?</label>
              </div>
              <div className="flex justify-end space-x-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
