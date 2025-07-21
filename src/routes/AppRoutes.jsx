import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import SuperAdminLayout from "../layouts/SuperAdminLayout";
import AdminLayout from "../layouts/AdminLayout";

// Pages
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import Dashboard from "../pages/SuperAdmin/Dashboard";
import AdminDashboard from "../pages/Admin/Dashboard";
import Items from "../pages/Common/Masters/Items";
import Designations from "../pages/Common/Masters/Designations";
import Branches from "../pages/Admin/Branches";
import Employees from "../pages/Admin/Employees"
import Profile from "../pages/Profile";

// Route Guards
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Super Admin Routes */}
        <Route
            element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                    <SuperAdminLayout />
                </ProtectedRoute>
            }
        >
            <Route index path="super-admin/dashboard" element={<Dashboard />} />
            <Route path="super-admin/designations" element={<Designations />} />
            <Route path="super-admin/items" element={<Items />} />
            <Route path="super-admin/branches" element={<Branches />} />
            <Route path="super-admin/employees" element={<Employees />} />
            <Route path="super-admin/profile" element={<Profile />} />
        </Route>

        {/* Admin Routes */}
        <Route
            element={
                <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout />
                </ProtectedRoute>
            }
        >
            <Route index path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/designations" element={<Designations />} />
            <Route path="admin/items" element={<Items />} />
            <Route path="admin/branches" element={<Branches />} />
            <Route path="admin/employees" element={<Employees />} />
            <Route path="admin/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
    </Routes>
);

export default AppRoutes;
