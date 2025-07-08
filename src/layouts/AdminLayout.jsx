import Layout from "./Layout";
const menu = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Manage Users", path: "/admin/users" },
    { label: "Settings", path: "/admin/settings" },
];

export default function SuperAdminLayout() {
    return <Layout role="admin" menuItems={menu} />;
}
