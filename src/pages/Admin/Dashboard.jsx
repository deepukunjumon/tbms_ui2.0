import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/Theme";
import { fetchAdminDashboardStats } from "../../services/api";

const AdminDashboard = () => {
    const { colors } = useTheme();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAdminDashboardStats()
            .then(res => setStats(res.data.data))
            .catch(() => setError("Failed to load stats"))
            .finally(() => setLoading(false));
    }, []);

    // Define the stats cards configuration
    const statCards = [
        {
            key: 'active_employees_count',
            title: 'Active Employees',
            color: colors.primary
        },
        {
            key: 'active_branches_count',
            title: 'Active Branches',
            color: colors.success
        },
        {
            key: 'todays_pending_orders_count',
            title: "Today's Pending Orders",
            color: colors.warning
        },
        {
            key: 'todays_delivered_orders_count',
            title: "Today's Delivered Orders",
            color: colors.error
        }
    ];

    return (
        <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {statCards.map((card) => (
                    <div
                        key={card.key}
                        className="p-4 rounded-lg text-center shadow-sm border border-gray-100 dark:border-gray-700"
                        style={{ background: card.color + '20' }}
                    >
                        {loading ? (
                            <>
                                <div className="animate-pulse h-8 w-3/4 mx-auto rounded bg-gray-200 dark:bg-gray-600 mb-2"></div>
                                <div className="animate-pulse h-4 w-1/2 mx-auto rounded bg-gray-200 dark:bg-gray-600"></div>
                            </>
                        ) : error ? (
                            <div className="text-red-500 text-sm">Error loading data</div>
                        ) : (
                            <>
                                <div
                                    className="text-2xl font-bold mb-1"
                                    style={{ color: card.color }}
                                >
                                    {stats?.[card.key] || 0}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {card.title}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {error && !loading && (
                <div className="text-red-500 text-center py-4">{error}</div>
            )}
        </div>
    );
};

export default AdminDashboard; 