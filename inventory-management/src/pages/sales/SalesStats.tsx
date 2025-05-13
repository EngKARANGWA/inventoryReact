import React from 'react';
import {  Check, Clock, Banknote } from 'lucide-react';

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
  totalPaid,
  totalRevenue,
  formatNumber
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
      {/* Total Sales Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Total revenue</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : `${formatNumber(totalRevenue)} RWF`}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Banknote className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      {/* Paid Amount Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Paid Amount</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : formatNumber(totalPaid)}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {loading ? "..." : `${((totalPaid / totalRevenue) * 100 || 0).toFixed(1)}% of total`}
        </div>
      </div>
      
      {/* Unpaid Amount Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">Unpaid Amount</p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : formatNumber(totalRevenue - totalPaid)}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {loading ? "..." : `${(((totalRevenue - totalPaid) / totalRevenue) * 100 || 0).toFixed(1)}% of total`}
        </div>
      </div>
      
    </div>
  );
};