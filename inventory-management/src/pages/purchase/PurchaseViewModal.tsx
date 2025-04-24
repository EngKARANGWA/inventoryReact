// components/PurchaseViewModal.tsx
import React from "react";
import { Purchase } from "../../services/purchaseService";
import {
  X,
  ShoppingCart,
  Scale,
  Truck as TruckIcon,
  DollarSign,
  CheckCircle,
  CreditCard,
  Clock,
  Activity,
} from "lucide-react";

interface PurchaseViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase | null;
}

const PurchaseViewModal: React.FC<PurchaseViewModalProps> = ({
  isOpen,
  onClose,
  purchase,
}) => {
  if (!isOpen || !purchase) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "all_completed":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "payment_completed":
        return "bg-purple-100 text-purple-800";
      case "delivery_complete":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "all_completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <X className="w-4 h-4 text-red-500" />;
      case "payment_completed":
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case "delivery_complete":
        return <TruckIcon className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            Purchase Details
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
          {/* Purchase Reference and Status */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Reference Number</p>
              <p className="text-lg font-medium text-gray-900">
                {purchase.purchaseReference}
              </p>
            </div>
            <div className="flex items-center">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  purchase.status
                )}`}
              >
                {getStatusIcon(purchase.status)}
                <span className="ml-1">
                  {purchase.status.replace(/_/g, " ")}
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
                    {new Date(purchase.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(purchase.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expected Delivery</p>
                  <p className="text-sm font-medium text-gray-900">
                    {purchase.expectedDeliveryDate
                      ? new Date(
                          purchase.expectedDeliveryDate
                        ).toLocaleDateString()
                      : "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm font-medium text-gray-900">
                    {purchase.description || "No description provided"}
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
                    {purchase.product?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Product Description</p>
                  <p className="text-sm font-medium text-gray-900">
                    {purchase.product?.description || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="text-sm font-medium text-gray-900">
                    {parseFloat(purchase.weight).toLocaleString()} Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unit Price</p>
                  <p className="text-sm font-medium text-gray-900">
                    {purchase.unitPrice
                      ? `${parseFloat(
                          purchase.unitPrice
                        ).toLocaleString()} RWF/Kg`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-sm font-medium text-gray-900">
                    {purchase.unitPrice
                      ? `${(
                          parseFloat(purchase.weight) *
                          parseFloat(purchase.unitPrice)
                        ).toLocaleString()} RWF`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-indigo-500" />
                Supplier Information
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Supplier Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {purchase.supplier?.user?.profile?.names ||
                      "Unknown Supplier"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Supplier ID</p>
                  <p className="text-sm font-medium text-gray-900">
                    {purchase.supplier?.supplierId || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="text-sm font-medium text-gray-900">
                    {purchase.supplier?.user?.profile?.phoneNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-sm font-medium text-gray-900">
                    {purchase.supplier?.district}, {purchase.supplier?.sector}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <TruckIcon className="w-4 h-4 mr-2 text-amber-500" />
                Delivery Information
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Total Weight</p>
                  <p className="text-sm font-medium text-gray-900">
                    {parseFloat(purchase.weight).toLocaleString()} Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Delivered</p>
                  <p className="text-sm font-medium text-gray-900">
                    {parseFloat(purchase.totalDelivered).toLocaleString()} Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Remaining</p>
                  <p className="text-sm font-medium text-gray-900">
                    {(
                      parseFloat(purchase.weight) -
                      parseFloat(purchase.totalDelivered)
                    ).toLocaleString()}{" "}
                    Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Delivery Progress</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (parseFloat(purchase.totalDelivered) /
                            parseFloat(purchase.weight)) *
                            100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Math.round(
                      (parseFloat(purchase.totalDelivered) /
                        parseFloat(purchase.weight)) *
                        100
                    )}
                    % complete
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs for Deliveries and Payments */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">
                Related Records
              </h3>
            </div>

            {/* Deliveries Section */}
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <TruckIcon className="w-4 h-4 mr-2 text-gray-500" />
                Deliveries ({purchase.deliveries?.length || 0})
              </h4>

              {purchase.deliveries?.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Weight (Kg)
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Delivery Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {purchase.deliveries.map((delivery) => (
                        <tr key={delivery.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {delivery.deliveryReference}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                delivery.status
                              )}`}
                            >
                              {delivery.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {parseFloat(delivery.weight).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {delivery.deliveredAt
                              ? new Date(
                                  delivery.deliveredAt
                                ).toLocaleDateString()
                              : "Not delivered"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md text-center">
                  No deliveries recorded for this purchase
                </div>
              )}
            </div>

            {/* Payments Section */}
            <div className="border-t border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
                Payments ({purchase.payments?.length || 0})
              </h4>

              {purchase.payments?.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount (RWF)
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {purchase.payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {payment.paymentReference}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {parseFloat(payment.amount).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {payment.paymentMethod.replace(/_/g, " ")}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                payment.status
                              )}`}
                            >
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {payment.paidAt
                              ? new Date(payment.paidAt).toLocaleDateString()
                              : "Pending"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-md text-center">
                  No payments recorded for this purchase
                </div>
              )}
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
    </div>
  );
};

export default PurchaseViewModal;
