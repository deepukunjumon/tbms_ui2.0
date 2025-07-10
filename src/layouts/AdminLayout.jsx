import { BiSolidDashboard, BiIntersect, BiPopsicle, BiUserPin, BiStore, BiWrench, BiGroup } from "react-icons/bi";
import Layout from "./Layout";

const menu = [
    { label: "Dashboard", path: "/admin/dashboard", icon: <BiSolidDashboard /> },
    {
        label: "Masters",
        icon: <BiIntersect  />,
        children: [
            { label: "Items", path: "/admin/items", icon: <BiPopsicle  /> },
            { label: "Designations", path: "/admin/designations", icon: <BiUserPin  /> },
        ],
    },
    {
        label: "Manage",
        icon: <BiWrench  />,
        children: [
            { label: "Branches", path: "/admin/branches", icon: <BiStore  /> },
            { label: "Employees", path: "/admin/employees", icon: <BiGroup /> },
        ],
    },
];

export default function AdminLayout() {
    return <Layout role="admin" menuItems={menu} />;
}
