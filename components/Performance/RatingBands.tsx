
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RatingBandScheme, RatingBand, UserRole } from '../../types';
import { Plus, Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';

const COLORS = [
  { label: 'Green', value: 'bg-green-100 text-green-800' },
  { label: 'Blue', value: 'bg-blue-100 text-blue-800' },
  { label: 'Indigo', value: 'bg-indigo-100 text-indigo-800' },
  { label: 'Purple', value: 'bg-purple-100 text-purple-800' },
  { label: 'Yellow', value: 'bg-yellow-100 text-yellow-800' },
  { label: 'Red', value: 'bg-red-100 text-red-800' },
  { label: 'Gray', value: 'bg-slate-100 text-slate-800' },
];

export const RatingBands: React.FC = () => {
  const { ratingSchemes, currentTenant, addRatingBandScheme, updateRatingBandScheme, userRole, currentUser } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScheme, setEditingScheme] = useState<RatingBandScheme | null>(null);
  const [formData, setFormData] = useState<Partial<RatingBandScheme>>({ 
    isActive: true, 
    isDefault: false, 
    bands: [] 
  });
  
  // Band Editor State
  const [editingBand, setEditingBand] = useState<Partial<RatingBand>>({});
  const [isBandEditorOpen, setIsBandEditorOpen] = useState(false);

  const mySchemes = ratingSchemes.filter(s => s.companyId === currentTenant?.id);
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleOpenModal = (scheme?: RatingBandScheme) => {
    if (isReadOnly) return;
    setEditingScheme(scheme || null);
    setFormData(scheme ? JSON.parse(JSON.stringify(scheme)) : { 
      isActive: true, 
      isDefault: false, 
      bands: [] 
    });
    setIsModalOpen(true);
    setIsBandEditorOpen(false);
  };

  const handleSaveScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !formData.name) return;

    const now = new Date().toISOString();
    
    // If setting as default, unset others
    if (formData.isDefault) {
      mySchemes.forEach(s => {
        if (s.id !== editingScheme?.id && s.isDefault) {
          updateRatingBandScheme({ ...s, isDefault: false });
        }
      });
    }

    const base = {
      ...formData as RatingBandScheme,
      companyId: currentTenant.id,
      updatedAt: now,
      updatedBy: currentUser.name
    };

    if (editingScheme) {
      updateRatingBandScheme(base);
    } else {
      addRatingBandScheme({
        ...base,
        id: `scheme-${Date.now()}`,
        createdAt: now,
        createdBy: currentUser.name
      });
    }
    setIsModalOpen(false);
  };

  // Band Helpers
  const handleAddBand = () => {
    setEditingBand({ 
      colorCode: 'bg-slate-100 text-slate-800', 
      isActive: true, 
      minScore: 0, 
      maxScore: 100 
    });
    setIsBandEditorOpen(true);
  };

  const handleEditBand = (band: RatingBand) => {
    setEditingBand(band);
    setIsBandEditorOpen(true);
  };

  const handleSaveBand = () => {
    if (!editingBand.name || editingBand.minScore === undefined || editingBand.maxScore === undefined) return;
    
    const newBand = {
      ...editingBand,
      id: editingBand.id || `band-${Date.now()}-${Math.random()}`,
      schemeId: editingScheme?.id || 'temp',
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name
    } as RatingBand;

    const currentBands = formData.bands || [];
    let updatedBands = [];
    if (editingBand.id) {
      updatedBands = currentBands.map(b => b.id === editingBand.id ? newBand : b);
    } else {
      updatedBands = [...currentBands, newBand];
    }

    // Sort by max score descending
    updatedBands.sort((a, b) => b.maxScore - a.maxScore);

    setFormData({ ...formData, bands: updatedBands });
    setIsBandEditorOpen(false);
  };

  const handleDeleteBand = (bandId: string) => {
    setFormData({
      ...formData,
      bands: (formData.bands || []).filter(b => b.id !== bandId)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Rating Bands</h2>
          <p className="text-sm text-slate-500">Configure grading scales for appraisals.</p>
        </div>
        {!isReadOnly && (
          <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" /> Create Scheme
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {mySchemes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">
            No rating schemes found. Create one to enable grading.
          </div>
        ) : (
          mySchemes.map(scheme => (
            <div key={scheme.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">{scheme.name}</h3>
                    {scheme.isDefault && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        Default
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${
                      scheme.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {scheme.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{scheme.description}</p>
                </div>
                {!isReadOnly && (
                  <button onClick={() => handleOpenModal(scheme)} className="text-indigo-600 hover:text-indigo-900">
                    <Edit2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium text-slate-500">Grade</th>
                      <th className="px-4 py-2 text-left font-medium text-slate-500">Range</th>
                      <th className="px-4 py-2 text-left font-medium text-slate-500">Code</th>
                      <th className="px-4 py-2 text-left font-medium text-slate-500">Color</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {scheme.bands.sort((a,b) => b.maxScore - a.maxScore).map(band => (
                      <tr key={band.id}>
                        <td className="px-4 py-2 font-medium text-slate-900">{band.name}</td>
                        <td className="px-4 py-2 text-slate-600">{band.minScore} - {band.maxScore}</td>
                        <td className="px-4 py-2 text-slate-600">{band.code}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${band.colorCode}`}>
                            {band.name}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Scheme Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{editingScheme ? 'Edit Rating Scheme' : 'Create Rating Scheme'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>

            <form onSubmit={handleSaveScheme} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Scheme Name</label>
                  <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                    value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Description</label>
                  <textarea className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" rows={2}
                    value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center text-sm text-slate-700">
                    <input type="checkbox" checked={formData.isDefault || false} onChange={e => setFormData({...formData, isDefault: e.target.checked})} className="mr-2 rounded text-indigo-600" />
                    Set as Default Scheme
                  </label>
                  <label className="flex items-center text-sm text-slate-700">
                    <input type="checkbox" checked={formData.isActive !== false} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2 rounded text-indigo-600" />
                    Active
                  </label>
                </div>
              </div>

              {/* Bands Config Section */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                   <h4 className="font-bold text-slate-900 text-sm uppercase">Grade Bands</h4>
                   {!isBandEditorOpen && (
                      <button type="button" onClick={handleAddBand} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 border border-indigo-200">
                        + Add Band
                      </button>
                   )}
                </div>

                {/* Inline Band Editor */}
                {isBandEditorOpen && (
                   <div className="bg-slate-50 p-3 rounded border border-indigo-200 mb-4">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                         <div>
                            <label className="block text-xs font-medium text-slate-500">Grade Name</label>
                            <input type="text" className="w-full border rounded p-1 text-sm" value={editingBand.name || ''} onChange={e => setEditingBand({...editingBand, name: e.target.value})} placeholder="e.g. Outstanding" />
                         </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-500">Short Code</label>
                            <input type="text" className="w-full border rounded p-1 text-sm" value={editingBand.code || ''} onChange={e => setEditingBand({...editingBand, code: e.target.value})} placeholder="e.g. O" />
                         </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-500">Min Score</label>
                            <input type="number" min="0" max="100" className="w-full border rounded p-1 text-sm" value={editingBand.minScore ?? 0} onChange={e => setEditingBand({...editingBand, minScore: parseInt(e.target.value)})} />
                         </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-500">Max Score</label>
                            <input type="number" min="0" max="100" className="w-full border rounded p-1 text-sm" value={editingBand.maxScore ?? 100} onChange={e => setEditingBand({...editingBand, maxScore: parseInt(e.target.value)})} />
                         </div>
                         <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Color Badge</label>
                            <div className="flex gap-2 flex-wrap">
                               {COLORS.map(c => (
                                  <button 
                                    key={c.label} type="button"
                                    onClick={() => setEditingBand({...editingBand, colorCode: c.value})}
                                    className={`w-6 h-6 rounded-full border ${c.value.split(' ')[0]} ${editingBand.colorCode === c.value ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
                                    title={c.label}
                                  />
                               ))}
                            </div>
                         </div>
                      </div>
                      <div className="flex justify-end gap-2">
                         <button type="button" onClick={() => setIsBandEditorOpen(false)} className="px-3 py-1 bg-white border rounded text-xs">Cancel</button>
                         <button type="button" onClick={handleSaveBand} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs">Save Band</button>
                      </div>
                   </div>
                )}

                {/* Bands List */}
                <div className="space-y-2">
                   {formData.bands?.length === 0 ? (
                      <div className="text-center text-slate-400 text-sm py-2">No bands defined yet.</div>
                   ) : (
                      formData.bands?.sort((a,b) => b.maxScore - a.maxScore).map(band => (
                         <div key={band.id || band.name} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded hover:bg-slate-50">
                            <div>
                               <div className="text-sm font-medium">{band.name} ({band.code})</div>
                               <div className="text-xs text-slate-500">Range: {band.minScore} - {band.maxScore}</div>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className={`px-2 py-0.5 text-[10px] rounded ${band.colorCode}`}>Preview</span>
                               <button type="button" onClick={() => handleEditBand(band)} className="text-indigo-600 hover:text-indigo-800"><Edit2 className="w-3 h-3" /></button>
                               <button type="button" onClick={() => handleDeleteBand(band.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-3 h-3" /></button>
                            </div>
                         </div>
                      ))
                   )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Scheme</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
