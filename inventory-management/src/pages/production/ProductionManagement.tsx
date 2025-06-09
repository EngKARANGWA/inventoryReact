// components/production/ProductionManagement.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Eye,
  Edit2,
  Trash2,
  Factory,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { Production, Product, Warehouse, FilterParams } from "./types";
import { formatDate, formatNumber } from "./utils";
import { productionService } from "../../services/productionServices";
import { Header } from "../../components/ui/header";
import { Sidebar } from "../../components/ui/sidebar";

import "react-toastify/dist/ReactToastify.css";
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
    key: "id",
    direction: "descending",
  });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchProductions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching productions...');
      const { rows } = await productionService.getAllProductions(1, 1000);
      console.log('Productions fetched:', rows);
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

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      fetchProductions(),
      fetchProducts(),
      fetchWarehouses()
    ]);
  }, [fetchProductions, fetchProducts, fetchWarehouses]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

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
    console.log('Add button clicked');
    setEditingProduction(null);
    setShowAddForm(true);
  }, []);

  const handleEditClick = useCallback((production: Production) => {
    console.log('Edit button clicked for production:', production);
    setEditingProduction(production);
    setShowAddForm(true);
  }, []);

  const handleViewClick = useCallback((production: Production) => {
    console.log('View button clicked for production:', production);
    setSelectedProduction(production);
    setShowViewModal(true);
  }, []);

  const handleDeleteConfirm = (productionId: number) => {
    console.log('Delete button clicked for production ID:', productionId);
    setShowConfirmDelete(productionId);
  };

  const handleDeleteProduction = useCallback(
    async (productionId: number) => {
      try {
        console.log('Deleting production:', productionId);
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

  const handleViewTypeChange = useCallback(() => {
    console.log('Toggling view type from', viewType, 'to', viewType === 'table' ? 'cards' : 'table');
    setViewType((prev) => (prev === "table" ? "cards" : "table"));
  }, [viewType]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 w-full p-4 md:p-6 overflow-y-auto">
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
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
              onToggleViewType={handleViewTypeChange}
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
                ) : productions.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No production batches found
                  </div>
                ) : (
                  productions.map((production) => (
                    <div
                      key={production.id}
                      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {production.referenceNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(production.date)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewClick(production)}
                            className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleEditClick(production)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(production.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Product:</span>{" "}
                          {production.product?.name || "N/A"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Quantity:</span>{" "}
                          {formatNumber(production.totalOutcome || 0)} kg
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Efficiency:</span>{" "}
                          <span
                            className={`${
                              (production.efficiency || 0) >= 90
                                ? "text-green-600"
                                : (production.efficiency || 0) >= 70
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {formatNumber(production.efficiency || 0)}%
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Add Form Modal */}
            {showAddForm && (
              <ProductionForm
                show={showAddForm}
                onClose={() => setShowAddForm(false)}
                onSubmit={handleFormSubmit}
                products={products}
                warehouses={warehouses}
                editingProduction={editingProduction}
                isSubmitting={isSubmitting}
                loadingProducts={loadingProducts}
                loadingWarehouses={loadingWarehouses}
              />
            )}

            {/* View Modal */}
            {showViewModal && selectedProduction && (
              <ProductionViewModal
                production={selectedProduction}
                onClose={() => setShowViewModal(false)}
                onEdit={() => {
                  setShowViewModal(false);
                  handleEditClick(selectedProduction);
                }}
              />
            )}

            {/* Delete Confirmation Modal */}
            {showConfirmDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Confirm Delete
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this production batch? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowConfirmDelete(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteProduction(showConfirmDelete)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductionManagement;