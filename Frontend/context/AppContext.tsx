import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  User,
  UserRole,
  Company,
  Employee,
  Branch,
  Department,
  Designation,
  Grade,
  CostCenter,
  ExpenseClaim,
  ExpenseCategory,
  ExpensePolicy,
  ExpensePolicyMapping,
  ExpenseAdvance,
  JobRequisition,
  JobPosition,
  Candidate,
  Interview,
  Offer,
  OnboardingRecord,
  PerformanceCycle,
  KPICategory,
  KPIType,
  ScoringModel,
  PerformanceItem,
  PerformanceMapping,
  EmployeePerformancePlan,
  AppraisalCycle,
  AppraisalForm,
  RatingBandScheme,
  FeedbackTemplate,
  RaterType,
  FeedbackQuestion,
  FeedbackTemplateMapping,
  FeedbackRequest,
  RaterAssignment,
  FeedbackResponse,
  PromotionRule,
  IncrementGuideline,
  PIProposal,
  LetterTemplate,
  GeneratedLetter,
  AttendancePolicy,
  Shift,
  WeeklyOffPattern,
  AttendanceMapping,
  DailyAttendance,
  AttendancePunches,
  GeoFenceLocation,
  RegularisationRequest,
  AttendancePayrollMapping,
  LeavePayrollSync,
  LeaveType,
  LeavePolicy,
  HolidayCalendar,
  Holiday,
  LeavePolicyMapping,
  EmployeeLeaveBalance,
  LeaveAccrualRun,
  LeaveAccrualLine,
  LeavePeriodClosure,
  LeaveRequest,
  LeaveEncashment,
  PayrollConfig,
  PayComponent,
  SalaryStructureTemplate,
  EmployeeSalaryAssignment,
  PayrollRun,
  PayrollRunLine,
  Payslip,
  PayrollJVExport,
  PFConfig,
  ESIConfig,
  PTConfig,
  PositionStatus,
  ResignationRequest,
  ExitClearanceItem,
  ExitClearanceStatus,
  ExitAsset,
  ExitHRForm,
  FnFSettlement,
} from "../types";
import {
  MOCK_EXPENSE_CLAIMS,
  MOCK_EXPENSE_ADVANCES,
  MOCK_RESIGNATIONS,
  MOCK_EXIT_CLEARANCE_ITEMS,
  MOCK_FNF_SETTLEMENTS,
} from "../constants";
import {
  companyService,
  authService,
  employeeService,
  orgService,
} from "../services/api";

interface AppContextType {
  currentUser: User | null;
  currentTenant: Company | null;
  companies: Company[];
  deleteCompany: (id: string, tenantId: string) => void;
  userRole: UserRole;

  login: (token: string, user: User) => void;
  logout: () => void;
  switchTenant: (id: string) => void;
  switchUserRole: (role: UserRole) => void;

  // Org
  employees: Employee[];
  fetchEmployees: () => Promise<void>; // ✅ ADDED: Exposed Refresh Function
  addEmployee: (e: Employee) => void;
  updateEmployee: (e: Employee) => void;

  departments: Department[];
  addDepartment: (d: Department) => void;
  updateDepartment: (d: Department) => void;
  deleteDepartment: (id: string) => void;
  branches: Branch[];
  addBranch: (b: Branch) => void;
  updateBranch: (b: Branch) => void;
  deleteBranch: (id: string) => void;
  designations: Designation[];
  addDesignation: (d: Designation) => void;
  updateDesignation: (d: Designation) => void;
  deleteDesignation: (id: string) => void;
  grades: Grade[];
  addGrade: (g: Grade) => void;
  updateGrade: (g: Grade) => void;
  deleteGrade: (id: string) => void;
  costCenters: CostCenter[];
  addCostCenter: (c: CostCenter) => void;
  updateCostCenter: (c: CostCenter) => void;
  deleteCostCenter: (id: string) => void;
  checkEmployeeCodeExists: (code: string) => boolean;
  profileRequests: any[];
  addProfileRequest: (r: any) => void;
  approveProfileRequest: (id: string, remarks: string) => void;
  rejectProfileRequest: (id: string, remarks: string) => void;

  // Recruitment
  jobRequisitions: JobRequisition[];
  addJobRequisition: (j: JobRequisition) => void;
  updateJobRequisition: (j: JobRequisition) => void;
  approveJobRequisition: (j: JobRequisition, remarks: string) => void;
  rejectJobRequisition: (j: JobRequisition, remarks: string) => void;
  jobPositions: JobPosition[];
  updateJobPosition: (j: JobPosition) => void;
  candidates: Candidate[];
  addCandidate: (c: Candidate) => void;
  updateCandidate: (c: Candidate) => void;
  interviews: Interview[];
  addInterview: (i: Interview) => void;
  updateInterview: (i: Interview) => void;
  offers: Offer[];
  addOffer: (o: Offer) => void;
  updateOffer: (o: Offer) => void;

  // Onboarding
  onboardingRecords: OnboardingRecord[];
  addOnboarding: (o: OnboardingRecord) => void;
  updateOnboarding: (o: OnboardingRecord) => void;

  // Performance
  performanceCycles: PerformanceCycle[];
  addPerformanceCycle: (c: PerformanceCycle) => void;
  updatePerformanceCycle: (c: PerformanceCycle) => void;
  kpiCategories: KPICategory[];
  addKPICategory: (c: KPICategory) => void;
  updateKPICategory: (c: KPICategory) => void;
  kpiTypes: KPIType[];
  addKPIType: (t: KPIType) => void;
  updateKPIType: (t: KPIType) => void;
  scoringModels: ScoringModel[];
  addScoringModel: (m: ScoringModel) => void;
  updateScoringModel: (m: ScoringModel) => void;
  performanceLibrary: PerformanceItem[];
  addPerformanceItem: (i: PerformanceItem) => void;
  updatePerformanceItem: (i: PerformanceItem) => void;
  performanceMappings: PerformanceMapping[];
  addPerformanceMapping: (m: PerformanceMapping) => void;
  updatePerformanceMapping: (m: PerformanceMapping) => void;
  employeePerformancePlans: EmployeePerformancePlan[];
  getOrCreatePerformancePlan: (
    empId: string,
    cycleId: string
  ) => EmployeePerformancePlan | undefined;
  savePerformancePlan: (p: EmployeePerformancePlan) => void;
  appraisalCycles: AppraisalCycle[];
  addAppraisalCycle: (c: AppraisalCycle) => void;
  updateAppraisalCycle: (c: AppraisalCycle) => void;
  activateAppraisalCycle: (c: AppraisalCycle) => void;
  appraisalForms: AppraisalForm[];
  updateAppraisalForm: (f: AppraisalForm) => void;
  ratingSchemes: RatingBandScheme[];
  addRatingBandScheme: (s: RatingBandScheme) => void;
  updateRatingBandScheme: (s: RatingBandScheme) => void;
  feedbackTemplates: FeedbackTemplate[];
  addFeedbackTemplate: (t: FeedbackTemplate) => void;
  updateFeedbackTemplate: (t: FeedbackTemplate) => void;
  raterTypes: RaterType[];
  addRaterType: (t: RaterType) => void;
  updateRaterType: (t: RaterType) => void;
  questionBank: FeedbackQuestion[];
  addQuestion: (q: FeedbackQuestion) => void;
  updateQuestion: (q: FeedbackQuestion) => void;
  feedbackMappings: FeedbackTemplateMapping[];
  addFeedbackMapping: (m: FeedbackTemplateMapping) => void;
  updateFeedbackMapping: (m: FeedbackTemplateMapping) => void;
  feedbackRequests: FeedbackRequest[];
  addFeedbackRequest: (r: FeedbackRequest) => void;
  updateFeedbackRequest: (r: FeedbackRequest) => void;
  raterAssignments: RaterAssignment[];
  addRaterAssignment: (a: RaterAssignment) => void;
  updateRaterAssignment: (a: RaterAssignment) => void;
  feedbackResponses: FeedbackResponse[];
  submitFeedbackResponse: (r: FeedbackResponse) => void;
  promotionRules: PromotionRule[];
  addPromotionRule: (r: PromotionRule) => void;
  updatePromotionRule: (r: PromotionRule) => void;
  incrementGuidelines: IncrementGuideline[];
  addIncrementGuideline: (g: IncrementGuideline) => void;
  updateIncrementGuideline: (g: IncrementGuideline) => void;
  piProposals: PIProposal[];
  addPIProposal: (p: PIProposal) => void;
  updatePIProposal: (p: PIProposal) => void;
  approvePIProposal: (id: string, remarks: string) => void;
  rejectPIProposal: (id: string, remarks: string) => void;
  closePIProposal: (id: string) => void;
  letterTemplates: LetterTemplate[];
  addLetterTemplate: (t: LetterTemplate) => void;
  updateLetterTemplate: (t: LetterTemplate) => void;
  generatedLetters: GeneratedLetter[];
  generateLetter: (proposalId: string, templateId: string) => void;
  issueLetter: (letterId: string) => void;
  updatePayrollSyncStatus: (id: string, status: any) => void;

  // Attendance
  attendancePolicies: AttendancePolicy[];
  addAttendancePolicy: (p: AttendancePolicy) => void;
  updateAttendancePolicy: (p: AttendancePolicy) => void;
  shifts: Shift[];
  addShift: (s: Shift) => void;
  updateShift: (s: Shift) => void;
  weeklyOffPatterns: WeeklyOffPattern[];
  addWeeklyOffPattern: (p: WeeklyOffPattern) => void;
  updateWeeklyOffPattern: (p: WeeklyOffPattern) => void;
  attendanceMappings: AttendanceMapping[];
  addAttendanceMapping: (m: AttendanceMapping) => void;
  updateAttendanceMapping: (m: AttendanceMapping) => void;
  dailyAttendance: DailyAttendance[];
  addDailyAttendance: (d: DailyAttendance) => void;
  updateDailyAttendance: (d: DailyAttendance) => void;
  processAttendance: (start: string, end: string) => void;
  lockAttendance: (start: string, end: string) => void;
  attendancePunches: AttendancePunches[];
  addPunch: (
    empId: string,
    type: "IN" | "OUT",
    source: string,
    meta?: any
  ) => void;
  geoFences: GeoFenceLocation[];
  addGeoFence: (g: GeoFenceLocation) => void;
  updateGeoFence: (g: GeoFenceLocation) => void;
  deleteGeoFence: (id: string) => void;
  regularisationRequests: RegularisationRequest[];
  addRegularisationRequest: (r: RegularisationRequest) => void;
  updateRegularisationRequest: (r: RegularisationRequest) => void;
  approveRegularisation: (r: RegularisationRequest, comments: string) => void;
  rejectRegularisation: (r: RegularisationRequest, comments: string) => void;
  attendancePayrollMappings: AttendancePayrollMapping[];
  addPayrollMapping: (m: AttendancePayrollMapping) => void;
  updatePayrollMapping: (m: AttendancePayrollMapping) => void;
  attendancePayrollSummaries: any[];
  generatePayrollSummary: (
    start: string,
    end: string,
    tenantId: string
  ) => void;
  attendancePeriodClosures: any[];
  closeAttendancePeriod: (start: string, end: string, tenantId: string) => any;
  isPeriodClosed: (date: string, tenantId: string) => boolean;

  // Leave
  leaveTypes: LeaveType[];
  addLeaveType: (l: LeaveType) => void;
  updateLeaveType: (l: LeaveType) => void;
  leavePolicies: LeavePolicy[];
  addLeavePolicy: (p: LeavePolicy) => void;
  updateLeavePolicy: (p: LeavePolicy) => void;
  holidayCalendars: HolidayCalendar[];
  addHolidayCalendar: (c: HolidayCalendar) => void;
  updateHolidayCalendar: (c: HolidayCalendar) => void;
  holidays: Holiday[];
  addHoliday: (h: Holiday) => void;
  updateHoliday: (h: Holiday) => void;
  deleteHoliday: (id: string) => void;
  leavePolicyMappings: LeavePolicyMapping[];
  addLeavePolicyMapping: (m: LeavePolicyMapping) => void;
  updateLeavePolicyMapping: (m: LeavePolicyMapping) => void;
  leaveBalances: EmployeeLeaveBalance[];
  adjustLeaveBalance: (id: string, amount: number, reason: string) => void;
  leaveBalanceChangeLogs: any[];
  leaveAccrualRuns: LeaveAccrualRun[];
  leaveAccrualLines: LeaveAccrualLine[];
  triggerAccrualRun: (
    type: string,
    start: string,
    end: string,
    tenantId: string
  ) => void;
  leavePeriodClosures: LeavePeriodClosure[];
  closeLeavePeriod: (start: string, end: string, tenantId: string) => void;
  leaveRequests: LeaveRequest[];
  submitLeaveApplication: (r: LeaveRequest) => any;
  approveLeaveRequest: (r: LeaveRequest, comments: string) => void;
  rejectLeaveRequest: (r: LeaveRequest, comments: string, role: string) => void;
  approveLeaveRequestHR: (r: LeaveRequest, comments: string) => void;
  leaveEncashments: LeaveEncashment[];
  submitLeaveEncashment: (e: LeaveEncashment) => void;
  approveLeaveEncashment: (
    e: LeaveEncashment,
    approverId: string,
    comments: string
  ) => void;
  leavePayrollSyncs: LeavePayrollSync[];
  generateLeavePayrollSync: (
    start: string,
    end: string,
    month: string,
    tenantId: string
  ) => void;

  // Payroll
  payrollConfigs: PayrollConfig[];
  addPayrollConfig: (c: PayrollConfig) => void;
  updatePayrollConfig: (c: PayrollConfig) => void;
  payComponents: PayComponent[];
  addPayComponent: (c: PayComponent) => void;
  updatePayComponent: (c: PayComponent) => void;
  salaryTemplates: SalaryStructureTemplate[];
  addSalaryTemplate: (t: SalaryStructureTemplate) => void;
  updateSalaryTemplate: (t: SalaryStructureTemplate) => void;
  salaryAssignments: EmployeeSalaryAssignment[];
  assignEmployeeSalary: (
    a: EmployeeSalaryAssignment,
    templateId: string
  ) => void;
  pfConfigs: PFConfig[];
  updatePFConfig: (c: PFConfig) => void;
  esiConfigs: ESIConfig[];
  updateESIConfig: (c: ESIConfig) => void;
  ptConfigs: PTConfig[];
  updatePTConfig: (c: PTConfig) => void;
  payrollRuns: PayrollRun[];
  createPayrollRun: (month: string, start: string, end: string) => void;
  calculatePayroll: (id: string) => void;
  approvePayrollRun: (id: string) => void;
  deletePayrollRun: (id: string) => void;
  runLines: PayrollRunLine[];
  payslips: Payslip[];
  payrollJVExports: PayrollJVExport[];
  generateJVExport: (runId: string) => void;
  pfBatches: any[];
  esiBatches: any[];
  generateComplianceBatch: (type: string, runId: string) => void;

  // Expenses
  expenseCategories: ExpenseCategory[];
  addExpenseCategory: (c: ExpenseCategory) => void;
  updateExpenseCategory: (c: ExpenseCategory) => void;
  expensePolicies: ExpensePolicy[];
  addExpensePolicy: (p: ExpensePolicy) => void;
  updateExpensePolicy: (p: ExpensePolicy) => void;
  expenseMappings: ExpensePolicyMapping[];
  addExpenseMapping: (m: ExpensePolicyMapping) => void;
  updateExpenseMapping: (m: ExpensePolicyMapping) => void;
  expenseClaims: ExpenseClaim[];
  addExpenseClaim: (c: ExpenseClaim) => void;
  updateExpenseClaim: (c: ExpenseClaim) => void;
  submitExpenseClaim: (c: ExpenseClaim) => void;
  approveExpenseClaim: (
    c: ExpenseClaim,
    approverId: string,
    role: "Manager" | "HR",
    comments: string
  ) => void;
  rejectExpenseClaim: (
    c: ExpenseClaim,
    rejectorId: string,
    role: "Manager" | "HR",
    comments: string
  ) => void;
  expenseAdvances: ExpenseAdvance[];
  addExpenseAdvance: (a: ExpenseAdvance) => void;
  updateExpenseAdvance: (a: ExpenseAdvance) => void;
  approveAdvanceRequest: (
    a: ExpenseAdvance,
    approverId: string,
    role: "Manager" | "HR"
  ) => void;
  rejectAdvanceRequest: (
    a: ExpenseAdvance,
    rejectorId: string,
    role: "Manager" | "HR"
  ) => void;

  // Exit
  resignationRequests: ResignationRequest[];
  addResignationRequest: (r: ResignationRequest) => void;
  updateResignationRequest: (r: ResignationRequest) => void;
  submitResignation: (r: ResignationRequest) => void;
  approveResignation: (
    r: ResignationRequest,
    approverId: string,
    role: "Manager" | "HR",
    comments: string
  ) => void;
  rejectResignation: (
    r: ResignationRequest,
    rejectorId: string,
    role: "Manager" | "HR",
    comments: string
  ) => void;
  exitClearanceItems: ExitClearanceItem[];
  addExitClearanceItem: (i: ExitClearanceItem) => void;
  updateExitClearanceItem: (i: ExitClearanceItem) => void;
  exitClearanceStatuses: ExitClearanceStatus[];
  updateClearanceStatus: (s: ExitClearanceStatus) => void;
  exitAssets: ExitAsset[];
  addExitAsset: (a: ExitAsset) => void;
  updateExitAsset: (a: ExitAsset) => void;
  exitHRForms: ExitHRForm[];
  submitHRExitForm: (f: ExitHRForm) => void;
  initializeExitChecklist: (resignationId: string, companyId: string) => void;
  completeExit: (resignationId: string) => void;
  fnfSettlements: FnFSettlement[];
  addFnFSettlement: (f: FnFSettlement) => void;
  updateFnFSettlement: (f: FnFSettlement) => void;

  // Platform
  addCompany: (c: Company) => void;
  updateCompany: (c: Company) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function addEntity<T>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  item: T
) {
  setter((prev) => [item, ...prev]);
}

function updateEntity<T extends { id: string }>(
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  item: T
) {
  setter((prev) => prev.map((i) => (i.id === item.id ? item : i)));
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentTenant, setCurrentTenant] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  // State Definitions
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [profileRequests, setProfileRequests] = useState<any[]>([]);

  const [jobRequisitions, setJobRequisitions] = useState<JobRequisition[]>([]);
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [onboardingRecords, setOnboardingRecords] = useState<
    OnboardingRecord[]
  >([]);

  const [performanceCycles, setPerformanceCycles] = useState<
    PerformanceCycle[]
  >([]);
  const [kpiCategories, setKpiCategories] = useState<KPICategory[]>([]);
  const [kpiTypes, setKpiTypes] = useState<KPIType[]>([]);
  const [scoringModels, setScoringModels] = useState<ScoringModel[]>([]);
  const [performanceLibrary, setPerformanceLibrary] = useState<
    PerformanceItem[]
  >([]);
  const [performanceMappings, setPerformanceMappings] = useState<
    PerformanceMapping[]
  >([]);
  const [employeePerformancePlans, setEmployeePerformancePlans] = useState<
    EmployeePerformancePlan[]
  >([]);
  const [appraisalCycles, setAppraisalCycles] = useState<AppraisalCycle[]>([]);
  const [appraisalForms, setAppraisalForms] = useState<AppraisalForm[]>([]);
  const [ratingSchemes, setRatingSchemes] = useState<RatingBandScheme[]>([]);
  const [feedbackTemplates, setFeedbackTemplates] = useState<
    FeedbackTemplate[]
  >([]);
  const [raterTypes, setRaterTypes] = useState<RaterType[]>([]);
  const [questionBank, setQuestionBank] = useState<FeedbackQuestion[]>([]);
  const [feedbackMappings, setFeedbackMappings] = useState<
    FeedbackTemplateMapping[]
  >([]);
  const [feedbackRequests, setFeedbackRequests] = useState<FeedbackRequest[]>(
    []
  );
  const [raterAssignments, setRaterAssignments] = useState<RaterAssignment[]>(
    []
  );
  const [feedbackResponses, setFeedbackResponses] = useState<
    FeedbackResponse[]
  >([]);
  const [promotionRules, setPromotionRules] = useState<PromotionRule[]>([]);
  const [incrementGuidelines, setIncrementGuidelines] = useState<
    IncrementGuideline[]
  >([]);
  const [piProposals, setPiProposals] = useState<PIProposal[]>([]);
  const [letterTemplates, setLetterTemplates] = useState<LetterTemplate[]>([]);
  const [generatedLetters, setGeneratedLetters] = useState<GeneratedLetter[]>(
    []
  );

  const [attendancePolicies, setAttendancePolicies] = useState<
    AttendancePolicy[]
  >([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [weeklyOffPatterns, setWeeklyOffPatterns] = useState<
    WeeklyOffPattern[]
  >([]);
  const [attendanceMappings, setAttendanceMappings] = useState<
    AttendanceMapping[]
  >([]);
  const [dailyAttendance, setDailyAttendance] = useState<DailyAttendance[]>([]);
  const [attendancePunches, setAttendancePunches] = useState<
    AttendancePunches[]
  >([]);
  const [geoFences, setGeoFences] = useState<GeoFenceLocation[]>([]);
  const [regularisationRequests, setRegularisationRequests] = useState<
    RegularisationRequest[]
  >([]);
  const [attendancePayrollMappings, setAttendancePayrollMappings] = useState<
    AttendancePayrollMapping[]
  >([]);
  const [attendancePayrollSummaries, setAttendancePayrollSummaries] = useState<
    any[]
  >([]);
  const [attendancePeriodClosures, setAttendancePeriodClosures] = useState<
    any[]
  >([]);

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
  const [holidayCalendars, setHolidayCalendars] = useState<HolidayCalendar[]>(
    []
  );
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [leavePolicyMappings, setLeavePolicyMappings] = useState<
    LeavePolicyMapping[]
  >([]);
  const [leaveBalances, setLeaveBalances] = useState<EmployeeLeaveBalance[]>(
    []
  );
  const [leaveBalanceChangeLogs, setLeaveBalanceChangeLogs] = useState<any[]>(
    []
  );
  const [leaveAccrualRuns, setLeaveAccrualRuns] = useState<LeaveAccrualRun[]>(
    []
  );
  const [leaveAccrualLines, setLeaveAccrualLines] = useState<
    LeaveAccrualLine[]
  >([]);
  const [leavePeriodClosures, setLeavePeriodClosures] = useState<
    LeavePeriodClosure[]
  >([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveEncashments, setLeaveEncashments] = useState<LeaveEncashment[]>(
    []
  );
  const [leavePayrollSyncs, setLeavePayrollSyncs] = useState<
    LeavePayrollSync[]
  >([]);

  const [payrollConfigs, setPayrollConfigs] = useState<PayrollConfig[]>([]);
  const [payComponents, setPayComponents] = useState<PayComponent[]>([]);
  const [salaryTemplates, setSalaryTemplates] = useState<
    SalaryStructureTemplate[]
  >([]);
  const [salaryAssignments, setSalaryAssignments] = useState<
    EmployeeSalaryAssignment[]
  >([]);
  const [pfConfigs, setPfConfigs] = useState<PFConfig[]>([]);
  const [esiConfigs, setEsiConfigs] = useState<ESIConfig[]>([]);
  const [ptConfigs, setPtConfigs] = useState<PTConfig[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [runLines, setRunLines] = useState<PayrollRunLine[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [payrollJVExports, setPayrollJVExports] = useState<PayrollJVExport[]>(
    []
  );
  const [pfBatches, setPfBatches] = useState<any[]>([]);
  const [esiBatches, setEsiBatches] = useState<any[]>([]);

  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(
    []
  );
  const [expensePolicies, setExpensePolicies] = useState<ExpensePolicy[]>([]);
  const [expenseMappings, setExpenseMappings] = useState<
    ExpensePolicyMapping[]
  >([]);
  const [expenseClaims, setExpenseClaims] =
    useState<ExpenseClaim[]>(MOCK_EXPENSE_CLAIMS);
  const [expenseAdvances, setExpenseAdvances] = useState<ExpenseAdvance[]>(
    MOCK_EXPENSE_ADVANCES
  );

  const [resignationRequests, setResignationRequests] =
    useState<ResignationRequest[]>(MOCK_RESIGNATIONS);
  const [exitClearanceItems, setExitClearanceItems] = useState<
    ExitClearanceItem[]
  >(MOCK_EXIT_CLEARANCE_ITEMS);
  const [exitClearanceStatuses, setExitClearanceStatuses] = useState<
    ExitClearanceStatus[]
  >([]);
  const [exitAssets, setExitAssets] = useState<ExitAsset[]>([]);
  const [exitHRForms, setExitHRForms] = useState<ExitHRForm[]>([]);
  const [fnfSettlements, setFnfSettlements] =
    useState<FnFSettlement[]>(MOCK_FNF_SETTLEMENTS);

  // Login Function
  const login = (token: string, user: User) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    window.location.href = "/#/login";
  };

  // ✅ NEW: Reusable Fetch Function for Employees
  const fetchEmployeesLogic = useCallback(async () => {
    // 1. Basic Checks
    if (!currentUser) return;

    // 🛑 2. SECURITY GUARD: Stop right here if not an Admin!
    // This prevents the "Network Request" from ever happening for employees.
    if (currentUser.role !== "COMPANY_ADMIN") {
      // Optionally clear the list so no stale data remains
      setEmployees([]);
      return;
    }

    const activeTenantId = currentUser.companyId || currentUser.tenantId;
    if (!activeTenantId) return;

    try {
      // console.log("🔄 Fetching Directory..."); // Optional Log
      const empData = await employeeService.getAll(activeTenantId);
      setEmployees(empData);
    } catch (error) {
      console.error("❌ Failed to refresh employees:", error);
    }
  }, [currentUser]); // Logic updates whenever the user changes

  // --- FETCH DATA ON LOAD ---
  useEffect(() => {
    const initData = async () => {
      const token = localStorage.getItem("token");
      const savedUserStr = localStorage.getItem("user");

      if (!token || !savedUserStr) return;

      const userObj = JSON.parse(savedUserStr);
      const activeTenantId = userObj.companyId || userObj.tenantId;

      console.log(`🚀 Initializing App for Tenant: ${activeTenantId}`);

      try {
        if (userObj.role === "SUPER_ADMIN") {
          const allCompanies = await companyService.getAll();
          setCompanies(allCompanies);
          if (allCompanies.length > 0) {
            setCurrentTenant(allCompanies[0]);
          }
        } else {
          const companyData = await companyService.getProfile(activeTenantId);
          setCurrentTenant(companyData);
          setCompanies([companyData]);
        }

        // 3. Fetch Employees (Using our new logic!)
        // calling fetchEmployeesLogic would require it to be defined outside,
        // so we just inline the initial call or use the state setter directly.
        const empData = await employeeService.getAll(activeTenantId);
        setEmployees(empData);

        // 4. Fetch Org Masters
        const orgData = await orgService.getAll();
        if (orgData) {
          setDepartments(orgData.departments || []);
          setBranches(orgData.branches || []);
          setDesignations(orgData.designations || []);
          setGrades(orgData.grades || []);
          setCostCenters(orgData.costCenters || []);
        }

        console.log("✅ All Data Loaded Successfully for:", activeTenantId);
      } catch (err) {
        console.error("❌ Data Fetch Error:", err);
      }
    };

    initData();
  }, [currentUser]);

  // --- CRUD Logic Wrappers ---

  const switchTenant = (id: string) => {
    const tenant = companies.find((c) => c.id === id);
    if (tenant) setCurrentTenant(tenant);
  };
  const switchUserRole = (role: UserRole) => {
    if (currentUser) {
      setCurrentUser((prev) => (prev ? { ...prev, role } : null));
    }
  };

  // Branch Logic
  const addBranchLogic = async (b: Branch) => {
    try {
      const newBranch = await orgService.addBranch(b);
      if (newBranch.isHeadOffice) {
        setBranches((prev) =>
          prev.map((item) => ({ ...item, isHeadOffice: false }))
        );
      }
      addEntity(setBranches, newBranch);
    } catch (error) {
      console.error("Failed to add branch", error);
      throw error;
    }
  };
  const updateBranchLogic = async (b: Branch) => {
    try {
      const updated = await orgService.updateBranch(b.id, b);
      if (updated.isHeadOffice) {
        setBranches((prev) =>
          prev.map((item) => ({ ...item, isHeadOffice: false }))
        );
      }
      updateEntity(setBranches, updated);
    } catch (error) {
      console.error("Failed to update branch", error);
      throw error;
    }
  };
  const deleteBranchLogic = async (id: string) => {
    try {
      await orgService.deleteBranch(id);
      setBranches((prev) => prev.filter((x) => x.id !== id));
    } catch (error) {
      console.error("Failed to delete branch", error);
      throw error;
    }
  };

  // Dept Logic
  const addDepartmentLogic = async (d: Department) => {
    const newDept = await orgService.addDepartment(d);
    addEntity(setDepartments, newDept);
  };
  const updateDepartmentLogic = async (d: Department) => {
    const updated = await orgService.updateDepartment(d.id, d);
    updateEntity(setDepartments, updated);
  };
  const deleteDepartmentLogic = async (id: string) => {
    await orgService.deleteDepartment(id);
    setDepartments((prev) => prev.filter((x) => x.id !== id));
  };

  // Designation Logic
  const addDesignationLogic = async (d: Designation) => {
    const newDesig = await orgService.addDesignation(d);
    addEntity(setDesignations, newDesig);
  };
  const updateDesignationLogic = async (d: Designation) => {
    const updated = await orgService.updateDesignation(d.id, d);
    updateEntity(setDesignations, updated);
  };
  const deleteDesignationLogic = async (id: string) => {
    await orgService.deleteDesignation(id);
    setDesignations((prev) => prev.filter((x) => x.id !== id));
  };

  // Grade Logic
  const addGradeLogic = async (g: Grade) => {
    const newItem = await orgService.addGrade(g);
    addEntity(setGrades, newItem);
  };
  const updateGradeLogic = async (g: Grade) => {
    const updated = await orgService.updateGrade(g.id, g);
    updateEntity(setGrades, updated);
  };
  const deleteGradeLogic = async (id: string) => {
    await orgService.deleteGrade(id);
    setGrades((p) => p.filter((x) => x.id !== id));
  };

  // Cost Center Logic
  const addCostCenterLogic = async (c: CostCenter) => {
    const newItem = await orgService.addCostCenter(c);
    addEntity(setCostCenters, newItem);
  };
  const updateCostCenterLogic = async (c: CostCenter) => {
    const updated = await orgService.updateCostCenter(c.id, c);
    updateEntity(setCostCenters, updated);
  };
  const deleteCostCenterLogic = async (id: string) => {
    await orgService.deleteCostCenter(id);
    setCostCenters((p) => p.filter((x) => x.id !== id));
  };

  // Company Logic
  const addCompanyLogic = async (c: Company) => {
    try {
      const newCompany = await companyService.create(c);
      addEntity(setCompanies, newCompany);
    } catch (error) {
      console.error("Failed to add company", error);
      throw error;
    }
  };
  const updateCompany = async (c: Company) => {
    try {
      const payload = { ...c, role: currentUser?.role };
      const targetId = c.id || c.tenantId || currentUser?.companyId;
      if (!targetId) throw new Error("Cannot update: Missing Tenant ID");

      const response = await companyService.updateProfile(targetId, payload);
      setCurrentTenant(response);
      updateEntity(setCompanies, response);
    } catch (error) {
      console.error("❌ Failed to save to database:", error);
      throw error;
    }
  };
  const deleteCompanyLogic = async (id: string, tenantId: string) => {
    try {
      await companyService.delete(tenantId);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Failed to delete company", error);
    }
  };

  // --- Logic Implementations (Simplified for brevity as they were mock/local) ---
  const submitResignation = (req: ResignationRequest) => {
    updateEntity(setResignationRequests, {
      ...req,
      status: "Submitted",
      submittedOn: new Date().toISOString(),
    });
  };
  const approveResignation = (
    req: ResignationRequest,
    approverId: string,
    role: "Manager" | "HR",
    comments: string
  ) => {
    // ... same as before
    const updates: any =
      role === "Manager"
        ? {
            status: "Manager Approved",
            managerId: approverId,
            managerActionDate: new Date().toISOString(),
            managerComment: comments,
          }
        : {
            status: "HR Approved",
            hrId: approverId,
            hrActionDate: new Date().toISOString(),
            hrComment: comments,
          };
    updateEntity(setResignationRequests, { ...req, ...updates });
  };
  const rejectResignation = (
    req: ResignationRequest,
    rejectorId: string,
    role: "Manager" | "HR",
    comments: string
  ) => {
    const updates: any =
      role === "Manager"
        ? {
            status: "Manager Rejected",
            managerId: rejectorId,
            managerActionDate: new Date().toISOString(),
            managerComment: comments,
          }
        : {
            status: "HR Rejected",
            hrId: rejectorId,
            hrActionDate: new Date().toISOString(),
            hrComment: comments,
          };
    updateEntity(setResignationRequests, { ...req, ...updates });
  };
  const initializeExitChecklist = (
    resignationId: string,
    companyId: string
  ) => {
    // ... same as before
    const existing = exitClearanceStatuses.some(
      (s) => s.resignationRequestId === resignationId
    );
    if (existing) return;
    const activeItems = exitClearanceItems.filter(
      (i) => i.companyId === companyId && i.isActive
    );
    const newStatuses: ExitClearanceStatus[] = activeItems.map((item) => ({
      id: `cs-${Date.now()}-${Math.random()}`,
      resignationRequestId: resignationId,
      departmentId: item.departmentId,
      itemName: item.itemName,
      status: "Pending",
    }));
    setExitClearanceStatuses((prev) => [...prev, ...newStatuses]);
  };
  const completeExit = (resignationId: string) => {
    const req = resignationRequests.find((r) => r.id === resignationId);
    if (req)
      updateEntity(setResignationRequests, { ...req, isExitCompleted: true });
  };
  const approveExpenseClaim = (
    claim: ExpenseClaim,
    approverId: string,
    role: "Manager" | "HR",
    comments: string
  ) => {
    // ... same as before
    updateEntity(setExpenseClaims, {
      ...claim,
      status: role === "Manager" ? "Manager Approved" : "HR Approved",
    });
  };
  const rejectExpenseClaim = (
    claim: ExpenseClaim,
    rejectorId: string,
    role: "Manager" | "HR",
    comments: string
  ) => {
    updateEntity(setExpenseClaims, { ...claim, status: "Rejected" });
  };
  const approveAdvanceRequest = (
    adv: ExpenseAdvance,
    approverId: string,
    role: "Manager" | "HR"
  ) => {
    updateEntity(setExpenseAdvances, {
      ...adv,
      status: role === "Manager" ? "Manager Approved" : "HR Approved",
    });
  };
  const rejectAdvanceRequest = (
    adv: ExpenseAdvance,
    rejectorId: string,
    role: "Manager" | "HR"
  ) => {
    updateEntity(setExpenseAdvances, { ...adv, status: "Rejected" });
  };
  const checkEmployeeCodeExists = (code: string) =>
    employees.some((e) => e.employeeCode === code);
  const getOrCreatePerformancePlan = (empId: string, cycleId: string) => {
    let plan = employeePerformancePlans.find(
      (p) => p.employeeId === empId && p.performanceCycleId === cycleId
    );
    if (!plan) {
      plan = {
        id: `plan-${Date.now()}`,
        companyId: currentTenant?.id,
        employeeId: empId,
        performanceCycleId: cycleId,
        status: "Draft",
        goals: [],
        coreValues: [],
        createdAt: new Date().toISOString(),
        createdBy: "System",
      };
      setEmployeePerformancePlans((prev) => [...prev, plan!]);
    }
    return plan;
  };
  const approveJobRequisition = (j: JobRequisition, remarks: string) => {
    updateEntity(setJobRequisitions, {
      ...j,
      status: "Approved",
      approvedBy: currentUser?.name || "Admin",
      approvalDate: new Date().toISOString(),
      approvalRemarks: remarks,
    });
    // ... same logic for adding JobPosition
    const newPos: JobPosition = {
      id: `pos-${Date.now()}`,
      requisitionId: j.id,
      companyId: j.companyId,
      positionCode: `POS-${j.requisitionCode}`,
      title: j.title,
      departmentId: j.departmentId,
      branchId: j.branchId,
      hiringManagerId: j.hiringManagerId,
      approvedHeadcount: j.requestedHeadcount,
      openHeadcount: j.requestedHeadcount,
      filledHeadcount: 0,
      status: PositionStatus.OPEN,
      jobSummary: j.jobSummary || "",
      responsibilities: j.responsibilities || "",
      requiredSkills: j.requiredSkills || "",
      experienceRange: j.experienceRange || "",
      employmentType: j.employmentType,
      budgetedCtcRange: j.budgetedCtcRange,
      createdAt: new Date().toISOString(),
      createdBy: "System",
    };
    addEntity(setJobPositions, newPos);
  };
  const rejectJobRequisition = (j: JobRequisition, remarks: string) => {
    updateEntity(setJobRequisitions, {
      ...j,
      status: "Rejected",
      approvedBy: currentUser?.name || "Admin",
      approvalDate: new Date().toISOString(),
      approvalRemarks: remarks,
    });
  };
  const addPunch = (
    empId: string,
    type: "IN" | "OUT",
    source: string,
    meta?: any
  ) => {
    addEntity(setAttendancePunches, {
      id: `punch-${Date.now()}`,
      companyId: currentTenant?.id,
      employeeId: empId,
      attendanceDate: new Date().toISOString().split("T")[0],
      punchTime: new Date().toISOString(),
      type,
      source,
      ...meta,
    });
  };
  const isPeriodClosed = (date: string, tenantId: string) =>
    attendancePeriodClosures.some(
      (c) =>
        c.companyId === tenantId &&
        date >= c.periodStartDate &&
        date <= c.periodEndDate
    );

  // Placeholders
  const processAttendance = () => {};
  const lockAttendance = () => {};
  const generatePayrollSummary = () => {};
  const closeAttendancePeriod = () => ({ message: "Closed" });
  const adjustLeaveBalance = () => {};
  const triggerAccrualRun = () => {};
  const closeLeavePeriod = () => {};
  const submitLeaveApplication = () => ({ success: true });
  const generateLeavePayrollSync = () => {};
  const createPayrollRun = () => {};
  const calculatePayroll = () => {};
  const approvePayrollRun = () => {};
  const deletePayrollRun = () => {};
  const generateJVExport = () => {};
  const generateComplianceBatch = () => {};
  const approveLeaveRequest = () => {};
  const rejectLeaveRequest = () => {};
  const approveLeaveRequestHR = () => {};
  const submitLeaveEncashment = () => {};
  const approveLeaveEncashment = () => {};
  const assignEmployeeSalary = () => {};
  const updatePFConfig = (c: PFConfig) =>
    setPfConfigs((prev) => prev.map((p) => (p.id === c.id ? c : p)));
  const updateESIConfig = (c: ESIConfig) =>
    setEsiConfigs((prev) => prev.map((p) => (p.id === c.id ? c : p)));
  const updatePTConfig = (c: PTConfig) =>
    setPtConfigs((prev) => prev.map((p) => (p.id === c.id ? c : p)));
  const activateAppraisalCycle = () => {};
  const approvePIProposal = () => {};
  const rejectPIProposal = () => {};
  const closePIProposal = () => {};
  const generateLetter = () => {};
  const issueLetter = () => {};
  const updatePayrollSyncStatus = () => {};

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentTenant,
        companies,
        userRole: currentUser?.role || UserRole.COMPANY_ADMIN,
        switchTenant,
        switchUserRole,
        login,
        logout,

        employees,
        fetchEmployees: fetchEmployeesLogic, // ✅ EXPOSED
        addEmployee: (e) => addEntity(setEmployees, e),
        updateEmployee: (e) => updateEntity(setEmployees, e),

        departments,
        addDepartment: addDepartmentLogic,
        updateDepartment: updateDepartmentLogic,
        deleteDepartment: deleteDepartmentLogic,
        branches,
        addBranch: addBranchLogic,
        updateBranch: updateBranchLogic,
        deleteBranch: deleteBranchLogic,
        designations,
        addDesignation: addDesignationLogic,
        updateDesignation: updateDesignationLogic,
        deleteDesignation: deleteDesignationLogic,
        grades,
        addGrade: addGradeLogic,
        updateGrade: updateGradeLogic,
        deleteGrade: deleteGradeLogic,

        costCenters,
        addCostCenter: addCostCenterLogic,
        updateCostCenter: updateCostCenterLogic,
        deleteCostCenter: deleteCostCenterLogic,
        profileRequests,
        addProfileRequest: (r) => addEntity(setProfileRequests, r),
        approveProfileRequest: () => {},
        rejectProfileRequest: () => {},

        jobRequisitions,
        addJobRequisition: (j) => addEntity(setJobRequisitions, j),
        updateJobRequisition: (j) => updateEntity(setJobRequisitions, j),
        approveJobRequisition,
        rejectJobRequisition,
        jobPositions,
        updateJobPosition: (j) => updateEntity(setJobPositions, j),
        candidates,
        addCandidate: (c) => addEntity(setCandidates, c),
        updateCandidate: (c) => updateEntity(setCandidates, c),
        interviews,
        addInterview: (i) => addEntity(setInterviews, i),
        updateInterview: (i) => updateEntity(setInterviews, i),
        offers,
        addOffer: (o) => addEntity(setOffers, o),
        updateOffer: (o) => updateEntity(setOffers, o),

        onboardingRecords,
        addOnboarding: (o) => addEntity(setOnboardingRecords, o),
        updateOnboarding: (o) => updateEntity(setOnboardingRecords, o),

        performanceCycles,
        addPerformanceCycle: (c) => addEntity(setPerformanceCycles, c),
        updatePerformanceCycle: (c) => updateEntity(setPerformanceCycles, c),
        kpiCategories,
        addKPICategory: (c) => addEntity(setKpiCategories, c),
        updateKPICategory: (c) => updateEntity(setKpiCategories, c),
        kpiTypes,
        addKPIType: (t) => addEntity(setKpiTypes, t),
        updateKPIType: (t) => updateEntity(setKpiTypes, t),
        scoringModels,
        addScoringModel: (m) => addEntity(setScoringModels, m),
        updateScoringModel: (m) => updateEntity(setScoringModels, m),
        performanceLibrary,
        addPerformanceItem: (i) => addEntity(setPerformanceLibrary, i),
        updatePerformanceItem: (i) => updateEntity(setPerformanceLibrary, i),
        performanceMappings,
        addPerformanceMapping: (m) => addEntity(setPerformanceMappings, m),
        updatePerformanceMapping: (m) =>
          updateEntity(setPerformanceMappings, m),
        employeePerformancePlans,
        getOrCreatePerformancePlan,
        savePerformancePlan: (p) =>
          updateEntity(setEmployeePerformancePlans, p),
        appraisalCycles,
        addAppraisalCycle: (c) => addEntity(setAppraisalCycles, c),
        updateAppraisalCycle: (c) => updateEntity(setAppraisalCycles, c),
        activateAppraisalCycle,
        appraisalForms,
        updateAppraisalForm: (f) => updateEntity(setAppraisalForms, f),
        ratingSchemes,
        addRatingBandScheme: (s) => addEntity(setRatingSchemes, s),
        updateRatingBandScheme: (s) => updateEntity(setRatingSchemes, s),
        feedbackTemplates,
        addFeedbackTemplate: (t) => addEntity(setFeedbackTemplates, t),
        updateFeedbackTemplate: (t) => updateEntity(setFeedbackTemplates, t),
        raterTypes,
        addRaterType: (t) => addEntity(setRaterTypes, t),
        updateRaterType: (t) => updateEntity(setRaterTypes, t),
        questionBank,
        addQuestion: (q) => addEntity(setQuestionBank, q),
        updateQuestion: (q) => updateEntity(setQuestionBank, q),
        feedbackMappings,
        addFeedbackMapping: (m) => addEntity(setFeedbackMappings, m),
        updateFeedbackMapping: (m) => updateEntity(setFeedbackMappings, m),
        feedbackRequests,
        addFeedbackRequest: (r) => addEntity(setFeedbackRequests, r),
        updateFeedbackRequest: (r) => updateEntity(setFeedbackRequests, r),
        raterAssignments,
        addRaterAssignment: (a) => addEntity(setRaterAssignments, a),
        updateRaterAssignment: (a) => updateEntity(setRaterAssignments, a),
        feedbackResponses,
        submitFeedbackResponse: (r) => addEntity(setFeedbackResponses, r),
        promotionRules,
        addPromotionRule: (r) => addEntity(setPromotionRules, r),
        updatePromotionRule: (r) => updateEntity(setPromotionRules, r),
        incrementGuidelines,
        addIncrementGuideline: (g) => addEntity(setIncrementGuidelines, g),
        updateIncrementGuideline: (g) =>
          updateEntity(setIncrementGuidelines, g),
        piProposals,
        addPIProposal: (p) => addEntity(setPiProposals, p),
        updatePIProposal: (p) => updateEntity(setPiProposals, p),
        approvePIProposal,
        rejectPIProposal,
        closePIProposal,
        letterTemplates,
        addLetterTemplate: (t) => addEntity(setLetterTemplates, t),
        updateLetterTemplate: (t) => updateEntity(setLetterTemplates, t),
        generatedLetters,
        generateLetter,
        issueLetter,
        updatePayrollSyncStatus,

        attendancePolicies,
        addAttendancePolicy: (p) => addEntity(setAttendancePolicies, p),
        updateAttendancePolicy: (p) => updateEntity(setAttendancePolicies, p),
        shifts,
        addShift: (s) => addEntity(setShifts, s),
        updateShift: (s) => updateEntity(setShifts, s),
        weeklyOffPatterns,
        addWeeklyOffPattern: (p) => addEntity(setWeeklyOffPatterns, p),
        updateWeeklyOffPattern: (p) => updateEntity(setWeeklyOffPatterns, p),
        attendanceMappings,
        addAttendanceMapping: (m) => addEntity(setAttendanceMappings, m),
        updateAttendanceMapping: (m) => updateEntity(setAttendanceMappings, m),
        dailyAttendance,
        addDailyAttendance: (d) => addEntity(setDailyAttendance, d),
        updateDailyAttendance: (d) => updateEntity(setDailyAttendance, d),
        processAttendance,
        lockAttendance,
        attendancePunches,
        addPunch,
        geoFences,
        addGeoFence: (g) => addEntity(setGeoFences, g),
        updateGeoFence: (g) => updateEntity(setGeoFences, g),
        deleteGeoFence: (id) =>
          setGeoFences((p) => p.filter((x) => x.id !== id)),
        regularisationRequests,
        addRegularisationRequest: (r) =>
          addEntity(setRegularisationRequests, r),
        updateRegularisationRequest: (r) =>
          updateEntity(setRegularisationRequests, r),
        approveRegularisation: () => {},
        rejectRegularisation: () => {},
        attendancePayrollMappings,
        addPayrollMapping: (m) => addEntity(setAttendancePayrollMappings, m),
        updatePayrollMapping: (m) =>
          updateEntity(setAttendancePayrollMappings, m),
        attendancePayrollSummaries,
        generatePayrollSummary,
        attendancePeriodClosures,
        closeAttendancePeriod,
        isPeriodClosed,

        leaveTypes,
        addLeaveType: (l) => addEntity(setLeaveTypes, l),
        updateLeaveType: (l) => updateEntity(setLeaveTypes, l),
        leavePolicies,
        addLeavePolicy: (p) => addEntity(setLeavePolicies, p),
        updateLeavePolicy: (p) => updateEntity(setLeavePolicies, p),
        holidayCalendars,
        addHolidayCalendar: (c) => addEntity(setHolidayCalendars, c),
        updateHolidayCalendar: (c) => updateEntity(setHolidayCalendars, c),
        holidays,
        addHoliday: (h) => addEntity(setHolidays, h),
        updateHoliday: (h) => updateEntity(setHolidays, h),
        deleteHoliday: (id) => setHolidays((p) => p.filter((x) => x.id !== id)),
        leavePolicyMappings,
        addLeavePolicyMapping: (m) => addEntity(setLeavePolicyMappings, m),
        updateLeavePolicyMapping: (m) =>
          updateEntity(setLeavePolicyMappings, m),
        leaveBalances,
        adjustLeaveBalance,
        leaveBalanceChangeLogs,
        leaveAccrualRuns,
        leaveAccrualLines,
        triggerAccrualRun,
        leavePeriodClosures,
        closeLeavePeriod,
        leaveRequests,
        submitLeaveApplication,
        approveLeaveRequest,
        rejectLeaveRequest,
        approveLeaveRequestHR,
        leaveEncashments,
        submitLeaveEncashment,
        approveLeaveEncashment,
        leavePayrollSyncs,
        generateLeavePayrollSync,

        payrollConfigs,
        addPayrollConfig: (c) => addEntity(setPayrollConfigs, c),
        updatePayrollConfig: (c) => updateEntity(setPayrollConfigs, c),
        payComponents,
        addPayComponent: (c) => addEntity(setPayComponents, c),
        updatePayComponent: (c) => updateEntity(setPayComponents, c),
        salaryTemplates,
        addSalaryTemplate: (t) => addEntity(setSalaryTemplates, t),
        updateSalaryTemplate: (t) => updateEntity(setSalaryTemplates, t),
        salaryAssignments,
        assignEmployeeSalary,
        pfConfigs,
        updatePFConfig,
        esiConfigs,
        updateESIConfig,
        ptConfigs,
        updatePTConfig,
        payrollRuns,
        createPayrollRun,
        calculatePayroll,
        approvePayrollRun,
        deletePayrollRun,
        runLines,
        payslips,
        payrollJVExports,
        generateJVExport,
        pfBatches,
        esiBatches,
        generateComplianceBatch,

        expenseCategories,
        addExpenseCategory: (c) => addEntity(setExpenseCategories, c),
        updateExpenseCategory: (c) => updateEntity(setExpenseCategories, c),
        expensePolicies,
        addExpensePolicy: (p) => addEntity(setExpensePolicies, p),
        updateExpensePolicy: (p) => updateEntity(setExpensePolicies, p),
        expenseMappings,
        addExpenseMapping: (m) => addEntity(setExpenseMappings, m),
        updateExpenseMapping: (m) => updateEntity(setExpenseMappings, m),
        expenseClaims,
        addExpenseClaim: (c) => addEntity(setExpenseClaims, c),
        updateExpenseClaim: (c) => updateEntity(setExpenseClaims, c),
        setExpenseClaims,
        approveExpenseClaim,
        rejectExpenseClaim,
        expenseAdvances,
        addExpenseAdvance: (a) => addEntity(setExpenseAdvances, a),
        updateExpenseAdvance: (a) => updateEntity(setExpenseAdvances, a),
        approveAdvanceRequest,
        rejectAdvanceRequest,

        resignationRequests,
        addResignationRequest: (r) => addEntity(setResignationRequests, r),
        updateResignationRequest: (r) =>
          updateEntity(setResignationRequests, r),
        submitResignation,
        approveResignation,
        rejectResignation,
        exitClearanceItems,
        addExitClearanceItem: (i) => addEntity(setExitClearanceItems, i),
        updateExitClearanceItem: (i) => updateEntity(setExitClearanceItems, i),
        exitClearanceStatuses,
        updateClearanceStatus: (s) => updateEntity(setExitClearanceStatuses, s),
        exitAssets,
        addExitAsset: (a) => addEntity(setExitAssets, a),
        updateExitAsset: (a) => updateEntity(setExitAssets, a),
        exitHRForms,
        submitHRExitForm: (f) => addEntity(setExitHRForms, f),
        initializeExitChecklist,
        completeExit,
        fnfSettlements,
        addFnFSettlement: (f) => addEntity(setFnfSettlements, f),
        updateFnFSettlement: (f) => updateEntity(setFnfSettlements, f),

        addCompany: addCompanyLogic,
        updateCompany,
        deleteCompany: deleteCompanyLogic,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
