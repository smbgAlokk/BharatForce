import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { Employee, UserRole } from "../../types"; // Imported UserRole for consistency
import { ArrowLeft, ArrowRight, X, AlertTriangle, Loader2 } from "lucide-react";
import { employeeService } from "../../services/api";

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddEmployeeModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const {
    currentTenant,
    departments,
    branches,
    designations,
    costCenters,
    addEmployee,
    employees,
  } = useApp();

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Initial State
  const [formData, setFormData] = useState<Partial<Employee>>({
    companyId: currentTenant?.id,
    status: "Onboarding",
    employmentType: "Permanent",
    probationPeriod: 6,
    role: "EMPLOYEE", // ✅ Default Role
  } as any);

  // Filtering Logic
  const targetId = currentTenant?.tenantId || currentTenant?.id;

  const myDepts = departments.filter(
    (d) => d.companyId === targetId || d.tenantId === targetId
  );
  const myBranches = branches.filter(
    (b) => b.companyId === targetId || b.tenantId === targetId
  );
  const myDesigs = designations.filter(
    (d) => d.companyId === targetId || d.tenantId === targetId
  );
  const myCostCenters = costCenters.filter(
    (c) => c.companyId === targetId || c.tenantId === targetId
  );

  // Managers are existing employees
  const potentialManagers = employees.filter(
    (e) => e.companyId === targetId || e.tenantId === targetId
  );

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const validateStep1 = () => {
    const newErrors = [];
    if (!formData.firstName) newErrors.push("First Name is required");
    if (!formData.lastName) newErrors.push("Last Name is required");
    if (!formData.employeeCode) newErrors.push("Employee Code is required");
    if (!formData.officialEmail) newErrors.push("Official Email is required");
    if (!formData.mobileNumber) newErrors.push("Mobile Number is required");

    const exists = employees.some(
      (e) =>
        e.employeeCode === formData.employeeCode &&
        (e.companyId === targetId || e.tenantId === targetId)
    );
    if (exists) {
      newErrors.push("Employee Code already exists in this company.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const validateStep2 = () => {
    const newErrors = [];
    if (!formData.joiningDate) newErrors.push("Date of Joining is required");
    if (!formData.designationId) newErrors.push("Designation is required");
    if (!formData.departmentId) newErrors.push("Department is required");
    if (!formData.branchId) newErrors.push("Branch is required");
    // Role is optional in validation as it has a default, but good to check if needed
    if (!formData.role) newErrors.push("Employee Role is required");

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSave = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    setErrors([]);

    try {
      const payload = {
        ...formData,
        companyId: currentTenant?.id,
        tenantId: currentTenant?.tenantId || currentTenant?.id,
      };

      console.log("📤 Sending Employee Data:", payload);

      const response = await employeeService.create(payload);

      if (response.success && response.data) {
        const newEmp = {
          ...response.data,
          id: response.data._id || response.data.id,
        };

        addEmployee(newEmp);
        alert(`Employee ${newEmp.firstName} added successfully!`);

        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }
    } catch (error: any) {
      console.error("❌ Failed to add employee:", error);
      const msg = error.response?.data?.message || "Failed to save employee.";
      setErrors([msg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div
            className="absolute inset-0 bg-slate-900 opacity-75"
            onClick={loading ? undefined : onClose}
          ></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-slate-900">
                Add New Employee
              </h3>
              <button
                onClick={onClose}
                disabled={loading}
                className="text-slate-400 hover:text-slate-500 disabled:opacity-50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {/* Stepper */}
            <div className="mt-4 flex items-center">
              <div
                className={`flex-1 h-2 rounded-full ${
                  step === 1 ? "bg-indigo-600" : "bg-green-500"
                }`}
              ></div>
              <div className="w-1"></div>
              <div
                className={`flex-1 h-2 rounded-full ${
                  step === 2 ? "bg-indigo-600" : "bg-slate-200"
                }`}
              ></div>
            </div>
          </div>

          {/* Error Display */}
          {errors.length > 0 && (
            <div className="bg-red-50 p-4 m-6 mb-0 rounded-md flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
              <div className="text-sm text-red-700">
                <ul className="list-disc pl-4 space-y-1">
                  {errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      First Name *
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                      value={formData.firstName || ""}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                      value={formData.lastName || ""}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Employee Code *
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                    value={formData.employeeCode || ""}
                    onChange={(e) =>
                      handleChange("employeeCode", e.target.value.toUpperCase())
                    }
                    placeholder="e.g. EMP001"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                      value={formData.officialEmail || ""}
                      onChange={(e) =>
                        handleChange("officialEmail", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                      value={formData.mobileNumber || ""}
                      onChange={(e) =>
                        handleChange("mobileNumber", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Gender
                  </label>
                  <select
                    className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                    value={formData.gender || ""}
                    onChange={(e) => handleChange("gender", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Date of Joining *
                    </label>
                    <input
                      type="date"
                      className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                      value={
                        formData.joiningDate
                          ? new Date(formData.joiningDate)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleChange("joiningDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Status
                    </label>
                    <select
                      className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                      value={formData.status || "Active"}
                      onChange={(e) => handleChange("status", e.target.value)}
                    >
                      <option value="Onboarding">Onboarding</option>
                      <option value="Active">Active</option>
                      <option value="Probation">Probation</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Designation *
                    </label>
                    <select
                      className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                      value={formData.designationId || ""}
                      onChange={(e) =>
                        handleChange("designationId", e.target.value)
                      }
                    >
                      <option value="">Select</option>
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
                      className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                      value={formData.departmentId || ""}
                      onChange={(e) =>
                        handleChange("departmentId", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {myDepts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Branch *
                    </label>
                    <select
                      className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                      value={formData.branchId || ""}
                      onChange={(e) => handleChange("branchId", e.target.value)}
                    >
                      <option value="">Select</option>
                      {myBranches.map((d) => (
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
                      className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                      value={formData.costCenterId || ""}
                      onChange={(e) =>
                        handleChange("costCenterId", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {myCostCenters.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Reporting Manager
                    </label>
                    <select
                      className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm"
                      value={formData.reportingManagerId || ""}
                      onChange={(e) =>
                        handleChange("reportingManagerId", e.target.value)
                      }
                    >
                      <option value="">Select Manager</option>
                      {potentialManagers.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.firstName} {e.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Employee Role *
                    </label>
                    <select
                      className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm font-semibold text-indigo-700"
                      value={formData.role || "EMPLOYEE"}
                      onChange={(e) => handleChange("role", e.target.value)}
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                      <option value="COMPANY_ADMIN">Company Admin (HR)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {step === 2 ? (
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  "Finish & Create"
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Next <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            )}
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                <ArrowLeft className="mr-2 w-4 h-4" /> Back
              </button>
            )}
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
