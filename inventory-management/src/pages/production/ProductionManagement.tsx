import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import {
  Search,
  Edit2,
  Trash2,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  Package,
  Factory,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Eye,
  X,
  Banknote,
  XCircle,
} from "lucide-react";
import {
  productionService,
  Production,
  Product,
  Warehouse,
  ProductionCost,
} from "../../services/productionServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

interface FilterParams {
  productId?: string;
  startDate?: string;
  endDate?: string;
}

const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";

const ProductionManagement: React.FC = () => {
  const [productions, setProductions] = useState<Production[]>([]);
  const [totalProductions, setTotalProductions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);
  const [editingProduction, setEditingProduction] = useState<Production | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Production;
    direction: "ascending" | "descending";
  } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<FilterParams>({});

  // Form state
  const [formData, setFormData] = useState({
    productId: "",
    quantityProduced: "",
    warehouseId: "",
    notes: "",
    productionCost: [] as ProductionCost[],
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalProductions / pageSize);

  // Fetch productions on component mount and when page/search/filters change
  useEffect(() => {
    fetchProductions();
  }, [page, pageSize, searchTerm, filters]);

  // Fetch products and warehouses when form is shown or when filters are shown
  useEffect(() => {
    if (showAddForm || showFilters) {
      fetchProducts();
      fetchWarehouses();
    }
  }, [showAddForm, showFilters]);

  const fetchProductions = async () => {
    setLoading(true);
    setError("");
    try {
      const { rows, count } = await productionService.getAllProductions(
        page,
        pageSize,
        searchTerm,
        filters
      );
      setProductions(rows || []);
      setTotalProductions(count);
    } catch (err) {
      console.error("Error fetching productions:", err);
      setError("Failed to fetch productions. Please try again later.");
      toast.error("Failed to load productions");
      setProductions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/products`);
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
  };

  const fetchWarehouses = async () => {
    setLoadingWarehouses(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/warehouse`);
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
  };

  const handleRefresh = () => {
    fetchProductions();
    toast.success("Data refreshed successfully");
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setPage(1);
    fetchProductions();
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
    fetchProductions();
  };

  const handleAddClick = () => {
    setFormData({
      productId: "",
      quantityProduced: "",
      warehouseId: "",
      notes: "",
      productionCost: [],
    });
    setEditingProduction(null);
    setShowAddForm(true);
  };

  const handleEditClick = (production: Production) => {
    setFormData({
      productId: String(production.productId),
      quantityProduced: String(production.quantityProduced),
      warehouseId: production.warehouseId ? String(production.warehouseId) : "",
      notes: production.notes || "",
      productionCost: production.productionCost || [],
    });
    setEditingProduction(production);
    setShowAddForm(true);
  };

  const handleViewClick = (production: Production) => {
    setSelectedProduction(production);
    setShowViewModal(true);
  };

  const handleDeleteProduction = async (productionId: number) => {
    if (
      window.confirm("Are you sure you want to delete this production batch?")
    ) {
      try {
        await productionService.deleteProduction(productionId);
        setProductions(productions.filter((p) => p.id !== productionId));
        toast.success("Production batch deleted successfully");
      } catch (err: any) {
        console.error("Error deleting production:", err);
        toast.error(err.message || "Failed to delete production batch");
      }
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCostItemChange = (
    index: number,
    field: keyof ProductionCost,
    value: string
  ) => {
    const updatedCosts = [...formData.productionCost];
    updatedCosts[index] = {
      ...updatedCosts[index],
      [field]: field === "amount" ? parseFloat(value) || 0 : value,
    };
    setFormData((prev) => ({
      ...prev,
      productionCost: updatedCosts,
    }));
  };

  const addCostItem = () => {
    setFormData((prev) => ({
      ...prev,
      productionCost: [...prev.productionCost, { description: "", amount: 0 }],
    }));
  };

  const removeCostItem = (index: number) => {
    const updatedCosts = formData.productionCost.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      productionCost: updatedCosts,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productionData = {
        productId: Number(formData.productId),
        quantityProduced: parseFloat(formData.quantityProduced),
        warehouseId: formData.warehouseId
          ? Number(formData.warehouseId)
          : undefined,
        notes: formData.notes,
        productionCost: formData.productionCost,
      };

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
      fetchProductions(); // Refresh the table after add/update
    } catch (err: any) {
      console.error("Error saving production:", err);
      toast.error(err.message || "Failed to save production batch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestSort = (key: keyof Production) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig?.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedProductions = React.useMemo(() => {
    let sortableItems = [...productions];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // Handle nested properties
        let aValue, bValue;

        if (sortConfig.key === "product") {
          aValue = a.product?.name || "";
          bValue = b.product?.name || "";
        } else if (sortConfig.key === "date") {
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
        } else {
          aValue = a[sortConfig.key] ?? "";
          bValue = b[sortConfig.key] ?? "";
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
    return sortableItems;
  }, [productions, sortConfig]);

  // Calculate summary data
  const totalQuantity = productions.reduce(
    (sum, p) => sum + Number(p.quantityProduced || 0),
    0
  );

  const totalCost = productions.reduce(
    (sum, p) =>
      sum +
      (p.productionCost?.reduce(
        (costSum, cost) => costSum + (cost.amount || 0),
        0
      ) || 0),
    0
  );

  const calculateProductionCost = (production: Production) => {
    return (
      production.productionCost?.reduce(
        (sum, cost) => sum + (cost.amount || 0),
        0
      ) || 0
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 w-full p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Production (Batch) Management
              </h1>
              <p className="text-gray-600">
                Manage your production batches and inventory
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Production Batches
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalProductions}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Factory className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Quantity Produced
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalQuantity.toLocaleString()} Kg
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Production Cost
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalCost.toLocaleString()}Rwf
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Banknote className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search production batches..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Filter size={18} className="mr-2" />
                    Filters
                    {showFilters ? (
                      <ChevronUp size={18} className="ml-2" />
                    ) : (
                      <ChevronDown size={18} className="ml-2" />
                    )}
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Refresh data"
                  >
                    <RefreshCw size={18} />
                  </button>
                  <button
                    onClick={handleAddClick}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Plus size={18} className="mr-2" />
                    Add Production Batch
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-gray-700">
                      Filters
                    </h3>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <XCircle size={16} />
                      Clear Filters
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product
                      </label>
                      <select
                        name="productId"
                        value={filters.productId || ""}
                        onChange={handleFilterChange}
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={filters.startDate || ""}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={filters.endDate || ""}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={applyFilters}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Productions Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("referenceNumber")}
                      >
                        <div className="flex items-center">
                          Reference
                          {sortConfig?.key === "referenceNumber" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("product")}
                      >
                        <div className="flex items-center">
                          Product
                          {sortConfig?.key === "product" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("quantityProduced")}
                      >
                        <div className="flex items-center">
                          Quantity (Kg)
                          {sortConfig?.key === "quantityProduced" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("date")}
                      >
                        <div className="flex items-center">
                          Date
                          {sortConfig?.key === "date" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Cost
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-4 text-center text-red-600"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : sortedProductions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No production batches found.{" "}
                          {searchTerm && "Try a different search term."}
                        </td>
                      </tr>
                    ) : (
                      sortedProductions.map((production) => (
                        <tr key={production.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-blue-600">
                              {production.referenceNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {production.product?.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {parseFloat(
                                production.quantityProduced.toString()
                              ).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(production.date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 line-clamp-2">
                              {production.notes || "No notes"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {calculateProductionCost(
                                production
                              ).toLocaleString()}{" "}
                              Rwf
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleViewClick(production)}
                              className="text-purple-600 hover:text-purple-900"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleEditClick(production)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteProduction(production.id)
                              }
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalProductions > 0 && (
                <div className="bg-gray-50 px-6 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <span className="text-sm text-gray-700 mr-2">
                      Showing {(page - 1) * pageSize + 1}-
                      {Math.min(page * pageSize, totalProductions)} of{" "}
                      {totalProductions}
                    </span>
                    <select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      {[5, 10, 20, 50].map((size) => (
                        <option key={size} value={size}>
                          Show {size}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={page === 1}
                      className={`px-3 py-1 rounded ${
                        page === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      First
                    </button>
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className={`px-3 py-1 rounded ${
                        page === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      className={`px-3 py-1 rounded ${
                        page >= totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ArrowRight size={16} />
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={page >= totalPages}
                      className={`px-3 py-1 rounded ${
                        page >= totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Last
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Production Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingProduction
                  ? "Edit Production Batch"
                  : "Add New Production Batch"}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product <span className="text-red-500">*</span>
                    </label>
                    {loadingProducts ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : (
                      <select
                        name="productId"
                        value={formData.productId}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={isSubmitting || loadingProducts}
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity Produced (Kg){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantityProduced"
                      value={formData.quantityProduced}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="1"
                      step="0.01"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Warehouse
                    </label>
                    {loadingWarehouses ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : (
                      <select
                        name="warehouseId"
                        value={formData.warehouseId}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      >
                        <option value="">Select a warehouse (optional)</option>
                        {warehouses.map((warehouse) => (
                          <option key={warehouse.id} value={warehouse.id}>
                            {warehouse.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Production Costs
                    </label>
                    <div className="space-y-2">
                      {formData.productionCost.map((cost, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Description"
                            value={cost.description}
                            onChange={(e) =>
                              handleCostItemChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-[80%] flex-1 px-2 py-1 border border-gray-300 rounded-md"
                          />

                          <input
                            type="number"
                            placeholder="Amount"
                            value={cost.amount}
                            onChange={(e) =>
                              handleCostItemChange(
                                index,
                                "amount",
                                e.target.value
                              )
                            }
                            className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                            min="0"
                            step="0.01"
                          />
                          <button
                            type="button"
                            onClick={() => removeCostItem(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addCostItem}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Plus size={16} className="mr-1" />
                        Add Cost
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                      {editingProduction ? "Updating..." : "Creating..."}
                    </>
                  ) : editingProduction ? (
                    "Update Production"
                  ) : (
                    "Create Production"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Production Details Modal */}
      {showViewModal && selectedProduction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Production Batch Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Basic Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Reference Number</p>
                      <p className="text-sm font-medium">
                        {selectedProduction.referenceNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Product</p>
                      <p className="text-sm font-medium">
                        {selectedProduction.product?.name || "N/A"}
                        {selectedProduction.product?.description && (
                          <span className="text-gray-500 block mt-1">
                            {selectedProduction.product.description}
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantity Produced</p>
                      <p className="text-sm font-medium">
                        {parseFloat(
                          selectedProduction.quantityProduced.toString()
                        ).toLocaleString()}{" "}
                        Kg
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Additional Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Production Date</p>
                      <p className="text-sm font-medium">
                        {formatDate(selectedProduction.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Created By</p>
                      <p className="text-sm font-medium">
                        {selectedProduction.createdBy?.username || "Unknown"}
                        {selectedProduction.createdBy?.email && (
                          <span className="text-gray-500 block mt-1">
                            {selectedProduction.createdBy.email}
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="text-sm font-medium">
                        {selectedProduction.notes || "No notes provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Production Costs
                </h3>
                {selectedProduction.productionCost?.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount (Rwf)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedProduction.productionCost.map(
                          (cost, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {cost.description}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                {cost.amount.toLocaleString()}
                              </td>
                            </tr>
                          )
                        )}
                        <tr className="bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            Total
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                            {calculateProductionCost(
                              selectedProduction
                            ).toLocaleString()}{" "}
                            Rwf
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No production costs recorded
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
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
    </div>
  );
};

export default ProductionManagement;
