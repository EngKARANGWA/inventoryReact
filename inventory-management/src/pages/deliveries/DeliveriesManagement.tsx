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
  Warehouse,
  Calendar,
  Check,
  X,
  Clock,
  RefreshCw,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { warehouseService } from "../../services/warehouseServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { deliveryService, Delivery } from "../../services/deliveryService";
import Select from "react-select";

const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";

interface Product {
  id: number;
  name: string;
  description: string;
}

interface UserProfile {
  id: number;
  names: string;
  phoneNumber: string;
  address: string;
  status: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  profile: UserProfile;
}

interface Driver {
  id: number;
  driverId: string;
  licenseNumber: string;
  user: User;
}

interface Warehouse {
  id: number;
  name: string;
  location: string;
}

interface Purchase {
  id: number;
  purchaseReference: string;
  description: string;
  weight: string;
  totalDelivered: string;
  product?: Product;
}

interface Sale {
  id: number;
  referenceNumber: string;
  quantity: string;
  totalDelivered: string;
  product?: Product;
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
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [loadingSales, setLoadingSales] = useState(false);
  const [salesSearch, setSalesSearch] = useState("");
  const [purchasesSearch, setPurchasesSearch] = useState("");

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Delivery;
    direction: "ascending" | "descending";
  } | null>(null);

  interface Filters {
    page: number;
    pageSize: number;
    status: "" | "completed" | "pending" | "delivered" | "cancelled";
    direction: "" | "in" | "out";
    productId: string;
    warehouseId: string;
    driverId: string;
    dateFrom: string;
    dateTo: string;
  }

  const [filters, setFilters] = useState<Filters>({
    page: 1,
    pageSize: 10,
    status: "",
    direction: "",
    productId: "",
    warehouseId: "",
    driverId: "",
    dateFrom: "",
    dateTo: "",
  });
  const [formData, setFormData] = useState({
    direction: "in",
    quantity: "",
    driverId: "",
    productId: "",
    warehouseId: "",
    purchaseId: "",
    saleId: "",
    notes: "",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    fetchDeliveries();
  }, [filters]);

  useEffect(() => {
    if (showAddForm) {
      fetchDropdownOptions();
    }
  }, [showAddForm, formData.direction]);

  const fetchDropdownOptions = async () => {
    try {
      setLoadingProducts(true);
      setLoadingDrivers(true);
      setLoadingWarehouses(true);

      const [products, warehouses, drivers] = await Promise.all([
        productService.getAllProducts(),
        warehouseService.getAllWarehouses(),
        driverService.getAllDrivers(),
      ]);

      setProducts(products);
      setWarehouses(warehouses);
      setDrivers(drivers);

      // Fetch purchases or sales based on direction
      if (formData.direction === "in") {
        setLoadingPurchases(true);
        const purchasesData = await purchaseService.getAllPurchases();
        setPurchases(purchasesData);
      } else if (formData.direction === "out") {
        setLoadingSales(true);
        const salesData = await saleService.getAllSales();
        setSales(salesData);
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
  };

  const fetchDeliveries = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await deliveryService.getAllDeliveries({
        ...filters,
        search: searchTerm,
      });
  
      // Process the response according to the actual API structure
      const processedDeliveries: Delivery[] = (response.deliveries || []).map(
        (delivery: Delivery) => ({
          ...delivery,
          quantity: delivery.quantity ? parseFloat(delivery.quantity.toString()) : 0,
        })
      );
  
      setDeliveries(processedDeliveries);
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
  };

  const fetchSales = async () => {
    try {
      setLoadingSales(true);
      const response = await axios.get(`${API_BASE_URL}/sales`, {
        params: { 
          search: salesSearch,
          include: 'product'
        },
      });
      setSales(response.data.data || []);
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast.error("Failed to load sales");
    } finally {
      setLoadingSales(false);
    }
  };

  const fetchPurchases = async () => {
    try {
      setLoadingPurchases(true);
      const response = await axios.get(`${API_BASE_URL}/purchases`, {
        params: { include: 'product' },
      });
      setPurchases(response.data || []);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast.error("Failed to load purchases");
    } finally {
      setLoadingPurchases(false);
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
      productId: delivery.productId.toString(),
      warehouseId: delivery.warehouseId.toString(),
      purchaseId: delivery.purchaseId?.toString() || "",
      saleId: delivery.saleId?.toString() || "",
      notes: delivery.notes || "",
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
      // Reset purchase/sale ID when direction changes
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
        direction: formData.direction as "in" | "out",
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
      [name]: value,
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

  const completedDeliveries = deliveries.filter(
    (d) => d.status === "completed"
  ).length;
  const pendingDeliveries = deliveries.filter(
    (d) => d.status === "pending"
  ).length;
  const deliveredDeliveries = deliveries.filter(
    (d) => d.status === "delivered"
  ).length;
  const cancelledDeliveries = deliveries.filter(
    (d) => d.status === "cancelled"
  ).length;
  const incomingDeliveries = deliveries.filter(
    (d) => d.direction === "in"
  ).length;
  const outgoingDeliveries = deliveries.filter(
    (d) => d.direction === "out"
  ).length;
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

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(totalDeliveries / pageSize);

  const salesOptions = sales.map((sale) => ({
    value: sale.id,
    label: `${sale.referenceNumber} (${sale.product?.name || 'Unknown Product'} - ${sale.quantity} Kg)`,
  }));

  const purchasesOptions = purchases.map((purchase) => ({
    value: purchase.id,
    label: `${purchase.purchaseReference} (${purchase.product?.name || 'Unknown Product'} - ${purchase.weight} Kg)`,
  }));

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
                Manage product deliveries to/from warehouses
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
                      {pendingDeliveries}
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
                      Completed Deliveries
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {completedDeliveries + deliveredDeliveries}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Quantity
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalQuantity} Kg
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From Date
                      </label>
                      <input
                        type="date"
                        name="dateFrom"
                        value={filters.dateFrom}
                        onChange={handleDateFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
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
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Direction
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("quantity")}
                      >
                        <div className="flex items-center">
                          Quantity
                          {sortConfig?.key === "quantity" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Warehouse
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("deliveredAt")}
                      >
                        <div className="flex items-center">
                          Date
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
                        <td colSpan={9} className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-4 text-center text-red-600"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : sortedDeliveries.length === 0 ? (
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
                      sortedDeliveries.map((delivery) => (
                        <tr key={delivery.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {delivery.deliveryReference}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {delivery.product?.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {delivery.direction === "in" ? (
                                <ArrowDown className="w-4 h-4 text-green-500 mr-1" />
                              ) : (
                                <ArrowUp className="w-4 h-4 text-red-500 mr-1" />
                              )}
                              <span className="text-sm text-gray-900 capitalize">
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
                              {delivery.quantity.toLocaleString()} Kg
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
                                className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  delivery.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : delivery.status === "delivered"
                                    ? "bg-blue-100 text-blue-800"
                                    : delivery.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {delivery.status}
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
                        of{" "}
                        <span className="font-medium">{totalDeliveries}</span>{" "}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Direction Select */}
                <div className="col-span-1">
                  <label
                    htmlFor="direction"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Direction <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="direction"
                    name="direction"
                    value={formData.direction}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!editingDelivery || isSubmitting}
                  >
                    <option value="in">Incoming (Purchase)</option>
                    <option value="out">Outgoing (Sale)</option>
                  </select>
                </div>

                {/* Product Select */}
                <div className="col-span-1">
                  <label
                    htmlFor="productId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="productId"
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
                <div className="col-span-1">
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Quantity (Kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0.01"
                    step="0.01"
                    disabled={!!editingDelivery || isSubmitting}
                  />
                </div>

                {/* Warehouse Select */}
                <div className="col-span-1">
                  <label
                    htmlFor="warehouseId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Warehouse <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="warehouseId"
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
                  <div className="col-span-1">
                    <label
                      htmlFor="purchaseId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Purchase <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="purchaseId"
                      name="purchaseId"
                      options={purchasesOptions}
                      isLoading={loadingPurchases}
                      onInputChange={(value) => {
                        setPurchasesSearch(value);
                        fetchPurchases();
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
                    />
                  </div>
                ) : (
                  <div className="col-span-1">
                    <label
                      htmlFor="saleId"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Sale <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="saleId"
                      name="saleId"
                      options={salesOptions}
                      isLoading={loadingSales}
                      onInputChange={(value) => {
                        setSalesSearch(value);
                        fetchSales();
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
                    />
                  </div>
                )}

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
                    products.length === 0 ||
                    drivers.length === 0 ||
                    warehouses.length === 0 ||
                    (formData.direction === "in" && purchases.length === 0) ||
                    (formData.direction === "out" && sales.length === 0)
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

// Helper services for fetching data
const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      return [];
    }
  },
};

const driverService = {
  getAllDrivers: async (): Promise<Driver[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/drivers`, {
        params: { include: "user.profile" },
      });
      return response.data || [];
    } catch (error) {
      console.error("Error fetching drivers:", error);
      return [];
    }
  },
};

const purchaseService = {
  getAllPurchases: async (): Promise<Purchase[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/purchases`, {
        params: { include: "product" },
      });
      return response.data || [];
    } catch (error) {
      console.error("Error fetching purchases:", error);
      return [];
    }
  },
};

const saleService = {
  getAllSales: async (): Promise<Sale[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/sales`, {
        params: { include: "product" },
      });
      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching sales:", error);
      return [];
    }
  },
};

export default DeliveryManagement;
