import React from "react";
import { Package, Check } from "lucide-react";

interface ProductStatsProps {
  loading: boolean;
  rawMaterialCount: number;
  finishedProductCount: number;
  lastUpdated?: Date | null;
}

const ProductStats: React.FC<ProductStatsProps> = ({
  loading,
  rawMaterialCount,
  finishedProductCount,
  lastUpdated,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
      {/* Raw Materials Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Raw Materials
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                rawMaterialCount
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
        </div>
        {lastUpdated && !loading && (
          <div className="mt-2 text-xs text-gray-500">
            Updated: {lastUpdated.toLocaleDateString()}
          </div>
        )}
      </div>
      
      {/* Finished Products Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Finished Products
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                finishedProductCount
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          </div>
        </div>
        {lastUpdated && !loading && (
          <div className="mt-2 text-xs text-gray-500">
            Updated: {lastUpdated.toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductStats;