import { BiSolidDashboard, BiIntersect, BiPopsicle, BiUserPin, BiStore, BiWrench, BiGroup } from "react-icons/bi";
import Layout from "./Layout";

const menu = [
    { label: "Dashboard", path: "/super-admin/dashboard", icon: <BiSolidDashboard /> },
    {
        label: "Masters",
        icon: <BiIntersect  />,
        children: [
            { label: "Items", path: "/super-admin/items", icon: <BiPopsicle  /> },
            { label: "Designations", path: "/super-admin/designations", icon: <BiUserPin  /> },
        ],
    },
    {
        label: "Manage",
        icon: <BiWrench  />,
        children: [
            { label: "Branches", path: "/super-admin/branches", icon: <BiStore  /> },
            { label: "Employees", path: "/super-admin/employees", icon: <BiGroup /> },
        ],
    },
];

export default function SuperAdminLayout() {
    return <Layout role="super_admin" menuItems={menu} />;
}
