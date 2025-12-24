
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DailyAttendance, AttendanceStatus } from '../../types';
import { Search, Filter, Plus, Clock, Calendar, Edit2, MapPin, Lock } from 'lucide-react';

export const DailyConsole: React.FC = () => {
  const { dailyAttendance, attendancePunches, employees, shifts, currentTenant, addDailyAttendance, updateDailyAttendance, userRole, currentUser, isPeriodClosed } = useApp();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'Daily' | 'Logs'>('Daily');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Manual Entry State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DailyAttendance | null>(null);
  const [manualForm, setManualForm] = useState<Partial<DailyAttendance>>({});

  const periodClosed = currentTenant ? isPeriodClosed(selectedDate, currentTenant.id) : false;

  const myAttendance = dailyAttendance.filter(a => a.companyId === currentTenant?.id && a.date === selectedDate);
  const myEmployees = employees.filter(e => e.companyId === currentTenant?.id && e.status === 'Active');
  const myPunches = attendancePunches.filter(p => p.companyId === currentTenant?.id && p.attendanceDate === selectedDate);

  const filteredRecords = myEmployees.map(emp => {
     const record = myAttendance.find(a => a.employeeId === emp.id);
     return { emp, record };
  }).filter(item => {
     const matchesSearch = `${item.emp.firstName} ${item.emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesStatus = statusFilter === 'All' ? true : (item.record ? item.record.status === statusFilter : statusFilter === 'Absent');
     return matchesSearch && matchesStatus;
  });

  const filteredPunches = myPunches.filter(p => {
     const emp = myEmployees.find(e => e.id === p.employeeId);
     if (!emp) return false;
     const matchesSearch = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
     return matchesSearch;
  });

  const getShiftName = (id?: string) => shifts.find(s => s.id === id)?.name || '-';
  const getEmpName = (id: string) => {
     const e = employees.find(em => em.id === id);
     return e ? `${e.firstName} ${e.lastName}` : id;
  };

  const handleEdit = (empId: string, record?: DailyAttendance) => {
     if (periodClosed) {
        alert("Attendance period is closed. Edits are not allowed.");
        return;
     }
     setEditingRecord(record || null);
     if (record) {
        setManualForm(record);
     } else {
        setManualForm({
           employeeId: empId,
           date: selectedDate,
           status: 'Present',
           dayType: 'Working',
           firstIn: '09:00',
           lastOut: '18:00',
           source: 'Manual'
        });
     }
     setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
     e.preventDefault();
     if (!currentTenant || !manualForm.employeeId) return;
     
     const base = {
        ...manualForm as DailyAttendance,
        companyId: currentTenant.id,
     };

     if (editingRecord) {
        updateDailyAttendance(base);
     } else {
        addDailyAttendance({ ...base, id: `att-${Date.now()}` });
     }
     setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
       {/* Controls */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center space-x-4">
             <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                <input 
                  type="date" 
                  className="border-slate-300 rounded-md shadow-sm text-sm p-2"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
             </div>
             <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Search</label>
                <div className="relative">
                   <input 
                     type="text" 
                     className="pl-8 pr-3 py-2 border border-slate-300 rounded-md text-sm w-48" 
                     placeholder="Employee..." 
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                   />
                   <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                </div>
             </div>
             {activeTab === 'Daily' && (
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select 
                     className="border-slate-300 rounded-md shadow-sm text-sm p-2 w-32"
                     value={statusFilter}
                     onChange={e => setStatusFilter(e.target.value)}
                  >
                     <option value="All">All</option>
                     <option value="Present">Present</option>
                     <option value="Absent">Absent</option>
                     <option value="Leave">On Leave</option>
                     <option value="Half Day">Half Day</option>
                  </select>
               </div>
             )}
          </div>
          
          <div className="flex gap-4 items-center">
             {periodClosed && (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 flex items-center">
                   <Lock className="w-3 h-3 mr-1" /> Period Closed
                </span>
             )}
             <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setActiveTab('Daily')} 
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'Daily' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                   Daily View
                </button>
                <button 
                  onClick={() => setActiveTab('Logs')} 
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'Logs' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                   Location Logs
                </button>
             </div>
          </div>
       </div>

       {/* Daily Grid */}
       {activeTab === 'Daily' && (
          <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
             <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                   <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Shift</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">In / Out</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Work Hrs</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                   {filteredRecords.map(({ emp, record }) => (
                      <tr key={emp.id} className="hover:bg-slate-50">
                         <td className="px-6 py-4">
                            <div className="text-sm font-medium text-slate-900">{emp.firstName} {emp.lastName}</div>
                            <div className="text-xs text-slate-500">{emp.employeeCode}</div>
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-500">
                            {getShiftName(record?.shiftId)}
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-700">
                            {record?.firstIn ? (
                               <div>
                                  <span className="text-green-600 font-medium">{record.firstIn}</span> 
                                  <span className="text-slate-400 mx-1">-</span> 
                                  <span className="text-red-600 font-medium">{record.lastOut || '--:--'}</span>
                               </div>
                            ) : (
                               <span className="text-slate-400 italic">No punches</span>
                            )}
                         </td>
                         <td className="px-6 py-4 text-sm text-slate-500">
                            {record?.totalWorkMinutes ? `${Math.floor(record.totalWorkMinutes/60)}h ${record.totalWorkMinutes%60}m` : '-'}
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium 
                               ${record?.status === 'Present' ? 'bg-green-100 text-green-800' : 
                                 record?.status === 'Absent' ? 'bg-red-100 text-red-800' : 
                                 record?.status === 'Leave' ? 'bg-blue-100 text-blue-800' : 
                                 'bg-slate-100 text-slate-600'}`}>
                               {record?.status || 'Absent'}
                            </span>
                            {record?.isLate && <span className="ml-1 text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded">Late</span>}
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleEdit(emp.id, record)} 
                              disabled={periodClosed}
                              className={`text-indigo-600 hover:text-indigo-900 ${periodClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                               <Edit2 className="w-4 h-4" />
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       )}

       {/* Logs Grid */}
       {activeTab === 'Logs' && (
         <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
             <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Time</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Source</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">GPS Status</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Coordinates</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200">
                  {filteredPunches.sort((a,b) => b.punchTime.localeCompare(a.punchTime)).map(punch => (
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
                        <td className="px-6 py-4 text-sm text-slate-500">{punch.source}</td>
                        <td className="px-6 py-4">
                           <span className={`text-xs px-2 py-1 rounded ${
                              punch.gpsStatus === 'Captured' ? 'bg-green-50 text-green-700' : 
                              punch.gpsStatus === 'Denied' ? 'bg-red-50 text-red-700' : 
                              'bg-slate-100 text-slate-500'}`}>
                              {punch.gpsStatus || 'Not Used'}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                           {punch.latitude && punch.longitude ? (
                              <div className="flex items-center">
                                 <MapPin className="w-3 h-3 mr-1 text-indigo-400" />
                                 {punch.latitude.toFixed(4)}, {punch.longitude.toFixed(4)}
                              </div>
                           ) : '-'}
                        </td>
                     </tr>
                  ))}
                  {filteredPunches.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No logs for this date.</td></tr>}
               </tbody>
            </table>
         </div>
       )}

       {/* Edit Modal (Keep existing implementation for Manual Entry) */}
       {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 bg-opacity-50 px-4">
             <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-bold mb-4">{editingRecord ? 'Edit Attendance' : 'Manual Entry'}</h3>
                <form onSubmit={handleSave} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-slate-700">First In</label>
                         <input type="time" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                            value={manualForm.firstIn || ''} onChange={e => setManualForm({...manualForm, firstIn: e.target.value})} />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-slate-700">Last Out</label>
                         <input type="time" className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm" 
                            value={manualForm.lastOut || ''} onChange={e => setManualForm({...manualForm, lastOut: e.target.value})} />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-slate-700">Status</label>
                      <select className="mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2 sm:text-sm"
                         value={manualForm.status} onChange={e => setManualForm({...manualForm, status: e.target.value as AttendanceStatus})}
                      >
                         <option value="Present">Present</option>
                         <option value="Absent">Absent</option>
                         <option value="Half Day">Half Day</option>
                         <option value="Leave">Leave</option>
                         <option value="Holiday">Holiday</option>
                         <option value="Weekly Off">Weekly Off</option>
                      </select>
                   </div>
                   <div className="flex justify-end space-x-3 mt-4">
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
