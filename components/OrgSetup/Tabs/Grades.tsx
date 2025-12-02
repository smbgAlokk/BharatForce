
import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Grade } from '../../../types';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export const Grades: React.FC = () => {
  const { currentTenant, grades, addGrade, updateGrade, deleteGrade } = useApp();
  const myGrades = grades.filter(g => g.companyId === currentTenant?.id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Grade | null>(null);
  const [formData, setFormData] = useState<Partial<Grade>>({});

  const handleOpenModal = (item?: Grade) => {
    setEditingItem(item || null);
    setFormData(item || {});
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    const base = {
      ...formData as Grade,
      companyId: currentTenant.id,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Admin'
    };

    if (editingItem) {
      updateGrade(base);
    } else {
      addGrade({ ...base, id: `gr-${Date.now()}`, createdAt: new Date().toISOString(), createdBy: 'Admin' });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white shadow rounded-lg border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900">Grades / Bands</h3>
        <button onClick={() => handleOpenModal()} className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" /> Add Grade
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {myGrades.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-500">No grades found.</td></tr>
            ) : (
              myGrades.map(grade => (
                <tr key={grade.id}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{grade.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{grade.level}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{grade.description}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                    <button onClick={() => handleOpenModal(grade)} className="text-indigo-600 hover:text-indigo-900"><Edit2 className="h-4 w-4" /></button>
                    <button onClick={() => deleteGrade(grade.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
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
            <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Grade' : 'Add Grade'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Grade Name (e.g. G1, L1)</label>
                <input required type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Level</label>
                <select value={formData.level || 'Junior'} onChange={e => setFormData({...formData, level: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm">
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Leadership">Leadership</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <input type="text" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
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
