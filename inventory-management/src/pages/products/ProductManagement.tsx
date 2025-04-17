import React, { useState, useEffect, useCallback } from "react";
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
  Check,
  X,
  RefreshCw,
  Calendar,
  Eye,
  AlertCircle,
  Download,
  ArrowLeft,
  ArrowRight,
  FileText,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { productService, Product } from "../../services/productService";
import ProductForm from "../../components/products/ProductForm";

interface ProductFilters {
  page: number;
  pageSize: number;
  status: string;
  includeDeleted: boolean;
}

// const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);
  const [viewType, setViewType] = useState<"table" | "cards">("table");

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product;
    direction: "ascending" | "descending";
  } | null>({
    key: "createdAt",
    direction: "descending"
  });

  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    pageSize: 10,
    status: "",
    includeDeleted: false,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const products = await productService.getAllProducts();
      setProducts(products || []);
      setTotalProducts(products.length || 0);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products. Please try again later.");
      toast.error("Failed to load products");
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRefresh = () => {
    fetchProducts();
    toast.info("Products refreshed");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setShowAddForm(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDeleteConfirm = (productId: number) => {
    setShowConfirmDelete(productId);
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      setIsSubmitting(true);
      await productService.deleteProduct(productId);
      setProducts(products.filter((p) => p.id !== productId));
      setTotalProducts(totalProducts - 1);
      toast.success("Product deleted successfully");
      setShowConfirmDelete(null);
    } catch (err: any) {
      console.error("Error deleting product:", err);
      toast.error(err.message || "Failed to delete product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (formData: Omit<Product, "id" | "createdAt" | "updatedAt" | "deletedAt">) => {
    setIsSubmitting(true);

    try {
      if (editingProduct) {
        const updatedProduct = await productService.updateProduct(
          editingProduct.id,
          formData
        );
        setProducts(
          products.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
        );
        toast.success("Product updated successfully");
      } else {
        const newProduct = await productService.createProduct(formData);
        setProducts([newProduct, ...products]);
        setTotalProducts(totalProducts + 1);
        toast.success("Product created successfully");
      }

      setShowAddForm(false);
    } catch (err: any) {
      console.error("Error saving product:", err);
      toast.error(err.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    
    // Scroll to top of the table
    const tableElement = document.getElementById('products-table-container');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const requestSort = (key: keyof Product) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = React.useMemo(() => {
    if (!sortConfig) return products;

    return [...products].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? "";
      const bValue = b[sortConfig.key] ?? "";

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [products, sortConfig]);

  // Filter products based on search term
  const filteredProducts = React.useMemo(() => {
    if (!searchTerm) return sortedProducts;

    return sortedProducts.filter((product) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        product.name.toLowerCase().includes(searchLower) ||
        (product.description?.toLowerCase().includes(searchLower) ?? false)
      );
    });
  }, [sortedProducts, searchTerm]);

  // Calculate summary statistics
  const activeProducts = products.filter(p => !p.deletedAt).length;
  const inactiveProducts = products.filter(p => p.deletedAt).length;
  const lastUpdated = products.length > 0 
    ? new Date(Math.max(...products.map(p => new Date(p.updatedAt).getTime())))
    : null;

  const getStatusIcon = (deletedAt: string | null) => {
    return deletedAt ? 
      <X className="w-4 h-4 text-red-500" /> : 
      <Check className="w-4 h-4 text-green-500" />;
  };

  const getStatusColor = (deletedAt: string | null) => {
    return deletedAt ? 
      "bg-red-100 text-red-800" : 
      "bg-green-100 text-green-800";
  };

  const getStatusText = (deletedAt: string | null) => {
    return deletedAt ? "Inactive" : "Active";
  };

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Function to export data (placeholder)
  const handleExportData = () => {
    toast.info("Data export feature will be implemented soon!");
  };

  // Handle view toggle between table and cards
  const toggleViewType = () => {
    setViewType(prev => prev === "table" ? "cards" : "table");
  };

  // Function to generate skeleton loading state
  const renderSkeleton = () => {
    return Array(5).fill(0).map((_, i) => (
      <tr key={`skeleton-${i}`} className="animate-pulse">
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </td>
        <td className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="h-6 bg-gray-200 rounded w-16 inline-block"></div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 w-full p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <Package className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600" />
                Product Management
              </h1>
              <p className="text-gray-600">
                Manage your product inventory and catalog
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Total Products
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        totalProducts
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {loading ? "..." : `${activeProducts} active`}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Active Products
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        activeProducts
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {loading ? "..." : `${((activeProducts / totalProducts) * 100 || 0).toFixed(1)}% of total`}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Inactive Products
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        inactiveProducts
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {loading ? "..." : `${((inactiveProducts / totalProducts) * 100 || 0).toFixed(1)}% of total`}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-500">
                      Last Updated
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {loading ? (
                        <span className="animate-pulse">...</span>
                      ) : lastUpdated ? (
                        lastUpdated.toLocaleDateString()
                      ) : (
                        "N/A"
                      )}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {lastUpdated && !loading ? lastUpdated.toLocaleTimeString() : ""}
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6 md:mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex-1 w-full max-w-md"
                >
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </form>
                
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    aria-expanded={showFilters}
                    aria-controls="filters-panel"
                  >
                    <Filter size={16} className="mr-1 md:mr-2" />
                    <span>Filters</span>
                    {showFilters ? (
                      <ChevronUp size={16} className="ml-1" />
                    ) : (
                      <ChevronDown size={16} className="ml-1" />
                    )}
                  </button>
                  
                  <button
                    onClick={toggleViewType}
                    className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    title={`Switch to ${viewType === "table" ? "card" : "table"} view`}
                  >
                    <FileText size={16} className="mr-1" />
                    <span>
                      {viewType === "table" ? "Cards" : "Table"}
                    </span>
                  </button>
                  
                  <button
                    onClick={handleExportData}
                    className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    title="Export data"
                  >
                    <Download size={16} className="mr-1" />
                    <span>Export</span>
                  </button>
                  
                  <button
                    onClick={handleRefresh}
                    className="flex items-center px-3 md:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    title="Refresh data"
                  >
                    <RefreshCw size={16} />
                    <span className="sr-only">Refresh</span>
                  </button>
                  
                  <button
                    onClick={handleAddClick}
                    className="flex items-center px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  >
                    <Plus size={16} className="mr-1 md:mr-2" />
                    <span>New Product</span>
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
                    Filters
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Items per page
                      </label>
                      <select
                        name="pageSize"
                        value={filters.pageSize}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={fetchProducts}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Empty State */}
            {!loading && filteredProducts.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  {searchTerm ? 
                    `No products matching "${searchTerm}" were found. Try a different search term or clear your filters.` : 
                    "There are no products to display. Start by creating a new product."}
                </p>
                <button
                  onClick={handleAddClick}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                  <Plus size={16} className="mr-2" />
                  Create New Product
                </button>
              </div>
            )}

            {/* Products Display - Table View */}
            {viewType === "table" && (
              <div 
                id="products-table-container" 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("id")}
                        >
                          <div className="flex items-center">
                            ID
                            {sortConfig?.key === "id" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("name")}
                        >
                          <div className="flex items-center">
                            Name
                            {sortConfig?.key === "name" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("createdAt")}
                        >
                          <div className="flex items-center">
                            Created
                            {sortConfig?.key === "createdAt" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                          onClick={() => requestSort("updatedAt")}
                        >
                          <div className="flex items-center">
                            Status
                            {sortConfig?.key === "updatedAt" && (
                              <span className="ml-1">
                                {sortConfig.direction === "ascending" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        renderSkeleton()
                      ) : error ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-4 text-center"
                          >
                            <div className="flex items-center justify-center text-red-600">
                              <AlertCircle className="w-5 h-5 mr-2" />
                              {error}
                            </div>
                          </td>
                        </tr>
                      ) : filteredProducts.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No products found.{" "}
                            {searchTerm && "Try a different search term."}
                          </td>
                        </tr>
                      ) : (
                        paginatedProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {product.id}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 line-clamp-2">
                                {product.description || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                                <div className="text-sm text-gray-900">
                                  {new Date(product.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(product.deletedAt)}
                                <span
                                  className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                    product.deletedAt
                                  )}`}
                                >
                                  {getStatusText(product.deletedAt)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setShowViewModal(true);
                                  }}
                                  className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                                  title="View Details"
                                >
                                  <Eye size={18} />
                                </button>
                                
                                <button
                                  onClick={() => handleEditClick(product)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                                  title="Edit Product"
                                >
                                  <Edit2 size={18} />
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteConfirm(product.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                  title="Delete Product"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {filteredProducts.length > 0 && (
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <ArrowLeft size={16} className="mr-1" />
                        Previous
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                          currentPage >= totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Next
                        <ArrowRight size={16} className="ml-1" />
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {(currentPage - 1) * pageSize + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(
                              currentPage * pageSize,
                              filteredProducts.length
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {filteredProducts.length}
                          </span>{" "}
                          results
                        </p>
                      </div>
                      <div>
                        <nav
                          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                              currentPage === 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            <span className="sr-only">Previous</span>
                            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                          </button>
                          
                          {/* Page Numbers */}
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    currentPage === pageNum
                                      ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}
                          
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                              currentPage >= totalPages
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            <span className="sr-only">Next</span>
                            <ArrowRight className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Card View */}
            {viewType === "cards" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {loading ? (
                  // Skeleton for card view
                  Array(6).fill(0).map((_, i) => (
                    <div key={`card-skeleton-${i}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
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
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button 
                      onClick={handleRefresh}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      <RefreshCw size={16} className="mr-2" /> 
                      Try Again
                    </button>
                  </div>
                ) : paginatedProducts.length === 0 ? (
                  <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm ? 
                        `No products matching "${searchTerm}" were found.` : 
                        "There are no products to display."}
                    </p>
                  </div>
                ) : (
                  paginatedProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
                    >
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
                              {product.name}
                            </h3>
                            <p className="text-xs text-gray-500">
                              ID: {product.id}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              product.deletedAt
                            )}`}
                          >
                            {getStatusIcon(product.deletedAt)}
                            <span className="ml-1">{getStatusText(product.deletedAt)}</span>
                          </span>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Description</p>
                          <p className="text-sm text-gray-900 line-clamp-3">
                            {product.description || "No description available"}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Created</p>
                            <p className="text-sm text-gray-900">
                              {new Date(product.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Updated</p>
                            <p className="text-sm text-gray-900">
                              {new Date(product.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {product.deletedAt
                              ? new Date(product.deletedAt).toLocaleDateString()
                              : "Active"}
                          </p>
                          
                          <div className="flex space-x-1">
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowViewModal(true);
                              }}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-full"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            
                            <button
                              onClick={() => handleEditClick(product)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full"
                              title="Edit Product"
                            >
                              <Edit2 size={18} />
                            </button>
                            
                            <button
                              onClick={() => handleDeleteConfirm(product.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-full"
                              title="Delete Product"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Card View Pagination */}
                {filteredProducts.length > 0 && (
                  <div className="col-span-full mt-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 flex items-center justify-between">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <ArrowLeft size={16} className="mr-1" />
                        Previous
                      </button>
                      
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages} 
                        <span className="hidden sm:inline"> • Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length}</span>
                      </span>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className={`relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                          currentPage >= totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Next
                        <ArrowRight size={16} className="ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingProduct ? "Edit Product" : "Create New Product"}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <ProductForm
              onSubmit={handleFormSubmit}
              onClose={() => setShowAddForm(false)}
              initialData={editingProduct || undefined}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* View Product Details Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 truncate">
                Product Details - {selectedProduct.name}
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                }}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Product Name and Status */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ID: {selectedProduct.id}
                  </p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedProduct.deletedAt
                    )}`}
                  >
                    {getStatusIcon(selectedProduct.deletedAt)}
                    <span className="ml-1">{getStatusText(selectedProduct.deletedAt)}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-blue-500" />
                    Product Information
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedProduct.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedProduct.description || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <p className="text-sm font-medium text-gray-900">
                        {getStatusText(selectedProduct.deletedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-indigo-500" />
                    Timeline
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Created At</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedProduct.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Updated At</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(selectedProduct.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    {selectedProduct.deletedAt && (
                      <div>
                        <p className="text-sm text-gray-500">Deleted At</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(selectedProduct.deletedAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
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

      {/* Delete Confirmation Modal */}
      {showConfirmDelete !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4 text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-semibold">Confirm Delete</h2>
            </div>
            
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this product? This action cannot be undone.
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
                onClick={() => handleDeleteProduct(showConfirmDelete)}
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
                  "Delete Product"
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

export default ProductManagement;