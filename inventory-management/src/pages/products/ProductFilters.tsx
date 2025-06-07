import React from "react";
import { Filter } from "lucide-react";

interface ProductFiltersProps {
  showFilters: boolean;
  filters: {
    status: string;
    pageSize: number;
  };
  onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onApplyFilters: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  showFilters,
  filters,
  onFilterChange,
  onApplyFilters,
}) => {
  if (!showFilters) return null;

  return (
    <div 
      id="filters-panel"
      className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all"
    >
      <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
        <Filter size={16} className="mr-2" />
        Filters
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            name="status"
            value={filters.status}
            onChange={onFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Items per page
          </label>
          <select
            name="pageSize"
            value={filters.pageSize}
            onChange={onFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={onApplyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;