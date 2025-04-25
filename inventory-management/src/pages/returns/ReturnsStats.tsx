import React from "react";
import { Package, RefreshCw, Box, Truck } from "lucide-react";
import { Return } from "../../services/returnsService";

interface ReturnsStatsProps {
  loading: boolean;
  allReturns: Return[];
}

const ReturnsStats: React.FC<ReturnsStatsProps> = ({ loading, allReturns }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(num);
  };

  const totalReturns = allReturns.length;
  const totalReturnedQuantity = allReturns.reduce(
    (sum, ret) => sum + parseFloat(ret.returnedQuantity || "0"),
    0
  );
  const uniqueProducts = new Set(allReturns.map(ret => ret.productId)).size;
  const uniqueSales = new Set(allReturns.map(ret => ret.saleId)).size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Total Returns
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : totalReturns}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {loading ? "..." : `${uniqueProducts} unique products`}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Total Quantity Returned
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : formatNumber(totalReturnedQuantity)} KG
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
            <RefreshCw className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {loading ? "..." : `${uniqueSales} unique sales`}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Avg. Return Quantity
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : totalReturns > 0 ? formatNumber(totalReturnedQuantity / totalReturns) : 0} KG
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Box className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Per return
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Recent Activity
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : allReturns.length > 0 ? 
                new Date(allReturns[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 
                'None'}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Truck className="w-5 h-5 md:w-6 md:w-6 text-purple-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Last return date
        </div>
      </div>
    </div>
  );
};

export default ReturnsStats;