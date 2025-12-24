import React, { useState } from "react";
import { useApp } from "../../../context/AppContext";
import { Department } from "../../../types";
import { Plus, Trash2, Edit2, Loader2, GitBranch } from "lucide-react";

export const Departments: React.FC = () => {
  const {
    currentTenant,
    departments,
    addDepartment,
    updateDepartment,
    deleteDepartment,
  } = useApp();

  const targetId = currentTenant?.tenantId || currentTenant?.id;

  const belongsToTenant = (item: any) => {
    if (!targetId) return false;
    return item.tenantId === targetId || item.companyId === targetId;
  };
  // Use context data directly
  const myDepts = (departments || []).filter(belongsToTenant);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Department | null>(null);
  const [formData, setFormData] = useState<Partial<Department>>({});
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (item?: Department) => {
    setEditingItem(item || null);
    setFormData(item || { name: "", code: "", parentId: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1. Map Frontend fields to Backend Schema
    // Backend expects 'parentDepartmentId', Frontend uses 'parentId'
    const payload = {
      ...formData,
      parentDepartmentId: formData.parentId, // Mapping for Backend
    } as any; // Using any to bypass strict type check for the mapping

    try {
      if (editingItem && editingItem.id) {
        await updateDepartment({ ...editingItem, ...payload });
      } else {
        await addDepartment(payload);
      }
      setIsModalOpen(false);
      // alert("Department Saved!"); // Optional success message
    } catch (error: any) {
      console.error("Save Error:", error);
      const msg = error.response?.data?.message || "Failed to save department.";
      alert(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await deleteDepartment(id);
      } catch (error) {
        alert("Failed to delete. Please try again.");
      }
    }
  };

  // Helper to find parent name
  const getParentName = (parentId?: string) => {
    if (!parentId) return "-";
    // Check against both id and mapped backend field if needed
    const parent = myDepts.find((d) => d.id === parentId);
    return parent ? parent.name : "-";
  };

  return (
    <div className="bg-white shadow rounded-lg border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900">Departments</h3>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Department
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Department Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Parent Dept
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {myDepts.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  No departments found. Add your first one!
                </td>
              </tr>
            ) : (
              myDepts.map((dept, index) => (
                <tr key={dept.id || index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    <div className="flex items-center">
                      <GitBranch className="w-4 h-4 text-slate-400 mr-2" />
                      {dept.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                    {dept.code}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {/* Handle mapping: API might return parentDepartmentId, frontend expects parentId */}
                    {getParentName(
                      (dept as any).parentDepartmentId || dept.parentId
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => handleOpenModal(dept)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">
              {editingItem ? "Edit Department" : "Add Department"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Department Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g. Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Code
                </label>
                <input
                  required
                  type="text"
                  value={formData.code || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g. ENG"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Parent Department
                </label>
                <select
                  value={
                    formData.parentId ||
                    (formData as any).parentDepartmentId ||
                    ""
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, parentId: e.target.value })
                  }
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">None (Top Level)</option>
                  {myDepts
                    .filter((d) => d.id !== editingItem?.id) // Prevent selecting self as parent
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-70 flex items-center"
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  ) : null}
                  {loading ? "Saving..." : "Save Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
