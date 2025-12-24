import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Calendar, MapPin } from 'lucide-react';

export const TeamAttendance: React.FC = () => {
  const { dailyAttendance, attendancePunches, employees, currentUser } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showLogs, setShowLogs] = useState(false);

  // Get Direct Reports
  const myTeam = employees.filter(e => e.reportingManagerId === currentUser.employeeId);
  
  // Get Attendance for date
  const records = dailyAttendance.filter(d => d.date === selectedDate && myTeam.some(e => e.id === d.employeeId));
  const punches = attendancePunches.filter(p => p.attendanceDate === selectedDate && myTeam.some(e => e.id === p.employeeId));

  const getEmpName = (id: string) => {
     const e = employees.find(em => em.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center space-x-4">
             <h2 className="text-lg font-bold text-slate-900">Team Attendance</h2>
             <div>
                <input 
                  type="date" 
                  className="border-slate-300 rounded-md shadow-sm text-sm p-2"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
             </div>
          </div>
          
          <div className="flex gap-4 items-center">
             <div className="flex items-center text-sm"><div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div> Present: {records.filter(r => r.status === 'Present').length}</div>
             <button 
               onClick={() => setShowLogs(!showLogs)}
               className={`text-sm px-3 py-1 rounded border transition-colors ${showLogs ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600 border-slate-300'}`}
             >
                {showLogs ? 'Hide GPS Logs' : 'View GPS Logs'}
             </button>
          </div>
       </div>

       {!showLogs ? (
          <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
             <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                   <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">In Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Out Time</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Remarks</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                   {myTeam.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No team members found.</td></tr>
                   ) : (
                      myTeam.map(emp => {
                         const record = records.find(r => r.employeeId === emp.id);
                         return (
                            <tr key={emp.id} className="hover:bg-slate-50">
                               <td className="px-6 py-4">
                                  <div className="text-sm font-medium text-slate-900">{emp.firstName} {emp.lastName}</div>
                                  <div className="text-xs text-slate-500">{emp.designationId || '-'}</div>
                               </td>
                               <td className="px-6 py-4 text-sm text-slate-700">{record?.firstIn || '-'}</td>
                               <td className="px-6 py-4 text-sm text-slate-700">{record?.lastOut || '-'}</td>
                               <td className="px-6 py-4 text-center">
                                  <span className={`px-2 py-1 text-xs rounded-full font-medium 
                                     ${record?.status === 'Present' ? 'bg-green-100 text-green-800' : 
                                       record?.status === 'Leave' ? 'bg-blue-100 text-blue-800' : 
                                       'bg-red-100 text-red-800'}`}>
                                     {record?.status || 'Absent'}
                                  </span>
                               </td>
                               <td className="px-6 py-4 text-sm text-slate-500">{record?.remarks || '-'}</td>
                            </tr>
                         );
                      })
                   )}
                </tbody>
             </table>
          </div>
       ) : (
          <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
             <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                Detail GPS Logs (Direct Reports)
             </div>
             <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Time</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">GPS Status</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Location</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200">
                  {punches.length === 0 ? (
                     <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No punches found for selected date.</td></tr>
                  ) : (
                     punches.sort((a,b) => b.punchTime.localeCompare(a.punchTime)).map(punch => (
                        <tr key={punch.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4 text-sm font-medium text-slate-900">
                              {getEmpName(punch.employeeId)}
                           </td>
                           <td className="px-6 py-4 text-sm text-slate-500">
                              {new Date(punch.punchTime).toLocaleTimeString()}
                           </td>
                           <td className="px-6 py-4">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${punch.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                 {punch.type}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`text-xs px-2 py-1 rounded ${punch.gpsStatus === 'Captured' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                 {punch.gpsStatus || 'Not Used'}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                              {punch.latitude ? (
                                 <div className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1 text-indigo-400" />
                                    {punch.latitude.toFixed(4)}, {punch.longitude?.toFixed(4)}
                                 </div>
                              ) : '-'}
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
             </table>
          </div>
       )}
    </div>
  );
};