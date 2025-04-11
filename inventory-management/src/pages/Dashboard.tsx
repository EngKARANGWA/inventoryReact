import React, { useState } from "react";
import { Sidebar } from "../components/ui/sidebar";
import { Header } from "../components/ui/header";
// import { useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Tag,
  Wallet,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowRightLeft,
  Plus,
  ChartArea,
  BanknoteArrowUp,
  Coins,
} from "lucide-react";
import { StockMovementChart } from "../components/ui/StockMovementChart";
import AddPriceModal from "../components/ui/AddPriceModal";
import PriceTrendsChart from "../components/ui/PriceTrendsChart";
import StockTrendsChart from "../components/ui/StockTrendsChart";
import LatestPricesTable from "../components/ui/LatestPricesTable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Sample data for the dashboard
const summaryData = [
  {
    title: "Total Sales",
    value: "FRW 2,450,000",
    icon: ShoppingCart,
    trend: "up",
    change: "+12.5%",
    alertCount: 0,
  },
  {
    title: "Inventory Items",
    value: "1,234",
    icon: Package,
    trend: "up",
    change: "+3.2%",
    alertCount: 5,
  },
  {
    title: "Pending Orders",
    value: "42",
    icon: Tag,
    trend: "down",
    change: "-8.1%",
    alertCount: 0,
  },
  {
    title: "Cash Flow",
    value: "FRW 1,850,000",
    icon: Wallet,
    trend: "up",
    change: "+5.7%",
    alertCount: 2,
  },
];

// Summary card component
const SummaryCard: React.FC<{
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
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
                    ? "text-green-500"
                    : trend === "down"
                    ? "text-red-500"
                    : "text-gray-500"
                }`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="relative">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-3">
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
  // const navigate = useNavigate();
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

  // Fetch products and warehouses for filters
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, warehousesRes] = await Promise.all([
          fetch("https://test.gvibyequ.a2hosted.com/api/products"),
          fetch("https://test.gvibyequ.a2hosted.com/api/warehouse"),
        ]);

        if (!productsRes.ok || !warehousesRes.ok) {
          throw new Error("Failed to fetch filter data");
        }

        const productsData = await productsRes.json();
        const warehousesData = await warehousesRes.json();

        setProducts(productsData);
        setWarehouses(warehousesData);
      } catch (err) {
        console.error("Error fetching filter data:", err);
      }
    };

    fetchData();
  }, []);

  const handlePriceAdded = () => {
    toast.success("Price changed successfully!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header />

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          aria-label="Notification container"
        />
        <main className="flex-1 overflow-x-auto">
          <div className="max-w-7xl mx-auto h-full p-4">
            {/* Add Price Modal */}
            <AddPriceModal
              isOpen={isAddPriceModalOpen}
              onClose={() => setIsAddPriceModalOpen(false)}
              onPriceAdded={handlePriceAdded}
            />

            {/* Enhanced Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Dashboard Overview
              </h1>
              <p className="text-gray-600">
                Welcome back! Here's what's happening in Maize Factory
              </p>
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
                  onClick={() => {
                    /* Handle card click */
                  }}
                />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-6">
              {/* Latest Prices Table */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <Coins className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Latest Prices
                  </h2>
                </div>
                  <button
                    onClick={() => setIsAddPriceModalOpen(true)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Change Prices
                  </button>
                </div>
                <LatestPricesTable />
              </div>

              {/* Price Trends Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <BanknoteArrowUp className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Price Trend
                  </h2>
                </div>
                  <div className="w-64">
                    <select
                      value={priceTrendFilter}
                      onChange={(e) =>
                        setPriceTrendFilter(
                          e.target.value ? Number(e.target.value) : ""
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Products</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <PriceTrendsChart
                  filterProductId={priceTrendFilter || undefined}
                />
              </div>
            </div>

            {/* Stock Movement Analysis Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <ArrowRightLeft className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Stock Movement Analysis
                  </h2>
                </div>
                {/* <div className="flex items-center space-x-2">
                  <Warehouse className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">All Warehouses</span>
                </div> */}
              </div>
              <StockMovementChart
                chartTitle="Stock Movement by Type"
                onFilterChange={(filter) => {
                  console.log("Filter changed:", filter);
                }}
              />
            </div>

            {/* Stock Trends Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <ChartArea className="w-6 h-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Stock Trends
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All</option>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={products.length === 0}
                      >
                        <option value="">Select Product</option>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={warehouses.length === 0}
                      >
                        <option value="">Select Warehouse</option>
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
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
