import React from "react";
import { Filter } from "lucide-react";
import { PurchaseFilterOptions, User } from "../../services/purchaseService";

interface FiltersPanelProps {
  filters: PurchaseFilterOptions;
  users: User[];
  loadingUsers: boolean;
  showFilters: boolean;
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onApplyFilters: () => void;
  onToggleFilters: () => void;
  isMobile: boolean;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  filters,
  users,
  showFilters,
  loadingUsers,
  onFilterChange,
  onApplyFilters,
}) => {
  return (
    <>
      {showFilters && (
        <div
          id="filters-panel"
          className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all"
        >
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Filter size={16} className="mr-2" />
            Filters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate || ""}
                onChange={onFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate || ""}
                onChange={onFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <select
                name="userId"
                value={filters.userId}
                onChange={onFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Suppliers</option>
                <option value="">
                  {loadingUsers ? "Loading suppliers..." : "Select a supplier"}
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.profile?.names || "Unknown Supplier"}
                  </option>
                ))}
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
      )}
    </>
  );
};

export default FiltersPanel;