
import { 
  UserRole, 
  ExpenseClaim,
  ExpenseAdvance,
  ResignationRequest,
  ExitClearanceItem,
  FnFSettlement
} from './types';
import { 
  LayoutDashboard, Users, Briefcase, UserPlus, 
  Calendar, Clock, TrendingUp, DollarSign, 
  FileText, Settings, Award, LogOut
} from 'lucide-react';

export const SUPER_ADMIN_MENU = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { id: 'companies', label: 'Companies', path: '/platform/companies', icon: Briefcase },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
];

export const COMPANY_ADMIN_MENU = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { id: 'org', label: 'Org Setup', path: '/org-setup', icon: Settings },
  { id: 'employees', label: 'Employees', path: '/core-hr', icon: Users },
  { id: 'recruitment', label: 'Recruitment', path: '/recruitment', icon: UserPlus },
  { id: 'onboarding', label: 'Onboarding', path: '/onboarding', icon: UserPlus },
  { id: 'attendance', label: 'Attendance', path: '/attendance', icon: Clock },
  { id: 'leave', label: 'Leave', path: '/leave', icon: Calendar },
  { id: 'performance', label: 'Performance', path: '/performance', icon: Award },
  { id: 'payroll', label: 'Payroll', path: '/payroll', icon: DollarSign },
  { id: 'expenses', label: 'Expenses', path: '/expenses', icon: TrendingUp },
  { id: 'exit', label: 'Exit', path: '/exit', icon: LogOut },
];

export const MANAGER_MENU = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { id: 'my-team', label: 'My Team', path: '/my-team', icon: Users },
  { id: 'recruitment', label: 'Hiring', path: '/recruitment', icon: UserPlus },
  { id: 'attendance', label: 'Attendance', path: '/attendance', icon: Clock },
  { id: 'leave', label: 'Leave', path: '/leave', icon: Calendar },
  { id: 'performance', label: 'Performance', path: '/performance', icon: Award },
  { id: 'expenses', label: 'Expenses', path: '/expenses', icon: TrendingUp },
  { id: 'exit', label: 'Team Resignations', path: '/exit', icon: LogOut },
];

export const EMPLOYEE_MENU = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { id: 'profile', label: 'My Profile', path: '/my-profile', icon: Users },
  { id: 'attendance', label: 'Attendance', path: '/attendance', icon: Clock },
  { id: 'leave', label: 'Leave', path: '/leave', icon: Calendar },
  { id: 'goals', label: 'My Goals', path: '/my-goals', icon: Award },
  { id: 'letters', label: 'My Letters', path: '/my-letters', icon: FileText },
  { id: 'payroll', label: 'Payroll', path: '/payroll', icon: DollarSign },
  { id: 'expenses', label: 'Expenses', path: '/expenses', icon: TrendingUp },
  { id: 'exit', label: 'Resignation', path: '/exit', icon: LogOut },
];

export const ORG_STRUCTURE_TABS = [
  { id: 'branches', label: 'Branches' },
  { id: 'departments', label: 'Departments' },
  { id: 'designations', label: 'Designations' },
  { id: 'grades', label: 'Grades' },
  { id: 'cost-centers', label: 'Cost Centers' },
];

export const MOCK_EXPENSE_CLAIMS: ExpenseClaim[] = [
  {
    id: 'claim-001', companyId: 'tenant-001', employeeId: 'emp-003', claimDate: '2023-10-15', totalAmount: 1200, status: 'Draft',
    createdAt: new Date().toISOString(), createdBy: 'Priya Sharma',
    lines: [
      { id: 'cline-1', claimId: 'claim-001', date: '2023-10-14', categoryId: 'ec-002', amount: 400, description: 'Lunch with Client' },
      { id: 'cline-2', claimId: 'claim-001', date: '2023-10-14', categoryId: 'ec-003', amount: 800, description: 'Uber to Airport' }
    ]
  },
  {
    id: 'claim-002', companyId: 'tenant-001', employeeId: 'emp-002', claimDate: '2023-10-20', totalAmount: 3500, status: 'Submitted',
    createdAt: new Date().toISOString(), createdBy: 'Amit Verma', submittedOn: new Date().toISOString(),
    lines: [
      { id: 'cline-3', claimId: 'claim-002', date: '2023-10-19', categoryId: 'ec-001', amount: 3500, description: 'Flight Tickets - Delhi' }
    ]
  }
];

export const MOCK_EXPENSE_ADVANCES: ExpenseAdvance[] = [
  {
    id: 'adv-001', companyId: 'tenant-001', employeeId: 'emp-003', amount: 5000, reason: 'Travel Advance for Mumbai Trip',
    status: 'HR Approved', requestedOn: '2023-10-01', createdAt: new Date().toISOString(), createdBy: 'Priya Sharma',
    approvedOn: '2023-10-02', approvedBy: 'Admin'
  }
];

export const MOCK_RESIGNATIONS: ResignationRequest[] = [];

export const MOCK_EXIT_CLEARANCE_ITEMS: ExitClearanceItem[] = [
  { id: 'cl-1', companyId: 'tenant-001', departmentId: 'dept-004', itemName: 'Laptop & Accessories', isActive: true, createdAt: '', createdBy: '' }, // IT
  { id: 'cl-2', companyId: 'tenant-001', departmentId: 'dept-004', itemName: 'Email Deactivation', isActive: true, createdAt: '', createdBy: '' },
  { id: 'cl-3', companyId: 'tenant-001', departmentId: 'dept-001', itemName: 'ID Card', isActive: true, createdAt: '', createdBy: '' }, // HR/Admin
  { id: 'cl-4', companyId: 'tenant-001', departmentId: 'dept-002', itemName: 'Pending Expenses Settlement', isActive: true, createdAt: '', createdBy: '' }, // Finance
];

export const MOCK_FNF_SETTLEMENTS: FnFSettlement[] = [];