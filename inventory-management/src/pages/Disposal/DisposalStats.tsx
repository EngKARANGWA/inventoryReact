import React from "react";
import { Package, Recycle } from "lucide-react";

interface DisposalStatsProps {
  loading: boolean;
  totalDisposals: number;
  disposals: any[];
}

const DisposalStats: React.FC<DisposalStatsProps> = ({
  loading,
  totalDisposals,
  disposals,
}) => {
  const totalQuantity = disposals.reduce(
    (sum, d) => sum + (d.quantity || 0),
    0
  );
  
  const totalValue = disposals.reduce((sum, d) => {
    const price =
      d.price?.buyingUnitPrice !== undefined &&
      d.price?.buyingUnitPrice !== null
        ? parseFloat(d.price.buyingUnitPrice.toString())
        : 0;
    return sum + (d.quantity || 0) * price;
  }, 0);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(num);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Total Disposals
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                totalDisposals
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Total Quantity
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                `${formatNumber(totalQuantity)} Kg`
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Total Value
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                `Rwf ${formatNumber(totalValue)}`
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Methods Used
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                new Set(disposals.map((d) => d.method)).size
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Recycle className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisposalStats;