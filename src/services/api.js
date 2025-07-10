import axios from "axios";


export const BASE_URL = "https://api-tbms.up.railway.app";

const API = axios.create({
    baseURL: `${BASE_URL}/api`,
});

export const API_ENDPOINTS = {
    LOGIN: "/login",
    LOGOUT: "/logout",
    ITEMS: "/items",
    ITEM_UPDATE: "/item/update",
    ITEM_UPDATE_STATUS: "/item/update-status",
    ITEM_CREATE: "/create/item",
    ITEM_IMPORT: "/import/items",
    DESIGNATIONS: "/designations",
    DESIGNATION_UPDATE: "/designation/update",
    DESIGNATION_UPDATE_STATUS: "/designation/update-status",
    DESIGNATION_CREATE: "/create/designation",
    ADMIN_DASHBOARD_STATS: "/admin/dashboard/stats",
    BRANCHES: "/admin/branches",
    BRANCH_CREATE: "/admin/create/branch",
    BRANCH_UPDATE: "/admin/branch/update",
    EMPLOYEES: "/admin/all-employees",
    EMPLOYEE_CREATE: "/admin/create/employee",
    EMPLOYEE_UPDATE: "/employee/update",
    MINIMAL_BRANCHES: "/branches/minimal",
    ACTIVE_DESIGNATIONS: "/designations/active",
};

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const fetchAdminDashboardStats = async () => {
    return API.get(API_ENDPOINTS.ADMIN_DASHBOARD_STATS);
};

export const updateItem = async (id, changes) => {
    return API.put(`${API_ENDPOINTS.ITEM_UPDATE}/${id}`, changes);
};

export const updateItemStatus = async (id, status) => {
    return API.post(API_ENDPOINTS.ITEM_UPDATE_STATUS, { id, status });
};

export const getDesignations = (params = {}, config = {}) =>
    API.get(API_ENDPOINTS.DESIGNATIONS, { params, ...config });

export const updateDesignation = (id, changes) =>
    API.put(`${API_ENDPOINTS.DESIGNATION_UPDATE}/${id}`, changes);

export const updateDesignationStatus = (id, status) =>
    API.post(API_ENDPOINTS.DESIGNATION_UPDATE_STATUS, { id, status });

export const createDesignation = (designation) =>
    API.post(API_ENDPOINTS.DESIGNATION_CREATE, { designation });

export const createItem = (item) =>
    API.post(API_ENDPOINTS.ITEM_CREATE, item);

export const importItems = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return API.post(API_ENDPOINTS.ITEM_IMPORT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const SAMPLE_ITEMS_FILE_URL = `${BASE_URL}/sample-files/items.xlsx`;

export const getBranches = (params = {}, config = {}) =>
    API.get(API_ENDPOINTS.BRANCHES, { params, ...config });

export const createBranch = (branch) =>
    API.post(API_ENDPOINTS.BRANCH_CREATE, branch);

export const updateBranch = (id, changes) =>
    API.put(`${API_ENDPOINTS.BRANCH_UPDATE}/${id}`, changes);

export const getEmployees = (params = {}, config = {}) =>
    API.get(API_ENDPOINTS.EMPLOYEES, { params, ...config });

export const createEmployee = (employee) =>
    API.post(API_ENDPOINTS.EMPLOYEE_CREATE, employee);

export const updateEmployee = (id, changes) =>
    API.put(`${API_ENDPOINTS.EMPLOYEE_UPDATE}/${id}`, changes);

export const getMinimalBranches = (params = {}, config = {}) =>
    API.get(API_ENDPOINTS.MINIMAL_BRANCHES, { params, ...config });

export const getActiveDesignations = (params = {}, config = {}) =>
    API.get(API_ENDPOINTS.ACTIVE_DESIGNATIONS, { params, ...config });

export default API;
