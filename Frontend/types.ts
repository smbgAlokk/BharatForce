export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  COMPANY_ADMIN = "COMPANY_ADMIN",
  MANAGER = "MANAGER",
  EMPLOYEE = "EMPLOYEE",
}

export interface AuditFields {
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string; // Link to Employee Profile
  companyId?: string;
}

export interface Company extends AuditFields {
  id: string; // MongoDB _id
  tenantId: string; // ✅ REQUIRED: The specific Tenant ID (e.g. tenant-001)

  name: string;
  legalName?: string;
  industry?: string;
  status: "Active" | "Inactive";
  primaryColor?: string;
  logoUrl?: string;

  // Contact
  contactPerson: string;
  email: string;
  phone?: string;

  // Address
  addressLine1?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country: string;

  // Settings
  currency: string;
  timezone: string;

  // Tax
  pan?: string;
  gstin?: string;
  cin?: string;
}

// --- ORG STRUCTURE ---

export interface Branch extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  code: string;
  type?: string;
  isHeadOffice: boolean;

  city: string;
  state: string;
  country: string;
  addressLine1?: string;
  contactNumber?: string;
}

export interface Department extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  code: string;
  parentId?: string;
  headOfDepartmentId?: string;
}

export interface Designation extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  code: string;
  departmentId: string;
  level: string; // e.g. Junior, Mid, Senior
}

export interface Grade extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  level: string;
  description?: string;
}

export interface CostCenter extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  code: string;
  departmentId?: string;
  branchId?: string;
}

// --- CORE HR ---

export type EmploymentType = "Permanent" | "Contract" | "Intern" | "Consultant";
export type EmploymentStatus =
  | "Active"
  | "Probation"
  | "Notice Period"
  | "Separated"
  | "Onboarding";
export type WorkLocationType = "Onsite" | "Hybrid" | "Remote";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface EmployeeDocument extends AuditFields {
  id: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  uploadedOn: string;
  uploadedBy: string;
  customLabel?: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  notes?: string;
}

export type DocumentType =
  | "Aadhaar"
  | "PAN"
  | "Photo"
  | "Appointment Letter"
  | "Offer Letter"
  | "ID Card Copy"
  | "Previous Experience Letter"
  | "Educational Certificate"
  | "Address Proof"
  | "Bank Proof"
  | "Other";

export interface Education {
  id: string;
  degree: string;
  specialization?: string;
  institution: string;
  yearOfPassing: number;
  grade?: string;
}

export interface Experience {
  id: string;
  companyName: string;
  jobTitle: string;
  startDate: string;
  endDate?: string;
  lastCtc?: string;
  reasonForLeaving?: string;
}

export interface Employee extends AuditFields {
  id: string;
  companyId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  employeeCode: string;
  photoUrl?: string;
  role?: "EMPLOYEE" | "MANAGER" | "COMPANY_ADMIN" | "SUPER_ADMIN";

  gender?: "Male" | "Female" | "Other";
  dob?: string;
  maritalStatus?: string;
  bloodGroup?: string;

  officialEmail: string;
  personalEmail?: string;
  mobileNumber: string;

  // Employment
  joiningDate: string;
  confirmationDate?: string;
  probationPeriod: number; // months
  probationEndDate?: string;
  status: EmploymentStatus;
  employmentType: EmploymentType;
  workLocationType?: WorkLocationType;

  // Organization
  designationId?: string;
  departmentId?: string;
  branchId?: string;
  gradeId?: string;
  costCenterId?: string;
  reportingManagerId?: string;
  secondLevelManagerId?: string;

  // Addresses
  permanentAddress?: Address;
  communicationAddress?: Address;
  isCommunicationSameAsPermanent?: boolean;

  // Family
  familyDetails?: {
    fatherName?: string;
    motherName?: string;
    spouseName?: string;
    dependents?: number;
  };

  // IDs
  governmentIds?: {
    aadhaar?: string;
    pan?: string;
    passport?: string;
    drivingLicense?: string;
  };

  // Bank
  bankDetails?: {
    bankName: string;
    branchName: string;
    ifscCode: string;
    accountNumber: string;
    accountHolderName: string;
    paymentMode: PaymentMode;
  };

  // Payroll
  payrollSettings?: {
    ctc: number;
    salaryStructureId?: string;
    pfNumber?: string;
    esiNumber?: string;
    uan?: string;
    isPfEligible?: boolean;
    isEsiEligible?: boolean;
    isPtEligible?: boolean;
    isTdsEligible?: boolean;
    payrollGroup?: string; // Monthly, Weekly
    internalCode?: string;
    employeeCategory?: string;
  };

  education?: Education[];
  experience?: Experience[];
  documents?: EmployeeDocument[];

  // New field for Statutory Info separate from payrollSettings if needed
  statutoryInfo?: StatutoryInfo;
}

export interface StatutoryInfo {
  pfApplicable: boolean;
  pfNumber?: string;
  uan?: string;
  pfBasis: "Wage-based" | "Ceiling-based";

  esiApplicable: boolean;
  esiNumber?: string;

  ptApplicable: boolean;
  ptStateOverride?: string; // ID of PT Config

  lwfApplicable: boolean;
  lwfStateOverride?: string;

  tdsApplicable: boolean;
  panAvailable: boolean;
  tdsRegime?: "Old Regime" | "New Regime";
}

export type PaymentMode = "Bank Transfer" | "Cheque" | "Cash" | "Other";

export interface ProfileChangeRequest extends AuditFields {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  category:
    | "Personal Details"
    | "Contact Details"
    | "Bank Details"
    | "Family Details"
    | "IDs"
    | "Address";
  status: ChangeRequestStatus;
  requestedOn: string;
  requestedBy: string;
  actionedBy?: string;
  actionedOn?: string;
  hrRemarks?: string;
  changes: {
    field: string; // e.g. "mobileNumber" or "address.city"
    oldValue: any;
    newValue: any;
    label: string;
  }[];
}

export enum ChangeRequestStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

// --- ATTENDANCE ---

export type AttendanceStatus =
  | "Present"
  | "Absent"
  | "Half Day"
  | "Leave"
  | "Holiday"
  | "Weekly Off"
  | "On Duty"
  | "Work From Home";

export interface Shift extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  isNextDay: boolean;
  breakDurationMins: number;
  graceLateMins: number;
  graceEarlyMins: number;
  shiftType: ShiftType;
  isActive: boolean;
}

export type ShiftType = "Regular" | "Rotational" | "Night" | "Split";

export interface WeeklyOffPattern extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  type: WeeklyOffType;
  daysOff: string[]; // ["Sunday", "Saturday"]
  alternateWeeks?: number[]; // [2, 4] for 2nd & 4th Sat
  isActive: boolean;
}

export type WeeklyOffType = "Fixed" | "Alternate" | "Rotational";

export interface AttendancePolicy extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  description?: string;

  minHoursFullDay: string; // "09:00"
  minHoursHalfDay: string; // "04:30"

  allowManualMarking: boolean;
  graceLateMins: number;
  maxLateMarksPerMonth: number; // before deduction

  overtimeSettings?: {
    isApplicable: boolean;
    minOTMinutesPerDay: number;
    maxOTMinutesPerDay?: number;
    includeBreaks: boolean;
  };

  exceptionRules?: {
    lateComing: {
      enabled: boolean;
      graceMinutes: number;
      thresholdMinutes?: number;
      maxLateMarksPerMonth?: number;
    };
    earlyExit: {
      enabled: boolean;
      graceMinutes: number;
      thresholdMinutes?: number;
    };
    shortHours: {
      enabled: boolean;
      minFullDayMinutes: number;
      minHalfDayMinutes: number;
    };
  };

  isActive: boolean;
}

export type MappingLevel =
  | "DefaultCompany"
  | "Department"
  | "Designation"
  | "Employee"
  | "Grade";

export interface AttendanceMapping extends AuditFields {
  id: string;
  companyId: string;
  level: MappingLevel;
  entityId: string; // DeptID, EmpID etc.

  shiftId?: string;
  policyId?: string;
  weeklyOffPatternId?: string;

  effectiveFrom: string;
  isActive: boolean;
}

export interface DailyAttendance {
  id: string;
  companyId: string;
  employeeId: string;
  date: string; // YYYY-MM-DD

  shiftId?: string;
  firstIn?: string;
  lastOut?: string;
  totalWorkMinutes?: number;
  breakMinutes?: number;
  otMinutes?: number;

  status: AttendanceStatus;
  dayType: "Working" | "Weekly Off" | "Holiday";

  isLate: boolean;
  isEarlyExit: boolean;
  isRegularised: boolean;

  exceptionTags?: string[]; // ["Late", "Short Hours"]

  remarks?: string;
  source: "Biometric" | "Mobile" | "Web" | "Manual" | "Upload";

  // Processing
  processingStatus?: "Pending" | "Processed" | "Error";
  isLocked?: boolean;
}

export interface AttendancePunches {
  id: string;
  companyId: string;
  employeeId: string;
  attendanceDate: string;
  punchTime: string; // ISO
  type: "IN" | "OUT";
  source: string;

  // Geo
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  gpsStatus?: "Captured" | "Denied" | "Not Available";
  locationAddress?: string;
  isGeoFenced?: boolean;
}

export interface GeoFenceLocation extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  isActive: boolean;
}

export interface RegularisationRequest extends AuditFields {
  id: string;
  companyId: string;
  employeeId: string;
  attendanceDate: string;
  requestType: RegularisationType;
  reason: string;

  proposedFirstIn?: string;
  proposedLastOut?: string;
  proposedShiftId?: string;

  status: RequestStatus;
  managerId?: string;
  managerActionDate?: string;
  managerComments?: string;

  hrId?: string;
  hrActionDate?: string;
  hrComments?: string;
}

export type RegularisationType =
  | "Missed Punch"
  | "Wrong Time Correction"
  | "Mark Present"
  | "Work From Home"
  | "On Duty"
  | "Shift Change"
  | "Half Day";
export type RequestStatus =
  | "Draft"
  | "Pending Manager Approval"
  | "Pending HR Approval"
  | "Approved"
  | "Rejected"
  | "Cancelled";

export interface AttendancePayrollMapping extends AuditFields {
  id: string;
  companyId: string;
  attendanceStatus: AttendanceStatus;
  payrollDayType: PayrollDayType; // "Paid_Full", "Paid_Half", "LOP_Full", "LOP_Half"
  multiplier: number; // 1.0, 0.5, 0
  customCode?: string;
  notes?: string;
}

export type PayrollDayType =
  | "Paid_Full"
  | "Paid_Half"
  | "LOP_Full"
  | "LOP_Half"
  | "Paid_WeeklyOff"
  | "Paid_Holiday"
  | "Paid_OnDuty"
  | "Paid_WFH"
  | "Custom";

export interface AttendancePayrollSummary extends AuditFields {
  id: string;
  companyId: string;
  employeeId: string;
  periodStartDate: string;
  periodEndDate: string;

  totalCalendarDays: number;
  totalWorkingDays: number;

  totalPaidDays: number;
  totalLopDays: number;

  totalWeeklyOffDays: number;
  totalHolidayDays: number;
  totalOtMinutes: number;

  totalLateDays: number;
  totalShortDays: number;

  generatedOn: string;
}

export interface AttendancePeriodClosure extends AuditFields {
  id: string;
  companyId: string;
  periodStartDate: string;
  periodEndDate: string;
  status: "Closed";
  closedOn: string;
  closedBy: string;
}

// --- LEAVE ---

export enum LeaveTypeCategory {
  PAID = "Paid",
  UNPAID = "Unpaid",
  COMP_OFF = "Comp Off",
  SPECIAL = "Special",
}

export interface LeaveType extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  code: string;
  category: LeaveTypeCategory;
  description?: string;
  isPaid: boolean;
  isStatutory: boolean;
  genderRestriction?: "All" | "Male" | "Female" | "Other";
  isActive: boolean;
}

export interface LeavePolicy extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  status: "Active" | "Inactive";
  effectiveFrom: string;
  policyLines: LeavePolicyLine[];
}

export type AccrualFrequency =
  | "Monthly"
  | "Quarterly"
  | "Half-Yearly"
  | "Yearly"
  | "On DOJ Anniversary"
  | "Lump Sum";
export type AccrualMode =
  | "Start of Period"
  | "End of Period"
  | "Pro-rated by DOJ";

export interface LeavePolicyLine {
  id: string;
  leaveTypeId: string;
  entitlement: number; // days per year
  accrualFrequency: AccrualFrequency;
  accrualMode: AccrualMode;

  carryForwardAllowed: boolean;
  maxCarryForwardDays?: number;

  encashmentAllowed: boolean;
  encashmentMaxDays?: number;

  allowNegativeBalance: boolean;
  maxNegativeBalance?: number;

  halfDayAllowed: boolean;

  prorationRule?: string;
}

export interface LeavePolicyMapping extends AuditFields {
  id: string;
  companyId: string;
  level: MappingLevel | "DefaultCompany";
  entityId?: string;
  policyId: string;
  calendarId: string;
  effectiveFrom: string;
  isActive: boolean;
}

export interface HolidayCalendar extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  year: number;
  isDefault: boolean;
  branchIds?: string[];
  isActive: boolean;
}

export interface Holiday extends AuditFields {
  id: string;
  calendarId: string;
  name: string;
  date: string;
  type: "National" | "Festival" | "Restricted" | "Optional";
  isPaid: boolean;
}

export interface EmployeeLeaveBalance {
  id: string;
  companyId: string;
  employeeId: string;
  leaveTypeId: string;
  policyId: string;
  periodStartDate: string; // Year start
  periodEndDate: string; // Year end

  openingBalance: number;
  accruedTillDate: number;
  availedTillDate: number;
  encashedTillDate: number;
  carryForwardFromPrev: number;
  adjustedManually: number;

  currentBalance: number;
  isActive: boolean;
}

export enum LeaveRequestStatus {
  DRAFT = "Draft",
  PENDING_MANAGER = "Pending Manager Approval",
  PENDING_HR = "Pending HR Approval",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  CANCELLED = "Cancelled",
}

export interface LeaveApplicationDay {
  id: string;
  applicationId: string;
  date: string;
  dayType: "Working" | "Weekend" | "Holiday";
  fraction: 1.0 | 0.5; // 1 or 0.5
  session?: "First Half" | "Second Half";
  effectiveDays: number; // 1 or 0.5 or 0 if Holiday/Weekend ignored
}

export interface LeaveRequest extends AuditFields {
  id: string;
  companyId: string;
  employeeId: string;
  leaveTypeId: string;
  policyId: string;

  fromDate: string;
  toDate: string;
  isHalfDay: boolean;
  halfDaySession?: "First Half" | "Second Half";
  totalDays: number;

  reason: string;
  status: LeaveRequestStatus;

  managerId?: string;
  managerStatus?: "Pending" | "Approved" | "Rejected";
  managerComments?: string;
  managerActionDate?: string;

  hrId?: string;
  hrStatus?: "Pending" | "Approved" | "Rejected";
  hrComments?: string;
  hrActionDate?: string;

  days: LeaveApplicationDay[];
}

export interface LeaveAccrualRun extends AuditFields {
  id: string;
  companyId: string;
  runDate: string;
  periodStartDate: string;
  periodEndDate: string;
  runType: string; // Monthly, Yearly
  status: "Completed" | "Failed";
  totalEmployeesProcessed: number;
  runName: string;
}

export interface LeaveAccrualLine extends AuditFields {
  id: string;
  accrualRunId: string;
  employeeId: string;
  leaveTypeId: string;
  accrualDays: number;
  newBalance: number;
}

export interface LeavePeriodClosure extends AuditFields {
  id: string;
  companyId: string;
  periodStartDate: string;
  periodEndDate: string;
  closureRunDate: string;
  closedBy: string;
}

export interface LeaveBalanceChangeLog extends AuditFields {
  id: string;
  companyId: string;
  employeeId: string;
  leaveTypeId: string;
  changeDate: string;
  changeSource:
    | "Accrual"
    | "Manual Adjustment"
    | "Leave Application"
    | "Encashment"
    | "Carry Forward";
  referenceId?: string;
  oldBalance: number;
  newBalance: number;
  changeAmount: number;
  remarks?: string;
}

export type EncashmentStatus =
  | "Submitted"
  | "Approved"
  | "Rejected"
  | "Processed";
export type EncashmentType = "Year-End" | "Exit" | "Ad-hoc";

export interface LeaveEncashment extends AuditFields {
  id: string;
  companyId: string;
  employeeId: string;
  leaveTypeId: string;
  policyId: string;
  encashmentType: EncashmentType;

  periodStartDate: string;
  periodEndDate: string;

  eligibleDays: number;
  requestedDays: number;
  approvedDays: number;

  ratePerDay?: number;
  totalAmount?: number;

  status: EncashmentStatus;
  payrollSyncStatus: "Not Sent" | "Sent" | "Confirmed";

  approverId?: string;
  approvalDate?: string;
  remarks?: string;
}

export interface LeavePayrollSync extends AuditFields {
  id: string;
  companyId: string;
  periodStartDate: string;
  periodEndDate: string;
  payrollMonth: string; // YYYY-MM
  status: "Generated" | "Synced";
  lines?: LeavePayrollSyncLine[];
}

export interface LeavePayrollSyncLine {
  id: string;
  syncId?: string;
  employeeId: string;
  totalLopDays: number;
  totalEncashmentDays: number;
  breakdown?: string;
}

// --- PAYROLL ---

export interface PayrollConfig extends AuditFields {
  id: string;
  companyId: string;
  payrollCycle: "Monthly" | "Weekly";
  periodStartDay: number;
  periodEndDay: number;
  salaryPaymentDay: number;
  financialYearStartMonth: number;
  currency: string;

  // Statutory
  statutoryEnabled: boolean;
  pfEnabled: boolean;
  esiEnabled: boolean;
  ptEnabled: boolean;
  tdsHandling: "Simple Flat TDS" | "Full Tax Regime";

  isActive: boolean;
}

export type ComponentType = "Earning" | "Deduction" | "Reimbursement";
export type CalculationType =
  | "Flat Amount"
  | "Percentage of Basic"
  | "Percentage of CTC"
  | "Percentage of Remaining CTC";

export interface PayComponent extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  code: string;
  type: ComponentType;

  calculationType: CalculationType;
  baseComponentId?: string; // If percentage
  percentageValue?: number;

  isPartOfCtc: boolean;
  isTaxable: boolean;
  showInPayslip: boolean;

  // Statutory Link
  isStatutoryComponent?: boolean;
  statutoryType?: "PF" | "ESI" | "PT" | "TDS";

  isActive: boolean;

  // Advanced
  attendanceProration?: boolean;
  prorateForLOP?: boolean;
  calculationScope?: "Every Run" | "First Run" | "Ad-hoc";
  dependencyType?: "Independent" | "Formula";
}

export interface SalaryStructureTemplate extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
  lines: SalaryStructureLine[];
}

export type AllocationType =
  | "Percentage of CTC"
  | "Percentage of Basic"
  | "Percentage of Remaining CTC"
  | "Flat Amount (Monthly)"
  | "Flat Amount (Yearly)";

export interface SalaryStructureLine {
  id: string;
  templateId: string;
  componentId: string;
  allocationType: AllocationType;
  allocationValue: number;
  priorityOrder: number;
}

export interface EmployeeSalaryAssignment extends AuditFields {
  id: string;
  companyId: string;
  employeeId: string;
  templateId: string;

  annualCtc: number;
  monthlyGross: number;

  effectiveFrom: string;
  status: "Active" | "Inactive";

  components: {
    id: string;
    componentId: string;
    annualAmount: number;
    monthlyAmount: number;
  }[];
}

export interface PayrollRun extends AuditFields {
  id: string;
  companyId: string;
  payrollMonth: string; // e.g. "October 2023"
  payrollPeriodStart: string;
  payrollPeriodEnd: string;
  status: PayrollRunStatus;

  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;

  processedOn?: string;
  approvedOn?: string;
}

export enum PayrollRunStatus {
  DRAFT = "Draft",
  CALCULATED = "Calculated",
  APPROVED = "Approved", // Locked
  DISBURSED = "Disbursed",
}

export interface PayrollRunLine {
  id: string;
  runId: string;
  employeeId: string;
  employeeName: string;
  department: string;

  // Days
  totalDays: number;
  paidDays: number;
  lopDays: number;

  // Amounts
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;

  earnings: { componentId: string; name: string; amount: number }[];
  deductions: { componentId: string; name: string; amount: number }[];

  status: "Calculated" | "Held";
}

export interface PayrollComponentResult {
  id: string;
  runLineId: string;
  componentId: string;
  componentName: string;
  type: "Earning" | "Deduction";
  amount: number;
}

export interface Payslip {
  id: string;
  runId: string;
  employeeId: string;
  payrollMonth: string;
  generatedOn: string;
  status: PayslipStatus;

  employeeDetails: {
    name: string;
    code: string;
    department: string;
    designation: string;
    pan?: string;
    bankAccount?: string;
  };

  attendanceSummary: {
    totalDays: number;
    paidDays: number;
    lopDays: number;
  };

  earnings: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  netPay: number;
}

export enum PayslipStatus {
  GENERATED = "Generated",
  RELEASED = "Released",
  LOCKED = "Locked",
}

export interface PayrollJVExport extends AuditFields {
  id: string;
  companyId: string;
  payrollRunId: string;
  payrollMonth: string;
  totalDebit: number;
  totalCredit: number;
  status: "Generated";
  lines: PayrollJVLine[];
}

export interface PayrollJVLine {
  id: string;
  jvExportId?: string;
  glCode: string;
  glName: string;
  debitAmount: number;
  creditAmount: number;
  costCenter?: string;
}

export interface PFComplianceBatch extends AuditFields {
  id: string;
  companyId: string;
  payrollRunId: string;
  monthYear: string;
  totalAmount: number;
  lines: any[];
}

export interface ESIComplianceBatch extends AuditFields {
  id: string;
  companyId: string;
  payrollRunId: string;
  monthYear: string;
  totalAmount: number;
  lines: any[];
}

export interface PTComplianceBatch extends AuditFields {
  id: string;
  companyId: string;
  payrollRunId: string;
  monthYear: string;
  totalAmount: number;
  lines: any[];
}

export interface TDSComplianceBatch extends AuditFields {
  id: string;
  companyId: string;
  payrollRunId: string;
  monthYear: string;
  totalAmount: number;
  lines: any[];
}

// Statutory Configs
export interface PFConfig extends AuditFields {
  id: string;
  companyId: string;
  effectiveFrom: string;
  employeeContributionRate: number;
  employerContributionRate: number;
  wageCeilingAmount: number;
  restrictContributionToCeiling: boolean;
  includeAdminCharges: boolean;
  isActive: boolean;
}

export interface ESIConfig extends AuditFields {
  id: string;
  companyId: string;
  effectiveFrom: string;
  employeeContributionRate: number;
  employerContributionRate: number;
  wageCeilingAmount: number;
  isActive: boolean;
}

export interface PTConfig extends AuditFields {
  id: string;
  companyId: string;
  state: string;
  effectiveFrom: string;
  deductionFrequency: "Monthly" | "Quarterly" | "Half-Yearly" | "Yearly";
  isActive: boolean;
  slabs: {
    id: string;
    minGross: number;
    maxGross: number; // -1 for unlimited
    amount: number;
    genderApplicability: "All" | "Male" | "Female";
  }[];
}

export interface LWFConfig extends AuditFields {
  id: string;
  companyId: string;
  state: string;
  effectiveFrom: string;
  employeeContribution: number;
  employerContribution: number;
  deductionMonths: number[]; // e.g. [6, 12] for June/Dec
  isActive: boolean;
}

export interface TDSConfig extends AuditFields {
  id: string;
  companyId: string;
  financialYear: string;
  effectiveFrom: string;
  defaultRegime: "Old Regime" | "New Regime";
  isActive: boolean;
}

// --- EXPENSES ---

export interface ExpenseCategory extends AuditFields {
  id: string;
  companyId: string;
  categoryCode: string;
  categoryName: string;
  description?: string;
  isBillRequired: boolean;
  isActive: boolean;
}

export type ExpenseLimitPeriod = "Daily" | "Monthly" | "Per Request" | "Yearly";

export interface ExpensePolicyLine {
  id: string;
  policyId: string;
  categoryId: string;
  limitAmount: number; // 0 for unlimited
  limitPeriod: ExpenseLimitPeriod;
  isBillRequiredOverride?: boolean;
  remarks?: string;
}

export interface ExpensePolicy extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  currency: string;
  isActive: boolean;
}

export interface ExpensePolicyMapping extends AuditFields {
  id: string;
  companyId: string;
  level: MappingLevel | "DefaultCompany";
  entityId?: string;
  policyId: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export type ClaimStatus =
  | "Draft"
  | "Submitted"
  | "Manager Approved"
  | "HR Approved"
  | "Rejected"
  | "Paid";

export interface ExpenseClaimLine {
  id: string;
  claimId: string;
  date: string;
  categoryId: string;
  amount: number;
  description?: string;
  attachmentUrl?: string;
}

export interface ExpenseClaim extends AuditFields {
  id: string;
  companyId: string;
  employeeId: string;
  claimDate: string;
  totalAmount: number;
  status: ClaimStatus;
  submittedOn?: string;
  notes?: string;
  lines: ExpenseClaimLine[];

  // Approvals
  managerId?: string;
  managerActionDate?: string;
  managerComments?: string;

  hrId?: string;
  hrActionDate?: string;
  hrComments?: string;

  // Advance Linking
  linkedAdvanceId?: string;
  netPayable?: number;
}

export type AdvanceStatus =
  | "Draft"
  | "Submitted"
  | "Manager Approved"
  | "HR Approved"
  | "Rejected"
  | "Closed";

export interface ExpenseAdvance extends AuditFields {
  id: string;
  companyId: string;
  employeeId: string;
  amount: number;
  reason: string;
  status: AdvanceStatus;
  requestedOn: string;
  approvedOn?: string;
  approvedBy?: string;
}

// --- EXIT / RESIGNATION ---

export type ResignationStatus =
  | "Draft"
  | "Submitted"
  | "Manager Approved"
  | "Manager Rejected"
  | "HR Approved"
  | "HR Rejected";

export interface ResignationRequest extends AuditFields {
  id: string;
  companyId: string;
  employeeId: string;
  resignationDate: string;
  lastWorkingDay: string; // Proposed by employee or Final
  reason: string;
  notes?: string;

  status: ResignationStatus;

  // Approval Trail
  managerId?: string;
  managerComment?: string;
  managerActionDate?: string;

  hrId?: string;
  hrComment?: string;
  hrActionDate?: string;

  submittedOn?: string;
  isExitCompleted?: boolean;
}

export interface ExitClearanceItem extends AuditFields {
  id: string;
  companyId: string;
  departmentId: string; // Responsible Dept (e.g. IT, Admin)
  itemName: string;
  description?: string;
  isActive: boolean;
}

export interface ExitClearanceStatus {
  id: string;
  resignationRequestId: string;
  departmentId: string;
  itemName: string;
  status: "Pending" | "Cleared";
  clearedOn?: string;
  clearedBy?: string;
  remarks?: string;
}

export interface ExitAsset {
  id: string;
  resignationRequestId: string;
  assetName: string;
  status: "Pending" | "Returned";
  returnedOn?: string;
  remarks?: string;
}

export interface ExitHRForm {
  id: string;
  resignationRequestId: string;
  reasonForLeaving: string;
  feedback?: string;
  notes?: string;
  recommendation?: string;
  submittedOn: string;
  submittedBy: string;
}

export type FnFStatus = "Draft" | "Under Review" | "Finalised";

export interface FnFSettlement extends AuditFields {
  id: string;
  companyId: string;
  resignationRequestId: string;
  employeeId: string;
  lastWorkingDay: string;

  status: FnFStatus;

  totalEarnings: number;
  totalDeductions: number;
  netPayable: number;

  finalisedOn?: string;
  finalisedBy?: string;

  components: FnFComponentLine[];
  notes?: string;
}

export interface FnFComponentLine {
  id: string;
  type: "Earning" | "Deduction";
  name: string;
  amount: number;
  remarks?: string;
}

// --- RECRUITMENT ---

export interface JobRequisition extends AuditFields {
  id: string;
  companyId: string;
  requisitionCode: string;
  title: string;
  designationId: string;
  departmentId: string;
  branchId: string;

  hiringManagerId: string;
  requestedBy: string;
  requestedOn: string;

  employmentType: EmploymentType;
  requestedHeadcount: number;
  neededBy: string;

  // JD
  jobSummary?: string;
  responsibilities?: string;
  requiredSkills?: string;
  educationRequirements?: string;
  experienceRange?: string;

  // Comp
  gradeId?: string;
  locationType?: WorkLocationType;
  budgetedCtcRange?: string;
  notes?: string;

  status: RequisitionStatus;
  approvalDate?: string;
  approvedBy?: string;
  approvalRemarks?: string;
}

export enum RequisitionStatus {
  DRAFT = "Draft",
  SUBMITTED = "Submitted",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  CLOSED = "Closed",
}

export interface JobPosition extends AuditFields {
  id: string;
  requisitionId: string; // Origin
  companyId: string;
  positionCode: string;
  title: string;

  departmentId: string;
  branchId: string;
  hiringManagerId: string;

  approvedHeadcount: number;
  openHeadcount: number;
  filledHeadcount: number;

  status: PositionStatus;

  // Copy from Req
  jobSummary: string;
  responsibilities: string;
  requiredSkills: string;
  experienceRange: string;
  employmentType: string;
  budgetedCtcRange?: string;
}

export enum PositionStatus {
  OPEN = "Open",
  PAUSED = "Paused",
  CLOSED = "Closed",
}

export type CandidateStage =
  | "New / Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Hired"
  | "Rejected"
  | "Withdrawn";

export const CANDIDATE_STAGES: CandidateStage[] = [
  "New / Applied",
  "Screening",
  "Interview",
  "Offer",
  "Hired",
  "Rejected",
  "Withdrawn",
];

export interface Candidate extends AuditFields {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;

  jobPositionId: string;
  hiringManagerId: string;

  resumeUrl?: string;
  skills: string[];
  currentCompany?: string;
  currentRole?: string;
  totalExperience?: string;

  currentCtc?: string;
  expectedCtc?: string;
  noticePeriod?: string;
  currentCity?: string;

  stage: CandidateStage;
  status: "Active" | "Inactive"; // Inactive if rejected/withdrawn

  source: string;
  dateApplied: string;

  summary?: string;

  currentOfferId?: string; // If offer created
}

export type InterviewType = "Telephonic" | "Video" | "In-person";
export type InterviewStatus =
  | "Scheduled"
  | "Completed"
  | "Cancelled"
  | "No Show";

export interface Interview extends AuditFields {
  id: string;
  companyId: string;
  candidateId: string;
  jobPositionId: string;

  type: InterviewType;
  stage: CandidateStage; // Interview round e.g. Technical, HR

  scheduledAt: string; // ISO
  duration: number; // mins

  locationLink?: string; // Meet link or Room
  interviewerIds: string[];

  status: InterviewStatus;
  notes?: string;

  feedback?: Feedback[];
}

export interface Feedback {
  interviewerId: string;
  rating: number; // 1-5
  comments: string;
  recommendation: "Next Stage" | "Hire" | "Hold" | "Reject";
  submittedOn: string;
}

export interface Offer extends AuditFields {
  id: string;
  companyId: string;
  candidateId: string;
  jobPositionId: string;

  hiringManagerId: string;
  recruiterId: string;

  offerDate?: string;
  validTillDate: string;
  joiningDate: string;

  ctc: number;
  fixedPay: number;
  variablePay: number;
  joiningBonus?: number;

  letterContent: string;

  status: OfferStatus;
  responseDate?: string;
  rejectionReason?: string;

  notes?: string;
}

export type OfferStatus =
  | "Draft"
  | "Sent"
  | "Accepted"
  | "Rejected"
  | "Withdrawn"
  | "Expired";

// --- ONBOARDING ---

export interface OnboardingRecord extends AuditFields {
  id: string;
  companyId: string;
  candidateId: string;
  offerId: string;
  jobPositionId: string;

  hiringManagerId: string;

  tentativeDoj: string;
  actualDoj?: string;

  branchId?: string;
  employmentType: string;
  workLocationType: string;
  probationPeriod: number;

  status: OnboardingStatus;

  tasks: OnboardingTask[];
}

export enum OnboardingStatus {
  PLANNED = "Planned",
  JOINED = "Joined",
  DELAYED = "Delayed",
  NO_SHOW = "No Show",
  CANCELLED = "Cancelled",
}

export interface OnboardingTask {
  id: string;
  group: ChecklistGroup;
  title: string;
  description?: string;
  assignedToRole: string; // HR, IT, Manager
  assignedToUser?: string;
  dueDate?: string;
  status: "Pending" | "Completed" | "Skipped";
  completedOn?: string;
  completedBy?: string;
}

export type ChecklistGroup =
  | "HR Checklist"
  | "IT Checklist"
  | "Admin Checklist"
  | "Manager Checklist";

// --- PERFORMANCE ---

export interface PerformanceCycle extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  period: CyclePeriod; // Yearly, Half-Yearly
  status: CycleStatus; // Draft, Active, Closed
}

export type CyclePeriod = "Yearly" | "Half-Yearly" | "Quarterly";
export type CycleStatus = "Draft" | "Active" | "Closed";

export interface KPICategory extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isCoreValue: boolean; // If true, treats as Value/Competency
  isActive: boolean;
}

export interface KPIType extends AuditFields {
  id: string;
  companyId: string;
  name: string; // e.g. Quantitative, Qualitative, Project-based
  description?: string;
  isActive: boolean;
}

export interface ScoringModel extends AuditFields {
  id: string;
  companyId: string;
  name: string; // e.g. 1-5 Rating, Percentage, Yes/No
  method: ScoringMethod;
  allowWeightage: boolean;
  description?: string;
  isActive: boolean;
}

export type ScoringMethod =
  | "Rating_1_5"
  | "Rating_1_10"
  | "Percentage"
  | "Binary_Yes_No";

export interface PerformanceItem extends AuditFields {
  id: string;
  companyId: string;
  name: string; // Goal Name / Value Name
  description?: string;

  itemType: "KPI" | "CoreValue";
  categoryId: string;

  // For KPI
  kpiTypeId?: string;
  measurementCriteria?: string;
  targetUnit?: string;
  isNumericTarget?: boolean;

  // For Core Value
  behaviouralIndicators?: string;

  frequency: PerformanceFrequency;
  scoringModelId: string;
  defaultWeightage?: number;

  isActive: boolean;
}

export type PerformanceFrequency =
  | "Monthly"
  | "Quarterly"
  | "Half-Yearly"
  | "Yearly"
  | "On-demand";

export interface PerformanceMapping extends AuditFields {
  id: string;
  companyId: string;
  entityType: "Department" | "Designation" | "Grade" | "Role";
  entityId: string;

  items: MappingItem[];

  isActive: boolean;
}

export interface MappingItem {
  itemId: string;
  isMandatory: boolean;
  defaultWeightage?: number;
}

// Employee Goal Setting
export interface EmployeePerformancePlan extends AuditFields {
  id: string;
  companyId: string;
  employeeId: string;
  performanceCycleId: string;

  status: "Draft" | "Pending Approval" | "Approved" | "Active" | "Closed";

  goals: EmployeeGoal[];
  coreValues: EmployeeCoreValue[];
}

export interface EmployeeGoal {
  id: string;
  performanceItemId?: string; // Link to library if applicable
  name: string;
  description?: string;
  category: string;
  kpiType: string;

  weightage: number;
  isMandatory: boolean;

  targetValue?: number;
  targetUnit?: string;
  isNumericTarget?: boolean;

  frequency?: string;
  scoringModelId: string;

  notes?: string;
}

export interface EmployeeCoreValue {
  id: string;
  performanceItemId: string;
  name: string;
  description?: string;
  behaviouralIndicators?: string;
  weightage: number;
  isMandatory: boolean;
  scoringModelId: string;
}

// Appraisal
export interface AppraisalCycle extends AuditFields {
  id: string;
  companyId: string;
  performanceCycleId: string; // Parent Goal Cycle
  name: string; // e.g. "2023 Annual Review"
  startDate: string;
  endDate: string;

  status: "Draft" | "Active" | "Closed";

  kpiSectionWeight: number;
  coreValueSectionWeight: number;

  description?: string;
}

export interface AppraisalForm extends AuditFields {
  id: string;
  companyId: string;
  employeeId: string;
  appraisalCycleId: string;
  planId: string; // Linked goals

  status: AppraisalStatus;

  // Scores
  kpiScore?: number;
  coreValueScore?: number;
  overallScore?: number;
  overallRating?: string; // e.g. "Exceeds Expectations"
  overallBandId?: string;

  ratings?: { [itemId: string]: AppraisalItemRating }; // Keyed by Goal/Value ID

  selfAppraisal?: {
    summary?: string;
    achievements?: string;
    submittedOn?: string;
    submittedBy?: string;
  };
  managerAppraisal?: {
    summary?: string;
    recommendation?: string;
    submittedOn?: string;
    submittedBy?: string;
  };
  hrAppraisal?: {
    summary?: string;
    submittedOn?: string;
    submittedBy?: string;
  };
}

export enum AppraisalStatus {
  PENDING_SELF = "Pending Self",
  PENDING_MANAGER = "Pending Manager",
  PENDING_HR = "Pending HR",
  FINALISED = "Finalised",
}

export interface AppraisalItemRating {
  selfRating?: number;
  selfComments?: string;
  managerRating?: number;
  managerComments?: string;
  finalRating?: number;
  weightedScore?: number;
}

// 360 Feedback
export interface FeedbackTemplate extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  status: "Draft" | "Active" | "Inactive";

  raterConfigs: TemplateRaterConfig[];
  questionSets: { [raterTypeId: string]: TemplateQuestionConfig[] }; // RaterTypeID -> Questions
}

export interface TemplateRaterConfig {
  raterTypeId: string;
  minCount: number;
  maxCount?: number;
  isMandatory: boolean;
  isIncluded: boolean;
}

export interface TemplateQuestionConfig {
  questionId: string;
  isMandatory: boolean;
  order?: number;
}

export interface FeedbackQuestion extends AuditFields {
  id: string;
  companyId: string;
  text: string;
  category:
    | "Behavioural"
    | "Leadership"
    | "Core Values"
    | "KPI-related"
    | "Other";
  questionType: FeedbackQuestionType;
  ratingScaleId?: string;
  isActive: boolean;
  isMandatory?: boolean;
}

export type FeedbackQuestionType = "Rating" | "Comment" | "Rating + Comment";

export interface RaterType extends AuditFields {
  id: string;
  companyId: string;
  name: string; // Peer, Subordinate, Manager, Self, External
  isInternal: boolean;
  description?: string;
  isActive: boolean;
}

export interface FeedbackTemplateMapping extends AuditFields {
  id: string;
  companyId: string;
  entityType: "Designation" | "Grade" | "Department";
  entityId: string;
  templateId: string;
  isActive: boolean;
}

export interface FeedbackRequest extends AuditFields {
  id: string;
  companyId: string;
  appraisalCycleId: string;
  employeeId: string;
  managerId: string;
  templateId: string;

  status: FeedbackRequestStatus;
  dueDate?: string;
}

export type FeedbackRequestStatus = "Draft" | "Open" | "Closed";

export interface RaterAssignment extends AuditFields {
  id: string;
  feedbackRequestId: string;
  raterTypeId: string;

  raterEmployeeId?: string; // If internal
  externalRaterEmail?: string; // If external
  externalRaterName?: string;

  status: RaterStatus;
  invitedOn?: string;
  completedOn?: string;
}

export type RaterStatus =
  | "Pending"
  | "Invited"
  | "Started"
  | "Submitted"
  | "Declined";

export interface FeedbackResponse {
  id: string;
  feedbackRequestId: string;
  raterAssignmentId: string;

  answers: { [questionId: string]: { rating?: number; comment?: string } };
  overallComments?: string;

  submittedOn: string;
}

// Promotion & Increment
export interface RatingBandScheme extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  bands: RatingBand[];
}

export interface RatingBand {
  id: string;
  schemeId: string;
  name: string; // Outstanding
  code: string; // O
  minScore: number;
  maxScore: number;
  colorCode: string;
  createdAt?: string;
  createdBy?: string;
}

export interface PromotionRule extends AuditFields {
  id: string;
  companyId: string;
  name: string;

  fromGradeId?: string;
  toGradeId?: string;

  minRatingBandId?: string;
  minTenureMonths?: number;

  minIncrementPercent?: number;
  maxIncrementPercent?: number;

  isActive: boolean;
}

export interface IncrementGuideline extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  appraisalBandId: string; // Linked to RatingBand ID
  minPercent: number;
  maxPercent: number;
  notes?: string;
  isActive: boolean;
}

export interface PIProposal extends AuditFields {
  id: string;
  companyId: string;
  appraisalCycleId: string;
  employeeId: string;

  managerId?: string; // Initiator

  type: ProposalType;

  currentGradeId?: string;
  currentDesignationId?: string;
  currentDepartmentId?: string;
  currentCtc?: number;
  currentFixedPay?: number;
  currentVariablePay?: number;

  proposedGradeId?: string;
  proposedDesignationId?: string;
  proposedDepartmentId?: string;

  proposedCtc?: number;
  proposedFixedPay?: number;
  proposedVariablePay?: number;
  incrementPercentage?: number;

  effectiveDate?: string;

  latestAppraisalScore?: number;
  latestAppraisalBandId?: string;

  justification?: string;

  status: ProposalStatus;
  approvalStage: ApprovalStage;

  // Workflow
  managerComments?: string;
  hrComments?: string;
  managementComments?: string;

  // Closure
  letterIssued?: boolean;
  payrollSyncStatus?: PayrollSyncStatus;
  isClosed?: boolean;
}

export enum ProposalType {
  INCREMENT = "Increment",
  PROMOTION = "Promotion",
  BOTH = "Promotion + Increment",
}

export enum ProposalStatus {
  DRAFT = "Draft",
  SUBMITTED = "Submitted",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  ON_HOLD = "On Hold",
}

export enum ApprovalStage {
  DRAFT = "Draft",
  MANAGER = "Manager Review",
  HR = "HR Review",
  MANAGEMENT = "Management Approval",
  CLOSED = "Closed",
}

export type PayrollSyncStatus = "Not Sent" | "Sent" | "Confirmed";

export interface LetterTemplate extends AuditFields {
  id: string;
  companyId: string;
  name: string;
  type: ProposalType;
  bodyContent: string; // HTML/Text with placeholders
  isActive: boolean;
}

export interface GeneratedLetter extends AuditFields {
  id: string;
  companyId: string;
  employeeId: string;
  proposalId: string;
  templateId: string;

  type: ProposalType;
  content: string; // Final content
  effectiveDate: string;

  status: "Draft" | "Issued" | "Acknowledged";
  issuedOn?: string;
}
