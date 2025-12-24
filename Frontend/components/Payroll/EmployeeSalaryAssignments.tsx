

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmployeeSalaryAssignment, UserRole } from '../../types';
import { Search, Plus, Eye, IndianRupee, Edit2, X } from 'lucide-react';

export const EmployeeSalaryAssignments: React.FC = () => {
  const { salaryAssignments, employees, salaryTemplates, payComponents, currentTenant, assignEmployeeSalary, userRole, currentUser } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewAssignment, setViewAssignment] = useState<EmployeeSalaryAssignment | null>(null);

  // Form State
  const [selectedEmp, setSelectedEmp] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [annualCtc, setAnnualCtc] = useState<number>(0);
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  const myAssignments = salaryAssignments.filter(a => a.companyId === currentTenant?.id && a.status === 'Active');
  const myEmployees = employees.filter(e => e.companyId === currentTenant?.id && e.status === 'Active');
  const myTemplates = salaryTemplates.filter(t => t.companyId === currentTenant?.id && t.isActive);

  const isReadOnly = userRole === UserRole.SUPER_ADMIN;

  const handleSave = (e: React.FormEvent) => {
     e.preventDefault();
     if (!currentTenant || !selectedEmp || !selectedTemplate || annualCtc <= 0) return;

     const newAssignment: EmployeeSalaryAssignment = {
        id: `assign-${Date.now()}`,
        companyId: currentTenant.id,
        employeeId: selectedEmp,
        templateId: selectedTemplate,
        annualCtc,
        monthlyGross: annualCtc / 12, // Placeholder, updated in context logic
        effectiveFrom: effectiveDate,
        status: 'Active',
        components: [], // Filled by context logic
        createdAt: new Date().toISOString(),
        createdBy: currentUser.name
     };

     assignEmployeeSalary(newAssignment, selectedTemplate);
     setIsModalOpen(false);
     resetForm();
  };

  const resetForm = () => {
     setSelectedEmp('');
     setSelectedTemplate('');
     setAnnualCtc(0);
  };

  const getEmpName = (id: string) => {
     const e = employees.find(em => em.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };

  const getTemplateName = (id: string) => salaryTemplates.find(t => t.id === id)?.name || 'Unknown';
  const getComponentName = (id: string) => payComponents.find(c => c.id === id)?.name || id;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="text-lg font-bold text-slate-900">Employee Salary Map</h2>
             <p className="text-sm text-slate-500">Assign CTC and salary structures to employees.</p>
          </div>
          {!isReadOnly && (
             <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" /> Assign Salary
             </button>
          )}
       </div>

       <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Template</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Annual CTC</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Monthly Gross</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Effective From</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {myAssignments.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No salary assignments active.</td></tr>
                ) : (
                   myAssignments.map(assign => (
                      <tr key={assign.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 text-sm font-medium text-slate-900">{getEmpName(assign.employeeId)}</td>
                         <td className="px-6 py-4 text-sm text-slate-600">{getTemplateName(assign.templateId)}</td>
                         <td className="px-6 py-4 text-right text-sm font-bold text-slate-700">₹ {assign.annualCtc.toLocaleString('en-IN')}</td>
                         <td className="px-6 py-4 text-right text-sm text-indigo-600">₹ {Math.round(assign.monthlyGross).toLocaleString('en-IN')}</td>
                         <td className="px-6 py-4 text-sm text-slate-500">{new Date(assign.effectiveFrom).toLocaleDateString()}</td>
                         <td className="px-6 py-4 text-right">
                            <button onClick={() => setViewAssignment(assign)} className="text-indigo-600 hover:text-indigo-900">
                               <Eye className="w-4 h-4" />
                            </button>
                         </td>
                      </tr>
                   ))
                )}
             </tbody>
          </table>
       </div>

       {/* Create Modal */}
       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">Assign Salary Structure</h3>
                <form onSubmit={handleSave} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Employee</label>
                      <select required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)}
                      >
                         <option value="">Select Employee</option>
                         {myEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Structure Template</label>
                      <select required className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}
                      >
                         <option value="">Select Template</option>
                         {myTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Annual CTC (₹)</label>
                      <input required type="number" min="0" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={annualCtc || ''} onChange={e => setAnnualCtc(parseFloat(e.target.value))} />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Effective From</label>
                      <input required type="date" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} />
                   </div>
                   <div className="flex justify-end space-x-3 mt-6">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save Assignment</button>
                   </div>
                </form>
             </div>
          </div>
       )}

       {/* View Details Modal */}
       {viewAssignment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                   <div>
                      <h3 className="text-lg font-bold text-slate-900">Salary Breakdown</h3>
                      <p className="text-sm text-slate-500">{getEmpName(viewAssignment.employeeId)}</p>
                   </div>
                   <button onClick={() => setViewAssignment(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="mb-6 grid grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded border border-slate-100">
                   <div>
                      <span className="block text-slate-500">Annual CTC</span>
                      <span className="font-bold text-lg">₹ {viewAssignment.annualCtc.toLocaleString()}</span>
                   </div>
                   <div>
                      <span className="block text-slate-500">Monthly Gross (Approx)</span>
                      <span className="font-bold text-lg text-indigo-600">₹ {Math.round(viewAssignment.monthlyGross).toLocaleString()}</span>
                   </div>
                   <div>
                      <span className="block text-slate-500">Template</span>
                      <span className="font-medium">{getTemplateName(viewAssignment.templateId)}</span>
                   </div>
                </div>

                <h4 className="font-bold text-sm text-slate-800 mb-3 uppercase">Component Breakup (Monthly)</h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                   <table className="min-w-full text-sm">
                      <thead className="bg-slate-50">
                         <tr>
                            <th className="px-4 py-2 text-left font-medium text-slate-500">Component</th>
                            <th className="px-4 py-2 text-right font-medium text-slate-500">Monthly Amount</th>
                            <th className="px-4 py-2 text-right font-medium text-slate-500">Annual Amount</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {viewAssignment.components.map(comp => (
                            <tr key={comp.id}>
                               <td className="px-4 py-2 text-slate-800">{getComponentName(comp.componentId)}</td>
                               <td className="px-4 py-2 text-right font-mono">₹ {Math.round(comp.monthlyAmount).toLocaleString()}</td>
                               <td className="px-4 py-2 text-right font-mono text-slate-500">₹ {Math.round(comp.annualAmount).toLocaleString()}</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
       )}
    </div>
  );
};