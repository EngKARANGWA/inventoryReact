import React, { useState, useRef, useEffect } from "react";
import { Search, Filter, ChevronDown, ChevronUp, RefreshCw, Plus } from "lucide-react";

interface UserActionsBarProps {
  searchTerm: string;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onRefresh: () => void;
  onAddUser: (role: string) => void;
  filters: any;
  onFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}

const availableRoles = [
  { id: "blocker", label: "Blocker" },
  { id: "scaleMonitor", label: "Scale Monitor" },
  { id: "saler", label: "Saler" },
  { id: "stockKeeper", label: "Stock Keeper" },
  { id: "client", label: "Client" },
  { id: "driver", label: "Driver" },
  { id: "supplier", label: "Supplier" },
  { id: "productionManager", label: "Production Manager" },
  { id: "cashier", label: "Cashier" },
  { id: "manager", label: "Manager" },
];

const UserActionsBar: React.FC<UserActionsBarProps> = ({
  searchTerm,
  onSearch,
  showFilters,
  onToggleFilters,
  onRefresh,
  onAddUser,
  filters,
  onFilterChange,
  onClearFilters,
  onApplyFilters,
}) => {
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAddDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={onSearch}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleFilters}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter size={18} className="mr-2" />
            Filters
            {showFilters ? (
              <ChevronUp size={18} className="ml-2" />
            ) : (
              <ChevronDown size={18} className="ml-2" />
            )}
          </button>
          <button
            onClick={onRefresh}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            title="Refresh data"
          >
            <RefreshCw size={18} />
          </button>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus size={18} className="mr-2" />
              Add User
              <ChevronDown size={18} className="ml-2" />
            </button>
            {showAddDropdown && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  {availableRoles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => {
                        onAddUser(role.id);
                        setShowAddDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                value={filters.role}
                onChange={onFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={onFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Items per page</label>
              <select
                name="pageSize"
                value={filters.pageSize}
                onChange={onFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClearFilters}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md mr-2"
            >
              Clear Filters
            </button>
            <button
              onClick={onApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActionsBar;