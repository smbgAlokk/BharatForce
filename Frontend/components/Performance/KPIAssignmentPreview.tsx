
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Users, Target, Briefcase, Layers, Search } from 'lucide-react';

export const KPIAssignmentPreview: React.FC = () => {
  const { 
    designations, departments, performanceMappings, performanceLibrary, employees, 
    currentTenant, userRole 
  } = useApp();

  const [viewMode, setViewMode] = useState<'Designation' | 'Department'>('Designation');
  const [searchTerm, setSearchTerm] = useState('');

  // Security check
  if (userRole === UserRole.EMPLOYEE || userRole === UserRole.MANAGER) {
     return <div className="p-6 text-center text-slate-500">Access Denied</div>;
  }

  const myDesignations = designations.filter(d => d.companyId === currentTenant?.id);
  const myDepartments = departments.filter(d => d.companyId === currentTenant?.id);
  const myMappings = performanceMappings.filter(m => m.companyId === currentTenant?.id && m.isActive);
  const myEmployees = employees.filter(e => e.companyId === currentTenant?.id && e.status === 'Active');

  // Prepare Data
  const entities = viewMode === 'Designation' ? myDesignations : myDepartments;

  const previewData = entities.map(entity => {
     // Find Mapping
     const mapping = myMappings.find(m => m.entityType === viewMode && m.entityId === entity.id);
     
     // Resolve KPIs
     const kpis = mapping?.items.map(mapItem => {
        const libItem = performanceLibrary.find(l => l.id === mapItem.itemId);
        return {
           id: mapItem.itemId,
           name: libItem?.name || 'Unknown KPI',
           type: libItem?.itemType || '-',
           weight: mapItem.defaultWeightage || libItem?.defaultWeightage || 0,
           isMandatory: mapItem.isMandatory
        };
     }) || [];

     // Find Inheriting Employees
     const inheritingEmployees = myEmployees.filter(e => 
        viewMode === 'Designation' 
           ? e.designationId === entity.id 
           : e.departmentId === entity.id
     );

     return {
        id: entity.id,
        name: entity.name,
        code: entity.code,
        kpis,
        employees: inheritingEmployees
     };
  }).filter(item => 
     item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.kpis.some(k => k.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
             <h2 className="text-lg font-bold text-slate-900">KPI Assignment Preview</h2>
             <p className="text-sm text-slate-500">Visualize how KPIs are inherited by employees based on their role.</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button 
               onClick={() => setViewMode('Designation')}
               className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'Designation' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
             >
                By Designation
             </button>
             <button 
               onClick={() => setViewMode('Department')}
               className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${viewMode === 'Department' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
             >
                By Department
             </button>
          </div>
       </div>

       {/* Search */}
       <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input 
             type="text" 
             className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
             placeholder={`Search ${viewMode}s or KPIs...`}
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
          />
       </div>

       <div className="grid grid-cols-1 gap-6">
          {previewData.map(item => (
             <div key={item.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                {/* Card Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-white border border-slate-200 rounded text-indigo-600">
                         {viewMode === 'Designation' ? <Briefcase className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                      </div>
                      <div>
                         <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                         <span className="text-xs text-slate-500 font-mono">{item.code}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                      <Users className="w-3 h-3" />
                      {item.employees.length} Employees Inherit
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                   {/* Left: Assigned KPIs */}
                   <div className="p-6">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center">
                         <Target className="w-4 h-4 mr-2" /> Assigned KPIs
                      </h4>
                      {item.kpis.length === 0 ? (
                         <div className="text-sm text-slate-400 italic py-2">No KPIs mapped to this {viewMode.toLowerCase()}.</div>
                      ) : (
                         <div className="space-y-3">
                            {item.kpis.map(kpi => (
                               <div key={kpi.id} className="flex justify-between items-start p-2 rounded border border-slate-100 bg-slate-50">
                                  <div>
                                     <div className="text-sm font-medium text-slate-900">{kpi.name}</div>
                                     <div className="text-xs text-slate-500">{kpi.type}</div>
                                  </div>
                                  <div className="text-right">
                                     <div className="text-xs font-bold text-indigo-600">{kpi.weight}% Wgt</div>
                                     {kpi.isMandatory && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded mt-1 inline-block">Mandatory</span>}
                                  </div>
                               </div>
                            ))}
                         </div>
                      )}
                   </div>

                   {/* Right: Inheriting Employees */}
                   <div className="p-6 bg-slate-50/30">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center">
                         <Users className="w-4 h-4 mr-2" /> Inheriting Employees
                      </h4>
                      {item.employees.length === 0 ? (
                         <div className="text-sm text-slate-400 italic py-2">No active employees in this {viewMode.toLowerCase()}.</div>
                      ) : (
                         <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {item.employees.map(emp => (
                               <span key={emp.id} className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-sm">
                                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                  {emp.firstName} {emp.lastName}
                               </span>
                            ))}
                         </div>
                      )}
                   </div>
                </div>
             </div>
          ))}
          
          {previewData.length === 0 && (
             <div className="text-center py-12 text-slate-500">
                No matching records found.
             </div>
          )}
       </div>
    </div>
  );
};
