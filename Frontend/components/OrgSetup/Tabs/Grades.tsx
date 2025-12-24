import React, { useState } from "react";
import { useApp } from "../../../context/AppContext";
import { Grade } from "../../../types";
import { Plus, Trash2, Edit2, Loader2, Award } from "lucide-react";

export const Grades: React.FC = () => {
  const { currentTenant, grades, addGrade, updateGrade, deleteGrade } =
    useApp();

  // ✅ FIX: Robust Filtering Logic (Matches Backend Data)
  const targetId = currentTenant?.tenantId || currentTenant?.id;

  const myGrades = (grades || []).filter(
    (g) => targetId && (g.tenantId === targetId || g.companyId === targetId)
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Grade | null>(null);
  const [formData, setFormData] = useState<Partial<Grade>>({});
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (item?: Grade) => {
    setEditingItem(item || null);
    setFormData(item || { name: "", level: "Junior", description: "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ FIX: Clean Payload (No fake IDs)
      // The backend will assign the IDs and timestamps
      const payload = { ...formData } as Grade;

      if (editingItem && editingItem.id) {
        await updateGrade({ ...editingItem, ...payload });
      } else {
        await addGrade(payload);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save grade. Please check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this Grade?")) {
      await deleteGrade(id);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg border border-slate-200">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900">Grades / Bands</h3>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Grade
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {myGrades.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-slate-500"
                >
                  No grades found. Add your first one!
                </td>
              </tr>
            ) : (
              myGrades.map((grade, index) => (
                <tr key={grade.id || index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 flex items-center">
                    <Award className="w-4 h-4 text-amber-500 mr-2" />
                    {grade.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-600">
                      {grade.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {grade.description || "-"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => handleOpenModal(grade)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(grade.id)}
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
              {editingItem ? "Edit Grade" : "Add Grade"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Grade Name
                </label>
                <input
                  required
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                  placeholder="e.g. L1 - Junior"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Level
                </label>
                <select
                  value={formData.level || "Junior"}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Leadership">Leadership</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-4">
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  ) : null}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
