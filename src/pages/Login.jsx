import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/Theme";
import API, { API_ENDPOINTS } from "../services/api";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { BiSun, BiMoon, BiLock } from "react-icons/bi";
import loginImage from "../assets/img/login.svg";
import Footer from "../components/Footer";
import Snackbar from "../components/Snackbar";

const Login = () => {
    const { login } = useAuth();
    const { colors, theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [snack, setSnack] = useState({ message: "", type: "success" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSnack({ message: "", type: "success" });
        setLoading(true);

        try {
            const res = await API.post(API_ENDPOINTS.LOGIN, form);
            const { token, user, message } = res.data;

            setSnack({ message: message || "Login Successful", type: "success" });

            localStorage.setItem("token", token);

            setTimeout(() => {
                login(user);

                const roleRedirectMap = {
                    super_admin: "/super-admin/dashboard",
                    admin: "/admin/dashboard",
                    branch: "/branch/dashboard",
                };

                const redirectTo = roleRedirectMap[user.role] || "/login";
                navigate(redirectTo);
            });
        } catch (err) {
            const apiError =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                "Login failed. Please check your credentials.";

            setSnack({ message: apiError, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Snackbar
                message={snack.message}
                type={snack.type}
                onClose={() => setSnack({ message: "", type: "success" })}
            />

            <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${theme === "dark" ? "bg-gray-950" : "bg-gradient-to-br from-blue-50 to-white"}`}>
                <div className="hidden lg:flex w-1/2 items-center justify-center p-8 bg-transparent animate-fade-in">
                    <img src={loginImage} alt="Login" className="w-[60%] max-w-md drop-shadow-xl" />
                </div>

                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 py-2 mb-14">
                    <button
                        aria-label="Toggle theme"
                        onClick={toggleTheme}
                        className="self-end mb-6 text-2xl p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                        {theme === "dark" ? (
                            <BiSun className="text-yellow-400" />
                        ) : (
                            <BiMoon className="text-blue-600" />
                        )}
                    </button>
                    {/* Brand/Logo */}
                    <div className="flex flex-col items-center gap-2 mb-8">
                        <div
                            className="p-3 rounded-full inline-block mb-2 shadow-md"
                            style={{ background: colors.primary }}
                        >
                            <BiLock className="text-white text-2xl" />
                        </div>
                        <h1 className={`text-3xl font-extrabold tracking-tight ${theme === "dark" ? "text-white" : "text-gray-900"}`}>TBMS</h1>
                        <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-[350px]">
                        <div>
                            <label htmlFor="username" className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Username</label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                placeholder="Enter your username"
                                value={form.username}
                                onChange={handleChange}
                                className={`w-full border ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400" : "border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400"} px-4 py-2.5 rounded-lg transition`}
                                style={{ outlineColor: colors.primary }}
                                required
                                autoComplete="username"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className={`w-full border ${theme === "dark" ? "border-gray-700 bg-gray-800 text-white placeholder-gray-400" : "border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400"} px-4 py-2.5 rounded-lg transition pr-10`}
                                    style={{ outlineColor: colors.primary }}
                                    required
                                    autoComplete="current-password"
                                />
                                <div
                                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <AiOutlineEyeInvisible size={22} />
                                    ) : (
                                        <AiOutlineEye size={22} />
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-lg font-semibold text-lg shadow-md transition bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70 disabled:cursor-not-allowed"
                            style={{ background: colors.primary }}
                        >
                            {loading && (
                                <svg
                                    className="w-5 h-5 animate-spin text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                </svg>
                            )}
                            {loading ? "Logging In..." : "Sign In"}
                        </button>
                    </form>

                    <div className="flex items-center justify-between mt-2 w-full max-w-[350px]">
                        {/* Replace the anchor with a button for accessibility */}
                        <button
                            type="button"
                            className="text-sm font-medium hover:underline focus:outline-none focus:underline transition"
                            style={{ color: colors.primary, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                            onClick={() => {/* handle forgot password action here */}}
                        >
                            Forgot password?
                        </button>
                        {/* Optionally, add a sign up link here */}
                    </div>
                </div>

                <div className="absolute bottom-5 w-full text-center">
                    <Footer />
                </div>
            </div>
            {/* Animations */}
            <style>{`
                .animate-fade-in {
                    animation: fadeIn 1s ease;
                }
                .animate-slide-up {
                    animation: slideUp 0.8s cubic-bezier(0.4,0,0.2,1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
};

export default Login;
