import { useEffect, useState } from "react";
import API, { API_ENDPOINTS, updateItem, updateItemStatus, createItem } from "../../../services/api";
import TableComponent from "../../../components/TableComponent";
import { MdEdit, MdAdd } from "react-icons/md";
import Snackbar from "../../../components/Snackbar";

const CATEGORY_OPTIONS = [
    { value: "snacks", label: "Snacks" },
    { value: "food_item", label: "Food Item" },
    { value: "cake", label: "Cake" },
];

const Items = () => {
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [editFields, setEditFields] = useState({});
    const [editLoading, setEditLoading] = useState(false);

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createFields, setCreateFields] = useState({ name: "", category: "", description: "" });
    const [createLoading, setCreateLoading] = useState(false);

    const [snack, setSnack] = useState({ message: "", type: "success" });

    const token = localStorage.getItem("token");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(handler);
    }, [search]);

    const fetchItems = async (page = 1, perPage = pageSize, q = debouncedSearch) => {
        setLoading(true);
        try {
            const res = await API.get(API_ENDPOINTS.ITEMS, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page,
                    per_page: perPage,
                    ...(q && { q }),
                },
            });
            const data = res.data;
            if (data.success) {
                setItems(data.items || []);
                setPagination(data.pagination || {});
                setCurrentPage(data.pagination.current_page || 1);
            }
        } catch (err) {
            console.error("Failed to fetch items:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems(currentPage, pageSize, debouncedSearch);
    }, [currentPage, pageSize, debouncedSearch]);

    const handlePageChange = (page) => setCurrentPage(page);
    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const handleEditClick = (item) => {
        setEditItem(item);
        setEditFields({ name: item.name, category: item.category, description: item.description || "" });
        setEditModalOpen(true);
    };

    const handleEditFieldChange = (field, value) => {
        setEditFields((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditSave = async () => {
        if (!editItem) return;
        const { name, category, description } = editFields;

        // Validation
        if (!name.trim() || !category.trim()) {
            alert("Name and Category are required.");
            return;
        }

        const changes = {};
        if (name !== editItem.name) changes.name = name;
        if (category !== editItem.category) changes.category = category;
        if (description !== (editItem.description || "")) changes.description = description;

        if (Object.keys(changes).length === 0) {
            setEditModalOpen(false);
            return;
        }

        setEditLoading(true);
        try {
            await updateItem(editItem.id, changes);
            fetchItems(currentPage, pageSize, debouncedSearch);
            setEditModalOpen(false);
        } catch (err) {
            alert("Failed to update item.");
        } finally {
            setEditLoading(false);
        }
    };

    const handleStatusToggle = async (item) => {
        const newStatus = item.status === 1 ? 0 : 1;

        try {
            const res = await updateItemStatus(item.id, newStatus);
            setItems((prevItems) =>
                prevItems.map((it) =>
                    it.id === item.id ? { ...it, status: newStatus } : it
                )
            );
            setSnack({ message: res.data?.message || "Status updated", type: "success" });
        } catch (err) {
            // Revert on failure
            setSnack({ message: "Failed to update status.", type: "error" });
        }
    };

    const handleCreateFieldChange = (field, value) => {
        setCreateFields((prev) => ({ ...prev, [field]: value }));
    };

    const handleCreateSave = async () => {
        const { name, category, description } = createFields;
        if (!name.trim() || !category.trim()) {
            setSnack({ message: "Name and Category are required.", type: "error" });
            return;
        }
        setCreateLoading(true);
        try {
            const res = await createItem({ name: name.trim(), category, description });
            setSnack({ message: res.data?.message || "Item created successfully", type: "success" });
            setCreateModalOpen(false);
            setCreateFields({ name: "", category: "", description: "" });
            fetchItems(currentPage, pageSize, debouncedSearch);
        } catch (err) {
            setSnack({ message: "Failed to create item.", type: "error" });
        } finally {
            setCreateLoading(false);
        }
    };

    const columns = [
        { header: "Name", accessor: "name" },
        { header: "Category", accessor: "category" },
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
                            className="inline-flex items-center justify-center p-2 rounded-full cursor-pointer text-teal-600 hover:bg-teal-100 dark:hover:bg-teal-900 hover:text-teal-800 transition"
                            title="Edit"
                            onClick={() => handleEditClick(row)}
                        >
                            <MdEdit size={20} />
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
    ];

    return (
        <div className="p-6">
            {/* Snackbar Notification */}
            <Snackbar
                message={snack.message}
                type={snack.type}
                onClose={() => setSnack({ message: "", type: "success" })}
            />
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Items</h2>
            <TableComponent
                columns={columns}
                data={items}
                loading={loading}
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                showSearch={true}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search items..."
            />
            {/* Floating Add Button */}
            <button
                className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg hover:bg-teal-700 transition text-3xl focus:outline-none"
                onClick={() => setCreateModalOpen(true)}
                title="Add Item"
            >
                <MdAdd />
            </button>
            {/* Create Item Modal */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add Item</h3>
                        <div className="mb-3">
                            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Name</label>
                            <input
                                type="text"
                                value={createFields.name}
                                onChange={e => handleCreateFieldChange("name", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                disabled={createLoading}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Category</label>
                            <select
                                value={createFields.category}
                                onChange={e => handleCreateFieldChange("category", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                disabled={createLoading}
                            >
                                <option value="">Select category</option>
                                <option value="snacks">Snacks</option>
                                <option value="food_item">Food Item</option>
                                <option value="cake">Cake</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Description</label>
                            <textarea
                                value={createFields.description}
                                onChange={e => handleCreateFieldChange("description", e.target.value)}
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

            {editModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit Item</h3>

                        <div className="mb-3">
                            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Name</label>
                            <input
                                type="text"
                                value={editFields.name || ""}
                                onChange={(e) => handleEditFieldChange("name", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Category</label>
                            <select
                                value={editFields.category || ""}
                                onChange={(e) => handleEditFieldChange("category", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            >
                                <option value="">Select category</option>
                                {CATEGORY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Description</label>
                            <textarea
                                value={editFields.description || ""}
                                onChange={(e) => handleEditFieldChange("description", e.target.value)}
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
        </div>
    );
};

export default Items;
