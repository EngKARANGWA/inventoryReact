import React from 'react';
import { ShoppingCart, Check, Clock, DollarSign } from 'lucide-react';

interface SalesStatsProps {
  loading: boolean;
  totalSales: number;
  completedSales: number;
  pendingSales: number;
  totalPaid: number;
  totalRevenue: number;
  formatNumber: (num: number) => string;
}

export const SalesStats: React.FC<SalesStatsProps> = ({
  loading,
  totalSales,
  completedSales,
  pendingSales,
  totalPaid,
  totalRevenue,
  formatNumber
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {/* Total Sales Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Total Sales</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : totalSales}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Total value: {loading ? "..." : `${formatNumber(totalRevenue)} RWF`}
        </div>
      </div>
      
      {/* Completed Sales Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Completed Sales</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : completedSales}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {loading ? "..." : `${((completedSales / totalSales) * 100 || 0).toFixed(1)}% of total`}
        </div>
      </div>
      
      {/* Pending Sales Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Pending Payments</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : pendingSales}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {loading ? "..." : `${((pendingSales / totalSales) * 100 || 0).toFixed(1)}% of total`}
        </div>
      </div>
      
      {/* Total Paid Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Total Paid</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : formatNumber(totalPaid)}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {loading ? "..." : `${((totalPaid / totalRevenue) * 100 || 0).toFixed(1)}% of total`}
        </div>
      </div>
    </div>
  );
};