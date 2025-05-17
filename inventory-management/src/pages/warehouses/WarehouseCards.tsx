import React from "react";
import {
  MapPin,
  Edit2,
  Trash2,
  Users,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import { WarehouseCardsProps } from "./types";

const WarehouseCards: React.FC<WarehouseCardsProps> = ({
  warehouses,
  loading,
  error,
  searchTerm,
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={`card-skeleton-${i}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex justify-between mb-3">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-10 bg-gray-200 rounded w-2/3"></div>
                <div className="h-10 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Error Loading Data
        </h3>
        <p className="text-gray-500 mb-4">{error}</p>
      </div>
    );
  }

  if (warehouses.length === 0) {
    return (
      <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No warehouses found
        </h3>
        <p className="text-gray-500 mb-4">
          {searchTerm
            ? `No warehouses matching "${searchTerm}" were found.`
            : "There are no warehouses to display."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {warehouses.map((warehouse) => (
        <div
          key={warehouse.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                  {warehouse.name}
                </h3>
                <p className="text-xs text-gray-500">
                  Created on {new Date(warehouse.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  warehouse.status
                )}`}
              >
                {getStatusIcon(warehouse.status)}
                <span className="ml-1">{warehouse.status}</span>
              </span>
            </div>

            {warehouse.description && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 line-clamp-2">
                  {warehouse.description}
                </p>
              </div>
            )}

            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700">Location</p>
              <p className="text-sm text-gray-900 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {warehouse.location}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-xs font-medium text-gray-700">Capacity</p>
                <p className="text-sm text-gray-900">
                  {warehouse.capacity.toLocaleString()} KGs
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">Occupancy</p>
                <p className="text-sm text-gray-900">
                  {warehouse.currentOccupancy.toLocaleString()} KGs
                </p>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700">Utilization</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.round(
                      (warehouse.currentOccupancy / warehouse.capacity) * 100
                    )}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-right mt-1">
                {Math.round(
                  (warehouse.currentOccupancy / warehouse.capacity) * 100
                )}
                %
              </p>
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700">Manager</p>
              <p className="text-sm text-gray-900">
                {warehouse.manager ? (
                  <>
                    {warehouse.manager.user?.profile?.names ||
                      warehouse.manager.user?.username}
                    <span className="text-xs text-gray-500 block">
                      {warehouse.manager.user?.email}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-gray-500 italic">
                    No manager assigned
                  </span>
                )}
              </p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <div className="flex space-x-1">
                <button
                  onClick={() => onEditClick(warehouse)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                  title="Edit Warehouse"
                >
                  <Edit2 size={18} />
                </button>

                <button
                  onClick={() =>
                    warehouse.id && onChangeManagerClick(warehouse.id)
                  }
                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-full"
                  title="Change Manager"
                >
                  <Users size={18} />
                </button>

                <button
                  onClick={() => onDeleteConfirm(warehouse.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                  title="Delete Warehouse"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WarehouseCards;