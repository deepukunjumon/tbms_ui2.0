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

export const importItems = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return API.post("/import/items", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

export const SAMPLE_ITEMS_FILE_URL = `${BASE_URL}/sample-files/items.xlsx`;

export default API;
