import React from "react";
import Spinner from "./Spinner";

const TableComponent = ({
    columns,
    data,
    loading,
    pagination,
    currentPage,
    onPageChange,
    onPageSizeChange,
    showSearch = false,
    searchValue = "",
    onSearchChange = () => { },
    searchPlaceholder = "Search...",
}) => {
    const totalPages = pagination?.last_page || pagination?.total_pages || 1;
    const from = pagination?.from || ((currentPage - 1) * (pagination?.per_page || 10)) + 1;
    const currentPageSize = pagination?.per_page || 10;
    const pageSizeOptions = [5, 10, 25, 50, 100];

    return (
        <div className="w-full">
            {/* Search and Page Size */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                {showSearch && (
                    <input
                        type="text"
                        value={searchValue}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="px-4 py-2 w-full sm:max-w-xs border rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                )}
                <div className="flex items-center gap-2 text-sm">
                    <label className="text-gray-700 dark:text-gray-300">Show</label>
                    <select
                        value={currentPageSize}
                        onChange={e => onPageSizeChange(parseInt(e.target.value))}
                        className="border px-2 py-1 rounded-md dark:bg-gray-900 dark:text-white border-gray-300 dark:border-gray-700"
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                    <span className="text-gray-700 dark:text-gray-300">entries</span>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border rounded-md shadow-sm max-h-[27rem] overflow-y-auto">
                <table className="min-w-full table-auto text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-sm whitespace-nowrap sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">Sl. No.</th>
                            {columns.map(col => (
                                <th key={col.accessor} className="px-3 py-3 font-semibold text-sm whitespace-nowrap sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="py-12">
                                    <Spinner />
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="text-center text-gray-500 dark:text-gray-400 py-6">
                                    No data found.
                                </td>
                            </tr>
                        ) : (
                            data.map((row, idx) => (
                                <tr key={row.id || idx} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-2 text-gray-900 dark:text-white whitespace-nowrap">
                                        {from + idx}
                                    </td>
                                    {columns.map(col => (
                                        <td key={col.accessor} className="px-4 py-2 text-gray-700 dark:text-gray-200 whitespace-nowrap">
                                            {typeof col.cell === "function" ? col.cell(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="mt-6 text-sm text-gray-600 dark:text-gray-300 flex flex-col items-center gap-2">
                    <div className="mb-1">
                        Showing {pagination.from || 1} to {pagination.to || data.length} of {pagination.total || data.length} items
                    </div>
                    {totalPages > 1 && (
                        <div className="flex gap-1 justify-center">
                            <button
                                onClick={() => onPageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {/* Pagination with ellipsis */}
                            {(() => {
                                const pages = [];
                                const pageWindow = 2;
                                let start = Math.max(2, currentPage - pageWindow);
                                let end = Math.min(totalPages - 1, currentPage + pageWindow);
                                if (currentPage <= 1 + pageWindow) {
                                    end = Math.min(totalPages - 1, 1 + 2 * pageWindow);
                                }
                                if (currentPage >= totalPages - pageWindow) {
                                    start = Math.max(2, totalPages - 2 * pageWindow);
                                }
                                // Always show first page
                                pages.push(
                                    <button
                                        key={1}
                                        onClick={() => onPageChange(1)}
                                        className={`px-3 py-1 rounded-md border text-sm ${currentPage === 1
                                            ? "bg-teal-600 text-white border-teal-600"
                                            : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            }`}
                                    >
                                        1
                                    </button>
                                );
                                if (start > 2) {
                                    pages.push(<span key="start-ellipsis" className="px-2">...</span>);
                                }
                                for (let page = start; page <= end; page++) {
                                    pages.push(
                                        <button
                                            key={page}
                                            onClick={() => onPageChange(page)}
                                            className={`px-3 py-1 rounded-md border text-sm ${page === currentPage
                                                ? "bg-teal-600 text-white border-teal-600"
                                                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    );
                                }
                                if (end < totalPages - 1) {
                                    pages.push(<span key="end-ellipsis" className="px-2">...</span>);
                                }
                                if (totalPages > 1) {
                                    pages.push(
                                        <button
                                            key={totalPages}
                                            onClick={() => onPageChange(totalPages)}
                                            className={`px-3 py-1 rounded-md border text-sm ${currentPage === totalPages
                                                ? "bg-teal-600 text-white border-teal-600"
                                                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                }`}
                                        >
                                            {totalPages}
                                        </button>
                                    );
                                }
                                return pages;
                            })()}
                            <button
                                onClick={() => onPageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TableComponent;
