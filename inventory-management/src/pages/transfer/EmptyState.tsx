import React from "react";
import { Plus, Truck } from "lucide-react";

interface EmptyStateProps {
  searchTerm: string;
  onAddClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchTerm, onAddClick }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-6">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Truck className="w-8 h-8 text-blue-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No transfers found</h3>
      <p className="text-gray-500 mb-4 max-w-md mx-auto">
        {searchTerm ? 
          `No transfers matching "${searchTerm}" were found. Try a different search term or clear your filters.` : 
          "There are no transfers to display. Start by creating a new transfer."}
      </p>
      <button
        onClick={onAddClick}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
      >
        <Plus size={16} className="mr-2" />
        Create New Transfer
      </button>
    </div>
  );
};

export default EmptyState;