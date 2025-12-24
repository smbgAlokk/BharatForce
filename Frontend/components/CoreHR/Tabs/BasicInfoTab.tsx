import React, { useState, useEffect } from "react";
import { Employee } from "../../../types";
import { Save, X, Edit2 } from "lucide-react";

interface Props {
  employee: Employee;
  isReadOnly: boolean;
  onSave: (data: Partial<Employee>) => void;
  isSelfService?: boolean;
  onRequestChange?: (
    category: string,
    fieldPath: string,
    label: string,
    currentValue: any
  ) => void;
}

export const BasicInfoTab: React.FC<Props> = ({
  employee,
  isReadOnly,
  onSave,
  isSelfService,
  onRequestChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Employee>(employee);

  useEffect(() => {
    setFormData(employee);
  }, [employee]);

  // ✅ HELPER: Formats "1989-06-14T00:00:00.000Z" -> "1989-06-14"
  const formatDate = (isoString?: string) => {
    if (!isoString) return "";
    return String(isoString).split("T")[0];
  };

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

  const renderRequestBtn = (
    field: string,
    label: string,
    val: any,
    category: string = "Contact Details"
  ) => {
    if (!isSelfService || !onRequestChange) return null;
    return (
      <button
        type="button"
        onClick={() => onRequestChange(category, field, label, val)}
        className="text-xs text-indigo-600 hover:text-indigo-800 underline ml-2"
      >
        Request Change
      </button>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-slate-900">
          Basic Information
        </h3>
        {!isReadOnly && !isSelfService && (
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

      <div className="grid grid-cols-1 gap-8">
        {/* IDENTIFICATION & CONTACT SECTIONS (No changes needed here) */}
        {/* ... (Keep your existing Identification and Contact sections exactly as they were) ... */}
        {/* For brevity, I'm skipping the repetitive text fields, insert them here */}

        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">
            Identification
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ... First Name, Last Name inputs ... */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                First Name
              </label>
              <input
                disabled={!isEditing}
                required
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Last Name
              </label>
              <input
                disabled={!isEditing}
                required
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Employee Code
              </label>
              <input
                disabled={true}
                type="text"
                value={formData.employeeCode}
                className="mt-1 block w-full border border-slate-300 bg-slate-100 text-slate-500 sm:text-sm p-2"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">
            Contact Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Official Email
              </label>
              <input
                disabled={!isEditing}
                required
                type="email"
                value={formData.officialEmail}
                onChange={(e) => handleChange("officialEmail", e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Mobile Number
              </label>
              <input
                disabled={!isEditing}
                required
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => handleChange("mobileNumber", e.target.value)}
                className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm sm:text-sm p-2 disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: PERSONAL (Fixing the Date Input) */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">
            Personal Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Date of Birth
              </label>
              <input
                disabled={!isEditing}
                type="date"
                // ✅ FIXED: Using formatDate helper
                value={formatDate(formData.dob)}
                onChange={(e) => handleChange("dob", e.target.value)}
                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm border p-2 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Gender
              </label>
              <select
                disabled={!isEditing}
                value={formData.gender || ""}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="mt-1 block w-full border-slate-300 rounded-md shadow-sm sm:text-sm border p-2 disabled:bg-slate-50"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {/* ... Marital Status, Blood Group ... */}
          </div>
        </div>
      </div>
    </form>
  );
};
