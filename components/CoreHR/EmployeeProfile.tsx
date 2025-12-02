
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole, Employee, ProfileChangeRequest, ChangeRequestStatus } from '../../types';
import { ArrowLeft, Briefcase, MapPin, AlertCircle, Clock } from 'lucide-react';
import { BasicInfoTab } from './Tabs/BasicInfoTab';
import { EmploymentTab } from './Tabs/EmploymentTab';
import { PersonalTab } from './Tabs/PersonalTab';
import { BankTab } from './Tabs/BankTab';
import { EducationTab } from './Tabs/EducationTab';
import { DocumentsTab } from './Tabs/DocumentsTab';
import { RequestChangeModal } from './RequestChangeModal';

export const EmployeeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { employees, designations, departments, branches, userRole, currentUser, updateEmployee, addProfileRequest, profileRequests, currentTenant } = useApp();
  const [activeTab, setActiveTab] = useState<'basic' | 'employment' | 'personal' | 'bank' | 'education' | 'documents' | 'requests'>('basic');

  // Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestCategory, setRequestCategory] = useState<string>('');
  const [requestField, setRequestField] = useState<string>(''); // Dot notation
  const [requestLabel, setRequestLabel] = useState<string>('');
  const [currentValue, setCurrentValue] = useState<any>(null);

  // Determine Profile ID (Self Service or HR View)
  const targetId = location.pathname.includes('/my-profile') 
    ? currentUser.employeeId 
    : id;

  const employee = employees.find(e => e.id === targetId);

  // Role Logic
  const isSelfService = currentUser.role === UserRole.EMPLOYEE && currentUser.employeeId === targetId;
  const isManagerView = currentUser.role === UserRole.MANAGER;
  const isHR = currentUser.role === UserRole.COMPANY_ADMIN;
  const isSuperAdmin = currentUser.role === UserRole.SUPER_ADMIN;

  // Access Control
  const canEditDirectly = isHR;
  const canRequestChange = isSelfService;
  const showBankTab = isHR || isSuperAdmin; // Hide bank from Manager & Employee (Self view too per prompt)
  const showRequestsTab = isSelfService; // Only show "My Requests" to employee

  // Helper to get names
  const getDesigName = (id?: string) => designations.find(d => d.id === id)?.name || '-';
  const getBranchName = (id?: string) => branches.find(b => b.id === id)?.name || '-';

  if (!employee) {
    return <div className="p-8 text-center text-slate-500">Employee not found. {isSelfService && "Is your user account linked to an employee record?"}</div>;
  }

  const handleSave = (updatedData: Partial<Employee>) => {
    if (canEditDirectly) {
      updateEmployee({ ...employee, ...updatedData });
    }
  };

  // Triggered by Tabs when "Request Change" is clicked
  const handleRequestChangeTrigger = (category: string, fieldPath: string, label: string, val: any) => {
    setRequestCategory(category);
    setRequestField(fieldPath);
    setRequestLabel(label);
    setCurrentValue(val);
    setIsRequestModalOpen(true);
  };

  // Submit the request
  const handleSubmitRequest = (newValue: any) => {
    if (!currentTenant) return;

    const newReq: ProfileChangeRequest = {
      id: `req-${Date.now()}`,
      companyId: employee.companyId,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeCode: employee.employeeCode,
      category: requestCategory as any,
      status: ChangeRequestStatus.PENDING,
      requestedOn: new Date().toISOString(),
      requestedBy: currentUser.id,
      changes: [
        {
          field: requestField,
          oldValue: currentValue,
          newValue: newValue,
          label: requestLabel
        }
      ],
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name
    };

    addProfileRequest(newReq);
    setIsRequestModalOpen(false);
    alert("Change request submitted for approval.");
  };

  return (
    <div className="space-y-6">
      {/* Sticky Header */}
      <div className="bg-white shadow rounded-lg border border-slate-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          {!isSelfService && (
             <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-sm text-slate-500 hover:text-slate-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
          )}
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center">
               <img 
                  className="h-16 w-16 rounded-full bg-slate-200 object-cover border-2 border-white shadow-sm" 
                  src={employee.photoUrl || `https://ui-avatars.com/api/?name=${employee.firstName}+${employee.lastName}&background=random`} 
                  alt="" 
                />
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-slate-900">{employee.firstName} {employee.lastName}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 text-sm text-slate-500 mt-1">
                    <span className="font-mono text-slate-600 bg-slate-100 px-1.5 rounded">{employee.employeeCode}</span>
                    <span className="flex items-center"><Briefcase className="w-3 h-3 mr-1"/> {getDesigName(employee.designationId)}</span>
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> {getBranchName(employee.branchId)}</span>
                  </div>
                </div>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col items-end">
               <span className={`px-3 py-1 rounded-full text-sm font-medium
                  ${employee.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    employee.status === 'Probation' ? 'bg-blue-100 text-blue-800' : 
                    'bg-slate-100 text-slate-800'}`}>
                  {employee.status}
                </span>
                <div className="text-xs text-slate-400 mt-1">Joined: {employee.joiningDate}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-t border-slate-100 flex space-x-6 overflow-x-auto custom-scrollbar">
          <button onClick={() => setActiveTab('basic')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'basic' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Basic Info</button>
          <button onClick={() => setActiveTab('employment')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'employment' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Employment</button>
          <button onClick={() => setActiveTab('personal')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'personal' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Personal & Family</button>
          {showBankTab && <button onClick={() => setActiveTab('bank')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'bank' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Bank & Payroll</button>}
          <button onClick={() => setActiveTab('education')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'education' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Education</button>
          <button onClick={() => setActiveTab('documents')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'documents' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Documents</button>
          {showRequestsTab && <button onClick={() => setActiveTab('requests')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'requests' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>My Requests</button>}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
        {activeTab === 'basic' && (
          <BasicInfoTab 
            employee={employee} 
            isReadOnly={!canEditDirectly} 
            onSave={handleSave} 
            isSelfService={canRequestChange}
            onRequestChange={handleRequestChangeTrigger}
          />
        )}
        {activeTab === 'employment' && (
          <EmploymentTab 
            employee={employee} 
            isReadOnly={!canEditDirectly} 
            onSave={handleSave} 
          />
        )}
        {activeTab === 'personal' && (
          <PersonalTab 
            employee={employee} 
            isReadOnly={!canEditDirectly} 
            onSave={handleSave}
            isSelfService={canRequestChange}
            onRequestChange={handleRequestChangeTrigger}
          />
        )}
        {activeTab === 'bank' && showBankTab && (
           <BankTab employee={employee} isReadOnly={!canEditDirectly} onSave={handleSave} />
        )}
        {activeTab === 'education' && (
           <EducationTab employee={employee} isReadOnly={!canEditDirectly} onSave={handleSave} />
        )}
        {activeTab === 'documents' && (
           <DocumentsTab employee={employee} isReadOnly={!canEditDirectly} onSave={handleSave} />
        )}
        {activeTab === 'requests' && showRequestsTab && (
           <MyRequestsTab employeeId={employee.id} />
        )}
      </div>

      {/* Request Modal */}
      {isRequestModalOpen && (
        <RequestChangeModal 
          label={requestLabel}
          currentValue={currentValue}
          onClose={() => setIsRequestModalOpen(false)}
          onSubmit={handleSubmitRequest}
        />
      )}
    </div>
  );
};

const MyRequestsTab = ({ employeeId }: { employeeId: string }) => {
  const { profileRequests } = useApp();
  const myRequests = profileRequests.filter(r => r.employeeId === employeeId);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-900">My Change Requests</h3>
      {myRequests.length === 0 ? (
        <div className="text-slate-500 text-center py-8">No active requests.</div>
      ) : (
        <div className="overflow-hidden border border-slate-200 rounded-lg">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Changes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Remarks</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {myRequests.map(req => (
                <tr key={req.id}>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{req.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {req.changes.map((c, i) => (
                      <div key={i}>{c.label}: {c.oldValue} &rarr; <span className="font-medium text-slate-900">{c.newValue}</span></div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(req.requestedOn).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full 
                      ${req.status === ChangeRequestStatus.APPROVED ? 'bg-green-100 text-green-800' : 
                        req.status === ChangeRequestStatus.REJECTED ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{req.hrRemarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}