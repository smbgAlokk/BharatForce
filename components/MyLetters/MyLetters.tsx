
import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, Download } from 'lucide-react';

export const MyLetters: React.FC = () => {
  const { generatedLetters, currentUser } = useApp();

  // Show issued letters for logged-in employee
  const myLetters = generatedLetters.filter(l => 
    l.employeeId === currentUser.employeeId && 
    l.status === 'Issued'
  );

  return (
    <div className="space-y-6">
       <div>
         <h1 className="text-2xl font-bold text-slate-900">My Letters</h1>
         <p className="text-slate-500 mt-1">Access your official HR communication letters.</p>
       </div>

       <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Document Name</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Effective Date</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Issued On</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {myLetters.length === 0 ? (
                   <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No letters issued yet.</td></tr>
                ) : (
                   myLetters.map(letter => (
                      <tr key={letter.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4">
                            <div className="flex items-center">
                               <div className="h-8 w-8 bg-indigo-50 text-indigo-600 rounded flex items-center justify-center mr-3">
                                  <FileText className="w-4 h-4" />
                               </div>
                               <div>
                                  <div className="text-sm font-medium text-slate-900">{letter.type} Letter</div>
                                  <div className="text-xs text-slate-500">ID: {letter.id}</div>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-500">{new Date(letter.effectiveDate).toLocaleDateString()}</td>
                         <td className="px-6 py-4 text-sm text-slate-500">{letter.issuedOn ? new Date(letter.issuedOn).toLocaleDateString() : '-'}</td>
                         <td className="px-6 py-4 text-right">
                            <button 
                               onClick={() => alert(letter.content)} // Simple alert for prototype, real app would open PDF/Modal
                               className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center justify-end ml-auto"
                            >
                               <Download className="w-4 h-4 mr-1" /> View / Download
                            </button>
                         </td>
                      </tr>
                   ))
                )}
             </tbody>
          </table>
       </div>
    </div>
  );
};
