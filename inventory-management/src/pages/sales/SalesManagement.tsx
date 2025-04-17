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
  ShoppingCart,
  DollarSign,
  Package,
  Calendar,
  RefreshCw,
  Check,
  Clock,
  Eye,
  AlertCircle,
  Download,
  ArrowLeft,
  ArrowRight,
  FileText,
  Activity,
  X,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { saleService, Sale } from "../../services/saleService";
import Select from "react-select";

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

interface SaleFilters {
  page: number;
  pageSize: number;
  productId: string;
  salerId: string;
  clientId: string;
  startDate: string;
  endDate: string;
  status: string;
}

const SaleManagement: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);
  const [viewType, setViewType] = useState<"table" | "cards">("table");
  const [productsSearch, setProductsSearch] = useState("");
  const [salersSearch, setSalersSearch] = useState("");
  const [clientsSearch, setClientsSearch] = useState("");
  const [blockersSearch, setBlockersSearch] = useState("");

  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: "createdAt",
    direction: "descending"
  });

  const [filters, setFilters] = useState<SaleFilters>({
    page: 1,
    pageSize: 10,
    productId: "",
    salerId: "",
    clientId: "",
    startDate: "",
    endDate: "",
    status: "",
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

  // Format numbers with comma as thousand separator
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(num);
  };

  const fetchSales = useCallback(async () => {
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
      setSales([]);
      setTotalSales(0);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const fetchDropdownOptions = useCallback(async () => {
    try {
      const [productsRes, salersRes, clientsRes, blockersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products?search=${productsSearch}`),
        axios.get(`${API_BASE_URL}/saler?search=${salersSearch}`),
        axios.get(`${API_BASE_URL}/clients?search=${clientsSearch}`),
        axios.get(`${API_BASE_URL}/blockers?search=${blockersSearch}`),
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
    }
  }, [productsSearch, salersSearch, clientsSearch, blockersSearch]);

  useEffect(() => {
    if (showAddForm) {
      fetchDropdownOptions();
    }
  }, [showAddForm, fetchDropdownOptions]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    
    try {
      const saleData = {
        productId: Number(formData.productId),
        salerId: Number(formData.salerId),
        quantity: parseFloat(formData.quantity),
        note: formData.note,
        // priceId: dailyPrice.id,
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
    toast.info("Sales refreshed");
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

  const handleDeleteConfirm = (saleId: number) => {
    setShowConfirmDelete(saleId);
  };

  const handleDeleteSale = async (saleId: number) => {
    try {
      setIsSubmitting(true);
      await saleService.deleteSale(saleId);
      setSales(sales.filter((s) => s.id !== saleId));
      setTotalSales(totalSales - 1);
      toast.success("Sale deleted successfully");
      setShowConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("Failed to delete sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    
    // Scroll to top of the table
    const tableElement = document.getElementById('sales-table-container');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  const filteredSales = React.useMemo(() => {
    if (!searchTerm) return sortedSales;

    return sortedSales.filter((sale) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (sale.saleReference?.toLowerCase().includes(searchLower) ||
        (sale.product?.name?.toLowerCase().includes(searchLower)) ||
        (sale.saler?.user?.profile?.names?.toLowerCase().includes(searchLower)) ||
        (sale.client?.user?.profile?.names?.toLowerCase().includes(searchLower)) ||
        (sale.note?.toLowerCase().includes(searchLower))
      ));
    });
  }, [sortedSales, searchTerm]);

  const pendingSales = sales.filter((s) => {
    const unitPrice = s.dailyPrice
      ? parseFloat(s.dailyPrice.sellingUnitPrice)
      : 0;
    return parseFloat(s.totalPaid) < unitPrice * s.quantity;
  }).length;

  const completedSales = sales.filter((s) => {
    const unitPrice = s.dailyPrice
      ? parseFloat(s.dailyPrice.sellingUnitPrice)
      : 0;
    return parseFloat(s.totalPaid) >= unitPrice * s.quantity;
  }).length;

  const totalRevenue = sales.reduce((sum, s) => {
    const unitPrice = s.dailyPrice
      ? parseFloat(s.dailyPrice.sellingUnitPrice)
      : 0;
    return sum + unitPrice * s.quantity;
  }, 0);

  const totalPaid = sales.reduce((sum, s) => sum + parseFloat(s.totalPaid || "0"), 0);

  const getStatusBadge = (sale: Sale) => {
    const unitPrice = sale.dailyPrice
      ? parseFloat(sale.dailyPrice.sellingUnitPrice)
      : 0;
    const totalAmount = unitPrice * sale.quantity;
    const paidAmount = parseFloat(sale.totalPaid || "0");

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
  const totalPages = Math.ceil(filteredSales.length / pageSize);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Function to export data (placeholder)
  const handleExportData = () => {
    toast.info("Data export feature will be implemented soon!");
  };

  // Handle view toggle between table and cards
  const toggleViewType = () => {
    setViewType(prev => prev === "table" ? "cards" : "table");
  };

  // Function to generate skeleton loading state
  const renderSkeleton = () => {
    return Array(5).fill(0).map((_, i) => (
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
                <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600" />
                Sale Management
              </h1>
              <p className="text-gray-600">
                Manage product sales and customer transactions
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Total Sales
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        totalSales
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Total value: {loading ? "..." : `${formatNumber(totalRevenue)} RWF`}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Completed Sales
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        completedSales
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {loading ? "..." : `${((completedSales / totalSales) * 100 || 0).toFixed(1)}% of total`}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Pending Payments
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        pendingSales
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {loading ? "..." : `${((pendingSales / totalSales) * 100 || 0).toFixed(1)}% of total`}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Total Paid
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        formatNumber(totalPaid)
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {loading ? "..." : `${((totalPaid / totalRevenue) * 100 || 0).toFixed(1)}% of total`}
                </div>
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
                    placeholder="Search sales..."
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
                    title={`Switch to ${viewType === "table" ? "card" : "table"} view`}
                  >
                    <FileText size={16} className="mr-1" />
                    <span>
                      {viewType === "table" ? "Cards" : "Table"}
                    </span>
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
                    <span>New Sale</span>
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
                        Product
                      </label>
                      <select
                        name="productId"
                        value={filters.productId}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                        Client
                      </label>
                      <select
                        name="clientId"
                        value={filters.clientId}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">All Clients</option>
                        {clients.map((client) => (
                          <option key={client.id} value={client.id}>
                            {client.name}
                          </option>
                        ))}
                      </select>
                    </div>
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
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="unpaid">Unpaid</option>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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

            {/* Empty State */}
            {!loading && filteredSales.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  {searchTerm ? 
                    `No sales matching "${searchTerm}" were found. Try a different search term or clear your filters.` : 
                    "There are no sales to display. Start by creating a new sale."}
                </p>
                <button
                  onClick={handleAddClick}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                  <Plus size={16} className="mr-2" />
                  Create New Sale
                </button>
              </div>
            )}

            {/* Sales Display - Table View */}
            {viewType === "table" && (
              <div 
                id="sales-table-container" 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
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
                            Qty (Kg)
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
                        renderSkeleton()
                      ) : error ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-6 py-4 text-center"
                          >
                            <div className="flex items-center justify-center text-red-600">
                              <AlertCircle className="w-5 h-5 mr-2" />
                              {error}
                            </div>
                          </td>
                        </tr>
                      ) : filteredSales.length === 0 ? (
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
                        paginatedSales.map((sale) => (
                          <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {sale.saleReference || "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(sale.createdAt).toLocaleDateString()}
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
                                  RWF/Kg
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
                                RWF
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
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedSale(sale);
                                    setShowViewModal(true);
                                  }}
                                  className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </button>
                                
                                <button
                                  onClick={() => handleEditClick(sale)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                  title="Edit Sale"
                                >
                                  <Edit2 size={18} />
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteConfirm(sale.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                  title="Delete Sale"
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
                {filteredSales.length > 0 && (
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
                              filteredSales.length
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {filteredSales.length}
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
                            <ArrowRight className="h-5 w-5" aria-hidden="true" />
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
                  Array(6).fill(0).map((_, i) => (
                    <div key={`card-skeleton-${i}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button 
                      onClick={handleRefresh}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      <RefreshCw size={16} className="mr-2" /> 
                      Try Again
                    </button>
                  </div>
                ) : paginatedSales.length === 0 ? (
                  <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? 
                        `No sales matching "${searchTerm}" were found.` : 
                        "There are no sales to display."}
                    </p>
                  </div>
                ) : (
                  paginatedSales.map((sale) => (
                    <div 
                      key={sale.id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                              {sale.saleReference || "N/A"}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Created on {new Date(sale.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {getStatusBadge(sale)}
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Product</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {sale.product?.name || "N/A"}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Quantity</p>
                            <p className="text-sm text-gray-900 flex items-center">
                              <Package className="w-4 h-4 mr-1" />
                              {sale.quantity} Kg
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Unit Price</p>
                            <p className="text-sm text-gray-900">
                              {sale.dailyPrice
                                ? parseFloat(sale.dailyPrice.sellingUnitPrice).toFixed(2)
                                : "N/A"}{" "}
                              RWF/Kg
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700">Total Amount</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {sale.dailyPrice
                              ? (
                                  parseFloat(sale.dailyPrice.sellingUnitPrice) *
                                  sale.quantity
                                ).toFixed(2)
                              : "N/A"}{" "}
                            RWF
                          </p>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Saler</p>
                          <p className="text-sm text-gray-900">
                            {sale.saler?.user?.profile?.names || "N/A"}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(sale.createdAt).toLocaleDateString()}
                          </p>
                          
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                setSelectedSale(sale);
                                setShowViewModal(true);
                              }}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            
                            <button
                              onClick={() => handleEditClick(sale)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                              title="Edit Sale"
                            >
                              <Edit2 size={18} />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteConfirm(sale.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                              title="Delete Sale"
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
                {filteredSales.length > 0 && (
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
                        <span className="hidden sm:inline"> • Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredSales.length)} of {filteredSales.length}</span>
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

      {/* Add/Edit Sale Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingSale ? "Edit Sale" : "Create New Sale"}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Select */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <Select
                    id="productId"
                    name="productId"
                    options={products.map(p => ({ value: p.id, label: p.name }))}
                    isLoading={!products.length && showAddForm}
                    onInputChange={(value) => setProductsSearch(value)}
                    onChange={(selectedOption) => {
                      setFormData(prev => ({
                        ...prev,
                        productId: selectedOption?.value.toString() || ""
                      }));
                    }}
                    value={products
                      .filter(p => p.id.toString() === formData.productId)
                      .map(p => ({ value: p.id, label: p.name }))[0]}
                    placeholder="Search and select product..."
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable
                    required
                    isDisabled={isSubmitting || !!editingSale}
                  />
                </div>

                {/* Saler Select */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Saler <span className="text-red-500">*</span>
                  </label>
                  <Select
                    id="salerId"
                    name="salerId"
                    options={salers.map(s => ({ value: s.id, label: s.name }))}
                    isLoading={!salers.length && showAddForm}
                    onInputChange={(value) => setSalersSearch(value)}
                    onChange={(selectedOption) => {
                      setFormData(prev => ({
                        ...prev,
                        salerId: selectedOption?.value.toString() || ""
                      }));
                    }}
                    value={salers
                      .filter(s => s.id.toString() === formData.salerId)
                      .map(s => ({ value: s.id, label: s.name }))[0]}
                    placeholder="Search and select saler..."
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable
                    required
                    isDisabled={isSubmitting || !!editingSale}
                  />
                </div>

                {/* Client Select */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client (Optional)
                  </label>
                  <Select
                    id="clientId"
                    name="clientId"
                    options={clients.map(c => ({ value: c.id, label: c.name }))}
                    isLoading={!clients.length && showAddForm}
                    onInputChange={(value) => setClientsSearch(value)}
                    onChange={(selectedOption) => {
                      setFormData(prev => ({
                        ...prev,
                        clientId: selectedOption?.value.toString() || ""
                      }));
                    }}
                    value={clients
                      .filter(c => c.id.toString() === formData.clientId)
                      .map(c => ({ value: c.id, label: c.name }))[0]}
                    placeholder="No client"
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable
                    isDisabled={isSubmitting}
                  />
                </div>

                {/* Blocker Select */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blocker (Optional)
                  </label>
                  <Select
                    id="blockerId"
                    name="blockerId"
                    options={blockers.map(b => ({ value: b.id, label: b.name }))}
                    isLoading={!blockers.length && showAddForm}
                    onInputChange={(value) => setBlockersSearch(value)}
                    onChange={(selectedOption) => {
                      setFormData(prev => ({
                        ...prev,
                        blockerId: selectedOption?.value.toString() || ""
                      }));
                    }}
                    value={blockers
                      .filter(b => b.id.toString() === formData.blockerId)
                      .map(b => ({ value: b.id, label: b.name }))[0]}
                    placeholder="No blocker"
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable
                    isDisabled={isSubmitting}
                  />
                </div>

                {/* Quantity Input */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                    !formData.productId ||
                    !formData.salerId ||
                    !formData.quantity ||
                    !formData.date
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

      {/* View Sale Details Modal */}
      {showViewModal && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                Sale Details - {selectedSale.saleReference || "N/A"}
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                }}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Sale Reference and Status */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Reference Number</p>
                  <p className="text-lg font-medium text-gray-900">
                    {selectedSale.saleReference || "N/A"}
                  </p>
                </div>
                <div className="flex items-center">
                  {getStatusBadge(selectedSale)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-blue-500" />
                    Product Information
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Product</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedSale.product?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        {selectedSale.quantity} Kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Unit Price</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedSale.dailyPrice
                          ? parseFloat(selectedSale.dailyPrice.sellingUnitPrice).toFixed(2)
                          : "N/A"}{" "}
                        RWF/Kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedSale.dailyPrice
                          ? (
                              parseFloat(selectedSale.dailyPrice.sellingUnitPrice) *
                              selectedSale.quantity
                            ).toFixed(2)
                          : "N/A"}{" "}
                        RWF
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-indigo-500" />
                    Transaction Details
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Saler</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedSale.saler?.user?.profile?.names || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Client</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedSale.client?.user?.profile?.names || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Blocker</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedSale.blocker?.user?.profile?.names || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedSale.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expected Delivery</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedSale.expectedDeliveryDate
                          ? new Date(selectedSale.expectedDeliveryDate).toLocaleDateString()
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-500" />
                  Additional Information
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedSale.note || "No notes provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                }}
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
              Are you sure you want to delete this sale? This action cannot be undone.
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
                onClick={() => handleDeleteSale(showConfirmDelete)}
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
                  "Delete Sale"
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

export default SaleManagement;