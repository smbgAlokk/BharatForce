
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RegularisationRequest, RegularisationType, RequestStatus, DailyAttendance } from '../../types';
import { X, Save, Send, Lock } from 'lucide-react';

interface Props {
  record?: DailyAttendance;
  date: string;
  onClose: () => void;
}

export const RegularisationRequestModal: React.FC<Props> = ({ record, date, onClose }) => {
  const { addRegularisationRequest, currentUser, currentTenant, shifts, isPeriodClosed } = useApp();
  const [formData, setFormData] = useState<Partial<RegularisationRequest>>({
    requestType: 'Missed Punch',
    attendanceDate: date,
    proposedFirstIn: record?.firstIn || '',
    proposedLastOut: record?.lastOut || ''
  });

  const myShifts = shifts.filter(s => s.companyId === currentTenant?.id);
  const periodClosed = currentTenant ? isPeriodClosed(date, currentTenant.id) : false;

  const handleSubmit = (status: RequestStatus) => {
     if (periodClosed) {
        alert("Cannot submit request. The attendance period is closed.");
        return;
     }
     if (!formData.reason) {
        alert("Please enter a reason.");
        return;
     }

     const newReq: RegularisationRequest = {
        id: `reg-${Date.now()}`,
        companyId: currentTenant!.id,
        employeeId: currentUser.employeeId!,
        attendanceDate: date,
        requestType: formData.requestType as RegularisationType,
        reason: formData.reason || '',
        status: status,
        proposedFirstIn: formData.proposedFirstIn,
        proposedLastOut: formData.proposedLastOut,
        proposedShiftId: formData.proposedShiftId,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.name
     };

     addRegularisationRequest(newReq);
     onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">Regularise Attendance</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
         </div>

         {periodClosed && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
               <Lock className="w-4 h-4 mr-2" />
               <span className="text-sm font-bold">This period is closed for payroll.</span>
            </div>
         )}

         <div className="bg-slate-50 p-3 rounded mb-4 text-sm border border-slate-200">
            <div className="flex justify-between mb-1">
               <span className="text-slate-500">Date</span>
               <span className="font-medium">{new Date(date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between mb-1">
               <span className="text-slate-500">Current Status</span>
               <span className="font-medium">{record?.status || 'Absent'}</span>
            </div>
            <div className="flex justify-between">
               <span className="text-slate-500">Punches</span>
               <span className="font-medium">{record?.firstIn || '--'} - {record?.lastOut || '--'}</span>
            </div>
         </div>

         <div className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-slate-700">Request Type</label>
               <select 
                  disabled={periodClosed}
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm disabled:bg-slate-100"
                  value={formData.requestType}
                  onChange={e => setFormData({...formData, requestType: e.target.value as RegularisationType})}
               >
                  <option value="Missed Punch">Missed Punch</option>
                  <option value="Wrong Time Correction">Wrong Time Correction</option>
                  <option value="Mark Present">Mark Present (Forgot to punch)</option>
                  <option value="Work From Home">Work From Home</option>
                  <option value="On Duty">On Duty / Client Visit</option>
                  <option value="Shift Change">Shift Change</option>
                  <option value="Half Day">Half Day</option>
               </select>
            </div>

            {(formData.requestType === 'Missed Punch' || formData.requestType === 'Wrong Time Correction') && (
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700">First In</label>
                     <input type="time" disabled={periodClosed} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm disabled:bg-slate-100"
                        value={formData.proposedFirstIn} onChange={e => setFormData({...formData, proposedFirstIn: e.target.value})} />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700">Last Out</label>
                     <input type="time" disabled={periodClosed} className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm disabled:bg-slate-100"
                        value={formData.proposedLastOut} onChange={e => setFormData({...formData, proposedLastOut: e.target.value})} />
                  </div>
               </div>
            )}

            {formData.requestType === 'Shift Change' && (
               <div>
                  <label className="block text-sm font-medium text-slate-700">Proposed Shift</label>
                  <select disabled={periodClosed} className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm disabled:bg-slate-100"
                     value={formData.proposedShiftId || ''} onChange={e => setFormData({...formData, proposedShiftId: e.target.value})}
                  >
                     <option value="">Select Shift</option>
                     {myShifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.startTime}-{s.endTime})</option>)}
                  </select>
               </div>
            )}

            <div>
               <label className="block text-sm font-medium text-slate-700">Reason <span className="text-red-500">*</span></label>
               <textarea 
                  required rows={3}
                  disabled={periodClosed}
                  className="mt-1 block w-full border border-slate-300 rounded-md py-2 px-3 sm:text-sm disabled:bg-slate-100"
                  placeholder="Why are you requesting this?"
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
               />
            </div>
         </div>

         <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-100">
            <button onClick={() => handleSubmit('Draft')} disabled={periodClosed} className="flex items-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50">
               <Save className="w-4 h-4 mr-2"/> Draft
            </button>
            <button onClick={() => handleSubmit('Pending Manager Approval')} disabled={periodClosed} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
               <Send className="w-4 h-4 mr-2"/> Submit
            </button>
         </div>
      </div>
    </div>
  );
};
