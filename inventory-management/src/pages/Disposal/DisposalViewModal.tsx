import React from "react";
import {
  Package,
  Warehouse,
  FileText,
  X,
  AlertTriangle,
} from "lucide-react";

interface DisposalViewModalProps {
  selectedDisposal: any;
  setShowViewModal: (show: boolean) => void;
}

const methodOptions = [
  {
    value: "damaged",
    label: "Damaged",
    icon: <AlertTriangle className="w-4 h-4 mr-2" />,
    color: "bg-amber-100 text-amber-800",
  },
  // ... other method options
];

const DisposalViewModal: React.FC<DisposalViewModalProps> = ({
  selectedDisposal,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            Disposal Details - {selectedDisposal.referenceNumber}
          </h2>
          <button
            onClick={() => {
              setShowViewModal(false);
            }}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Reference and Method */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Reference Number</p>
              <p className="text-lg font-medium text-gray-900">
                {selectedDisposal.referenceNumber}
              </p>
            </div>
            <div className="flex items-center">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMethodColor(
                  selectedDisposal.method
                )}`}
              >
                {getMethodIcon(selectedDisposal.method)}
                <span className="ml-1">{getMethodLabel(selectedDisposal.method)}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2 text-blue-500" />
                Product Information
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedDisposal.product?.name || "N/A"}
                  </p>
                  {selectedDisposal.product?.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedDisposal.product.description}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatNumber(selectedDisposal.quantity)} Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedDisposal.price?.buyingUnitPrice
                      ? `$${Number(selectedDisposal.price.buyingUnitPrice).toFixed(2)} per unit`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-sm font-medium text-gray-900">
                    ${(selectedDisposal.quantity * (selectedDisposal.price?.buyingUnitPrice || 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Warehouse className="w-4 h-4 mr-2 text-indigo-500" />
                Warehouse Details
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Warehouse</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedDisposal.warehouse?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedDisposal.warehouse?.location || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedDisposal.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Disposal Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedDisposal.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {selectedDisposal.note && (
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                Notes
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-900">
                  {selectedDisposal.note}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              setShowViewModal(false);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisposalViewModal;