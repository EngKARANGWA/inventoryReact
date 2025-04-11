import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StockSnapshot {
  id: number;
  productId: number;
  warehouseId: number;
  quantity: string;
  snapshotDate: string;
  lastMovementId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  product?: {
    id: number;
    name: string;
  };
  warehouse?: {
    id: number;
    name: string;
  };
}

interface StockTrendsChartProps {
  filterType?: 'all' | 'product' | 'warehouse';
  filterId?: number;
}

const StockTrendsChart: React.FC<StockTrendsChartProps> = ({ filterType = 'all', filterId }) => {
  const [stockData, setStockData] = useState<StockSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let url = 'https://test.gvibyequ.a2hosted.com/api/stock-snapshot';
        
        if (filterType === 'product' && filterId) {
          url += `/product/${filterId}`;
        } else if (filterType === 'warehouse' && filterId) {
          url += `/warehouse/${filterId}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json();
          if (errorData.message === "No snapshots found for this warehouse") {
            setStockData([]);
            setError('No stock data available for the selected filter');
            return;
          }
          throw new Error(errorData.message || 'Failed to fetch stock data');
        }

        const data = await response.json();
        setStockData(data.data || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stock trends');
        console.error('Error fetching stock data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [filterType, filterId]);

  // Process data for chart
  const chartData = {
    labels: stockData.map(item => new Date(item.snapshotDate).toLocaleDateString()),
    datasets: [
      {
        label: 'Stock Quantity',
        data: stockData.map(item => parseFloat(item.quantity)),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Stock Trends Over Time',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Quantity: ${context.parsed.y.toLocaleString()} Kg`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity (Kg)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (stockData.length === 0) {
    return <div className="text-gray-500 text-center p-4">No stock data available</div>;
  }

  return <Line options={options} data={chartData} />;
};

export default StockTrendsChart;