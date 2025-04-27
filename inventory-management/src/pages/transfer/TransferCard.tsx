import React from "react";
import { Transfer } from "../../services/transferService";
import { formatNumber } from "../../utils/formatUtils";
import { Warehouse, ArrowRight, Calendar, Eye, Edit2, Trash2, Check, X, Clock } from "lucide-react";

interface TransferCardProps {
  transfer: Transfer;
  onView: (transfer: Transfer) => void;
  onEdit: (transfer: Transfer) => void;
  onDelete: (id: number) => void;
}

const TransferCard: React.FC<TransferCardProps> = ({ transfer, onView, onEdit, onDelete }) => {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">{transfer.referenceNumber}</h3>
            <p className="text-xs text-gray-500">
              Created on {new Date(transfer.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
            {getStatusIcon(transfer.status)}
            <span className="ml-1">{transfer.status}</span>
          </span>
        </div>
        
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700">Quantity</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatNumber(transfer.quantity)} Kg
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Product</p>
            <p className="text-sm text-gray-900">
              {transfer.product?.name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Driver</p>
            <p className="text-sm text-gray-900">
              {transfer.driver?.user?.profile?.names || "N/A"}
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700">Transfer Route</p>
          <div className="text-sm text-gray-900">
            <div className="flex items-center">
              <Warehouse className="w-4 h-4 mr-1 text-blue-500" />
              {transfer.fromWarehouse?.name || "N/A"}
              <span className="mx-2 text-gray-400">
                <ArrowRight className="w-4 h-4" />
              </span>
              <Warehouse className="w-4 h-4 mr-1 text-green-500" />
              {transfer.toWarehouse?.name || "N/A"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {transfer.fromWarehouse?.location} → {transfer.toWarehouse?.location}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {transfer.date ? new Date(transfer.date).toLocaleDateString() : "Not scheduled yet"}
          </p>
          
          <div className="flex space-x-1">
            <button onClick={() => onView(transfer)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-full" title="View Details">
              <Eye size={18} />
            </button>
            <button onClick={() => onEdit(transfer)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full" title="Edit Transfer">
              <Edit2 size={18} />
            </button>
            <button onClick={() => onDelete(transfer.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-full" title="Delete Transfer">
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransferCard;