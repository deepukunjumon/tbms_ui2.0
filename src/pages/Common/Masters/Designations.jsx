import { useEffect, useState, useCallback, useMemo } from "react";
import TableComponent from "../../../components/TableComponent";
import { MdAdd } from "react-icons/md";
import { BiEdit } from "react-icons/bi";
import Snackbar from "../../../components/Snackbar";
import {
    getDesignations,
    updateDesignation,
    updateDesignationStatus,
    createDesignation,
} from "../../../services/api";
import { useTheme } from "../../../context/Theme";
import Chip from "../../../components/Chip";

const STATUS_OPTIONS = [
    { value: "1", label: "Active" },
    { value: "0", label: "Inactive" },
];

const Designations = () => {
    const [designations, setDesignations] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editDesignation, setEditDesignation] = useState(null);
    const [editFields, setEditFields] = useState({});
    const [editLoading, setEditLoading] = useState(false);
    const [snack, setSnack] = useState({ message: "", type: "success" });
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createValue, setCreateValue] = useState("");
    const [createLoading, setCreateLoading] = useState(false);
    const [tableState, setTableState] = useState({ sortBy: '', sortOrder: 'asc', filters: {} });
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const { colors } = useTheme();

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(handler);
    }, [search]);

    const fetchDesignations = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getDesignations({
                page: currentPage,
                per_page: pageSize,
                ...(debouncedSearch && { q: debouncedSearch }),
                ...(tableState.sortBy && { sort_by: tableState.sortBy, sort_order: tableState.sortOrder }),
                ...(tableState.filters.designation && { designation: tableState.filters.designation }),
                ...(tableState.filters.status && { status: tableState.filters.status }),
            });
            const data = res.data;
            if (data.success) {
                setDesignations(data.designations || []);
                setPagination(data.pagination || {});
                setCurrentPage(data.pagination?.current_page || 1);
            }
        } catch {
            setDesignations([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, debouncedSearch, tableState]);

    useEffect(() => {
        fetchDesignations();
    }, [fetchDesignations]);

    const handlePageChange = (page) => setCurrentPage(page);
    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const handleEditClick = (designation) => {
        setEditDesignation(designation);
        setEditFields({ designation: designation.designation || "" });
        setEditModalOpen(true);
    };

    const handleEditFieldChange = (field, value) => {
        setEditFields((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditSave = async () => {
        if (!editDesignation) return;
        const value = editFields.designation?.trim();
        if (!value) {
            alert("Designation is required.");
            return;
        }
        const changes = {};
        if (value !== editDesignation.designation) changes.designation = value;
        if (!Object.keys(changes).length) {
            setEditModalOpen(false);
            setSnack({ message: "No changes to update.", type: "info" });
            return;
        }
        setEditLoading(true);
        try {
            await updateDesignation(editDesignation.id, changes);
            fetchDesignations();
            setEditModalOpen(false);
            setSnack({ message: "Designation updated successfully", type: "success" });
        } catch {
            alert("Failed to update designation.");
        } finally {
            setEditLoading(false);
        }
    };

    const handleStatusToggle = async (designation) => {
        const newStatus = designation.status === 1 ? 0 : 1;
        try {
            await updateDesignationStatus(designation.id, newStatus);
            setDesignations((prev) =>
                prev.map((d) =>
                    d.id === designation.id ? { ...d, status: newStatus } : d
                )
            );
            setSnack({ message: "Status updated", type: "success" });
        } catch {
            setSnack({ message: "Failed to update status.", type: "error" });
        }
    };

    const handleCreateSave = async () => {
        const value = createValue.trim();
        if (!value) {
            setSnack({ message: "Designation is required.", type: "error" });
            return;
        }
        setCreateLoading(true);
        try {
            const res = await createDesignation(value);
            setSnack({ message: res.data?.message || "Designation created successfully", type: "success" });
            setCreateModalOpen(false);
            setCreateValue("");
            fetchDesignations();
        } catch {
            setSnack({ message: "Failed to create designation.", type: "error" });
        } finally {
            setCreateLoading(false);
        }
    };

    const columns = useMemo(() => [
        {
            header: "Designation",
            accessor: "designation",
            sortable: true,
            filterable: true,
            filterType: "text",
        },
        {
            header: "Status",
            accessor: "status",
            sortable: true,
            filterable: true,
            filterType: "select",
            filterOptions: STATUS_OPTIONS,
            cell: (row) => (
                <Chip
                    label={row.status === 1 ? "Active" : "Inactive"}
                    color={row.status === 1 ? "success" : "error"}
                />
            ),
        },
        {
            header: "Actions",
            accessor: "actions",
            cell: (row) => (
                <div className="flex items-center gap-2">
                    {row.status === 1 && (
                        <span
                            className="inline-flex items-center justify-center p-2 rounded-full cursor-pointer transition"
                            style={{ color: colors.primary }}
                            title="Edit"
                            onClick={() => handleEditClick(row)}
                        >
                            <BiEdit size={20} />
                        </span>
                    )}
                    <button
                        onClick={() => handleStatusToggle(row)}
                        className={`relative inline-flex items-center h-4 w-7 rounded-full transition-colors duration-300 focus:outline-none ${row.status === 1 ? "bg-green-500" : "bg-gray-300"
                            }`}
                        title={row.status === 1 ? "Set Inactive" : "Set Active"}
                    >
                        <span
                            className={`inline-block h-3 w-3 transform bg-white rounded-full shadow transition-transform duration-300 ${row.status === 1 ? "translate-x-3.5" : "translate-x-0.5"
                                }`}
                        />
                    </button>
                </div>
            ),
        },
    ], [colors.primary]);

    return (
        <div className="p-6">
            <Snackbar
                message={snack.message}
                type={snack.type}
                onClose={() => setSnack({ message: "", type: "success" })}
            />
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Designations</h2>
                <button
                    className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded text-white hover:bg-teal-700 transition text-base font-semibold focus:outline-none"
                    style={{ background: colors.primary, color: colors.white }}
                    onClick={() => setCreateModalOpen(true)}
                    title="Add Designation"
                >
                    <MdAdd className="text-xl" />
                    Add
                </button>
            </div>
            <TableComponent
                columns={columns}
                data={designations}
                loading={loading}
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                showSearch={true}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search designations..."
                onTableChange={setTableState}
                onClearAllFilters={() => setSearch("")}
            />
            {editModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit Designation</h3>
                        <div className="mb-3">
                            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Designation</label>
                            <input
                                type="text"
                                value={editFields.designation || ""}
                                onChange={e => handleEditFieldChange("designation", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                                onClick={() => setEditModalOpen(false)}
                                disabled={editLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition"
                                onClick={handleEditSave}
                                disabled={editLoading}
                            >
                                {editLoading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add Designation</h3>
                        <div className="mb-3">
                            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Designation</label>
                            <input
                                type="text"
                                value={createValue}
                                onChange={e => setCreateValue(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                disabled={createLoading}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                                onClick={() => setCreateModalOpen(false)}
                                disabled={createLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition"
                                onClick={handleCreateSave}
                                disabled={createLoading}
                            >
                                {createLoading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <button
                className="fixed bottom-7 right-7 z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition text-3xl focus:outline-none md:hidden"
                style={{ background: colors.primary, color: colors.white }}
                onClick={() => setCreateModalOpen(true)}
                title="Add Designation"
            >
                <MdAdd />
            </button>
        </div>
    );
};

export default Designations;
