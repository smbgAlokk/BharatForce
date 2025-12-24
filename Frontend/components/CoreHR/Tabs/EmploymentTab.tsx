import React, { useState, useEffect } from "react";
import { useApp } from "../../../context/AppContext";
import { Employee } from "../../../types";
import { Save, X, Edit2 } from "lucide-react";

interface Props {
  employee: Employee;
  isReadOnly: boolean;
  onSave: (data: Partial<Employee>) => void;
}

export const EmploymentTab: React.FC<Props> = ({
  employee,
  isReadOnly,
  onSave,
}) => {
  // 1. Get all Master Data from Context
  const {
    departments,
    branches,
    designations,
    grades,
    costCenters,
    employees,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Employee>(employee);

  useEffect(() => {
    setFormData(employee);
  }, [employee]);

  // ✅ HELPER: Date Formatter
  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    return String(isoString).split("T")[0];
  };

  // ✅ FIX: Robust Dropdown Filtering
  // We filter lists based on the *Employee's* Company ID to ensure context is correct
  const targetId = employee.companyId;

  const filterByTenant = (item: any) => {
    return item.companyId === targetId || item.tenantId === targetId;
  };

  const myDepts = departments.filter(filterByTenant);
  const myBranches = branches.filter(filterByTenant);
  const myDesigs = designations.filter(filterByTenant);
  const myGrades = grades.filter(filterByTenant);
  const myCostCenters = costCenters.filter(filterByTenant);

  // Managers: Must be in same company, excluding self
  const potentialManagers = employees.filter(
    (e) =>
      (e.companyId === targetId || e.tenantId === targetId) &&
      e.id !== employee.id
  );

  const handleCancel = () => {
    setFormData(employee);
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsEditing(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProbationChange = (months: number) => {
    const joinDate = new Date(formData.joiningDate);
    if (!isNaN(joinDate.getTime())) {
      const endDate = new Date(joinDate.setMonth(joinDate.getMonth() + months));
      handleChange("probationEndDate", endDate.toISOString().split("T")[0]);
    }
    handleChange("probationPeriod", months);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-slate-900">
          Employment Details
        </h3>
        {!isReadOnly && (
          <div>
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                >
                  <X className="h-4 w-4 mr-1" /> Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Save className="h-4 w-4 mr-1" /> Save
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Edit2 className="h-4 w-4 mr-1" /> Edit
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Section */}
        <div className="md:col-span-3">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">
            Status & Timeline
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Date of Joining *
              </label>
              <input
                disabled={!isEditing}
                required
                type="date"
                value={formatDate(formData.joiningDate)}
                onChange={(e) => handleChange("joiningDate", e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Probation (Months)
              </label>
              <select
                disabled={!isEditing}
                value={formData.probationPeriod}
                onChange={(e) =>
                  handleProbationChange(parseInt(e.target.value))
                }
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              >
                <option value="0">0 Months</option>
                <option value="3">3 Months</option>
                <option value="6">6 Months</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Probation End Date
              </label>
              <input
                disabled={!isEditing}
                type="date"
                value={formatDate(formData.probationEndDate)}
                onChange={(e) =>
                  handleChange("probationEndDate", e.target.value)
                }
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Employment Type *
              </label>
              <select
                disabled={!isEditing}
                required
                value={formData.employmentType}
                onChange={(e) => handleChange("employmentType", e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              >
                <option value="Permanent">Permanent</option>
                <option value="Contract">Contract</option>
                <option value="Consultant">Consultant</option>
                <option value="Intern">Intern</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Status *
              </label>
              <select
                disabled={!isEditing}
                required
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              >
                <option value="Onboarding">Onboarding</option>
                <option value="Active">Active</option>
                <option value="Probation">On Probation</option>
                <option value="Notice Period">Notice Period</option>
                <option value="Separated">Separated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Confirmation Date
              </label>
              <input
                disabled={!isEditing}
                type="date"
                value={formatDate(formData.confirmationDate)}
                onChange={(e) =>
                  handleChange("confirmationDate", e.target.value)
                }
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Org Mapping */}
        <div className="md:col-span-3">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">
            Organization Mapping
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Designation *
              </label>
              <select
                disabled={!isEditing}
                required
                value={formData.designationId || ""}
                onChange={(e) => handleChange("designationId", e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              >
                <option value="">Select Designation</option>
                {myDesigs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Department *
              </label>
              <select
                disabled={!isEditing}
                required
                value={formData.departmentId || ""}
                onChange={(e) => handleChange("departmentId", e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              >
                <option value="">Select Department</option>
                {myDepts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Branch *
              </label>
              <select
                disabled={!isEditing}
                required
                value={formData.branchId || ""}
                onChange={(e) => handleChange("branchId", e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              >
                <option value="">Select Branch</option>
                {myBranches.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Grade / Band
              </label>
              <select
                disabled={!isEditing}
                value={formData.gradeId || ""}
                onChange={(e) => handleChange("gradeId", e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              >
                <option value="">Select Grade</option>
                {myGrades.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Cost Center
              </label>
              <select
                disabled={!isEditing}
                value={formData.costCenterId || ""}
                onChange={(e) => handleChange("costCenterId", e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              >
                <option value="">Select Cost Center</option>
                {myCostCenters.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Work Location
              </label>
              <select
                disabled={!isEditing}
                value={formData.workLocationType || "Onsite"}
                onChange={(e) =>
                  handleChange("workLocationType", e.target.value)
                }
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              >
                <option value="Onsite">Onsite</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reporting */}
        <div className="md:col-span-3">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">
            Reporting Lines
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Reporting Manager
              </label>
              <select
                disabled={!isEditing}
                value={formData.reportingManagerId || ""}
                onChange={(e) =>
                  handleChange("reportingManagerId", e.target.value)
                }
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              >
                <option value="">Select Manager</option>
                {potentialManagers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.firstName} {d.lastName} ({d.employeeCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Second Level Manager
              </label>
              <select
                disabled={!isEditing}
                value={formData.secondLevelManagerId || ""}
                onChange={(e) =>
                  handleChange("secondLevelManagerId", e.target.value)
                }
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              >
                <option value="">Select Manager</option>
                {potentialManagers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.firstName} {d.lastName} ({d.employeeCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
