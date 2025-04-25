import React from 'react';
import { Package, Activity, FileText, X } from 'lucide-react';

interface SaleDetailsModalProps {
  showViewModal: boolean;
  setShowViewModal: (show: boolean) => void;
  selectedSale: any;
  getStatusBadge: (sale: any) => React.ReactNode;
}

export const SaleDetailsModal: React.FC<SaleDetailsModalProps> = ({
  showViewModal,
  setShowViewModal,
  selectedSale,
  getStatusBadge
}) => {
  if (!showViewModal || !selectedSale) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            Sale Details - {selectedSale.saleReference || "N/A"}
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
          {/* Sale Reference and Status */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Reference Number</p>
              <p className="text-lg font-medium text-gray-900">
                {selectedSale.saleReference || "N/A"}
              </p>
            </div>
            <div className="flex items-center">
              {getStatusBadge(selectedSale)}
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
                    {selectedSale.product?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    <Package className="w-4 h-4 mr-1" />
                    {selectedSale.quantity} Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unit Price</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSale.unitPrice ? parseFloat(selectedSale.unitPrice).toFixed(2) : "N/A"} RWF/Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSale.unitPrice ? (parseFloat(selectedSale.unitPrice) * selectedSale.quantity) : "N/A"} RWF
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-indigo-500" />
                Transaction Details
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Saler</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSale.saler?.user?.profile?.names || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSale.client?.user?.profile?.names || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blocker</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSale.blocker?.user?.profile?.names || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedSale.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expected Delivery</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSale.expectedDeliveryDate
                      ? new Date(selectedSale.expectedDeliveryDate).toLocaleDateString()
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-gray-500" />
              Additional Information
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-sm font-medium text-gray-900">
                  {selectedSale.note || "No notes provided"}
                </p>
              </div>
            </div>
          </div>
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