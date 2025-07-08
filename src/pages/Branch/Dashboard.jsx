import { useTheme } from "../../context/Theme";

const BranchDashboard = () => {
    const { colors, theme } = useTheme();
    return (
        <div className={`p-4 rounded shadow ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
            <h1 className="text-xl font-semibold" style={{ color: colors.primary }}>Branch Dashboard</h1>
        </div>
    );
};

export default BranchDashboard; 