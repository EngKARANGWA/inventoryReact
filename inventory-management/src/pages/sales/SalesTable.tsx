import React from "react";
import {
  Calendar,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  Clock,
  CreditCard,
  Truck,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";

interface Sale {
  id: number;
  saleReference: string | null;
  totalAmount: string;
  status: string;
  expectedDeliveryDate: string;
  totalPaid: string;
  note: string;
  createdAt: string;
  items: Array<{
    id: number;
    productId: number;
    quantity: string;
    unitPrice: string;
    totalDelivered: string;
    product?: {
      id: number;
      name: string;
      type?: string;
    };
  }>;
  saler: {
    id: number;
    user: {
      profile: {
        names: string;
      };
    };
  };
  client: {
    id: number;
    user?: {
      profile?: {
        names: string;
      };
    };
  } | null;
}

interface SortConfig {
  key: string;
  direction: "ascending" | "descending";
}

interface SalesTableProps {
  loading: boolean;
  error: string | null;
  sales: Sale[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  handlePageChange: (page: number) => void;
  onView: (sale: Sale) => void;
  onEdit: (sale: Sale) => void;
  onDelete: (saleId: number) => void;
  sortConfig: SortConfig | null;
  requestSort: (key: string) => void;
}

const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  onView,
  onEdit,
  onDelete,
  sortConfig,
  requestSort,
}) => {
  const getStatusIcon = (status?: string) => {
    if (!status) return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <X className="w-4 h-4 text-red-500" />;
      case "paid":
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case "delivered":
        return <Truck className="w-4 h-4 text-amber-500" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-purple-100 text-purple-800";
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate totals for a sale
  const calculateSaleTotals = (sale: Sale) => {
    let totalQuantity = 0;
    let totalDelivered = 0;
    let totalValue = 0;
    
    if (sale.items && sale.items.length > 0) {
      sale.items.forEach(item => {
        totalQuantity += parseFloat(item.quantity || '0');
        totalDelivered += parseFloat(item.totalDelivered || '0');
        totalValue += parseFloat(item.quantity || '0') * parseFloat(item.unitPrice || '0');
      });
    }
    
    return {
      totalQuantity,
      totalDelivered,
      totalValue,
      deliveryPercentage: totalQuantity > 0 
        ? Math.min(100, Math.round((totalDelivered / totalQuantity) * 100))
        : 0
    };
  };

  const getPaymentPercentage = (sale: Sale) => {
    const { totalValue } = calculateSaleTotals(sale);
    const paidAmount = parseFloat(sale.totalPaid || "0");

    if (totalValue <= 0) return 0;
    return Math.min(100, Math.round((paidAmount / totalValue) * 100));
  };

  const formatCurrency = (amount: string | number | null) => {
    if (amount === null || amount === undefined) return "N/A";
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${value.toLocaleString()} RWF`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort("saleReference")}
            >
              <div className="flex items-center">
                Reference
                {sortConfig?.key === "saleReference" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Products
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort("totalAmount")}
            >
              <div className="flex items-center">
                Quantity & Amount
                {sortConfig?.key === "totalAmount" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Delivery & Payment
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort("expectedDeliveryDate")}
            >
              <div className="flex items-center">
                Delivery Date
                {sortConfig?.key === "expectedDeliveryDate" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort("status")}
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
          {sales.map((sale) => {
            const { totalQuantity, totalDelivered, totalValue, deliveryPercentage } = calculateSaleTotals(sale);
            const paymentPercentage = getPaymentPercentage(sale);
            
            return (
              <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {sale.saleReference || "N/A"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(sale.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {sale.client?.user?.profile?.names || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {sale.items && sale.items.length > 0 ? (
                    <>
                      <div className="text-sm text-gray-900">
                        {sale.items[0].product?.name || "N/A"}
                        {sale.items.length > 1 && ` + ${sale.items.length - 1} more`}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        {sale.items.length} {sale.items.length === 1 ? "item" : "items"}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-900">No items</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {totalQuantity.toLocaleString()} Kg
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(totalValue)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-500">
                    Delivered: {totalDelivered.toLocaleString()} Kg ({deliveryPercentage}%)
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${deliveryPercentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    Paid: {formatCurrency(sale.totalPaid)} ({paymentPercentage}%)
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-green-600 h-1.5 rounded-full"
                      style={{ width: `${paymentPercentage}%` }}
                    ></div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                    <div className="text-sm text-gray-900">
                      {sale.expectedDeliveryDate
                        ? new Date(sale.expectedDeliveryDate).toLocaleDateString()
                        : "Not set"}
                    </div>
                  </div>
                  {sale.expectedDeliveryDate && (
                    <div className="text-xs mt-1">
                      {(() => {
                        const today = new Date();
                        const deliveryDate = new Date(sale.expectedDeliveryDate);
                        const diffTime = deliveryDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(
                          diffTime / (1000 * 60 * 60 * 24)
                        );

                        if (diffDays > 0) {
                          return (
                            <span className="text-blue-600">
                              {diffDays} days remaining
                            </span>
                          );
                        } else if (diffDays < 0) {
                          return (
                            <span className="text-red-600">
                              {Math.abs(diffDays)} days overdue
                            </span>
                          );
                        } else {
                          return (
                            <span className="text-green-600">Due today</span>
                          );
                        }
                      })()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(sale.status)}
                    <span
                      className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        sale.status
                      )}`}
                    >
                      {sale.status === "approved"
                        ? "Initiated"
                        : sale.status?.replace(/_/g, " ") || "N/A"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(sale)}
                      className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>

                    {sale.status !== "completed" && (
                      <>
                        <button
                          onClick={() => onEdit(sale)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          title="Edit Sale"
                        >
                          <Edit2 size={18} />
                        </button>

                        <button
                          onClick={() => onDelete(sale.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                          title="Delete Sale"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SalesTable;