// components/production/ProductionViewModal.tsx
import React from "react";
import { X, Package, Layers, DollarSign, Info, FileText} from "lucide-react";
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
  const totalMaterialCost =
    production.mainProduct && production.usedQuantity
      ? (production.unitPrice || 0) * production.usedQuantity
      : 0;

  const totalProductionCost = production.productionCost?.reduce(
    (sum, cost) => sum + (cost.cost || cost.amount || cost.price || 0),
    0
  ) || 0;

  const totalCost = totalMaterialCost + totalProductionCost;
  const unitCost = totalCost / production.quantityProduced;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 truncate">
            Production Batch - {production.referenceNumber}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Production Reference and Date */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Reference Number</p>
              <p className="text-lg font-medium text-gray-900">
                {production.referenceNumber}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(production.date)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Production Details */}
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Package className="w-4 h-4 mr-2 text-blue-500" />
                Production Details
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Product</p>
                  <p className="text-sm font-medium text-gray-900">
                    {production.product?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Quantity Produced</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatNumber(production.quantityProduced)} Kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unit Price</p>
                  <p className="text-sm font-medium text-gray-900">
                    {production.unitPrice ? formatCurrency(production.unitPrice) : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Warehouse</p>
                  <p className="text-sm font-medium text-gray-900">
                    {production.warehouse?.name || "N/A"}
                    {production.warehouse?.location && (
                      <span className="text-xs text-gray-500 block">
                        {production.warehouse.location}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Product Details */}
            {production.mainProduct && (
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                  <Layers className="w-4 h-4 mr-2 text-amber-500" />
                  Raw Material Used
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Raw Material</p>
                    <p className="text-sm font-medium text-gray-900">
                      {production.mainProduct.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity Used</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatNumber(production.usedQuantity || 0)} Kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unit Price</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(production.unitPrice || 0)} per Kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Total Material Cost
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(totalMaterialCost)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cost Breakdown */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-green-500" />
              Cost Breakdown
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              {/* Production Costs */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Production Costs
                </p>
                {production.productionCost?.length > 0 ? (
                  <div className="bg-gray-50 rounded-md border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {production.productionCost.map((cost, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {cost.name || cost.description}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                              {formatCurrency(cost.cost || cost.amount || cost.price || 0)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-100">
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            Total Production Costs
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {formatCurrency(totalProductionCost)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 py-2">
                    No additional production costs recorded
                  </p>
                )}
              </div>

              {/* Total Cost */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <p className="text-lg font-medium text-gray-900">
                    Total Production Cost
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(totalCost)}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-500">Cost per Unit</p>
                  <p className="text-sm font-medium text-gray-700">
                    {formatCurrency(unitCost)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {production.notes && (
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                Notes
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {production.notes}
                </p>
              </div>
            </div>
          )}

          {/* Created By */}
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2 text-purple-500" />
              Record Information
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Created By</p>
                <p className="text-sm font-medium text-gray-900">
                  {production.createdBy?.username || "Unknown"}
                  {production.createdBy?.profile?.names && (
                    <span className="text-xs text-gray-500 block">
                      {production.createdBy.profile.names}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Production Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(production.date)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
          >
            Edit Production
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductionViewModal;