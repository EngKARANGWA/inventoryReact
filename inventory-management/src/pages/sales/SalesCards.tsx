import React from "react";
import { Package, Calendar, Eye, Edit2, Trash2, RefreshCw } from "lucide-react";

interface SalesCardsProps {
  loading: boolean;
  error: string | null;
  sales: any[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  handleEditClick: (sale: any) => void;
  handleDeleteConfirm: (id: number) => void;
  setSelectedSale: (sale: any) => void;
  setShowViewModal: (show: boolean) => void;
  getStatusBadge: (sale: any) => React.ReactNode;
}

export const SalesCards: React.FC<SalesCardsProps> = ({
  loading,
  error,
  sales,
  currentPage,
  totalPages,
  handlePageChange,
  handleEditClick,
  handleDeleteConfirm,
  setSelectedSale,
  setShowViewModal,
  getStatusBadge
}) => {
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
          <div className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            <RefreshCw size={16} className="mr-2" /> 
            Try Again
          </button>
        </div>
      ) : sales.length === 0 ? (
        <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <div className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
          <p className="text-gray-500 mb-4">
            There are no sales to display.
          </p>
        </div>
      ) : (
        sales.map((sale) => (
          <div 
            key={sale.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                    {sale.saleReference || "N/A"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Created on {new Date(sale.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(sale)}
              </div>
              
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Product</p>
                <p className="text-sm font-semibold text-gray-900">
                  {sale.product?.name || "N/A"}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Quantity</p>
                  <p className="text-sm text-gray-900 flex items-center">
                    <Package className="w-4 h-4 mr-1" />
                    {sale.quantity} Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Unit Price</p>
                  <p className="text-sm text-gray-900">
                    {sale.unitPrice ? parseFloat(sale.unitPrice).toFixed(2) : "N/A"} RWF/Kg
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700">Total Amount</p>
                <p className="text-lg font-semibold text-gray-900">
                  {sale.unitPrice ? (parseFloat(sale.unitPrice) * sale.quantity).toFixed(2) : "N/A"} RWF
                </p>
              </div>
              
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Saler</p>
                <p className="text-sm text-gray-900">
                  {sale.saler?.user?.profile?.names || "N/A"}
                </p>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(sale.createdAt).toLocaleDateString()}
                </p>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setSelectedSale(sale);
                      setShowViewModal(true);
                    }}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  
                  <button
                    onClick={() => handleEditClick(sale)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Edit Sale"
                  >
                    <Edit2 size={18} />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteConfirm(sale.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                    title="Delete Sale"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
      
      {totalPages > 1 && (
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
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages} 
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
            </button>
          </div>
        </div>
      )}
    </div>
  );
};