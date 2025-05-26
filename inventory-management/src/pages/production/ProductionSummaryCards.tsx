import React from "react";
import {
  Factory,
  Banknote,
  Activity,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "./utils";
import { Production, ProductionCost, ProductionOutcome } from "./types"; // Import your types

interface ProductionSummaryCardsProps {
  loading: boolean;
  totalProductions: number;
  productions?: Production[]; // Use the Production type instead of any[]
}

const ProductionSummaryCards: React.FC<ProductionSummaryCardsProps> = ({
  loading,
  totalProductions,
  productions = [],
}) => {
  // Calculate metrics from productions data
  const metrics = productions.reduce(
    (acc: {
      totalQuantity: number;
      totalInputQuantity: number;
      totalNetCost: number;
      totalLoss: number;
      totalEfficiency: number;
      efficiencyCount: number;
      byproductRevenue: number;
    }, production: Production) => {
      const totalOutcome = production.totalOutcome || 0;
      const usedQuantity = production.usedQuantity || 0;
      const efficiency = production.efficiency
        ? Number(production.efficiency)
        : 0;
      const productionLoss = production.productionLoss || 0;

      // Calculate production cost
      const materialCost =
        production.mainProductUnitCost && production.usedQuantity
          ? production.mainProductUnitCost * production.usedQuantity
          : 0;

      const additionalCosts = (production.productionCost || []).reduce(
        (sum: number, cost: ProductionCost) =>
          sum + (cost.total || cost.cost || cost.amount || cost.price || 0),
        0
      );

      // Calculate byproduct revenue
      const byproductRevenue = (production.outcomes || [])
        .filter(
          (outcome: ProductionOutcome) => outcome.outcomeType === "byproduct" && outcome.unitPrice
        )
        .reduce(
          (sum: number, outcome: ProductionOutcome) => sum + outcome.quantity * (outcome.unitPrice || 0),
          0
        );

      const netCost = materialCost + additionalCosts - byproductRevenue;

      return {
        totalQuantity: acc.totalQuantity + totalOutcome,
        totalInputQuantity: acc.totalInputQuantity + usedQuantity,
        totalNetCost: acc.totalNetCost + netCost,
        totalLoss: acc.totalLoss + productionLoss,
        totalEfficiency:
          acc.totalEfficiency + (efficiency > 0 ? efficiency : 0),
        efficiencyCount: acc.efficiencyCount + (efficiency > 0 ? 1 : 0),
        byproductRevenue: acc.byproductRevenue + byproductRevenue,
      };
    },
    {
      totalQuantity: 0,
      totalInputQuantity: 0,
      totalNetCost: 0,
      totalLoss: 0,
      totalEfficiency: 0,
      efficiencyCount: 0,
      byproductRevenue: 0,
    }
  );

  const averageEfficiency =
    metrics.efficiencyCount > 0
      ? metrics.totalEfficiency / metrics.efficiencyCount
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-3 gap-4 mb-4">
      {/* Total Batches Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md">
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

      {/* Net Production Cost Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Total Production Cost
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                formatCurrency(metrics.totalNetCost)
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Banknote className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Average Efficiency Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Avg. Efficiency
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                `${averageEfficiency.toFixed(1)}%`
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Activity className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Byproduct Revenue Card
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Byproduct Revenue
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                formatCurrency(metrics.byproductRevenue)
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default ProductionSummaryCards;