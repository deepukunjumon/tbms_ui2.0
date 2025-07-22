import { useEffect, useState, useCallback, Fragment, useMemo } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { getEmployees, createEmployee, updateEmployee, updateEmployeeStatus, getMinimalBranches, getActiveDesignations } from "../../services/api";
import TableComponent from "../../components/TableComponent";
import { BiPlus, BiEdit } from "react-icons/bi";
import Snackbar from "../../components/Snackbar";
import { useTheme } from "../../context/Theme";
import Chip from "../../components/Chip";

const STATUS_OPTIONS = [
    { value: "1", label: "Active" },
    { value: "0", label: "Inactive" },
];

const Employees = () => {
    const [employees, setEmployees] = useState([]);
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
        employee_code: "",
        name: "",
        mobile: "",
        email: "",
        branch_id: "",
        designation_id: ""
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [branches, setBranches] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [tableState, setTableState] = useState({ sortBy: '', sortOrder: 'asc', filters: {} });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 400);
        return () => clearTimeout(handler);
    }, [search]);

    const fetchEmployees = useCallback(async (page = 1, perPage = pageSize, q = debouncedSearch) => {
        setLoading(true);
        try {
            const res = await getEmployees({
                page,
                per_page: perPage,
                ...(q && { q }),
                ...(tableState.sortBy && { sort_by: tableState.sortBy, sort_order: tableState.sortOrder }),
                ...(tableState.filters.employee_code && { employee_code: tableState.filters.employee_code }),
                ...(tableState.filters.name && { name: tableState.filters.name }),
                ...(tableState.filters.mobile && { mobile: tableState.filters.mobile }),
                ...(tableState.filters.email && { email: tableState.filters.email }),
                ...(tableState.filters.status && { status: tableState.filters.status }),
                ...(tableState.filters.branch_code && { branch_code: tableState.filters.branch_code }),
                ...(tableState.filters.branch_name && { branch_name: tableState.filters.branch_name }),
                ...(tableState.filters.designation && { designation: tableState.filters.designation }),
            });
            const data = res.data;
            if (data.success) {
                setEmployees(data.employees || []);
                setPagination(data.pagination || {});
                setCurrentPage(data.pagination.current_page || 1);
            }
        } catch (err) {
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    }, [pageSize, debouncedSearch, tableState]);

    const handleStatusToggle = useCallback(async (employee) => {
        const newStatus = employee.status === "1" ? "0" : "1";
        try {
            setEmployees((prevEmployees) =>
                prevEmployees.map((emp) =>
                    emp.id === employee.id ? { ...emp, status: newStatus } : emp
                )
            );
            const res = await updateEmployeeStatus(employee.id, newStatus);
            setSnack({ message: res.data?.message || "Status updated", type: "success" });
        } catch (err) {
            setSnack({ message: "Failed to update status.", type: "error" });
        }
    }, []);

    useEffect(() => {
        fetchEmployees(currentPage, pageSize, debouncedSearch);
    }, [fetchEmployees, currentPage, pageSize, debouncedSearch]);

    useEffect(() => {
        getMinimalBranches().then(res => {
            if (res.data.success) setBranches(res.data.branches || []);
        });
        getActiveDesignations().then(res => {
            if (res.data.success) setDesignations(res.data.designations || []);
        });
    }, []);

    const handlePageChange = useCallback((page) => setCurrentPage(page), []);
    const handlePageSizeChange = useCallback((size) => {
        setPageSize(size);
        setCurrentPage(1);
    }, []);

    const handleCreateFieldChange = (field, value) => {
        setCreateFields((prev) => ({ ...prev, [field]: value }));
    };
    const handleCreateBranchChange = (branch) => {
        setCreateFields((prev) => ({ ...prev, branch_id: branch?.id || "" }));
    };
    const handleCreateDesignationChange = (designation) => {
        setCreateFields((prev) => ({ ...prev, designation_id: designation?.id || "" }));
    };
    const selectedCreateBranch = branches.find(b => b.id === createFields.branch_id) || null;
    const selectedCreateDesignation = designations.find(d => d.id === createFields.designation_id) || null;

    const handleCreateSave = async () => {
        const { employee_code, name, mobile, email, branch_id, designation_id } = createFields;
        if (!employee_code.trim() || !name.trim() || !mobile.trim() || !branch_id.trim() || !designation_id.trim()) {
            setSnack({ message: "All fields except email are required.", type: "error" });
            return;
        }
        setCreateLoading(true);
        try {
            const res = await createEmployee({ employee_code, name, mobile, email, branch_id, designation_id });
            setSnack({ message: res.data?.message || "Employee created successfully", type: "success" });
            setCreateModalOpen(false);
            setCreateFields({ employee_code: "", name: "", mobile: "", email: "", branch_id: "", designation_id: "" });
            fetchEmployees(currentPage, pageSize, debouncedSearch);
        } catch (err) {
            setSnack({ message: "Failed to create employee.", type: "error" });
        } finally {
            setCreateLoading(false);
        }
    };

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editFields, setEditFields] = useState({});
    const [editEmployee, setEditEmployee] = useState(null);
    const [editLoading, setEditLoading] = useState(false);

    const handleEditClick = (employee) => {
        setEditEmployee(employee);
        setEditFields({
            employee_code: employee.employee_code,
            name: employee.name,
            mobile: employee.mobile,
            email: employee.email || "",
            branch_id: employee.branch_id,
            designation_id: employee.designation_id || ""
        });
        setEditModalOpen(true);
    };

    const handleEditFieldChange = (field, value) => {
        setEditFields((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditSave = async () => {
        if (!editEmployee) return;
        const changes = {};
        Object.keys(editFields).forEach((key) => {
            if (editFields[key] !== (editEmployee[key] || "")) {
                changes[key] = editFields[key];
            }
        });
        if (Object.keys(changes).length === 0) {
            setEditModalOpen(false);
            return;
        }
        setEditLoading(true);
        try {
            await updateEmployee(editEmployee.id, changes);
            setSnack({ message: "Employee updated successfully", type: "success" });
            setEditModalOpen(false);
            fetchEmployees(currentPage, pageSize, debouncedSearch);
        } catch (err) {
            setSnack({ message: "Failed to update employee.", type: "error" });
        } finally {
            setEditLoading(false);
        }
    };

    const columns = useMemo(() => [
        { header: "Employee Code", accessor: "employee_code", sortable: true, filterable: true, filterType: "text" },
        { header: "Name", accessor: "name", sortable: true, filterable: true, filterType: "text" },
        { header: "Mobile", accessor: "mobile", sortable: true, filterable: true, filterType: "text" },
        { header: "Email", accessor: "email", sortable: true, filterable: true, filterType: "text" },
        {
            header: "Status",
            accessor: "status",
            sortable: true,
            filterable: true,
            filterType: "select",
            filterOptions: STATUS_OPTIONS,
            cell: (row) => (
                <Chip
                    label={row.status === "1" ? "Active" : "Inactive"}
                    color={row.status === "1" ? "success" : "error"}
                />
            )
        },
        { header: "Branch Code", accessor: "branch_code", sortable: true, filterable: true, filterType: "text" },
        { header: "Branch Name", accessor: "branch_name", sortable: true, filterable: true, filterType: "text" },
        { header: "Designation", accessor: "designation", sortable: true, filterable: true, filterType: "text" },
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
                    <button
                        onClick={() => handleStatusToggle(row)}
                        className={`relative inline-flex items-center h-4 w-7 rounded-full transition-colors duration-300 focus:outline-none ${row.status === "1" ? "bg-green-500" : "bg-gray-300"}`}
                        title={row.status === "1" ? "Set Inactive" : "Set Active"}
                    >
                        <span
                            className={`inline-block h-3 w-3 transform bg-white rounded-full shadow transition-transform duration-300 ${row.status === "1" ? "translate-x-3.5" : "translate-x-0.5"}`}
                        />
                    </button>
                </div>
            ),
        },
    ], [colors.primary, handleStatusToggle]);

    return (
        <div className="p-6">
            <Snackbar
                message={snack.message}
                type={snack.type}
                onClose={() => setSnack({ message: "", type: "success" })}
            />
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Employees</h2>
                <button
                    className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded text-white hover:bg-teal-700 transition text-base font-semibold focus:outline-none"
                    style={{ background: colors.primary, color: colors.white }}
                    onClick={() => setCreateModalOpen(true)}
                    title="Add Employee"
                >
                    <BiPlus className="text-xl" />
                    Add
                </button>
            </div>
            <TableComponent
                columns={columns}
                data={employees}
                loading={loading}
                pagination={pagination}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                showSearch={true}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search employees..."
                onTableChange={setTableState}
                onClearAllFilters={() => setSearch("")}
            />
            {/* Floating Add Button */}
            <button
                className="fixed bottom-7 right-7 z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition text-3xl focus:outline-none md:hidden"
                style={{ background: colors.primary, color: colors.white }}
                onClick={() => setCreateModalOpen(true)}
                title="Add Employee"
            >
                <BiPlus />
            </button>
            {/* Create Employee Modal */}
            {createModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl">
                        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Add Employee</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Employee Code</label>
                                <input
                                    type="text"
                                    value={createFields.employee_code}
                                    onChange={e => handleCreateFieldChange("employee_code", e.target.value)}
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
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Branch</label>
                                <Listbox value={selectedCreateBranch} onChange={handleCreateBranchChange} disabled={createLoading}>
                                    <div className="relative mt-1">
                                        <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white">
                                            <span className="block truncate">{selectedCreateBranch ? `${selectedCreateBranch.code} - ${selectedCreateBranch.name}` : "Select branch"}</span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </span>
                                        </Listbox.Button>
                                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {branches.map((branch) => (
                                                    <Listbox.Option
                                                        key={branch.id}
                                                        className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-teal-100 dark:bg-teal-700 text-teal-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}
                                                        value={branch}
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{branch.code} - {branch.name}</span>
                                                                {selected ? (
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-teal-600 dark:text-teal-300">
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
                                </Listbox>
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Designation</label>
                                <Listbox value={selectedCreateDesignation} onChange={handleCreateDesignationChange} disabled={createLoading}>
                                    <div className="relative mt-1">
                                        <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white">
                                            <span className="block truncate">{selectedCreateDesignation ? selectedCreateDesignation.designation : "Select designation"}</span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </span>
                                        </Listbox.Button>
                                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {designations.map((des) => (
                                                    <Listbox.Option
                                                        key={des.id}
                                                        className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-teal-100 dark:bg-teal-700 text-teal-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}
                                                        value={des}
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{des.designation}</span>
                                                                {selected ? (
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-teal-600 dark:text-teal-300">
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
                                </Listbox>
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
                                style={{ background: colors.primary, color: colors.white, opacity: createLoading ? 0.7 : 1 }}
                                onClick={handleCreateSave}
                                disabled={createLoading}
                            >
                                {createLoading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Employee Modal */}
            {editModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-2xl">
                        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Edit Employee</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Employee Code</label>
                                <input
                                    type="text"
                                    value={editFields.employee_code}
                                    onChange={e => handleEditFieldChange("employee_code", e.target.value)}
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
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Branch</label>
                                <Listbox value={branches.find(b => b.id === editFields.branch_id) || null} onChange={b => handleEditFieldChange("branch_id", b?.id || "")} disabled={editLoading}>
                                    <div className="relative mt-1">
                                        <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white">
                                            <span className="block truncate">{branches.find(b => b.id === editFields.branch_id) ? `${branches.find(b => b.id === editFields.branch_id).code} - ${branches.find(b => b.id === editFields.branch_id).name}` : "Select branch"}</span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </span>
                                        </Listbox.Button>
                                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {branches.map((branch) => (
                                                    <Listbox.Option
                                                        key={branch.id}
                                                        className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-teal-100 dark:bg-teal-700 text-teal-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}
                                                        value={branch}
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{branch.code} - {branch.name}</span>
                                                                {selected ? (
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-teal-600 dark:text-teal-300">
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
                                </Listbox>
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Designation</label>
                                <Listbox value={designations.find(d => d.id === editFields.designation_id) || null} onChange={d => handleEditFieldChange("designation_id", d?.id || "")} disabled={editLoading}>
                                    <div className="relative mt-1">
                                        <Listbox.Button className="relative w-full cursor-pointer rounded-md bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white">
                                            <span className="block truncate">{designations.find(d => d.id === editFields.designation_id) ? designations.find(d => d.id === editFields.designation_id).designation : "Select designation"}</span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </span>
                                        </Listbox.Button>
                                        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-900 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {designations.map((des) => (
                                                    <Listbox.Option
                                                        key={des.id}
                                                        className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-teal-100 dark:bg-teal-700 text-teal-900 dark:text-white' : 'text-gray-900 dark:text-white'}`}
                                                        value={des}
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{des.designation}</span>
                                                                {selected ? (
                                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-teal-600 dark:text-teal-300">
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
                                </Listbox>
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

export default Employees; 