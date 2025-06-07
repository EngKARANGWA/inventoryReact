import React from "react";
import { Eye, Edit2, Trash2, ArrowLeft, ArrowRight, Package, AlertTriangle } from "lucide-react";
import { Production } from "./types";
import { formatCurrency, formatDate, formatNumber } from "./utils";

interface ProductionTableProps {
  productions: Production[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalProductions: number;
  pageSize: number;
  sortConfig: { key: string; direction: string } | null;
  onPageChange: (newPage: number) => void;
  onSort: (key: string) => void;
  onView: (production: Production) => void;
  onEdit: (production: Production) => void;
  onDelete: (productionId: number) => void;
}

const ProductionTable: React.FC<ProductionTableProps> = ({
  productions,
  loading,
  error,
  page,
  totalPages,
  totalProductions,
  pageSize,
  sortConfig,
  onPageChange,
  onSort,
  onView,
  onEdit,
  onDelete,
}) => {
  const columns = [
    { key: "referenceNumber", label: "Reference", sortable: true },
    { key: "product", label: "Product Details", sortable: true },
    { key: "inputOutput", label: "Input/Output", sortable: false },
    { key: "efficiency", label: "Efficiency", sortable: true },
    { key: "packaging", label: "Packaging", sortable: false },
    { key: "costs", label: "Costs", sortable: false },
    { key: "date", label: "Date", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "bg-green-100 text-green-800";
    if (efficiency >= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                  onClick={() => column.sortable && onSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.label}
                    {sortConfig?.key === column.key && (
                      <span className="ml-1">
                        {sortConfig.direction === "ascending" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Improved skeleton loading
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    {columns.map((col) => (
                      <td key={`skeleton-${i}-${col.key}`} className="px-4 py-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-2 text-red-600">
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                  </div>
                </td>
              </tr>
            ) : productions.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No production batches found.
                </td>
              </tr>
            ) : (
              productions.map((production) => (
                <tr
                  key={production.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Reference Number */}
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-blue-600">
                      {production.referenceNumber}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      ID: {production.id}
                    </div>
                  </td>

                  {/* Product Details */}
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium">
                      {production.product?.name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Type: {production.product?.type?.replace('_', ' ') || 'N/A'}
                    </div>
                    {production.mainProduct && (
                      <div className="text-xs text-gray-500 mt-1">
                        From: {production.mainProduct.name}
                      </div>
                    )}
                  </td>

                  {/* Input/Output */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="text-sm">
                        <span className="font-medium">Input:</span>{" "}
                        {production.usedQuantity ? `${formatNumber(production.usedQuantity)} kg` : "N/A"}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Output:</span>{" "}
                        {formatNumber(production.totalOutcome)} kg
                      </div>
                      {production.productionLoss !== undefined &&
                        production.productionLoss > 0 && (
                          <div className="text-xs text-red-600 flex items-center">
                            <AlertTriangle size={12} className="mr-1" />
                            Loss: {formatNumber(production.productionLoss)} kg
                          </div>
                        )}
                    </div>
                  </td>

                  {/* Efficiency */}
                  <td className="px-4 py-4">
                    {production.efficiency !== null &&
                      production.efficiency !== undefined && (
                        <div className="flex flex-col items-start">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEfficiencyColor(
                              Number(production.efficiency)
                            )}`}
                          >
                            {Number(production.efficiency).toFixed(1)}%
                          </span>
                          {production.outcomesSummary && (
                            <div className="text-xs text-gray-500 mt-1">
                              <div>Finished: {production.outcomesSummary.finished} kg</div>
                              <div>Byproducts: {production.outcomesSummary.byproducts} kg</div>
                            </div>
                          )}
                        </div>
                      )}
                  </td>

                  {/* Packaging */}
                  <td className="px-4 py-4">
                    {production.packagesSummary?.length ? (
                      <div className="flex flex-col space-y-1">
                        {production.packagesSummary.map((pkg, i) => (
                          <div key={i} className="text-xs flex items-center">
                            <Package size={12} className="mr-1 text-gray-400" />
                            {pkg.size}: {pkg.quantity} × {formatNumber(pkg.totalWeight / pkg.quantity)} kg
                          </div>
                        ))}
                        <div className="text-xs font-medium mt-1">
                          Total: {formatNumber(production.packagesSummary.reduce((sum, pkg) => sum + pkg.totalWeight, 0))} kg
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">Not packaged</div>
                    )}
                  </td>

                  {/* Costs */}
                  <td className="px-4 py-4">
                    {production.productionCost?.length ? (
                      <div className="flex flex-col space-y-1">
                        {production.productionCost.slice(0, 2).map((cost, i) => (
                          <div key={i} className="text-xs">
                            {cost.item}: {formatCurrency(cost.total || 0)}
                          </div>
                        ))}
                        {production.productionCost.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{production.productionCost.length - 2} more...
                          </div>
                        )}
                        {production.productionCost.find(c => c.item === 'Net Production Cost') && (
                          <div className="text-xs font-medium mt-1">
                            Net: {formatCurrency(production.productionCost.find(c => c.item === 'Net Production Cost')?.total || 0)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">No cost data</div>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-4 py-4">
                    <div className="text-sm">{formatDate(production.date)}</div>
                    <div className="text-xs text-gray-500">
                      by {production.createdBy?.profile?.names || production.createdBy?.username || 'Unknown'}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onView(production)}
                        className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => onEdit(production)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>

                      <button
                        onClick={() => onDelete(production.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                        title="Delete"
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

      {productions.length > 0 && (
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ArrowLeft size={16} className="mr-1" />
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page >= totalPages
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
                <span className="font-medium">{(page - 1) * pageSize + 1}</span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(page * pageSize, totalProductions)}
                </span>{" "}
                of <span className="font-medium">{totalProductions}</span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    page === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                </button>

                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pageNum
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    page >= totalPages
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

export default ProductionTable;