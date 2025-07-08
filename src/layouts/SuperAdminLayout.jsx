import { MdDashboard, MdPeople, MdSettings, MdList, MdBakeryDining, MdSecurity } from "react-icons/md";
import Layout from "./Layout";

const menu = [
    { label: "Dashboard", path: "/super-admin/dashboard", icon: <MdDashboard /> },
    {
        label: "Masters",
        icon: <MdPeople />,
        children: [
            { label: "Items", path: "/super-admin/items", icon: <MdBakeryDining /> },
            { label: "Designations", path: "/super-admin/designations", icon: <MdSecurity /> },
        ],
    },
    {
        label: "Manage",
        icon: <MdSettings />,
        children: [
            { label: "Settings", path: "/super-admin/manage/settings", icon: <MdSettings /> },
            { label: "Logs", path: "/super-admin/manage/logs", icon: <MdList /> },
        ],
    },
];

export default function SuperAdminLayout() {
    return <Layout role="super_admin" menuItems={menu} />;
}
