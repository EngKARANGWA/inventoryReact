import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/ui/sidebar";
import { Header } from "../components/ui/header";
import api from '../services/authService';
import {
  ShoppingCart,
  Package,
  Tag,
  Wallet,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowRightLeft,
  ChartArea,
  RefreshCw,
  Filter,
  Clock,
} from "lucide-react";
import { StockMovementChart } from "../components/ui/StockMovementChart";
import AddPriceModal from "../components/ui/AddPriceModal";
import StockTrendsChart from "../components/ui/StockTrendsChart";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";





const SummaryCard: React.FC<{
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  change?: string;
  alertCount?: number;
  onClick?: () => void;
  isLoading?: boolean;
}> = ({ title, value, icon: Icon, trend, change, alertCount = 0, onClick, isLoading }) => {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs md:text-sm font-medium text-gray-500">
            {title}
          </p>
          {isLoading ? (
            <div className="animate-pulse h-8 w-3/4 bg-gray-200 rounded mt-1"></div>
          ) : (
            <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">
              {value}
            </p>
          )}
          {!isLoading && trend && change && (
            <div className="flex items-center mt-2">
              {trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : trend === "down" ? (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              ) : (
                <BarChart3 className="w-4 h-4 text-gray-500 mr-1" />
              )}
              <span
                className={`text-xs font-medium ${
                  trend === "up"
                    ? "text-green-600"
                    : trend === "down"
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {change} from last week
              </span>
            </div>
          )}
        </div>
        <div className="relative">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
          {!isLoading && alertCount > 0 && (
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
  const [isAddPriceModalOpen, setIsAddPriceModalOpen] = useState(false);
  const [priceTrendFilter, setPriceTrendFilter] = useState<number | "">("");
  const [stockFilterType, setStockFilterType] = useState<
    "all" | "product" | "warehouse"
  >("all");
  const [selectedStockProduct, setSelectedStockProduct] = useState<number | "">(
    ""
  );
  const [selectedStockWarehouse, setSelectedStockWarehouse] = useState<
    number | ""
  >("");
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [statsData, setStatsData] = useState<any>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Fetch stats data
  const fetchStatsData = async (startDate?: string, endDate?: string) => {
    try {
      setIsLoading(true);
      let url = '/stats';
      
      // Add date filters if provided
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
  
      const response = await api.get(url);
      setStatsData(response.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching statistics:", err);
      toast.error("Failed to load statistics data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch products and warehouses for filters
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, warehousesRes] = await Promise.all([
          api.get('/products'),
          api.get('/warehouse'),
        ]);
  
        const productsData = productsRes.data;
        const warehousesData = warehousesRes.data;
  
        setProducts(productsData);
        setWarehouses(warehousesData);
        await fetchStatsData();
      } catch (err) {
        console.error("Error fetching filter data:", err);
        toast.error("Failed to load filter data");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [refreshKey]);

  const handlePriceAdded = () => {
    toast.success("Price changed successfully!");
    setRefreshKey((prev) => prev + 1);
  };

  const handleRefresh = () => {
    fetchStatsData(startDate, endDate);
    setRefreshKey((prev) => prev + 1);
    toast.info("Data refreshed");
  };

  

  // Summary data using API stats
  const summaryData = [
    {
      title: "Total Sales",
      value: statsData ? `RWF ${parseFloat(statsData.totalSales).toLocaleString()}` : "Loading...",
      icon: ShoppingCart,
      trend: "up" as const,
      change: "+12.5%",
      alertCount: 0,
    },
    {
      title: "Inventory Value",
      value: statsData ? `RWF ${parseFloat(statsData.totalStockValue).toLocaleString()}` : "Loading...",
      icon: Package,
      trend: "neutral" as const,
      change: "0%",
      alertCount: 5,
    },
    {
      title: "Total Purchases",
      value: statsData ? `RWF ${parseFloat(statsData.totalPurchases).toLocaleString()}` : "Loading...",
      icon: Tag,
      trend: "down" as const,
      change: "-8.1%",
      alertCount: 0,
    },
    {
      title: "Profit/Loss",
      value: statsData ? `RWF ${parseFloat(statsData.profitLoss).toLocaleString()}` : "Loading...",
      icon: Wallet,
      trend: (parseFloat(statsData?.profitLoss || "0") >= 0 ? "up" : "down") as "up" | "down",
      change: parseFloat(statsData?.profitLoss || "0") >= 0 ? "+5.7%" : "-5.7%",
      alertCount: 2,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 w-full p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Add Price Modal */}
            <AddPriceModal
              isOpen={isAddPriceModalOpen}
              onClose={() => setIsAddPriceModalOpen(false)}
              onPriceAdded={handlePriceAdded}
            />

            {/* Enhanced Header */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <ChartArea className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600" />
                Dashboard Overview
              </h1>
              <p className="text-gray-600">
                Welcome back! Here's what's happening in your business
              </p>
            </div>

            {/* Summary Cards with Improved Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {summaryData.map((item, index) => (
                <SummaryCard
                  key={index}
                  title={item.title}
                  value={item.value}
                  icon={item.icon}
                  trend={item.trend}
                  change={item.change}
                  alertCount={item.alertCount}
                  isLoading={isLoading || !statsData}
                />
              ))}
            </div>

            {/* Controls Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-600">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 w-full sm:w-auto">

                  <button
                    onClick={handleRefresh}
                    className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    title="Refresh data"
                  >
                    <RefreshCw size={16} />
                    <span className="sr-only">Refresh</span>
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div
                  id="filters-panel"
                  className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all"
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Filter size={16} className="mr-2" />
                    Dashboard Filters
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => fetchStatsData(startDate, endDate)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        Apply Date Filter
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price Trends Filter
                      </label>
                      <select
                        value={priceTrendFilter}
                        onChange={(e) =>
                          setPriceTrendFilter(
                            e.target.value ? Number(e.target.value) : ""
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={isLoading}
                      >
                        <option value="">All Products</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Trends Filter
                      </label>
                      <select
                        value={stockFilterType}
                        onChange={(e) => {
                          setStockFilterType(
                            e.target.value as "all" | "product" | "warehouse"
                          );
                          setSelectedStockProduct("");
                          setSelectedStockWarehouse("");
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={isLoading}
                      >
                        <option value="all">All Stock</option>
                        <option value="product">By Product</option>
                        <option value="warehouse">By Warehouse</option>
                      </select>
                    </div>

                    {stockFilterType === "product" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Product
                        </label>
                        <select
                          value={selectedStockProduct}
                          onChange={(e) =>
                            setSelectedStockProduct(Number(e.target.value))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          disabled={isLoading || products.length === 0}
                        >
                          <option value="">All Products</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {stockFilterType === "warehouse" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Select Warehouse
                        </label>
                        <select
                          value={selectedStockWarehouse}
                          onChange={(e) =>
                            setSelectedStockWarehouse(Number(e.target.value))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          disabled={isLoading || warehouses.length === 0}
                        >
                          <option value="">All Warehouses</option>
                          {warehouses.map((warehouse) => (
                            <option key={warehouse.id} value={warehouse.id}>
                              {warehouse.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Stock Trends Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <div className="flex items-center">
                  <ChartArea className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Stock Trends
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 w-full sm:w-auto">
                  {/* Filter Type Select */}
                  <div>
                    <select
                      value={stockFilterType}
                      onChange={(e) => {
                        setStockFilterType(
                          e.target.value as "all" | "product" | "warehouse"
                        );
                        setSelectedStockProduct("");
                        setSelectedStockWarehouse("");
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      disabled={isLoading}
                    >
                      <option value="all">All Stock</option>
                      <option value="product">By Product</option>
                      <option value="warehouse">By Warehouse</option>
                    </select>
                  </div>

                  {/* Product Select (conditionally rendered) */}
                  {stockFilterType === "product" && (
                    <div>
                      <select
                        value={selectedStockProduct}
                        onChange={(e) =>
                          setSelectedStockProduct(Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={isLoading || products.length === 0}
                      >
                        <option value="">All Products</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Warehouse Select (conditionally rendered) */}
                  {stockFilterType === "warehouse" && (
                    <div>
                      <select
                        value={selectedStockWarehouse}
                        onChange={(e) =>
                          setSelectedStockWarehouse(Number(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        disabled={isLoading || warehouses.length === 0}
                      >
                        <option value="">All Warehouses</option>
                        {warehouses.map((warehouse) => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

                  <StockTrendsChart
                    filterType={stockFilterType}
                    filterId={
                      stockFilterType === "product"
                        ? selectedStockProduct || undefined
                        : stockFilterType === "warehouse"
                        ? selectedStockWarehouse || undefined
                        : undefined
                    }
                  />
            </div>
            
            {/* Stock Movement Analysis Section */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <ArrowRightLeft className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Stock Movement Analysis
                  </h2>
                </div>
                <div className="text-sm text-gray-500 flex items-center">
                  <RefreshCw className="w-4 h-4 mr-1" />
                  <span>Updated hourly</span>
                </div>
              </div>
              <div className="h-96">
                <StockMovementChart
                  chartTitle="Stock Movement by Type"
                  onFilterChange={(filter) => {
                    console.log("Filter changed:", filter);
                  }}
                />
              </div>
            </div>
        </main>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        aria-label="Notification container"
      />
    </div>
  );
};

export default Dashboard;