import axios from "axios";


const API = axios.create({
    baseURL: "https://api-tbms.up.railway.app/api",
});

export const API_ENDPOINTS = {
    LOGIN: "/login",
    LOGOUT: "/logout",

    ITEMS: "/items",
    ITEM_UPDATE: "/item/update",
    DESIGNATIONS: "/designations",
    DESIGNATION_UPDATE: "/designation/update",
    ADMIN_DASHBOARD_STATS: "/admin/dashboard/stats",
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
    return API.post("/item/update-status", { id, status });
};

// Designations API
export const getDesignations = (params = {}, config = {}) =>
    API.get(API_ENDPOINTS.DESIGNATIONS, { params, ...config });

export const updateDesignation = (id, changes) =>
    API.put(`${API_ENDPOINTS.DESIGNATION_UPDATE}/${id}`, changes);

export const updateDesignationStatus = (id, status) =>
    API.post("/designation/update-status", { id, status });

export const createDesignation = (designation) =>
    API.post("/create/designation", { designation });

export const createItem = (item) =>
    API.post("/create/item", item);

export default API;
