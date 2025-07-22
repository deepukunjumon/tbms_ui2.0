import React from "react";

const COLOR_MAP = {
    success: {
        filled: "bg-green-200 text-green-800 dark:bg-green-600 dark:text-white",
        outlined: "border border-green-500 text-green-700 bg-transparent",
    },
    error: {
        filled: "bg-red-200 text-red-800 dark:bg-red-600 dark:text-white",
        outlined: "border border-red-500 text-red-700 bg-transparent",
    },
    info: {
        filled: "bg-blue-200 text-blue-800 dark:bg-blue-600 dark:text-white",
        outlined: "border border-blue-500 text-blue-700 bg-transparent",
    },
    warning: {
        filled: "bg-yellow-200 text-yellow-800 dark:bg-yellow-600 dark:text-white",
        outlined: "border border-yellow-500 text-yellow-700 bg-transparent",
    },
};

const Chip = ({ label, color = "info", variant = "filled", className = "" }) => {
    let style = COLOR_MAP[color]?.[variant] || COLOR_MAP.info.filled;
    if (!COLOR_MAP[color]) style = color;
    return (
        <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${style} ${className}`.trim()}
        >
            {label}
        </span>
    );
};

export default Chip; 