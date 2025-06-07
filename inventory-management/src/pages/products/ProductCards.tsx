import React from "react";
import {
  Calendar,
  Eye,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Package,
  RefreshCw,
} from "lucide-react";
import { Product } from "../../services/productService";

interface ProductCardsProps {
  loading: boolean;
  error: string | null;
  products: Product[];
  searchTerm: string;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onViewClick: (product: Product) => void;
  onEditClick: (product: Product) => void;
  onDeleteClick: (productId: number) => void;
  onRefresh: () => void;
}

const ProductCards: React.FC<ProductCardsProps> = ({
  loading,
  error,
  products,
  searchTerm,
  currentPage,
  pageSize,
  totalPages,
  onPageChange,
  onViewClick,
  onEditClick,
  onDeleteClick,
  onRefresh,
}) => {
  const getStatusIcon = (deletedAt: string | null) => {
    return deletedAt ? 
      <X className="w-4 h-4 text-red-500" /> : 
      <Check className="w-4 h-4 text-green-500" />;
  };

  const getTypeText = (type: string) => {
    return type === 'raw_material' ? 'Raw Material' : 'Finished Product';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {loading ? (
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
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            <RefreshCw size={16} className="mr-2" /> 
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 
              `No products matching "${searchTerm}" were found.` : 
              "There are no products to display."}
          </p>
        </div>
      ) : (
        products.map((product) => (
          <div 
            key={product.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    ID: {product.id} | {getTypeText(product.type)}
                  </p>
                </div>
                <span className="inline-flex items-center text-xs">
                  {getStatusIcon(product.deletedAt)}
                </span>
              </div>
              
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Description</p>
                <p className="text-sm text-gray-900 line-clamp-3">
                  {product.description || "No description available"}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Created</p>
                  <p className="text-sm text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Updated</p>
                  <p className="text-sm text-gray-900">
                    {new Date(product.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {product.deletedAt
                    ? new Date(product.deletedAt).toLocaleDateString()
                    : "Active"}
                </p>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => onViewClick(product)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  
                  <button
                    onClick={() => onEditClick(product)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                    title="Edit Product"
                  >
                    <Edit2 size={18} />
                  </button>
                  
                  <button
                    onClick={() => onDeleteClick(product.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                    title="Delete Product"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
      
      {products.length > 0 && (
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
              <span className="hidden sm:inline"> • Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, products.length)} of {products.length}</span>
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

export default ProductCards;