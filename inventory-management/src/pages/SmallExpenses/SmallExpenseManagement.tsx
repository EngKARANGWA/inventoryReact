import React, { useEffect, useState, useRef } from "react";
import {
  SmallExpense,
  getAllExpenses,
  deleteExpense,
  getCurrentBalance,
} from "../../services/smallExpenseService";
// @ts-ignore
import html2pdf from "html2pdf.js";
import SmallExpensePDFReport from "./SmallExpensePDFReport";
import SmallExpenseForm from "./SmallExpenseForm";
import SmallExpenseViewModal from "./SmallExpenseViewModal";
import DeleteConfirmationModal from "./SmallExpenseDeleteModal";
import { Sidebar } from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SmallExpenseCards from "./SmallExpenseCards";
import SmallExpenseControls, {
  SmallExpenseFilters,
} from "./SmallExpenseControls";
import SmallExpenseTable from "./SmallExpenseTable";
import SmallExpenseStats from "./SmallExpenseStats";
import { Coins } from "lucide-react";

const SmallExpenseManagement: React.FC = () => {
  const [balanceData, setBalanceData] = useState<{
    currentBalance: number;
    updatedAt: string;
  } | null>(null);
  const [expenses, setExpenses] = useState<SmallExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<SmallExpense | null>(
    null
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedExpense, setSelectedExpense] = useState<SmallExpense | null>(
    null
  );
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [deletingExpense, setDeletingExpense] = useState<SmallExpense | null>(
    null
  );

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  const [filters, setFilters] = useState<SmallExpenseFilters>({
    direction: "",
    payment_method: "",
    dateFrom: "",
    dateTo: "",
    pageSize,
  });


  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [viewType, setViewType] = useState<"table" | "cards">("table");

  // Add helper function for consistent date formatting
  const formatDateForSearch = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load expenses");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await getCurrentBalance();
      const balance = (response as any).balance || response;
      setBalanceData(balance);
    } catch (err) {
      toast.error("Failed to fetch balance");
      setBalanceData(null);
    }
  };

  const exportDate = new Date().toLocaleString();

  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBalance();
    fetchExpenses();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const toggleViewType = () => {
    setViewType((prev) => (prev === "cards" ? "table" : "cards"));
  };

  const handleExportData = () => {
    if (!pdfRef.current) return;

    const options = {
      margin: 0.5,
      filename: `small_expenses_${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(options).from(pdfRef.current).save();
  };

  // Updated filteredExpenses with enhanced search
  const filteredExpenses = expenses
    .filter((expense) => {
      const searchTermLower = searchTerm.toLowerCase();

      // Search across multiple fields
      const matchesOperation = expense.operation
        .toLowerCase()
        .includes(searchTermLower);
      const matchesAmount = expense.amount.toString().includes(searchTermLower);
      const matchesPaymentMethod = expense.paymentMethod
        .toLowerCase()
        .includes(searchTermLower);
      const matchesDescription =
        expense.description?.toLowerCase().includes(searchTermLower) || false;
      const formattedDate = formatDateForSearch(expense.createdAt);
      const matchesDate = formattedDate.includes(searchTermLower);

      // Also search formatted currency amount
      const formattedCurrency = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      })
        .format(expense.amount)
        .toLowerCase();
      const matchesFormattedAmount =
        formattedCurrency.includes(searchTermLower);

      return (
        matchesOperation ||
        matchesAmount ||
        matchesPaymentMethod ||
        matchesDescription ||
        matchesDate ||
        matchesFormattedAmount
      );
    })
    .filter((expense) =>
      filters.direction ? expense.direction === filters.direction : true
    )
    .filter((expense) =>
      filters.payment_method
        ? expense.paymentMethod === filters.payment_method
        : true
    )
    .filter((expense) => {
      if (
        filters.dateFrom &&
        new Date(expense.createdAt) < new Date(filters.dateFrom)
      ) {
        return false;
      }
      if (
        filters.dateTo &&
        new Date(expense.createdAt) > new Date(filters.dateTo)
      ) {
        return false;
      }
      return true;
    });

  const totalPages = Math.ceil(filteredExpenses.length / pageSize);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleAdd = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  const handleEditClick = (expense: SmallExpense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDeleteConfirm = async (id: number) => {
    try {
      await deleteExpense(id);
      toast.success("Expense deleted");
      setRefreshTrigger((prev) => prev + 1);
      fetchExpenses();
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingExpense(null);
    setRefreshTrigger((prev) => prev + 1);
    fetchExpenses();
  };

  const handleRefresh = () => {
    setLoading(true);
    setRefreshTrigger((prev) => prev + 1);
    fetchExpenses().finally(() => {
      toast.info("Data Refreshed successfuly");
      setLoading(false);
    });
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
                <Coins className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600" />
                Small Expense Management
              </h1>
              <p className="text-gray-600">
                View and track your small expenses
              </p>
            </div>

            <SmallExpenseStats
              loading={loading}
              expenses={expenses}
              refreshTrigger={refreshTrigger}
            />

            <SmallExpenseControls
              searchTerm={searchTerm}
              handleSearch={handleSearch}
              handleSearchSubmit={handleSearchSubmit}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              viewType={viewType}
              toggleViewType={toggleViewType}
              handleExportData={handleExportData}
              handleRefresh={handleRefresh}
              handleAddClick={handleAdd}
              filters={filters}
              handleFilterChange={handleFilterChange}
              handleDateFilterChange={handleDateFilterChange}
            />

            {viewType === "table" ? (
              <SmallExpenseTable
                expenses={paginatedExpenses}
                onView={(expense) => {
                  setSelectedExpense(expense);
                  setShowViewModal(true);
                }}
                onEdit={handleEditClick}
                onDelete={(expense) => setDeletingExpense(expense)}
              />
            ) : (
              <SmallExpenseCards
                loading={loading}
                error={error}
                paginatedExpenses={paginatedExpenses}
                currentPage={currentPage}
                totalPages={totalPages}
                filteredExpenses={filteredExpenses}
                handlePageChange={handlePageChange}
                setSelectedExpense={setSelectedExpense}
                setShowViewModal={setShowViewModal}
                handleEditClick={handleEditClick}
                handleDeleteConfirm={(id) =>
                  setDeletingExpense(expenses.find((e) => e.id === id) || null)
                }
                searchTerm={searchTerm}
                handleRefresh={handleRefresh}
                pageSize={pageSize}
              />
            )}
          </div>
        </main>
      </div>

      <div style={{ display: "none" }}>
        <SmallExpensePDFReport
          expenses={expenses}
          exportDate={exportDate}
          currentBalance={balanceData || undefined}
          ref={pdfRef}
        />
      </div>

      {/* Modals */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <SmallExpenseForm
            initialData={editingExpense}
            onClose={() => setShowForm(false)}
            onSubmit={handleFormSubmit}
          />
        </div>
      )}

      <SmallExpenseViewModal
        expense={showViewModal ? selectedExpense : null}
        onClose={() => setShowViewModal(false)}
      />

      <DeleteConfirmationModal
        open={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        onConfirm={() =>
          deletingExpense && handleDeleteConfirm(deletingExpense.id)
        }
        title="Delete Expense"
        message={`Are you sure you want to delete expense \"${deletingExpense?.operation}\"?`}
      />

      <ToastContainer position="top-right" autoClose={4000} theme="colored" />
    </div>
  );
};

export default SmallExpenseManagement;
