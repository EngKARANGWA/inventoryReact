import React from "react";
import { Warehouse, Check, HardDrive, Percent } from "lucide-react";
import { WarehouseStatsProps } from "./types";

const WarehouseStats: React.FC<WarehouseStatsProps> = ({ loading, warehouses }) => {
  // Calculate summary statistics
  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter(
    (wh) => wh.status === "active"
  ).length;
  const totalCapacity = warehouses.reduce(
    (sum, wh) => sum + (wh.capacity || 0),
    0
  );
  const totalOccupancy = warehouses.reduce(
    (sum, wh) => sum + (wh.currentOccupancy || 0),
    0
  );
  const utilizationRate =
    totalCapacity > 0 ? Math.round((totalOccupancy / totalCapacity) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Total Warehouses
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                totalWarehouses
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Warehouse className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Active Warehouses
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                activeWarehouses
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {loading ? "..." : `${((activeWarehouses / totalWarehouses) * 100 || 0).toFixed(1)}% of total`}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Total Capacity
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                `${totalCapacity.toLocaleString()} KGs`
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <HardDrive className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Utilization Rate
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                `${utilizationRate}%`
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Percent className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {totalOccupancy.toLocaleString()} KGs occupied
        </div>
      </div>
    </div>
  );
};

export default WarehouseStats;