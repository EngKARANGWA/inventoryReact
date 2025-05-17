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
  onFilterChange = () => {},
}) => {
  const [filterType, setFilterType] = useState<"all" | "product" | "warehouse">(
    "all"
  );
  const [selectedProduct, setSelectedProduct] = useState<number | "">("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | "">("");
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [movementsRes, productsRes, warehousesRes] = await Promise.all([
          api.get("/stoke-movements"),
          api.get("/products"),
          api.get("/warehouse"),
        ]);

        const movementsData = Array.isArray(movementsRes.data.data)
          ? movementsRes.data.data
          : Array.isArray(movementsRes.data)
          ? movementsRes.data
          : [];

        const productsData = Array.isArray(productsRes.data.data)
          ? productsRes.data.data
          : Array.isArray(productsRes.data)
          ? productsRes.data
          : [];

        const warehousesData = Array.isArray(warehousesRes.data.data)
          ? warehousesRes.data.data
          : Array.isArray(warehousesRes.data)
          ? warehousesRes.data
          : [];

        setMovements(movementsData);
        setProducts(productsData);
        setWarehouses(warehousesData);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filter = {
      type: filterType,
      id:
        filterType === "product"
          ? selectedProduct || undefined
          : filterType === "warehouse"
          ? selectedWarehouse || undefined
          : undefined,
    };
    onFilterChange(filter);
  }, [filterType, selectedProduct, selectedWarehouse, onFilterChange]);

  const filteredMovements = movements.filter((movement) => {
    if (filterType === "product" && selectedProduct) {
      return movement.product.id === selectedProduct;
    }
    if (filterType === "warehouse" && selectedWarehouse) {
      return movement.warehouse?.id === selectedWarehouse;
    }
    return true;
  });

  const sourceTypes = [...new Set(filteredMovements.map((m) => m.sourceType))];

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
      },
    },
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(
                  e.target.value as "all" | "product" | "warehouse"
                );
                setSelectedProduct("");
                setSelectedWarehouse("");
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isLoading}
            >
              <option value="all">All Movements</option>
              <option value="product">By Product</option>
              <option value="warehouse">By Warehouse</option>
            </select>
          </div>

          {filterType === "product" && (
            <div>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
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

          {filterType === "warehouse" && (
            <div>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Bar options={options} data={barChartData} />
      )}
    </div>
  );
};
