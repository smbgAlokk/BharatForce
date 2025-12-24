
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Clock, CheckCircle, XCircle, CreditCard, Edit2 } from 'lucide-react';

export const MyClaims: React.FC = () => {
  const navigate = useNavigate();
  const { expenseClaims, currentUser } = useApp();
  
  const myClaims = expenseClaims.filter(c => c.employeeId === currentUser.employeeId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = myClaims.filter(c => filterStatus === 'All' || c.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Draft': return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit"><Edit2 className="w-3 h-3 mr-1"/> Draft</span>;
      case 'Submitted': return <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit"><Clock className="w-3 h-3 mr-1"/> Submitted</span>;
      case 'Approved': return <span className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit"><CheckCircle className="w-3 h-3 mr-1"/> Approved</span>;
      case 'Paid': return <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit"><CreditCard className="w-3 h-3 mr-1"/> Paid</span>;
      case 'Rejected': return <span className="bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit"><XCircle className="w-3 h-3 mr-1"/> Rejected</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-900">My Expense Claims</h2>
          <p className="text-sm text-slate-500">Track your reimbursement requests.</p>
        </div>
        <button onClick={() => navigate('new')} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> New Claim
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 pb-4 border-b border-slate-200">
        {['All', 'Draft', 'Submitted', 'Approved', 'Paid'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filterStatus === status ? 'bg-indigo-100 text-indigo-800' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-slate-200 text-slate-500">
            No claims found in this category.
          </div>
        ) : (
          filtered.map(claim => (
            <div key={claim.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`edit/${claim.id}`)}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 rounded">{claim.id}</span>
                    <span className="text-sm text-slate-500">{new Date(claim.claimDate).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">₹ {claim.totalAmount.toLocaleString()}</h3>
                  <div className="text-sm text-slate-600 mt-1">{claim.lines.length} items • {claim.notes || 'No description'}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(claim.status)}
                  <span className="text-xs text-slate-400">Created {new Date(claim.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
