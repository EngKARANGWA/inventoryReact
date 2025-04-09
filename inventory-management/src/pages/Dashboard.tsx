import React from 'react';
import { Sidebar } from '../components/ui/sidebar';
import { Header } from '../components/ui/header';
import { 
  ShoppingCart, 
  Package, 
  Tag, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
 // AlertTriangle,
  BarChart3
} from 'lucide-react';

// Sample data for the dashboard
const summaryData = [
  {
    title: 'Total Sales',
    value: 'FRW 2,450,000',
    icon: ShoppingCart,
    trend: 'up',
    change: '+12.5%',
    alertCount: 0
  },
  {
    title: 'Inventory Items',
    value: '1,234',
    icon: Package,
    trend: 'up',
    change: '+3.2%',
    alertCount: 5
  },
  {
    title: 'Pending Orders',
    value: '42',
    icon: Tag,
    trend: 'down',
    change: '-8.1%',
    alertCount: 0
  },
  {
    title: 'Cash Flow',
    value: 'FRW 1,850,000',
    icon: Wallet,
    trend: 'up',
    change: '+5.7%',
    alertCount: 2
  }
];

// Sample data for charts
const donutData = [
  { name: 'Maize Flour', value: 35 },
  { name: 'Corn Grits', value: 25 },
  { name: 'Animal Feed', value: 20 },
  { name: 'Bran', value: 15 },
  { name: 'Other', value: 5 }
];

const histogramData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Sales',
      data: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56],
      backgroundColor: '#2563EB'
    },
    {
      label: 'Orders',
      data: [28, 48, 40, 19, 86, 27, 90, 28, 48, 40, 19, 86],
      backgroundColor: '#F59E0B'
    }
  ]
};

// Simple chart components (these would be replaced with actual chart libraries in production)
const DonutChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="h-64 flex items-center justify-center">
      <div className="relative w-48 h-48">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {data.map((item, index) => {
            const total = data.reduce((sum, d) => sum + d.value, 0);
            const offset = data
              .slice(0, index)
              .reduce((sum, d) => sum + (d.value / total) * 100, 0);
            const percentage = (item.value / total) * 100;
            
            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="40"
                fill={`hsl(${index * 50}, 70%, 50%)`}
                stroke="white"
                strokeWidth="2"
                strokeDasharray={`${percentage} 100`}
                strokeDashoffset={offset}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">Total</div>
            <div className="text-sm text-gray-500">Inventory</div>
          </div>
        </div>
      </div>
      <div className="ml-8">
        {data.map((item, index) => (
          <div key={index} className="flex items-center mb-2">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: `hsl(${index * 50}, 70%, 50%)` }}
            ></div>
            <span className="text-sm text-gray-600">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HistogramChart: React.FC<{ data: any, colors: string[] }> = ({ data, colors }) => {
  const maxValue = Math.max(
    ...data.datasets[0].data,
    ...data.datasets[1].data
  );
  
  return (
    <div className="h-64">
      <div className="h-full flex items-end space-x-1">
        {data.labels.map((label: string, i: number) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="w-full flex justify-center space-x-1">
              {data.datasets.map((dataset: any, j: number) => (
                <div
                  key={j}
                  className="w-1/2"
                  style={{
                    height: `${(dataset.data[i] / maxValue) * 100}%`,
                    backgroundColor: colors[j]
                  }}
                ></div>
              ))}
            </div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Summary card component
const SummaryCard: React.FC<{
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
  alertCount?: number;
  onClick?: () => void;
}> = ({ title, value, icon: Icon, trend, change, alertCount = 0, onClick }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {trend && change && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : trend === 'down' ? (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              ) : (
                <BarChart3 className="w-4 h-4 text-gray-500 mr-1" />
              )}
              <span className={`text-xs font-medium ${
                trend === 'up' ? 'text-green-500' : 
                trend === 'down' ? 'text-red-500' : 
                'text-gray-500'
              }`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="relative">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Icon className="w-6 h-6 text-green-600" />
          </div>
          {alertCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">{alertCount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto h-full">
            {/* Enhanced Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening in Maize Factory</p>
            </div>

            {/* Summary Cards with Improved Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {summaryData.map((item, index) => (
                <SummaryCard 
                  key={index}
                  title={item.title}
                  value={item.value}
                  icon={item.icon}
                  trend={item.trend as "up" | "down" | "neutral" | undefined}
                  change={item.change}
                  alertCount={item.alertCount}
                  onClick={() => {/* Handle card click */}}
                />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Stock Distribution Chart */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Stock Distribution</h2>
                  <select className="text-sm border border-gray-300 rounded-lg px-3 py-2">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last Quarter</option>
                  </select>
                </div>
                <DonutChart data={donutData} />
              </div>

              {/* Monthly Performance Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Sales vs Orders</h2>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Sales</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-600">Orders</span>
                    </div>
                  </div>
                </div>
                <HistogramChart 
                  data={histogramData} 
                  colors={['#2563EB', '#F59E0B']} 
                />
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  {/* Activity items */}
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                        <ShoppingCart className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">New order received</p>
                        <p className="text-sm text-gray-500">Order #1234 - frw 1,230</p>
                      </div>
                      <span className="ml-auto text-sm text-gray-500">2 min ago</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { title: 'New Sale', icon: ShoppingCart, color: 'bg-green-500' },
                    { title: 'Add Product', icon: Package, color: 'bg-green-500' },
                    { title: 'Generate Report', icon: Tag, color: 'bg-amber-500' },
                    { title: 'View Inventory', icon: Wallet, color: 'bg-purple-500' }
                  ].map((action, i) => (
                    <button
                      key={i}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mr-3`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{action.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 