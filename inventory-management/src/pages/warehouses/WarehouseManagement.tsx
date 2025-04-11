import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import {
  Search,
  Edit2,
  Trash2,
  Plus,
  Warehouse,
  MapPin,
  Box,
  Package,
  User,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import {
  warehouseService,
  Warehouse as WarehouseType,
} from "../../services/warehouseServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

interface StockKeeper {
  id: number;
  userId: number;
  user: {
    id: number;
    username: string;
    email: string;
    profile?: {
      names: string;
    };
  };
}

const WarehouseManagement: React.FC = () => {
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  // const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] =
    useState<WarehouseType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof WarehouseType;
    direction: "ascending" | "descending";
  } | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null
  );
  const [newManagerId, setNewManagerId] = useState<string>("");
  const [isSubmittingManager, setIsSubmittingManager] = useState(false);
  const [stockKeepers, setStockKeepers] = useState<StockKeeper[]>([]);
  const [loadingStockKeepers, setLoadingStockKeepers] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    status: "active",
  });

  // Fetch warehouses on component mount
  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Fetch stockkeepers when manager form is shown
  useEffect(() => {
    if (showManagerForm) {
      fetchStockKeepers();
    }
  }, [showManagerForm]);

  const fetchStockKeepers = async () => {
    setLoadingStockKeepers(true);
    try {
      const response = await axios.get(
        "https://test.gvibyequ.a2hosted.com/api/stockkeeper"
      );
      setStockKeepers(response.data);
    } catch (err) {
      console.error("Error fetching stock keepers:", err);
      toast.error("Failed to load stock keepers");
    } finally {
      setLoadingStockKeepers(false);
    }
  };

  const fetchWarehouses = async () => {
    setLoading(true);
    setError("");
    try {
      const warehousesData = await warehouseService.getAllWarehouses();
      setWarehouses(warehousesData);
      // Calculate total pages
      setPagination((prev) => ({
        ...prev,
        totalPages: Math.ceil(warehousesData.length / prev.pageSize),
      }));
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      setError("Failed to fetch warehouses. Please try again later.");
      toast.error("Failed to load warehouses");
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchWarehouses();
    toast.info("Refreshing warehouse data...");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleAddClick = () => {
    setFormData({
      name: "",
      location: "",
      capacity: "",
      status: "active",
    });
    setEditingWarehouse(null);
    setShowAddForm(true);
  };

  const handleEditClick = (warehouse: WarehouseType) => {
    setFormData({
      name: warehouse.name,
      location: warehouse.location,
      capacity: String(warehouse.capacity),
      status: warehouse.status,
    });
    setEditingWarehouse(warehouse);
    setShowAddForm(true);
  };

  const handleDeleteWarehouse = async (warehouseId: number) => {
    if (window.confirm("Are you sure you want to delete this warehouse?")) {
      try {
        await warehouseService.deleteWarehouse(warehouseId);
        setWarehouses(warehouses.filter((wh) => wh.id !== warehouseId));
        toast.success("Warehouse deleted successfully");
      } catch (err: any) {
        console.error("Error deleting warehouse:", err);
        toast.error(err.message || "Failed to delete warehouse");
      }
    }
  };

  const handleChangeManagerClick = (warehouseId: number) => {
    setSelectedWarehouseId(warehouseId);
    setNewManagerId("");
    setShowManagerForm(true);
  };

  const handleChangeManagerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouseId || isSubmittingManager) {
      return;
    }

    if (!newManagerId) {
      toast.error("Please select a manager");
      return;
    }

    setIsSubmittingManager(true);

    try {
      await warehouseService.changeManager(selectedWarehouseId, {
        newManagerId: Number(newManagerId),
      });
      toast.success("Manager changed successfully");
      fetchWarehouses();
      setShowManagerForm(false);
      setNewManagerId("");
    } catch (err: any) {
      console.error("Error changing manager:", err);
      toast.error(err.message || "Failed to change manager");
    } finally {
      setIsSubmittingManager(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const warehouseData = {
        ...formData,
        capacity: Number(formData.capacity),
        status: formData.status as "active" | "inactive",
      };

      if (editingWarehouse) {
        const updatedWarehouse = await warehouseService.updateWarehouse(
          editingWarehouse.id,
          warehouseData
        );
        setWarehouses(
          warehouses.map((wh) =>
            wh.id === editingWarehouse.id ? updatedWarehouse : wh
          )
        );
        toast.success("Warehouse updated successfully");
      } else {
        const newWarehouse = await warehouseService.createWarehouse(
          warehouseData
        );
        setWarehouses([...warehouses, newWarehouse]);
        toast.success("Warehouse created successfully");
      }

      setShowAddForm(false);
    } catch (err: any) {
      console.error("Error saving warehouse:", err);
      toast.error(err.message || "Failed to save warehouse");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Enhanced search functionality that searches all columns
  const filteredWarehouses = React.useMemo(() => {
    if (!searchTerm) return warehouses;

    const searchLower = searchTerm.toLowerCase();
    return warehouses.filter(
      (warehouse) =>
        warehouse.name.toLowerCase().includes(searchLower) ||
        warehouse.location.toLowerCase().includes(searchLower) ||
        warehouse.capacity.toString().includes(searchTerm) ||
        warehouse.currentOccupancy.toString().includes(searchTerm) ||
        warehouse.status.toLowerCase().includes(searchLower) ||
        (warehouse.manager?.user?.username || "").toLowerCase().includes(searchLower)
    );
  }, [warehouses, searchTerm]);

  // Sorting functionality with null checks
  const requestSort = (key: keyof WarehouseType) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedWarehouses = React.useMemo(() => {
    let result = [...filteredWarehouses];

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? "";
        const bValue = b[sortConfig.key] ?? "";

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [filteredWarehouses, sortConfig]);

  // Pagination functions
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setPagination({
      page: 1,
      pageSize: newSize,
      totalPages: Math.ceil(filteredWarehouses.length / newSize),
    });
  };

  // Calculate paginated data
  const paginatedWarehouses = React.useMemo(() => {
    return sortedWarehouses.slice(
      (pagination.page - 1) * pagination.pageSize,
      pagination.page * pagination.pageSize
    );
  }, [sortedWarehouses, pagination.page, pagination.pageSize]);

  // Update total pages when filtered results change
  React.useEffect(() => {
    const totalPages = Math.ceil(
      filteredWarehouses.length / pagination.pageSize
    );
    if (totalPages !== pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        totalPages,
        // Reset to first page if current page would be beyond new total pages
        page: prev.page > totalPages ? 1 : prev.page,
      }));
    }
  }, [filteredWarehouses.length, pagination.pageSize]);

  // Calculate summary data
  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter(
    (wh) => wh.status === "active"
  ).length;
  const totalCapacity = warehouses.reduce(
    (sum, wh) => sum + (wh.capacity || 0),
    0
  );
  const totalOccupancy = warehouses.reduce(
    (sum, wh) => sum + (wh.currentOccupancy || 0),
    0
  );
  const utilizationRate =
    totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 w-full p-6">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Warehouse Management
              </h1>
              <p className="text-gray-600">
                Manage your warehouses and inventory locations
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Warehouses
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalWarehouses}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Warehouse className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Active Warehouses
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {activeWarehouses}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Box className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Capacity
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalCapacity} KGs
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Utilization Rate
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {utilizationRate}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search warehouses by name, location, capacity, etc..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRefresh}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Refresh data"
                  >
                    <RefreshCw size={18} />
                  </button>
                  <button
                    onClick={handleAddClick}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Plus size={18} className="mr-2" />
                    Add Warehouse
                  </button>
                </div>
              </div>
            </div>

            {/* Warehouses Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("name")}
                      >
                        <div className="flex items-center">
                          Name
                          {sortConfig?.key === "name" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("location")}
                      >
                        <div className="flex items-center">
                          Location
                          {sortConfig?.key === "location" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("capacity")}
                      >
                        <div className="flex items-center">
                          Capacity
                          {sortConfig?.key === "capacity" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("currentOccupancy")}
                      >
                        <div className="flex items-center">
                          Occupancy
                          {sortConfig?.key === "currentOccupancy" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          {sortConfig?.key === "status" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Manager
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-4 text-center text-red-600"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : paginatedWarehouses.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No warehouses found.{" "}
                          {searchTerm && "Try a different search term."}
                        </td>
                      </tr>
                    ) : (
                      paginatedWarehouses.map((warehouse) => (
                        <tr key={warehouse.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {warehouse.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MapPin className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                              <div className="text-sm text-gray-900">
                                {warehouse.location}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {warehouse.capacity.toLocaleString()} Kg
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {warehouse.currentOccupancy.toLocaleString()} /{" "}
                              {warehouse.capacity.toLocaleString()}
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full"
                                  style={{
                                    width: `${
                                      (warehouse.currentOccupancy /
                                        warehouse.capacity) *
                                      100
                                    }%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                warehouse.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {warehouse.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {warehouse.manager ? (
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-4 w-4 text-gray-500" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {warehouse.manager.user?.username}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500 italic">
                                No manager assigned
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditClick(warehouse)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                              title="Edit Warehouse"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() =>
                                warehouse.id &&
                                handleChangeManagerClick(warehouse.id)
                              }
                              className="text-purple-600 hover:text-purple-900 mr-4"
                              title="Change Manager"
                            >
                              <User size={18} />
                            </button>
                            <button
                              onClick={() =>
                                warehouse.id &&
                                handleDeleteWarehouse(warehouse.id)
                              }
                              className="text-red-600 hover:text-red-900"
                              title="Delete Warehouse"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
                <div className="flex items-center mb-2 sm:mb-0">
                  <span className="text-sm text-gray-700 mr-2">
                    Showing {(pagination.page - 1) * pagination.pageSize + 1}-
                    {Math.min(
                      pagination.page * pagination.pageSize,
                      filteredWarehouses.length
                    )}{" "}
                    of {filteredWarehouses.length}
                  </span>
                  <select
                    value={pagination.pageSize}
                    onChange={handlePageSizeChange}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    {[5, 10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        Show {size}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                    className={`px-3 py-1 rounded ${
                      pagination.page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    First
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`px-3 py-1 rounded ${
                      pagination.page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className={`px-3 py-1 rounded ${
                      pagination.page >= pagination.totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page >= pagination.totalPages}
                    className={`px-3 py-1 rounded ${
                      pagination.page >= pagination.totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Warehouse Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingWarehouse ? "Edit Warehouse" : "Add New Warehouse"}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Warehouse Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label
                    htmlFor="capacity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Capacity (Kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {editingWarehouse ? "Updating..." : "Creating..."}
                    </>
                  ) : editingWarehouse ? (
                    "Update Warehouse"
                  ) : (
                    "Create Warehouse"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Manager Modal */}
      {showManagerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Change Warehouse Manager
              </h2>
              <button
                onClick={() => setShowManagerForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleChangeManagerSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="newManagerId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Select Manager <span className="text-red-500">*</span>
                  </label>
                  {loadingStockKeepers ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <select
                      id="newManagerId"
                      name="newManagerId"
                      value={newManagerId}
                      onChange={(e) => setNewManagerId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a manager</option>
                      {stockKeepers.map((sk) => (
                        <option key={sk.id} value={sk.id}>
                          {" "}
                          {/* Use sk.id instead of sk.user.id */}
                          {sk.user.profile?.names || sk.user.username}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Select a StockKeeper to assign as manager
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowManagerForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isSubmittingManager ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  disabled={isSubmittingManager || !newManagerId}
                >
                  {isSubmittingManager ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Changing...
                    </>
                  ) : (
                    "Change Manager"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        aria-label="Notification container"
      />
    </div>
  );
};

export default WarehouseManagement;
