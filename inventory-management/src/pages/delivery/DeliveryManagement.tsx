import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import {
  Search,
  Edit2,
  Trash2,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  Truck,
  Package,
  Calendar as CalendarIcon,
  Check,
  X,
  Clock,
  RefreshCw,
  MapPin,
  User,
  ShoppingBag,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { deliveryService, Delivery } from "../../services/deliveryService";
import { driverService } from "../../services/driverService";
import { purchaseService } from "../../services/purchaseService";
import { warehouseService } from "../../services/warehouseServices";

const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";

interface Driver {
  id: number;
  driverId: string;
  licenseNumber: string;
  userId: number;
  user: {
    profile: {
      names: string;
    };
  };
}

interface Purchase {
  id: number;
  purchaseReference: string;
  description: string;
  productId: number;
  product?: {
    name: string;
  };
}

interface Warehouse {
  id: number;
  name: string;
  location: string;
}

const DeliveryManagement: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Delivery;
    direction: "ascending" | "descending";
  } | null>(null);

  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    status: "",
    includeDeleted: false,
  });

  const [formData, setFormData] = useState({
    purchaseId: "",
    driverId: "",
    weight: "",
    notes: "",
    warehouseId: "",
  });

  const [drivers, setDrivers] = useState<{ id: number; name: string }[]>([]);
  const [purchases, setPurchases] = useState<{ id: number; reference: string; description: string }[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    fetchDeliveries();
  }, [filters]);

  useEffect(() => {
    if (showAddForm) {
      fetchDropdownOptions();
    }
  }, [showAddForm]);

  const fetchDropdownOptions = async () => {
    try {
      setLoadingDrivers(true);
      setLoadingPurchases(true);
      setLoadingWarehouses(true);

      const [drivers, purchases, warehouses] = await Promise.all([
        driverService.getAllDrivers(),
        purchaseService.getAllPurchases({ status: "approved" }),
        warehouseService.getAllWarehouses(),
      ]);

      setDrivers(
        drivers.map((driver) => ({
          id: driver.id,
          name: driver.user?.profile?.names || "Unknown Driver",
        }))
      );

      setPurchases(
        purchases.map((purchase) => ({
          id: purchase.id,
          reference: purchase.purchaseReference,
          description: purchase.description,
        }))
      );

      setWarehouses(warehouses);
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      toast.error("Failed to load form options");
    } finally {
      setLoadingDrivers(false);
      setLoadingPurchases(false);
      setLoadingWarehouses(false);
    }
  };

  const fetchDeliveries = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, pagination } = await deliveryService.getAllDeliveries({
        ...filters,
        search: searchTerm,
      });

      setDeliveries(data || []);
      setTotalDeliveries(pagination?.total || 0);
    } catch (err) {
      console.error("Error fetching deliveries:", err);
      setError("Failed to fetch deliveries. Please try again later.");
      toast.error("Failed to load deliveries");
      setDeliveries([]);
      setTotalDeliveries(0);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDeliveries();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDeliveries();
  };

  const handleAddClick = () => {
    setFormData({
      purchaseId: "",
      driverId: "",
      weight: "",
      notes: "",
      warehouseId: "",
    });
    setEditingDelivery(null);
    setShowAddForm(true);
  };

  const handleEditClick = (delivery: Delivery) => {
    setFormData({
      purchaseId: String(delivery.purchaseId),
      driverId: String(delivery.driverId),
      weight: delivery.weight,
      notes: delivery.notes || "",
      warehouseId: "",
    });
    setEditingDelivery(delivery);
    setShowAddForm(true);
  };

  const handleDeleteDelivery = async (deliveryId: number) => {
    if (window.confirm("Are you sure you want to delete this delivery?")) {
      try {
        await deliveryService.deleteDelivery(deliveryId);
        setDeliveries(deliveries.filter((d) => d.id !== deliveryId));
        setTotalDeliveries(totalDeliveries - 1);
        toast.success("Delivery deleted successfully");
      } catch (err: any) {
        console.error("Error deleting delivery:", err);
        toast.error(err.message || "Failed to delete delivery");
      }
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
      const deliveryData = {
        purchaseId: Number(formData.purchaseId),
        driverId: Number(formData.driverId),
        weight: parseFloat(formData.weight),
        notes: formData.notes,
        warehouseId: formData.warehouseId ? Number(formData.warehouseId) : undefined,
      };

      if (editingDelivery) {
        const updatedDelivery = await deliveryService.updateDelivery(
          editingDelivery.id,
          { 
            notes: formData.notes,
            weight: parseFloat(formData.weight),
            warehouseId: formData.warehouseId ? Number(formData.warehouseId) : undefined,
          }
        );
        setDeliveries(
          deliveries.map((d) =>
            d.id === editingDelivery.id ? updatedDelivery : d
          )
        );
        toast.success("Delivery updated successfully");
      } else {
        const newDelivery = await deliveryService.createDelivery(deliveryData);
        setDeliveries([newDelivery, ...deliveries]);
        setTotalDeliveries(totalDeliveries + 1);
        toast.success("Delivery created successfully");
      }

      setShowAddForm(false);
    } catch (err: any) {
      console.error("Error saving delivery:", err);
      toast.error(err.message || "Failed to save delivery");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const requestSort = (key: keyof Delivery) => {
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

  const sortedDeliveries = React.useMemo(() => {
    if (!sortConfig) return deliveries;

    return [...deliveries].sort((a, b) => {
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
  }, [deliveries, sortConfig]);

  const getStatusCount = (status: string) => {
    return deliveries.filter((d) => d.status === status).length;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <X className="w-4 h-4 text-red-500" />;
      case "in_transit":
        return <Truck className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  const totalWeight = deliveries.reduce(
    (sum, d) => sum + parseFloat(d.weight || "0"),
    0
  );

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(totalDeliveries / pageSize);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 w-full p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Delivery Management
              </h1>
              <p className="text-gray-600">
                Track and manage product deliveries from suppliers
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Deliveries
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalDeliveries}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Pending Deliveries
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {getStatusCount("pending")}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      In Transit
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {getStatusCount("in_transit")}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Weight
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalWeight.toFixed(2)} Kg
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex-1 max-w-md"
                >
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search deliveries..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </form>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Filter size={18} className="mr-2" />
                    Filters
                    {showFilters ? (
                      <ChevronUp size={18} className="ml-2" />
                    ) : (
                      <ChevronDown size={18} className="ml-2" />
                    )}
                  </button>
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
                    New Delivery
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Filters
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Statuses</option>
                        {deliveryService.getDeliveryStatusOptions().map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Items per page
                      </label>
                      <select
                        name="pageSize"
                        value={filters.pageSize}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={fetchDeliveries}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("deliveryReference")}
                      >
                        <div className="flex items-center">
                          Reference
                          {sortConfig?.key === "deliveryReference" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purchase
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("weight")}
                      >
                        <div className="flex items-center">
                          Weight (Kg)
                          {sortConfig?.key === "weight" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("deliveredAt")}
                      >
                        <div className="flex items-center">
                          Delivery Date
                          {sortConfig?.key === "deliveredAt" && (
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
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center space-x-2">
                            <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
                            <span>Loading deliveries...</span>
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
                    ) : sortedDeliveries.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No deliveries found.{" "}
                          {searchTerm && "Try a different search term."}
                        </td>
                      </tr>
                    ) : (
                      sortedDeliveries.map((delivery) => (
                        <tr key={delivery.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {delivery.deliveryReference}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <ShoppingBag className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {delivery.purchase?.purchaseReference || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-xs">
                                  {delivery.purchase?.description || "No description"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {parseFloat(delivery.weight).toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
                              <div className="text-sm text-gray-900">
                                {delivery.driver?.user?.profile?.names || "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <CalendarIcon className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
                              <div className="text-sm text-gray-900">
                                {delivery.deliveredAt
                                  ? new Date(delivery.deliveredAt).toLocaleDateString()
                                  : "Not delivered"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(delivery.status)}
                              <span
                                className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}
                              >
                                {delivery.status.replace("_", " ")}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditClick(delivery)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                              title="Edit Delivery"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteDelivery(delivery.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Delivery"
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

              {totalDeliveries > 0 && (
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between items-center sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage >= totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * pageSize + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(currentPage * pageSize, totalDeliveries)}
                        </span>{" "}
                        of <span className="font-medium">{totalDeliveries}</span>{" "}
                        results
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage === 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronUp className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === pageNum
                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            currentPage >= totalPages
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <ChevronDown className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingDelivery ? "Edit Delivery" : "Create New Delivery"}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Purchase Select */}
                <div className="col-span-1">
                  <label
                    htmlFor="purchaseId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Purchase <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="purchaseId"
                    name="purchaseId"
                    value={formData.purchaseId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!editingDelivery || isSubmitting || loadingPurchases}
                  >
                    <option value="">
                      {loadingPurchases
                        ? "Loading purchases..."
                        : "Select a purchase"}
                    </option>
                    {purchases.map((purchase) => (
                      <option key={purchase.id} value={purchase.id}>
                        {purchase.reference} - {purchase.description}
                      </option>
                    ))}
                  </select>
                  {!loadingPurchases && purchases.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      No approved purchases available
                    </p>
                  )}
                </div>

                {/* Driver Select */}
                <div className="col-span-1">
                  <label
                    htmlFor="driverId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Driver <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="driverId"
                    name="driverId"
                    value={formData.driverId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!editingDelivery || isSubmitting || loadingDrivers}
                  >
                    <option value="">
                      {loadingDrivers
                        ? "Loading drivers..."
                        : "Select a driver"}
                    </option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                  {!loadingDrivers && drivers.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      No drivers available. Please add drivers first.
                    </p>
                  )}
                </div>

                {/* Weight Input */}
                <div className="col-span-1">
                  <label
                    htmlFor="weight"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Weight (Kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Warehouse Select */}
                <div className="col-span-1">
                  <label
                    htmlFor="warehouseId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Destination Warehouse
                  </label>
                  <select
                    id="warehouseId"
                    name="warehouseId"
                    value={formData.warehouseId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting || loadingWarehouses}
                  >
                    <option value="">Select warehouse (optional)</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.location})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional delivery information..."
                    disabled={isSubmitting}
                  />
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
                  disabled={
                    isSubmitting ||
                    loadingDrivers ||
                    loadingPurchases ||
                    drivers.length === 0 ||
                    purchases.length === 0
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" />
                      {editingDelivery ? "Updating..." : "Creating..."}
                    </>
                  ) : editingDelivery ? (
                    "Update Delivery"
                  ) : (
                    "Create Delivery"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default DeliveryManagement;