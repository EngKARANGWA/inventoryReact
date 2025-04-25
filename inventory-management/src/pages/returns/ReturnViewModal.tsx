import React from "react";
import { X, Package, Truck, FileText, Check, Clock, Info } from "lucide-react";
import { Return } from "../../services/returnsService";

interface ReturnViewModalProps {
  returnData: Return; // Changed from returnItem to returnData to match parent component
  onClose: () => void;
}

const ReturnViewModal: React.FC<ReturnViewModalProps> = ({ returnData, onClose }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "cancelled":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            Return Details - {returnData.referenceNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Reference Number</p>
              <p className="text-lg font-medium text-blue-600">
                {returnData.referenceNumber}
              </p>
            </div>
            <div className="flex items-center">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  returnData.status
                )}`}
              >
                {getStatusIcon(returnData.status)}
                <span className="ml-1">{returnData.status}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2 text-blue-500" />
                Return Information
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Quantity Returned</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatNumber(parseFloat(returnData.returnedQuantity))} KG
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="text-sm font-medium text-gray-900">
                    {returnData.product?.name || `Product #${returnData.productId}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-sm font-medium text-gray-900">
                    {returnData.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(returnData.date)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Truck className="w-4 h-4 mr-2 text-indigo-500" />
                Sale Details
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Sale Reference</p>
                  <p className="text-sm font-medium text-gray-900">
                    {returnData.sale?.referenceNumber || `Sale #${returnData.saleId}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Original Quantity</p>
                  <p className="text-sm font-medium text-gray-900">
                    {returnData.sale?.quantity || "N/A"} KG
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Return Percentage</p>
                  <p className="text-sm font-medium text-gray-900">
                    {returnData.sale?.quantity ? 
                      `${((parseFloat(returnData.returnedQuantity) / parseFloat(returnData.sale.quantity) * 100).toFixed(2))}%` : 
                      "N/A"}
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
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-sm font-medium text-gray-900">
                    {returnData.note || "No notes provided"}
                  </p>
                </div>
                {returnData.stockMovements && returnData.stockMovements.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Stock Movements</p>
                    <div className="mt-2 space-y-2">
                      {returnData.stockMovements.map((movement: any) => (
                        <div key={movement.id} className="text-sm bg-gray-50 p-2 rounded">
                          <p className="font-medium">{movement.referenceNumber}</p>
                          <p className="text-gray-600">
                            {movement.warehouse?.name || "Unknown warehouse"} • {movement.direction === "in" ? "Inbound" : "Outbound"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(movement.movementDate)}
                          </p>
                        </div>
                      ))}
                    </div>
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

export default ReturnViewModal;