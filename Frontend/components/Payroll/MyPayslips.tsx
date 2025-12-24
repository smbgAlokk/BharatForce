
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Payslip } from '../../types';
import { Eye, Download, IndianRupee } from 'lucide-react';
import { PayslipView } from './PayslipView';

export const MyPayslips: React.FC = () => {
  const { payslips, currentUser } = useApp();
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

  const myPayslips = payslips.filter(p => p.employeeId === currentUser.employeeId)
                             .sort((a,b) => new Date(b.generatedOn).getTime() - new Date(a.generatedOn).getTime());

  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-xl font-bold text-slate-900">My Payslips</h2>
          <p className="text-sm text-slate-500">View and download your monthly salary slips.</p>
       </div>

       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
             <thead className="bg-slate-50">
                <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Month</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Generated On</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Net Pay</th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-200">
                {myPayslips.length === 0 ? (
                   <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No payslips available yet.</td></tr>
                ) : (
                   myPayslips.map(slip => (
                      <tr key={slip.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4 text-sm font-medium text-slate-900">{slip.payrollMonth}</td>
                         <td className="px-6 py-4 text-sm text-slate-500">{new Date(slip.generatedOn).toLocaleDateString()}</td>
                         <td className="px-6 py-4 text-right text-sm font-bold text-green-700">₹ {slip.netPay.toLocaleString()}</td>
                         <td className="px-6 py-4 text-right">
                            <button 
                               onClick={() => setSelectedPayslip(slip)} 
                               className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center justify-end ml-auto"
                            >
                               <Eye className="w-4 h-4 mr-1" /> View
                            </button>
                         </td>
                      </tr>
                   ))
                )}
             </tbody>
          </table>
       </div>

       {selectedPayslip && (
          <PayslipView payslip={selectedPayslip} onClose={() => setSelectedPayslip(null)} />
       )}
    </div>
  );
};
