import React from "react";
import { Search, Filter, ChevronDown, ChevronUp, Plus, RefreshCw, Download, FileText } from "lucide-react";

interface ControlsBarProps {
  searchTerm: string;
  showFilters: boolean;
  viewType: "table" | "cards";
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onToggleFilters: () => void;
  onToggleView: () => void;
  onRefresh: () => void;
  onExport: () => void;
  onAddClick: () => void;
}

const ControlsBar: React.FC<ControlsBarProps> = ({
  searchTerm,
  showFilters,
  viewType,
  onSearchChange,
  onSearchSubmit,
  onToggleFilters,
  onToggleView,
  onRefresh,
  onExport,
  onAddClick,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <form onSubmit={onSearchSubmit} className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search transfers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={onSearchChange}
          />
        </form>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={onToggleFilters}
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
            onClick={onToggleView}
            className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            title={`Switch to ${viewType === "table" ? "card" : "table"} view`}
          >
            <FileText size={16} className="mr-1" />
            <span>{viewType === "table" ? "Cards" : "Table"}</span>
          </button>
          
          <button
            onClick={onExport}
            className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            title="Export data"
          >
            <Download size={16} className="mr-1" />
            <span>Export</span>
          </button>
          
          <button
            onClick={onRefresh}
            className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            title="Refresh data"
          >
            <RefreshCw size={16} />
            <span className="sr-only">Refresh</span>
          </button>
          
          <button
            onClick={onAddClick}
            className="flex items-center px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          >
            <Plus size={16} className="mr-1 md:mr-2" />
            <span>New Transfer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlsBar;