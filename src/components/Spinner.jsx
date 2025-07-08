import React from "react";
import { useTheme } from "../context/Theme";

const Spinner = ({ size = 48, color, className = "", style = {} }) => {
    const { colors } = useTheme();
    const ringStyle = {
        width: size,
        height: size,
        borderTopColor: color || colors.primary,
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
