import React from "react";
import { X, Truck, Package, Warehouse, Check, Clock, ArrowDown, ArrowUp } from "lucide-react";
import { Delivery } from "../../services/deliveryService";

interface DeliveryViewModalProps {
  selectedDelivery: Delivery;
  setShowViewModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeliveryViewModal: React.FC<DeliveryViewModalProps> = ({
  selectedDelivery,
  setShowViewModal,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            Delivery Details - {selectedDelivery.deliveryReference}
          </h2>
          <button
            onClick={() => setShowViewModal(false)}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Reference</p>
              <p className="text-lg font-semibold">
                {selectedDelivery.deliveryReference}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Quantity</p>
              <p className="text-lg font-semibold">
                {formatNumber(Number(selectedDelivery.quantity))} Kg
              </p>
            </div>
            <div
              className={`p-4 rounded-lg ${getStatusColor(
                selectedDelivery.status
              )}`}
            >
              <p className="text-sm font-medium">Status</p>
              <p className="text-lg font-semibold flex items-center">
                {getStatusIcon(selectedDelivery.status)}
                <span className="ml-1 capitalize">
                  {selectedDelivery.status}
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Truck className="w-4 h-4 mr-2 text-blue-500" />
                Delivery Information
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Direction</p>
                    <p className="text-sm font-medium flex items-center">
                      {getDirectionIcon(selectedDelivery.direction)}
                      <span className="ml-1 capitalize">
                        {selectedDelivery.direction}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Driver</p>
                    <p className="text-sm font-medium">
                      {selectedDelivery.driver?.user?.profile?.names ||
                        "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created At</p>
                  <p className="text-sm font-medium">
                    {new Date(selectedDelivery.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Delivered At</p>
                  <p className="text-sm font-medium">
                    {new Date(
                      selectedDelivery.deliveredAt
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-sm font-medium">
                    {selectedDelivery.notes || "No notes provided"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2 text-indigo-500" />
                Product & Warehouse
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Product</p>
                  <p className="text-sm font-medium">
                    {selectedDelivery.product?.name || "N/A"}
                    {selectedDelivery.product?.description && (
                      <span className="block text-xs text-gray-500 mt-1">
                        {selectedDelivery.product.description}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Warehouse</p>
                  <p className="text-sm font-medium">
                    {selectedDelivery.warehouse?.name || "N/A"}
                    {selectedDelivery.warehouse?.location && (
                      <span className="block text-xs text-gray-500 mt-1">
                        {selectedDelivery.warehouse.location}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              {selectedDelivery.direction === "in" ? (
                <Warehouse className="w-4 h-4 mr-2 text-amber-500" />
              ) : (
                <Truck className="w-4 h-4 mr-2 text-green-500" />
              )}
              {selectedDelivery.direction === "in"
                ? "Purchase Details"
                : "Sale Details"}
            </h3>

            {selectedDelivery.direction === "in" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Reference</p>
                    <p className="text-sm font-medium">
                      {selectedDelivery.purchase?.purchaseReference ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Supplier</p>
                    <p className="text-sm font-medium">
                      {selectedDelivery.purchase?.supplier?.supplierId ||
                        "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm font-medium">
                    {selectedDelivery.purchase?.description || "N/A"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">
                      Expected Delivery
                    </p>
                    <p className="text-sm font-medium">
                      {selectedDelivery.purchase?.expectedDeliveryDate
                        ? new Date(
                            selectedDelivery.purchase.expectedDeliveryDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Weight</p>
                    <p className="text-sm font-medium">
                      {selectedDelivery.purchase?.weight
                        ? `${selectedDelivery.purchase.weight} Kg`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Reference</p>
                    <p className="text-sm font-medium">
                      {selectedDelivery.sale?.saleReference || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Client</p>
                    <p className="text-sm font-medium">
                      {selectedDelivery.sale?.client?.name || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="text-sm font-medium">
                      {selectedDelivery.sale?.quantity
                        ? `${selectedDelivery.sale.quantity} Kg`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-medium">
                      {selectedDelivery.sale?.status || "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-sm font-medium">
                    {selectedDelivery.sale?.note || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowViewModal(false)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryViewModal;