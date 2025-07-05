import React from "react";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  FileText,
  Download,
  RefreshCw,
} from "lucide-react";

export interface SmallExpenseFilters {
  direction: string;
  payment_method: string;
  dateFrom: string;
  dateTo: string;
  pageSize: number;
}

interface Props {
  searchTerm: string;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  showFilters: boolean;
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>;
  viewType: "table" | "cards";
  toggleViewType: () => void;
  handleExportData: () => void;
  handleRefresh: () => void;
  handleAddClick: () => void;
  filters: SmallExpenseFilters;
  handleFilterChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDateFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SmallExpenseControls: React.FC<Props> = ({
  searchTerm,
  handleSearch,
  handleSearchSubmit,
  showFilters,
  setShowFilters,
  viewType,
  toggleViewType,
  handleExportData,
  handleRefresh,
  handleAddClick,
  filters,
  handleFilterChange,
  handleDateFilterChange,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex-1 w-full max-w-md"
        >
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search expenses..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
        </form>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            aria-expanded={showFilters}
            aria-controls="filters-panel"
          >
            <Filter size={16} className="mr-1 md:mr-2" />
            <span>Filters</span>
            {showFilters ? (
              <ChevronUp size={16} className="ml-1" />
            ) : (
              <ChevronDown size={16} className="ml-1" />
            )}
          </button>

          <button
            onClick={toggleViewType}
            className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            title={`Switch to ${viewType === "table" ? "card" : "table"} view`}
          >
            <FileText size={16} className="mr-1" />
            <span>{viewType === "table" ? "Cards" : "Table"}</span>
          </button>

          <button
            onClick={handleExportData}
            className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            title="Export data"
          >
            <Download size={16} className="mr-1" />
            <span>Export</span>
          </button>

          <button
            onClick={handleRefresh}
            className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            title="Refresh data"
          >
            <RefreshCw size={16} />
            <span className="sr-only">Refresh</span>
          </button>

          <button
            onClick={handleAddClick}
            className="flex items-center px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          >
            <Plus size={16} className="mr-1 md:mr-2" />
            <span>New Expense</span>
          </button>
        </div>
      </div>

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction
              </label>
              <select
                name="direction"
                value={filters.direction}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All</option>
                <option value="in">In</option>
                <option value="out">Out</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                name="payment_method"
                value={filters.payment_method}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All</option>
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="cheque">Cheque</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleDateFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleDateFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmallExpenseControls;
