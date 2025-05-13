import React from "react";
import { Delivery } from "../../services/deliveryService";
import { ArrowDown, ArrowUp, Banknote } from "lucide-react";

interface DeliveryStatsProps {
  loading: boolean;
  totalDeliveries: number;
  deliveries: Delivery[];
}

const DeliveryStats: React.FC<DeliveryStatsProps> = ({
  loading,
  deliveries,
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter for inbound and outbound deliveries
  const inboundDeliveries = deliveries.filter(d => d.direction === "in");
  const outboundDeliveries = deliveries.filter(d => d.direction === "out");

  // Calculate total quantities
  const totalInboundQuantity = inboundDeliveries.reduce(
    (sum, d) => sum + Number(d.quantity || 0), 0
  );
  const totalOutboundQuantity = outboundDeliveries.reduce(
    (sum, d) => sum + Number(d.quantity || 0), 0
  );

  // Calculate total monetary values
  const totalInboundValue = inboundDeliveries.reduce(
    (sum, d) => sum + (Number(d.quantity || 0) * Number(d.unitPrice || 0)), 0
  );
  const totalOutboundValue = outboundDeliveries.reduce(
    (sum, d) => sum + (Number(d.quantity || 0) * Number(d.unitPrice || 0)), 0
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {/* In Deliveries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              In Deliveries
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : inboundDeliveries.length}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <ArrowDown className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Total quantity:{" "}
          {loading ? "..." : `${formatNumber(totalInboundQuantity)} Kg`}
        </div>
      </div>

      {/* Out Deliveries */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Out Deliveries
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : outboundDeliveries.length}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-full flex items-center justify-center">
            <ArrowUp className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Total quantity:{" "}
          {loading ? "..." : `${formatNumber(totalOutboundQuantity)} Kg`}
        </div>
      </div>

      {/* Total In Value */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Total In Value
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : formatCurrency(totalInboundValue)}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Banknote className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          From {inboundDeliveries.length} purchase deliveries
        </div>
      </div>

      {/* Total Out Value */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Total Out Value
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? <span className="animate-pulse">...</span> : formatCurrency(totalOutboundValue)}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Banknote className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          From {outboundDeliveries.length} sale deliveries
        </div>
      </div>
    </div>
  );
};

export default DeliveryStats;