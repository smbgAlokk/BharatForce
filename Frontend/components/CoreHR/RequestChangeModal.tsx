import React, { useState } from "react";
import { X } from "lucide-react";

interface Props {
  label: string;
  currentValue: any;
  onClose: () => void;
  onSubmit: (newValue: any) => void;
}

export const RequestChangeModal: React.FC<Props> = ({
  label,
  currentValue,
  onClose,
  onSubmit,
}) => {
  const [newValue, setNewValue] = useState(currentValue);
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newValue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Request Change: {label}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Current Value
            </label>
            <div className="p-2 bg-slate-100 rounded text-slate-600 text-sm">
              {currentValue || "(Empty)"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              New Value
            </label>
            <input
              autoFocus
              type="text"
              className="block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
              value={newValue || ""}
              onChange={(e) => setNewValue(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              rows={2}
              className="block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
