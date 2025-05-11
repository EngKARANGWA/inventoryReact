import React from 'react';
import { 
  Package, 
  Activity, 
  FileText, 
  X, 
  ShoppingCart, 
  Scale, 
  Truck as TruckIcon,
  CheckCircle,
  CreditCard,
  Clock,
} from 'lucide-react';

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
}) => {
  if (!showViewModal || !selectedSale) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "payment_complete":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <X className="w-4 h-4 text-red-500" />;
      case "payment_complete":
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const calculateTotalValue = () => {
    return parseFloat(selectedSale.quantity) * parseFloat(selectedSale.unitPrice);
  };

  const deliveryProgressPercentage = Math.min(100, 
    (parseFloat(selectedSale.totalDelivered || '0') / parseFloat(selectedSale.quantity)) * 100
  );

  const paymentProgressPercentage = Math.min(100,
    (parseFloat(selectedSale.totalPaid || '0') / calculateTotalValue()) * 100
  );

  const remainingQuantity = parseFloat(selectedSale.quantity) - parseFloat(selectedSale.totalDelivered || '0');
  const remainingPayment = calculateTotalValue() - parseFloat(selectedSale.totalPaid || '0');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            Sale Details
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
          {/* Sale Reference and Status */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Reference Number</p>
              <p className="text-lg font-medium text-gray-900">
                {selectedSale.saleReference}
              </p>
            </div>
            <div className="flex items-center">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  selectedSale.status
                )}`}
              >
                {getStatusIcon(selectedSale.status)}
                <span className="ml-1">
                  {selectedSale.status.replace(/_/g, " ")}
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <ShoppingCart className="w-4 h-4 mr-2 text-blue-500" />
                Basic Information
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedSale.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(selectedSale.updatedAt).toLocaleString()}
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
                <div>
                  <p className="text-sm text-gray-500">Sale ID</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSale.id}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Scale className="w-4 h-4 mr-2 text-purple-500" />
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
                  <p className="text-sm text-gray-500">Product Type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSale.product?.type?.replace(/_/g, " ") || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Product Description</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSale.product?.description || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    <Package className="w-4 h-4 mr-1" />
                    {parseFloat(selectedSale.quantity).toLocaleString()} Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unit Price</p>
                  <p className="text-sm font-medium text-gray-900">
                    {parseFloat(selectedSale.unitPrice).toLocaleString()} RWF/Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-sm font-medium text-gray-900">
                    {calculateTotalValue().toLocaleString()} RWF
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-indigo-500" />
                Transaction Details
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Saler</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSale.saler?.user?.profile?.names || "Unknown Saler"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Saler ID</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSale.saler?.salerId || "N/A"}
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
                  <p className="text-sm text-gray-500">TIN Number</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSale.saler?.tinNumber || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <TruckIcon className="w-4 h-4 mr-2 text-amber-500" />
                Delivery & Payment Status
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Total Quantity</p>
                  <p className="text-sm font-medium text-gray-900">
                    {parseFloat(selectedSale.quantity).toLocaleString()} Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Delivered</p>
                  <p className="text-sm font-medium text-gray-900">
                    {parseFloat(selectedSale.totalDelivered || '0').toLocaleString()} Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Remaining</p>
                  <p className="text-sm font-medium text-gray-900">
                    {remainingQuantity.toLocaleString()} Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Delivery Progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${deliveryProgressPercentage}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(deliveryProgressPercentage)}% complete
                  </p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500">Total Payment Due</p>
                  <p className="text-sm font-medium text-gray-900">
                    {calculateTotalValue().toLocaleString()} RWF
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="text-sm font-medium text-gray-900">
                    {parseFloat(selectedSale.totalPaid || '0').toLocaleString()} RWF
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Remaining Payment</p>
                  <p className="text-sm font-medium text-gray-900">
                    {remainingPayment.toLocaleString()} RWF
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{
                        width: `${paymentProgressPercentage}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(paymentProgressPercentage)}% complete
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

          {/* If you have deliveries and payments data, you can add sections similar to PurchaseViewModal */}
          {/* Example structure for future implementation:
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">
                Related Records
              </h3>
            </div>
            ... deliveries and payments tables ...
          </div>
          */}
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