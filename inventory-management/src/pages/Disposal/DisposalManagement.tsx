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
  Package,
  Warehouse,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Gift,
  Recycle,
  Truck,
  Skull,
  Eye,
  Download,
  FileText,
  X,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  disposalService,
  Disposal,
  DisposalFilterOptions,
  productService,
  warehouseService,
  priceService,
} from "../../services/disposalService";


const DisposalManagement: React.FC = () => {
  const [disposals, setDisposals] = useState<Disposal[]>([]);
  const [totalDisposals, setTotalDisposals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDisposal, setSelectedDisposal] = useState<Disposal | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDisposal, setEditingDisposal] = useState<Disposal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [viewType, setViewType] = useState<"table" | "cards">("table");
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Disposal;
    direction: "ascending" | "descending";
  } | null>({
    key: "createdAt",
    direction: "descending"
  });

  const [filters, setFilters] = useState<DisposalFilterOptions>({
    page: 1,
    pageSize: 10,
    method: "",
    includeDeleted: false,
  });

  const [formData, setFormData] = useState({
    productId: "",
    warehouseId: "",
    quantity: "",
    method: "damaged",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [warehouses, setWarehouses] = useState<
    { id: number; name: string; location: string }[]
  >([]);
  const [prices, setPrices] = useState<Price[]>([]);

  const methodOptions = [
    {
      value: "damaged",
      label: "Damaged",
      icon: <AlertTriangle className="w-4 h-4 mr-2" />,
      color: "bg-amber-100 text-amber-800",
    },
    {
      value: "expired",
      label: "Expired",
      icon: <Calendar className="w-4 h-4 mr-2" />,
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "destroyed",
      label: "Destroyed",
      icon: <Skull className="w-4 h-4 mr-2" />,
      color: "bg-red-100 text-red-800",
    },
    {
      value: "donated",
      label: "Donated",
      icon: <Gift className="w-4 h-4 mr-2" />,
      color: "bg-green-100 text-green-800",
    },
    {
      value: "recycled",
      label: "Recycled",
      icon: <Recycle className="w-4 h-4 mr-2" />,
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "returned_to_supplier",
      label: "Returned to Supplier",
      icon: <Truck className="w-4 h-4 mr-2" />,
      color: "bg-indigo-100 text-indigo-800",
    },
    {
      value: "other",
      label: "Other",
      icon: <Package className="w-4 h-4 mr-2" />,
      color: "bg-gray-100 text-gray-800",
    },
  ];

  interface Price {
    id: number;
    buyingUnitPrice?: number | null;
    sellingUnitPrice?: number | null;
    date: string;
    productId: number;
  }

  // Utility function to format numbers with comma as thousand separator
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(num);
  };

  const fetchDisposals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, pagination } = await disposalService.getAllDisposals({
        ...filters,
        search: searchTerm,
      });

      const processedDisposals: Disposal[] = (data || []).map(
        (disposal: any) => ({
          ...disposal,
          quantity: disposal.quantity
            ? parseFloat(disposal.quantity.toString())
            : 0,
        })
      );

      setDisposals(processedDisposals);
      setTotalDisposals(pagination?.total || 0);
    } catch (err) {
      console.error("Error fetching disposals:", err);
      setError("Failed to fetch disposals. Please try again later.");
      toast.error("Failed to load disposals");
      setDisposals([]);
      setTotalDisposals(0);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    fetchDisposals();
  }, [fetchDisposals]);

  useEffect(() => {
    if (showAddForm) {
      fetchDropdownOptions();
    }
  }, [showAddForm]);

  const fetchDropdownOptions = async () => {
    try {
      setLoadingProducts(true);
      setLoadingWarehouses(true);

      const [products, warehouses] = await Promise.all([
        productService.getAllProducts(),
        warehouseService.getAllWarehouses(),
      ]);

      setProducts(
        products.map((product) => ({
          id: product.id,
          name: product.name,
        }))
      );

      setWarehouses(
        warehouses.map((warehouse) => ({
          id: warehouse.id,
          name: warehouse.name,
          location: warehouse.location,
        }))
      );
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      toast.error("Failed to load form options");
    } finally {
      setLoadingProducts(false);
      setLoadingWarehouses(false);
    }
  };

  const fetchPricesForProduct = async (productId: number) => {
    try {
      setLoadingPrices(true);
      const prices = await priceService.getPricesByProduct(productId);

      setPrices(
        prices.map((p) => ({
          id: p.id,
          buyingUnitPrice:
            p.buyingUnitPrice !== undefined ? p.buyingUnitPrice : null,
          sellingUnitPrice:
            p.sellingUnitPrice !== undefined ? p.sellingUnitPrice : null,
          date: p.date,
          productId: p.productId,
        }))
      );
    } catch (error) {
      console.error("Error fetching prices:", error);
      toast.error("Failed to load product prices");
      setPrices([]);
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleRefresh = () => {
    fetchDisposals();
    toast.info("Disposals refreshed");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDisposals();
  };

  const handleAddClick = () => {
    setFormData({
      productId: "",
      warehouseId: "",
      quantity: "",
      method: "damaged",
      note: "",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingDisposal(null);
    setSelectedProduct(null);
    setPrices([]);
    setShowAddForm(true);
  };

  const handleEditClick = (disposal: Disposal) => {
    setFormData({
      productId: String(disposal.productId),
      warehouseId: String(disposal.warehouseId),
      quantity: String(disposal.quantity),
      method: disposal.method,
      note: disposal.note || "",
      date: disposal.date.split("T")[0],
    });
    setEditingDisposal(disposal);
    setSelectedProduct(disposal.productId);

    if (disposal.price) {
      setPrices([
        {
          id: disposal.price.id,
          buyingUnitPrice:
            disposal.price.buyingUnitPrice !== undefined
              ? disposal.price.buyingUnitPrice
              : null,
          sellingUnitPrice:
            disposal.price.sellingUnitPrice !== undefined
              ? disposal.price.sellingUnitPrice
              : null,
          date: disposal.price.date,
          productId: disposal.productId,
        },
      ]);
    } else {
      setPrices([]);
    }

    setShowAddForm(true);
  };

  const handleDeleteConfirm = (disposalId: number) => {
    setShowConfirmDelete(disposalId);
  };

  const handleDeleteDisposal = async (disposalId: number) => {
    try {
      setIsSubmitting(true);
      await disposalService.deleteDisposal(disposalId);
      setDisposals(disposals.filter((d) => d.id !== disposalId));
      setTotalDisposals(totalDisposals - 1);
      toast.success("Disposal deleted successfully");
      setShowConfirmDelete(null);
    } catch (err: any) {
      console.error("Error deleting disposal:", err);
      toast.error(err.message || "Failed to delete disposal");
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
    }));

    if (name === "productId" && value) {
      const productId = Number(value);
      setSelectedProduct(productId);
      fetchPricesForProduct(productId);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const disposalData = {
        productId: Number(formData.productId),
        warehouseId: Number(formData.warehouseId),
        quantity: parseFloat(formData.quantity),
        method: formData.method,
        note: formData.note,
        date: formData.date,
      };

      if (editingDisposal) {
        const updatedDisposal = await disposalService.updateDisposal(
          editingDisposal.id,
          disposalData
        );
        setDisposals(
          disposals.map((d) =>
            d.id === editingDisposal.id ? updatedDisposal : d
          )
        );
        toast.success("Disposal updated successfully");
      } else {
        const newDisposal = await disposalService.createDisposal(disposalData);
        setDisposals([newDisposal, ...disposals]);
        setTotalDisposals(totalDisposals + 1);
        toast.success("Disposal created successfully");
      }

      setShowAddForm(false);
    } catch (err: any) {
      console.error("Error saving disposal:", err);
      toast.error(err.message || "Failed to save disposal");
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
    if (newPage < 1 || newPage > totalPages) return;
    
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    
    // Scroll to top of the table
    const tableElement = document.getElementById('disposals-table-container');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const requestSort = (key: keyof Disposal) => {
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

  const sortedDisposals = React.useMemo(() => {
    if (!sortConfig) return disposals;

    return [...disposals].sort((a, b) => {
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
  }, [disposals, sortConfig]);

  // Filter disposals based on search term
  const filteredDisposals = React.useMemo(() => {
    if (!searchTerm) return sortedDisposals;

    return sortedDisposals.filter((disposal) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        disposal.referenceNumber.toLowerCase().includes(searchLower) ||
        (disposal.product?.name.toLowerCase().includes(searchLower) ||
        (disposal.warehouse?.name.toLowerCase().includes(searchLower)) ||
        disposal.method.toLowerCase().includes(searchLower)
      ));
    });
  }, [sortedDisposals, searchTerm]);

  // Calculate summary statistics
  const totalQuantity = disposals.reduce(
    (sum, d) => sum + (d.quantity || 0),
    0
  );
  const totalValue = disposals.reduce((sum, d) => {
    const price =
      d.price?.buyingUnitPrice !== undefined &&
      d.price?.buyingUnitPrice !== null
        ? parseFloat(d.price.buyingUnitPrice.toString())
        : 0;
    return sum + (d.quantity || 0) * price;
  }, 0);

  const getMethodIcon = (method: string) => {
    const option = methodOptions.find((m) => m.value === method);
    return option ? option.icon : <Package className="w-4 h-4 mr-2" />;
  };

  const getMethodLabel = (method: string) => {
    const option = methodOptions.find((m) => m.value === method);
    return option ? option.label : "Other";
  };

  const getMethodColor = (method: string) => {
    const option = methodOptions.find((m) => m.value === method);
    return option ? option.color : "bg-gray-100 text-gray-800";
  };

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(totalDisposals / pageSize);
  const paginatedDisposals = filteredDisposals.slice(
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
                <Package className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600" />
                Disposal Management
              </h1>
              <p className="text-gray-600">
                Track and manage product disposals
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Total Disposals
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        totalDisposals
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
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
                        `${formatNumber(totalQuantity)} Kg`
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Total Value
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        `$${formatNumber(totalValue)}`
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Methods Used
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        new Set(disposals.map((d) => d.method)).size
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Recycle className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                  </div>
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
                    placeholder="Search disposals..."
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
                    <span>New Disposal</span>
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
                        Method
                      </label>
                      <select
                        name="method"
                        value={filters.method}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">All Methods</option>
                        {methodOptions.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
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
                        onClick={fetchDisposals}
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
            {!loading && filteredDisposals.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No disposals found</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  {searchTerm ? 
                    `No disposals matching "${searchTerm}" were found. Try a different search term or clear your filters.` : 
                    "There are no disposals to display. Start by creating a new disposal."}
                </p>
                <button
                  onClick={handleAddClick}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                  <Plus size={16} className="mr-2" />
                  Create New Disposal
                </button>
              </div>
            )}

            {/* Disposals Display - Table View */}
            {viewType === "table" && (
              <div 
                id="disposals-table-container" 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("referenceNumber")}
                        >
                          <div className="flex items-center">
                            Reference
                            {sortConfig?.key === "referenceNumber" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending" ? "↑" : "↓"}
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
                                {sortConfig.direction === "ascending" ? "↑" : "↓"}
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
                                {sortConfig.direction === "ascending" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
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
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("method")}
                        >
                          <div className="flex items-center">
                            Method
                            {sortConfig?.key === "method" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("date")}
                        >
                          <div className="flex items-center">
                            Date
                            {sortConfig?.key === "date" && (
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
                        renderSkeleton()
                      ) : error ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-4 text-center"
                          >
                            <div className="flex items-center justify-center text-red-600">
                              <AlertCircle className="w-5 h-5 mr-2" />
                              {error}
                            </div>
                          </td>
                        </tr>
                      ) : filteredDisposals.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No disposals found.{" "}
                            {searchTerm && "Try a different search term."}
                          </td>
                        </tr>
                      ) : (
                        paginatedDisposals.map((disposal) => (
                          <tr key={disposal.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {disposal.referenceNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(disposal.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {disposal.product?.name || "N/A"}
                              </div>
                              {disposal.product?.description && (
                                <div className="text-xs text-gray-500">
                                  {disposal.product.description.substring(0, 30)}
                                  ...
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Warehouse className="w-4 h-4 mr-1 text-blue-500" />
                                <div>
                                  <div className="text-sm text-gray-900">
                                    {disposal.warehouse?.name || "N/A"}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {disposal.warehouse?.location}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatNumber(disposal.quantity || 0)} Kg
                              </div>
                              {disposal.price && (
                                <div className="text-xs text-gray-500">
                                  @ $
                                  {disposal.price.buyingUnitPrice !== undefined &&
                                  disposal.price.buyingUnitPrice !== null
                                    ? Number(
                                        disposal.price.buyingUnitPrice
                                      ).toFixed(2)
                                    : "N/A"}
                                  /unit
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getMethodIcon(disposal.method)}
                                <span className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(disposal.method)}`}>
                                  {getMethodLabel(disposal.method)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                                <div className="text-sm text-gray-900">
                                  {new Date(disposal.date).toLocaleDateString()}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedDisposal(disposal);
                                    setShowViewModal(true);
                                  }}
                                  className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </button>
                                
                                <button
                                  onClick={() => handleEditClick(disposal)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                  title="Edit Disposal"
                                >
                                  <Edit2 size={18} />
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteConfirm(disposal.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                  title="Delete Disposal"
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
                {filteredDisposals.length > 0 && (
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
                              filteredDisposals.length
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {filteredDisposals.length}
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
                ) : paginatedDisposals.length === 0 ? (
                  <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No disposals found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? 
                        `No disposals matching "${searchTerm}" were found.` : 
                        "There are no disposals to display."}
                    </p>
                  </div>
                ) : (
                  paginatedDisposals.map((disposal) => (
                    <div 
                      key={disposal.id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                              {disposal.referenceNumber}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Created on {new Date(disposal.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(
                              disposal.method
                            )}`}
                          >
                            {getMethodIcon(disposal.method)}
                            <span className="ml-1">{getMethodLabel(disposal.method)}</span>
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Quantity</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatNumber(disposal.quantity || 0)} Kg
                          </p>
                          {disposal.price && (
                            <p className="text-xs text-gray-500">
                              @ ${Number(disposal.price.buyingUnitPrice).toFixed(2)}/unit
                            </p>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Product</p>
                            <p className="text-sm text-gray-900">
                              {disposal.product?.name || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Warehouse</p>
                            <p className="text-sm text-gray-900">
                              {disposal.warehouse?.name || "N/A"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700">Date</p>
                          <p className="text-sm text-gray-900 flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {new Date(disposal.date).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {disposal.note && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700">Notes</p>
                            <p className="text-sm text-gray-900 line-clamp-2">
                              {disposal.note}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
                            Value: ${(disposal.quantity * (disposal.price?.buyingUnitPrice || 0)).toFixed(2)}
                          </p>
                          
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                setSelectedDisposal(disposal);
                                setShowViewModal(true);
                              }}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            
                            <button
                              onClick={() => handleEditClick(disposal)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                              title="Edit Disposal"
                            >
                              <Edit2 size={18} />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteConfirm(disposal.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                              title="Delete Disposal"
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
                {filteredDisposals.length > 0 && (
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
                        <span className="hidden sm:inline"> • Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredDisposals.length)} of {filteredDisposals.length}</span>
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

      {/* Add/Edit Disposal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingDisposal ? "Edit Disposal" : "Create New Disposal"}
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
                    disabled={isSubmitting || !!editingDisposal || loadingProducts}
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
                      No products available. Please add products first.
                    </p>
                  )}
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
                    disabled={isSubmitting || !!editingDisposal || loadingWarehouses}
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
                      No warehouses available. Please add warehouses first.
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
                    disabled={isSubmitting}
                  />
                </div>

                {/* Method Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="method"
                    value={formData.method}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isSubmitting}
                  >
                    {methodOptions.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Price Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Information
                  </label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {loadingPrices ? (
                      <div className="text-sm text-gray-500">
                        Loading prices...
                      </div>
                    ) : prices.length > 0 && prices[0] ? (
                      prices[0].buyingUnitPrice !== undefined &&
                      prices[0].buyingUnitPrice !== null ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            ${Number(prices[0].buyingUnitPrice).toFixed(2)} per
                            unit
                          </div>
                          <div className="text-xs text-gray-500">
                            Updated:{" "}
                            {new Date(prices[0].date).toLocaleDateString()}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-yellow-500">
                          Price not available for this product
                        </div>
                      )
                    ) : selectedProduct ? (
                      <div className="text-sm text-red-500">
                        No price records found for this product
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Select a product to see price
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                    placeholder="Additional information about this disposal..."
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
                    !formData.warehouseId ||
                    !formData.quantity ||
                    !formData.method ||
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
                      {editingDisposal ? "Updating..." : "Creating..."}
                    </>
                  ) : editingDisposal ? (
                    "Update Disposal"
                  ) : (
                    "Create Disposal"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Disposal Details Modal */}
      {showViewModal && selectedDisposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                Disposal Details - {selectedDisposal.referenceNumber}
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
              {/* Reference and Method */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Reference Number</p>
                  <p className="text-lg font-medium text-gray-900">
                    {selectedDisposal.referenceNumber}
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMethodColor(
                      selectedDisposal.method
                    )}`}
                  >
                    {getMethodIcon(selectedDisposal.method)}
                    <span className="ml-1">{getMethodLabel(selectedDisposal.method)}</span>
                  </span>
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
                        {selectedDisposal.product?.name || "N/A"}
                      </p>
                      {selectedDisposal.product?.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedDisposal.product.description}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantity</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatNumber(selectedDisposal.quantity)} Kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedDisposal.price?.buyingUnitPrice
                          ? `$${Number(selectedDisposal.price.buyingUnitPrice).toFixed(2)} per unit`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Value</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${(selectedDisposal.quantity * (selectedDisposal.price?.buyingUnitPrice || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                    <Warehouse className="w-4 h-4 mr-2 text-indigo-500" />
                    Warehouse Details
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Warehouse</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedDisposal.warehouse?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedDisposal.warehouse?.location || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedDisposal.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Disposal Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedDisposal.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedDisposal.note && (
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                    Notes
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-900">
                      {selectedDisposal.note}
                    </p>
                  </div>
                </div>
              )}
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
              Are you sure you want to delete this disposal? This action cannot be undone.
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
                onClick={() => handleDeleteDisposal(showConfirmDelete)}
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
                  "Delete Disposal"
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

export default DisposalManagement;