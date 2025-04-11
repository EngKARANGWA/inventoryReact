import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  deliveryService,
  Delivery,
  PaginationInfo,
} from "../../services/deliveryService";
import { Sidebar } from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import DeliveryForm from "../../components/deliveries/DeliveryForm";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  Truck,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const DeliveriesManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<
    Delivery | undefined
  >(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    dateRange: "",
  });

  const fetchDeliveries = async (page: number, itemsPerPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await deliveryService.getAllDeliveries({
        page,
        pageSize: itemsPerPage,
      });
      setDeliveries(response.data);
      setPagination(response.pagination);
      if (response.data && response.data.length > 0 && isRefreshing) {
        toast.success("Deliveries refreshed successfully");
      }
    } catch (err: any) {
      console.error("Error details:", err.response?.data || err.message);
      if (!deliveries || deliveries.length === 0) {
        setError("Failed to fetch deliveries");
        toast.error("Failed to fetch deliveries");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeliveries(currentPage, pageSize);
  }, [currentPage, pageSize, isRefreshing]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDeliveries(currentPage, pageSize);
  };

  const handleAdd = () => {
    setSelectedDelivery(undefined);
    setShowForm(true);
  };

  const handleEdit = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this delivery?")) {
      try {
        await deliveryService.deleteDelivery(id);
        toast.success("Delivery deleted successfully");
        fetchDeliveries(currentPage, pageSize);
      } catch (err) {
        console.error("Error deleting delivery:", err);
        toast.error("Failed to delete delivery");
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      dateRange: "",
    });
  };

  const filteredDeliveries =
    deliveries?.filter((delivery) => {
      const matchesSearch =
        (delivery?.deliveryReference || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (delivery?.purchase?.purchaseReference || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (delivery?.driver?.user?.profile?.names || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        !filters.status || delivery?.status === filters.status;

      return matchesSearch && matchesStatus;
    }) || [];

  // Calculate summary data
  const totalDeliveries = deliveries?.length || 0;
  const completedDeliveries =
    deliveries?.filter((d) => d?.status === "completed").length || 0;
  const pendingDeliveries =
    deliveries?.filter((d) => d?.status === "pending").length || 0;
  const totalWeight =
    deliveries?.reduce((sum, d) => sum + (Number(d?.weight) || 0), 0) || 0;

  const formatStatus = (status: string) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800",
      in_transit: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    const statusLabels = {
      pending: "Pending",
      in_transit: "In Transit",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    const className =
      statusClasses[status as keyof typeof statusClasses] ||
      "bg-gray-100 text-gray-800";
    const label = statusLabels[status as keyof typeof statusLabels] || status;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 w-full">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Delivery Management
              </h1>
              <p className="text-gray-600">Manage your delivery information</p>
            </div>

            {/* Summary Cards */}
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
                      Completed Deliveries
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {completedDeliveries}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-green-600" />
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
                      {pendingDeliveries}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Weight (kg)
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalWeight.toFixed(2)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-purple-600" />
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
                    placeholder="Search deliveries..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
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
                    onClick={handleAdd}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} className="mr-2" />
                    Add Delivery
                  </button>
                  <button
                    onClick={handleRefresh}
                    className={`flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
                      isRefreshing ? "animate-spin" : ""
                    }`}
                    title="Refresh Deliveries"
                    disabled={isRefreshing}
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-3">
                    Filter Deliveries
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <option value="pending">Pending</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Range
                      </label>
                      <select
                        name="dateRange"
                        value={filters.dateRange}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Dates</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md mr-2"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Deliveries Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reference
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Purchase
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weight
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivered Date
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
                          Loading deliveries...
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
                    ) : filteredDeliveries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center">
                          No deliveries found matching your criteria
                        </td>
                      </tr>
                    ) : (
                      filteredDeliveries.map((delivery) => (
                        <tr key={delivery.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {delivery.deliveryReference}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {delivery.purchase?.purchaseReference || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {delivery.driver?.user?.profile?.names || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatStatus(delivery.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {delivery.weight || "N/A"} kg
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {delivery.deliveredAt
                                ? new Date(
                                    delivery.deliveredAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(delivery)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                              title="Edit Delivery"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(delivery.id)}
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
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.pageSize,
                      pagination.total
                    )}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, pagination.totalPages)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delivery Form Modal */}
      {showForm && (
        <DeliveryForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedDelivery(undefined);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedDelivery(undefined);
            fetchDeliveries(currentPage, pageSize);
          }}
          delivery={selectedDelivery}
        />
      )}
    </div>
  );
};

export default DeliveriesManagement;
