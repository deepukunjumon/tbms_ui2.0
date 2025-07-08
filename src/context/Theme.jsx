import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

const palette = {
    primary: "#17B8A6",
    avatar: "#25b4db",
    secondary: "#f5f5f5",
    text: "#f5f5f5",
    success: "#4CAF50",
    warning: "#de9210",
    error: "#F44336",
    white: "#FFFFFF",
    gray: {
        50: "#FAFAFA",
        100: "#FAFAFA",
        200: "#FAFAFA",
        300: "#FAFAFA",
        400: "#FAFAFA",
        500: "#FAFAFA",
        600: "#FAFAFA",
        700: "#616161",
        800: "#424242",
        900: "#212121",
    },
    spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
    },
    fontSizes: {
        sm: "0.875rem",
        base: "1rem",
        md: "1.125rem",
        lg: "1.25rem",
        xl: "1.5rem",
    },
    borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
    },
};

const themes = {
    light: {
        ...palette,
        background: "#FAFAFA",
        sidebar: "#F5F5F5",
        navbar: palette.primary,
        card: "#FFFFFF",
        text: "#212121",
    },
    dark: {
        ...palette,
        background: "#121212",
        sidebar: "#23272f",
        navbar: palette.primary,
        card: "#23272f",
        text: "#FFFFFF",
    },
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem("theme");
        return stored === "dark" ? "dark" : "light";
    });

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const value = {
        theme,
        toggleTheme,
        colors: themes[theme],
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
