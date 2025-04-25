import React, { useState, useEffect } from "react";
import { 
  X, 
  Package, 
  Truck, 
  FileText, 
  Check, 
  Clock, 
  Info, 
  ArrowDown, 
  ArrowUp, 
  Calendar, 
  User, 
  Box, 
  MapPin,
  RefreshCw
} from "lucide-react";
import { Return, returnsService } from "../../services/returnsService";

interface ReturnViewModalProps {
  returnData: Return;
  onClose: () => void;
}

const ReturnViewModal: React.FC<ReturnViewModalProps> = ({ returnData, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullReturn, setFullReturn] = useState<Return | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'movements'>('info');

  useEffect(() => {
    // Set fullReturn to returnData initially
    setFullReturn(returnData);
    
    // If stockMovements are missing, fetch complete data
    if (!returnData.stockMovements && returnData.id) {
      loadFullReturnData();
    }
  }, [returnData]);

  const loadFullReturnData = async () => {
    if (!returnData.id) {
      setError("Cannot load return details: Missing ID");
      return;
    }
    
    try {
      setLoading(true);
      // Use explicit number conversion to ensure we're sending a valid ID
      const data = await returnsService.getReturnById(Number(returnData.id));
      if (data) {
        console.log("Successfully loaded return data:", data);
        setFullReturn(data);
        setError(null);
      } else {
        setError("Could not retrieve return details");
      }
    } catch (err) {
      console.error("Error loading full return details:", err);
      setError("Failed to load complete return details");
      // Keep using the original returnData as fallback
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (!returnData.id) {
      setError("Cannot refresh: Missing return ID");
      return;
    }
    
    try {
      setLoading(true);
      const refreshedData = await returnsService.getReturnById(Number(returnData.id));
      if (refreshedData) {
        setFullReturn(refreshedData);
        setError(null);
      } else {
        setError("Could not refresh return details");
      }
    } catch (err) {
      console.error("Error refreshing return details:", err);
      setError("Failed to refresh return details");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number | string) => {
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return 'N/A';
    
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(numValue);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status?: string) => {
    if (!status) return "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status?: string) => {
    if (!status) return <Info className="w-4 h-4 text-gray-500" />;
    
    switch (status.toLowerCase()) {
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "cancelled":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  // Use fullReturn if available, otherwise fall back to returnData
  const displayData = fullReturn || returnData;

  // Calculate return percentage
  const returnPercentage = displayData.sale && displayData.returnedQuantity && displayData.sale.quantity
    ? (parseFloat(displayData.returnedQuantity) / parseFloat(displayData.sale.quantity)) * 100
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 sticky top-0 bg-white border-b border-gray-200 z-10">
          <h2 className="text-xl font-semibold text-gray-900 truncate flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-600" />
            Return Details
            {loading && <RefreshCw className="w-4 h-4 ml-2 animate-spin text-blue-500" />}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              disabled={loading || !returnData.id}
              className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              title={returnData.id ? "Refresh data" : "Cannot refresh: Missing ID"}
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-4 my-2 p-3 bg-red-50 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="p-4">
          {/* Header Section with Reference Number and Status */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-4 bg-gray-50 rounded-lg mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Reference Number</p>
              <p className="text-lg font-medium text-blue-600">
                {displayData.referenceNumber}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Created: {formatDate(displayData.createdAt)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  displayData.status
                )}`}
              >
                {getStatusIcon(displayData.status)}
                <span className="ml-1">{displayData.status}</span>
              </span>
              <span className="text-xs text-gray-500">
                Last Updated: {formatDate(displayData.updatedAt)}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-4">
              <button
                className={`py-3 px-1 font-medium text-sm border-b-2 ${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('info')}
              >
                Return Information
              </button>
              <button
                className={`py-3 px-1 font-medium text-sm border-b-2 ${
                  activeTab === 'movements'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('movements')}
              >
                Stock Movements
              </button>
            </nav>
          </div>

          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Return Details */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-blue-500" />
                    Return Information
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Quantity Returned</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatNumber(displayData.returnedQuantity)} KG
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date Processed</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(displayData.date)}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Product</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayData.product?.name || `Product #${displayData.productId}`}
                      </p>
                      {displayData.product?.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {displayData.product.description}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Warehouse</p>
                      <p className="text-sm font-medium text-gray-900 flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                        {displayData.stockMovements?.[0]?.warehouse?.name || `Warehouse #${displayData.warehouseId}` || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded">
                        {displayData.note || "No notes provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sale Details */}
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                    <Truck className="w-4 h-4 mr-2 text-indigo-500" />
                    Original Sale Details
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Sale Reference</p>
                      <p className="text-sm font-medium text-gray-900">
                        {displayData.sale?.referenceNumber || `Sale #${displayData.saleId}`}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Original Quantity</p>
                        <p className="text-sm font-medium text-gray-900">
                          {displayData.sale?.quantity ? formatNumber(displayData.sale.quantity) + ' KG' : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Return Percentage</p>
                        <p className="text-sm font-medium text-gray-900">
                          {returnPercentage !== null ? `${returnPercentage.toFixed(2)}%` : "N/A"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Sale Date</p>
                        <p className="text-sm font-medium text-gray-900">
                          {displayData.sale?.date ? formatDate(displayData.sale.date) : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sale Status</p>
                        <p className="text-sm font-medium text-gray-900">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getStatusColor(displayData.sale?.status)}`}>
                            {displayData.sale?.status || "N/A"}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    {displayData.sale && (
                      <div className="p-2 mt-2 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500 mb-1">Payment Summary</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Total Paid: </span>
                            <span className="font-medium">{displayData.sale.totalPaid ? formatNumber(displayData.sale.totalPaid) : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Total Delivered: </span>
                            <span className="font-medium">{displayData.sale.totalDelivered ? formatNumber(displayData.sale.totalDelivered) : 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'movements' && (
            <div>
              <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                <Box className="w-4 h-4 mr-2 text-blue-500" />
                Stock Movements History
              </h3>

              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-400" />
                  Loading stock movements...
                </div>
              ) : !displayData.stockMovements || displayData.stockMovements.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                  No stock movements found for this return.
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reference
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Warehouse
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {displayData.stockMovements.map((movement) => (
                          <tr key={movement.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-blue-600">
                                {movement.referenceNumber}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {movement.id}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                movement.direction === "in" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {movement.direction === "in" ? (
                                  <ArrowDown className="w-3 h-3 mr-1" />
                                ) : (
                                  <ArrowUp className="w-3 h-3 mr-1" />
                                )}
                                {movement.direction === "in" ? "Inbound" : "Outbound"}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {movement.sourceType}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {movement.warehouse?.name || `Warehouse #${movement.warehouseId}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatNumber(movement.quantity)} KG
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 flex items-center">
                                <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                {formatDate(movement.movementDate)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
                <p className="flex items-center">
                  <Info className="w-4 h-4 mr-1 text-blue-500" />
                  <span>
                    Inbound movements add stock to the warehouse. Outbound movements remove stock from the warehouse.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnViewModal;