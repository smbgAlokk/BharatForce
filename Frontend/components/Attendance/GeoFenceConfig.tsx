import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GeoFenceLocation, UserRole } from '../../types';
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react';

export const GeoFenceConfig: React.FC = () => {
  const { geoFences, currentTenant, addGeoFence, updateGeoFence, deleteGeoFence, userRole, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GeoFenceLocation | null>(null);
  const [formData, setFormData] = useState<Partial<GeoFenceLocation>>({ 
    isActive: true, 
    radiusMeters: 100
  });

  const myFences = geoFences.filter(g => g.companyId === currentTenant?.id);
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleOpenModal = (item?: GeoFenceLocation) => {
    if (isReadOnly) return;
    setEditingItem(item || null);
    if (item) {
       setFormData(item);
    } else {
       setFormData({ 
          isActive: true, 
          radiusMeters: 100
       });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !formData.name) return;

    const now = new Date().toISOString();
    const base = {
       ...formData as GeoFenceLocation,
       companyId: currentTenant.id,
       updatedAt: now,
       updatedBy: currentUser.name
    };

    if (editingItem) {
       updateGeoFence(base);
    } else {
       addGeoFence({
          ...base,
          id: `geo-${Date.now()}`,
          createdAt: now,
          createdBy: currentUser.name
       });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Geofence Locations</h2>
             <p className="text-sm text-slate-500">Define office locations for optional GPS tracking.</p>
          </div>
          {!isReadOnly && (
             <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> Add Location
             </button>
          )}
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myFences.length === 0 ? (
             <div className="col-span-2 text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">No locations defined.</div>
          ) : (
             myFences.map(geo => (
                <div key={geo.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                   <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                         <div className="h-8 w-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                            <MapPin className="w-4 h-4" />
                         </div>
                         <div>
                            <span className="font-bold text-slate-900 block">{geo.name}</span>
                            <span className={`inline-block text-[10px] px-2 rounded-full ${geo.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                               {geo.isActive ? 'Active' : 'Inactive'}
                            </span>
                         </div>
                      </div>
                      {!isReadOnly && (
                         <div className="flex gap-2">
                            <button onClick={() => handleOpenModal(geo)} className="text-indigo-600 hover:text-indigo-900">
                               <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteGeoFence(geo.id)} className="text-red-600 hover:text-red-900">
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      )}
                   </div>
                   <div className="text-xs text-slate-500 mt-3 grid grid-cols-2 gap-2">
                      <div>Lat: {geo.latitude}</div>
                      <div>Long: {geo.longitude}</div>
                      <div className="col-span-2">Radius: {geo.radiusMeters} meters</div>
                   </div>
                </div>
             ))
          )}
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Location' : 'Add Location'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Location Name</label>
                      <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                         value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Latitude</label>
                         <input required type="number" step="any" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.latitude || ''} onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Longitude</label>
                         <input required type="number" step="any" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.longitude || ''} onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})} />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Radius (Meters)</label>
                      <input required type="number" min="10" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                         value={formData.radiusMeters || 100} onChange={e => setFormData({...formData, radiusMeters: parseInt(e.target.value)})} />
                      <p className="text-xs text-slate-500 mt-1">Tolerance radius for geofence checks.</p>
                   </div>
                   <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2 rounded text-indigo-600"/>
                         Active
                      </label>
                   </div>
                   <div className="flex justify-end space-x-3 mt-6">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Location</button>
                   </div>
                </form>
             </div>
          </div>
       )}
    </div>
  );
};