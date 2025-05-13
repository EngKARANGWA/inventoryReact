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
import axios from "axios";
import { Production, Product, Warehouse, FilterParams } from "./types";
import { formatDate, formatNumber, formatCurrency } from "./utils";
import ProductionForm from "./ProductionForm";
import ProductionViewModal from "./ProductionViewModal";
import ProductionTable from "./ProductionTable";
import ProductionSummaryCards from "./ProductionSummaryCards";
import ProductionActionBar from "./ProductionActionBar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ProductionManagement: React.FC = () => {
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
  const totalPages = Math.ceil(totalProductions / pageSize);

  const fetchProductions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { rows, count } = await productionService.getAllProductions(
        page,
        pageSize,
        searchTerm,
        filters
      );
      setProductions((rows as Production[]) || []);
      setTotalProductions(count || 0);
    } catch (err) {
      console.error("Error fetching productions:", err);
      setError("Failed to fetch productions. Please try again later.");
      toast.error("Failed to load productions");
      setProductions([]);
      setTotalProductions(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, filters]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
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
      const response = await axios.get(`${API_BASE_URL}/warehouse`, {
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
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages]
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProductions();
  };

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFilters((prev: FilterParams) => ({ ...prev, [name]: value }));
    },
    []
  );

  const applyFilters = useCallback(() => {
    setPage(1);
    fetchProductions();
  }, [fetchProductions]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
    fetchProductions();
  }, [fetchProductions]);

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

  const sortedProductions = React.useMemo(() => {
    if (!sortConfig) return productions;

    return [...productions].sort((a, b) => {
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
  }, [productions, sortConfig]);

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
                productions={sortedProductions.slice(
                  (page - 1) * pageSize,
                  page * pageSize
                )}
                loading={loading}
                error={error}
                page={page}
                totalPages={totalPages}
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
                        key={`card-skeleton-${i}`}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse"
                      >
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="flex justify-between mb-3">
                          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                        <div className="flex justify-between">
                          <div className="h-10 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </div>
                    ))
                ) : error ? (
                  <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                    <div className="h-12 w-12 text-red-500 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Error Loading Data
                    </h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                      onClick={handleRefresh}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      <RefreshCw size={16} className="mr-2" />
                      Try Again
                    </button>
                  </div>
                ) : sortedProductions.length === 0 ? (
                  <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                    <div className="h-12 w-12 text-gray-400 mx-auto mb-4"></div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No productions found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm
                        ? `No productions matching "${searchTerm}" were found.`
                        : "There are no productions to display."}
                    </p>
                    <button
                      onClick={handleAddClick}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                    >
                      <Plus size={16} className="mr-2" />
                      Create New Production
                    </button>
                  </div>
                ) : (
                  sortedProductions
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map((production) => (
                      <div
                        key={production.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                                {production.referenceNumber}
                              </h3>
                              <p className="text-xs text-gray-500">
                                Created on {formatDate(production.date)}
                              </p>
                            </div>
                            <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                              {production.product?.name}
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium text-gray-700">
                                Total Outcome
                              </p>
                              <p className="text-lg font-semibold text-gray-900">
                                {formatNumber(production.totalOutcome)} Kg
                              </p>
                            </div>
                            {production.usedQuantity && (
                              <p className="text-xs text-gray-500">
                                Input: {formatNumber(production.usedQuantity)}{" "}
                                Kg
                              </p>
                            )}
                          </div>

                          {/* Efficiency Badge */}
                          {production.efficiency !== null &&
                            production.efficiency !== undefined && (
                              <div className="mb-3">
                                <div
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    Number(production.efficiency) >= 90
                                      ? "bg-green-100 text-green-800"
                                      : Number(production.efficiency) >= 70
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  Efficiency:{" "}
                                  {Number(production.efficiency).toFixed(1)}%
                                </div>
                              </div>
                            )}

                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Unit Cost
                              </p>
                              <p className="text-sm text-gray-900">
                                {production.mainProductUnitCost
                                  ? formatCurrency(
                                      production.mainProductUnitCost
                                    )
                                  : "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Loss
                              </p>
                              <p className="text-sm text-red-600">
                                {production.productionLoss
                                  ? formatNumber(production.productionLoss) +
                                    " Kg"
                                  : "N/A"}
                              </p>
                            </div>
                          </div>

                          {production.mainProduct && (
                            <div className="mb-4">
                              <p className="text-sm font-medium text-gray-700">
                                From Raw Material
                              </p>
                              <p className="text-sm text-gray-900">
                                {production.mainProduct.name}
                              </p>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(production.date)}
                            </p>

                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleViewClick(production)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>

                              <button
                                onClick={() => handleEditClick(production)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>

                              <button
                                onClick={() =>
                                  handleDeleteConfirm(production.id)
                                }
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ProductionForm
        show={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        products={products}
        warehouses={warehouses}
        editingProduction={editingProduction}
        loadingProducts={loadingProducts}
        loadingWarehouses={loadingWarehouses}
      />

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

      {showConfirmDelete !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4 text-red-600">
              <div className="h-6 w-6 mr-2"></div>
              <h2 className="text-xl font-semibold">Confirm Delete</h2>
            </div>

            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this production batch? This action
              cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduction(showConfirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete Production"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default ProductionManagement;
