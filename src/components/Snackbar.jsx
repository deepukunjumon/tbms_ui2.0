import { useEffect } from "react";

const Snackbar = ({ message, type = "success", onClose, duration = 2500 }) => {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    const isError = type === "error";

    const Icon = isError ? (
        <svg
            className="w-5 h-5 text-red-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    ) : (
        <svg
            className="w-5 h-5 text-green-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
            />
        </svg>
    );

    return (
        <div
            className={`fixed top-5 right-5 z-100 flex items-center gap-3 min-w-[250px] max-w-xs px-4 py-3 shadow-lg rounded-lg animate-slideIn backdrop-blur-xl
            ${isError
                    ? "bg-red-100 bg-opacity-50 border-red-400 text-red-800 border-l-4 dark:bg-red-900 dark:bg-opacity-70 dark:border-red-600 dark:text-red-100"
                    : "bg-green-100 bg-opacity-50 border-green-400 text-green-800 border-l-4 dark:bg-green-900 dark:bg-opacity-70 dark:border-green-600 dark:text-green-100"
                }`}
            role="alert"
            aria-live="assertive"
        >
            <div>{Icon}</div>
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
};

export default Snackbar;