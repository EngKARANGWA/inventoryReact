import React from "react";
import {
  Edit2,
  Trash2,
  Eye,
  Calendar,
  CheckCircle,
  X,
  Clock,
  CreditCard,
  Truck as TruckIcon,
  AlertTriangle,
} from "lucide-react";
import { Purchase } from "../../services/purchaseService";

// We don't need to redefine these interfaces since we're importing them from purchaseService

interface PurchaseTableProps {
  purchases: Purchase[];
  onView: (purchase: Purchase) => void;
  onEdit: (purchase: Purchase) => void;
  onDelete: (purchaseId: number) => void;
  sortConfig: { key: keyof Purchase; direction: string } | null;
  requestSort: (key: keyof Purchase) => void;
}

const PurchaseTable: React.FC<PurchaseTableProps> = ({
  purchases,
  onView,
  onEdit,
  onDelete,
  sortConfig,
  requestSort,
}) => {
  const getStatusIcon = (status?: string) => {
    if (!status) return <AlertTriangle className="w-4 h-4 text-gray-500" />
    switch (status.toLowerCase()) {
      case "all_completed":
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <X className="w-4 h-4 text-red-500" />;
      case "payment_completed":
        return <CreditCard className="w-4 h-4 text-blue-500" />;
      case "delivery_complete":
        return <TruckIcon className="w-4 h-4 text-amber-500" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "rejected":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-purple-100 text-purple-800"
    switch (status.toLowerCase()) {
      case "all_completed":
      case "completed":
        return "bg-green-100 text-green-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "payment_completed":
        return "bg-purple-100 text-purple-800";
      case "delivery_complete":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate delivery completion percentage
  const getDeliveryPercentage = (purchase: Purchase) => {
    const totalWeight = parseFloat(purchase.weight);
    const deliveredWeight = parseFloat(purchase.totalDelivered);

    if (totalWeight <= 0) return 0;
    return Math.min(100, Math.round((deliveredWeight / totalWeight) * 100));
  };

  // Calculate payment completion percentage
  const getPaymentPercentage = (purchase: Purchase) => {
    if (!purchase.unitPrice) return "N/A";

    const totalValue =
      parseFloat(purchase.weight) * parseFloat(purchase.unitPrice);
    const paidAmount = parseFloat(purchase.totalPaid);

    if (totalValue <= 0) return 0;
    return Math.min(100, Math.round((paidAmount / totalValue) * 100));
  };

  // Format currency with RWF
  const formatCurrency = (amount: string | null) => {
    if (!amount) return "N/A";
    return `${parseFloat(amount).toLocaleString()} RWF`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort("purchaseReference")}
            >
              <div className="flex items-center">
                Reference
                {sortConfig?.key === "purchaseReference" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Supplier
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => requestSort("weight")}
            >
              <div className="flex items-center">
                Weight (Kg)
                {sortConfig?.key === "weight" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price & Payment
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
          {purchases.map((purchase) => (
            <tr
              key={purchase.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {purchase.purchaseReference}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(purchase.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {purchase.user?.profile?.names ||
                    "Unknown Supplier"}
                </div>
                <div className="text-xs text-gray-500">
                  {purchase.user?.profile?.phoneNumber || "N/A"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {purchase.product?.name || "No product"}
                </div>
                <div className="text-xs text-gray-500 truncate max-w-[150px]">
                  {purchase.product?.description || "N/A"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {parseFloat(purchase.weight).toLocaleString()} Kg
                </div>
                <div className="text-xs text-gray-500">
                  Delivered:{" "}
                  {parseFloat(purchase.totalDelivered).toLocaleString()} Kg (
                  {getDeliveryPercentage(purchase)}%)
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{
                      width: `${getDeliveryPercentage(purchase)}%`,
                    }}
                  ></div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {purchase.unitPrice
                    ? `${parseFloat(
                        purchase.unitPrice
                      ).toLocaleString()} RWF/Kg`
                    : "N/A"}
                </div>
                <div className="text-xs text-gray-500">
                  Total Value:{" "}
                  {purchase.unitPrice
                    ? `${(
                        parseFloat(purchase.weight) *
                        parseFloat(purchase.unitPrice)
                      ).toLocaleString()} RWF`
                    : "N/A"}
                </div>
                <div className="text-xs text-gray-500">
                  Paid: {formatCurrency(purchase.totalPaid)}
                  {purchase.unitPrice &&
                  typeof getPaymentPercentage(purchase) === "number"
                    ? ` (${getPaymentPercentage(purchase)}%)`
                    : ""}
                </div>
                {purchase.unitPrice &&
                  typeof getPaymentPercentage(purchase) === "number" && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-green-600 h-1.5 rounded-full"
                        style={{
                          width: `${getPaymentPercentage(purchase)}%`,
                        }}
                      ></div>
                    </div>
                  )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                  <div className="text-sm text-gray-900">
                    {purchase.expectedDeliveryDate
                      ? new Date(
                          purchase.expectedDeliveryDate
                        ).toLocaleDateString()
                      : "Not set"}
                  </div>
                </div>
                {/* Show days remaining or overdue */}
                {purchase.expectedDeliveryDate && (
                  <div className="text-xs mt-1">
                    {(() => {
                      const today = new Date();
                      const deliveryDate = new Date(
                        purchase.expectedDeliveryDate
                      );
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
                  {getStatusIcon(purchase.status)}
                  <span
                    className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      purchase.status
                    )}`}
                  >
                    {purchase.status === "approved" ? "initiated" : purchase.status.replace(/_/g, " ")}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onView(purchase)}
                    className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>

                  {purchase.status !== "all_completed" &&
                    purchase.status !== "delivery_complete" && (
                      <>
                        <button
                          onClick={() => onEdit(purchase)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          title="Edit Purchase"
                        >
                          <Edit2 size={18} />
                        </button>

                        <button
                          onClick={() => onDelete(purchase.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                          title="Delete Purchase"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseTable;
