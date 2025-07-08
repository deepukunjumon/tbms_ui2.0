import { useEffect, useState } from "react";
import TableComponent from "../../../components/TableComponent";
import { MdEdit, MdAdd } from "react-icons/md";
import Snackbar from "../../../components/Snackbar";
import {
    getDesignations,
    updateDesignation,
    updateDesignationStatus,
    createDesignation,
} from "../../../services/api";
import { useTheme } from "../../../context/Theme";

const Designations = () => {
    const [designations, setDesignations] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editDesignation, setEditDesignation] = useState(null);
    const [editFields, setEditFields] = useState({});
    const [editLoading, setEditLoading] = useState(false);
    const [snack, setSnack] = useState({ message: "", type: "success" });
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createValue, setCreateValue] = useState("");
    const [createLoading, setCreateLoading] = useState(false);

    const { colors } = useTheme();

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(handler);
    }, [search]);

    const fetchDesignations = async (page = 1, perPage = pageSize, q = debouncedSearch) => {
        setLoading(true);
        try {
            const res = await getDesignations({ page, per_page: perPage, ...(q && { q }) });
            const data = res.data;
            if (data.success) {
                setDesignations(data.designations || []);
                setPagination(data.pagination || {});
                setCurrentPage(data.pagination.current_page || 1);
            }
        } catch (err) {
            setDesignations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDesignations(currentPage, pageSize, debouncedSearch);
    }, [currentPage, pageSize, debouncedSearch]);

    const handlePageChange = (page) => setCurrentPage(page);
    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const handleEditClick = (designation) => {
        setEditDesignation(designation);
        setEditFields({
            designation: designation.designation || "",
        });
        setEditModalOpen(true);
    };

    const handleEditFieldChange = (field, value) => {
        setEditFields((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditSave = async () => {
        if (!editDesignation) return;
        const { designation: designationValue } = editFields;
        if (!designationValue.trim()) {
            alert("Designation is required.");
            return;
        }
        const changes = {};
        if (designationValue !== editDesignation.designation) changes.designation = designationValue;
        if (Object.keys(changes).length === 0) {
            setEditModalOpen(false);
            setSnack({ message: "No changes to update.", type: "info" });
            return;
        }
        setEditLoading(true);
        try {
            await updateDesignation(editDesignation.id, changes);
            fetchDesignations(currentPage, pageSize, debouncedSearch);
            setEditModalOpen(false);
            setSnack({ message: "Designation updated successfully", type: "success" });
        } catch (err) {
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
        } catch (err) {
            setSnack({ message: "Failed to update status.", type: "error" });
        }
    };

    const handleCreateSave = async () => {
        if (!createValue.trim()) {
            setSnack({ message: "Designation is required.", type: "error" });
            return;
        }
        setCreateLoading(true);
        try {
            const res = await createDesignation(createValue.trim());
            setSnack({ message: res.data?.message || "Designation created successfully", type: "success" });
            setCreateModalOpen(false);
            setCreateValue("");
            fetchDesignations(currentPage, pageSize, debouncedSearch);
        } catch (err) {
            setSnack({ message: "Failed to create designation.", type: "error" });
        } finally {
            setCreateLoading(false);
        }
    };

    const columns = [
        { header: "Designation", accessor: "designation" },
        {
            header: "Status",
            accessor: "status",
            cell: (row) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === 1
                        ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100"
                        }`}
                >
                    {row.status === 1 ? "Active" : "Inactive"}
                </span>
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
                            <MdEdit size={20} />
                        </span>
                    )}
                    <button
                        onClick={() => handleStatusToggle(row)}
                        className="relative inline-flex items-center h-4 w-7 rounded-full transition-colors duration-300 focus:outline-none"
                        style={{ background: row.status === 1 ? colors.success : colors.gray[300] }}
                        title={row.status === 1 ? "Set Inactive" : "Set Active"}
                    >
                        <span
                            className={`inline-block h-3 w-3 transform bg-white rounded-full shadow transition-transform duration-300 ${row.status === 1 ? "translate-x-3.5" : "translate-x-0.5"}`}
                        />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6">
            <Snackbar
                message={snack.message}
                type={snack.type}
                onClose={() => setSnack({ message: "", type: "success" })}
            />
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Designations</h2>
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
            {/* Floating Add Button */}
            <button
                className="fixed bottom-7 right-7 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition text-3xl focus:outline-none"
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
