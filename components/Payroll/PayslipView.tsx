
import React from 'react';
import { Payslip } from '../../types';
import { X, Download, Printer } from 'lucide-react';

interface Props {
  payslip: Payslip;
  onClose: () => void;
}

export const PayslipView: React.FC<Props> = ({ payslip, onClose }) => {
  const { employeeDetails, attendanceSummary, earnings, deductions, netPay, payrollMonth } = payslip;

  const totalEarnings = earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-75 px-4">
       <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
             <h3 className="text-lg font-bold text-slate-900">Payslip for {payrollMonth}</h3>
             <div className="flex gap-2">
                <button className="p-2 text-slate-500 hover:text-indigo-600" title="Print"><Printer className="w-5 h-5"/></button>
                <button className="p-2 text-slate-500 hover:text-indigo-600" title="Download PDF"><Download className="w-5 h-5"/></button>
                <button onClick={onClose} className="p-2 text-slate-500 hover:text-red-600"><X className="w-5 h-5"/></button>
             </div>
          </div>

          <div className="p-8 space-y-6">
             {/* Header */}
             <div className="text-center border-b pb-6">
                <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">Acme India Pvt Ltd</h1>
                <p className="text-sm text-slate-500">Tech Park, Whitefield, Bangalore - 560066</p>
                <h2 className="text-lg font-semibold mt-4 text-slate-800">Payslip for the month of {payrollMonth}</h2>
             </div>

             {/* Employee Details */}
             <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-700 border-b pb-6">
                <div className="flex justify-between"><span>Employee Name:</span> <span className="font-bold">{employeeDetails.name}</span></div>
                <div className="flex justify-between"><span>Employee Code:</span> <span className="font-bold">{employeeDetails.code}</span></div>
                <div className="flex justify-between"><span>Department:</span> <span>{employeeDetails.department}</span></div>
                <div className="flex justify-between"><span>Designation:</span> <span>{employeeDetails.designation}</span></div>
                <div className="flex justify-between"><span>PAN:</span> <span>{employeeDetails.pan || '-'}</span></div>
                <div className="flex justify-between"><span>Bank Account:</span> <span>{employeeDetails.bankAccount || '-'}</span></div>
                <div className="flex justify-between"><span>Total Days:</span> <span>{attendanceSummary.totalDays}</span></div>
                <div className="flex justify-between"><span>Paid Days:</span> <span>{attendanceSummary.paidDays}</span></div>
             </div>

             {/* Earnings & Deductions Table */}
             <div className="grid grid-cols-2 gap-0 border border-slate-300">
                {/* Earnings Header */}
                <div className="bg-slate-100 p-2 font-bold text-sm border-r border-b border-slate-300 text-center">Earnings</div>
                <div className="bg-slate-100 p-2 font-bold text-sm border-b border-slate-300 text-center">Deductions</div>

                {/* Lists */}
                <div className="border-r border-slate-300 p-4 space-y-2 text-sm">
                   {earnings.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                         <span>{item.name}</span>
                         <span>{item.amount.toLocaleString()}</span>
                      </div>
                   ))}
                   {earnings.length === 0 && <div className="text-center text-slate-400">-</div>}
                </div>
                <div className="p-4 space-y-2 text-sm">
                   {deductions.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                         <span>{item.name}</span>
                         <span>{item.amount.toLocaleString()}</span>
                      </div>
                   ))}
                   {deductions.length === 0 && <div className="text-center text-slate-400">-</div>}
                </div>

                {/* Totals */}
                <div className="bg-slate-50 p-3 border-t border-r border-slate-300 flex justify-between font-bold text-sm">
                   <span>Total Earnings</span>
                   <span>₹ {totalEarnings.toLocaleString()}</span>
                </div>
                <div className="bg-slate-50 p-3 border-t border-slate-300 flex justify-between font-bold text-sm">
                   <span>Total Deductions</span>
                   <span>₹ {totalDeductions.toLocaleString()}</span>
                </div>
             </div>

             {/* Net Pay */}
             <div className="bg-indigo-50 border border-indigo-200 p-4 rounded flex justify-between items-center">
                <span className="text-sm font-bold text-indigo-900 uppercase">Net Pay (Earnings - Deductions)</span>
                <span className="text-2xl font-bold text-indigo-700">₹ {netPay.toLocaleString()}</span>
             </div>
             
             <div className="text-center text-xs text-slate-400 mt-8">
                This is a system-generated payslip and does not require a signature.
             </div>
          </div>
       </div>
    </div>
  );
};
