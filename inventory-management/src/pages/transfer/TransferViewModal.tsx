import React from "react";
import { Transfer } from "../../services/transferService";
import { formatNumber } from "../../utils/formatUtils";
import { Package, Truck, X, Check, X as XIcon, Clock } from "lucide-react";

interface TransferViewModalProps {
  transfer: Transfer;
  onClose: () => void;
}

const TransferViewModal: React.FC<TransferViewModalProps> = ({ transfer, onClose }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <Check className="w-4 h-4 text-green-500" />;
      case "cancelled": return <XIcon className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-amber-100 text-amber-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            Transfer Details - {transfer.referenceNumber}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Transfer Reference and Status */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Reference Number</p>
              <p className="text-lg font-medium text-gray-900">
                {transfer.referenceNumber}
              </p>
            </div>
            <div className="flex items-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transfer.status)}`}>
                {getStatusIcon(transfer.status)}
                <span className="ml-1">{transfer.status}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2 text-blue-500" />
                Transfer Information
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatNumber(transfer.quantity)} Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="text-sm font-medium text-gray-900">
                    {transfer.product?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-sm font-medium text-gray-900">
                    {transfer.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(transfer.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Transfer Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {transfer.date
                      ? new Date(transfer.date).toLocaleString()
                      : "Not scheduled yet"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Truck className="w-4 h-4 mr-2 text-indigo-500" />
                Transfer Details
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">From Warehouse</p>
                  <p className="text-sm font-medium text-gray-900">
                    {transfer.fromWarehouse?.name || "N/A"}
                    {transfer.fromWarehouse?.location && (
                      <span className="text-xs text-gray-500 block">
                        {transfer.fromWarehouse.location}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">To Warehouse</p>
                  <p className="text-sm font-medium text-gray-900">
                    {transfer.toWarehouse?.name || "N/A"}
                    {transfer.toWarehouse?.location && (
                      <span className="text-xs text-gray-500 block">
                        {transfer.toWarehouse.location}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Driver</p>
                  <p className="text-sm font-medium text-gray-900">
                    {transfer.driver?.user?.profile?.names || "N/A"}
                  </p>
                </div>
                {transfer.note && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-sm font-medium text-gray-900">
                      {transfer.note}
                    </p>
                  </div>
                )}
              </div>
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

export default TransferViewModal;