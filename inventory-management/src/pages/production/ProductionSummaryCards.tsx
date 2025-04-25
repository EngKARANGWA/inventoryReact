import React from "react";
import { Factory, Package, Banknote, Info } from "lucide-react";
import { formatNumber, formatCurrency } from "./utils";

interface ProductionSummaryCardsProps {
  loading: boolean;
  totalProductions: number;
  totalQuantity: number;
  totalCost: number;
}

const ProductionSummaryCards: React.FC<ProductionSummaryCardsProps> = ({
  loading,
  totalProductions,
  totalQuantity,
  totalCost,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {/* Total Batches Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Total Batches
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                totalProductions
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Factory className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Total Produced Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Total Produced
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                `${formatNumber(totalQuantity)} Kg`
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Total Cost Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Total Cost
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                formatCurrency(totalCost)
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Banknote className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Average Cost Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Avg. Cost per Kg
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : totalQuantity > 0 ? (
                formatCurrency(totalCost / totalQuantity)
              ) : (
                "N/A"
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Info className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionSummaryCards;