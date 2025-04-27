import React from "react";
import { Transfer } from "../../services/transferService";
import { formatNumber } from "../../utils/formatUtils";
import { Warehouse, ArrowRight, Calendar, Check, X, Clock, Eye, Edit2, Trash2 } from "lucide-react";

interface TransferTableProps {
  transfers: Transfer[];
  sortConfig: { key: string; direction: string } | null;
  onSort: (key: keyof Transfer) => void;
  onView: (transfer: Transfer) => void;
  onEdit: (transfer: Transfer) => void;
  onDelete: (id: number) => void;
}

const TransferTable: React.FC<TransferTableProps> = ({
  transfers,
  sortConfig,
  onSort,
  onView,
  onEdit,
  onDelete,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <Check className="w-4 h-4 text-green-500" />;
      case "cancelled": return <X className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-amber-100 text-amber-800";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onSort("referenceNumber")}>
              <div className="flex items-center">
                Reference
                {sortConfig?.key === "referenceNumber" && (
                  <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onSort("quantity")}>
              <div className="flex items-center">
                Quantity
                {sortConfig?.key === "quantity" && (
                  <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onSort("createdAt")}>
              <div className="flex items-center">
                Date
                {sortConfig?.key === "createdAt" && (
                  <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => onSort("status")}>
              <div className="flex items-center">
                Status
                {sortConfig?.key === "status" && (
                  <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transfers.map((transfer) => (
            <tr key={transfer.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{transfer.referenceNumber}</div>
                <div className="text-xs text-gray-500">{new Date(transfer.createdAt).toLocaleDateString()}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{transfer.product?.name || "N/A"}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm text-gray-900">
                    <div className="flex items-center">
                      <Warehouse className="w-4 h-4 mr-1 text-blue-500" />
                      {transfer.fromWarehouse?.name || "N/A"}
                      <span className="mx-2 text-gray-400"><ArrowRight className="w-4 h-4" /></span>
                      <Warehouse className="w-4 h-4 mr-1 text-green-500" />
                      {transfer.toWarehouse?.name || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {transfer.fromWarehouse?.location} → {transfer.toWarehouse?.location}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{formatNumber(transfer.quantity)} Kg</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{transfer.driver?.user?.profile?.names || "N/A"}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                  <div className="text-sm text-gray-900">
                    {new Date(transfer.date).toLocaleDateString()}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {getStatusIcon(transfer.status)}
                  <span className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                    {transfer.status}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button onClick={() => onView(transfer)} className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50" title="View Details">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => onEdit(transfer)} className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50" title="Edit Transfer">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => onDelete(transfer.id)} className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50" title="Delete Transfer">
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

export default TransferTable;