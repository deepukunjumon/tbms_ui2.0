import { useNavigate, Link } from "react-router-dom";
import NotFoundImage from "../assets/img/404.svg";
import { useTheme } from "../context/Theme";

const NotFound = () => {
    const { colors } = useTheme();
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
            style={{ background: colors.background, color: colors.text }}
        >
            <img
                src={NotFoundImage}
                alt="Page Not Found"
                className="max-w-md w-full mb-6"
            />
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
                404 - Page Not Found
            </h1>
            <p className="mb-6" style={{ color: colors.gray[700] }}>
                Oops! The page you are looking for doesn’t exist or has been moved.
            </p>
            <Link
                onClick={() => navigate(-1)}
                className="px-6 py-2 rounded-md font-medium transition-colors"
                style={{
                    background: colors.primary,
                    color: colors.white,
                    textDecoration: "none",
                }}
                onMouseOver={e => e.currentTarget.style.background = colors.primaryDark}
                onMouseOut={e => e.currentTarget.style.background = colors.primary}
            >
                Go Back
            </Link>
        </div >
    );
};

export default NotFound;
