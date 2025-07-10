import { useEffect, useState, useCallback } from "react";
import { getBranches, createBranch, updateBranch } from "../../services/api";
import TableComponent from "../../components/TableComponent";
import { BiPlus, BiEdit } from "react-icons/bi";
import Snackbar from "../../components/Snackbar";
import { useTheme } from "../../context/Theme";

const Branches = () => {
    const [branches, setBranches] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [snack, setSnack] = useState({ message: "", type: "success" });
    const { colors } = useTheme();

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createFields, setCreateFields] = useState({
        code: "",
        name: "",
        address: "",
        mobile: "",
        email: "",
        phone: ""
    });
    const [createLoading, setCreateLoading] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(handler);
    }, [search]);

    const fetchBranches = useCallback(async (page = 1, perPage = pageSize, q = debouncedSearch) => {
        setLoading(true);
        try {
            const res = await getBranches({ page, per_page: perPage, ...(q && { q }) });
            const data = res.data;
            if (data.success) {
                setBranches(data.branches || []);
                setPagination(data.pagination || {});
                setCurrentPage(data.pagination.current_page || 1);
            }
        } catch (err) {
            setBranches([]);
        } finally {
            setLoading(false);
        }
    }, [pageSize, debouncedSearch]);

    useEffect(() => {
        fetchBranches(currentPage, pageSize, debouncedSearch);
    }, [fetchBranches, currentPage, pageSize, debouncedSearch]);

    const handlePageChange = (page) => setCurrentPage(page);
    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const handleStatusToggle = (branch) => {
        setBranches((prev) =>
            prev.map((b) =>
                b.id === branch.id ? { ...b, status: branch.status === 1 ? 0 : 1 } : b
            )
        );
        setSnack({ message: "Status updated (UI only)", type: "success" });
    };

    const handleCreateFieldChange = (field, value) => {
        setCreateFields((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreateSave = async () => {
        const { code, name, address, mobile, email, phone } = createFields;
        if (!code.trim() || !name.trim() || !address.trim() || !mobile.trim() || !email.trim()) {
            setSnack({ message: "All fields except phone are required.", type: "error" });
            return;
        }
        setCreateLoading(true);
        try {
            const res = await createBranch({ code, name, address, mobile, email, phone });
            setSnack({ message: res.data?.message || "Branch created successfully", type: "success" });
            setCreateModalOpen(false);
            setCreateFields({ code: "", name: "", address: "", mobile: "", email: "", phone: "" });
            fetchBranches(currentPage, pageSize, debouncedSearch);
        } catch (err) {
            setSnack({ message: "Failed to create branch.", type: "error" });
        } finally {
            setCreateLoading(false);
        }
    };

    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editFields, setEditFields] = useState({});
    const [editBranch, setEditBranch] = useState(null);
    const [editLoading, setEditLoading] = useState(false);

    const handleEditClick = (branch) => {
        setEditBranch(branch);
        setEditFields({
            code: branch.code,
            name: branch.name,
            address: branch.address,
            mobile: branch.mobile,
            email: branch.email,
            phone: branch.phone || ""
        });
        setEditModalOpen(true);
    };

    const handleEditFieldChange = (field, value) => {
        setEditFields((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditSave = async () => {
        if (!editBranch) return;
        const changes = {};
        Object.keys(editFields).forEach((key) => {
            if (editFields[key] !== (editBranch[key] || "")) {
                changes[key] = editFields[key];
            }
        });
        if (Object.keys(changes).length === 0) {
            setEditModalOpen(false);
            return;
        }
        setEditLoading(true);
        try {
            await updateBranch(editBranch.id, changes);
            setSnack({ message: "Branch updated successfully", type: "success" });
            setEditModalOpen(false);
            fetchBranches(currentPage, pageSize, debouncedSearch);
        } catch (err) {
            setSnack({ message: "Failed to update branch.", type: "error" });
        } finally {
            setEditLoading(false);
        }
    };

    const columns = [
        { header: "Code", accessor: "code" },
        { header: "Name", accessor: "name" },
        { header: "Address", accessor: "address" },
        { header: "Mobile", accessor: "mobile" },
        { header: "Email", accessor: "email" },
        { header: "Phone", accessor: "phone" },
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
                    <button
                        onClick={() => handleEditClick(row)}
                        className="inline-flex items-center justify-center p-2 rounded-full cursor-pointer transition"
                        style={{ color: colors.primary }}
                        title="Edit"
                    >
                        <BiEdit size={20} />
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
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Branches</h2>
            <TableComponent
                columns={columns}
                data={branches}
                loading={loading}
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                showSearch={true}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search branches..."
            />
            {/* Floating Add Button */}
            <button
                className="fixed bottom-7 right-7 z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition text-3xl focus:outline-none"
                style={{ background: colors.primary, color: colors.white }}
                onClick={() => setCreateModalOpen(true)}
                title="Add Branch"
            >
                <BiPlus />
            </button>
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl">
                        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Add Branch</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Code</label>
                                <input
                                    type="text"
                                    value={createFields.code}
                                    onChange={e => handleCreateFieldChange("code", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    disabled={createLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Name</label>
                                <input
                                    type="text"
                                    value={createFields.name}
                                    onChange={e => handleCreateFieldChange("name", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    disabled={createLoading}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Address</label>
                                <textarea
                                    value={createFields.address}
                                    onChange={e => handleCreateFieldChange("address", e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    disabled={createLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Mobile</label>
                                <input
                                    type="text"
                                    value={createFields.mobile}
                                    onChange={e => handleCreateFieldChange("mobile", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    disabled={createLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Phone</label>
                                <input
                                    type="text"
                                    value={createFields.phone}
                                    onChange={e => handleCreateFieldChange("phone", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    disabled={createLoading}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Email</label>
                                <input
                                    type="email"
                                    value={createFields.email}
                                    onChange={e => handleCreateFieldChange("email", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    disabled={createLoading}
                                />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                                onClick={() => setCreateModalOpen(false)}
                                disabled={createLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded transition"
                                style={{
                                    background: colors.primary,
                                    color: colors.white,
                                    opacity: createLoading ? 0.7 : 1,
                                }}
                                onClick={handleCreateSave}
                                disabled={createLoading}
                            >
                                {createLoading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Branch Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl">
                        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Edit Branch</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Code</label>
                                <input
                                    type="text"
                                    value={editFields.code}
                                    onChange={e => handleEditFieldChange("code", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    disabled={editLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Name</label>
                                <input
                                    type="text"
                                    value={editFields.name}
                                    onChange={e => handleEditFieldChange("name", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    disabled={editLoading}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Address</label>
                                <textarea
                                    value={editFields.address}
                                    onChange={e => handleEditFieldChange("address", e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    disabled={editLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Mobile</label>
                                <input
                                    type="text"
                                    value={editFields.mobile}
                                    onChange={e => handleEditFieldChange("mobile", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    disabled={editLoading}
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Phone</label>
                                <input
                                    type="text"
                                    value={editFields.phone}
                                    onChange={e => handleEditFieldChange("phone", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    disabled={editLoading}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Email</label>
                                <input
                                    type="email"
                                    value={editFields.email}
                                    onChange={e => handleEditFieldChange("email", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                    disabled={editLoading}
                                />
                            </div>
                        </div>
                        {/* Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                                onClick={() => setEditModalOpen(false)}
                                disabled={editLoading}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded transition"
                                style={{ background: colors.primary, color: colors.white, opacity: editLoading ? 0.7 : 1 }}
                                onClick={handleEditSave}
                                disabled={editLoading}
                            >
                                {editLoading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Branches; 