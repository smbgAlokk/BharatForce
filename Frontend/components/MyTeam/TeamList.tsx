
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Eye, Mail, Phone } from 'lucide-react';

export const TeamList: React.FC = () => {
  const navigate = useNavigate();
  const { employees, currentUser, designations, departments } = useApp();

  // Find direct reports
  // In this demo, currentUser.employeeId is the manager's Employee ID
  const myTeam = employees.filter(e => e.reportingManagerId === currentUser.employeeId);

  const getDesigName = (id?: string) => designations.find(d => d.id === id)?.name || '-';
  const getDeptName = (id?: string) => departments.find(d => d.id === id)?.name || '-';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Team</h1>
        <p className="text-slate-500 mt-1">Manage and view your direct reports.</p>
      </div>

      <div className="bg-white shadow overflow-hidden border border-slate-200 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {myTeam.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">You have no direct reports.</td></tr>
            ) : (
              myTeam.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/core-hr/employee/${emp.id}`)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full bg-slate-200" src={emp.photoUrl || `https://ui-avatars.com/api/?name=${emp.firstName}+${emp.lastName}&background=random`} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{emp.firstName} {emp.lastName}</div>
                        <div className="text-xs text-slate-500 font-mono">{emp.employeeCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{getDesigName(emp.designationId)}</div>
                    <div className="text-xs text-slate-500">{getDeptName(emp.departmentId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center text-xs text-slate-500 mb-1"><Mail className="w-3 h-3 mr-1"/> {emp.officialEmail}</div>
                     <div className="flex items-center text-xs text-slate-500"><Phone className="w-3 h-3 mr-1"/> {emp.mobileNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${emp.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900">
                       <Eye className="h-4 w-4" />
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
