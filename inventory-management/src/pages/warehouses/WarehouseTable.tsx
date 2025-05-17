import React from "react";
import {
  Check,
  X,
  Edit2,
  Trash2,
  Users,
  MapPin,
  User,
  AlertCircle,
} from "lucide-react";
import { WarehouseTableProps } from "./types";

const WarehouseTable: React.FC<WarehouseTableProps> = ({
  warehouses,
  loading,
  error,
  sortConfig,
  onRequestSort,
  onEditClick,
  onDeleteConfirm,
  onChangeManagerClick,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Check className="w-4 h-4 text-green-500" />;
      default:
        return <X className="w-4 h-4 text-red-500" />;
    }
  };

  const renderSkeleton = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <tr key={`skeleton-${i}`} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </td>
          <td className="px-6 py-4 text-right">
            <div className="h-6 bg-gray-200 rounded w-16 inline-block"></div>
          </td>
        </tr>
      ));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onRequestSort("name")}
            >
              <div className="flex items-center">
                Name
                {sortConfig?.key === "name" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onRequestSort("location")}
            >
              <div className="flex items-center">
                Location
                {sortConfig?.key === "location" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onRequestSort("capacity")}
            >
              <div className="flex items-center">
                Capacity
                {sortConfig?.key === "capacity" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onRequestSort("currentOccupancy")}
            >
              <div className="flex items-center">
                Occupancy
                {sortConfig?.key === "currentOccupancy" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => onRequestSort("status")}
            >
              <div className="flex items-center">
                Status
                {sortConfig?.key === "status" && (
                  <span className="ml-1">
                    {sortConfig.direction === "ascending" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Manager
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            renderSkeleton()
          ) : error ? (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center">
                <div className="flex items-center justify-center text-red-600">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              </td>
            </tr>
          ) : warehouses.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-4 text-center text-gray-500"
              >
                No warehouses found.
              </td>
            </tr>
          ) : (
            warehouses.map((warehouse) => (
              <tr
                key={warehouse.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {warehouse.name}
                  </div>
                  {warehouse.description && (
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                      {warehouse.description}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <MapPin className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                    <div className="text-sm text-gray-900">
                      {warehouse.location}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {warehouse.capacity.toLocaleString()} KGs
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {warehouse.currentOccupancy.toLocaleString()} /{" "}
                    {warehouse.capacity.toLocaleString()}
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{
                          width: `${
                            (warehouse.currentOccupancy /
                              warehouse.capacity) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(warehouse.status)}
                    <span
                      className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        warehouse.status
                      )}`}
                    >
                      {warehouse.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {warehouse.manager ? (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {warehouse.manager.user?.profile?.names ||
                            warehouse.manager.user?.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          {warehouse.manager.user?.email}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500 italic">
                      No manager assigned
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEditClick(warehouse)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                      title="Edit Warehouse"
                    >
                      <Edit2 size={18} />
                    </button>

                    <button
                      onClick={() =>
                        warehouse.id && onChangeManagerClick(warehouse.id)
                      }
                      className="text-purple-600 hover:text-purple-900 p-1 rounded-full hover:bg-purple-50"
                      title="Change Manager"
                    >
                      <Users size={18} />
                    </button>

                    <button
                      onClick={() => onDeleteConfirm(warehouse.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                      title="Delete Warehouse"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default WarehouseTable;