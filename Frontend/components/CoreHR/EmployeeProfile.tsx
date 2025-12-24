import React, { useState, useEffect } from "react"; // Added useEffect
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  UserRole,
  Employee,
  ProfileChangeRequest,
  ChangeRequestStatus,
} from "../../types";
import { employeeService } from "../../services/api";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Loader2,
  User,
  AlertCircle,
} from "lucide-react";

// Import tabs...
import { BasicInfoTab } from "./Tabs/BasicInfoTab";
import { EmploymentTab } from "./Tabs/EmploymentTab";
import { PersonalTab } from "./Tabs/PersonalTab";
import { BankTab } from "./Tabs/BankTab";
import { EducationTab } from "./Tabs/EducationTab";
import { DocumentsTab } from "./Tabs/DocumentsTab";
import { RequestChangeModal } from "./RequestChangeModal";

export const EmployeeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    employees,
    designations,
    branches,
    currentUser,
    updateEmployee,
    addProfileRequest,
    currentTenant,
    profileRequests,
  } = useApp();

  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestData, setRequestData] = useState({
    category: "",
    field: "",
    label: "",
    value: null as any,
  });

  // ✅ NEW: Local State for data fetching
  const [fetchedEmployee, setFetchedEmployee] = useState<Employee | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // 1. Determine Context
  const isViewingOwnProfile = location.pathname.includes("/my-profile");

  // 2. Fetch Data Logic
  useEffect(() => {
    const loadProfile = async () => {
      setLoadingData(true);
      try {
        let data: Employee | null = null;

        // Strategy A: Try to find in Global State first (Instant Load)
        if (!isViewingOwnProfile && id) {
          data = employees.find((e) => e.id === id) || null;
        }

        // Strategy B: If not found or viewing own profile, Fetch from API
        if (!data) {
          if (isViewingOwnProfile) {
            //             // Calls: GET /api/employees/me
            data = await employeeService.getMe();
          } else if (id) {
            // Calls: GET /api/employees/detail/:id
            data = await employeeService.getById(id);
          }
        }

        setFetchedEmployee(data);
      } catch (error) {
        console.error("Profile Fetch Error:", error);
      } finally {
        setLoadingData(false);
      }
    };

    loadProfile();
  }, [id, isViewingOwnProfile, employees]); // Re-run if URL or Context changes

  // Use the fetched employee
  const employee = fetchedEmployee;

  // 3. Permissions
  const isAdmin =
    currentUser?.role === UserRole.COMPANY_ADMIN ||
    currentUser?.role === UserRole.SUPER_ADMIN;
  const isEmployee =
    currentUser?.role === UserRole.EMPLOYEE ||
    currentUser?.role === UserRole.MANAGER;

  const canEditDirectly = isAdmin && !isViewingOwnProfile; // Admins editing others
  const isReadOnly = !canEditDirectly;
  const canRequestChange = isViewingOwnProfile; // Anyone viewing their own profile can request

  const showBankTab = isAdmin || isViewingOwnProfile; // Employees can see their own bank info
  const showRequestsTab = isViewingOwnProfile;

  // Helpers
  const getDesigName = (id?: string) =>
    designations.find((d) => d.id === id)?.name || "-";
  const getBranchName = (id?: string) =>
    branches.find((b) => b.id === id)?.name || "-";

  // Loading State
  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500">Loading profile...</p>
      </div>
    );
  }

  // Error State
  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-500">
        <AlertCircle className="w-16 h-16 mb-4 text-red-300" />
        <p className="text-lg font-medium text-slate-700">Profile Not Found</p>
        <p className="text-sm">We couldn't locate the employee record.</p>
      </div>
    );
  }

  // --- Handlers ---
  const handleSave = async (updatedData: Partial<Employee>) => {
    if (!canEditDirectly) return;
    setSaving(true);
    try {
      const response = await employeeService.update(employee.id, updatedData);
      if (response.success) {
        const updated = { ...employee, ...response.data };
        updateEmployee(updated); // Update Global State
        setFetchedEmployee(updated); // Update Local State
      }
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const openRequestModal = (
    category: string,
    field: string,
    label: string,
    value: any
  ) => {
    setRequestData({ category, field, label, value });
    setIsRequestModalOpen(true);
  };

  const submitRequest = (newValue: any) => {
    if (!currentTenant || !currentUser) return;
    addProfileRequest({
      id: `req-${Date.now()}`,
      companyId: employee.companyId,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeCode: employee.employeeCode,
      category: requestData.category as any,
      status: ChangeRequestStatus.PENDING,
      requestedOn: new Date().toISOString(),
      requestedBy: currentUser.id,
      changes: [
        {
          field: requestData.field,
          oldValue: requestData.value,
          newValue,
          label: requestData.label,
        },
      ],
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
    });
    setIsRequestModalOpen(false);
    alert("Request submitted.");
  };

  // Tabs Definition
  const tabs = [
    { id: "basic", label: "Basic Info", Component: BasicInfoTab },
    { id: "employment", label: "Employment", Component: EmploymentTab },
    { id: "personal", label: "Personal & Family", Component: PersonalTab },
    {
      id: "bank",
      label: "Bank & Payroll",
      Component: BankTab,
      condition: showBankTab,
    },
    { id: "education", label: "Education", Component: EducationTab },
    { id: "documents", label: "Documents", Component: DocumentsTab },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg border border-slate-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          {!isViewingOwnProfile && (
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
                src={
                  employee.photoUrl ||
                  `https://ui-avatars.com/api/?name=${employee.firstName}+${employee.lastName}&background=random`
                }
                alt=""
              />
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-slate-900">
                  {employee.firstName} {employee.lastName}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 text-sm text-slate-500 mt-1">
                  <span className="font-mono text-slate-600 bg-slate-100 px-1.5 rounded">
                    {employee.employeeCode}
                  </span>
                  <span className="flex items-center">
                    <Briefcase className="w-3 h-3 mr-1" />{" "}
                    {getDesigName(employee.designationId)}
                  </span>
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />{" "}
                    {getBranchName(employee.branchId)}
                  </span>
                </div>
              </div>
            </div>
            {saving && (
              <div className="flex items-center text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm font-medium">
                <Loader2 className="animate-spin w-4 h-4 mr-2" /> Saving...
              </div>
            )}
          </div>
        </div>

        {/* Tab Nav */}
        <div className="px-6 border-t border-slate-100 flex space-x-6 overflow-x-auto no-scrollbar">
          {tabs.map(
            (tab) =>
              tab.condition !== false && (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              )
          )}
          {showRequestsTab && (
            <button
              onClick={() => setActiveTab("requests")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "requests"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500"
              }`}
            >
              My Requests
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="bg-white shadow rounded-lg border border-slate-200 p-6">
        {tabs.map(
          (tab) =>
            activeTab === tab.id &&
            tab.condition !== false && (
              <tab.Component
                key={tab.id}
                employee={employee}
                isReadOnly={isReadOnly}
                onSave={handleSave}
                isSelfService={canRequestChange}
                onRequestChange={openRequestModal}
              />
            )
        )}
        {activeTab === "requests" && showRequestsTab && (
          // (Assuming MyRequestsTab is defined below or imported as in previous step)
          <MyRequestsTab employeeId={employee.id} requests={profileRequests} />
        )}
      </div>

      {/* Modal */}
      {isRequestModalOpen && (
        <RequestChangeModal
          label={requestData.label}
          currentValue={requestData.value}
          onClose={() => setIsRequestModalOpen(false)}
          onSubmit={submitRequest}
        />
      )}
    </div>
  );
};

// ... (MyRequestsTab Component remains the same as previous) ...
const MyRequestsTab = ({
  employeeId,
  requests,
}: {
  employeeId: string;
  requests: ProfileChangeRequest[];
}) => {
  // ... (Use code from previous response) ...
  // Just returning empty placeholder if you don't have it handy
  if (!requests) return null;
  const myReqs = requests.filter((r) => r.employeeId === employeeId);
  return (
    <table className="min-w-full">
      <tbody className="divide-y">
        {myReqs.map((r) => (
          <tr key={r.id}>
            <td className="p-2">{r.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
