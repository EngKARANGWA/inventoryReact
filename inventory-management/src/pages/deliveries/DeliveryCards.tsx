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
  RefreshCw,
} from "lucide-react";
import { Delivery } from "../../services/deliveryService";

interface DeliveryCardsProps {
  loading: boolean;
  error: string | null;
  paginatedDeliveries: Delivery[];
  currentPage: number;
  totalPages: number;
  filteredDeliveries: Delivery[];
  handlePageChange: (newPage: number) => void;
  setSelectedDelivery: React.Dispatch<React.SetStateAction<Delivery | null>>;
  setShowViewModal: React.Dispatch<React.SetStateAction<boolean>>;
  handleEditClick: (delivery: Delivery) => void;
  handleDeleteConfirm: (deliveryId: number) => void;
  searchTerm: string;
  handleRefresh: () => void;
  pageSize: number;
}

const DeliveryCards: React.FC<DeliveryCardsProps> = ({
  loading,
  error,
  paginatedDeliveries,
  currentPage,
  totalPages,
  filteredDeliveries,
  handlePageChange,
  setSelectedDelivery,
  setShowViewModal,
  handleEditClick,
  handleDeleteConfirm,
  searchTerm,
  handleRefresh,
  pageSize,
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(num);
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {loading ? (
        Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={`card-skeleton-${i}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse"
            >
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </button>
        </div>
      ) : paginatedDeliveries.length === 0 ? (
        <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No deliveries found
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? `No deliveries matching "${searchTerm}" were found.`
              : "There are no deliveries to display."}
          </p>
        </div>
      ) : (
        paginatedDeliveries.map((delivery) => (
          <div
            key={delivery.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                    {delivery.deliveryReference}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Created on{" "}
                    {new Date(delivery.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    delivery.status
                  )}`}
                >
                  {getStatusIcon(delivery.status)}
                  <span className="ml-1">{delivery.status}</span>
                </span>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Quantity</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatNumber(Number(delivery.quantity))} Kg
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Direction</p>
                  <p className="text-sm text-gray-900 flex items-center">
                    {getDirectionIcon(delivery.direction)}
                    <span className="ml-1 capitalize">
                      {delivery.direction}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Product</p>
                  <p className="text-sm text-gray-900">
                    {delivery.product?.name || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">
                  {delivery.direction === "in" ? "Purchase" : "Sale"}
                </p>
                <p className="text-sm text-gray-900">
                  {delivery.direction === "in" ? (
                    <>{delivery.purchase?.purchaseReference || "N/A"}</>
                  ) : (
                    <>
                      {delivery.saleItemId ? (
                        <span className="flex flex-col">
                          <span>
                            Item: {delivery.saleItem?.product?.name || "N/A"}
                          </span>
                          <span className="text-xs text-gray-500">
                            Sale:{" "}
                            {delivery.saleItem?.sale?.saleReference ||
                              delivery.sale?.saleReference ||
                              "N/A"}
                          </span>
                        </span>
                      ) : (
                        delivery.sale?.saleReference || "N/A"
                      )}
                    </>
                  )}
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(delivery.deliveredAt).toLocaleDateString()}
                </p>

                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setSelectedDelivery(delivery);
                      setShowViewModal(true);
                    }}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() => handleEditClick(delivery)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Edit Delivery"
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    onClick={() => handleDeleteConfirm(delivery.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                    title="Delete Delivery"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {filteredDeliveries.length > 0 && (
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
                {Math.min(currentPage * pageSize, filteredDeliveries.length)} of{" "}
                {filteredDeliveries.length}
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
      )}
    </div>
  );
};

export default DeliveryCards;
