import axios from "axios";

// Automatically detect the IP address
const API_IP = window.location.hostname;
const API_URL = `http://${API_IP}:5000/api`;

console.log("🔗 Connecting to Backend at:", API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("⚠️ Session Expired. Logging out...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.hash.includes("/login")) {
        window.location.href = "/#/login";
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

// Helper to normalize MongoDB _id to id
const transformId = (item: any) => {
  if (!item) return item;
  const newItem = { ...item };
  if (newItem._id && !newItem.id) {
    newItem.id = newItem._id;
  }
  // Recursive transform for populated fields
  if (newItem.departmentId && typeof newItem.departmentId === "object")
    newItem.department = transformId(newItem.departmentId);
  if (newItem.branchId && typeof newItem.branchId === "object")
    newItem.branch = transformId(newItem.branchId);
  if (newItem.designationId && typeof newItem.designationId === "object")
    newItem.designation = transformId(newItem.designationId);

  return newItem;
};

// --- Employee Services ---
export const employeeService = {
  getAll: async (tenantId: string) => {
    const response = await api.get(`/employees/${tenantId}`);
    if (Array.isArray(response.data)) {
      return response.data.map(transformId);
    }
    // Handle wrapped response { success: true, data: [] }
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data.map(transformId);
    }
    return [];
  },

  create: async (data: any) => {
    const response = await api.post("/employees", data);
    // ✅ CRITICAL FIX: Return the structure { success: true, data: ... }
    // The modal relies on .success being present!
    return {
      success: true,
      data: transformId(response.data.data),
    };
  },

  update: async (id: string, data: any) => {
    // We send a PUT request to the specific employee ID
    const response = await api.put(`/employees/${id}`, data);
    return {
      success: true,
      data: transformId(response.data.data),
      message: response.data.message,
    };
  },

  delete: async (id: string) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/employees/me");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/employees/detail/${id}`);
    return response.data;
  },
};

// --- Company Services ---
export const companyService = {
  getProfile: async (tenantId: string) => {
    const response = await api.get(`/company/${tenantId}`);
    return transformId(response.data);
  },
  getAll: async () => {
    const response = await api.get("/company");
    return Array.isArray(response.data) ? response.data.map(transformId) : [];
  },
  create: async (data: any) => {
    const response = await api.post("/company/new", data);
    return transformId(response.data.data);
  },
  updateProfile: async (tenantId: string, data: any) => {
    const response = await api.put(`/company/${tenantId}`, data);
    return transformId(response.data);
  },
  delete: async (tenantId: string) => {
    const response = await api.delete(`/company/${tenantId}`);
    return response.data;
  },
};

// --- Auth Services ---
export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post("/auth/register", data);
    return response.data;
  },
  googleLogin: async (token: string) => {
    const response = await api.post("/auth/google", { token });
    return response.data;
  },
};

// --- Org Services ---
export const orgService = {
  getAll: async () => {
    const response = await api.get("/org/all");
    const data = response.data.data;
    return {
      departments: data.departments.map(transformId),
      designations: data.designations.map(transformId),
      branches: data.branches.map(transformId),
      grades: data.grades ? data.grades.map(transformId) : [],
      costCenters: data.costCenters ? data.costCenters.map(transformId) : [],
    };
  },
  addBranch: async (branch: any) => {
    const response = await api.post("/org/branches", branch);
    return transformId(response.data.data);
  },
  updateBranch: async (id: string, branch: any) => {
    const response = await api.put(`/org/branches/${id}`, branch);
    return transformId(response.data.data);
  },
  deleteBranch: async (id: string) => {
    const response = await api.delete(`/org/branches/${id}`);
    return response.data;
  },
  addDepartment: async (dept: any) => {
    const response = await api.post("/org/departments", dept);
    return transformId(response.data.data);
  },
  updateDepartment: async (id: string, dept: any) => {
    const response = await api.put(`/org/departments/${id}`, dept);
    return transformId(response.data.data);
  },
  deleteDepartment: async (id: string) => {
    const response = await api.delete(`/org/departments/${id}`);
    return response.data;
  },
  addDesignation: async (desig: any) => {
    const response = await api.post("/org/designations", desig);
    return transformId(response.data.data);
  },
  updateDesignation: async (id: string, desig: any) => {
    const response = await api.put(`/org/designations/${id}`, desig);
    return transformId(response.data.data);
  },
  deleteDesignation: async (id: string) => {
    const response = await api.delete(`/org/designations/${id}`);
    return response.data;
  },
  addGrade: async (data: any) => {
    const res = await api.post("/org/grades", data);
    return transformId(res.data.data);
  },
  updateGrade: async (id: string, data: any) => {
    const res = await api.put(`/org/grades/${id}`, data);
    return transformId(res.data.data);
  },
  deleteGrade: async (id: string) => {
    await api.delete(`/org/grades/${id}`);
    return true;
  },
  addCostCenter: async (data: any) => {
    const res = await api.post("/org/cost-centers", data);
    return transformId(res.data.data);
  },
  updateCostCenter: async (id: string, data: any) => {
    const res = await api.put(`/org/cost-centers/${id}`, data);
    return transformId(res.data.data);
  },
  deleteCostCenter: async (id: string) => {
    await api.delete(`/org/cost-centers/${id}`);
    return true;
  },
};

// --- Upload Services ---
export const uploadService = {
  // Uploads file to Cloudinary via Backend
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Deletes file from Cloudinary via Backend
  deleteFile: async (fileName: string) => {
    if (!fileName) return;
    try {
      const response = await api.post("/upload/delete", { fileName });
      return response.data;
    } catch (error) {
      console.error("Cloudinary delete failed:", error);
    }
  },

  // Helper: Just returns the URL since Cloudinary URLs are already absolute
  getDownloadUrl: (fileUrl: string) => {
    return fileUrl;
  },
};
