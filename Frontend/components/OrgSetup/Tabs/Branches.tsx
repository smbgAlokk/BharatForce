import React, { useState } from "react";
import { useApp } from "../../../context/AppContext";
import { Branch } from "../../../types";
import { Plus, Trash2, Edit2, MapPin, Building } from "lucide-react";

export const Branches: React.FC = () => {
  const { currentTenant, branches, addBranch, updateBranch, deleteBranch } =
    useApp();

  // ✅ FIX: Strict Filtering Logic
  // Matches either the String Tenant ID or the MongoDB Object ID
  const targetId = currentTenant?.tenantId || currentTenant?.id;

  const belongsToTenant = (item: any) => {
    if (!targetId) return false;
    return item.tenantId === targetId || item.companyId === targetId;
  };

  // Filter the list safely
  const myBranches = (branches || []).filter(belongsToTenant);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<Partial<Branch>>({});
  const [loading, setLoading] = useState(false); // Added Loading

  const handleOpenModal = (item?: Branch) => {
    setEditingItem(item || null);
    setFormData(
      item || {
        name: "",
        code: "",
        city: "",
        state: "",
        country: "India",
        isHeadOffice: false,
        addressLine1: "",
        contactNumber: "",
      }
    );
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      isHeadOffice: Boolean(formData.isHeadOffice),
    } as Branch;

    try {
      if (editingItem && editingItem.id) {
        await updateBranch({ ...editingItem, ...payload });
      } else {
        await addBranch(payload);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Save Failed:", error);
      alert("Failed to save branch. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (window.confirm("Delete this branch?")) {
      await deleteBranch(id);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900">
          Branches / Locations
        </h3>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Branch
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Branch Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                City
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">
                Head Office
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {myBranches.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  No branches found.
                </td>
              </tr>
            ) : (
              myBranches.map((branch, index) => (
                <tr key={branch.id || index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                      <div>
                        {branch.name}{" "}
                        <span className="text-xs text-slate-500 ml-1">
                          ({branch.code})
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {branch.city}, {branch.state}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {branch.isHeadOffice ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Building className="w-3 h-3 mr-1" /> Yes
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => handleOpenModal(branch)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(branch.id)}
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
              {editingItem ? "Edit Branch" : "Add Branch"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  placeholder="Branch Name"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
                <input
                  required
                  type="text"
                  placeholder="Code (e.g. DEL)"
                  value={formData.code || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  placeholder="City"
                  value={formData.city || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
                <input
                  required
                  type="text"
                  placeholder="State"
                  value={formData.state || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>
              <div className="flex items-center p-3 bg-slate-50 rounded border">
                <input
                  type="checkbox"
                  id="isHO"
                  checked={formData.isHeadOffice || false}
                  onChange={(e) =>
                    setFormData({ ...formData, isHeadOffice: e.target.checked })
                  }
                  className="mr-2"
                />
                <label htmlFor="isHO" className="text-sm font-medium">
                  Set as Head Office
                </label>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded"
                >
                  {loading ? "Saving..." : "Save Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
