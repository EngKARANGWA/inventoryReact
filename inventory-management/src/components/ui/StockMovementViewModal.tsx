import React from "react";
import { X, ArrowDown, ArrowUp, Warehouse, Package, User } from "lucide-react";
import { StockMovement } from "../../services/stockMovementService";

interface StockMovementViewModalProps {
  movement: StockMovement | null;
  onClose: () => void;
}

export const StockMovementViewModal: React.FC<StockMovementViewModalProps> = ({
  movement,
  onClose,
}) => {
  if (!movement) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Stock Movement Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Basic Information
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Reference Number</p>
                  <p className="text-sm font-medium">{movement.referenceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Direction</p>
                  <div className="flex items-center">
                    {movement.direction === "in" ? (
                      <ArrowDown className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowUp className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className="text-sm font-medium capitalize">
                      {movement.direction}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="text-sm font-medium">
                    {parseFloat(movement.quantity).toLocaleString()} Kg
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Source Information
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Source Type</p>
                  <p className="text-sm font-medium capitalize">
                    {movement.sourceType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Source ID</p>
                  <p className="text-sm font-medium">
                    {movement.productionId ||
                      movement.deliveryId ||
                      movement.transferId ||
                      movement.saleId ||
                      movement.returnsId ||
                      movement.disposalId ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Movement Date</p>
                  <p className="text-sm font-medium">
                    {formatDate(movement.movementDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Product</h3>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                <Package className="flex-shrink-0 h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{movement.product.name}</p>
                  {movement.product.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {movement.product.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Warehouse</h3>
              <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                <Warehouse className="flex-shrink-0 h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-sm font-medium">
                    {movement.warehouse?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {movement.warehouse?.location || "Location not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {movement.resultingSnapshot && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Stock Snapshot After Movement
              </h3>
              <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm text-gray-500">New Quantity</p>
                  <p className="text-sm font-medium">
                    {parseFloat(movement.resultingSnapshot.quantity).toLocaleString()} Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Snapshot Date</p>
                  <p className="text-sm font-medium">
                    {formatDate(movement.resultingSnapshot.snapshotDate)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">User</h3>
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
              <User className="flex-shrink-0 h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">
                  {movement.user.profile?.names || movement.user.username || "Unknown"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {movement.user.email || "Email not available"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm">
                {movement.notes || "No notes provided"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};