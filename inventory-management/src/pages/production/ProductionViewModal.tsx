import React from "react";
import {
  X,
  DollarSign,
  FileText,
  Beaker,
  Activity,
  Warehouse,
  Calendar,
  ArrowRight,
  Scale,
  Package2,
  Box,
  TrendingUp,
  TrendingDown,
  Edit2,
} from "lucide-react";
import { Production } from "./types";
import { formatCurrency, formatDate, formatNumber } from "./utils";

interface ProductionViewModalProps {
  production: Production;
  onClose: () => void;
  onEdit: () => void;
}

const ProductionViewModal: React.FC<ProductionViewModalProps> = ({
  production,
  onClose,
  onEdit,
}) => {
  // Calculate costs
  const totalMaterialCost =
    production.mainProduct &&
    production.usedQuantity &&
    production.mainProductUnitCost
      ? production.mainProductUnitCost * production.usedQuantity
      : 0;

  const totalProductionCost =
    production.productionCost?.reduce(
      (sum, cost) =>
        sum + (cost.total || cost.cost || cost.amount || cost.price || 0),
      0
    ) || 0;

  const totalCost = totalMaterialCost + totalProductionCost;

  // Calculate byproduct revenue
  const byproductRevenue =
    production.outcomes?.reduce((sum, outcome) => {
      if (outcome.outcomeType === "byproduct" && outcome.unitPrice) {
        return sum + outcome.quantity * outcome.unitPrice;
      }
      return sum;
    }, 0) || 0;

  const netProductionCost = totalCost - byproductRevenue;
  const unitCost =
    production.totalOutcome > 0
      ? netProductionCost / production.totalOutcome
      : 0;

  // Calculate outcome breakdown
  const outcomeBreakdown = {
    finished: production.totalOutcome || 0,
    byproducts:
      production.outcomes
        ?.filter((o) => o.outcomeType === "byproduct")
        .reduce((sum, o) => sum + o.quantity, 0) || 0,
    losses:
      production.outcomes
        ?.filter((o) => o.outcomeType === "loss")
        .reduce((sum, o) => sum + o.quantity, 0) || 0,
  };

  // const totalOutcomes =
  //   outcomeBreakdown.finished +
  //   outcomeBreakdown.byproducts +
  //   outcomeBreakdown.losses;


const efficiencyMetrics = {
  efficiency: typeof production.efficiency === 'number' ? production.efficiency : 0,
  lossPercentage: production.usedQuantity
    ? (outcomeBreakdown.losses / production.usedQuantity) * 100
    : 0,
  yieldPercentage: production.usedQuantity
    ? (outcomeBreakdown.finished / production.usedQuantity) * 100
    : 0,
};

  // Group stock movements by direction
  const stockMovements = {
    inputs:
      production.stockMovements?.filter((m) => m.direction === "out") || [],
    outputs:
      production.stockMovements?.filter((m) => m.direction === "in") || [],
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 truncate">
              Production Batch - {production.referenceNumber}
            </h2>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(production.date)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Efficiency Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                <h3 className="text-lg font-medium text-blue-900">
                  Efficiency
                </h3>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-900">
                    {efficiencyMetrics.efficiency.toFixed(1)}%
                  </p>
                  <p className="text-sm text-blue-700">Production Efficiency</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-700">
                    Yield: {efficiencyMetrics.yieldPercentage.toFixed(1)}%
                  </p>
                  <p className="text-sm text-red-600">
                    Loss: {efficiencyMetrics.lossPercentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Input/Output Card */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Scale className="w-5 h-5 mr-2 text-green-600" />
                <h3 className="text-lg font-medium text-green-900">
                  Input/Output
                </h3>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-700">Input</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(production.usedQuantity || 0)} kg
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 mt-2" />
                <div>
                  <p className="text-sm text-gray-700">Output</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(production.totalOutcome)} kg
                  </p>
                </div>
              </div>
            </div>

            {/* Cost Card */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                <h3 className="text-lg font-medium text-purple-900">Costs</h3>
              </div>
              <div>
                <p className="text-sm text-gray-700">Net Production Cost</p>
                <p className="text-2xl font-bold text-purple-900">
                  {formatCurrency(netProductionCost)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Unit Cost: {formatCurrency(unitCost)}/kg
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Production Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Beaker className="w-5 h-5 mr-2 text-blue-500" />
                  Production Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Finished Product</p>
                    <p className="text-sm font-medium text-gray-900">
                      {production.product?.name || "N/A"}
                      {production.product?.description && (
                        <span className="text-xs text-gray-500 block mt-1">
                          {production.product.description}
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Main Product</p>
                    <p className="text-sm font-medium text-gray-900">
                      {production.mainProduct?.name || "N/A"}
                      {production.mainProduct?.description && (
                        <span className="text-xs text-gray-500 block mt-1">
                          {production.mainProduct.description}
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Warehouse</p>
                    <p className="text-sm font-medium text-gray-900">
                      {production.warehouse?.name || "N/A"}
                      {production.warehouse?.location && (
                        <span className="text-xs text-gray-500 block mt-1">
                          {production.warehouse.location}
                        </span>
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Created By</p>
                    <p className="text-sm font-medium text-gray-900">
                      {production.createdBy?.profile?.names ||
                        production.createdBy?.username ||
                        "Unknown"}
                      {production.createdBy?.profile?.phoneNumber && (
                        <span className="text-xs text-gray-500 block mt-1">
                          {production.createdBy.profile.phoneNumber}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stock Movements */}
              {(stockMovements.inputs.length > 0 ||
                stockMovements.outputs.length > 0) && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Warehouse className="w-5 h-5 mr-2 text-green-500" />
                    Stock Movements
                  </h3>

                  {/* Inputs */}
                  {stockMovements.inputs.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <TrendingDown className="w-4 h-4 mr-1 text-red-500" />
                        Material Consumption
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Unit Price
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {stockMovements.inputs.map((movement) => (
                              <tr key={movement.id}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                  {movement.product?.name || "N/A"}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {formatNumber(movement.quantity)}{" "}
                                  {movement.product?.unit || "kg"}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {formatCurrency(movement.unitPrice)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                  {formatCurrency(
                                    movement.quantity * movement.unitPrice
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Outputs */}
                  {stockMovements.outputs.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
                        Production Output
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Product
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Unit Price
                              </th>
                              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {stockMovements.outputs.map((movement) => (
                              <tr key={movement.id}>
                                <td className="px-3 py-2 whitespace-nowrap text-sm">
                                  <span
                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      movement.productionOutcome
                                        ?.outcomeType === "byproduct"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {movement.productionOutcome?.outcomeType ===
                                    "byproduct"
                                      ? "Byproduct"
                                      : "Finished"}
                                  </span>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                                  {movement.product?.name ||
                                    movement.productionOutcome?.name ||
                                    "N/A"}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {formatNumber(movement.quantity)}{" "}
                                  {movement.product?.unit || "kg"}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {formatCurrency(movement.unitPrice)}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                                  {formatCurrency(
                                    movement.quantity * movement.unitPrice
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Packaging Summary */}
              {production.packagesSummary &&
                production.packagesSummary.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Package2 className="w-5 h-5 mr-2 text-amber-500" />
                      Packaging Summary
                    </h3>

                    <div className="space-y-3">
                      {production.packagesSummary.map((pkg, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center border-b border-gray-100 pb-2"
                        >
                          <div className="flex items-center">
                            <Box className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {pkg.size || "Standard Package"}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900">
                              {pkg.quantity} ×{" "}
                              {formatNumber(pkg.totalWeight / pkg.quantity)}{" "}
                              {pkg.unit || "kg"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Total: {formatNumber(pkg.totalWeight)}{" "}
                              {pkg.unit || "kg"}
                            </p>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          Total Packaged
                        </p>
                        <p className="text-sm font-bold text-gray-900">
                          {formatNumber(
                            production.packagesSummary.reduce(
                              (sum, pkg) => sum + pkg.totalWeight,
                              0
                            )
                          )}{" "}
                          kg
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Cost Breakdown */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                  Cost Breakdown
                </h3>

                <div className="space-y-4">
                  {/* Material Cost */}
                  {production.mainProduct && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Material Cost
                      </p>
                      <div className="bg-gray-50 rounded p-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-600">
                            {production.mainProduct.name} (
                            {formatNumber(production.usedQuantity || 0)} kg)
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(totalMaterialCost)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>
                            Unit Cost:{" "}
                            {formatCurrency(
                              production.mainProductUnitCost || 0
                            )}
                            /kg
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Production Costs */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Production Costs
                    </p>
                    <div className="space-y-2">
                      {production.productionCost
                        ?.filter(
                          (cost) =>
                            ![
                              "Total Production Cost",
                              "Byproduct Revenue",
                              "Net Production Cost",
                            ].includes(cost.item || "")
                        )
                        .map((cost, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              {cost.item}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(
                                cost.total ||
                                  cost.cost ||
                                  cost.amount ||
                                  cost.price ||
                                  0
                              )}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Byproduct Revenue */}
                  {byproductRevenue > 0 && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-green-700">
                          Byproduct Revenue
                        </span>
                        <span className="text-sm font-bold text-green-700">
                          -{formatCurrency(byproductRevenue)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Total Cost */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        Total Production Cost
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(totalCost)}
                      </span>
                    </div>
                  </div>

                  {/* Net Cost */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-purple-700">
                        Net Production Cost
                      </span>
                      <span className="text-sm font-bold text-purple-700">
                        {formatCurrency(netProductionCost)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Unit Cost</span>
                      <span>{formatCurrency(unitCost)}/kg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {production.notes && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-gray-500" />
                    Notes
                  </h3>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {production.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Production
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionViewModal;
