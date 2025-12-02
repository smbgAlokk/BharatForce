
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Search, ChevronRight, User as UserIcon, Filter } from 'lucide-react';
import { EmployeePlanEditor } from './EmployeePlanEditor';

export const GoalSetting: React.FC = () => {
  const { performanceCycles, employees, departments, currentTenant, userRole, currentUser, getOrCreatePerformancePlan } = useApp();
  
  // 1. Select Cycle
  // Default to first active cycle or just first
  const activeCycle = performanceCycles.find(c => c.companyId === currentTenant?.id && c.status === 'Active');
  const [selectedCycleId, setSelectedCycleId] = useState<string>(activeCycle?.id || '');

  // 2. Filter Employees
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // 3. Selection State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Derived Lists
  const myCycles = performanceCycles.filter(c => c.companyId === currentTenant?.id);
  
  const eligibleEmployees = employees.filter(e => {
     if (e.companyId !== currentTenant?.id) return false;
     if (e.status === 'Separated') return false;

     // Manager Scoping
     if (userRole === UserRole.MANAGER) {
        // Show direct reports
        return e.reportingManagerId === currentUser.employeeId;
     }
     // Employee Scoping (Safety net, should be redirected by parent)
     if (userRole === UserRole.EMPLOYEE) {
        return e.id === currentUser.employeeId;
     }

     return true;
  });

  const filteredEmployees = eligibleEmployees.filter(e => {
     const matchesSearch = `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesDept = deptFilter ? e.departmentId === deptFilter : true;
     return matchesSearch && matchesDept;
  });

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || '-';

  // If editing a specific plan
  if (selectedEmployeeId && selectedCycleId) {
     const plan = getOrCreatePerformancePlan(selectedEmployeeId, selectedCycleId);
     const emp = employees.find(e => e.id === selectedEmployeeId);
     const cycle = performanceCycles.find(c => c.id === selectedCycleId);

     if (plan && emp && cycle) {
        return (
           <EmployeePlanEditor 
              plan={plan} 
              employee={emp} 
              cycle={cycle} 
              onBack={() => setSelectedEmployeeId(null)} 
           />
        );
     }
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          <div className="w-full md:w-auto">
             <label className="block text-xs font-bold text-indigo-800 uppercase mb-1">Select Performance Cycle</label>
             <select 
               className="block w-full md:w-64 border-indigo-200 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 sm:text-sm"
               value={selectedCycleId}
               onChange={e => setSelectedCycleId(e.target.value)}
             >
                <option value="">-- Select Cycle --</option>
                {myCycles.map(c => (
                   <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
                ))}
             </select>
          </div>
          <div className="text-sm text-indigo-700">
             {selectedCycleId && myCycles.find(c => c.id === selectedCycleId)?.status !== 'Active' && (
                <span>Note: This cycle is not active. Goal setting may be restricted.</span>
             )}
          </div>
       </div>

       {!selectedCycleId ? (
          <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
             Please select a performance cycle to proceed.
          </div>
       ) : (
          <div className="space-y-4">
             {/* Employee Filters */}
             <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-slate-400" />
                   </div>
                   <input 
                      type="text" 
                      className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                      placeholder="Search Employee Name..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                   />
                </div>
                <select 
                   className="block pl-3 pr-8 py-2 border border-slate-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                   value={deptFilter}
                   onChange={e => setDeptFilter(e.target.value)}
                >
                   <option value="">All Departments</option>
                   {departments.filter(d => d.companyId === currentTenant?.id).map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                   ))}
                </select>
             </div>

             {/* Employee List */}
             <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                   <thead className="bg-slate-50">
                      <tr>
                         <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Department</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Designation</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Plan Status</th>
                         <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                      </tr>
                   </thead>
                   <tbody className="bg-white divide-y divide-slate-200">
                      {filteredEmployees.length === 0 ? (
                         <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No employees found.</td></tr>
                      ) : (
                         filteredEmployees.map(emp => {
                            // Check status of plan
                            // We don't have a direct reference easily without iterating, but getOrCreate handles it.
                            // For listing, we might just show "Set Goals"
                            return (
                               <tr key={emp.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedEmployeeId(emp.id)}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                     <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                           {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                                        </div>
                                        <div className="ml-3">
                                           <div className="text-sm font-medium text-slate-900">{emp.firstName} {emp.lastName}</div>
                                           <div className="text-xs text-slate-500">{emp.employeeCode}</div>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getDeptName(emp.departmentId)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">-</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                     <span className="px-2 py-1 text-xs rounded bg-slate-100 text-slate-600">Draft / New</span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right">
                                     <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center justify-end ml-auto">
                                        Manage Goals <ChevronRight className="w-4 h-4 ml-1" />
                                     </button>
                                  </td>
                               </tr>
                            );
                         })
                      )}
                   </tbody>
                </table>
             </div>
          </div>
       )}
    </div>
  );
};
