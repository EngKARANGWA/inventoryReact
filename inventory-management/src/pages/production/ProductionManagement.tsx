// components/production/ProductionManagement.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import {
  Calendar,
  Edit2,
  Eye,
  Factory,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { productionService } from "../../services/productionServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Production, Product, Warehouse, FilterParams } from "./types";
import { formatDate, formatNumber, formatCurrency } from "./utils";
import ProductionForm from "./ProductionForm";
import ProductionViewModal from "./ProductionViewModal";
import ProductionTable from "./ProductionTable";
import ProductionSummaryCards from "./ProductionSummaryCards";
import ProductionActionBar from "./ProductionActionBar";
import api from '../../services/authService'


const ProductionManagement: React.FC = () => {
  const [allProductions, setAllProductions] = useState<Production[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [totalProductions, setTotalProductions] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduction, setSelectedProduction] =
    useState<Production | null>(null);
  const [editingProduction, setEditingProduction] = useState<Production | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(
    null
  );
  const [viewType, setViewType] = useState<"table" | "cards">("table");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>({
    key: "date",
    direction: "descending",
  });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchProductions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { rows } = await productionService.getAllProductions(1, 1000);
      setAllProductions(rows as Production[]);
    } catch (err) {
      console.error("Error fetching productions:", err);
      setError("Failed to fetch productions. Please try again later.");
      toast.error("Failed to load productions");
      setAllProductions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let filteredData = [...allProductions];

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredData = filteredData.filter(production => 
        production.referenceNumber?.toLowerCase().includes(searchLower) ||
        production.product?.name?.toLowerCase().includes(searchLower) ||
        production.notes?.toLowerCase().includes(searchLower) ||
        production.mainProduct?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    if (filters.productId) {
      filteredData = filteredData.filter(production => 
        production.productId === Number(filters.productId)
      );
    }
    if (filters.mainProductId) {
      filteredData = filteredData.filter(production => 
        production.mainProductId === Number(filters.mainProductId)
      );
    }
    if (filters.warehouseId) {
      filteredData = filteredData.filter(production => 
        production.warehouseId === Number(filters.warehouseId)
      );
    }
    if (filters.dateFrom && typeof filters.dateFrom === 'string') {
      const fromDate = new Date(filters.dateFrom);
      filteredData = filteredData.filter(production => 
        new Date(production.date) >= fromDate
      );
    }
    if (filters.dateTo && typeof filters.dateTo === 'string') {
      const toDate = new Date(filters.dateTo);
      filteredData = filteredData.filter(production => 
        new Date(production.date) <= toDate
      );
    }
    if (filters.minEfficiency !== undefined) {
      filteredData = filteredData.filter(production => 
        (production.efficiency || 0) >= Number(filters.minEfficiency)
      );
    }
    if (filters.maxEfficiency !== undefined) {
      filteredData = filteredData.filter(production => 
        (production.efficiency || 0) <= Number(filters.maxEfficiency)
      );
    }
    if (filters.minOutcome !== undefined) {
      filteredData = filteredData.filter(production => 
        (production.totalOutcome || 0) >= Number(filters.minOutcome)
      );
    }
    if (filters.maxOutcome !== undefined) {
      filteredData = filteredData.filter(production => 
        (production.totalOutcome || 0) <= Number(filters.maxOutcome)
      );
    }
    if (filters.hasLoss) {
      filteredData = filteredData.filter(production => 
        (production.productionLoss || 0) > 0
      );
    }
    if (filters.hasByproduct) {
      filteredData = filteredData.filter(production => 
        production.outcomes?.some(outcome => outcome.outcomeType === 'byproduct')
      );
    }

    // Apply sorting
    if (sortConfig) {
      filteredData.sort((a, b) => {
        let aValue: any, bValue: any;

        if (sortConfig.key === "product") {
          aValue = a.product?.name || "";
          bValue = b.product?.name || "";
        } else if (sortConfig.key === "date") {
          aValue = new Date(a.date);
          bValue = new Date(b.date);
        } else if (sortConfig.key === "totalOutcome") {
          aValue = a.totalOutcome || 0;
          bValue = b.totalOutcome || 0;
        } else if (sortConfig.key === "efficiency") {
          aValue = a.efficiency || 0;
          bValue = b.efficiency || 0;
        } else if (sortConfig.key === "mainProduct") {
          aValue = a.mainProduct?.name || "";
          bValue = b.mainProduct?.name || "";
        } else if (sortConfig.key === "usedQuantity") {
          aValue = a.usedQuantity || 0;
          bValue = b.usedQuantity || 0;
        } else {
          aValue = a[sortConfig.key as keyof Production] ?? "";
          bValue = b[sortConfig.key as keyof Production] ?? "";
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setTotalProductions(filteredData.length);

    const startIndex = (page - 1) * pageSize;
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
    setProductions(paginatedData);
  }, [allProductions, searchTerm, filters, sortConfig, page, pageSize]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const response = await api.get('/products', {
        params: { activeOnly: true },
      });
      const productsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setProducts(productsData);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchWarehouses = useCallback(async () => {
    setLoadingWarehouses(true);
    try {
      const response = await api.get('/warehouse', {
        params: { activeOnly: true },
      });
      const warehousesData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setWarehouses(warehousesData);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      toast.error("Failed to load warehouses");
      setWarehouses([]);
    } finally {
      setLoadingWarehouses(false);
    }
  }, []);

  useEffect(() => {
    fetchProductions();
  }, [fetchProductions]);

  useEffect(() => {
    if (showAddForm || showFilters) {
      fetchProducts();
      fetchWarehouses();
    }
  }, [showAddForm, showFilters, fetchProducts, fetchWarehouses]);

  const handleRefresh = useCallback(() => {
    fetchProductions();
    toast.success("Data refreshed successfully");
  }, [fetchProductions]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= Math.ceil(totalProductions / pageSize)) {
        setPage(newPage);
      }
    },
    [totalProductions, pageSize]
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFilters((prev: FilterParams) => ({ ...prev, [name]: value }));
      setPage(1);
    },
    []
  );

  const applyFilters = useCallback(() => {
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const handleAddClick = useCallback(() => {
    setEditingProduction(null);
    setShowAddForm(true);
  }, []);

  const handleEditClick = useCallback((production: Production) => {
    setEditingProduction(production);
    setShowAddForm(true);
  }, []);

  const handleViewClick = useCallback((production: Production) => {
    setSelectedProduction(production);
    setShowViewModal(true);
  }, []);

  const handleDeleteConfirm = (productionId: number) => {
    setShowConfirmDelete(productionId);
  };

  const handleDeleteProduction = useCallback(
    async (productionId: number) => {
      try {
        setIsSubmitting(true);
        await productionService.deleteProduction(productionId);
        setProductions((prev) => prev.filter((p) => p.id !== productionId));
        setTotalProductions(totalProductions - 1);
        toast.success("Production batch deleted successfully");
        setShowConfirmDelete(null);

        if (productions.length === 1 && page > 1) {
          setPage(page - 1);
        }
      } catch (err: any) {
        console.error("Error deleting production:", err);
        toast.error(err.message || "Failed to delete production batch");
      } finally {
        setIsSubmitting(false);
      }
    },
    [productions.length, page, totalProductions]
  );

  const handleFormSubmit = useCallback(
    async (productionData: any) => {
      setIsSubmitting(true);

      try {
        // Ensure production costs have all required fields
        if (productionData.productionCost && productionData.productionCost.length > 0) {
          productionData.productionCost = productionData.productionCost.map((cost: any) => {
            // Ensure all required fields are present and properly formatted
            const quantity = Number(cost.quantity) || 1;
            const unitPrice = Number(cost.unitPrice) || 0;
            const total = Number(cost.total) || (quantity * unitPrice);

            // Validate the values
            if (quantity <= 0) {
              throw new Error("Production cost quantity must be greater than 0");
            }
            if (unitPrice < 0) {
              throw new Error("Production cost unit price cannot be negative");
            }
            if (total < 0) {
              throw new Error("Production cost total cannot be negative");
            }

            return {
              item: cost.item || cost.name || cost.description || "",
              quantity: quantity,
              unitPrice: unitPrice,
              total: total
            };
          });
        }

        if (editingProduction) {
          await productionService.updateProduction(
            editingProduction.id,
            productionData
          );
          toast.success("Production batch updated successfully");
        } else {
          await productionService.createProduction(productionData);
          toast.success("Production batch created successfully");
        }

        setShowAddForm(false);
        fetchProductions();
      } catch (err: any) {
        console.error("Error saving production:", err);
        toast.error(err.message || "Failed to save production batch");
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingProduction, fetchProductions]
  );

  const requestSort = useCallback(
    (key: string) => {
      let direction: "ascending" | "descending" = "ascending";
      if (sortConfig?.key === key && sortConfig.direction === "ascending") {
        direction = "descending";
      }
      setSortConfig({ key, direction });
    },
    [sortConfig]
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 w-full p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <Factory className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600" />
                Production Batch Management
              </h1>
              <p className="text-gray-600">
                Track and manage all production batches, raw material usage, and
                costs
              </p>
            </div>

            <ProductionSummaryCards
              loading={loading}
              totalProductions={totalProductions}
              productions={productions}
            />

            <ProductionActionBar
              searchTerm={searchTerm}
              onSearch={handleSearch}
              onSearchSubmit={handleSearchSubmit}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              viewType={viewType}
              onToggleViewType={() =>
                setViewType((prev) => (prev === "table" ? "cards" : "table"))
              }
              onRefresh={handleRefresh}
              onAddClick={handleAddClick}
              products={products}
              warehouses={warehouses}
              filters={filters}
              onFilterChange={handleFilterChange}
              onApplyFilters={applyFilters}
              onClearFilters={clearFilters}
            />

            {viewType === "table" ? (
              <ProductionTable
                productions={productions}
                loading={loading}
                error={error}
                page={page}
                totalPages={Math.ceil(totalProductions / pageSize)}
                totalProductions={totalProductions}
                pageSize={pageSize}
                sortConfig={sortConfig}
                onPageChange={handlePageChange}
                onSort={requestSort}
                onView={handleViewClick}
                onEdit={handleEditClick}
                onDelete={handleDeleteConfirm}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {loading ? (
                  Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={`loading-${i}`}
                        className="animate-pulse h-48 bg-gray-200 rounded-lg"
                      ></div>
                    ))
                ) : (
                  productions.map((production) => (
                    <div
                      key={production.id}
                      className="bg-white rounded-lg shadow p-4"
                    >
                      {/* Render production card content here */}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductionManagement;