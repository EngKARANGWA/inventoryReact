import React from "react";
import { X, Package, Activity, Check } from "lucide-react";
import { Product } from "../../services/productService";

interface ProductViewModalProps {
  product: Product;
  onClose: () => void;
}

const ProductViewModal: React.FC<ProductViewModalProps> = ({
  product,
  onClose,
}) => {
  const getStatusIcon = (deletedAt: string | null) => {
    return deletedAt ? 
      <X className="w-4 h-4 text-red-500" /> : 
      <Check className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = (deletedAt: string | null) => {
    return deletedAt ? "Inactive" : "Active";
  };

  const getTypeText = (type: string) => {
    return type === 'raw_material' ? 'Raw Material' : 'Finished Product';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            Product Details - {product.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500">
                ID: {product.id} | Type: {getTypeText(product.type)}
              </p>
            </div>
            <div className="flex items-center">
              <span className="inline-flex items-center text-sm">
                {getStatusIcon(product.deletedAt)}
                <span className="ml-1">{getStatusText(product.deletedAt)}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2 text-blue-500" />
                Product Information
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="text-sm font-medium text-gray-900">
                    {product.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getTypeText(product.type)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm font-medium text-gray-900">
                    {product.description || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-indigo-500" />
                Timeline
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(product.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Updated At</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(product.updatedAt).toLocaleString()}
                  </p>
                </div>
                {product.deletedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Deleted At</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(product.deletedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal;