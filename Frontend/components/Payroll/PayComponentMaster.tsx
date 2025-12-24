
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PayComponent, ComponentType, CalculationType, UserRole } from '../../types';
import { Plus, Edit2, Check, X, AlertCircle } from 'lucide-react';

export const PayComponentMaster: React.FC = () => {
  const { payComponents, currentTenant, addPayComponent, updatePayComponent, userRole, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PayComponent | null>(null);
  const [formData, setFormData] = useState<Partial<PayComponent>>({ 
    isActive: true, 
    type: 'Earning',
    calculationType: 'Flat Amount',
    isPartOfCtc: true,
    showInPayslip: true,
    isTaxable: true,
    // Defaults for new fields
    calculationScope: 'Every Run',
    dependencyType: 'Independent',
    attendanceProration: false
  });

  const myComponents = payComponents.filter(c => c.companyId === currentTenant?.id);
  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleOpenModal = (item?: PayComponent) => {
    if (isReadOnly) return;
    setEditingItem(item || null);
    setFormData(item || { 
      isActive: true, 
      type: 'Earning',
      calculationType: 'Flat Amount',
      isPartOfCtc: true,
      showInPayslip: true,
      isTaxable: true,
      calculationScope: 'Every Run',
      dependencyType: 'Independent',
      attendanceProration: false
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant || !formData.name || !formData.code) return;

    const now = new Date().toISOString();
    const base = {
       ...formData as PayComponent,
       companyId: currentTenant.id,
       updatedAt: now,
       updatedBy: currentUser.name
    };

    if (editingItem) {
       updatePayComponent(base);
    } else {
       addPayComponent({
          ...base,
          id: `comp-${Date.now()}`,
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
             <h2 className="text-lg font-bold text-slate-900">Pay Components</h2>
             <p className="text-sm text-slate-500">Define Earnings, Deductions, and Statutory components.</p>
          </div>
          {!isReadOnly && (
             <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> Add Component
             </button>
          )}
       </div>

       <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Code</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Calculation</th>
                   <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                   {!isReadOnly && <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>}
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {myComponents.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No pay components defined.</td></tr>
                ) : (
                   myComponents.map(comp => (
                      <tr key={comp.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 text-sm font-mono text-slate-600">{comp.code}</td>
                         <td className="px-6 py-4 text-sm font-medium text-slate-900">
                            {comp.name}
                            {comp.isStatutoryComponent && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 px-1 rounded">{comp.statutoryType}</span>}
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-500">
                            <span className={`px-2 py-1 text-xs rounded ${comp.type === 'Deduction' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{comp.type}</span>
                         </td>
                         <td className="px-6 py-4 text-center text-xs text-slate-500">
                            {comp.attendanceProration && <span className="bg-yellow-50 text-yellow-700 px-1 rounded mr-1">Prorated</span>}
                            {comp.calculationType}
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${comp.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                               {comp.isActive ? 'Active' : 'Inactive'}
                            </span>
                         </td>
                         {!isReadOnly && (
                            <td className="px-6 py-4 text-right">
                               <button onClick={() => handleOpenModal(comp)} className="text-indigo-600 hover:text-indigo-900">
                                  <Edit2 className="w-4 h-4" />
                               </button>
                            </td>
                         )}
                      </tr>
                   ))
                )}
             </tbody>
          </table>
       </div>

       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <h3 className="text-lg font-bold mb-4">{editingItem ? 'Edit Component' : 'Add Component'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Name</label>
                         <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                            value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Code</label>
                         <input required type="text" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm uppercase" 
                            value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Type</label>
                         <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ComponentType})}
                         >
                            <option value="Earning">Earning</option>
                            <option value="Deduction">Deduction</option>
                            <option value="Reimbursement">Reimbursement</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Scope</label>
                         <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.calculationScope || 'Every Run'} onChange={e => setFormData({...formData, calculationScope: e.target.value as any})}
                         >
                            <option value="Every Run">Every Run</option>
                            <option value="First Run">First Run Only</option>
                            <option value="Ad-hoc">Ad-hoc (Manual)</option>
                         </select>
                      </div>
                   </div>

                   {/* Calculation Logic */}
                   <div className="bg-indigo-50 p-4 rounded border border-indigo-100 space-y-4">
                      <h4 className="font-bold text-xs text-indigo-900 uppercase">Calculation Rules</h4>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Calculation Basis</label>
                         <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.calculationType} onChange={e => setFormData({...formData, calculationType: e.target.value as CalculationType})}
                         >
                            <option value="Flat Amount">Flat Amount</option>
                            <option value="Percentage of Basic">Percentage of Basic</option>
                            <option value="Percentage of CTC">Percentage of CTC</option>
                            <option value="Percentage of Remaining CTC">Percentage of Remaining CTC</option>
                         </select>
                      </div>

                      {formData.calculationType?.includes('Percentage') && formData.calculationType !== 'Percentage of Basic' && formData.calculationType !== 'Percentage of CTC' && (
                          <div>
                             <label className="block text-sm font-medium text-slate-700">Base Component</label>
                             <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                                value={formData.baseComponentId || ''} onChange={e => setFormData({...formData, baseComponentId: e.target.value})}
                             >
                                <option value="">Select Base Component</option>
                                {myComponents.filter(c => c.id !== editingItem?.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                             </select>
                          </div>
                      )}

                      <div className="flex flex-col gap-2">
                         <label className="flex items-center text-sm text-slate-700">
                            <input type="checkbox" checked={formData.attendanceProration} onChange={e => setFormData({...formData, attendanceProration: e.target.checked})} className="mr-2 rounded text-indigo-600" />
                            Prorate based on Attendance?
                         </label>
                         {formData.attendanceProration && (
                            <label className="flex items-center text-sm text-slate-700 ml-6">
                               <input type="checkbox" checked={formData.prorateForLOP} onChange={e => setFormData({...formData, prorateForLOP: e.target.checked})} className="mr-2 rounded text-indigo-600" />
                               Deduct for LOP days
                            </label>
                         )}
                      </div>
                   </div>

                   {/* Statutory Flags */}
                   <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <div className="flex items-center mb-2">
                         <input type="checkbox" id="isStat" checked={formData.isStatutoryComponent} onChange={e => setFormData({...formData, isStatutoryComponent: e.target.checked})} className="mr-2" />
                         <label htmlFor="isStat" className="text-sm font-medium text-slate-700">Is Statutory Component?</label>
                      </div>
                      {formData.isStatutoryComponent && (
                         <select className="block w-full border border-slate-300 rounded-md shadow-sm p-1.5 text-sm"
                            value={formData.statutoryType || ''} onChange={e => setFormData({...formData, statutoryType: e.target.value as any})}
                         >
                            <option value="">Select Type</option>
                            <option value="PF">Provident Fund</option>
                            <option value="ESI">ESI</option>
                            <option value="PT">Professional Tax</option>
                            <option value="TDS">TDS</option>
                         </select>
                      )}
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={formData.isPartOfCtc} onChange={e => setFormData({...formData, isPartOfCtc: e.target.checked})} className="mr-2" />
                         Part of CTC
                      </label>
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={formData.isTaxable} onChange={e => setFormData({...formData, isTaxable: e.target.checked})} className="mr-2" />
                         Taxable
                      </label>
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={formData.showInPayslip} onChange={e => setFormData({...formData, showInPayslip: e.target.checked})} className="mr-2" />
                         Show in Payslip
                      </label>
                      <label className="flex items-center text-sm text-slate-700">
                         <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="mr-2" />
                         Active
                      </label>
                   </div>

                   <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
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
