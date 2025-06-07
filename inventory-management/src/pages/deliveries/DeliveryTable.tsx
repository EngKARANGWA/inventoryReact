import React from "react";
import {
  Calendar,
  Check,
  X,
  Clock,
  Eye,
  Edit2,
  Trash2,
  ArrowDown,
  ArrowUp,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Truck,
} from "lucide-react";
import { Delivery } from "../../services/deliveryService";

interface DeliveryTableProps {
  loading: boolean;
  error: string | null;
  sortConfig: {
    key: keyof Delivery;
    direction: "ascending" | "descending";
  } | null;
  requestSort: (key: keyof Delivery) => void;
  paginatedDeliveries: Delivery[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalDeliveries: number;
  filteredDeliveries: Delivery[];
  handlePageChange: (newPage: number) => void;
  setSelectedDelivery: React.Dispatch<React.SetStateAction<Delivery | null>>;
  setShowViewModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleEditClick: (delivery: Delivery) => void;
  handleDeleteConfirm: (deliveryId: number) => void;
  searchTerm: string;
}

const DeliveryTable: React.FC<DeliveryTableProps> = ({
  loading,
  error,
  sortConfig,
  requestSort,
  paginatedDeliveries,
  currentPage,
  pageSize,
  totalPages,
  filteredDeliveries,
  handlePageChange,
  setSelectedDelivery,
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

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />;
      case "delivered":
        return <Truck className="w-4 h-4 text-blue-500" />;
      case "cancelled":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === "in" ? (
      <ArrowDown className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowUp className="w-4 h-4 text-red-500" />
    );
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
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </td>
          <td className="px-6 py-4 text-right">
            <div className="h-6 bg-gray-200 rounded w-16 inline-block"></div>
          </td>
        </tr>
      ));
  };

  return (
    <div
      id="deliveries-table-container"
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => requestSort("deliveryReference")}
              >
                <div className="flex items-center">
                  Reference
                  {sortConfig?.key === "deliveryReference" && (
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
                onClick={() => requestSort("direction")}
              >
                <div className="flex items-center">
                  Direction
                  {sortConfig?.key === "direction" && (
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
                onClick={() => requestSort("driver")}
              >
                <div className="flex items-center">
                  Driver
                  {sortConfig?.key === "driver" && (
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
                onClick={() => requestSort("deliveredAt")}
              >
                <div className="flex items-center">
                  Date
                  {sortConfig?.key === "deliveredAt" && (
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
                <td colSpan={9} className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center text-red-600">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                  </div>
                </td>
              </tr>
            ) : filteredDeliveries.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                  No deliveries found.{" "}
                  {searchTerm && "Try a different search term."}
                </td>
              </tr>
            ) : (
              paginatedDeliveries.map((delivery) => (
                <tr
                  key={delivery.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {delivery.deliveryReference}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {delivery.id} | Created:{" "}
                      {new Date(delivery.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {delivery.product?.name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {delivery.product?.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getDirectionIcon(delivery.direction)}
                      <span className="ml-1 capitalize">
                        {delivery.direction}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {delivery.direction === "in"
                        ? delivery.purchase?.purchaseReference || "N/A"
                        : delivery.saleItemId
                        ? `Item: ${delivery.saleItem?.product?.name || "N/A"}`
                        : delivery.sale?.saleReference ||
                          delivery.sale?.referenceNumber ||
                          "N/A"}
                    </div>
                    {delivery.saleItemId && (
                      <div className="text-xs text-gray-500">
                        Sale:{" "}
                        {delivery.saleItem?.sale?.saleReference ||
                          delivery.sale?.saleReference ||
                          "N/A"}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatNumber(Number(delivery.quantity))} Kg
                    </div>
                    <div className="text-xs text-gray-500">
                      @ {formatCurrency(delivery.unitPrice || 0)}/Kg
                    </div>
                    <div className="text-xs font-medium text-green-600">
                      Total:{" "}
                      {formatCurrency(
                        Number(delivery.quantity) *
                          Number(delivery.unitPrice || 0)
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {delivery.driver?.user?.profile?.names || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {delivery.driver?.driverId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {delivery.warehouse?.name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {delivery.warehouse?.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                      <div className="text-sm text-gray-900">
                        {new Date(delivery.deliveredAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(delivery.deliveredAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(delivery.status)}
                      <span
                        className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          delivery.status
                        )}`}
                      >
                        {delivery.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setShowViewModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => handleEditClick(delivery)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                        title="Edit Delivery"
                      >
                        <Edit2 size={18} />
                      </button>

                      <button
                        onClick={() => handleDeleteConfirm(delivery.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                        title="Delete Delivery"
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

      {filteredDeliveries.length > 0 && (
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
                  {Math.min(currentPage * pageSize, filteredDeliveries.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredDeliveries.length}</span>{" "}
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

export default DeliveryTable;
