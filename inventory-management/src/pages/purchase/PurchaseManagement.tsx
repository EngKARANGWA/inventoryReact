/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  RefreshCw,
  ShoppingCart,
  Download,
  ArrowLeft,
  ArrowRight,
  FileText,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  purchaseService,
  Purchase,
  User,
  Product,
  PurchaseFilterOptions,
} from "../../services/purchaseService";
import PurchaseTable from "./PurchaseTable";
import PurchaseCards from "./PurchaseCards";
import PurchaseForm from "./PurchaseForm";
import PurchaseViewModal from "./PurchaseViewModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import useMediaQuery from "../../hooks/useMediaQuery";

const PurchaseManagement: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(
    null
  );
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(
    null
  );
  const [viewType, setViewType] = useState<"table" | "cards">("table");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Purchase;
    direction: "ascending" | "descending";
  } | null>({
    key: "createdAt",
    direction: "descending",
  });

  const [filters, setFilters] = useState<PurchaseFilterOptions>({
    page: 1,
    pageSize: 10,
    status: "",
    includeDeleted: false,
    userId: undefined,
    productId: undefined,
  });

  const [formData, setFormData] = useState({
    userId: "",
    productId: "",
    weight: "",
    unitPrice: "",
    description: "",
    expectedDeliveryDate: "",
  });

  const handleViewPurchase = async (purchase: Purchase) => {
    try {
      // Store the basic purchase info immediately for better UX
      setSelectedPurchase(purchase);
      setShowViewModal(true);

      // Fetch the complete purchase details with payments and deliveries
      const detailedPurchase = await purchaseService.getPurchaseById(
        purchase.id
      );

      if (detailedPurchase) {
        // Update with the detailed version that includes payments and deliveries
        setSelectedPurchase(detailedPurchase);

        // Debug: Log to see what we're getting
        console.log("Detailed purchase:", detailedPurchase);
        console.log("Payments count:", detailedPurchase.payments?.length || 0);
        console.log(
          "Deliveries count:",
          detailedPurchase.deliveries?.length || 0
        );
      }
    } catch (error) {
      console.error("Error fetching purchase details:", error);
      toast.error("Failed to load complete purchase details");
    }
  };

  const [products, setProducts] = useState<Product[]>([]);

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    // setError(null);

    try {
      const response = await purchaseService.getAllPurchases({
        ...filters,
        search: searchTerm,
      });

      if (Array.isArray(response)) {
        setPurchases(response);
        setTotalPurchases(response.length);
      } else {
        console.error("Error: API response is not an array", response);
        toast.error("Received invalid data format from server");
        setPurchases([]);
        setTotalPurchases(0);
      }
    } catch (err) {
      console.error("Error fetching purchases:", err);
      toast.info("Failed to fetch purchases. Please try again later.");
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

  useEffect(() => {
    if (isMobile && showFilters) {
      setShowFilters(false);
    }
  }, [filters.page, isMobile, showFilters]);

  const fetchDropdownOptions = async () => {
    try {
      setLoadingProducts(true);
      setLoadingUsers(true);

      const [products, users] = await Promise.all([
        purchaseService.getAllProducts(),
        purchaseService.getAllSupplierUsers(),
      ]);

      setProducts(products);
      setUsers(users);
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      toast.error("Failed to load form options");
    } finally {
      setLoadingProducts(false);
      setLoadingUsers(false);
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
      userId: "",
      productId: "",
      weight: "",
      unitPrice: "",
      description: "",
      expectedDeliveryDate: "",
    });
    setEditingPurchase(null);
    setShowAddForm(true);
  };

  const handleEditClick = (purchase: Purchase) => {
    setFormData({
      userId: String(purchase.userId),
      productId: String(purchase.productId),
      weight: purchase.weight,
      unitPrice: purchase.unitPrice || "",
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
      toast.error(
        err.response?.data?.error || err.message || "Failed to delete purchase"
      );
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
        userId: Number(formData.userId),
        productId: Number(formData.productId),
        weight: parseFloat(formData.weight),
        unitPrice: parseFloat(formData.unitPrice),
        description: formData.description,
        expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
      };

      if (editingPurchase) {
        const updateData = {
          description: purchaseData.description,
          expectedDeliveryDate: purchaseData.expectedDeliveryDate,
          weight: purchaseData.weight,
          unitPrice: purchaseData.unitPrice,
        };

        const updatedPurchase = await purchaseService.updatePurchase(
          editingPurchase.id,
          updateData
        );

        setPurchases(
          purchases.map((p) =>
            p.id === editingPurchase.id ? updatedPurchase : p
          )
        );
        toast.success("Purchase updated successfully!");
      } else {
        const newPurchase = await purchaseService.createPurchase(purchaseData);
        setPurchases([newPurchase, ...purchases]);
        setTotalPurchases(totalPurchases + 1);
        toast.success("Purchase created successfully");
      }

      setShowAddForm(false);
    } catch (err: any) {
      console.error("Error saving purchase:", err);
      toast.error(
        err.response?.data?.message || err.message || "Failed to save purchase"
      );
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

    const tableElement = document.getElementById("purchases-table-container");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
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
    if (!purchases || !Array.isArray(purchases)) return [];
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

  const filteredPurchases = React.useMemo(() => {
    if (!searchTerm) return sortedPurchases;

    return sortedPurchases.filter((purchase) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        purchase.purchaseReference.toLowerCase().includes(searchLower) ||
        purchase.user?.profile?.names?.toLowerCase().includes(searchLower) ||
        purchase.product?.name?.toLowerCase().includes(searchLower) ||
        purchase.description?.toLowerCase().includes(searchLower) ||
        purchase.status.toLowerCase().includes(searchLower)
      );
    });
  }, [sortedPurchases, searchTerm]);

  // Calculate summary statistics
  const totalAmount = purchases.reduce((sum, p) => {
    const weight = parseFloat(p.weight || "0");
    const unitPrice = parseFloat(p.unitPrice || "0");
    return sum + weight * unitPrice;
  }, 0);

  const totalPaid = purchases.reduce(
    (sum, p) => sum + parseFloat(p.totalPaid || "0"),
    0
  );

  const totalUnpaid = totalAmount - totalPaid;

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(filteredPurchases.length / pageSize);
  const paginatedPurchases = filteredPurchases.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportData = () => {
    toast.info("Data export feature will be implemented soon!");
  };

  const toggleViewType = () => {
    setViewType((prev) => (prev === "table" ? "cards" : "table"));
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
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
                        `${totalAmount.toLocaleString()} RWF`
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {loading ? "..." : `${totalPurchases} purchase records`}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Total Unpaid
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        `${totalUnpaid.toLocaleString()} RWF`
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {loading
                    ? "..."
                    : `${((totalUnpaid / totalAmount) * 100 || 0).toFixed(
                        1
                      )}% of total outstanding`}
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
                        `${totalPaid.toLocaleString()} RWF`
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {loading
                    ? "..."
                    : `${((totalPaid / totalAmount) * 100 || 0).toFixed(
                        1
                      )}% of total paid`}
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
                    title={`Switch to ${
                      viewType === "table" ? "card" : "table"
                    } view`}
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
                        name="userId"
                        value={filters.userId}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">All Suppliers</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.profile?.names || "Unknown Supplier"}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No purchases found
                </h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  {searchTerm
                    ? `No purchases matching "${searchTerm}" were found. Try a different search term or clear your filters.`
                    : "There are no purchases to display. Start by creating a new purchase."}
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

            {/* Purchases Display */}
            {!loading && filteredPurchases.length > 0 && (
              <>
                {viewType === "table" ? (
                  <div
                    id="purchases-table-container"
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <PurchaseTable
                      purchases={paginatedPurchases}
                      onView={handleViewPurchase}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteConfirm}
                      sortConfig={sortConfig}
                      requestSort={requestSort}
                    />

                    {/* Pagination */}
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
                              <ArrowLeft
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
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
                  </div>
                ) : (
                  <>
                    <PurchaseCards
                      purchases={paginatedPurchases}
                      onView={handleViewPurchase}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteConfirm}
                    />

                    {/* Card View Pagination */}
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
                              filteredPurchases.length
                            )}{" "}
                            of {filteredPurchases.length}
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
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Purchase Form */}
      <PurchaseForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleFormSubmit}
        formData={formData}
        onFormChange={handleFormChange}
        products={products}
        users={users}
        loadingProducts={loadingProducts}
        loadingUsers={loadingUsers}
        isSubmitting={isSubmitting}
        editingPurchase={!!editingPurchase}
      />

      {/* View Purchase Details Modal */}
      <PurchaseViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        purchase={selectedPurchase}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showConfirmDelete !== null}
        onClose={() => setShowConfirmDelete(null)}
        onConfirm={() =>
          showConfirmDelete && handleDeletePurchase(showConfirmDelete)
        }
        isSubmitting={isSubmitting}
      />

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

export default PurchaseManagement;
