
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Bell, Search, HelpCircle, LogOut, ChevronDown, Building, Shield, User, Briefcase
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPER_ADMIN_MENU, COMPANY_ADMIN_MENU, MANAGER_MENU, EMPLOYEE_MENU } from '../constants';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

interface SearchResult {
  id: string;
  type: 'Employee' | 'Job' | 'Candidate';
  title: string;
  subtitle: string;
  path: string;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, currentTenant, companies, switchTenant, switchUserRole, employees, jobRequisitions, candidates } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  let menuItems = COMPANY_ADMIN_MENU;
  if (currentUser.role === UserRole.SUPER_ADMIN) menuItems = SUPER_ADMIN_MENU;
  if (currentUser.role === UserRole.MANAGER) menuItems = MANAGER_MENU;
  if (currentUser.role === UserRole.EMPLOYEE) menuItems = EMPLOYEE_MENU;

  const activeMenu = menuItems.find(item => location.pathname === item.path || location.pathname.startsWith(item.path + '/'));

  // Search Logic
  useEffect(() => {
    if (!searchQuery.trim() || !currentTenant) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // 1. Search Employees
    employees.forEach(emp => {
      if (emp.companyId === currentTenant.id && 
         (emp.firstName.toLowerCase().includes(query) || 
          emp.lastName.toLowerCase().includes(query) || 
          emp.employeeCode.toLowerCase().includes(query))) {
        results.push({
          id: emp.id,
          type: 'Employee',
          title: `${emp.firstName} ${emp.lastName}`,
          subtitle: `${emp.employeeCode} • ${emp.officialEmail}`,
          path: `/core-hr/employee/${emp.id}`
        });
      }
    });

    // 2. Search Job Requisitions
    jobRequisitions.forEach(job => {
      if (job.companyId === currentTenant.id && 
         (job.title.toLowerCase().includes(query) || 
          job.requisitionCode.toLowerCase().includes(query))) {
        results.push({
          id: job.id,
          type: 'Job',
          title: job.title,
          subtitle: `${job.requisitionCode} • ${job.status}`,
          path: `/recruitment/requisitions/${job.id}`
        });
      }
    });

    // 3. Search Candidates
    candidates.forEach(cand => {
      if (cand.companyId === currentTenant.id && 
         (cand.firstName.toLowerCase().includes(query) || 
          cand.lastName.toLowerCase().includes(query) ||
          cand.email.toLowerCase().includes(query))) {
        results.push({
          id: cand.id,
          type: 'Candidate',
          title: `${cand.firstName} ${cand.lastName}`,
          subtitle: `${cand.email} • ${cand.stage}`,
          path: `/recruitment/candidates/${cand.id}`
        });
      }
    });

    setSearchResults(results.slice(0, 8)); // Limit to 8 results
    setShowResults(true);
  }, [searchQuery, employees, jobRequisitions, candidates, currentTenant]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900 bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out transform 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:static lg:inset-0 flex flex-col
        `}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center font-bold text-lg">
              B
            </div>
            <span className="text-xl font-bold tracking-tight">BharatForce</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tenant Info */}
        <div className="px-6 py-4 border-b border-slate-800">
          {currentUser.role === UserRole.SUPER_ADMIN ? (
             <div className="space-y-2">
               <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">Platform Admin</div>
               <div className="flex items-center space-x-2 text-indigo-300">
                 <Shield className="w-4 h-4" />
                 <span className="text-sm font-medium">Super Access</span>
               </div>
             </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: currentTenant?.primaryColor || '#3A5BA0' }}
              >
                {currentTenant?.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-medium text-slate-200 truncate">{currentTenant?.name}</div>
                <div className="text-xs text-slate-500 truncate">Tenant ID: {currentTenant?.id}</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group
                ${isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'}
              `}
            >
              <item.icon className={`w-5 h-5 mr-3 flex-shrink-0 ${location.pathname.startsWith(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Profile (Bottom Sidebar) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 relative">
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
          >
            <img 
              src={`https://ui-avatars.com/api/?name=${currentUser.name}&background=random`} 
              alt="User" 
              className="w-9 h-9 rounded-full border border-slate-600"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>

          {/* Demo Role Switcher */}
          {userMenuOpen && (
            <div className="absolute bottom-16 left-4 right-4 bg-white rounded-lg shadow-lg py-1 text-slate-900 text-sm z-50">
              <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase border-b">Switch Role (Demo)</div>
              <button 
                onClick={() => { switchUserRole(UserRole.COMPANY_ADMIN); setUserMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-slate-100"
              >
                Company Admin (HR)
              </button>
              <button 
                onClick={() => { switchUserRole(UserRole.MANAGER); setUserMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-slate-100"
              >
                Manager (Rohan)
              </button>
              <button 
                onClick={() => { switchUserRole(UserRole.EMPLOYEE); setUserMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-slate-100"
              >
                Employee (Priya)
              </button>
              <button 
                onClick={() => { switchUserRole(UserRole.SUPER_ADMIN); setUserMenuOpen(false); }}
                className="block w-full text-left px-4 py-2 hover:bg-slate-100 border-t"
              >
                Super Admin
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-slate-400 hover:text-slate-500 focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            {/* Breadcrumb / Context Title */}
            <div className="hidden md:flex ml-4 items-center">
               <span className="font-semibold text-slate-800 text-lg">{activeMenu?.label || 'Dashboard'}</span>
               {currentUser.role === UserRole.SUPER_ADMIN && currentTenant && (
                 <span className="ml-4 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100 flex items-center">
                    <Building className="w-3 h-3 mr-1" />
                    Viewing: {currentTenant.name}
                 </span>
               )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* Tenant Switcher for Super Admin */}
            {currentUser.role === UserRole.SUPER_ADMIN && (
              <div className="hidden md:block">
                <select 
                  value={currentTenant?.id || ''} 
                  onChange={(e) => switchTenant(e.target.value)}
                  className="block w-48 pl-3 pr-10 py-1.5 text-sm border-slate-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Global Search with Dropdown */}
            <div className="hidden md:block relative" ref={searchRef}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search Employees, Jobs..."
                  className="block w-64 pl-10 pr-3 py-1.5 border border-slate-300 rounded-md leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowResults(true)}
                />
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchQuery && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50 max-h-96 overflow-y-auto">
                  {searchResults.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-500 text-center">No results found.</div>
                  ) : (
                    searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result.path)}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-start border-b border-slate-50 last:border-0"
                      >
                        <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 
                          ${result.type === 'Employee' ? 'bg-green-100 text-green-600' : 
                            result.type === 'Job' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                          {result.type === 'Employee' && <User className="w-4 h-4" />}
                          {result.type === 'Job' && <Briefcase className="w-4 h-4" />}
                          {result.type === 'Candidate' && <User className="w-4 h-4" />}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-slate-900">{result.title}</p>
                          <p className="text-xs text-slate-500 truncate w-56">{result.subtitle}</p>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{result.type}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <button className="p-1 rounded-full text-slate-400 hover:text-slate-500 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
};
