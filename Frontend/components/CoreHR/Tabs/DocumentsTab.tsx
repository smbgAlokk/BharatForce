import React, { useState } from "react";
import { Employee, EmployeeDocument, DocumentType } from "../../../types";
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  Download,
  X,
  File,
  Loader2,
} from "lucide-react";
import { uploadService } from "../../../services/api";

interface Props {
  employee: Employee;
  isReadOnly: boolean;
  onSave: (data: Partial<Employee>) => void;
}

const DOC_TYPES: DocumentType[] = [
  "Aadhaar",
  "PAN",
  "Photo",
  "Appointment Letter",
  "Offer Letter",
  "ID Card Copy",
  "Previous Experience Letter",
  "Educational Certificate",
  "Address Proof",
  "Bank Proof",
  "Other",
];

export const DocumentsTab: React.FC<Props> = ({
  employee,
  isReadOnly,
  onSave,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<Partial<EmployeeDocument>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  const openModal = (doc?: EmployeeDocument) => {
    setCurrentDoc(doc || { type: "Other" });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-fill filename in UI if it's a new upload
      if (!currentDoc.id) {
        setCurrentDoc((prev) => ({ ...prev, fileName: file.name }));
      }
    }
  };

  // ✅ 1. UPLOAD LOGIC
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalFileUrl = currentDoc.fileUrl || "";
      let finalFileName = currentDoc.fileName || ""; // This will store the Public ID

      // If a new file was chosen, upload to Cloudinary first
      if (selectedFile) {
        // Optional: If replacing an existing file, delete the old one from Cloudinary
        if (currentDoc.fileUrl && currentDoc.fileName && currentDoc.id) {
          await uploadService.deleteFile(currentDoc.fileName);
        }

        const uploadRes = await uploadService.uploadFile(selectedFile);

        if (uploadRes.success) {
          finalFileUrl = uploadRes.fileUrl; // Cloudinary Secure URL
          finalFileName = uploadRes.fileName; // Cloudinary Public ID
        }
      }

      const newDoc = {
        ...currentDoc,
        id: currentDoc.id || `doc-${Date.now()}`,
        uploadedOn:
          currentDoc.uploadedOn || new Date().toISOString().split("T")[0],
        uploadedBy: currentDoc.uploadedBy || "Admin",
        fileUrl: finalFileUrl,
        fileName: finalFileName, // Storing Public ID here for delete logic
      } as EmployeeDocument;

      const updatedList = currentDoc.id
        ? (employee.documents || []).map((x) =>
            x.id === currentDoc.id ? newDoc : x
          )
        : [...(employee.documents || []), newDoc];

      onSave({ documents: updatedList });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ 2. DELETE LOGIC
  const handleDelete = async (doc: EmployeeDocument) => {
    if (window.confirm("Delete this document? This cannot be undone.")) {
      // Delete from Cloudinary using the Public ID stored in 'fileName'
      if (doc.fileName && doc.fileUrl) {
        await uploadService.deleteFile(doc.fileName);
      }

      // Remove from DB
      const updatedList = (employee.documents || []).filter(
        (x) => x.id !== doc.id
      );
      onSave({ documents: updatedList });
    }
  };

  // 3. DOWNLOAD LOGIC (Direct Link)
  const handleDownload = (doc: EmployeeDocument) => {
    if (!doc.fileUrl) {
      alert("File not found or URL is invalid.");
      return;
    }
    // Open Cloudinary URL in new tab (Browser handles download/view)
    window.open(doc.fileUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900">
          Employee Documents
        </h3>
        {!isReadOnly && (
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-1" /> Upload
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {employee.documents && employee.documents.length > 0 ? (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {employee.documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-slate-900">
                          {doc.type}
                        </div>
                        {doc.customLabel && (
                          <div className="text-xs text-slate-500">
                            {doc.customLabel}
                          </div>
                        )}
                        {/* We hide the technical Public ID from user view usually, or show a simple label */}
                        <div className="text-xs text-slate-400 max-w-[150px] truncate">
                          File Attached
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {doc.documentNumber && <div>No: {doc.documentNumber}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div>{doc.uploadedOn}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                      title="View/Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {!isReadOnly && (
                      <>
                        <button
                          onClick={() => openModal(doc)}
                          className="text-slate-400 hover:text-indigo-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-slate-500">
            No documents uploaded yet.
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="font-bold mb-4">
              {currentDoc.id ? "Edit" : "Upload"} Document
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <select
                required
                value={currentDoc.type}
                onChange={(e) =>
                  setCurrentDoc({
                    ...currentDoc,
                    type: e.target.value as DocumentType,
                  })
                }
                className="w-full border p-2 rounded"
              >
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {currentDoc.type === "Other" && (
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Custom Label"
                  required
                  value={currentDoc.customLabel || ""}
                  onChange={(e) =>
                    setCurrentDoc({
                      ...currentDoc,
                      customLabel: e.target.value,
                    })
                  }
                />
              )}
              <input
                className="w-full border p-2 rounded"
                placeholder="Document Number"
                value={currentDoc.documentNumber || ""}
                onChange={(e) =>
                  setCurrentDoc({
                    ...currentDoc,
                    documentNumber: e.target.value,
                  })
                }
              />

              {!currentDoc.id && (
                <div className="border-2 border-dashed p-4 text-center rounded bg-slate-50">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-500 px-3 py-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center"
                >
                  {isUploading && (
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  )}{" "}
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
