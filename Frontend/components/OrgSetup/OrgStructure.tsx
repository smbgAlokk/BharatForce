
import React from 'react';
import { NavLink, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ORG_STRUCTURE_TABS } from '../../constants';
import { CompanyProfile } from './CompanyProfile';
import { MapPin, GitBranch, Users, Layers, PieChart } from 'lucide-react';

// Import CRUD Components (inline for now or separated)
import { Branches } from './Tabs/Branches';
import { Departments } from './Tabs/Departments';
import { Designations } from './Tabs/Designations';
import { Grades } from './Tabs/Grades';
import { CostCenters } from './Tabs/CostCenters';

export const OrgStructure: React.FC = () => {
  const location = useLocation();

  // Simple function to map icons
  const getIcon = (id: string) => {
    switch (id) {
      case 'branches': return MapPin;
      case 'departments': return GitBranch;
      case 'designations': return Users;
      case 'grades': return Layers;
      case 'cost-centers': return PieChart;
      default: return Layers;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Organisation Setup</h1>
        <p className="text-slate-500 mt-1">Define your company's structural hierarchy and entities.</p>
      </div>

      {/* Org Structure Layout: Left Sidebar / Right Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Secondary Navigation (Tabs) */}
        <div className="w-full lg:w-64 flex-shrink-0">
           <nav className="bg-white shadow rounded-lg overflow-hidden">
             <NavLink 
                to="/org-setup/profile"
                className={({ isActive }) => `
                  flex items-center px-4 py-3 text-sm font-medium border-b border-slate-100 transition-colors
                  ${isActive ? 'bg-indigo-50 text-indigo-700 border-l-4 border-l-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
             >
                Company Profile
             </NavLink>
             <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                Structure
             </div>
             {ORG_STRUCTURE_TABS.map(tab => {
               const Icon = getIcon(tab.id);
               return (
                <NavLink 
                  key={tab.id}
                  to={`/org-setup/${tab.id}`}
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 text-sm font-medium border-b border-slate-100 transition-colors
                    ${isActive ? 'bg-indigo-50 text-indigo-700 border-l-4 border-l-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                  `}
                >
                  <Icon className="w-4 h-4 mr-3 text-slate-400" />
                  {tab.label}
                </NavLink>
               );
             })}
           </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
           <Routes>
             <Route path="profile" element={<CompanyProfile />} />
             <Route path="branches" element={<Branches />} />
             <Route path="departments" element={<Departments />} />
             <Route path="designations" element={<Designations />} />
             <Route path="grades" element={<Grades />} />
             <Route path="cost-centers" element={<CostCenters />} />
             <Route path="*" element={<Navigate to="profile" replace />} />
           </Routes>
        </div>
      </div>
    </div>
  );
};
