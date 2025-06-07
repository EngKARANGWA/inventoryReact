import React from "react";
import {
  Package,
  Warehouse,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  Skull,
  Gift,
  Recycle,
  Truck,
} from "lucide-react";
import { Disposal } from "../../services/disposalService";
interface DisposalTableViewProps {
  loading: boolean;
  error: string | null;
  filteredDisposals: any[];
  paginatedDisposals: any[];
  sortConfig: {
    key: keyof Disposal;
    direction: "ascending" | "descending";
  } | null;
  requestSort: (key: keyof Disposal) => void;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalDisposals: number;
  handlePageChange: (newPage: number) => void;
  setSelectedDisposal: (disposal: any) => void;
  setShowViewModal: (show: boolean) => void;
  handleEditClick: (disposal: any) => void;
  handleDeleteConfirm: (id: number) => void;
  searchTerm: string;
}

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

const DisposalTableView: React.FC<DisposalTableViewProps> = ({
  loading,
  error,
  filteredDisposals,
  paginatedDisposals,
  sortConfig,
  requestSort,
  currentPage,
  totalPages,
  pageSize,
  handlePageChange,
  setSelectedDisposal,
  setShowViewModal,
  handleEditClick,
  handleDeleteConfirm,
  searchTerm,
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(num);
  };

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

  const renderSkeleton = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
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
                <td colSpan={7} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center text-red-600">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                  </div>
                </td>
              </tr>
            ) : filteredDisposals.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No disposals found.{" "}
                  {searchTerm && "Try a different search term."}
                </td>
              </tr>
            ) : (
              paginatedDisposals.map((disposal) => (
                <tr
                  key={disposal.id}
                  className="hover:bg-gray-50 transition-colors"
                >
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
                          ? Number(disposal.price.buyingUnitPrice).toFixed(2)
                          : "N/A"}
                        /unit
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span
                        className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(
                          disposal.method
                        )}`}
                      >
                        {getMethodIcon(disposal.method)}
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
                  {Math.min(currentPage * pageSize, filteredDisposals.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredDisposals.length}</span>{" "}
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
                })}

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
  );
};

export default DisposalTableView;
