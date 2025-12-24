
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, Search, Filter } from 'lucide-react';

type ReportType = 'Employee' | 'Category' | 'Advance';

export const ExpenseReports: React.FC = () => {
  const { expenseClaims, expenseCategories, expenseAdvances, employees, currentTenant } = useApp();
  
  const [activeReport, setActiveReport] = useState<ReportType>('Employee');
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Filter Data Context
  const myClaims = expenseClaims.filter(c => 
    c.companyId === currentTenant?.id && 
    c.claimDate >= startDate && 
    c.claimDate <= endDate
  );

  const myAdvances = expenseAdvances.filter(a => 
    a.companyId === currentTenant?.id &&
    a.requestedOn >= startDate &&
    a.requestedOn <= endDate
  );

  const getEmpName = (id: string) => {
     const e = employees.find(emp => emp.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };

  const getCategoryName = (id: string) => expenseCategories.find(c => c.id === id)?.categoryName || id;

  // --- Report Logic ---

  const generateEmployeeData = () => {
     return myClaims.filter(c => {
        const matchesEmp = employeeFilter ? c.employeeId === employeeFilter : true;
        const matchesStatus = statusFilter !== 'All' ? c.status === statusFilter : true;
        return matchesEmp && matchesStatus;
     }).map(c => ({
        Employee: getEmpName(c.employeeId),
        ClaimID: c.id,
        Date: c.claimDate,
        TotalAmount: c.totalAmount,
        Status: c.status,
        SubmittedOn: c.submittedOn ? new Date(c.submittedOn).toLocaleDateString() : '-',
        Paid: c.status === 'Paid' ? 'Yes' : 'No'
     }));
  };

  const generateCategoryData = () => {
     const stats: Record<string, { total: number, count: number }> = {};
     
     // Iterate all claims within date range
     myClaims.forEach(claim => {
        if (statusFilter !== 'All' && claim.status !== statusFilter) return;
        
        claim.lines.forEach(line => {
           if (!stats[line.categoryId]) stats[line.categoryId] = { total: 0, count: 0 };
           stats[line.categoryId].total += line.amount;
           stats[line.categoryId].count += 1;
        });
     });

     return Object.entries(stats).map(([catId, stat]) => ({
        Category: getCategoryName(catId),
        TotalAmount: stat.total,
        ClaimCount: stat.count,
        AverageAmount: (stat.total / stat.count).toFixed(2)
     }));
  };

  const generateAdvanceData = () => {
     return myAdvances.filter(a => {
        const matchesEmp = employeeFilter ? a.employeeId === employeeFilter : true;
        // Simple status mapping for filter
        const isClosed = a.status === 'Closed';
        if (statusFilter === 'Closed' && !isClosed) return false;
        if (statusFilter === 'Open' && isClosed) return false;
        return matchesEmp;
     }).map(a => ({
        AdvanceID: a.id,
        Employee: getEmpName(a.employeeId),
        RequestedDate: new Date(a.requestedOn).toLocaleDateString(),
        RequestedAmount: a.amount,
        Reason: a.reason,
        Status: a.status,
        Closed: a.status === 'Closed' ? 'Yes' : 'No'
     }));
  };

  // --- Export ---

  const handleExport = () => {
     let data: any[] = [];
     if (activeReport === 'Employee') data = generateEmployeeData();
     if (activeReport === 'Category') data = generateCategoryData();
     if (activeReport === 'Advance') data = generateAdvanceData();

     if (data.length === 0) {
        alert('No data to export.');
        return;
     }

     const headers = Object.keys(data[0]);
     const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName as keyof typeof row])).join(','))
     ].join('\n');

     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
     const link = document.createElement('a');
     link.href = URL.createObjectURL(blob);
     link.download = `${activeReport}_Report_${startDate}_${endDate}.csv`;
     link.click();
  };

  const renderContent = () => {
     if (activeReport === 'Employee') {
        const data = generateEmployeeData();
        return (
           <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                 <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Employee</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-500">Amount</th>
                    <th className="px-4 py-3 text-center font-medium text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Submitted On</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                 {data.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                       <td className="px-4 py-2 font-medium text-slate-900">{row.Employee}</td>
                       <td className="px-4 py-2 text-slate-500">{new Date(row.Date).toLocaleDateString()}</td>
                       <td className="px-4 py-2 text-right font-mono">₹ {row.TotalAmount.toLocaleString()}</td>
                       <td className="px-4 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${row.Status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                             {row.Status}
                          </span>
                       </td>
                       <td className="px-4 py-2 text-slate-500">{row.SubmittedOn}</td>
                    </tr>
                 ))}
                 {data.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No records found.</td></tr>}
              </tbody>
           </table>
        );
     }

     if (activeReport === 'Category') {
        const data = generateCategoryData();
        return (
           <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                 <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Category</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-500">Total Amount</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-500">No. of Claims</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-500">Avg. Amount</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                 {data.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                       <td className="px-4 py-2 font-medium text-slate-900">{row.Category}</td>
                       <td className="px-4 py-2 text-right font-bold text-slate-700">₹ {row.TotalAmount.toLocaleString()}</td>
                       <td className="px-4 py-2 text-right text-slate-600">{row.ClaimCount}</td>
                       <td className="px-4 py-2 text-right text-slate-500">₹ {row.AverageAmount}</td>
                    </tr>
                 ))}
                 {data.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No data found.</td></tr>}
              </tbody>
           </table>
        );
     }

     if (activeReport === 'Advance') {
        const data = generateAdvanceData();
        return (
           <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                 <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Employee</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-500">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-500">Reason</th>
                    <th className="px-4 py-3 text-center font-medium text-slate-500">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                 {data.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                       <td className="px-4 py-2 font-medium text-slate-900">{row.Employee}</td>
                       <td className="px-4 py-2 text-slate-500">{row.RequestedDate}</td>
                       <td className="px-4 py-2 text-right font-mono">₹ {row.RequestedAmount.toLocaleString()}</td>
                       <td className="px-4 py-2 text-slate-500 italic">{row.Reason}</td>
                       <td className="px-4 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs border ${row.Closed === 'Yes' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                             {row.Status}
                          </span>
                       </td>
                    </tr>
                 ))}
                 {data.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No advances found.</td></tr>}
              </tbody>
           </table>
        );
     }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Expense Reports</h2>
       </div>

       <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
          {/* Toolbar */}
          <div className="border-b border-slate-200 bg-slate-50 p-4 flex flex-col md:flex-row gap-4 items-end">
             <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Report Type</label>
                   <select 
                     className="w-full border-slate-300 rounded-md text-sm p-2"
                     value={activeReport} onChange={e => setActiveReport(e.target.value as ReportType)}
                   >
                      <option value="Employee">Employee Summary</option>
                      <option value="Category">Category Summary</option>
                      <option value="Advance">Advance Summary</option>
                   </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">From Date</label>
                   <input type="date" className="w-full border-slate-300 rounded-md text-sm p-2" 
                      value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To Date</label>
                   <input type="date" className="w-full border-slate-300 rounded-md text-sm p-2" 
                      value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                
                {activeReport !== 'Category' && (
                   <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Employee</label>
                      <select 
                        className="w-full border-slate-300 rounded-md text-sm p-2"
                        value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)}
                      >
                         <option value="">All Employees</option>
                         {employees.filter(e => e.companyId === currentTenant?.id).map(e => (
                            <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                         ))}
                      </select>
                   </div>
                )}
             </div>
             <button onClick={handleExport} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center shadow-sm mb-0.5">
                <Download className="w-4 h-4 mr-2" /> Export CSV
             </button>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
             {renderContent()}
          </div>
       </div>
    </div>
  );
};
