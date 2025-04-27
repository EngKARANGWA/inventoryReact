import React from "react";
import {
  Package,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

interface DisposalCardsViewProps {
  loading: boolean;
  error: string | null;
  searchTerm: string;
  paginatedDisposals: any[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  filteredDisposals: any[];
  handlePageChange: (newPage: number) => void;
  setSelectedDisposal: (disposal: any) => void;
  setShowViewModal: (show: boolean) => void;
  handleEditClick: (disposal: any) => void;
  handleDeleteConfirm: (id: number) => void;
  handleRefresh: () => void;
}

const methodOptions = [
  {
    value: "damaged",
    label: "Damaged",
    icon: <AlertTriangle className="w-4 h-4 mr-2" />,
    color: "bg-amber-100 text-amber-800",
  },
  // ... other method options
];


const DisposalCardsView: React.FC<DisposalCardsViewProps> = ({
  loading,
  error,
  searchTerm,
  paginatedDisposals,
  currentPage,
  totalPages,
  pageSize,
  filteredDisposals,
  handlePageChange,
  setSelectedDisposal,
  setShowViewModal,
  handleEditClick,
  handleDeleteConfirm,
  handleRefresh,
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(num);
  };

  const getMethodIcon = (method: string) => {
    const option = methodOptions.find((m) => m.value === method);
    return option ? option.icon : <Package className="w-4 h-4 mr-2" />;
  };

  const getMethodLabel = (method: string) => {
    const option = methodOptions.find((m) => m.value === method);
    return option ? option.label : "Other";
  };

  const getMethodColor = (method: string) => {
    const option = methodOptions.find((m) => m.value === method);
    return option ? option.color : "bg-gray-100 text-gray-800";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {loading ? (
        // Skeleton for card view
        Array(6).fill(0).map((_, i) => (
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
        ))
      ) : error ? (
        <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            <RefreshCw size={16} className="mr-2" /> 
            Try Again
          </button>
        </div>
      ) : paginatedDisposals.length === 0 ? (
        <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No disposals found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 
              `No disposals matching "${searchTerm}" were found.` : 
              "There are no disposals to display."}
          </p>
        </div>
      ) : (
        paginatedDisposals.map((disposal) => (
          <div 
            key={disposal.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                    {disposal.referenceNumber}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Created on {new Date(disposal.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodColor(
                    disposal.method
                  )}`}
                >
                  {getMethodIcon(disposal.method)}
                  <span className="ml-1">{getMethodLabel(disposal.method)}</span>
                </span>
              </div>
              
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Quantity</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatNumber(disposal.quantity || 0)} Kg
                </p>
                {disposal.price && (
                  <p className="text-xs text-gray-500">
                    @ ${Number(disposal.price.buyingUnitPrice).toFixed(2)}/unit
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Product</p>
                  <p className="text-sm text-gray-900">
                    {disposal.product?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Warehouse</p>
                  <p className="text-sm text-gray-900">
                    {disposal.warehouse?.name || "N/A"}
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Date</p>
                <p className="text-sm text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                  {new Date(disposal.date).toLocaleDateString()}
                </p>
              </div>
              
              {disposal.note && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">Notes</p>
                  <p className="text-sm text-gray-900 line-clamp-2">
                    {disposal.note}
                  </p>
                </div>
              )}
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Value: ${(disposal.quantity * (disposal.price?.buyingUnitPrice || 0)).toFixed(2)}
                </p>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setSelectedDisposal(disposal);
                      setShowViewModal(true);
                    }}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  
                  <button
                    onClick={() => handleEditClick(disposal)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Edit Disposal"
                  >
                    <Edit2 size={18} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteConfirm(disposal.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                    title="Delete Disposal"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
      
      {/* Card View Pagination */}
      {filteredDisposals.length > 0 && (
        <div className="col-span-full mt-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
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
              <span className="hidden sm:inline"> • Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredDisposals.length)} of {filteredDisposals.length}</span>
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
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

export default DisposalCardsView;