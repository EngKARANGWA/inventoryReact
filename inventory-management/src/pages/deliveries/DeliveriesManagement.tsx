import React, { useState, useEffect, useCallback } from "react";
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
  Warehouse,
  Calendar,
  Check,
  X,
  Clock,
  RefreshCw,
  ArrowDown,
  ArrowUp,
  Eye,
  Download,
  FileText,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { deliveryService, Delivery } from "../../services/deliveryService";
import Select from "react-select";
import axios from "axios";

const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";

interface DeliveryFilters {
  page: number;
  pageSize: number;
  status: "completed" | "pending" | "delivered" | "cancelled" | undefined;
  direction: "in" | "out" | undefined;
  productId: number | undefined;
  warehouseId: number | undefined;
  driverId: number | undefined;
  dateFrom: string;
  dateTo: string;
  search?: string;
}

const DeliveryManagement: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [loadingSales, setLoadingSales] = useState(false);
  // const [setSalesSearch] = useState("");
  const [salesSearch, setSalesSearch] = useState("");
  // const [setPurchasesSearch] = useState("");
  const [purchasesSearch, setPurchasesSearch] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(
    null
  );
  const [viewType, setViewType] = useState<"table" | "cards">("table");

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Delivery;
    direction: "ascending" | "descending";
  } | null>({
    key: "deliveredAt",
    direction: "descending",
  });

  const [filters, setFilters] = useState<DeliveryFilters>({
    page: 1,
    pageSize: 10,
    status: undefined,
    direction: undefined,
    productId: undefined,
    warehouseId: undefined,
    driverId: undefined,
    dateFrom: "",
    dateTo: "",
  });

  const [formData, setFormData] = useState({
    direction: "in" as "in" | "out",
    quantity: "",
    driverId: "",
    productId: "",
    warehouseId: "",
    purchaseId: "",
    saleId: "",
    notes: "",
  });

  const [products, setProducts] = useState<
    { id: number; name: string; description: string }[]
  >([]);
  const [warehouses, setWarehouses] = useState<
    { id: number; name: string; location: string }[]
  >([]);
  const [drivers, setDrivers] = useState<
    { id: number; driverId: string; user: { profile?: { names: string } } }[]
  >([]);
  const [purchases, setPurchases] = useState<
    {
      id: number;
      purchaseReference: string;
      description: string;
      product?: { name: string };
    }[]
  >([]);
  const [sales, setSales] = useState<
    { id: number; referenceNumber: string; product?: { name: string } }[]
  >([]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(num);
  };

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await deliveryService.getAllDeliveries({
        ...filters,
        search: searchTerm,
      });

      // Handle the response structure correctly
      setDeliveries(response.deliveries || []);
      setTotalDeliveries(response.total || 0);
    } catch (err) {
      console.error("Error fetching deliveries:", err);
      setError("Failed to fetch deliveries. Please try again later.");
      toast.error("Failed to load deliveries");
      setDeliveries([]);
      setTotalDeliveries(0);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const fetchDropdownOptions = useCallback(async () => {
    try {
      setLoadingProducts(true);
      setLoadingDrivers(true);
      setLoadingWarehouses(true);
  
      const [productsRes, warehousesRes, driversRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products`),
        axios.get(`${API_BASE_URL}/warehouse`),
        axios.get(`${API_BASE_URL}/drivers`, {
          params: { include: "user.profile" },
        }),
      ]);
  
      setProducts(productsRes.data || []);
      setWarehouses(warehousesRes.data || []);
      setDrivers(driversRes.data || []);
  
      if (formData.direction === "in") {
        setLoadingPurchases(true);
        const purchasesRes = await axios.get(`${API_BASE_URL}/purchases`, {
          params: { 
            include: "product",
            search: purchasesSearch // Add search param
          },
        });
        setPurchases(purchasesRes.data || []);
      } else if (formData.direction === "out") {
        setLoadingSales(true);
        const salesRes = await axios.get(`${API_BASE_URL}/sales`, {
          params: { 
            include: "product",
            search: salesSearch // Add search param
          },
        });
        setSales(salesRes.data?.data || []);
      }
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      toast.error("Failed to load form options");
    } finally {
      setLoadingProducts(false);
      setLoadingDrivers(false);
      setLoadingWarehouses(false);
      setLoadingPurchases(false);
      setLoadingSales(false);
    }
  }, [formData.direction, purchasesSearch, salesSearch]);

  useEffect(() => {
    if (showAddForm) {
      fetchDropdownOptions();
    }
  }, [showAddForm, formData.direction, fetchDropdownOptions]);

  const handleRefresh = () => {
    fetchDeliveries();
    toast.info("Deliveries refreshed");
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
      direction: "in",
      quantity: "",
      driverId: "",
      productId: "",
      warehouseId: "",
      purchaseId: "",
      saleId: "",
      notes: "",
    });
    setEditingDelivery(null);
    setShowAddForm(true);
  };

  const handleEditClick = (delivery: Delivery) => {
    setFormData({
      direction: delivery.direction,
      quantity: delivery.quantity.toString(),
      driverId: delivery.driverId.toString(),
      productId: delivery.productId?.toString() || "",
      warehouseId: delivery.warehouseId?.toString() || "",
      purchaseId: delivery.purchaseId?.toString() || "",
      saleId: delivery.saleId?.toString() || "",
      notes: delivery.notes || "",
    });
    setEditingDelivery(delivery);
    setShowAddForm(true);
  };

  const handleDeleteConfirm = (deliveryId: number) => {
    setShowConfirmDelete(deliveryId);
  };

  const handleDeleteDelivery = async (deliveryId: number) => {
    try {
      setIsSubmitting(true);
      await deliveryService.deleteDelivery(deliveryId);
      setDeliveries(deliveries.filter((d) => d.id !== deliveryId));
      setTotalDeliveries(totalDeliveries - 1);
      toast.success("Delivery deleted successfully");
      setShowConfirmDelete(null);
    } catch (err: any) {
      console.error("Error deleting delivery:", err);
      toast.error(err.message || "Failed to delete delivery");
    } finally {
      setIsSubmitting(false);
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
      ...(name === "direction" && {
        purchaseId: "",
        saleId: "",
      }),
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const deliveryData = {
        direction: formData.direction,
        quantity: parseFloat(formData.quantity),
        driverId: Number(formData.driverId),
        productId: Number(formData.productId),
        warehouseId: Number(formData.warehouseId),
        notes: formData.notes,
        ...(formData.direction === "in" && formData.purchaseId
          ? { purchaseId: Number(formData.purchaseId) }
          : {}),
        ...(formData.direction === "out" && formData.saleId
          ? { saleId: Number(formData.saleId) }
          : {}),
      };

      if (editingDelivery) {
        const updatedDelivery = await deliveryService.updateDelivery(
          editingDelivery.id,
          { notes: formData.notes }
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
      [name]: value === "" ? undefined : name.includes("Id") ? Number(value) : value,
      page: 1,
    }));
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));

    // Scroll to top of the table
    const tableElement = document.getElementById("deliveries-table-container");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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

  const filteredDeliveries = React.useMemo(() => {
    if (!searchTerm) return sortedDeliveries;

    return sortedDeliveries.filter((delivery) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        delivery.deliveryReference.toLowerCase().includes(searchLower) ||
        (delivery.driver?.user?.profile?.names
          ?.toLowerCase()
          .includes(searchLower) ??
          false) ||
        (delivery.product?.name.toLowerCase().includes(searchLower) ?? false) ||
        (delivery.warehouse?.name.toLowerCase().includes(searchLower) ??
          false) ||
        delivery.direction.toLowerCase().includes(searchLower) ||
        delivery.status.toLowerCase().includes(searchLower)
      );
    });
  }, [sortedDeliveries, searchTerm]);

  const completedDeliveries = deliveries.filter(
    (d) => d.status === "completed"
  ).length;
  const pendingDeliveries = deliveries.filter(
    (d) => d.status === "pending"
  ).length;
  const deliveredDeliveries = deliveries.filter(
    (d) => d.status === "delivered"
  ).length;
  // const cancelledDeliveries = deliveries.filter(
  //   (d) => d.status === "cancelled"
  // ).length;
  // const incomingDeliveries = deliveries.filter(
  //   (d) => d.direction === "in"
  // ).length;
  // const outgoingDeliveries = deliveries.filter(
  //   (d) => d.direction === "out"
  // ).length;
  const totalQuantity = deliveries.reduce(
    (sum, d) => sum + Number(d.quantity || 0),
    0
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />;
      case "delivered":
        return <Truck className="w-4 h-4 text-blue-500" />;
      case "cancelled":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === "in" ? (
      <ArrowDown className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowUp className="w-4 h-4 text-red-500" />
    );
  };

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(totalDeliveries / pageSize);
  const paginatedDeliveries = filteredDeliveries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const salesOptions = sales.map((sale) => ({
    value: sale.id,
    label: `${sale.referenceNumber || "N/A"} (${
      sale.product?.name || "Unknown Product"
    })`,
  }));

  const purchasesOptions = purchases.map((purchase) => ({
    value: purchase.id,
    label: `${purchase.purchaseReference} (${
      purchase.product?.name || "Unknown Product"
    })`,
  }));

  const handleExportData = () => {
    toast.info("Data export feature will be implemented soon!");
  };

  const toggleViewType = () => {
    setViewType((prev) => (prev === "table" ? "cards" : "table"));
  };

  const renderSkeleton = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <tr key={`skeleton-${i}`} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </td>
          <td className="px-6 py-4 text-right">
            <div className="h-6 bg-gray-200 rounded w-16 inline-block"></div>
          </td>
        </tr>
      ));
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 w-full p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <Truck className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600" />
                Delivery Management
              </h1>
              <p className="text-gray-600">
                Manage product deliveries to/from warehouses
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Total Deliveries
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        totalDeliveries
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Total quantity:{" "}
                  {loading ? "..." : `${formatNumber(totalQuantity)} Kg`}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Completed Deliveries
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        completedDeliveries + deliveredDeliveries
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {loading
                    ? "..."
                    : `${(
                        ((completedDeliveries + deliveredDeliveries) /
                          totalDeliveries) *
                          100 || 0
                      ).toFixed(1)}% of total`}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Pending Deliveries
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        pendingDeliveries
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {loading
                    ? "..."
                    : `${(
                        (pendingDeliveries / totalDeliveries) * 100 || 0
                      ).toFixed(1)}% of total`}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Total Quantity
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        formatNumber(totalQuantity)
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">Quantity in Kg</div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex-1 w-full max-w-md"
                >
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search deliveries..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </form>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    aria-expanded={showFilters}
                    aria-controls="filters-panel"
                  >
                    <Filter size={16} className="mr-1 md:mr-2" />
                    <span>Filters</span>
                    {showFilters ? (
                      <ChevronUp size={16} className="ml-1" />
                    ) : (
                      <ChevronDown size={16} className="ml-1" />
                    )}
                  </button>

                  <button
                    onClick={toggleViewType}
                    className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    title={`Switch to ${
                      viewType === "table" ? "card" : "table"
                    } view`}
                  >
                    <FileText size={16} className="mr-1" />
                    <span>{viewType === "table" ? "Cards" : "Table"}</span>
                  </button>

                  <button
                    onClick={handleExportData}
                    className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    title="Export data"
                  >
                    <Download size={16} className="mr-1" />
                    <span>Export</span>
                  </button>

                  <button
                    onClick={handleRefresh}
                    className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    title="Refresh data"
                  >
                    <RefreshCw size={16} />
                    <span className="sr-only">Refresh</span>
                  </button>

                  <button
                    onClick={handleAddClick}
                    className="flex items-center px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  >
                    <Plus size={16} className="mr-1 md:mr-2" />
                    <span>New Delivery</span>
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div
                  id="filters-panel"
                  className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all"
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Filter size={16} className="mr-2" />
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Direction
                      </label>
                      <select
                        name="direction"
                        value={filters.direction}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">All Directions</option>
                        <option value="in">Incoming</option>
                        <option value="out">Outgoing</option>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        name="dateFrom"
                        value={filters.dateFrom}
                        onChange={handleDateFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To Date
                      </label>
                      <input
                        type="date"
                        name="dateTo"
                        value={filters.dateTo}
                        onChange={handleDateFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
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

            {/* Empty State */}
            {!loading && filteredDeliveries.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Truck className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No deliveries found
                </h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  {searchTerm
                    ? `No deliveries matching "${searchTerm}" were found. Try a different search term or clear your filters.`
                    : "There are no deliveries to display. Start by creating a new delivery."}
                </p>
                <button
                  onClick={handleAddClick}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                  <Plus size={16} className="mr-2" />
                  Create New Delivery
                </button>
              </div>
            )}

            {/* Deliveries Display - Table View */}
            {viewType === "table" && (
              <div
                id="deliveries-table-container"
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
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
                                {sortConfig.direction === "ascending"
                                  ? "↑"
                                  : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("product")}
                        >
                          <div className="flex items-center">
                            Product
                            {sortConfig?.key === "product" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending"
                                  ? "↑"
                                  : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("direction")}
                        >
                          <div className="flex items-center">
                            Direction
                            {sortConfig?.key === "direction" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending"
                                  ? "↑"
                                  : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("quantity")}
                        >
                          <div className="flex items-center">
                            Quantity (Kg)
                            {sortConfig?.key === "quantity" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending"
                                  ? "↑"
                                  : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("driver")}
                        >
                          <div className="flex items-center">
                            Driver
                            {sortConfig?.key === "driver" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending"
                                  ? "↑"
                                  : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("warehouse")}
                        >
                          <div className="flex items-center">
                            Warehouse
                            {sortConfig?.key === "warehouse" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending"
                                  ? "↑"
                                  : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("deliveredAt")}
                        >
                          <div className="flex items-center">
                            Date
                            {sortConfig?.key === "deliveredAt" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending"
                                  ? "↑"
                                  : "↓"}
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
                                {sortConfig.direction === "ascending"
                                  ? "↑"
                                  : "↓"}
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
                        renderSkeleton()
                      ) : error ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center text-red-600">
                              <AlertCircle className="w-5 h-5 mr-2" />
                              {error}
                            </div>
                          </td>
                        </tr>
                      ) : filteredDeliveries.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No deliveries found.{" "}
                            {searchTerm && "Try a different search term."}
                          </td>
                        </tr>
                      ) : (
                        paginatedDeliveries.map((delivery) => (
                          <tr
                            key={delivery.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {delivery.deliveryReference}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(
                                  delivery.createdAt
                                ).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {delivery.product?.name || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getDirectionIcon(delivery.direction)}
                                <span className="ml-1 capitalize">
                                  {delivery.direction}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {delivery.direction === "in"
                                  ? delivery.purchase?.purchaseReference
                                  : delivery.sale?.referenceNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatNumber(Number(delivery.quantity))} Kg
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {delivery.driver?.user?.profile?.names || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {delivery.warehouse?.name || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {delivery.warehouse?.location}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                                <div className="text-sm text-gray-900">
                                  {new Date(
                                    delivery.deliveredAt
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(delivery.status)}
                                <span
                                  className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    delivery.status
                                  )}`}
                                >
                                  {delivery.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedDelivery(delivery);
                                    setShowViewModal(true);
                                  }}
                                  className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </button>

                                <button
                                  onClick={() => handleEditClick(delivery)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                  title="Edit Delivery"
                                >
                                  <Edit2 size={18} />
                                </button>

                                <button
                                  onClick={() =>
                                    handleDeleteConfirm(delivery.id)
                                  }
                                  className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                  title="Delete Delivery"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredDeliveries.length > 0 && (
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <ArrowLeft size={16} className="mr-1" />
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
                        <ArrowRight size={16} className="ml-1" />
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
                            {Math.min(
                              currentPage * pageSize,
                              filteredDeliveries.length
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {filteredDeliveries.length}
                          </span>{" "}
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
                            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                          </button>

                          {/* Page Numbers */}
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
                            <ArrowRight
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Card View */}
            {viewType === "cards" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {loading ? (
                  // Skeleton for card view
                  Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={`card-skeleton-${i}`}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse"
                      >
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="flex justify-between mb-3">
                          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-10 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))
                ) : error ? (
                  <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Error Loading Data
                    </h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                      onClick={handleRefresh}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Try Again
                    </button>
                  </div>
                ) : paginatedDeliveries.length === 0 ? (
                  <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                    <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No deliveries found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm
                        ? `No deliveries matching "${searchTerm}" were found.`
                        : "There are no deliveries to display."}
                    </p>
                  </div>
                ) : (
                  paginatedDeliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                              {delivery.deliveryReference}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Created on{" "}
                              {new Date(
                                delivery.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              delivery.status
                            )}`}
                          >
                            {getStatusIcon(delivery.status)}
                            <span className="ml-1">{delivery.status}</span>
                          </span>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">
                            Quantity
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatNumber(Number(delivery.quantity))} Kg
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Direction
                            </p>
                            <p className="text-sm text-gray-900 flex items-center">
                              {getDirectionIcon(delivery.direction)}
                              <span className="ml-1 capitalize">
                                {delivery.direction}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Product
                            </p>
                            <p className="text-sm text-gray-900">
                              {delivery.product?.name || "N/A"}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700">
                            {delivery.direction === "in" ? "Purchase" : "Sale"}
                          </p>
                          <p className="text-sm text-gray-900">
                            {delivery.direction === "in" ? (
                              <>
                                {delivery.purchase?.purchaseReference || "N/A"}
                              </>
                            ) : (
                              <>{delivery.sale?.referenceNumber || "N/A"}</>
                            )}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(
                              delivery.deliveredAt
                            ).toLocaleDateString()}
                          </p>

                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                setSelectedDelivery(delivery);
                                setShowViewModal(true);
                              }}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>

                            <button
                              onClick={() => handleEditClick(delivery)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                              title="Edit Delivery"
                            >
                              <Edit2 size={18} />
                            </button>

                            <button
                              onClick={() => handleDeleteConfirm(delivery.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                              title="Delete Delivery"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Card View Pagination */}
                {filteredDeliveries.length > 0 && (
                  <div className="col-span-full mt-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 flex items-center justify-between">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <ArrowLeft size={16} className="mr-1" />
                        Previous
                      </button>

                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                        <span className="hidden sm:inline">
                          {" "}
                          • Showing {(currentPage - 1) * pageSize + 1} to{" "}
                          {Math.min(
                            currentPage * pageSize,
                            filteredDeliveries.length
                          )}{" "}
                          of {filteredDeliveries.length}
                        </span>
                      </span>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                          currentPage >= totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Next
                        <ArrowRight size={16} className="ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Delivery Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingDelivery ? "Edit Delivery" : "Create New Delivery"}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 gap-6">
                {/* Direction Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Direction <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="direction"
                    value={formData.direction}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isSubmitting || !!editingDelivery}
                  >
                    <option value="in">Incoming (Purchase)</option>
                    <option value="out">Outgoing (Sale)</option>
                  </select>
                </div>

                {/* Product Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={
                      !!editingDelivery || isSubmitting || loadingProducts
                    }
                  >
                    <option value="">
                      {loadingProducts
                        ? "Loading products..."
                        : "Select a product"}
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {!loadingProducts && products.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      No products available
                    </p>
                  )}
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity (Kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>

                {/* Warehouse Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="warehouseId"
                    value={formData.warehouseId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={
                      !!editingDelivery || isSubmitting || loadingWarehouses
                    }
                  >
                    <option value="">
                      {loadingWarehouses
                        ? "Loading warehouses..."
                        : "Select a warehouse"}
                    </option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.location})
                      </option>
                    ))}
                  </select>
                  {!loadingWarehouses && warehouses.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      No warehouses available
                    </p>
                  )}
                </div>

                {/* Driver Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="driverId"
                    value={formData.driverId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={
                      !!editingDelivery || isSubmitting || loadingDrivers
                    }
                  >
                    <option value="">
                      {loadingDrivers
                        ? "Loading drivers..."
                        : "Select a driver"}
                    </option>
                    {drivers.map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.user?.profile?.names || "Unknown Driver"}
                      </option>
                    ))}
                  </select>
                  {!loadingDrivers && drivers.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      No drivers found. Please add drivers first.
                    </p>
                  )}
                </div>

                {/* Purchase/Sale Select (conditional) */}
                {formData.direction === "in" ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="purchaseId"
                      name="purchaseId"
                      options={purchasesOptions}
                      isLoading={loadingPurchases}
                      onInputChange={(value) => {
                        setPurchasesSearch(value);
                      }}
                      onChange={(selectedOption) => {
                        setFormData((prev) => ({
                          ...prev,
                          purchaseId: selectedOption?.value.toString() || "",
                        }));
                      }}
                      value={purchasesOptions.find(
                        (option) =>
                          option.value.toString() === formData.purchaseId
                      )}
                      placeholder="Search and select purchase..."
                      className="basic-single"
                      classNamePrefix="select"
                      isClearable
                      required
                      isDisabled={isSubmitting}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="saleId"
                      name="saleId"
                      options={salesOptions}
                      isLoading={loadingSales}
                      onInputChange={(value) => {
                        setSalesSearch(value);
                      }}
                      onChange={(selectedOption) => {
                        setFormData((prev) => ({
                          ...prev,
                          saleId: selectedOption?.value.toString() || "",
                        }));
                      }}
                      value={salesOptions.find(
                        (option) => option.value.toString() === formData.saleId
                      )}
                      placeholder="Search and select sale..."
                      className="basic-single"
                      classNamePrefix="select"
                      isClearable
                      required
                      isDisabled={isSubmitting}
                    />
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Form buttons */}
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
                    loadingProducts ||
                    loadingDrivers ||
                    loadingWarehouses ||
                    (formData.direction === "in" && loadingPurchases) ||
                    (formData.direction === "out" && loadingSales) ||
                    !formData.quantity ||
                    !formData.driverId ||
                    !formData.productId ||
                    !formData.warehouseId ||
                    (formData.direction === "in" && !formData.purchaseId) ||
                    (formData.direction === "out" && !formData.saleId)
                  }
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

      {/* View Delivery Details Modal */}
      {showViewModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                Delivery Details - {selectedDelivery.deliveryReference}
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Delivery Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Reference</p>
                  <p className="text-lg font-semibold">
                    {selectedDelivery.deliveryReference}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Quantity</p>
                  <p className="text-lg font-semibold">
                    {formatNumber(Number(selectedDelivery.quantity))} Kg
                  </p>
                </div>
                <div
                  className={`p-4 rounded-lg ${getStatusColor(
                    selectedDelivery.status
                  )}`}
                >
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-lg font-semibold flex items-center">
                    {getStatusIcon(selectedDelivery.status)}
                    <span className="ml-1 capitalize">
                      {selectedDelivery.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Main Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Delivery Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                    <Truck className="w-4 h-4 mr-2 text-blue-500" />
                    Delivery Information
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Direction</p>
                        <p className="text-sm font-medium flex items-center">
                          {getDirectionIcon(selectedDelivery.direction)}
                          <span className="ml-1 capitalize">
                            {selectedDelivery.direction}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Driver</p>
                        <p className="text-sm font-medium">
                          {selectedDelivery.driver?.user?.profile?.names ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Created At</p>
                      <p className="text-sm font-medium">
                        {new Date(selectedDelivery.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Delivered At</p>
                      <p className="text-sm font-medium">
                        {new Date(
                          selectedDelivery.deliveredAt
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="text-sm font-medium">
                        {selectedDelivery.notes || "No notes provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product & Warehouse */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-indigo-500" />
                    Product & Warehouse
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Product</p>
                      <p className="text-sm font-medium">
                        {selectedDelivery.product?.name || "N/A"}
                        {selectedDelivery.product?.description && (
                          <span className="block text-xs text-gray-500 mt-1">
                            {selectedDelivery.product.description}
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Warehouse</p>
                      <p className="text-sm font-medium">
                        {selectedDelivery.warehouse?.name || "N/A"}
                        {selectedDelivery.warehouse?.location && (
                          <span className="block text-xs text-gray-500 mt-1">
                            {selectedDelivery.warehouse.location}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purchase/Sale Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                  {selectedDelivery.direction === "in" ? (
                    <Warehouse className="w-4 h-4 mr-2 text-amber-500" />
                  ) : (
                    <Truck className="w-4 h-4 mr-2 text-green-500" />
                  )}
                  {selectedDelivery.direction === "in"
                    ? "Purchase Details"
                    : "Sale Details"}
                </h3>

                {selectedDelivery.direction === "in" ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Reference</p>
                        <p className="text-sm font-medium">
                          {selectedDelivery.purchase?.purchaseReference ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Supplier</p>
                        <p className="text-sm font-medium">
                          {selectedDelivery.purchase?.supplier?.supplierId ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Description</p>
                      <p className="text-sm font-medium">
                        {selectedDelivery.purchase?.description || "N/A"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">
                          Expected Delivery
                        </p>
                        <p className="text-sm font-medium">
                          {selectedDelivery.purchase?.expectedDeliveryDate
                            ? new Date(
                                selectedDelivery.purchase.expectedDeliveryDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total Weight</p>
                        <p className="text-sm font-medium">
                          {selectedDelivery.purchase?.weight
                            ? `${selectedDelivery.purchase.weight} Kg`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Reference</p>
                        <p className="text-sm font-medium">
                          {selectedDelivery.sale?.saleReference || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Client</p>
                        <p className="text-sm font-medium">
                          {selectedDelivery.sale?.client?.name || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Quantity</p>
                        <p className="text-sm font-medium">
                          {selectedDelivery.sale?.quantity
                            ? `${selectedDelivery.sale.quantity} Kg`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className="text-sm font-medium">
                          {selectedDelivery.sale?.status || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Notes</p>
                      <p className="text-sm font-medium">
                        {selectedDelivery.sale?.note || "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4 text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-semibold">Confirm Delete</h2>
            </div>

            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this delivery? This action cannot
              be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDelivery(showConfirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
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
                    Deleting...
                  </>
                ) : (
                  "Delete Delivery"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        aria-label="Notification container"
      />
    </div>
  );
};

export default DeliveryManagement;
