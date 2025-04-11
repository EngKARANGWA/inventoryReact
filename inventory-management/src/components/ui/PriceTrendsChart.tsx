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

interface PriceData {
  id: number;
  unitPrice: string;
  date: string;
  productId: number;
  product: {
    id: number;
    name: string;
  };
}

interface PriceTrendsChartProps {
  filterProductId?: number;
}

const PriceTrendsChart: React.FC<PriceTrendsChartProps> = ({ filterProductId }) => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let url = 'https://test.gvibyequ.a2hosted.com/api/daily-price';
        if (filterProductId) {
          url += `?productId=${filterProductId}`;
        }

        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch price data');
        }

        const data = await response.json();
        setPriceData(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load price trends');
        console.error('Error fetching price data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriceData();
  }, [filterProductId]);

  // Group data by product
  const products = Array.from(new Set(priceData.map(item => item.productId)))
    .map(id => {
      const product = priceData.find(item => item.productId === id)?.product;
      return { id, name: product?.name || `Product ${id}` };
    });

  // Prepare chart data
  const chartData = {
    labels: Array.from(new Set(priceData.map(item => new Date(item.date).toLocaleDateString()))),
    datasets: products.map(product => {
      const productPrices = priceData.filter(item => item.productId === product.id)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      return {
        label: product.name,
        data: productPrices.map(item => parseFloat(item.unitPrice)),
        borderColor: `hsl(${product.id * 60}, 70%, 50%)`,
        backgroundColor: `hsla(${product.id * 60}, 70%, 50%, 0.5)`,
        tension: 0.1
      };
    })
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Price Trends Over Time',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()} RWF`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Price (RWF)'
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

  if (priceData.length === 0) {
    return <div className="text-gray-500 text-center p-4">No price data available</div>;
  }

  return <Line options={options} data={chartData} />;
};

export default PriceTrendsChart;