import React, { useEffect, useState, useRef, useCallback } from "react";
import Spinner from "./Spinner";
import { useTheme } from "../context/Theme";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { BiColumns, BiFilterAlt, BiSort } from "react-icons/bi";
import ReactDOM from "react-dom";

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
    onTableChange = () => { },
    onClearAllFilters = undefined,
}) => {
    const [sortBy, setSortBy] = useState("");
    const [sortOrder, setSortOrder] = useState("asc");
    const [filters, setFilters] = useState({});
    const [activePopover, setActivePopover] = useState(null);
    const [popoverTab, setPopoverTab] = useState("filter");
    const [columnVisibility, setColumnVisibility] = useState(() => columns.reduce((acc, col) => ({ ...acc, [col.accessor]: true }), {}));
    const [pendingFilter, setPendingFilter] = useState({});
    const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 });
    const headerRefs = useRef({});
    const [columnWidths, setColumnWidths] = useState({});
    const thRefs = useRef({});
    const resizingColumnRef = useRef(null);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);
    const tableContainerRef = useRef(null);

    const handleMouseMove = useCallback((e) => {
        if (!resizingColumnRef.current) return;
        const deltaX = e.clientX - startXRef.current;
        let newWidth = startWidthRef.current + deltaX;
        if (newWidth < 50) newWidth = 50; // min width

        const th = thRefs.current[resizingColumnRef.current];
        if (th) {
            th.style.width = `${newWidth}px`;
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        if (!resizingColumnRef.current) return;

        const th = thRefs.current[resizingColumnRef.current];
        if (th) {
            const newWidth = th.getBoundingClientRect().width;
            setColumnWidths((prev) => ({
                ...prev,
                [resizingColumnRef.current]: newWidth,
            }));
        }

        resizingColumnRef.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    }, [handleMouseMove]);

    const handleMouseDown = useCallback((e, accessor) => {
        e.preventDefault();
        resizingColumnRef.current = accessor;
        startXRef.current = e.clientX;
        const th = thRefs.current[accessor];
        if (th) {
            startWidthRef.current = th.getBoundingClientRect().width;
        }
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    }, [handleMouseMove, handleMouseUp]);

    useEffect(() => {
        if (activePopover && headerRefs.current[activePopover]) {
            const rect = headerRefs.current[activePopover].getBoundingClientRect();
            setPopoverPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
        }
    }, [activePopover]);

    useEffect(() => {
        if (!activePopover) return;
        function handleClick(e) {
            const popover = document.getElementById('table-popover');
            const header = headerRefs.current[activePopover];
            if (popover && !popover.contains(e.target) && header && !header.contains(e.target)) {
                setActivePopover(null);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [activePopover]);

    const handleSort = (col, order) => {
        setSortBy(col);
        setSortOrder(order);
        onTableChange({ sortBy: col, sortOrder: order, filters });
        setActivePopover(null);
    };

    const handleFilterChange = (col, value) => {
        setPendingFilter((prev) => ({ ...prev, [col]: value }));
    };

    const handleApplyFilter = (col) => {
        const newFilters = { ...filters, [col]: pendingFilter[col] };
        setFilters(newFilters);
        onTableChange({ sortBy, sortOrder, filters: newFilters });
        setActivePopover(null);
    };

    const handleClearFilter = (col) => {
        const newFilters = { ...filters, [col]: "" };
        setFilters(newFilters);
        setPendingFilter((prev) => ({ ...prev, [col]: "" }));
        onTableChange({ sortBy, sortOrder, filters: newFilters });
    };

    const handleClearAllFilters = () => {
        const cleared = Object.fromEntries(columns.filter(c => c.filterable).map(c => [c.accessor, ""]));
        setFilters(cleared);
        setPendingFilter(cleared);
        setSortBy("");
        setSortOrder("asc");
        setColumnVisibility(columns.reduce((acc, col) => ({ ...acc, [col.accessor]: true }), {}));
        onTableChange({ sortBy: "", sortOrder: "asc", filters: cleared });
        if (onClearAllFilters) onClearAllFilters();
        setPopoverTab("sort");
        setActivePopover(null);
    };

    const handleToggleColumn = (col) => {
        setColumnVisibility((prev) => {
            const updated = { ...prev, [col]: !prev[col] };
            return updated;
        });
    };

    const renderHeader = (col) => {
        if (!col.filterable) return col.header;
        return (
            <div
                className="relative group flex items-center gap-1 select-none"
                ref={el => headerRefs.current[col.accessor] = el}
            >
                <span className="truncate" title={col.header}>{col.header}</span>
                <span
                    className="opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    onClick={() => {
                        setActivePopover(activePopover === col.accessor ? null : col.accessor);
                        setPopoverTab("sort");
                        setPendingFilter((prev) => ({ ...prev, [col.accessor]: filters[col.accessor] || "" }));
                    }}
                    tabIndex={0}
                    aria-label={`Open filter and sort for ${col.header}`}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') e.target.click(); }}
                >
                    <BiFilterAlt className="inline ml-1" style={{ color: colors.primary, fontSize: 18 }} />
                </span>
                {activePopover === col.accessor && ReactDOM.createPortal(
                    <div
                        id="table-popover"
                        className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-2xl min-w-[180px] max-w-[220px] p-0 z-30"
                        style={{
                            position: "absolute",
                            top: popoverPos.top,
                            left: popoverPos.left,
                            width: popoverPos.width,
                            borderColor: colors.primary,
                            fontSize: '0.92rem',
                        }}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="flex border-b rounded-t-xl" style={{ borderColor: colors.primary, background: 'transparent' }}>
                            <button
                                className={`flex-1 py-1.5 px-2 flex items-center justify-center text-xs border-b-2 transition font-semibold focus:outline-none`}
                                style={popoverTab === "sort"
                                    ? { borderBottom: `2px solid ${colors.primary}`, color: colors.text, background: 'transparent' }
                                    : { borderBottom: '2px solid transparent', color: colors.textSecondary, background: 'transparent' }}
                                onClick={() => setPopoverTab("sort")}
                                disabled={!col.sortable}
                                tabIndex={0}
                            >
                                <BiSort style={{ color: colors.primary, fontSize: 16 }} />
                            </button>
                            <button
                                className={`flex-1 py-1.5 px-2 flex items-center justify-center text-xs border-b-2 transition font-semibold focus:outline-none`}
                                style={popoverTab === "filter"
                                    ? { borderBottom: `2px solid ${colors.primary}`, color: colors.text, background: 'transparent' }
                                    : { borderBottom: '2px solid transparent', color: colors.textSecondary, background: 'transparent' }}
                                onClick={() => setPopoverTab("filter")}
                                disabled={!col.filterable}
                                tabIndex={0}
                            >
                                <BiFilterAlt style={{ color: colors.primary, fontSize: 16 }} />
                            </button>
                            <button
                                className={`flex-1 py-1.5 px-2 flex items-center justify-center text-xs border-b-2 transition font-semibold focus:outline-none`}
                                style={popoverTab === "columns"
                                    ? { borderBottom: `2px solid ${colors.primary}`, color: colors.text, background: 'transparent' }
                                    : { borderBottom: '2px solid transparent', color: colors.textSecondary, background: 'transparent' }}
                                onClick={() => setPopoverTab("columns")}
                                tabIndex={0}
                            >
                                <BiColumns style={{ color: colors.primary, fontSize: 16 }} />
                            </button>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-b-xl">
                            {popoverTab === "sort" && (
                                <>
                                    <button
                                        className="block w-full text-left py-2 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition"
                                        style={{ color: colors.primary, fontWeight: 600 }}
                                        onClick={() => handleSort(col.accessor, "asc")}
                                    >
                                        Sort Ascending
                                    </button>
                                    <button
                                        className="block w-full text-left py-2 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition"
                                        style={{ color: colors.primary, fontWeight: 600 }}
                                        onClick={() => handleSort(col.accessor, "desc")}
                                    >
                                        Sort Descending
                                    </button>
                                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                                    <button
                                        className="block w-full text-left py-2 px-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900 transition text-red-600"
                                        onClick={handleClearAllFilters}
                                    >
                                        Clear All Filters
                                    </button>
                                </>
                            )}
                            {popoverTab === "filter" && (
                                <>
                                    {col.filterType === "text" && (
                                        <input
                                            type="text"
                                            value={pendingFilter[col.accessor] || ""}
                                            onChange={e => handleFilterChange(col.accessor, e.target.value)}
                                            placeholder="Search..."
                                            className="mb-3 px-3 py-2 w-full border rounded-lg text-sm border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                    {col.filterType === "select" && (
                                        <Listbox
                                            value={pendingFilter[col.accessor] || ""}
                                            onChange={val => handleFilterChange(col.accessor, val)}
                                        >
                                            {({ open }) => (
                                                <div className="relative mb-3">
                                                    <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white text-sm">
                                                        <span className="block truncate">
                                                            {col.filterOptions.find(opt => opt.value === (pendingFilter[col.accessor] || ""))?.label || "All"}
                                                        </span>
                                                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                        </span>
                                                    </Listbox.Button>
                                                    <Transition
                                                        show={open}
                                                        as={React.Fragment}
                                                        leave="transition ease-in duration-100"
                                                        leaveFrom="opacity-100"
                                                        leaveTo="opacity-0"
                                                    >
                                                        <Listbox.Options className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-200 dark:border-gray-700">
                                                            <Listbox.Option
                                                                key="all"
                                                                value=""
                                                                className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}
                                                            >
                                                                {({ selected }) => (
                                                                    <>
                                                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>All</span>
                                                                        {selected ? (
                                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                            </span>
                                                                        ) : null}
                                                                    </>
                                                                )}
                                                            </Listbox.Option>
                                                            {col.filterOptions && col.filterOptions.map(opt => (
                                                                <Listbox.Option
                                                                    key={opt.value}
                                                                    value={opt.value}
                                                                    className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}
                                                                >
                                                                    {({ selected }) => (
                                                                        <>
                                                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{opt.label}</span>
                                                                            {selected ? (
                                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                                </span>
                                                                            ) : null}
                                                                        </>
                                                                    )}
                                                                </Listbox.Option>
                                                            ))}
                                                        </Listbox.Options>
                                                    </Transition>
                                                </div>
                                            )}
                                        </Listbox>
                                    )}
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            className="flex-1 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                                            style={{ background: colors.primary, color: colors.white }}
                                            onClick={() => handleApplyFilter(col.accessor)}
                                        >
                                            Apply
                                        </button>
                                        <button
                                            className="flex-1 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                                            style={{ background: colors.error, color: colors.white }}
                                            onClick={() => { handleClearFilter(col.accessor); setActivePopover(null); }}
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </>
                            )}
                            {popoverTab === "columns" && (
                                <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
                                    {columns.map(c => (
                                        <label key={c.accessor} className="flex items-center gap-2 cursor-pointer px-1 py-1">
                                            <input
                                                type="checkbox"
                                                checked={columnVisibility[c.accessor]}
                                                onChange={() => handleToggleColumn(c.accessor)}
                                                className="accent-blue-600 h-4 w-4"
                                            />
                                            <span className="text-blue-900 dark:text-blue-100 text-sm font-medium">{c.header}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        );
    };

    const totalPages = pagination?.last_page || pagination?.total_pages || 1;
    const from = pagination?.from || ((currentPage - 1) * (pagination?.per_page || 10)) + 1;
    const currentPageSize = pagination?.per_page || 10;
    const pageSizeOptions = [5, 10, 25, 50, 100];
    const { colors } = useTheme();

    return (
        <div className="w-full">
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
                    <Listbox value={currentPageSize} onChange={onPageSizeChange}>
                        {({ open }) => (
                            <div className="relative">
                                <Listbox.Button className="relative w-20 cursor-pointer rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 py-1 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white">
                                    <span className="block truncate">{currentPageSize}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </span>
                                </Listbox.Button>
                                <Transition
                                    show={open}
                                    as={React.Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Listbox.Options className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-gray-200 dark:border-gray-700">
                                        {pageSizeOptions.map(size => (
                                            <Listbox.Option
                                                key={size}
                                                className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-teal-100 dark:bg-teal-800 text-teal-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}
                                                value={size}
                                            >
                                                {({ selected }) => (
                                                    <>
                                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{size}</span>
                                                        {selected ? (
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-teal-600 dark:text-teal-400">
                                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        ) : null}
                                                    </>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        )}
                    </Listbox>
                    <span className="text-gray-700 dark:text-gray-300">entries</span>
                </div>
            </div>

            <div
                className="overflow-x-auto rounded-md shadow-sm custom-scrollbar relative"
                ref={tableContainerRef}
                style={{
                    maxHeight: 'calc(100vh - 250px)',
                    overflow: 'auto'
                }}
            >
                <table className="min-w-full table-fixed text-sm text-left border-collapse">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 sticky top-0 z-20">
                        <tr>
                            <th
                                className="px-3 py-2 font-semibold text-md whitespace-nowrap sticky top-0 z-30 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
                                style={{ position: 'sticky', left: 0, zIndex: 40 }}
                            >
                                Sl. No.
                            </th>
                            {columns.map(col => columnVisibility[col.accessor] && (
                                <th
                                    key={col.accessor}
                                    ref={el => (thRefs.current[col.accessor] = el)}
                                    className="px-3 py-2 font-bold text-md sticky top-0 z-30 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
                                    style={{
                                        width: columnWidths[col.accessor] ? `${columnWidths[col.accessor]}px` : 'auto',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 30
                                    }}
                                >
                                    {renderHeader(col)}
                                    <div
                                        onMouseDown={e => handleMouseDown(e, col.accessor)}
                                        className="absolute top-0 right-0 h-full w-2 cursor-col-resize"
                                    />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="py-8">
                                    <Spinner />
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="text-center text-gray-500 dark:text-gray-400 py-4">
                                    No data found.
                                </td>
                            </tr>
                        ) : (
                            data.map((row, idx) => (
                                <tr key={row.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td
                                        className="px-3 py-1.5 text-gray-900 dark:text-white whitespace-nowrap sticky left-0 z-10 bg-white dark:bg-gray-900"
                                        style={{ position: 'sticky' }}
                                    >
                                        {from + idx}
                                    </td>
                                    {columns.map(col => columnVisibility[col.accessor] && (
                                        <td
                                            key={col.accessor}
                                            className="px-3 py-1 font-semibold text-gray-700 dark:text-gray-200 whitespace-normal break-words bg-white dark:bg-gray-900"
                                            title={(typeof col.cell !== "function" && row[col.accessor]) || ''}
                                        >
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
                                pages.push(
                                    <button
                                        key={1}
                                        onClick={() => onPageChange(1)}
                                        className={`px-3 py-1 rounded-md border text-sm ${currentPage === 1 ? '' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                        style={currentPage === 1 ? { background: colors?.primary, color: colors?.white, borderColor: colors?.primary } : {}}
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
                                            className={`px-3 py-1 rounded-md border text-sm ${page === currentPage ? '' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                            style={page === currentPage ? { background: colors?.primary, color: colors?.white, borderColor: colors?.primary } : {}}
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
                                            className={`px-3 py-1 rounded-md border text-sm ${currentPage === totalPages ? '' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                            style={currentPage === totalPages ? { background: colors?.primary, color: colors?.white, borderColor: colors?.primary } : {}}
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
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: ${colors.primary};
                    border-radius: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                table {
                    position: relative;
                }
                thead th {
                    position: -webkit-sticky;
                    position: sticky;
                }
            `}</style>
        </div>
    );
};

export default TableComponent;