
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PerformanceMapping, MappingItem, UserRole } from '../../types';
import { Save, Plus, Trash2, Search, X } from 'lucide-react';

export const Mappings: React.FC = () => {
  const { departments, designations, performanceLibrary, performanceMappings, currentTenant, addPerformanceMapping, updatePerformanceMapping, userRole, currentUser } = useApp();
  
  const [activeTab, setActiveTab] = useState<'Department' | 'Designation'>('Department');
  const [selectedEntityId, setSelectedEntityId] = useState('');
  const [currentMapping, setCurrentMapping] = useState<PerformanceMapping | null>(null);
  const [mappedItems, setMappedItems] = useState<MappingItem[]>([]);
  
  // Select Item State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchItem, setSearchItem] = useState('');

  const myDepts = departments.filter(d => d.companyId === currentTenant?.id);
  const myDesigs = designations.filter(d => d.companyId === currentTenant?.id);
  const myItems = performanceLibrary.filter(i => i.companyId === currentTenant?.id && i.isActive);
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  // Load Mapping when Entity changes
  useEffect(() => {
    if (selectedEntityId) {
       const existing = performanceMappings.find(m => 
          m.companyId === currentTenant?.id && 
          m.entityType === activeTab && 
          m.entityId === selectedEntityId
       );
       if (existing) {
          setCurrentMapping(existing);
          setMappedItems(existing.items);
       } else {
          setCurrentMapping(null);
          setMappedItems([]);
       }
    } else {
       setMappedItems([]);
    }
  }, [selectedEntityId, activeTab, performanceMappings, currentTenant]);

  const handleSave = () => {
     if (!currentTenant || !selectedEntityId) return;
     
     const now = new Date().toISOString();
     const base = {
        items: mappedItems,
        isActive: true,
        companyId: currentTenant.id,
        updatedAt: now,
        updatedBy: currentUser.name
     };

     if (currentMapping) {
        updatePerformanceMapping({ ...currentMapping, ...base });
     } else {
        addPerformanceMapping({
           ...base,
           id: `map-${Date.now()}`,
           entityType: activeTab,
           entityId: selectedEntityId,
           createdAt: now,
           createdBy: currentUser.name
        });
     }
     alert('Mapping Saved Successfully!');
  };

  const handleAddItem = (itemId: string) => {
     const itemDef = performanceLibrary.find(i => i.id === itemId);
     if (!mappedItems.find(m => m.itemId === itemId)) {
        setMappedItems([...mappedItems, { 
           itemId, 
           isMandatory: true, 
           defaultWeightage: itemDef?.defaultWeightage || 0 
        }]);
     }
     setIsAddModalOpen(false);
  };

  const handleRemoveItem = (itemId: string) => {
     setMappedItems(mappedItems.filter(m => m.itemId !== itemId));
  };

  const handleUpdateItem = (itemId: string, field: keyof MappingItem, value: any) => {
     setMappedItems(mappedItems.map(m => m.itemId === itemId ? { ...m, [field]: value } : m));
  };

  const getItemName = (id: string) => myItems.find(i => i.id === id)?.name || 'Unknown Item';
  const getItemType = (id: string) => myItems.find(i => i.id === id)?.itemType || '-';

  const filteredLibrary = myItems.filter(item => 
     !mappedItems.some(m => m.itemId === item.id) && 
     item.name.toLowerCase().includes(searchItem.toLowerCase())
  );

  return (
    <div className="space-y-6">
       <div className="flex space-x-4 border-b border-slate-200 pb-1">
          <button 
            onClick={() => { setActiveTab('Department'); setSelectedEntityId(''); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Department' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
             Department Mapping
          </button>
          <button 
             onClick={() => { setActiveTab('Designation'); setSelectedEntityId(''); }}
             className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'Designation' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
             Designation Mapping
          </button>
       </div>

       <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="mb-6 max-w-md">
             <label className="block text-sm font-medium text-slate-700 mb-2">
                Select {activeTab}
             </label>
             <select 
               className="block w-full border-slate-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 sm:text-sm border"
               value={selectedEntityId}
               onChange={e => setSelectedEntityId(e.target.value)}
             >
                <option value="">-- Select --</option>
                {activeTab === 'Department' 
                   ? myDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                   : myDesigs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                }
             </select>
          </div>

          {selectedEntityId ? (
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <h3 className="font-bold text-slate-900">Mapped Performance Items</h3>
                   {!isReadOnly && (
                      <button onClick={() => setIsAddModalOpen(true)} className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                         <Plus className="h-4 w-4 mr-1" /> Add Item
                      </button>
                   )}
                </div>
                
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                   <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                         <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Weightage (%)</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Mandatory</th>
                            {!isReadOnly && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>}
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                         {mappedItems.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No items mapped yet.</td></tr>
                         ) : (
                            mappedItems.map((m, idx) => (
                               <tr key={m.itemId}>
                                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{getItemName(m.itemId)}</td>
                                  <td className="px-6 py-4 text-sm text-slate-500">{getItemType(m.itemId) === 'CoreValue' ? 'Core Value' : 'KPI'}</td>
                                  <td className="px-6 py-4">
                                     <input 
                                       type="number" min="0" max="100" 
                                       value={m.defaultWeightage}
                                       disabled={isReadOnly}
                                       onChange={e => handleUpdateItem(m.itemId, 'defaultWeightage', parseFloat(e.target.value))}
                                       className="w-20 border-slate-300 rounded p-1 text-sm border"
                                     />
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                     <input 
                                       type="checkbox"
                                       checked={m.isMandatory}
                                       disabled={isReadOnly}
                                       onChange={e => handleUpdateItem(m.itemId, 'isMandatory', e.target.checked)}
                                       className="rounded text-indigo-600"
                                     />
                                  </td>
                                  {!isReadOnly && (
                                     <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleRemoveItem(m.itemId)} className="text-red-600 hover:text-red-900">
                                           <Trash2 className="w-4 h-4" />
                                        </button>
                                     </td>
                                  )}
                               </tr>
                            ))
                         )}
                      </tbody>
                   </table>
                </div>

                {!isReadOnly && (
                   <div className="flex justify-end">
                      <button onClick={handleSave} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                         <Save className="h-4 w-4 mr-2" /> Save Mapping
                      </button>
                   </div>
                )}
             </div>
          ) : (
             <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                Select a {activeTab} to view or configure mappings.
             </div>
          )}
       </div>

       {/* Add Item Modal */}
       {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold">Add Performance Item</h3>
                   <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="mb-4 relative">
                   <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                   <input 
                     type="text" 
                     className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm" 
                     placeholder="Search library..." 
                     value={searchItem}
                     onChange={e => setSearchItem(e.target.value)}
                     autoFocus
                   />
                </div>

                <div className="max-h-64 overflow-y-auto custom-scrollbar border border-slate-200 rounded-md divide-y divide-slate-100">
                   {filteredLibrary.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-sm">No matching items found.</div>
                   ) : (
                      filteredLibrary.map(item => (
                         <div key={item.id} className="p-3 hover:bg-slate-50 flex justify-between items-center cursor-pointer" onClick={() => handleAddItem(item.id)}>
                            <div>
                               <div className="text-sm font-medium text-slate-900">{item.name}</div>
                               <div className="text-xs text-slate-500">{item.itemType === 'CoreValue' ? 'Core Value' : 'KPI'} • {item.frequency}</div>
                            </div>
                            <Plus className="w-4 h-4 text-indigo-600" />
                         </div>
                      ))
                   )}
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
