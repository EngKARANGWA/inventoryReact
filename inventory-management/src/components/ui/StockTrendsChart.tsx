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
import api from '../../services/authService';

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
  quantity: string;
  snapshotDate: string;
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

const StockTrendsChart: React.FC<StockTrendsChartProps> = ({ 
  filterType = 'all', 
  filterId 
}: StockTrendsChartProps) => {
  const [stockData, setStockData] = useState<StockSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let url = '/stock-snapshot';
        if (filterType === 'product' && filterId) {
          url += `/product/${filterId}`;
        } else if (filterType === 'warehouse' && filterId) {
          url += `/warehouse/${filterId}`;
        }

        const response = await api.get(url);
        const responseData = response.data.data || response.data;
        
        setStockData(Array.isArray(responseData) ? responseData : []);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load stock trends');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockData();
  }, [filterType, filterId]);

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
    return <div className="text-red-500">{error}</div>;
  }

  if (stockData.length === 0) {
    return <div className="text-gray-500">No stock data available</div>;
  }

  return <Line options={options} data={chartData} />;
};

export default StockTrendsChart;