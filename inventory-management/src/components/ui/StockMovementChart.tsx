import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../../services/authService";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Product {
  id: number;
  name: string;
}

interface Warehouse {
  id: number;
  name: string;
}

interface StockMovement {
  id: number;
  quantity: string;
  direction: "in" | "out";
  sourceType: string;
  product: Product;
  warehouse: Warehouse | null;
}

interface StockMovementChartProps {
  chartTitle?: string;
  onFilterChange?: (filter: {
    type: "all" | "product" | "warehouse";
    id?: number;
  }) => void;
}

export const StockMovementChart: React.FC<StockMovementChartProps> = ({
  chartTitle = "Stock Movement Analysis",
  onFilterChange,
}) => {
  const [filterType, setFilterType] = useState<"all" | "product" | "warehouse">("all");
  const [selectedProduct, setSelectedProduct] = useState<number | "">("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | "">("");
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all data in parallel using axios
        const [movementsRes, productsRes, warehousesRes] = await Promise.all([
          api.get("/stoke-movements"),
          api.get("/products"),
          api.get("/warehouse")
        ]);

        // Transform movements data to match our interface
        const transformedMovements = movementsRes.data.data.map((movement: any) => ({
          id: movement.id,
          quantity: movement.quantity,
          direction: movement.direction,
          sourceType: movement.sourceType,
          product: {
            id: movement.product.id,
            name: movement.product.name
          },
          warehouse: movement.warehouse ? {
            id: movement.warehouse.id,
            name: movement.warehouse.name
          } : null
        })).filter((movement: StockMovement) => movement.warehouse !== null);

        setMovements(transformedMovements);
        setProducts(productsRes.data);
        setWarehouses(warehousesRes.data);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load data. Please try again later.');
        setIsLoading(false);
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  // Handle filter changes
  useEffect(() => {
    if (filterType === "product" && selectedProduct) {
      onFilterChange?.({ type: "product", id: selectedProduct });
    } else if (filterType === "warehouse" && selectedWarehouse) {
      onFilterChange?.({ type: "warehouse", id: selectedWarehouse });
    } else {
      onFilterChange?.({ type: "all" });
    }
  }, [filterType, selectedProduct, selectedWarehouse, onFilterChange]);

  // Process data for charts based on current filter
  const filteredMovements = movements.filter((movement) => {
    if (filterType === "product") {
      return selectedProduct ? movement.product.id === selectedProduct : true;
    }
    if (filterType === "warehouse") {
      return selectedWarehouse ? movement.warehouse?.id === selectedWarehouse : true;
    }
    return true;
  });

  const sourceTypes = [...new Set(filteredMovements.map((m) => m.sourceType))];

  // Data for bar chart
  const barChartData = {
    labels: sourceTypes,
    datasets: [
      {
        label: "Incoming",
        data: sourceTypes.map((type) =>
          filteredMovements
            .filter((m) => m.sourceType === type && m.direction === "in")
            .reduce((sum, m) => sum + parseFloat(m.quantity), 0)
        ),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Outgoing",
        data: sourceTypes.map((type) =>
          filteredMovements
            .filter((m) => m.sourceType === type && m.direction === "out")
            .reduce((sum, m) => sum + parseFloat(m.quantity), 0)
        ),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: chartTitle,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y.toLocaleString() + ' Kg';
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Quantity (Kg)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Movement Type',
        },
      },
    },
  };

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="text-red-500 text-center p-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Filter Data</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filter Type Select */}
          <div>
            <select
              id="filterType"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as "all" | "product" | "warehouse");
                setSelectedProduct("");
                setSelectedWarehouse("");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="all">All Movements</option>
              <option value="product">By Product</option>
              <option value="warehouse">By Warehouse</option>
            </select>
          </div>

          {/* Product Select (conditionally rendered) */}
          {filterType === "product" && (
            <div>
              <label htmlFor="productFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Select Product
              </label>
              <select
                id="productFilter"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          {filterType === "warehouse" && (
            <div>
              <label htmlFor="warehouseFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Select Warehouse
              </label>
              <select
                id="warehouseFilter"
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      <div className="mb-2">
        <p className="text-sm text-gray-600">
          {filterType === "all" && "Showing all stock movements by type and direction."}
          {filterType === "product" && selectedProduct && `Showing movements for selected product only.`}
          {filterType === "product" && !selectedProduct && "Showing movements for all products by type."}
          {filterType === "warehouse" && selectedWarehouse && `Showing movements for selected warehouse only.`}
          {filterType === "warehouse" && !selectedWarehouse && "Showing movements for all warehouses by type."}
          {" "}Blue bars represent incoming stock, red bars represent outgoing stock.
        </p>
      </div>

      {isLoading ? (
        <div className="px-6 py-4 text-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      ) : (
        <Bar options={options} data={barChartData} />
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>Total movements displayed: {filteredMovements.length}</p>
        <p>Incoming: {filteredMovements.filter(m => m.direction === "in").length}</p>
        <p>Outgoing: {filteredMovements.filter(m => m.direction === "out").length}</p>
      </div>
    </div>
  );
};