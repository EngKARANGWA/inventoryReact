import React from 'react';
import {  
  Activity, 
  FileText, 
  X, 
  ShoppingCart, 
  Truck as TruckIcon,
  CheckCircle,
  CreditCard,
  Clock,
  List
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
      case "payment_completed":
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
      case "payment_completed":
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Calculate the total quantity and value across all items
  const calculateTotals = () => {
    let totalQuantity = 0;
    let totalValue = 0;
    
    if (selectedSale.items && selectedSale.items.length > 0) {
      selectedSale.items.forEach((item: any) => {
        totalQuantity += parseFloat(item.quantity || 0);
        totalValue += parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0);
      });
    }
    
    return { totalQuantity, totalValue };
  };

  const { totalQuantity, totalValue } = calculateTotals();

  const totalDelivered = selectedSale.items?.reduce((sum: number, item: any) => 
    sum + parseFloat(item.totalDelivered || 0), 0) || 0;

  const deliveryProgressPercentage = totalQuantity > 0 
    ? Math.min(100, (totalDelivered / totalQuantity) * 100)
    : 0;

  const paymentProgressPercentage = totalValue > 0
    ? Math.min(100, (parseFloat(selectedSale.totalPaid || 0) / totalValue) * 100)
    : 0;

  const remainingQuantity = totalQuantity - totalDelivered;
  const remainingPayment = totalValue - parseFloat(selectedSale.totalPaid || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
                <Activity className="w-4 h-4 mr-2 text-indigo-500" />
                Transaction Details
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Saler</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSale.saler?.profile?.names || "Unknown Saler"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSale.client?.profile?.names || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Blocker</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedSale.blocker?.profile?.names || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {totalValue.toLocaleString()} RWF
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sale Items Section */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <List className="w-4 h-4 mr-2 text-green-500" />
              Sale Items ({selectedSale.items?.length || 0})
            </h3>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivered
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedSale.items?.map((item: any, index: number) => (
                      <tr key={item.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product?.name || "Unknown Product"}
                          </div>
                          {item.note && (
                            <div className="text-xs text-gray-500">
                              Note: {item.note}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {parseFloat(item.quantity).toLocaleString()} Kg
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {parseFloat(item.unitPrice).toLocaleString()} RWF/Kg
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {(parseFloat(item.quantity) * parseFloat(item.unitPrice)).toLocaleString()} RWF
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {parseFloat(item.totalDelivered || 0).toLocaleString()} Kg
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{
                                width: `${parseFloat(item.quantity) > 0 
                                  ? Math.min(100, (parseFloat(item.totalDelivered || 0) / parseFloat(item.quantity)) * 100) 
                                  : 0}%`,
                              }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-sm font-medium text-gray-900">
                        Total
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {totalQuantity.toLocaleString()} Kg
                      </td>
                      <td className="px-4 py-3"></td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {totalValue.toLocaleString()} RWF
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {totalDelivered.toLocaleString()} Kg
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <TruckIcon className="w-4 h-4 mr-2 text-amber-500" />
                Delivery & Payment Status
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Total Quantity</p>
                  <p className="text-sm font-medium text-gray-900">
                    {totalQuantity.toLocaleString()} Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Delivered</p>
                  <p className="text-sm font-medium text-gray-900">
                    {totalDelivered.toLocaleString()} Kg
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
                    {totalValue.toLocaleString()} RWF
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="text-sm font-medium text-gray-900">
                    {parseFloat(selectedSale.totalPaid || 0).toLocaleString()} RWF
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