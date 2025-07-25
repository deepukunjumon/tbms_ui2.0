import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/Theme";
import API, { API_ENDPOINTS } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { BiMenu, BiX, BiSolidBadgeCheck } from "react-icons/bi";
import Spinner from "../components/Spinner";

const Layout = ({ role, menuItems = [] }) => {
    const { user, logout, token } = useAuth();
    const { theme, toggleTheme, colors } = useTheme();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);
    const avatarRef = useRef();
    const sidebarRef = useRef();
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (avatarRef.current && !avatarRef.current.contains(e.target)) {
                setAvatarOpen(false);
            }
            if (sidebarRef.current && !sidebarRef.current.contains(e.target) &&
                !e.target.closest('.mobile-menu-button')) {
                setMobileSidebarOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close mobile sidebar when resizing to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setMobileSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Helper for expandable menu state
    const [openMenus, setOpenMenus] = useState({});
    const handleToggleMenu = (label) => {
        setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const initials = user?.name
        ? user.name
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
        : "U";

    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            await API.post(API_ENDPOINTS.LOGOUT, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            logout();
            navigate("/login", { replace: true });
            setLogoutLoading(false);
            setShowLogoutConfirm(false);
        }
    };

    const handleProfileClick = () => {
        const adjustedRole = role === 'super_admin' ? 'super-admin' : role;
        navigate(`/${adjustedRole}/profile`);
        setAvatarOpen(false);
    };

    return (
        <div
            className="flex h-screen transition-colors duration-500"
            style={{ background: colors.background }}
        >
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            <aside
                ref={sidebarRef}
                className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out transform
                    ${collapsed ? "w-16" : "w-64"} 
                    ${mobileSidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"} 
                    md:relative md:translate-x-0 md:z-auto`}
                style={{ background: colors.sidebar, borderColor: colors.primary }}
            >
                <div
                    className="flex items-center justify-between p-4 h-14"
                >
                    {!collapsed && (
                        <span className="p-5 text-lg font-semibold text-gray-900 dark:text-white">TBMS</span>
                    )}

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hidden md:flex"
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <motion.div
                            animate={{ rotate: collapsed ? 0 : 180 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            {collapsed ? (
                                <BiMenu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                            ) : (
                                <BiX className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                            )}
                        </motion.div>
                    </button>

                    <button
                        onClick={() => setMobileSidebarOpen(false)}
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors md:hidden"
                        aria-label="Close sidebar"
                    >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none">
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                <nav className="mt-2 px-2 overflow-y-auto h-[calc(100%-4rem)]">
                    {menuItems.map((item, idx) => {
                        if (item.children && item.children.length > 0) {
                            const isOpen = openMenus[item.label];
                            return (
                                <div key={item.label}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (collapsed) setCollapsed(false);
                                            handleToggleMenu(item.label);
                                        }}
                                        className={`flex items-center w-full gap-3 px-3 py-2.5 rounded-md transition-colors mb-1
                                            text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                                        `}
                                    >
                                        <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">{item.icon}</span>
                                        {!collapsed && (
                                            <>
                                                <span className="text-sm flex-1 text-left">{item.label}</span>
                                                <svg
                                                    className={`w-4 h-4 ml-auto transition-transform ${isOpen ? "rotate-90" : ""}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </>
                                        )}
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {isOpen && !collapsed && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                className="ml-4 overflow-hidden"
                                            >
                                                {item.children.map((child) => (
                                                    <NavLink
                                                        key={child.path}
                                                        to={child.path}
                                                        onClick={() => {
                                                            if (collapsed) setCollapsed(false);
                                                            setMobileSidebarOpen(false);
                                                        }}
                                                        className={({ isActive }) =>
                                                            `flex items-center gap-3 px-3 py-2 rounded-md transition-colors mb-1
                                                            ${isActive
                                                                ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                            }`
                                                        }
                                                    >
                                                        <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">{child.icon}</span>
                                                        <span className="text-sm">{child.label}</span>
                                                    </NavLink>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        }
                        // Regular link
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => {
                                    if (collapsed) setCollapsed(false);
                                    setMobileSidebarOpen(false);
                                }}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors mb-1 ${isActive
                                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-medium"
                                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    }`
                                }
                            >
                                <span className="flex-shrink-0 text-gray-500 dark:text-gray-400">{item.icon}</span>
                                {!collapsed && <span className="text-sm">{item.label}</span>}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Navbar */}
                <header
                    className="h-14 flex items-center justify-between px-2"
                    style={{ background: colors.primary }}
                >
                    <div className="flex items-center gap-3 md:hidden">
                        <button
                            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                            className="p-1.5 rounded-md"
                            aria-label={mobileSidebarOpen ? "Close menu" : "Open menu"}
                        >
                            {mobileSidebarOpen ? (
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-2">

                    </div>


                    <div className="flex relative" ref={avatarRef}>

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="ml-4 p-2 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {theme === "dark" ? (
                                <svg className="w-5 h-5 text-yellow-400 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1M4.05 4.93l-.71-.71M21 12h-1M3 12H2m16.66 6.66l-.71-.71M4.05 19.07l-.71.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-yellow-400 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
                                </svg>
                            )}
                        </button>
                        <button
                            onClick={() => setAvatarOpen(!avatarOpen)}
                            className="flex items-center gap-2 p-1 transition-colors relative"
                            aria-label="User menu"
                        >
                            <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-medium text-sm">
                                {initials}
                            </div>
                            <div className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 bg-white rounded-full">
                                <BiSolidBadgeCheck className="text-green-500" style={{ fontSize: '1rem' }} />
                            </div>
                        </button>

                        <AnimatePresence>
                            {avatarOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg w-56 z-50 overflow-hidden"
                                >
                                    <div 
                                        className="p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                        onClick={handleProfileClick}
                                    >
                                        <p className="font-medium text-gray-900 dark:text-white">{user?.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
                                    </div>
                                    <div className="p-1">
                                        <button
                                            onClick={() => setShowLogoutConfirm(true)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md transition-all duration-200 group"
                                        >
                                            <svg
                                                className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                />
                                            </svg>
                                            <span className="flex-1 text-left">Log out</span>
                                            <svg
                                                className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </header>

                {/* Main Content */}
                <main
                    className="flex-1 overflow-y-auto"
                    style={{ background: colors.background }}
                >
                    <Outlet />
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
                    <div
                        className="rounded-lg shadow-lg p-6 w-80"
                        style={{ background: colors.card, color: colors.text }}
                    >
                        {logoutLoading ? (
                            <div className="flex flex-col items-center justify-center gap-4">
                                <Spinner />
                                <p>Logging out...</p>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-lg font-semibold mb-2">Confirm Logout</h2>
                                <p className="mb-4">Are you sure you want to log out?</p>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => setShowLogoutConfirm(false)}
                                        className="px-4 py-2 rounded-md transition"
                                        style={{ color: colors.text }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="px-4 py-2 rounded-md transition"
                                        style={{ background: colors.error, color: colors.white }}
                                    >
                                        Log out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Layout;