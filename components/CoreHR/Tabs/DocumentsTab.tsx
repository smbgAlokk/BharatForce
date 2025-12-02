
import React, { useState } from 'react';
import { Employee, EmployeeDocument, DocumentType } from '../../../types';
import { Plus, Edit2, Trash2, FileText, Download, X, File } from 'lucide-react';

interface Props {
  employee: Employee;
  isReadOnly: boolean;
  onSave: (data: Partial<Employee>) => void;
}

const DOC_TYPES: DocumentType[] = [
  'Aadhaar', 'PAN', 'Photo', 'Appointment Letter', 'Offer Letter', 
  'ID Card Copy', 'Previous Experience Letter', 'Educational Certificate', 
  'Address Proof', 'Bank Proof', 'Other'
];

export const DocumentsTab: React.FC<Props> = ({ employee, isReadOnly, onSave }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<Partial<EmployeeDocument>>({});

  const openModal = (doc?: EmployeeDocument) => {
    setCurrentDoc(doc || { type: 'Other' });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc = {
      ...currentDoc,
      id: currentDoc.id || `doc-${Date.now()}`,
      uploadedOn: currentDoc.uploadedOn || new Date().toISOString().split('T')[0],
      uploadedBy: currentDoc.uploadedBy || 'Admin',
      fileUrl: '#', // Mock
      fileName: currentDoc.fileName || 'uploaded_file.pdf' // Mock if not set
    } as EmployeeDocument;

    const updatedList = currentDoc.id 
      ? (employee.documents || []).map(x => x.id === currentDoc.id ? newDoc : x)
      : [...(employee.documents || []), newDoc];

    onSave({ documents: updatedList });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const updatedList = (employee.documents || []).filter(x => x.id !== id);
      onSave({ documents: updatedList });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900">Employee Documents</h3>
        {!isReadOnly && (
          <button onClick={() => openModal()} className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-1" /> Upload Document
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {(employee.documents && employee.documents.length > 0) ? (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Uploaded</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {employee.documents.map(doc => (
                <tr key={doc.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-slate-900">{doc.type}</div>
                        {doc.customLabel && <div className="text-xs text-slate-500">{doc.customLabel}</div>}
                        <div className="text-xs text-slate-400">{doc.fileName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {doc.documentNumber && <div>No: {doc.documentNumber}</div>}
                    {doc.expiryDate && <div className="text-xs text-red-400">Expires: {doc.expiryDate}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    <div>{doc.uploadedOn}</div>
                    <div className="text-xs text-slate-400">by {doc.uploadedBy}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button className="text-slate-400 hover:text-indigo-600" title="Download"><Download className="h-4 w-4" /></button>
                    {!isReadOnly && (
                      <>
                        <button onClick={() => openModal(doc)} className="text-slate-400 hover:text-indigo-600"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(doc.id)} className="text-slate-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
             <File className="h-12 w-12 text-slate-300 mx-auto mb-3" />
             <p className="text-slate-500">No documents uploaded yet.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{currentDoc.id ? 'Edit' : 'Upload'} Document</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Document Type *</label>
                <select required value={currentDoc.type} onChange={e => setCurrentDoc({...currentDoc, type: e.target.value as DocumentType})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm">
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              {currentDoc.type === 'Other' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Custom Label *</label>
                  <input required type="text" value={currentDoc.customLabel || ''} onChange={e => setCurrentDoc({...currentDoc, customLabel: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700">Document Number</label>
                <input type="text" value={currentDoc.documentNumber || ''} onChange={e => setCurrentDoc({...currentDoc, documentNumber: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Issue Date</label>
                  <input type="date" value={currentDoc.issueDate || ''} onChange={e => setCurrentDoc({...currentDoc, issueDate: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Expiry Date</label>
                  <input type="date" value={currentDoc.expiryDate || ''} onChange={e => setCurrentDoc({...currentDoc, expiryDate: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
                </div>
              </div>
              {!currentDoc.id && (
                 <div>
                  <label className="block text-sm font-medium text-slate-700">File Upload *</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <File className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => setCurrentDoc({...currentDoc, fileName: e.target.files?.[0]?.name})} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-slate-500">{currentDoc.fileName || 'PDF, PNG, JPG up to 5MB'}</p>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700">Notes</label>
                <input type="text" value={currentDoc.notes || ''} onChange={e => setCurrentDoc({...currentDoc, notes: e.target.value})} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 focus:ring-indigo-500 sm:text-sm" />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
