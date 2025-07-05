import React from "react";
import {
  Calendar,
  Eye,
  Edit2,
  Trash2,
  ArrowDown,
  ArrowUp,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CircleDollarSign,
  Landmark,
  Wallet,
} from "lucide-react";
import { SmallExpense } from "../../services/smallExpenseService";

interface SmallExpenseCardsProps {
  loading: boolean;
  error: string | null;
  paginatedExpenses: SmallExpense[];
  currentPage: number;
  totalPages: number;
  filteredExpenses: SmallExpense[];
  handlePageChange: (newPage: number) => void;
  setSelectedExpense: React.Dispatch<React.SetStateAction<SmallExpense | null>>;
  setShowViewModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleEditClick: (expense: SmallExpense) => void;
  handleDeleteConfirm: (expenseId: number) => void;
  searchTerm: string;
  handleRefresh: () => void;
  pageSize: number;
}

const SmallExpenseCards: React.FC<SmallExpenseCardsProps> = ({
  loading,
  error,
  paginatedExpenses,
  currentPage,
  totalPages,
  filteredExpenses,
  handlePageChange,
  setSelectedExpense,
  setShowViewModal,
  handleEditClick,
  handleDeleteConfirm,
  searchTerm,
  handleRefresh,
  pageSize,
}) => {
  const formatAmount = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "RWF",
    }).format(value);

  const getDirectionIcon = (dir: string) =>
    dir === "in" ? (
      <ArrowDown className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowUp className="w-4 h-4 text-red-500" />
    );

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return <Landmark size={16} />;
      case "cheque":
        return <CircleDollarSign size={16} />;
      case "cash":
        return <Wallet size={16} />;
      case "mobile_money":
        return <Banknote size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {loading ? (
        Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="p-4 border rounded-xl bg-white animate-pulse"
            >
              <div className="h-4 bg-gray-200 w-3/4 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 w-1/2 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 w-full rounded mb-2"></div>
              <div className="h-4 bg-gray-200 w-2/3 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 w-full rounded"></div>
            </div>
          ))
      ) : error ? (
        <div className="col-span-full bg-white border rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-gray-900">Error Loading</h3>
          <p className="text-gray-500">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            <RefreshCw size={16} className="mr-2" />
            Retry
          </button>
        </div>
      ) : paginatedExpenses.length === 0 ? (
        <div className="col-span-full bg-white border rounded-xl p-6 text-center">
          <p className="text-lg text-gray-800 font-medium">
            No small expenses found
          </p>
          <p className="text-sm text-gray-500">
            {searchTerm
              ? `No results for "${searchTerm}".`
              : "There are no records to display."}
          </p>
        </div>
      ) : (
        paginatedExpenses.map((expense) => (
          <div
            key={expense.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {expense.operation}
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                  {getDirectionIcon(expense.direction)}
                  <span className="ml-1 capitalize">{expense.direction}</span>
                </span>
              </div>

              <p className="text-lg font-bold text-gray-800 mb-1">
                {formatAmount(Number(expense.amount))}
              </p>

              <div className="flex items-center text-sm text-gray-700 mb-1">
                {getMethodIcon(expense.paymentMethod)}
                <span className="ml-1 capitalize">
                  {expense.paymentMethod.replace(/_/g, " ")}
                </span>
              </div>

              {expense.description && (
                <p className="text-sm text-gray-500 line-clamp-2">
                  {expense.description}
                </p>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-3">
                <p className="text-xs text-gray-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(expense.createdAt).toLocaleDateString()}
                </p>

                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setSelectedExpense(expense);
                      setShowViewModal(true);
                    }}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                    title="View"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() => handleEditClick(expense)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    onClick={() => handleDeleteConfirm(expense.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {filteredExpenses.length > 0 && (
        <div className="col-span-full mt-4">
          <div className="bg-white border rounded-xl px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ArrowLeft size={16} className="mr-1" />
              Previous
            </button>

            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages} • Showing{" "}
              {(currentPage - 1) * pageSize + 1} -{" "}
              {Math.min(currentPage * pageSize, filteredExpenses.length)} of{" "}
              {filteredExpenses.length}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
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
  );
};

export default SmallExpenseCards;
