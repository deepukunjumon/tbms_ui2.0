import React from "react";

const Footer = () => {
    return (
        <footer className="w-full py-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} TBMS v1.0.0
        </footer>
    );
};

export default Footer;
