import React from "react";
import { Payment } from "../../services/paymentService";
import { formatNumber } from "../../utils/formatUtils";
import { 
  Check, X, RefreshCw, Clock, Calendar, 
  CreditCard, DollarSign, Eye, Edit2, Trash2 
} from "lucide-react";

interface PaymentCardsProps {
  payments: Payment[];
  onView: (payment: Payment) => void;
  onEdit: (payment: Payment) => void;
  onDelete: (id: number) => void;
}

const PaymentCards: React.FC<PaymentCardsProps> = ({
  payments,
  onView,
  onEdit,
  onDelete,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <Check className="w-4 h-4 text-green-500" />;
      case "failed": return <X className="w-4 h-4 text-red-500" />;
      case "refunded": return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      case "refunded": return "bg-blue-100 text-blue-800";
      default: return "bg-amber-100 text-amber-800";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "bank_transfer": return <CreditCard className="w-4 h-4 text-blue-500" />;
      case "mobile_money": return <DollarSign className="w-4 h-4 text-green-500" />;
      case "cash": return <DollarSign className="w-4 h-4 text-purple-500" />;
      case "cheque": return <CreditCard className="w-4 h-4 text-amber-500" />;
      default: return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {payments.map((payment) => (
        <div 
          key={payment.id} 
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                  {payment.paymentReference}
                </h3>
                <p className="text-xs text-gray-500">
                  Created on {new Date(payment.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  payment.status
                )}`}
              >
                {getStatusIcon(payment.status)}
                <span className="ml-1">{payment.status}</span>
              </span>
            </div>
            
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700">Amount</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatNumber(payment.amount)} RWF
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Method</p>
                <p className="text-sm text-gray-900 flex items-center">
                  {getPaymentMethodIcon(payment.paymentMethod)}
                  <span className="ml-1 capitalize">
                    {payment.paymentMethod.replace("_", " ")}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Type</p>
                <p className="text-sm text-gray-900 capitalize">
                  {payment.payableType}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">
                {payment.payableType === "purchase" ? "Purchase" : "Sale"}
              </p>
              <p className="text-sm text-gray-900">
                {payment.payableType === "purchase" ? (
                  <>
                    {payment.purchase?.purchaseReference || "N/A"}
                    {payment.purchase?.supplier?.user?.profile?.names && (
                      <span className="text-xs text-gray-500 block">
                        {payment.purchase.supplier.user.profile.names}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    {payment.sale?.referenceNumber || "N/A"}
                    {payment.sale?.client?.user?.profile?.names && (
                      <span className="text-xs text-gray-500 block">
                        {payment.sale.client.user.profile.names}
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {payment.paidAt
                  ? new Date(payment.paidAt).toLocaleDateString()
                  : "Not paid yet"}
              </p>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => onView(payment)}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => onEdit(payment)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                  title="Edit Payment"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => onDelete(payment.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                  title="Delete Payment"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentCards;