import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";

import SuperAdminLayout from "../layouts/SuperAdminLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

// Pages
import Dashboard from "../pages/SuperAdmin/Dashboard";
import AdminDashboard from "../pages/Admin/Dashboard";
import Items from "../pages/Common/Masters/Items";
import Designations from "../pages/Common/Masters/Designations";

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route
            element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                    <SuperAdminLayout />
                </ProtectedRoute>
            }
        >
            <Route path="/super-admin/dashboard" element={<Dashboard />} />
            <Route path="/super-admin/designations" element={<Designations />} />
            <Route path="/super-admin/items" element={<Items />} />
        </Route>

        <Route
            element={
                <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout />
                </ProtectedRoute>
            }
        >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>


        <Route path="*" element={<NotFound />} />
    </Routes>
);

export default AppRoutes;
