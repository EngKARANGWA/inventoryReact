import React, { useState, useEffect } from "react";
import { Payment, paymentService } from "../../services/paymentService";
import { formatNumber } from "../../utils/formatUtils";
import {
  Check,
  X,
  RefreshCw,
  Clock,
  CreditCard,
  DollarSign,
  ShoppingCart,
} from "lucide-react";

interface PaymentViewModalProps {
  payment: Payment;
  onClose: () => void;
}

const PaymentViewModal: React.FC<PaymentViewModalProps> = ({
  payment,
  onClose,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const loadFile = async () => {
      if (!payment.transactionReference) return;

      try {
        const filename = payment.transactionReference.split("/").pop();
        if (!filename) return;

        const blob = await paymentService.getPaymentFile(filename);

        if (isMounted) {
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
        }
      } catch (error) {
        console.error("Error loading payment file:", error);
      }
    };

    if (payment.transactionReference) {
      loadFile();
    }

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [payment.transactionReference]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />;
      case "failed":
        return <X className="w-4 h-4 text-red-500" />;
      case "refunded":
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case "mobile_money":
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case "cash":
        return <DollarSign className="w-4 h-4 text-purple-500" />;
      case "cheque":
        return <CreditCard className="w-4 h-4 text-amber-500" />;
      default:
        return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 truncate">
          Payment Details - {payment.paymentReference}
        </h2>
        <button
          onClick={() => {
            onClose();
            if (imageUrl) {
              URL.revokeObjectURL(imageUrl);
              setImageUrl(null);
            }
          }}
          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Payment Reference and Status */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Reference Number</p>
            <p className="text-lg font-medium text-gray-900">
              {payment.paymentReference}
            </p>
          </div>
          <div className="flex items-center">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                payment.status
              )}`}
            >
              {getStatusIcon(payment.status)}
              <span className="ml-1">{payment.status}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
              Payment Information
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatNumber(payment.amount)} RWF
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  {getPaymentMethodIcon(payment.paymentMethod)}
                  <span className="ml-1 capitalize">
                    {payment.paymentMethod.replace("_", " ")}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-sm font-medium text-gray-900">
                  {payment.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(payment.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Paid At</p>
                <p className="text-sm font-medium text-gray-900">
                  {payment.paidAt
                    ? new Date(payment.paidAt).toLocaleString()
                    : "Not paid yet"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-indigo-500" />
              Transaction Details
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-500">Reference</p>
                <p className="text-sm font-medium text-gray-900">
                  {payment.transactionReference || "N/A"}
                </p>
              </div>
              {payment.transactionReference && (
                <div>
                  <p className="text-sm text-gray-500">Payment Proof</p>
                  {payment.transactionReference.match(
                    /\.(jpeg|jpg|gif|png|webp)$/i
                  ) ? (
                    <div className="mt-2">
                      {imageUrl ? (
                        <>
                          <img
                            src={imageUrl}
                            alt="Payment proof"
                            className="max-w-full h-auto rounded-md cursor-pointer"
                            onClick={() => window.open(imageUrl, "_blank")}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Click image to view in full size
                          </p>
                        </>
                      ) : (
                        <div className="mt-2 p-4 bg-gray-100 rounded-md text-center">
                          <p className="text-sm text-gray-600">
                            Loading payment proof...
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      href={`${
                        process.env.VITE_API_BASE_URL
                      }/payments/file/${payment.transactionReference
                        .split("/")
                        .pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Download Proof Document
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
            {payment.payableType === "purchase" ? (
              <ShoppingCart className="w-4 h-4 mr-2 text-amber-500" />
            ) : (
              <DollarSign className="w-4 h-4 mr-2 text-green-500" />
            )}
            {payment.payableType === "purchase"
              ? "Purchase Details"
              : "Sale Details"}
          </h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {payment.payableType === "purchase" ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Purchase Reference</p>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.purchase?.purchaseReference || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Supplier</p>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.purchase?.supplier?.user?.profile?.names ||
                      "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.purchase?.description || "N/A"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Sale Reference</p>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.sale?.saleReference || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.sale?.client?.user?.profile?.names || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.sale?.totalAmount
                      ? formatNumber(payment.sale.totalAmount) + " RWF"
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="text-sm font-medium text-gray-900">
                    {payment.sale?.totalPaid
                      ? formatNumber(payment.sale.totalPaid) + " RWF"
                      : "N/A"}
                  </p>
                </div>
                {payment.sale?.items && payment.sale.items.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Items
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Unit Price
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payment.sale.items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                {item.product?.name || "N/A"}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                {formatNumber(item.quantity)}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                {formatNumber(item.unitPrice)} RWF
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                {formatNumber(item.quantity * item.unitPrice)} RWF
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            onClose();
            if (imageUrl) {
              URL.revokeObjectURL(imageUrl);
              setImageUrl(null);
            }
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PaymentViewModal;