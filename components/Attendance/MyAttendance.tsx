
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, CheckCircle, AlertTriangle, MapPin, PlayCircle, StopCircle, Crosshair, FileText, Lock } from 'lucide-react';
import { RegularisationRequestModal } from './RegularisationRequestModal';

export const MyAttendance: React.FC = () => {
  const { dailyAttendance, attendancePunches, currentUser, addPunch, regularisationRequests, currentTenant, isPeriodClosed } = useApp();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'Summary' | 'Logs' | 'Requests'>('Summary');
  const [gpsLoading, setGpsLoading] = useState(false);
  
  const [requestModalDate, setRequestModalDate] = useState<string | null>(null);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

  const myRecords = dailyAttendance.filter(d => 
     d.employeeId === currentUser.employeeId && 
     d.date >= startOfMonth && d.date <= endOfMonth
  );

  const myRequests = regularisationRequests.filter(r => r.employeeId === currentUser.employeeId);

  const myPunches = attendancePunches.filter(p => p.employeeId === currentUser.employeeId);
  const today = new Date().toISOString().split('T')[0];
  const todayRecord = dailyAttendance.find(d => d.employeeId === currentUser.employeeId && d.date === today);
  const isClockedIn = todayRecord && todayRecord.firstIn && !todayRecord.lastOut;

  const presentDays = myRecords.filter(r => r.status === 'Present').length;
  const lateDays = myRecords.filter(r => r.isLate).length;
  const avgHours = '8h 30m'; 

  const handlePrevMonth = () => {
     setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const handleNextMonth = () => {
     setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const handleCheckInOut = async (type: 'IN' | 'OUT') => {
     if (!currentUser.employeeId) return;
     
     setGpsLoading(true);

     if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
           (position) => {
              addPunch(currentUser.employeeId!, type, 'Mobile', {
                 lat: position.coords.latitude,
                 lng: position.coords.longitude,
                 acc: position.coords.accuracy,
                 status: 'Captured'
              });
              setGpsLoading(false);
           },
           (error) => {
              console.warn("GPS Error:", error.message);
              let status: any = 'Error';
              if (error.code === error.PERMISSION_DENIED) status = 'Denied';
              if (error.code === error.POSITION_UNAVAILABLE) status = 'Not Available';

              addPunch(currentUser.employeeId!, type, 'Mobile', { status });
              setGpsLoading(false);
           },
           { timeout: 5000 }
        );
     } else {
        addPunch(currentUser.employeeId, type, 'Mobile', { status: 'Not Available' });
        setGpsLoading(false);
     }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
             <h2 className="text-lg font-bold text-slate-900">My Attendance</h2>
             <p className="text-sm text-slate-500">View attendance history and location logs.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
             <button 
               disabled={gpsLoading || !!isClockedIn}
               onClick={() => handleCheckInOut('IN')}
               className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors 
                  ${isClockedIn ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
             >
                {gpsLoading && !isClockedIn ? 'Locating...' : <><PlayCircle className="w-4 h-4 mr-2"/> Check In</>}
             </button>
             <button 
               disabled={gpsLoading || !isClockedIn}
               onClick={() => handleCheckInOut('OUT')}
               className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors 
                  ${!isClockedIn ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
             >
                 {gpsLoading && isClockedIn ? 'Locating...' : <><StopCircle className="w-4 h-4 mr-2"/> Check Out</>}
             </button>
          </div>
       </div>

       <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
             <button onClick={() => setActiveTab('Summary')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'Summary' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Attendance Summary</button>
             <button onClick={() => setActiveTab('Logs')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'Logs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Location Logs</button>
             <button onClick={() => setActiveTab('Requests')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'Requests' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Regularisation Requests</button>
          </nav>
       </div>

       {activeTab === 'Summary' && (
         <div className="space-y-6">
            <div className="flex items-center justify-center space-x-4 bg-white px-4 py-2 rounded border border-slate-200 shadow-sm w-fit mx-auto">
               <button onClick={handlePrevMonth} className="text-slate-500 hover:text-indigo-600 text-sm font-bold">&lt;</button>
               <span className="text-sm font-medium w-32 text-center">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
               <button onClick={handleNextMonth} className="text-slate-500 hover:text-indigo-600 text-sm font-bold">&gt;</button>
            </div>

            <div className="grid grid-cols-3 gap-4">
               <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                  <div className="text-xs text-slate-500 uppercase mb-1">Days Present</div>
                  <div className="text-2xl font-bold text-green-600">{presentDays}</div>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                  <div className="text-xs text-slate-500 uppercase mb-1">Late Marks</div>
                  <div className="text-2xl font-bold text-amber-600">{lateDays}</div>
               </div>
               <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                  <div className="text-xs text-slate-500 uppercase mb-1">Avg Work Hrs</div>
                  <div className="text-2xl font-bold text-indigo-600">{avgHours}</div>
               </div>
            </div>

            <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
               <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                     <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Day Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">In Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Out Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Remarks</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                     {myRecords.length === 0 ? (
                        <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">No records for this month.</td></tr>
                     ) : (
                        myRecords.sort((a,b) => b.date.localeCompare(a.date)).map(record => {
                           const isClosed = currentTenant ? isPeriodClosed(record.date, currentTenant.id) : false;
                           
                           return (
                              <tr key={record.id} className="hover:bg-slate-50">
                                 <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                    {new Date(record.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', weekday: 'short' })}
                                 </td>
                                 <td className="px-6 py-4 text-sm text-slate-500">{record.dayType}</td>
                                 <td className="px-6 py-4 text-sm text-green-700 font-medium">{record.firstIn || '-'}</td>
                                 <td className="px-6 py-4 text-sm text-red-700 font-medium">{record.lastOut || '-'}</td>
                                 <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium 
                                       ${record.status === 'Present' ? 'bg-green-100 text-green-800' : 
                                         record.status === 'Absent' ? 'bg-red-100 text-red-800' : 
                                         record.status === 'Leave' ? 'bg-blue-100 text-blue-800' : 
                                         'bg-slate-100 text-slate-600'}`}>
                                       {record.status}
                                    </span>
                                    {record.isLate && <span className="ml-2 text-[10px] bg-yellow-100 text-yellow-800 px-1 rounded">L</span>}
                                    {record.isRegularised && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-1 rounded">Reg</span>}
                                 </td>
                                 <td className="px-6 py-4 text-sm text-slate-500">{record.remarks || '-'}</td>
                                 <td className="px-6 py-4 text-right">
                                    {isClosed ? (
                                       <span className="text-xs font-bold text-slate-400 flex items-center justify-end">
                                          <Lock className="w-3 h-3 mr-1" /> Closed
                                       </span>
                                    ) : (
                                       <button onClick={() => setRequestModalDate(record.date)} className="text-indigo-600 hover:text-indigo-900 text-xs font-medium">
                                          Regularise
                                       </button>
                                    )}
                                 </td>
                              </tr>
                           );
                        })
                     )}
                  </tbody>
               </table>
            </div>
         </div>
       )}

       {activeTab === 'Logs' && (
          <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-sm font-bold text-slate-700 uppercase">Raw Punch Logs & Location</h3>
             </div>
             <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date & Time</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Punch</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Source</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">GPS Status</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Coordinates</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200">
                  {myPunches.sort((a,b) => b.punchTime.localeCompare(a.punchTime)).map(punch => (
                     <tr key={punch.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-900">
                           {new Date(punch.punchTime).toLocaleDateString()} <span className="text-slate-500 text-xs">{new Date(punch.punchTime).toLocaleTimeString()}</span>
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
                              <div className="flex items-center cursor-pointer hover:text-indigo-600" title={`Accuracy: ${punch.accuracyMeters}m`}>
                                 <MapPin className="w-3 h-3 mr-1" />
                                 {punch.latitude.toFixed(4)}, {punch.longitude.toFixed(4)}
                              </div>
                           ) : '-'}
                        </td>
                     </tr>
                  ))}
                  {myPunches.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No logs found.</td></tr>}
               </tbody>
            </table>
          </div>
       )}

       {activeTab === 'Requests' && (
         <div className="bg-white shadow rounded-lg border border-slate-200 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
               <thead className="bg-slate-50">
                  <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Request Type</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reason</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Remarks</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-200">
                  {myRequests.length === 0 ? (
                     <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No requests found.</td></tr>
                  ) : (
                     myRequests.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4 text-sm font-medium text-slate-900">{new Date(req.attendanceDate).toLocaleDateString()}</td>
                           <td className="px-6 py-4 text-sm text-slate-600">{req.requestType}</td>
                           <td className="px-6 py-4 text-sm text-slate-500">{req.reason}</td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded-full ${req.status === 'Approved' ? 'bg-green-100 text-green-800' : req.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                 {req.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-sm text-slate-500">{req.hrComments || req.managerComments || '-'}</td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
       )}

      {requestModalDate && (
         <RegularisationRequestModal 
            date={requestModalDate} 
            record={myRecords.find(r => r.date === requestModalDate)}
            onClose={() => setRequestModalDate(null)} 
         />
      )}
    </div>
  );
};
