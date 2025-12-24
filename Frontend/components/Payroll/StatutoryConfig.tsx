
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PFConfig, ESIConfig, PTConfig, UserRole } from '../../types';
import { Save, Shield, MapPin } from 'lucide-react';

export const StatutoryConfig: React.FC = () => {
  const { pfConfigs, esiConfigs, ptConfigs, currentTenant, updatePFConfig, updateESIConfig, updatePTConfig, userRole, currentUser } = useApp();
  
  const [activeTab, setActiveTab] = useState<'PF' | 'ESI' | 'PT' | 'LWF' | 'TDS'>('PF');
  
  // For simplified prototype, we edit the first active config found or create placeholder
  const myPF = pfConfigs.find(c => c.companyId === currentTenant?.id) || { 
     id: 'temp-pf', companyId: currentTenant?.id || '', effectiveFrom: '2023-04-01', employeeContributionRate: 12, employerContributionRate: 12, wageCeilingAmount: 15000, restrictContributionToCeiling: true, includeAdminCharges: true, isActive: true 
  } as PFConfig;

  const myESI = esiConfigs.find(c => c.companyId === currentTenant?.id) || {
     id: 'temp-esi', companyId: currentTenant?.id || '', effectiveFrom: '2023-04-01', employeeContributionRate: 0.75, employerContributionRate: 3.25, wageCeilingAmount: 21000, isActive: true
  } as ESIConfig;

  const myPT = ptConfigs.find(c => c.companyId === currentTenant?.id) || {
     id: 'temp-pt', companyId: currentTenant?.id || '', state: 'Maharashtra', effectiveFrom: '2023-04-01', deductionFrequency: 'Monthly', isActive: true, slabs: []
  } as PTConfig;

  // Form States
  const [pfData, setPfData] = useState<PFConfig>(myPF);
  const [esiData, setEsiData] = useState<ESIConfig>(myESI);
  const [ptData, setPtData] = useState<PTConfig>(myPT);

  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleSavePF = (e: React.FormEvent) => {
     e.preventDefault();
     updatePFConfig({ ...pfData, updatedAt: new Date().toISOString(), updatedBy: currentUser.name });
     alert('PF Settings Saved');
  };

  const handleSaveESI = (e: React.FormEvent) => {
     e.preventDefault();
     updateESIConfig({ ...esiData, updatedAt: new Date().toISOString(), updatedBy: currentUser.name });
     alert('ESI Settings Saved');
  };

  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-xl font-bold text-slate-900">Statutory Configuration</h2>
          <p className="text-sm text-slate-500">Manage compliance rules for PF, ESI, PT, and more.</p>
       </div>

       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto">
             {['PF', 'ESI', 'PT', 'LWF', 'TDS'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                   {tab} Rules
                </button>
             ))}
          </div>

          <div className="p-6">
             
             {/* PF CONFIG */}
             {activeTab === 'PF' && (
                <form onSubmit={handleSavePF} className="space-y-6 max-w-3xl">
                   <div className="bg-slate-50 p-4 rounded border border-slate-200 flex items-start gap-3">
                      <Shield className="w-5 h-5 text-indigo-600 mt-0.5" />
                      <div>
                         <h4 className="font-bold text-slate-800">Provident Fund (EPF)</h4>
                         <p className="text-sm text-slate-600">Employees' Provident Fund Organisation (EPFO) India compliance rules.</p>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Employee Contribution (%)</label>
                         <input type="number" step="0.01" disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm"
                            value={pfData.employeeContributionRate} onChange={e => setPfData({...pfData, employeeContributionRate: parseFloat(e.target.value)})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Employer Contribution (%)</label>
                         <input type="number" step="0.01" disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm"
                            value={pfData.employerContributionRate} onChange={e => setPfData({...pfData, employerContributionRate: parseFloat(e.target.value)})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Wage Ceiling Amount (₹)</label>
                         <input type="number" disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm"
                            value={pfData.wageCeilingAmount} onChange={e => setPfData({...pfData, wageCeilingAmount: parseFloat(e.target.value)})} />
                      </div>
                      <div className="md:col-span-2 space-y-3 pt-2">
                         <label className="flex items-center text-sm font-medium text-slate-700">
                            <input type="checkbox" disabled={isReadOnly} checked={pfData.restrictContributionToCeiling} onChange={e => setPfData({...pfData, restrictContributionToCeiling: e.target.checked})} className="mr-2 rounded text-indigo-600" />
                            Restrict Employer Contribution to Ceiling (₹15,000)
                         </label>
                         <label className="flex items-center text-sm font-medium text-slate-700">
                            <input type="checkbox" disabled={isReadOnly} checked={pfData.includeAdminCharges} onChange={e => setPfData({...pfData, includeAdminCharges: e.target.checked})} className="mr-2 rounded text-indigo-600" />
                            Include Admin Charges in Employer Liability
                         </label>
                      </div>
                   </div>

                   {!isReadOnly && (
                      <div className="flex justify-end">
                         <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center">
                            <Save className="w-4 h-4 mr-2" /> Save PF Rules
                         </button>
                      </div>
                   )}
                </form>
             )}

             {/* ESI CONFIG */}
             {activeTab === 'ESI' && (
                <form onSubmit={handleSaveESI} className="space-y-6 max-w-3xl">
                   <div className="bg-slate-50 p-4 rounded border border-slate-200 flex items-start gap-3">
                      <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                         <h4 className="font-bold text-slate-800">Employees' State Insurance (ESI)</h4>
                         <p className="text-sm text-slate-600">Medical and cash benefits for employees earning below ceiling.</p>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Employee Contribution (%)</label>
                         <input type="number" step="0.01" disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm"
                            value={esiData.employeeContributionRate} onChange={e => setEsiData({...esiData, employeeContributionRate: parseFloat(e.target.value)})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Employer Contribution (%)</label>
                         <input type="number" step="0.01" disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm"
                            value={esiData.employerContributionRate} onChange={e => setEsiData({...esiData, employerContributionRate: parseFloat(e.target.value)})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Wage Ceiling Amount (₹)</label>
                         <input type="number" disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md p-2 sm:text-sm"
                            value={esiData.wageCeilingAmount} onChange={e => setEsiData({...esiData, wageCeilingAmount: parseFloat(e.target.value)})} />
                      </div>
                   </div>

                   {!isReadOnly && (
                      <div className="flex justify-end">
                         <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 flex items-center">
                            <Save className="w-4 h-4 mr-2" /> Save ESI Rules
                         </button>
                      </div>
                   )}
                </form>
             )}

             {/* PT CONFIG */}
             {activeTab === 'PT' && (
                <div className="space-y-6 max-w-3xl">
                   <div className="bg-slate-50 p-4 rounded border border-slate-200 flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                         <h4 className="font-bold text-slate-800">Professional Tax (PT)</h4>
                         <p className="text-sm text-slate-600">State-specific tax deduction slabs.</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <label className="block text-sm font-medium text-slate-700">Select State</label>
                      <select 
                         className="border border-slate-300 rounded-md p-2 text-sm"
                         value={ptData.state}
                         onChange={e => setPtData({...ptData, state: e.target.value})}
                         disabled={isReadOnly}
                      >
                         <option value="Maharashtra">Maharashtra</option>
                         <option value="Karnataka">Karnataka</option>
                         <option value="Tamil Nadu">Tamil Nadu</option>
                         <option value="West Bengal">West Bengal</option>
                      </select>
                   </div>

                   <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-slate-200 text-sm">
                         <thead className="bg-slate-100">
                            <tr>
                               <th className="px-4 py-2 text-left">Min Gross</th>
                               <th className="px-4 py-2 text-left">Max Gross</th>
                               <th className="px-4 py-2 text-left">Amount (₹)</th>
                               <th className="px-4 py-2 text-left">Gender</th>
                            </tr>
                         </thead>
                         <tbody>
                            {ptData.slabs.length === 0 ? (
                               <tr><td colSpan={4} className="px-4 py-4 text-center text-slate-500">No slabs configured for this state.</td></tr>
                            ) : (
                               ptData.slabs.map(slab => (
                                  <tr key={slab.id} className="border-t border-slate-100">
                                     <td className="px-4 py-2">{slab.minGross}</td>
                                     <td className="px-4 py-2">{slab.maxGross === -1 ? 'Unlimited' : slab.maxGross}</td>
                                     <td className="px-4 py-2 font-bold">{slab.amount}</td>
                                     <td className="px-4 py-2">{slab.genderApplicability}</td>
                                  </tr>
                               ))
                            )}
                         </tbody>
                      </table>
                   </div>
                   {!isReadOnly && <p className="text-xs text-slate-500 italic text-center">Note: PT logic is mock-configured for Maharashtra.</p>}
                </div>
             )}
             
             {(activeTab === 'LWF' || activeTab === 'TDS') && (
                <div className="text-center py-12 text-slate-500 italic bg-slate-50 rounded border border-dashed border-slate-300">
                   Configuration for {activeTab} is under construction.
                </div>
             )}
          </div>
       </div>
    </div>
  );
};
