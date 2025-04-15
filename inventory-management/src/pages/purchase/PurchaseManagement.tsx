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
  Calendar,
  Check,
  X,
  Clock,
  RefreshCw,
  CreditCard,
  ShoppingCart,
  CheckCircle,
  Truck as TruckIcon,
  DollarSign,
  Scale,
  Eye,
  AlertCircle,
  Download,
  ArrowLeft,
  ArrowRight,
  FileText,
  Activity,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  purchaseService,
  Purchase,
  Supplier,
  Product,
  PurchaseFilterOptions,
} from "../../services/purchaseService";
// import { useMediaQuery } from "../../hooks/useMediaQuery";
// import { Tooltip } from "../../components/ui/tooltip";
// import { Skeleton } from "../../components/ui/skeleton";

const PurchaseManagement: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);
  const [viewType, setViewType] = useState<"table" | "cards">("table");
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Purchase;
    direction: "ascending" | "descending";
  } | null>({
    key: "createdAt",
    direction: "descending"
  });

  const [filters, setFilters] = useState<PurchaseFilterOptions>({
    page: 1,
    pageSize: 10,
    status: "",
    includeDeleted: false,
    supplierId: undefined,
    productId: undefined,
  });

  const [formData, setFormData] = useState({
    supplierId: "",
    productId: "",
    weight: "",
    description: "",
    expectedDeliveryDate: "",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Memoize fetchPurchases to prevent unnecessary re-renders
  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const purchases = await purchaseService.getAllPurchases({
        ...filters,
        search: searchTerm,
      });

      setPurchases(purchases);
      setTotalPurchases(purchases.length);
    } catch (err) {
      console.error("Error fetching purchases:", err);
      setError("Failed to fetch purchases. Please try again later.");
      toast.error("Failed to load purchases");
      setPurchases([]);
      setTotalPurchases(0);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  useEffect(() => {
    if (showAddForm) {
      fetchDropdownOptions();
    }
  }, [showAddForm]);

  // Auto-close filters panel on mobile when changing page
  useEffect(() => {
    if (isMobile && showFilters) {
      setShowFilters(false);
    }
  }, [filters.page, isMobile]);

  const fetchDropdownOptions = async () => {
    try {
      setLoadingProducts(true);
      setLoadingSuppliers(true);

      const [products, suppliers] = await Promise.all([
        purchaseService.getAllProducts(),
        purchaseService.getAllSuppliers(),
      ]);

      setProducts(products);
      setSuppliers(suppliers);
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      toast.error("Failed to load form options");
    } finally {
      setLoadingProducts(false);
      setLoadingSuppliers(false);
    }
  };

  const handleRefresh = () => {
    fetchPurchases();
    toast.info("Data refreshed");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPurchases();
  };

  const handleAddClick = () => {
    setFormData({
      supplierId: "",
      productId: "",
      weight: "",
      description: "",
      expectedDeliveryDate: "",
    });
    setEditingPurchase(null);
    setShowAddForm(true);
  };

  const handleEditClick = (purchase: Purchase) => {
    setFormData({
      supplierId: String(purchase.supplierId),
      productId: String(purchase.productId),
      weight: purchase.weight,
      description: purchase.description || "",
      expectedDeliveryDate: purchase.expectedDeliveryDate
        ? new Date(purchase.expectedDeliveryDate).toISOString().split("T")[0]
        : "",
    });
    setEditingPurchase(purchase);
    setShowAddForm(true);
  };

  const handleDeleteConfirm = (purchaseId: number) => {
    setShowConfirmDelete(purchaseId);
  };

  const handleDeletePurchase = async (purchaseId: number) => {
    try {
      setIsSubmitting(true);
      await purchaseService.deletePurchase(purchaseId);
      setPurchases(purchases.filter((p) => p.id !== purchaseId));
      setTotalPurchases(totalPurchases - 1);
      toast.success("Purchase deleted successfully");
      setShowConfirmDelete(null);
    } catch (err: any) {
      console.error("Error deleting purchase:", err);
      toast.error(err.response?.data?.error || err.message || "Failed to delete purchase");
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
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const purchaseData = {
        supplierId: Number(formData.supplierId),
        productId: Number(formData.productId),
        weight: parseFloat(formData.weight),
        description: formData.description,
        expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
      };

      if (editingPurchase) {
        // Only send updatable fields to backend
        const updateData = {
          description: purchaseData.description,
          expectedDeliveryDate: purchaseData.expectedDeliveryDate,
          weight: purchaseData.weight, // Only if weight is updatable
        };

        const updatedPurchase = await purchaseService.updatePurchase(
          editingPurchase.id,
          updateData
        );

        // Update purchases list with updated purchase
        setPurchases(
          purchases.map((p) =>
            p.id === editingPurchase.id ? updatedPurchase : p
          )
        );
        toast.success("Purchase updated successfully!");
      } else {
        // Create new purchase
        const newPurchase = await purchaseService.createPurchase(purchaseData);
        setPurchases([newPurchase, ...purchases]);
        setTotalPurchases(totalPurchases + 1);
        toast.success("Purchase created successfully");
      }

      setShowAddForm(false);
    } catch (err: any) {
      console.error("Error saving purchase:", err);
      toast.error(err.response?.data?.error || err.message || "Failed to save purchase");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev: PurchaseFilterOptions) => ({
      ...prev,
      [name]:
        name === "supplierId" || name === "productId"
          ? value
            ? Number(value)
            : undefined
          : value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setFilters((prev: PurchaseFilterOptions) => ({
      ...prev,
      page: newPage,
    }));
    
    // Scroll to top of the table
    const tableElement = document.getElementById('purchases-table-container');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const requestSort = (key: keyof Purchase) => {
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

  const sortedPurchases = React.useMemo(() => {
    if (!sortConfig) return purchases;

    return [...purchases].sort((a, b) => {
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
  }, [purchases, sortConfig]);

  // Filter purchases based on search term
  const filteredPurchases = React.useMemo(() => {
    if (!searchTerm) return sortedPurchases;

    return sortedPurchases.filter((purchase) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        purchase.purchaseReference.toLowerCase().includes(searchLower) ||
        purchase.supplier?.user?.profile?.names
          ?.toLowerCase()
          .includes(searchLower) ||
        purchase.product?.name?.toLowerCase().includes(searchLower) ||
        purchase.description?.toLowerCase().includes(searchLower) ||
        purchase.status.toLowerCase().includes(searchLower)
      );
    });
  }, [sortedPurchases, searchTerm]);

  // Calculate summary statistics
  const approvedPurchases = purchases.filter(
    (p) => p.status === "approved"
  ).length;
  const totalWeight = purchases.reduce(
    (sum, p) => sum + parseFloat(p.weight || '0'),
    0
  );
  const totalAmount = purchases.reduce(
    (sum, p) =>
      sum +
      parseFloat(p.weight || '0') * parseFloat(p.dailyPrice?.buyingUnitPrice || "0"),
    0
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "all_completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <X className="w-4 h-4 text-red-500" />;
      case "payment_completed":
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case "delivery_complete":
        return <TruckIcon className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "all_completed":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "payment_completed":
        return "bg-purple-100 text-purple-800";
      case "delivery_complete":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(filteredPurchases.length / pageSize);
  const paginatedPurchases = filteredPurchases.slice(
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
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
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
                Purchase Management
              </h1>
              <p className="text-gray-600">
                Manage product purchases from suppliers
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Total Purchases
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        totalPurchases
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Total value: {loading ? "..." : `${totalAmount.toLocaleString()} RWF`}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Approved Purchases
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        approvedPurchases
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {loading ? "..." : `${((approvedPurchases / totalPurchases) * 100 || 0).toFixed(1)}% of total`}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Total Weight
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        totalWeight.toLocaleString()
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Scale className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Measured in kilograms (Kg)
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Total Amount
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        totalAmount.toLocaleString()
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Amount in RWF
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
                    placeholder="Search purchases..."
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
                    <span className={isMobile ? "sr-only" : ""}>Filters</span>
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
                    <span className={isMobile ? "sr-only" : ""}>
                      {viewType === "table" ? "Cards" : "Table"}
                    </span>
                  </button>
                  
                  <button
                    onClick={handleExportData}
                    className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    title="Export data"
                  >
                    <Download size={16} className="mr-1" />
                    <span className={isMobile ? "sr-only" : ""}>Export</span>
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
                    <span>New Purchase</span>
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
                        <option value="draft">Draft</option>
                        <option value="approved">Approved</option>
                        <option value="payment_completed">
                          Payment Completed
                        </option>
                        <option value="delivery_complete">
                          Delivery Complete
                        </option>
                        <option value="all_completed">All Completed</option>
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
                        Supplier
                      </label>
                      <select
                        name="supplierId"
                        value={filters.supplierId}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">All Suppliers</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.user?.profile?.names ||
                              "Unknown Supplier"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={fetchPurchases}
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
            {!loading && filteredPurchases.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases found</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  {searchTerm ? 
                    `No purchases matching "${searchTerm}" were found. Try a different search term or clear your filters.` : 
                    "There are no purchases to display. Start by creating a new purchase."}
                </p>
                <button
                  onClick={handleAddClick}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                  <Plus size={16} className="mr-2" />
                  Create New Purchase
                </button>
              </div>
            )}

            {/* Purchases Display - Table View */}
            {viewType === "table" && (
              <div 
                id="purchases-table-container" 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("purchaseReference")}
                        >
                          <div className="flex items-center">
                            Reference
                            {sortConfig?.key === "purchaseReference" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
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
                          Price (RWF)
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("expectedDeliveryDate")}
                        >
                          <div className="flex items-center">
                            Delivery Date
                            {sortConfig?.key === "expectedDeliveryDate" && (
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
                        renderSkeleton()
                      ) : error ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-4 text-center"
                          >
                            <div className="flex items-center justify-center text-red-600">
                              <AlertCircle className="w-5 h-5 mr-2" />
                              {error}
                            </div>
                          </td>
                        </tr>
                      ) : filteredPurchases.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No purchases found.{" "}
                            {searchTerm && "Try a different search term."}
                          </td>
                        </tr>
                      ) : (
                        paginatedPurchases.map((purchase) => (
                          <tr key={purchase.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {purchase.purchaseReference}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(
                                  purchase.createdAt
                                ).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {purchase.supplier?.user?.profile?.names ||
                                  "Unknown Supplier"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {purchase.supplier?.user?.profile?.phoneNumber ||
                                  "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {purchase.product?.name ||
                                  purchase.dailyPrice?.product?.name ||
                                  "No product"}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                {purchase.product?.description ||
                                  purchase.dailyPrice?.product?.description ||
                                  "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {parseFloat(purchase.weight).toLocaleString()} Kg
                              </div>
                              <div className="text-xs text-gray-500">
                                Delivered:{" "}
                                {parseFloat(
                                  purchase.totalDelivered
                                ).toLocaleString()}{" "}
                                Kg
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {purchase.dailyPrice?.buyingUnitPrice
                                  ? `${parseFloat(
                                      purchase.dailyPrice.buyingUnitPrice
                                    ).toLocaleString()} RWF/Kg`
                                  : "N/A"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Total:{" "}
                                {(
                                  parseFloat(purchase.weight) *
                                  parseFloat(
                                    purchase.dailyPrice?.buyingUnitPrice || "0"
                                  )
                                ).toLocaleString()}{" "}
                                RWF
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                                <div className="text-sm text-gray-900">
                                  {purchase.expectedDeliveryDate
                                    ? new Date(
                                        purchase.expectedDeliveryDate
                                      ).toLocaleDateString()
                                    : "Not set"}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(purchase.status)}
                                <span
                                  className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    purchase.status
                                  )}`}
                                >
                                  {purchase.status.replace(/_/g, " ")}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedPurchase(purchase);
                                    setShowViewModal(true);
                                  }}
                                  className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </button>
                                
                                {purchase.status !== "all_completed" && (
                                  <>
                                    <button
                                      onClick={() => handleEditClick(purchase)}
                                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                      title="Edit Purchase"
                                    >
                                      <Edit2 size={18} />
                                    </button>
                                    
                                    <button
                                      onClick={() => handleDeleteConfirm(purchase.id)}
                                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                      title="Delete Purchase"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredPurchases.length > 0 && (
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
                              filteredPurchases.length
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {filteredPurchases.length}
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
                ) : paginatedPurchases.length === 0 ? (
                  <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? 
                        `No purchases matching "${searchTerm}" were found.` : 
                        "There are no purchases to display."}
                    </p>
                  </div>
                ) : (
                  paginatedPurchases.map((purchase) => (
                    <div 
                      key={purchase.id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                              {purchase.purchaseReference}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Created on {new Date(purchase.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              purchase.status
                            )}`}
                          >
                            {getStatusIcon(purchase.status)}
                            <span className="ml-1">{purchase.status.replace(/_/g, " ")}</span>
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Supplier</p>
                          <p className="text-sm text-gray-900">
                            {purchase.supplier?.user?.profile?.names || "Unknown Supplier"}
                          </p>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Product</p>
                          <p className="text-sm text-gray-900">
                            {purchase.product?.name || purchase.dailyPrice?.product?.name || "No product"}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Weight</p>
                            <p className="text-sm text-gray-900">
                              {parseFloat(purchase.weight).toLocaleString()} Kg
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Unit Price</p>
                            <p className="text-sm text-gray-900">
                              {purchase.dailyPrice?.buyingUnitPrice
                                ? `${parseFloat(purchase.dailyPrice.buyingUnitPrice).toLocaleString()} RWF`
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700">Total Amount</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {(parseFloat(purchase.weight) * parseFloat(purchase.dailyPrice?.buyingUnitPrice || "0")).toLocaleString()} RWF
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {purchase.expectedDeliveryDate
                              ? new Date(purchase.expectedDeliveryDate).toLocaleDateString()
                              : "No delivery date"}
                          </p>
                          
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                setSelectedPurchase(purchase);
                                setShowViewModal(true);
                              }}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            
                            {purchase.status !== "all_completed" && (
                              <>
                                <button
                                  onClick={() => handleEditClick(purchase)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                                  title="Edit Purchase"
                                >
                                  <Edit2 size={18} />
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteConfirm(purchase.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                                  title="Delete Purchase"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Card View Pagination */}
                {filteredPurchases.length > 0 && (
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
                        <span className="hidden sm:inline"> • Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredPurchases.length)} of {filteredPurchases.length}</span>
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

      {/* Add/Edit Purchase Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingPurchase ? "Edit Purchase" : "Create New Purchase"}
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
                {/* Supplier Select */}
                <div className="col-span-1">
                  <label
                    htmlFor="supplierId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="supplierId"
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      editingPurchase ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    required
                    disabled={
                      isSubmitting || loadingSuppliers || !!editingPurchase
                    }
                  >
                    <option value="">
                      {loadingSuppliers
                        ? "Loading suppliers..."
                        : "Select a supplier"}
                    </option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.user?.profile?.names || "Unknown Supplier"} (
                        {supplier.supplierId})
                      </option>
                    ))}
                  </select>
                  {!loadingSuppliers && suppliers.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      No suppliers available. Please add suppliers first.
                    </p>
                  )}
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
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      editingPurchase ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    required
                    disabled={
                      isSubmitting || loadingProducts || !!editingPurchase
                    }
                  >
                    <option value="">
                      {loadingProducts
                        ? "Loading products..."
                        : "Select a product"}
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} {product.description ? `- ${product.description}` : ''}
                      </option>
                    ))}
                  </select>
                  {!loadingProducts && products.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      No products available. Please add products first.
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
                    disabled={isSubmitting}
                  />
                </div>

                {/* Expected Delivery Date */}
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
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                    placeholder="Enter additional details about this purchase..."
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
                    loadingSuppliers ||
                    (products.length === 0 && !editingPurchase) ||
                    (suppliers.length === 0 && !editingPurchase)
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
                      {editingPurchase ? "Updating..." : "Creating..."}
                    </>
                  ) : editingPurchase ? (
                    "Update Purchase"
                  ) : (
                    "Create Purchase"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Purchase Details Modal */}
      {showViewModal && selectedPurchase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                Purchase Details
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
              {/* Purchase Reference and Status */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Reference Number</p>
                  <p className="text-lg font-medium text-gray-900">
                    {selectedPurchase.purchaseReference}
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedPurchase.status
                    )}`}
                  >
                    {getStatusIcon(selectedPurchase.status)}
                    <span className="ml-1">{selectedPurchase.status.replace(/_/g, " ")}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-2 text-blue-500" />
                    Basic Information
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedPurchase.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedPurchase.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Expected Delivery</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPurchase.expectedDeliveryDate
                          ? new Date(selectedPurchase.expectedDeliveryDate).toLocaleDateString()
                          : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPurchase.description || "No description provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                    <Scale className="w-4 h-4 mr-2 text-purple-500" />
                    Product Information
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Product</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPurchase.product?.name || selectedPurchase.dailyPrice?.product?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Product Description</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPurchase.product?.description || selectedPurchase.dailyPrice?.product?.description || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="text-sm font-medium text-gray-900">
                        {parseFloat(selectedPurchase.weight).toLocaleString()} Kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Unit Price</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPurchase.dailyPrice?.buyingUnitPrice
                          ? `${parseFloat(selectedPurchase.dailyPrice.buyingUnitPrice).toLocaleString()} RWF/Kg`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Value</p>
                      <p className="text-sm font-medium text-gray-900">
                        {(
                          parseFloat(selectedPurchase.weight) *
                          parseFloat(selectedPurchase.dailyPrice?.buyingUnitPrice || "0")
                        ).toLocaleString()} RWF
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-indigo-500" />
                    Supplier Information
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Supplier Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPurchase.supplier?.user?.profile?.names || "Unknown Supplier"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Supplier ID</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPurchase.supplier?.supplierId || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPurchase.supplier?.user?.profile?.phoneNumber || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPurchase.supplier?.district}, {selectedPurchase.supplier?.sector}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                    <TruckIcon className="w-4 h-4 mr-2 text-amber-500" />
                    Delivery Information
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Total Weight</p>
                      <p className="text-sm font-medium text-gray-900">
                        {parseFloat(selectedPurchase.weight).toLocaleString()} Kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Delivered</p>
                      <p className="text-sm font-medium text-gray-900">
                        {parseFloat(selectedPurchase.totalDelivered).toLocaleString()} Kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Remaining</p>
                      <p className="text-sm font-medium text-gray-900">
                        {(parseFloat(selectedPurchase.weight) - parseFloat(selectedPurchase.totalDelivered)).toLocaleString()} Kg
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Delivery Progress</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (parseFloat(selectedPurchase.totalDelivered) / parseFloat(selectedPurchase.weight)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round((parseFloat(selectedPurchase.totalDelivered) / parseFloat(selectedPurchase.weight)) * 100)}% complete
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs for Deliveries and Payments */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-base font-medium text-gray-900">Related Records</h3>
                </div>

                {/* Deliveries Section */}
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <TruckIcon className="w-4 h-4 mr-2 text-gray-500" />
                    Deliveries ({selectedPurchase.deliveries?.length || 0})
                  </h4>
                  
                  {selectedPurchase.deliveries?.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reference
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Weight (Kg)
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Delivery Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedPurchase.deliveries.map((delivery) => (
                            <tr key={delivery.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {delivery.deliveryReference}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    delivery.status
                                  )}`}
                                >
                                  {delivery.status}
                                </span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {parseFloat(delivery.weight).toLocaleString()}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {delivery.deliveredAt
                                  ? new Date(delivery.deliveredAt).toLocaleDateString()
                                  : "Not delivered"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md text-center">
                      No deliveries recorded for this purchase
                    </div>
                  )}
                </div>

                {/* Payments Section */}
                <div className="border-t border-gray-200 p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                    Payments ({selectedPurchase.payments?.length || 0})
                  </h4>
                  
                  {selectedPurchase.payments?.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reference
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount (RWF)
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Method
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Payment Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedPurchase.payments.map((payment) => (
                            <tr key={payment.id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {payment.paymentReference}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {parseFloat(payment.amount).toLocaleString()}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {payment.paymentMethod.replace(/_/g, " ")}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    payment.status
                                  )}`}
                                >
                                  {payment.status}
                                </span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {payment.paidAt
                                  ? new Date(payment.paidAt).toLocaleDateString()
                                  : "Pending"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md text-center">
                      No payments recorded for this purchase
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
              Are you sure you want to delete this purchase? This action cannot be undone.
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
                onClick={() => handleDeletePurchase(showConfirmDelete)}
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
                  "Delete Purchase"
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

// Create hooks folder and add this hook
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

export default PurchaseManagement;