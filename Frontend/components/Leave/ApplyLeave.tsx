
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LeaveRequest, LeaveApplicationDay, LeaveRequestStatus } from '../../types';
import { Calendar, Info, CheckCircle } from 'lucide-react';

export const ApplyLeave: React.FC = () => {
  const navigate = useNavigate();
  const { 
    leaveTypes, leaveBalances, leavePolicyMappings, leavePolicies, 
    currentUser, currentTenant, submitLeaveApplication 
  } = useApp();

  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDaySession, setHalfDaySession] = useState<'First Half' | 'Second Half'>('First Half');

  // Get relevant leave types for this employee (via policy mapping)
  // For prototype simplicity, we just list all active leave types
  const myLeaveTypes = leaveTypes.filter(lt => lt.companyId === currentTenant?.id && lt.isActive);

  const selectedType = myLeaveTypes.find(t => t.id === leaveTypeId);
  const currentBalance = leaveBalances.find(b => b.employeeId === currentUser.employeeId && b.leaveTypeId === leaveTypeId && b.isActive)?.currentBalance || 0;

  const calculateDays = () => {
    if (!fromDate || !toDate) return 0;
    if (isHalfDay) return 0.5;
    
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
    return diffDays;
    // Note: Actual logic needs to exclude holidays/weekends based on policy
  };

  const totalDays = calculateDays();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser.employeeId || !currentTenant) return;

    // Resolve Policy
    const mapping = leavePolicyMappings.find(m => m.entityId === currentUser.employeeId || m.level === 'DefaultCompany'); // simplified
    const policyId = mapping?.policyId || '';

    // Create Day Breakdown
    const days: LeaveApplicationDay[] = [];
    // Simplistic single day push for now
    days.push({
       id: `day-${Date.now()}`,
       applicationId: '', // Set by backend usually
       date: fromDate,
       dayType: 'Working',
       fraction: isHalfDay ? 0.5 : 1.0,
       effectiveDays: isHalfDay ? 0.5 : 1.0
    });

    const request: LeaveRequest = {
       id: `req-${Date.now()}`,
       companyId: currentTenant.id,
       employeeId: currentUser.employeeId,
       leaveTypeId,
       policyId,
       fromDate,
       toDate,
       isHalfDay,
       halfDaySession: isHalfDay ? halfDaySession : undefined,
       totalDays,
       days,
       reason,
       status: LeaveRequestStatus.DRAFT, // Initial state before context submission
       createdAt: new Date().toISOString(),
       createdBy: currentUser.name
    };

    const result = submitLeaveApplication(request);
    if (result.success) {
       navigate('/leave/my-applications');
    } else {
       alert(result.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-slate-200">
       <h2 className="text-xl font-bold text-slate-900 mb-6">Apply for Leave</h2>
       
       <form onSubmit={handleSubmit} className="space-y-6">
          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
             <select 
               required
               className="block w-full border-slate-300 rounded-md shadow-sm p-2"
               value={leaveTypeId}
               onChange={e => setLeaveTypeId(e.target.value)}
             >
                <option value="">Select Leave Type</option>
                {myLeaveTypes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
             </select>
             {leaveTypeId && (
                <p className="text-sm text-indigo-600 mt-1 font-medium">
                   Available Balance: {currentBalance} Days
                </p>
             )}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">From Date</label>
                <input 
                  type="date" required
                  className="block w-full border-slate-300 rounded-md shadow-sm p-2"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To Date</label>
                <input 
                  type="date" required
                  className="block w-full border-slate-300 rounded-md shadow-sm p-2"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  min={fromDate}
                />
             </div>
          </div>

          <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-md border border-slate-100">
             <label className="flex items-center text-sm font-medium text-slate-700">
                <input 
                  type="checkbox" 
                  className="mr-2 h-4 w-4 text-indigo-600 border-slate-300 rounded"
                  checked={isHalfDay}
                  onChange={e => setIsHalfDay(e.target.checked)}
                />
                Apply for Half Day
             </label>
             
             {isHalfDay && (
                <select 
                  className="block w-40 border-slate-300 rounded-md shadow-sm p-1.5 text-sm"
                  value={halfDaySession}
                  onChange={e => setHalfDaySession(e.target.value as any)}
                >
                   <option value="First Half">First Half</option>
                   <option value="Second Half">Second Half</option>
                </select>
             )}
          </div>

          {totalDays > 0 && (
             <div className="flex items-center text-sm text-green-700 bg-green-50 p-3 rounded-md">
                <CheckCircle className="w-4 h-4 mr-2" />
                Total Days Requested: <span className="font-bold ml-1">{totalDays}</span>
             </div>
          )}

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
             <textarea 
               required rows={3}
               className="block w-full border-slate-300 rounded-md shadow-sm p-2"
               placeholder="Enter reason for leave..."
               value={reason}
               onChange={e => setReason(e.target.value)}
             />
          </div>

          <div className="flex justify-end gap-3 pt-4">
             <button type="button" onClick={() => navigate('/leave/my-applications')} className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50">Cancel</button>
             <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm">Submit Request</button>
          </div>
       </form>
    </div>
  );
};
