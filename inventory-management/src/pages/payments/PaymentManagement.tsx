import React, { useState, useEffect, useCallback } from "react";
import {Sidebar} from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  CreditCard,
  RefreshCw,
  FileText,
  Download,
  ArrowLeft,
  ArrowRight,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { paymentService, Payment } from "../../services/paymentService";
import PaymentTable from "./PaymentTable";
import PaymentCards from "./PaymentCards";
import PaymentForm from "./PaymentForm";
import PaymentViewModal from "./PaymentViewModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { formatNumber } from "../../utils/formatUtils";

interface PaymentFilters {
  page: number;
  pageSize: number;
  payableType: "purchase" | "sale" | "";
  status: string;
  includeDeleted: boolean;
}

const PaymentManagement: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewType, setViewType] = useState<"table" | "cards">("table");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<number | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Payment;
    direction: "ascending" | "descending";
  } | null>({
    key: "createdAt",
    direction: "descending",
  });

  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    pageSize: 10,
    payableType: "",
    status: "",
    includeDeleted: false,
  });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await paymentService.getAllPayments();
      const paymentsWithDetails = await Promise.all(
        (response.data || []).map(async (payment: Payment) => {
          if (payment.payableType === "sale" && payment.saleId) {
            const saleDetails = await paymentService.getSalesWithItems(
              payment.saleId.toString()
            );
            return {
              ...payment,
              sale: saleDetails.find((s) => s.id === payment.saleId),
            };
          }
          return payment;
        })
      );

      setPayments(paymentsWithDetails);
      setTotalPayments(response.pagination?.totalItems || 0);
    } catch (err) {
      console.error("Error fetching payments:", err);
      toast.error("Failed to load payments. Please try again later.");
      setPayments([]);
      setTotalPayments(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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
    setEditingPayment(null);
    setShowAddForm(true);
  };

  const handleEditClick = (payment: Payment) => {
    setEditingPayment(payment);
    setShowAddForm(true);
  };

  const handleDeleteClick = (paymentId: number) => {
    setPaymentToDelete(paymentId);
    setShowConfirmDelete(true);
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;

    try {
      setIsSubmitting(true);
      await paymentService.deletePayment(paymentToDelete);
      setPayments(payments.filter((p) => p.id !== paymentToDelete));
      setTotalPayments(totalPayments - 1);
      toast.success("Payment deleted successfully");
      setShowConfirmDelete(false);
      setPaymentToDelete(null);
    } catch (err: any) {
      console.error("Error deleting payment:", err);
      toast.error(err.message || "Failed to delete payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmit = (payment: Payment) => {
    if (editingPayment) {
      setPayments(payments.map((p) => (p.id === payment.id ? payment : p)));
      toast.success("Payment updated successfully");
    } else {
      setPayments([payment, ...payments]);
      setTotalPayments(totalPayments + 1);
      toast.success("Payment created successfully");
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

    const tableElement = document.getElementById("payments-table-container");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const requestSort = (key: string) => {
    const validKeys: (keyof Payment)[] = [
      "paymentReference",
      "amount",
      "createdAt",
      "status",
    ];

    if (!validKeys.includes(key as keyof Payment)) {
      console.warn(`Invalid sort key: ${key}`);
      return;
    }

    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key: key as keyof Payment, direction });
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

  const inPayments = payments.filter(p => p.payableType === "sale").length;
  const outPayments = payments.filter(p => p.payableType === "purchase").length;
  
  const inPaymentsAmount = payments
    .filter(p => p.payableType === "sale")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  
  const outPaymentsAmount = payments
    .filter(p => p.payableType === "purchase")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  
  const totalAmount = payments.reduce((sum, p) => {
    const amount = Number(p.amount) || 0;
    return sum + amount;
  }, 0);

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice(
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
                <CreditCard className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600" />
                Payment Management
              </h1>
              <p className="text-gray-600">
                Manage payments for purchases and sales
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Total value
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? "..." : `${formatNumber(totalAmount)} RWF`}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Total Payments: {loading ? "..." : totalPayments}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      In Payments
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? "..." : `${formatNumber(inPaymentsAmount)} RWF`}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <ArrowDownCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {loading
                    ? "..."
                    : `(${((inPayments / totalPayments) * 100 || 0).toFixed(1)}% of total)`}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Out Payments
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? "..." : `${formatNumber(outPaymentsAmount)} RWF`}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <ArrowUpCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {loading
                    ? "..."
                    : `(${((outPayments / totalPayments) * 100 || 0).toFixed(1)}% of total)`}
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No payments found
                </h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  {searchTerm
                    ? `No payments matching "${searchTerm}" were found. Try a different search term or clear your filters.`
                    : "There are no payments to display. Start by creating a new payment."}
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

            {/* Payments Display */}
            {filteredPayments.length > 0 && (
              <>
                {viewType === "table" ? (
                  <div
                    id="payments-table-container"
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6"
                  >
                    <PaymentTable
                      payments={paginatedPayments}
                      sortConfig={sortConfig}
                      onSort={requestSort}
                      onView={(payment) => {
                        setSelectedPayment(payment);
                        setShowViewModal(true);
                      }}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteClick}
                    />
                  </div>
                ) : (
                  <PaymentCards
                    payments={paginatedPayments}
                    onView={(payment) => {
                      setSelectedPayment(payment);
                      setShowViewModal(true);
                    }}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                )}

                {/* Pagination */}
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
                        filteredPayments.length
                      )}{" "}
                      of {filteredPayments.length}
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
              </>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Payment Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <PaymentForm
            payment={editingPayment}
            onClose={() => setShowAddForm(false)}
            onSubmit={handlePaymentSubmit}
          />
        </div>
      )}

      {/* View Payment Details Modal */}
      {showViewModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <PaymentViewModal
            payment={selectedPayment}
            onClose={() => setShowViewModal(false)}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showConfirmDelete}
        onCancel={() => {
          setShowConfirmDelete(false);
          setPaymentToDelete(null);
        }}
        onConfirm={handleDeletePayment}
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

export default PaymentManagement;