import React from 'react';
import { Purchase } from '../../services/purchaseService';
import { 
  Edit2, Trash2, Eye, Calendar, CheckCircle, X, Clock, 
  CreditCard, Truck as TruckIcon 
} from 'lucide-react';

interface PurchaseCardsProps {
  purchases: Purchase[];
  onView: (purchase: Purchase) => void;
  onEdit: (purchase: Purchase) => void;
  onDelete: (purchaseId: number) => void;
}

const PurchaseCards: React.FC<PurchaseCardsProps> = ({ purchases, onView, onEdit, onDelete }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "all_completed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled": return <X className="w-4 h-4 text-red-500" />;
      case "payment_completed": return <CreditCard className="w-4 h-4 text-blue-500" />;
      case "delivery_complete": return <TruckIcon className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "all_completed": return "bg-green-100 text-green-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "payment_completed": return "bg-purple-100 text-purple-800";
      case "delivery_complete": return "bg-amber-100 text-amber-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {purchases.map((purchase) => (
        <div 
          key={purchase.id} 
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                  {purchase.purchaseReference}
                </h3>
                <p className="text-xs text-gray-500">
                  Created on {new Date(purchase.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  purchase.status
                )}`}
              >
                {getStatusIcon(purchase.status)}
                <span className="ml-1">{purchase.status.replace(/_/g, " ")}</span>
              </span>
            </div>
            
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700">Supplier</p>
              <p className="text-sm text-gray-900">
                {purchase.user?.profile?.names || "Unknown Supplier"}
              </p>
            </div>
            
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700">Product</p>
              <p className="text-sm text-gray-900">
                {purchase.product?.name || "No product"}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Weight</p>
                <p className="text-sm text-gray-900">
                  {parseFloat(purchase.weight).toLocaleString()} Kg
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Unit Price</p>
                <p className="text-sm text-gray-900">
                  {purchase.unitPrice
                    ? `${parseFloat(purchase.unitPrice).toLocaleString()} RWF`
                    : "N/A"}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Total Amount</p>
              <p className="text-lg font-semibold text-gray-900">
                {purchase.unitPrice
                  ? (parseFloat(purchase.weight) * parseFloat(purchase.unitPrice)).toLocaleString() + " RWF"
                  : "N/A"}
              </p>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {purchase.expectedDeliveryDate
                  ? new Date(purchase.expectedDeliveryDate).toLocaleDateString()
                  : "No delivery date"}
              </p>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => onView(purchase)}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                  title="View Details"
                >
                  <Eye size={18} />
                </button>
                
                {purchase.status !== "all_completed" && (
                  <>
                    <button
                      onClick={() => onEdit(purchase)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Edit Purchase"
                    >
                      <Edit2 size={18} />
                    </button>
                    
                    <button
                      onClick={() => onDelete(purchase.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                      title="Delete Purchase"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PurchaseCards;