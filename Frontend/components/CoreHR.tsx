import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { UserRole } from "../types";
import {
  Search,
  Download,
  Plus,
  Mail,
  Phone,
  Eye,
  Edit,
  Import,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { AddEmployeeModal } from "./CoreHR/AddEmployeeModal";
import { employeeService } from "../services/api";

export const CoreHR: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentTenant,
    employees,
    departments,
    branches,
    designations,
    userRole,
    fetchEmployees,
  } = useApp();

  // Local State
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const canEdit = userRole === UserRole.COMPANY_ADMIN;

  // ✅ THE FIX: Universal Filter
  // This logic allows matching against either the MongoDB _id OR the logical tenantId
  const filteredEmployees = employees.filter((emp) => {
    // 1. Safety Check
    if (!currentTenant) return false;

    // 2. Normalize IDs to strings to avoid Type issues
    const empCompId = String(emp.companyId || "");
    const tenantMongoId = String(currentTenant.id || "");
    const tenantStringId = String(currentTenant.tenantId || "");

    // 3. The "OR" Check: Does the employee belong to this tenant via ANY ID?
    const belongsToTenant =
      empCompId === tenantMongoId || empCompId === tenantStringId;

    if (!belongsToTenant) return false;

    // 4. Standard Search & Dropdown Filters
    const matchesSearch =
      (emp.firstName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (emp.lastName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (emp.employeeCode?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (emp.officialEmail?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (emp.mobileNumber || "").includes(searchTerm);

    const matchesDept = deptFilter ? emp.departmentId === deptFilter : true;
    const matchesBranch = branchFilter ? emp.branchId === branchFilter : true;
    const matchesStatus = statusFilter ? emp.status === statusFilter : true;

    return matchesSearch && matchesDept && matchesBranch && matchesStatus;
  });

  // Helpers
  const getDeptName = (id: string | any) => {
    // Handle populated objects if backend sends them
    if (typeof id === "object" && id?.name) return id.name;
    return departments.find((d) => d.id === id)?.name || "-";
  };

  const getBranchName = (id: string | any) => {
    if (typeof id === "object" && id?.name) return id.name;
    return branches.find((b) => b.id === id)?.name || "-";
  };

  const getDesigName = (id: string | any) => {
    if (typeof id === "object" && id?.name) return id.name;
    return designations.find((d) => d.id === id)?.name || "-";
  };

  const handleRowClick = (id: string) => {
    navigate(`/core-hr/employee/${id}`);
  };

  const handleManualRefresh = async () => {
    if (fetchEmployees) {
      setIsRefreshing(true);
      await fetchEmployees();
      setIsRefreshing(false);
    } else {
      window.location.reload();
    }
  };

  const handleDelete = async (empId: string, empName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${empName}? This will remove their Login, Profile, and all Documents permanently.`
      )
    ) {
      try {
        await employeeService.delete(empId);
        // Optimistic UI Update: Remove from list immediately
        if (fetchEmployees) fetchEmployees();
        // Alternatively, filter local state if fetchEmployees isn't available:
        // setEmployees(prev => prev.filter(e => e.id !== empId));
      } catch (error: any) {
        console.error("Delete failed", error);
        alert(error.response?.data?.message || "Failed to delete employee.");
      }
    }
  };

  // ✅ Debugger Logic (Visible only in Console)
  useEffect(() => {
    if (employees.length > 0 && filteredEmployees.length === 0) {
      console.warn("⚠️ Data exists but is hidden by filters.");
      console.log("Current Tenant:", currentTenant);
      console.log("First Employee Data:", employees[0]);
    }
  }, [employees, filteredEmployees]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Employees
            <button
              onClick={handleManualRefresh}
              className={`p-1 rounded-full hover:bg-slate-100 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            >
              <RefreshCw className="w-4 h-4 text-slate-400" />
            </button>
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your workforce directory and profiles.
          </p>
        </div>
        <div className="flex space-x-2">
          {/* Action Buttons */}
          <button className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
            <Import className="h-4 w-4 mr-2" /> Import
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50">
            <Download className="h-4 w-4 mr-2" /> Export
          </button>
          {canEdit && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow border border-slate-200 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, ID, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="block pl-3 pr-8 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Departments</option>
            {departments
              .filter(
                (d) =>
                  !currentTenant ||
                  d.companyId === currentTenant.id ||
                  d.companyId === currentTenant.tenantId
              )
              .map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="block pl-3 pr-8 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Branches</option>
            {branches
              .filter(
                (b) =>
                  !currentTenant ||
                  b.companyId === currentTenant.id ||
                  b.companyId === currentTenant.tenantId
              )
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block pl-3 pr-8 py-2 text-base border-slate-300 focus:outline-none focus:ring-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Probation">Probation</option>
            <option value="Onboarding">Onboarding</option>
            <option value="Notice Period">Notice Period</option>
            <option value="Separated">Separated</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Role & Dept
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No employees found matching filters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => handleRowClick(emp.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full bg-slate-200 object-cover"
                            src={
                              emp.photoUrl ||
                              `https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=random`
                            }
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {emp.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 flex items-center">
                        <Mail className="w-3 h-3 mr-1 text-slate-400" />{" "}
                        {emp.officialEmail}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center mt-1">
                        <Phone className="w-3 h-3 mr-1 text-slate-400" />{" "}
                        {emp.mobileNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {getDesigName(emp.designationId)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {getDeptName(emp.departmentId)} •{" "}
                        {getBranchName(emp.branchId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {emp.employmentType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          emp.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : emp.status === "Probation"
                            ? "bg-blue-100 text-blue-800"
                            : emp.status === "Onboarding"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        {/* View Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(emp.id);
                          }}
                          className="text-slate-400 hover:text-indigo-600"
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {canEdit && (
                          <>
                            {/* Edit Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(emp.id);
                              }}
                              className="text-slate-400 hover:text-indigo-600"
                              title="Edit Profile"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            {/* ✅ DELETE BUTTON */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click
                                handleDelete(
                                  emp.id,
                                  `${emp.firstName} ${emp.lastName}`
                                );
                              }}
                              className="text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete Employee"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <AddEmployeeModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            if (fetchEmployees) fetchEmployees();
          }}
        />
      )}
    </div>
  );
};
