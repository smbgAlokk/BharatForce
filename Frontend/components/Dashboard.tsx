import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Users,
  UserPlus,
  Clock,
  TrendingUp,
  AlertCircle,
  Calendar,
  FileText,
  Briefcase,
  BadgeIndianRupee,
  CheckCircle,
  PlayCircle,
  StopCircle,
  ChevronRight,
  Bell,
  Search,
  Building,
  Activity,
  Server,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";

const COLORS = [
  "#3A5BA0",
  "#D68B28",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

export const Dashboard: React.FC = () => {
  const { currentUser, userRole } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live Clock Effect
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Safety Check
  if (!currentUser) return <div>Loading User...</div>;

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Global Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {currentUser.name.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {currentTime.toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-700">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">
              {currentUser.role.replace("_", " ")} View
            </div>
          </div>
        </div>
      </div>

      {/* ROLE BASED RENDERING SWITCH */}
      {userRole === UserRole.SUPER_ADMIN && <SuperAdminDashboard />}
      {userRole === UserRole.COMPANY_ADMIN && <AdminDashboard />}
      {userRole === UserRole.MANAGER && <ManagerDashboard />}
      {userRole === UserRole.EMPLOYEE && <EmployeeDashboard />}
    </div>
  );
};

// --- 1. SUPER ADMIN VIEW ---
const SuperAdminDashboard = () => {
  const { companies } = useApp();

  // Mock Platform Data
  const tenantGrowthData = [
    { name: "Jan", active: 10, new: 2 },
    { name: "Feb", active: 12, new: 3 },
    { name: "Mar", active: 15, new: 4 },
    { name: "Apr", active: 18, new: 3 },
    { name: "May", active: 22, new: 5 },
    { name: "Jun", active: 28, new: 6 },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={Building}
          label="Total Tenants"
          value={companies.length.toString()}
          sub="+1 this week"
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value="1,248"
          sub="+12% growth"
          color="text-emerald-600"
          bg="bg-emerald-50"
        />
        <StatCard
          icon={Activity}
          label="System Uptime"
          value="99.98%"
          sub="Last 30 days"
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={BadgeIndianRupee}
          label="Platform ARR"
          value="₹ 24.5L"
          sub="+8% vs last month"
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Tenant Growth Trend
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tenantGrowthData}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3A5BA0" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3A5BA0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />
                <RechartsTooltip />
                <Area
                  type="monotone"
                  dataKey="active"
                  stroke="#3A5BA0"
                  fillOpacity={1}
                  fill="url(#colorActive)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            System Health
          </h3>
          <div className="space-y-4">
            <HealthItem
              label="Database Cluster"
              status="Operational"
              latency="24ms"
            />
            <HealthItem
              label="API Gateway"
              status="Operational"
              latency="45ms"
            />
            <HealthItem
              label="Storage (S3)"
              status="Operational"
              latency="120ms"
            />
            <HealthItem
              label="Email Service"
              status="Operational"
              latency="80ms"
            />
            <HealthItem
              label="Background Jobs"
              status="Degraded"
              latency="400ms"
              color="yellow"
            />
          </div>
        </div>
      </div>

      {/* Recent Tenants */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800">Recent Signups</h3>
        </div>
        <table className="min-w-full text-sm text-left">
          <thead className="text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="px-6 py-3">Company Name</th>
              <th className="px-6 py-3">Admin Email</th>
              <th className="px-6 py-3">Plan</th>
              <th className="px-6 py-3">Joined</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.slice(0, 5).map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-6 py-3 font-medium text-slate-900">
                  {c.name}
                </td>
                <td className="px-6 py-3 text-slate-500">{c.email}</td>
                <td className="px-6 py-3">
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                    Enterprise
                  </span>
                </td>
                <td className="px-6 py-3 text-slate-500">
                  {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                </td>
                <td className="px-6 py-3">
                  <span className="text-green-600 flex items-center text-xs font-bold">
                    <CheckCircle className="w-3 h-3 mr-1" /> Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- 2. COMPANY ADMIN VIEW ---
const AdminDashboard = () => {
  const { employees, departments, jobRequisitions } = useApp();

  // Data Preparation
  const deptData = departments
    .map((d) => ({
      name: d.name,
      value: employees.filter((e) => e.departmentId === d.id).length,
    }))
    .filter((d) => d.value > 0);

  const openReqs = jobRequisitions.filter(
    (j) => j.status === "Approved" || j.status === "Submitted"
  ).length;
  const totalEmp = employees.length;

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          label="Total Workforce"
          value={totalEmp.toString()}
          sub="+2 this month"
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <StatCard
          icon={UserPlus}
          label="On Leave Today"
          value="4"
          sub="2 Sick, 2 PL"
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <StatCard
          icon={Briefcase}
          label="Open Requisitions"
          value={openReqs.toString()}
          sub="Hiring Active"
          color="text-blue-600"
          bg="bg-blue-50"
        />
        <StatCard
          icon={AlertCircle}
          label="Attendance Issues"
          value="7"
          sub="Late/Exceptions"
          color="text-red-600"
          bg="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dept Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Headcount by Department
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionBtn icon={UserPlus} label="Add Employee" color="blue" />
            <QuickActionBtn
              icon={FileText}
              label="Run Reports"
              color="purple"
            />
            <QuickActionBtn
              icon={Calendar}
              label="Approve Leaves"
              color="amber"
            />
            <QuickActionBtn icon={Briefcase} label="Post Job" color="green" />
          </div>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <h4 className="text-sm font-bold text-slate-700 mb-2">
              Pending Tasks
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center justify-between text-sm p-2 hover:bg-slate-50 rounded cursor-pointer">
                <span className="text-slate-600">
                  Regularize 5 attendance records
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 3. MANAGER VIEW ---
const ManagerDashboard = () => {
  const { currentUser, employees, leaveRequests } = useApp();

  const myTeam = employees.filter(
    (e) => e.reportingManagerId === currentUser?.employeeId
  );
  const pendingLeaves = leaveRequests.filter(
    (r) =>
      myTeam.some((e) => e.id === r.employeeId) &&
      r.status === "Pending Manager Approval"
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Users}
          label="My Team"
          value={myTeam.length.toString()}
          sub="Direct Reports"
          color="text-indigo-600"
          bg="bg-indigo-50"
        />
        <StatCard
          icon={UserPlus}
          label="Present Today"
          value={myTeam.length.toString()}
          sub="On Time"
          color="text-green-600"
          bg="bg-green-50"
        />
        <StatCard
          icon={Clock}
          label="Pending Approvals"
          value={pendingLeaves.length.toString()}
          sub="Leaves"
          color="text-amber-600"
          bg="bg-amber-50"
        />
      </div>
      {/* ... Rest of Manager view same as original ... */}
      <div className="bg-white p-6 rounded-xl shadow-sm text-center text-slate-500">
        Manager Dashboard Content Loaded
      </div>
    </div>
  );
};

// --- 4. EMPLOYEE VIEW ---
const EmployeeDashboard = () => {
  const { currentUser, addPunch } = useApp();
  const [clockedIn, setClockedIn] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: number;
    if (clockedIn) {
      interval = window.setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [clockedIn]);

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const toggleClock = () => {
    if (!currentUser?.employeeId) return;
    const type = clockedIn ? "OUT" : "IN";
    addPunch(currentUser.employeeId, type, "Web");
    setClockedIn(!clockedIn);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl shadow-lg text-white p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
          <div>
            <h3 className="text-lg font-medium opacity-90">Attendance</h3>
            <p className="text-sm opacity-75 mt-1">
              {clockedIn
                ? "You are currently working"
                : "You are not clocked in"}
            </p>
          </div>

          <div className="flex flex-col items-center my-6">
            <div className="text-5xl font-mono font-bold tracking-wider mb-2">
              {clockedIn ? formatTimer(timer) : "--:--:--"}
            </div>
          </div>

          <button
            onClick={toggleClock}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center transition-all shadow-md
                     ${
                       clockedIn
                         ? "bg-red-500 hover:bg-red-600 text-white"
                         : "bg-white text-indigo-700 hover:bg-indigo-50"
                     }`}
          >
            {clockedIn ? (
              <>
                <StopCircle className="w-5 h-5 mr-2" /> Clock Out
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5 mr-2" /> Clock In
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---
const StatCard = ({ icon: Icon, label, value, sub, color, bg }: any) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
        <span className="text-xs font-medium text-slate-400 mt-1 block">
          {sub}
        </span>
      </div>
      <div className={`p-3 rounded-lg ${bg}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
  </div>
);

const HealthItem = ({ label, status, latency, color = "green" }: any) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
    <div className="flex items-center gap-3">
      <div
        className={`w-2 h-2 rounded-full ${
          color === "green" ? "bg-green-500" : "bg-yellow-500"
        }`}
      ></div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </div>
    <div className="text-right">
      <div
        className={`text-xs font-bold ${
          color === "green" ? "text-green-600" : "text-yellow-600"
        }`}
      >
        {status}
      </div>
      <div className="text-[10px] text-slate-400">{latency}</div>
    </div>
  </div>
);

const QuickActionBtn = ({ icon: Icon, label, color }: any) => {
  const colorClasses: any = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    amber: "bg-amber-50 text-amber-600 hover:bg-amber-100",
    green: "bg-green-50 text-green-600 hover:bg-green-100",
  };
  return (
    <button
      className={`flex flex-col items-center justify-center p-4 rounded-lg transition-colors ${colorClasses[color]}`}
    >
      <Icon className="w-6 h-6 mb-2" />
      <span className="text-xs font-medium text-center">{label}</span>
    </button>
  );
};
