import React from "react";
import { Truck } from "lucide-react";
// import { formatNumber } from "../../utils/formatUtils";

interface TransferStatsCardsProps {
  loading: boolean;
  totalTransfers: number;
  completedTransfers: number;
  pendingTransfers: number;
  totalQuantity: number;
}

const TransferStatsCards: React.FC<TransferStatsCardsProps> = ({
  loading,
  totalTransfers,
  // completedTransfers,
  // pendingTransfers,
  // totalQuantity,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 md:gap-6 mb-6 md:mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Total Transfers</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : totalTransfers}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Truck className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
        </div>
        {/* <div className="mt-2 text-xs text-gray-500">
          Total quantity: {loading ? "..." : `${formatNumber(totalQuantity)} Kg`}
        </div> */}
      </div>
      
      {/* <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Completed Transfers</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : completedTransfers}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {loading ? "..." : `${((completedTransfers / totalTransfers) * 100 || 0).toFixed(1)}% of total`}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Pending Transfers</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : pendingTransfers}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {loading ? "..." : `${((pendingTransfers / totalTransfers) * 100 || 0).toFixed(1)}% of total`}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Total Quantity</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : formatNumber(totalQuantity)}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">Quantity in Kg</div>
      </div> */}
    </div>
  );
};

export default TransferStatsCards;