
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PayrollConfig, UserRole } from '../../types';
import { Save, Settings } from 'lucide-react';

export const PayrollConfiguration: React.FC = () => {
  const { payrollConfigs, currentTenant, addPayrollConfig, updatePayrollConfig, userRole, currentUser } = useApp();
  
  const myConfig = payrollConfigs.find(c => c.companyId === currentTenant?.id);
  const [formData, setFormData] = useState<Partial<PayrollConfig>>({
     payrollCycle: 'Monthly',
     periodStartDay: 1,
     periodEndDay: 30,
     salaryPaymentDay: 1,
     financialYearStartMonth: 4,
     currency: 'INR',
     statutoryEnabled: true,
     pfEnabled: true,
     esiEnabled: true,
     ptEnabled: true,
     tdsHandling: 'Full Tax Regime',
     isActive: true
  });

  useEffect(() => {
     if (myConfig) {
        setFormData(myConfig);
     }
  }, [myConfig]);

  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleChange = (field: keyof PayrollConfig, value: any) => {
     setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
     e.preventDefault();
     if (!currentTenant) return;
     const now = new Date().toISOString();
     const base = {
        ...formData as PayrollConfig,
        companyId: currentTenant.id,
        updatedAt: now,
        updatedBy: currentUser.name
     };

     if (myConfig) {
        updatePayrollConfig(base);
     } else {
        addPayrollConfig({ ...base, id: `pconf-${Date.now()}`, createdAt: now, createdBy: currentUser.name });
     }
     alert('Configuration saved successfully.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
             <Settings className="w-6 h-6" />
          </div>
          <div>
             <h2 className="text-xl font-bold text-slate-900">Payroll Configuration</h2>
             <p className="text-sm text-slate-500">Define general payroll settings for your company.</p>
          </div>
       </div>

       <form onSubmit={handleSave} className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-6 space-y-8">
             {/* Section 1: Cycle */}
             <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase mb-4 pb-2 border-b">Cycle & Period</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Payroll Cycle</label>
                      <select disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.payrollCycle} onChange={e => handleChange('payrollCycle', e.target.value)}
                      >
                         <option value="Monthly">Monthly</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Period Start Day</label>
                      <input type="number" min="1" max="31" disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.periodStartDay} onChange={e => handleChange('periodStartDay', parseInt(e.target.value))} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Period End Day</label>
                      <input type="number" min="1" max="31" disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.periodEndDay} onChange={e => handleChange('periodEndDay', parseInt(e.target.value))} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Payment Day (of next month)</label>
                      <input type="number" min="1" max="31" disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.salaryPaymentDay} onChange={e => handleChange('salaryPaymentDay', parseInt(e.target.value))} />
                   </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Financial Year Start Month</label>
                      <select disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={formData.financialYearStartMonth} onChange={e => handleChange('financialYearStartMonth', parseInt(e.target.value))}
                      >
                         <option value={1}>January</option>
                         <option value={4}>April</option>
                      </select>
                   </div>
                </div>
             </div>

             {/* Section 2: Statutory */}
             <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase mb-4 pb-2 border-b">Statutory & Compliance</h3>
                <div className="space-y-4">
                   <div className="flex items-center">
                      <input type="checkbox" id="statEnabled" disabled={isReadOnly} checked={formData.statutoryEnabled} onChange={e => handleChange('statutoryEnabled', e.target.checked)} className="h-4 w-4 text-indigo-600 border-slate-300 rounded" />
                      <label htmlFor="statEnabled" className="ml-2 block text-sm font-bold text-slate-900">Enable Statutory Compliance (PF, ESI, PT, TDS)</label>
                   </div>

                   {formData.statutoryEnabled && (
                      <div className="ml-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded border border-slate-200">
                         <label className="flex items-center">
                            <input type="checkbox" disabled={isReadOnly} checked={formData.pfEnabled} onChange={e => handleChange('pfEnabled', e.target.checked)} className="mr-2 rounded text-indigo-600"/> PF
                         </label>
                         <label className="flex items-center">
                            <input type="checkbox" disabled={isReadOnly} checked={formData.esiEnabled} onChange={e => handleChange('esiEnabled', e.target.checked)} className="mr-2 rounded text-indigo-600"/> ESI
                         </label>
                         <label className="flex items-center">
                            <input type="checkbox" disabled={isReadOnly} checked={formData.ptEnabled} onChange={e => handleChange('ptEnabled', e.target.checked)} className="mr-2 rounded text-indigo-600"/> Professional Tax
                         </label>
                      </div>
                   )}

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">TDS Handling Mode</label>
                         <select disabled={isReadOnly} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                            value={formData.tdsHandling} onChange={e => handleChange('tdsHandling', e.target.value as any)}
                         >
                            <option value="Simple Flat TDS">Simple Flat TDS (Manual)</option>
                            <option value="Full Tax Regime">Full Tax Regime (Auto Calc)</option>
                         </select>
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Currency</label>
                         <input type="text" disabled value="INR" className="mt-1 block w-full border border-slate-300 bg-slate-100 rounded-md shadow-sm p-2 sm:text-sm text-slate-500" />
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {!isReadOnly && (
             <div className="bg-slate-50 px-6 py-4 text-right border-t border-slate-200">
                <button type="submit" className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                   <Save className="w-4 h-4 mr-2" /> Save Configuration
                </button>
             </div>
          )}
       </form>
    </div>
  );
};
