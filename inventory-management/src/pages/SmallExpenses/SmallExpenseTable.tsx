import React, { useState, useMemo } from "react";
import { SmallExpense } from "../../services/smallExpenseService";
import { formatNumber } from "../../utils/formatUtils";
import { Eye, Edit2, Trash2, ArrowDown, ArrowUp, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  expenses: SmallExpense[];
  onView: (expense: SmallExpense) => void;
  onEdit: (expense: SmallExpense) => void;
  onDelete: (expense: SmallExpense) => void;
  loading?: boolean;
  error?: string | null;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (newPage: number) => void;
  searchTerm?: string;
  initialSortConfig?: {
    key: keyof SmallExpense;
    direction: "ascending" | "descending";
  } | null;
}

const SmallExpenseTable: React.FC<Props> = ({
  expenses: initialExpenses,
  onView,
  onEdit,
  onDelete,
  loading = false,
  error = null,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  searchTerm = "",
  initialSortConfig = null,
}) => {
  const [sortConfig, setSortConfig] = useState(initialSortConfig);

  const requestSort = (key: keyof SmallExpense) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedExpenses = useMemo(() => {
    if (!sortConfig) return initialExpenses;

    return [...initialExpenses].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (sortConfig.key === "createdAt") {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        return sortConfig.direction === "ascending" ? dateA - dateB : dateB - dateA;
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "ascending" ? aValue - bValue : bValue - aValue;
      } else {
        const aString = String(aValue ?? "");
        const bString = String(bValue ?? "");
        return sortConfig.direction === "ascending" 
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      }
    });
  }, [initialExpenses, sortConfig]);

  const getDirectionIcon = (direction: string) => {
    return direction === "in" ? (
      <ArrowDown className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowUp className="w-4 h-4 text-red-500" />
    );
  };

  const renderSortIndicator = (key: keyof SmallExpense) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return (
      <span className="ml-1">
        {sortConfig.direction === "ascending" ? "↑" : "↓"}
      </span>
    );
  };

  const renderSkeleton = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <tr key={`skeleton-${i}`} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("operation")}
              >
                <div className="flex items-center">
                  Operation
                  {renderSortIndicator("operation")}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("amount")}
              >
                <div className="flex items-center">
                  Amount
                  {renderSortIndicator("amount")}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("direction")}
              >
                <div className="flex items-center">
                  Direction
                  {renderSortIndicator("direction")}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("paymentMethod")}
              >
                <div className="flex items-center">
                  Payment Method
                  {renderSortIndicator("paymentMethod")}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("createdAt")}
              >
                <div className="flex items-center">
                  Date
                  {renderSortIndicator("createdAt")}
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
                <td colSpan={7} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center text-red-600">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                  </div>
                </td>
              </tr>
            ) : sortedExpenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No expenses found. {searchTerm && "Try a different search term."}
                </td>
              </tr>
            ) : (
              sortedExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {expense.operation}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {expense.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      expense.direction === "out" ? "text-red-600" : "text-green-600"
                    }`}>
                      {formatNumber(expense.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getDirectionIcon(expense.direction)}
                      <span className="ml-1 capitalize">
                        {expense.direction}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">
                      {expense.paymentMethod.replace("_", " ")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {expense.description || "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(expense.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(expense.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onView(expense)}
                        className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(expense)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                        title="Edit Expense"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(expense)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                        title="Delete Expense"
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

      {onPageChange && sortedExpenses.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(currentPage - 1)}
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
              onClick={() => onPageChange(currentPage + 1)}
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
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">{sortedExpenses.length}</span> of{" "}
                <span className="font-medium">{sortedExpenses.length}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => onPageChange(currentPage - 1)}
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

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                      onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => onPageChange(currentPage + 1)}
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
  );
};

export default SmallExpenseTable;