import React from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  Eye, 
  Edit2, 
  Trash2, 
  Calendar,
  Check,
  Clock,
  X,
  Info,
  Package,
  AlertCircle,
  Tag
} from "lucide-react";
import { Return } from "../../services/returnsService";

interface ReturnsCardsProps {
  loading: boolean;
  error: string | null;
  returns: Return[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
  onView: (returnItem: Return) => void;
  onEdit: (returnItem: Return) => void;
  onDelete: (returnId: number) => void;
}

const ReturnsCards: React.FC<ReturnsCardsProps> = ({
  loading,
  error,
  returns,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "cancelled":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  const renderSkeleton = () => {
    return Array(6).fill(0).map((_, i) => (
      <div key={`card-skeleton-${i}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="flex justify-between mb-3">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="flex justify-between">
          <div className="h-10 bg-gray-200 rounded w-2/3"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {loading ? (
        renderSkeleton()
      ) : error ? (
        <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-500 mb-4">{error}</p>
        </div>
      ) : returns.length === 0 ? (
        <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No returns found</h3>
        </div>
      ) : (
        returns.map((ret) => (
          <div 
            key={ret.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 mb-1 truncate">
                    {ret.referenceNumber}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Created on {new Date(ret.date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    ret.status
                  )}`}
                >
                  {getStatusIcon(ret.status)}
                  <span className="ml-1">{ret.status}</span>
                </span>
              </div>
              
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Product</p>
                <p className="text-sm font-semibold text-gray-900">
                  {ret.product?.name || `Product #${ret.productId}`}
                </p>
              </div>
              
              {/* Sale and Item Information */}
              <div className="p-3 bg-gray-50 rounded-lg mb-3">
                <div className="flex items-center mb-2">
                  <Tag className="w-4 h-4 text-blue-500 mr-1" />
                  <p className="text-sm font-medium text-blue-700">Sale Item</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Sale</p>
                    <p className="text-sm text-gray-900 truncate">
                      {ret.sale?.referenceNumber || `Sale #${ret.saleId}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Item ID</p>
                    <p className="text-sm text-gray-900">
                      {ret.saleItem?.id || `#${ret.saleItemId}`}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Quantity</p>
                  <p className="text-sm text-gray-900">
                    {formatNumber(parseFloat(ret.returnedQuantity))} KG
                  </p>
                  {ret.saleItem && (
                    <p className="text-xs text-gray-500">
                      {(parseFloat(ret.returnedQuantity) / parseFloat(ret.saleItem.quantity) * 100).toFixed(1)}% of item
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Unit Price</p>
                  <p className="text-sm text-gray-900">
                    {ret.saleItem?.unitPrice ? `$${formatNumber(parseFloat(ret.saleItem.unitPrice))}/KG` : "N/A"}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Notes</p>
                <p className="text-sm text-gray-900 line-clamp-2">
                  {ret.note || "No notes provided"}
                </p>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(ret.date).toLocaleDateString()}
                </p>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => onView(ret)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  
                  <button
                    onClick={() => onEdit(ret)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Edit Return"
                  >
                    <Edit2 size={18} />
                  </button>
                  
                  <button
                    onClick={() => onDelete(ret.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                    title="Delete Return"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
      
      {totalItems > 0 && (
        <div className="col-span-full mt-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ArrowLeft size={16} className="mr-1" />
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages} 
              <span className="hidden sm:inline"> • Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems}</span>
            </span>
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage >= totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
              <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsCards;