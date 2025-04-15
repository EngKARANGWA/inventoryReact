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
  CreditCard,
  Check,
  X,
  Clock,
  RefreshCw,
  Calendar,
  DollarSign,
  Eye,
  AlertCircle,
  Download,
  ArrowLeft,
  ArrowRight,
  FileText,
  Activity,
  ShoppingCart,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { paymentService, Payment } from "../../services/paymentService";
import Select from "react-select";

interface PaymentFilters {
  page: number;
  pageSize: number;
  payableType: "purchase" | "sale" | "";
  status: string;
  includeDeleted: boolean;
}

const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);
  const [purchasesSearch, setPurchasesSearch] = useState("");
  const [salesSearch, setSalesSearch] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [purchasesOptions, setPurchasesOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [salesOptions, setSalesOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);
  const [viewType, setViewType] = useState<"table" | "cards">("table");

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Payment;
    direction: "ascending" | "descending";
  } | null>({
    key: "createdAt",
    direction: "descending"
  });

  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    pageSize: 10,
    payableType: "",
    status: "",
    includeDeleted: false,
  });

  const [formData, setFormData] = useState({
    amount: "",
    payableType: "",
    paymentMethod: "",
    transactionReference: "",
    purchaseId: "",
    saleId: "",
  });

  // Utility function to format numbers with comma as thousand separator
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(num);
  };

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, pagination } = await paymentService.getAllPayments({
        ...filters,
        payableType: filters.payableType || undefined,
        search: searchTerm,
      });

      setPayments(data || []);
      setTotalPayments(pagination?.totalItems || 0);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Failed to fetch payments. Please try again later.");
      toast.error("Failed to load payments");
      setPayments([]);
      setTotalPayments(0);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    if (showAddForm && formData.payableType === "purchase") {
      fetchPurchases();
    }
  }, [showAddForm, formData.payableType]);

  useEffect(() => {
    if (showAddForm && formData.payableType === "sale") {
      fetchSales();
    }
  }, [showAddForm, formData.payableType]);

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const loadFile = async () => {
      if (!selectedPayment?.transactionReference) return;

      try {
        const filename = selectedPayment.transactionReference.split("/").pop();
        if (!filename) return;

        const blob = await paymentService.getPaymentFile(filename);

        if (isMounted) {
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
        }
      } catch (error) {
        console.error("Error loading payment file:", error);
        if (isMounted) {
          toast.error("Failed to load payment proof");
        }
      }
    };

    if (showViewModal && selectedPayment?.transactionReference) {
      loadFile();
    }

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [showViewModal, selectedPayment]);

  const fetchPurchases = async () => {
    setPurchasesLoading(true);
    try {
      const purchases = await paymentService.getPurchases(purchasesSearch);
      setPurchasesOptions(
        purchases.map((purchase) => ({
          value: purchase.id,
          label: `${purchase.purchaseReference} - ${
            purchase.supplier?.user?.profile?.names || "Unknown"
          } (${purchase.description})`,
        }))
      );
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast.error("Failed to load purchases");
    } finally {
      setPurchasesLoading(false);
    }
  };

  const fetchSales = async () => {
    setSalesLoading(true);
    try {
      const sales = await paymentService.getSales(salesSearch);
      setSalesOptions(
        sales.map((sale) => ({
          value: sale.id,
          label: `${sale.referenceNumber} - ${
            sale.client?.user?.profile?.names || "Unknown"
          }`,
        }))
      );
    } catch (error) {
      console.error("Error fetching sales:", error);
      toast.error("Failed to load sales");
    } finally {
      setSalesLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchPayments();
    toast.info("Payments refreshed");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPayments();
  };

  const handleAddClick = () => {
    setFormData({
      amount: "",
      payableType: "",
      paymentMethod: "",
      transactionReference: "",
      purchaseId: "",
      saleId: "",
    });
    setEditingPayment(null);
    setShowAddForm(true);
    setFile(null);
  };

  const handleEditClick = (payment: Payment) => {
    setFormData({
      amount: payment.amount.toString(),
      payableType: payment.payableType,
      paymentMethod: payment.paymentMethod,
      transactionReference: payment.transactionReference || "",
      purchaseId: payment.purchaseId?.toString() || "",
      saleId: payment.saleId?.toString() || "",
    });
    setEditingPayment(payment);
    setShowAddForm(true);
    setFile(null);
  };

  const handleDeleteConfirm = (paymentId: number) => {
    setShowConfirmDelete(paymentId);
  };

  const handleDeletePayment = async (paymentId: number) => {
    try {
      setIsSubmitting(true);
      await paymentService.deletePayment(paymentId);
      setPayments(payments.filter((p) => p.id !== paymentId));
      setTotalPayments(totalPayments - 1);
      toast.success("Payment deleted successfully");
      setShowConfirmDelete(null);
    } catch (err: any) {
      console.error("Error deleting payment:", err);
      toast.error(err.message || "Failed to delete payment");
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
      ...(name === "payableType" && {
        purchaseId: "",
        saleId: "",
      }),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataObj = new FormData();
      // Remove commas before converting to float
      const amountValue = parseFloat(formData.amount.replace(/,/g, ""));
      formDataObj.append("amount", amountValue.toString());
      formDataObj.append("payableType", formData.payableType);
      formDataObj.append("paymentMethod", formData.paymentMethod);

      if (formData.payableType === "purchase" && formData.purchaseId) {
        formDataObj.append("purchaseId", formData.purchaseId);
      }

      if (formData.payableType === "sale" && formData.saleId) {
        formDataObj.append("saleId", formData.saleId);
      }

      if (file) {
        formDataObj.append("transactionReference", file);
      }

      if (editingPayment) {
        const updatedPayment = await paymentService.updatePayment(
          editingPayment.id,
          {
            amount: amountValue,
            paymentMethod: formData.paymentMethod as
              | "bank_transfer"
              | "cheque"
              | "cash"
              | "mobile_money",
          },
          file || undefined
        );
        setPayments(
          payments.map((p) => (p.id === editingPayment.id ? updatedPayment : p))
        );
        toast.success("Payment updated successfully");
      } else {
        const newPayment = await paymentService.createPayment(
          {
            amount: amountValue,
            payableType: formData.payableType as "purchase" | "sale",
            paymentMethod: formData.paymentMethod as
              | "bank_transfer"
              | "cheque"
              | "cash"
              | "mobile_money",
            ...(formData.payableType === "purchase" && {
              purchaseId: parseInt(formData.purchaseId),
            }),
            ...(formData.payableType === "sale" && {
              saleId: parseInt(formData.saleId),
            }),
          },
          file || undefined
        );
        setPayments([newPayment, ...payments]);
        setTotalPayments(totalPayments + 1);
        toast.success("Payment created successfully");
      }

      setShowAddForm(false);
    } catch (err: any) {
      console.error("Error saving payment:", err);
      toast.error(err.message || "Failed to save payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]:
        name === "payableType" ? (value as "purchase" | "sale" | "") : value,
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
    const tableElement = document.getElementById('payments-table-container');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const requestSort = (key: keyof Payment) => {
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

  const sortedPayments = React.useMemo(() => {
    if (!sortConfig) return payments;

    return [...payments].sort((a, b) => {
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
  }, [payments, sortConfig]);

  // Filter payments based on search term
  const filteredPayments = React.useMemo(() => {
    if (!searchTerm) return sortedPayments;

    return sortedPayments.filter((payment) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        payment.paymentReference.toLowerCase().includes(searchLower) ||
        (payment.payableType === "purchase"
          ? payment.purchase?.supplier?.user?.profile?.names
              ?.toLowerCase()
              .includes(searchLower)
          : payment.sale?.client?.user?.profile?.names
              ?.toLowerCase()
              .includes(searchLower)) ||
        payment.status.toLowerCase().includes(searchLower) ||
        payment.paymentMethod.toLowerCase().includes(searchLower) ||
        payment.transactionReference?.toLowerCase().includes(searchLower)
      );
    });
  }, [sortedPayments, searchTerm]);

  // Calculate summary statistics
  const completedPayments = payments.filter(
    (p) => p.status === "completed"
  ).length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const totalAmount = payments.reduce((sum, p) => {
    const amount = Number(p.amount) || 0;
    return sum + amount;
  }, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />;
      case "failed":
        return <X className="w-4 h-4 text-red-500" />;
      case "refunded":
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case "mobile_money":
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case "cash":
        return <DollarSign className="w-4 h-4 text-purple-500" />;
      case "cheque":
        return <CreditCard className="w-4 h-4 text-amber-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice(
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
                <CreditCard className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600" />
                Payment Management
              </h1>
              <p className="text-gray-600">
                Manage payments for purchases and sales
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Total Payments
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        totalPayments
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Total value: {loading ? "..." : `${formatNumber(totalAmount)} RWF`}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Completed Payments
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        completedPayments
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {loading ? "..." : `${((completedPayments / totalPayments) * 100 || 0).toFixed(1)}% of total`}
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
                        pendingPayments
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {loading ? "..." : `${((pendingPayments / totalPayments) * 100 || 0).toFixed(1)}% of total`}
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
                        formatNumber(totalAmount)
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
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
                    placeholder="Search payments..."
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
                    <span>New Payment</span>
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
                        Payable Type
                      </label>
                      <select
                        name="payableType"
                        value={filters.payableType}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">All Types</option>
                        <option value="purchase">Purchase</option>
                        <option value="sale">Sale</option>
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
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
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
                        onClick={fetchPayments}
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
            {!loading && filteredPayments.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  {searchTerm ? 
                    `No payments matching "${searchTerm}" were found. Try a different search term or clear your filters.` : 
                    "There are no payments to display. Start by creating a new payment."}
                </p>
                <button
                  onClick={handleAddClick}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                  <Plus size={16} className="mr-2" />
                  Create New Payment
                </button>
              </div>
            )}

            {/* Payments Display - Table View */}
            {viewType === "table" && (
              <div 
                id="payments-table-container" 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("paymentReference")}
                        >
                          <div className="flex items-center">
                            Reference
                            {sortConfig?.key === "paymentReference" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("amount")}
                        >
                          <div className="flex items-center">
                            Amount
                            {sortConfig?.key === "amount" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payable
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
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
                            colSpan={7}
                            className="px-6 py-4 text-center"
                          >
                            <div className="flex items-center justify-center text-red-600">
                              <AlertCircle className="w-5 h-5 mr-2" />
                              {error}
                            </div>
                          </td>
                        </tr>
                      ) : filteredPayments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No payments found.{" "}
                            {searchTerm && "Try a different search term."}
                          </td>
                        </tr>
                      ) : (
                        paginatedPayments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {payment.paymentReference}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatNumber(payment.amount)} RWF
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {payment.payableType === "purchase" ? (
                                  <div className="flex items-center">
                                    <span className="mr-1">Purchase:</span>
                                    {payment.purchase?.purchaseReference || "N/A"}
                                    {payment.purchase?.supplier?.user?.profile
                                      ?.names && (
                                      <>
                                        <span className="mx-1">-</span>
                                        {
                                          payment.purchase.supplier.user.profile
                                            .names
                                        }
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <span className="mr-1">Sale:</span>
                                    {payment.sale?.referenceNumber || "N/A"}
                                    {payment.sale?.client?.user?.profile
                                      ?.names && (
                                      <>
                                        <span className="mx-1">-</span>
                                        {payment.sale.client.user.profile.names}
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getPaymentMethodIcon(payment.paymentMethod)}
                                <span className="ml-1 capitalize">
                                  {payment.paymentMethod.replace("_", " ")}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                                <div className="text-sm text-gray-900">
                                  {new Date(
                                    payment.createdAt
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(payment.status)}
                                <span
                                  className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    payment.status
                                  )}`}
                                >
                                  {payment.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setShowViewModal(true);
                                  }}
                                  className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </button>
                                
                                <button
                                  onClick={() => handleEditClick(payment)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                  title="Edit Payment"
                                >
                                  <Edit2 size={18} />
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteConfirm(payment.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                  title="Delete Payment"
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
                {filteredPayments.length > 0 && (
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
                              filteredPayments.length
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {filteredPayments.length}
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
                ) : paginatedPayments.length === 0 ? (
                  <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? 
                        `No payments matching "${searchTerm}" were found.` : 
                        "There are no payments to display."}
                    </p>
                  </div>
                ) : (
                  paginatedPayments.map((payment) => (
                    <div 
                      key={payment.id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                              {payment.paymentReference}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Created on {new Date(payment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              payment.status
                            )}`}
                          >
                            {getStatusIcon(payment.status)}
                            <span className="ml-1">{payment.status}</span>
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Amount</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatNumber(payment.amount)} RWF
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Method</p>
                            <p className="text-sm text-gray-900 flex items-center">
                              {getPaymentMethodIcon(payment.paymentMethod)}
                              <span className="ml-1 capitalize">
                                {payment.paymentMethod.replace("_", " ")}
                              </span>
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Type</p>
                            <p className="text-sm text-gray-900 capitalize">
                              {payment.payableType}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700">
                            {payment.payableType === "purchase" ? "Purchase" : "Sale"}
                          </p>
                          <p className="text-sm text-gray-900">
                            {payment.payableType === "purchase" ? (
                              <>
                                {payment.purchase?.purchaseReference || "N/A"}
                                {payment.purchase?.supplier?.user?.profile?.names && (
                                  <span className="text-xs text-gray-500 block">
                                    {payment.purchase.supplier.user.profile.names}
                                  </span>
                                )}
                              </>
                            ) : (
                              <>
                                {payment.sale?.referenceNumber || "N/A"}
                                {payment.sale?.client?.user?.profile?.names && (
                                  <span className="text-xs text-gray-500 block">
                                    {payment.sale.client.user.profile.names}
                                  </span>
                                )}
                              </>
                            )}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleDateString()
                              : "Not paid yet"}
                          </p>
                          
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowViewModal(true);
                              }}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            
                            <button
                              onClick={() => handleEditClick(payment)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                              title="Edit Payment"
                            >
                              <Edit2 size={18} />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteConfirm(payment.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                              title="Delete Payment"
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
                {filteredPayments.length > 0 && (
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
                        <span className="hidden sm:inline"> • Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredPayments.length)} of {filteredPayments.length}</span>
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

      {/* Add/Edit Payment Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingPayment ? "Edit Payment" : "Create New Payment"}
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
                {/* Payable Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payable Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="payableType"
                    value={formData.payableType}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isSubmitting || !!editingPayment}
                  >
                    <option value="">Select payable type</option>
                    <option value="purchase">Purchase</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>

                {/* Purchase/Sale Select */}
                {formData.payableType === "purchase" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="purchaseId"
                      name="purchaseId"
                      options={purchasesOptions}
                      isLoading={purchasesLoading}
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
                      isDisabled={isSubmitting || !!editingPayment}
                    />
                    {!purchasesLoading && purchasesOptions.length === 0 && (
                      <p className="mt-1 text-sm text-red-600">
                        No purchases available. Please add purchases first.
                      </p>
                    )}
                  </div>
                )}

                {formData.payableType === "sale" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="saleId"
                      name="saleId"
                      options={salesOptions}
                      isLoading={salesLoading}
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
                      isDisabled={isSubmitting || !!editingPayment}
                    />
                    {!salesLoading && salesOptions.length === 0 && (
                      <p className="mt-1 text-sm text-red-600">
                        No sales available. Please add sales first.
                      </p>
                    )}
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (RWF) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="amount"
                    value={formData.amount.replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ","
                    )}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, "");
                      if (!isNaN(Number(rawValue))) {
                        setFormData({
                          ...formData,
                          amount: rawValue,
                        });
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select payment method</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                {/* Transaction Reference (File Upload) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Reference (Proof)
                  </label>
                  <input
                    type="file"
                    name="transactionReference"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  {editingPayment?.transactionReference && !file && (
                    <p className="mt-1 text-sm text-gray-500">
                      Current file: {editingPayment.transactionReference}
                    </p>
                  )}
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
                    !formData.amount ||
                    !formData.payableType ||
                    !formData.paymentMethod ||
                    (formData.payableType === "purchase" &&
                      !formData.purchaseId) ||
                    (formData.payableType === "sale" && !formData.saleId)
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
                      {editingPayment ? "Updating..." : "Creating..."}
                    </>
                  ) : editingPayment ? (
                    "Update Payment"
                  ) : (
                    "Create Payment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Payment Details Modal */}
      {showViewModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                Payment Details - {selectedPayment.paymentReference}
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  if (imageUrl) {
                    URL.revokeObjectURL(imageUrl);
                    setImageUrl(null);
                  }
                }}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Payment Reference and Status */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Reference Number</p>
                  <p className="text-lg font-medium text-gray-900">
                    {selectedPayment.paymentReference}
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedPayment.status
                    )}`}
                  >
                    {getStatusIcon(selectedPayment.status)}
                    <span className="ml-1">{selectedPayment.status}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                    Payment Information
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatNumber(selectedPayment.amount)} RWF
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                        <span className="ml-1 capitalize">
                          {selectedPayment.paymentMethod.replace("_", " ")}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPayment.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedPayment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Paid At</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPayment.paidAt
                          ? new Date(selectedPayment.paidAt).toLocaleString()
                          : "Not paid yet"}
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
                      <p className="text-sm text-gray-500">Reference</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedPayment.transactionReference || "N/A"}
                      </p>
                    </div>
                    {selectedPayment.transactionReference && (
                      <div>
                        <p className="text-sm text-gray-500">Payment Proof</p>
                        {selectedPayment.transactionReference.match(
                          /\.(jpeg|jpg|gif|png|webp)$/i
                        ) ? (
                          <div className="mt-2">
                            {imageUrl ? (
                              <>
                                <img
                                  src={imageUrl}
                                  alt="Payment proof"
                                  className="max-w-full h-auto rounded-md cursor-pointer"
                                  onClick={() => window.open(imageUrl, "_blank")}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Click image to view in full size
                                </p>
                              </>
                            ) : (
                              <button
                                onClick={async () => {
                                  try {
                                    const filename =
                                      selectedPayment.transactionReference
                                        ?.split("/")
                                        .pop();
                                    if (filename) {
                                      await paymentService.getPaymentFile(filename);
                                    }
                                  } catch (error) {
                                    toast.error("Failed to load payment proof");
                                  }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                Load Payment Proof
                              </button>
                            )}
                          </div>
                        ) : (
                          <a
                            href={`${API_BASE_URL}/payments/file/${selectedPayment.transactionReference
                              .split("/")
                              .pop()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Download Proof Document
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                  {selectedPayment.payableType === "purchase" ? (
                    <ShoppingCart className="w-4 h-4 mr-2 text-amber-500" />
                  ) : (
                    <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                  )}
                  {selectedPayment.payableType === "purchase"
                    ? "Purchase Details"
                    : "Sale Details"}
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  {selectedPayment.payableType === "purchase" ? (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Purchase Reference</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedPayment.purchase?.purchaseReference || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Supplier</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedPayment.purchase?.supplier?.user?.profile?.names || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedPayment.purchase?.description || "N/A"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Sale Reference</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedPayment.sale?.referenceNumber || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Client</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedPayment.sale?.client?.user?.profile?.names || "Unknown"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  if (imageUrl) {
                    URL.revokeObjectURL(imageUrl);
                    setImageUrl(null);
                  }
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
              Are you sure you want to delete this payment? This action cannot be undone.
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
                onClick={() => handleDeletePayment(showConfirmDelete)}
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
                  "Delete Payment"
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

export default PaymentManagement;