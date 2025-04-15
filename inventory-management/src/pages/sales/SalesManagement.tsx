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
  ShoppingCart,
  DollarSign,
  Package,
  Calendar,
  RefreshCw,
  Check,
  Clock,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { saleService, Sale } from "../../services/saleService";

const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";

interface Product {
  id: number;
  name: string;
}

interface Saler {
  id: number;
  name: string;
}

interface Client {
  id: number;
  name: string;
}

interface Blocker {
  id: number;
  name: string;
}

interface SortConfig {
  key: keyof Sale;
  direction: "ascending" | "descending";
}

const SaleManagement: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingSalers, setLoadingSalers] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingBlockers, setLoadingBlockers] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    productId: "",
    salerId: "",
    startDate: "",
    endDate: "",
  });

  const [formData, setFormData] = useState({
    productId: "",
    salerId: "",
    clientId: "",
    blockerId: "",
    quantity: "",
    note: "",
    date: new Date().toISOString().split("T")[0],
    expectedDeliveryDate: "",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [salers, setSalers] = useState<Saler[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [blockers, setBlockers] = useState<Blocker[]>([]);

  useEffect(() => {
    fetchSales();
  }, [filters]);

  useEffect(() => {
    if (showAddForm) {
      fetchDropdownOptions();
    }
  }, [showAddForm]);

  const fetchDropdownOptions = async () => {
    try {
      setLoadingProducts(true);
      setLoadingSalers(true);
      setLoadingClients(true);
      setLoadingBlockers(true);
  
      const [productsRes, salersRes, clientsRes, blockersRes] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/products`),
          axios.get(`${API_BASE_URL}/saler`),
          axios.get(`${API_BASE_URL}/clients`),
          axios.get(`${API_BASE_URL}/blockers`),
        ]);
  
      // Handle products response
      const productsData = productsRes.data.success ? productsRes.data.data : productsRes.data;
      setProducts(
        (productsData || []).map((product: any) => ({
          id: product.id,
          name: product.name,
        }))
      );
  
      // Handle salers response
      const salersData = salersRes.data.success ? salersRes.data.data : salersRes.data;
      setSalers(
        (salersData || []).map((saler: any) => ({
          id: saler.id,
          name: saler.user?.profile?.names || "Unknown Saler",
        }))
      );
  
      // Handle clients response
      const clientsData = clientsRes.data.success ? clientsRes.data.data : clientsRes.data;
      setClients(
        (clientsData || []).map((client: any) => ({
          id: client.id,
          name: client.user?.profile?.names || "Unknown Client",
        }))
      );
  
      // Handle blockers response
      const blockersData = blockersRes.data.success ? blockersRes.data.data : blockersRes.data;
      setBlockers(
        (blockersData || []).map((blocker: any) => ({
          id: blocker.id,
          name: blocker.user?.profile?.names || "Unknown Blocker",
        }))
      );
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      toast.error("Failed to load form options");
    } finally {
      setLoadingProducts(false);
      setLoadingSalers(false);
      setLoadingClients(false);
      setLoadingBlockers(false);
    }
  };

  const fetchSales = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await saleService.getAllSales({
        ...filters,
        search: searchTerm,
      });

      setSales(response.data || []);
      setTotalSales(response.pagination?.totalItems || 0);
    } catch (err) {
      console.error("Error fetching sales:", err);
      setError("Failed to fetch sales. Please try again later.");
      toast.error("Failed to load sales");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const saleData = {
        productId: Number(formData.productId),
        salerId: Number(formData.salerId),
        quantity: parseFloat(formData.quantity),
        note: formData.note,
        date: formData.date,
        expectedDeliveryDate: formData.expectedDeliveryDate,
        ...(formData.clientId && { clientId: Number(formData.clientId) }),
        ...(formData.blockerId && { blockerId: Number(formData.blockerId) }),
      };

      if (editingSale) {
        const updatedSale = await saleService.updateSale(editingSale.id, {
          quantity: parseFloat(formData.quantity),
          note: formData.note,
        });
        setSales(sales.map((s) => (s.id === editingSale.id ? updatedSale : s)));
        toast.success("Sale updated successfully");
      } else {
        const newSale = await saleService.createSale(saleData);
        setSales([newSale, ...sales]);
        setTotalSales(totalSales + 1);
        toast.success("Sale created successfully");
      }

      setShowAddForm(false);
    } catch (err: any) {
      console.error("Error saving sale:", err);
      toast.error(err.response?.data?.message || "Failed to save sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSales();
  };

  const handleRefresh = () => {
    fetchSales();
  };

  const handleAddClick = () => {
    setEditingSale(null);
    setFormData({
      productId: "",
      salerId: "",
      clientId: "",
      blockerId: "",
      quantity: "",
      note: "",
      date: new Date().toISOString().split("T")[0],
      expectedDeliveryDate: "",
    });
    setShowAddForm(true);
  };

  const handleEditClick = (sale: Sale) => {
    setEditingSale(sale);
    setFormData({
      productId: String(sale.productId),
      salerId: String(sale.salerId),
      clientId: sale.clientId ? String(sale.clientId) : "",
      blockerId: sale.blockerId ? String(sale.blockerId) : "",
      quantity: sale.quantity.toString(),
      note: sale.note || "",
      date: sale.createdAt.split("T")[0],
      expectedDeliveryDate: sale.expectedDeliveryDate?.split("T")[0] || "",
    });
    setShowAddForm(true);
  };

  const handleDeleteSale = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      try {
        await saleService.deleteSale(id);
        setSales(sales.filter((s) => s.id !== id));
        setTotalSales(totalSales - 1);
        toast.success("Sale deleted successfully");
      } catch (error) {
        console.error("Error deleting sale:", error);
        toast.error("Failed to delete sale");
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const requestSort = (key: keyof Sale) => {
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

  const sortedSales = React.useMemo(() => {
    if (!sortConfig) return sales;

    return [...sales].sort((a, b) => {
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
  }, [sales, sortConfig]);

  const pendingSales = sales.filter((s) => {
    const unitPrice = s.dailyPrice
      ? parseFloat(s.dailyPrice.sellingUnitPrice)
      : 0;
    return parseFloat(s.totalPaid) < unitPrice * s.quantity;
  }).length;

  const totalRevenue = sales.reduce((sum, s) => {
    const unitPrice = s.dailyPrice
      ? parseFloat(s.dailyPrice.sellingUnitPrice)
      : 0;
    return sum + unitPrice * s.quantity;
  }, 0);

  const totalPaid = sales.reduce((sum, s) => sum + parseFloat(s.totalPaid), 0);

  const getStatusBadge = (sale: Sale) => {
    const unitPrice = sale.dailyPrice
      ? parseFloat(sale.dailyPrice.sellingUnitPrice)
      : 0;
    const totalAmount = unitPrice * sale.quantity;
    const paidAmount = parseFloat(sale.totalPaid);

    if (paidAmount >= totalAmount) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Check className="w-3 h-3 mr-1" />
          Paid
        </span>
      );
    } else if (paidAmount > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" />
          Partial
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          <Clock className="w-3 h-3 mr-1" />
          Unpaid
        </span>
      );
    }
  };

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(totalSales / pageSize);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 w-full p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Sales Management
              </h1>
              <p className="text-gray-600">
                Manage product sales and customer transactions
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Sales
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalSales}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Pending Payments
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {pendingSales}
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
                      Total Revenue
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalRevenue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      Rwf
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Paid
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalPaid.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                      Rwf
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-purple-600" />
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
                    placeholder="Search sales..."
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
                    New Sale
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
                        Product
                      </label>
                      <select
                        name="productId"
                        value={filters.productId}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Products</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Saler
                      </label>
                      <select
                        name="salerId"
                        value={filters.salerId}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Salers</option>
                        {salers.map((saler) => (
                          <option key={saler.id} value={saler.id}>
                            {saler.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
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
                        onClick={fetchSales}
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
                        onClick={() => requestSort("saleReference")}
                      >
                        <div className="flex items-center">
                          Reference
                          {sortConfig?.key === "saleReference" && (
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
                        Details
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("quantity")}
                      >
                        <div className="flex items-center">
                          Qty
                          {sortConfig?.key === "quantity" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Saler
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("createdAt")}
                      >
                        <div className="flex items-center">
                          Date
                          {sortConfig?.key === "createdAt" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
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
                    ) : sortedSales.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No sales found.{" "}
                          {searchTerm && "Try a different search term."}
                        </td>
                      </tr>
                    ) : (
                      sortedSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {sale.saleReference || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {sale.product?.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center">
                                <Package className="w-4 h-4 mr-1 text-blue-500" />
                                {sale.quantity} Kg
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                @{" "}
                                {sale.dailyPrice
                                  ? parseFloat(
                                      sale.dailyPrice.sellingUnitPrice
                                    ).toFixed(2)
                                  : "N/A"}{" "}
                                Rwf/Kg
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {sale.quantity} Kg
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {sale.dailyPrice
                                ? (
                                    parseFloat(sale.dailyPrice.sellingUnitPrice) *
                                    sale.quantity
                                  ).toFixed(2)
                                : "N/A"}{" "}
                              Rwf
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {sale.saler?.user?.profile?.names || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                              <div className="text-sm text-gray-900">
                                {new Date(sale.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(sale)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditClick(sale)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                              title="Edit Sale"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteSale(sale.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Sale"
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

              {totalSales > 0 && (
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
                          {Math.min(currentPage * pageSize, totalSales)}
                        </span>{" "}
                        of <span className="font-medium">{totalSales}</span>{" "}
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
                {editingSale ? "Edit Sale" : "Create New Sale"}
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
                    disabled={isSubmitting || loadingProducts}
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

                {/* Saler Select */}
                <div className="col-span-1">
                  <label
                    htmlFor="salerId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Saler <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="salerId"
                    name="salerId"
                    value={formData.salerId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isSubmitting || loadingSalers}
                  >
                    <option value="">
                      {loadingSalers ? "Loading salers..." : "Select a saler"}
                    </option>
                    {salers.map((saler) => (
                      <option key={saler.id} value={saler.id}>
                        {saler.name}
                      </option>
                    ))}
                  </select>
                  {!loadingSalers && salers.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      No salers available
                    </p>
                  )}
                </div>

                {/* Client Select */}
                <div className="col-span-1">
                  <label
                    htmlFor="clientId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Client (Optional)
                  </label>
                  <select
                    id="clientId"
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting || loadingClients}
                  >
                    <option value="">No client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Blocker Select */}
                <div className="col-span-1">
                  <label
                    htmlFor="blockerId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Blocker (Optional)
                  </label>
                  <select
                    id="blockerId"
                    name="blockerId"
                    value={formData.blockerId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting || loadingBlockers}
                  >
                    <option value="">No blocker</option>
                    {blockers.map((blocker) => (
                      <option key={blocker.id} value={blocker.id}>
                        {blocker.name}
                      </option>
                    ))}
                  </select>
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
                    disabled={isSubmitting}
                  />
                </div>

                {/* Date Input */}
                <div className="col-span-1">
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Expected Delivery Date Input */}
                <div className="col-span-1">
                  <label
                    htmlFor="expectedDeliveryDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Expected Delivery Date
                  </label>
                  <input
                    type="date"
                    id="expectedDeliveryDate"
                    name="expectedDeliveryDate"
                    value={formData.expectedDeliveryDate}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <label
                    htmlFor="note"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Notes
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
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
                    loadingSalers ||
                    products.length === 0 ||
                    salers.length === 0
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
                      {editingSale ? "Updating..." : "Creating..."}
                    </>
                  ) : editingSale ? (
                    "Update Sale"
                  ) : (
                    "Create Sale"
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

export default SaleManagement;