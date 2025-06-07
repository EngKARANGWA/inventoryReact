import React from "react";
import { Package, Calendar, Eye, Edit2, Trash2, RefreshCw, ShoppingCart } from "lucide-react";

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

  // Function to calculate total quantity and amount for a sale
  const calculateSaleTotals = (sale: any) => {
    let totalQuantity = 0;
    let totalAmount = 0;
    
    if (sale.items && sale.items.length > 0) {
      sale.items.forEach((item: any) => {
        totalQuantity += parseFloat(item.quantity || 0);
        totalAmount += parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0);
      });
    }
    
    return { totalQuantity, totalAmount };
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
        sales.map((sale) => {
          const { totalQuantity, totalAmount } = calculateSaleTotals(sale);
          
          return (
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
                  <p className="text-sm font-medium text-gray-700">Products</p>
                  {sale.items && sale.items.length > 0 ? (
                    <>
                      <p className="text-sm font-semibold text-gray-900">
                        {sale.items[0].product?.name}
                        {sale.items.length > 1 && ` + ${sale.items.length - 1} more`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sale.items.length} {sale.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">No items</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Quantity</p>
                    <p className="text-sm text-gray-900 flex items-center">
                      <Package className="w-4 h-4 mr-1" />
                      {totalQuantity.toLocaleString()} Kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Items</p>
                    <p className="text-sm text-gray-900 flex items-center">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      {sale.items?.length || 0}
                    </p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {totalAmount.toLocaleString()} RWF
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
          );
        })
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