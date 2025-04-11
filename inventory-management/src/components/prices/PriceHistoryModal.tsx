import React from 'react';
import { X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { PriceHistory } from '../../services/priceService';

interface PriceHistoryModalProps {
  history: PriceHistory[];
  onClose: () => void;
}

const PriceHistoryModal: React.FC<PriceHistoryModalProps> = ({ history, onClose }) => {
  const getIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-500" />;
    }
  };

  const getLabel = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'Price Increased';
      case 'decrease':
        return 'Price Decreased';
      default:
        return 'Price Changed';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Price History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {history.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No price history available</p>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-start space-x-4"
              >
                <div className="flex-shrink-0">
                  {getIcon(item.changeType)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100">
                        {getLabel(item.changeType)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Changed by: {item.changedBy}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(item.changedAt)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="text-gray-600 dark:text-gray-300">From:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ${item.oldPrice.toFixed(2)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">To:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ${item.newPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceHistoryModal; 