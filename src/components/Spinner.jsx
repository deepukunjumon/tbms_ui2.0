import React from "react";

const Spinner = ({ size = 48, color = "#14b8a6", className = "", style = {} }) => {
    const ringStyle = {
        width: size,
        height: size,
        borderTopColor: color,
    };

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 bg-white/40 dark:bg-black/30 backdrop-blur-sm ${className}`}
            style={style}
        >
            <div
                className="animate-spin rounded-full border-4 border-gray-200"
                style={ringStyle}
            ></div>
        </div>
    );
};

export default Spinner;
