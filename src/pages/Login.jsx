import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/Theme";
import API, { API_ENDPOINTS } from "../services/api";
import { AiFillLock, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
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
            }, 1500);
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
            {/* Snackbar Notification */}
            <Snackbar
                message={snack.message}
                type={snack.type}
                onClose={() => setSnack({ message: "", type: "success" })}
            />

            {/* Login Layout */}
            <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
                {/* Illustration (hidden on mobile, visible on lg+) */}
                <div className="hidden lg:flex w-1/2 items-center justify-center p-6 bg-transparent">
                    <img src={loginImage} alt="Login" className="w-[60%] max-w-md" />
                </div>

                {/* Login Form */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md space-y-6">
                        <div className="text-center">
                            <div
                                className="p-3 rounded-full inline-block mb-3"
                                style={{ background: colors.primary }}
                            >
                                <AiFillLock className="text-white text-2xl" />
                            </div>
                            <h2 className={`text-2xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>Sign In</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={form.username}
                                onChange={handleChange}
                                className={`w-full border ${theme === "dark" ? "border-gray-700 bg-gray-900 text-white" : "border-gray-300 bg-white text-gray-900"} px-4 py-2 rounded focus:outline-none focus:ring-2`}
                                style={{
                                    outlineColor: colors.primary,
                                }}
                                required
                            />

                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={form.password}
                                    onChange={handleChange}
                                    className={`w-full border ${theme === "dark" ? "border-gray-700 bg-gray-900 text-white" : "border-gray-300 bg-white text-gray-900"} px-4 py-2 rounded focus:outline-none focus:ring-2`}
                                    style={{
                                        outlineColor: colors.primary,
                                    }}
                                    required
                                />
                                <div
                                    className="absolute right-3 top-3 cursor-pointer text-gray-500"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <AiOutlineEyeInvisible size={20} />
                                    ) : (
                                        <AiOutlineEye size={20} />
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 text-white py-2 rounded transition"
                                style={{
                                    background: colors.primary,
                                    opacity: loading ? 0.7 : 1,
                                }}
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

                        <div className="text-right">
                            <a
                                href="#"
                                className="text-sm hover:underline"
                                style={{ color: colors.primary }}
                            >
                                Forgot password?
                            </a>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-5 w-full text-center">
                    <Footer />
                </div>
            </div>
        </>
    );
};

export default Login;
