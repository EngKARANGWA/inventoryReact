import React from "react";
import { Payment } from "../../services/paymentService";
import { formatNumber } from "../../utils/formatUtils";
import { 
  Check, X, RefreshCw, Clock, Calendar, 
  CreditCard, DollarSign, Eye, Edit2, Trash2 
} from "lucide-react";

interface PaymentTableProps {
    payments: Payment[];
    sortConfig: { key: string; direction: string } | null;
    onSort: (key: string) => void;
    onView: (payment: Payment) => void;
    onEdit: (payment: Payment) => void;
    onDelete: (id: number) => void;
  }

const PaymentTable: React.FC<PaymentTableProps> = ({
  payments,
  sortConfig,
  onSort,
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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort("paymentReference")}
            >
              <div className="flex items-center">
                Reference
                {sortConfig?.key === "paymentReference" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort("amount")}
            >
              <div className="flex items-center">
                Amount
                {sortConfig?.key === "amount" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payable
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Method
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort("createdAt")}
            >
              <div className="flex items-center">
                Date
                {sortConfig?.key === "createdAt" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onSort("status")}
            >
              <div className="flex items-center">
                Status
                {sortConfig?.key === "status" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {payment.paymentReference}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatNumber(payment.amount)} RWF
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {payment.payableType === "purchase" ? (
                    <div className="flex items-center">
                      <span className="mr-1">Purchase:</span>
                      {payment.purchase?.purchaseReference || "N/A"}
                      {payment.purchase?.supplier?.user?.profile?.names && (
                        <>
                          <span className="mx-1">-</span>
                          {payment.purchase.supplier.user.profile.names}
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className="mr-1">Sale:</span>
                        {payment.sale?.saleReference || "N/A"}
                        {payment.sale?.client?.user?.profile?.names && (
                          <>
                            <span className="mx-1">-</span>
                            {payment.sale.client.user.profile.names}
                          </>
                        )}
                      </div>
                      {payment.sale?.totalAmount && (
                        <div className="text-xs text-gray-500">
                          Total: {formatNumber(payment.sale.totalAmount)} RWF
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getPaymentMethodIcon(payment.paymentMethod)}
                  <span className="ml-1 capitalize">
                    {payment.paymentMethod.replace("_", " ")}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                  <div className="text-sm text-gray-900">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getStatusIcon(payment.status)}
                  <span
                    className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {payment.status}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onView(payment)}
                    className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => onEdit(payment)}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                    title="Edit Payment"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(payment.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                    title="Delete Payment"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentTable;