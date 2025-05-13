import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { productService, Product } from "../../services/productService";
import ProductForm from "./ProductForm";
// import ProductStats from "./ProductStats";
import ProductControls from "./ProductControls";
// import ProductFilters from "./ProductFilters";
import ProductEmptyState from "./ProductEmptyState";
import ProductTable from "./ProductTable";
import ProductCards from "./ProductCards";
import ProductViewModal from "./ProductViewModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ProductStats from "./ProductStats";
// import { X } from "lucide-react";

interface ProductFiltersState {
  page: number;
  pageSize: number;
  type?: string;
  includeDeleted: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
}

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(
    null
  );
  const [viewType, setViewType] = useState<"table" | "cards">("table");

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Product;
    direction: "ascending" | "descending";
  } | null>({
    key: "createdAt",
    direction: "descending",
  });

  const [filters, setFilters] = useState<ProductFiltersState>({
    page: 1,
    pageSize: 10,
    includeDeleted: false,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = {
        ...filters,
        search: searchTerm || undefined,
        sortBy: sortConfig?.key,
        sortOrder: sortConfig?.direction === "descending" ? "desc" : "asc",
        includeDeleted: filters.includeDeleted || undefined,
      };

      const { data, pagination: paginationData } =
        await productService.getAllProducts(queryParams);
      setProducts(data);
      setPagination(paginationData);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products. Please try again later.");
      toast.error("Failed to load products");
      setProducts([]);
      setPagination((prev) => ({
        ...prev,
        totalItems: 0,
        totalPages: 1,
      }));
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, sortConfig]);

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
    setFilters((prev) => ({
      ...prev,
      page: 1, // Reset to first page when searching
    }));
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
      toast.success("Product deleted successfully");
      setShowConfirmDelete(null);
      await fetchProducts(); // Refresh the list after delete
    } catch (err: any) {
      console.error("Error deleting product:", err);
      toast.error(err.message || "Failed to delete product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (
    formData: Omit<Product, "id" | "createdAt" | "updatedAt" | "deletedAt">
  ) => {
    setIsSubmitting(true);

    try {
      if (editingProduct) {
        // Fix: Actually call the updateProduct method with editingProduct.id
        await productService.updateProduct(editingProduct.id, formData);
        toast.success("Product updated successfully");
      } else {
        await productService.createProduct(formData);
        toast.success("Product created successfully");
      }

      setShowAddForm(false);
      setEditingProduct(null); // Clear editing state
      await fetchProducts(); // Refresh the list after creating/updating
    } catch (err: any) {
      console.error("Error saving product:", err);
      toast.error(err.message || "Failed to save product");
      throw err; // Rethrow error to be caught by the form component
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const { name, value } = e.target;
  //   setFilters(prev => ({
  //     ...prev,
  //     [name]: value,
  //     page: 1, // Reset to first page when filters change
  //   }));
  // };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;

    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));

    // Scroll to top of the table
    const tableElement = document.getElementById("products-table-container");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const lastUpdated = products.length > 0 
  ? new Date(Math.max(...products.map(p => new Date(p.updatedAt).getTime())))
  : null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 w-full p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Product Management
              </h1>
              <p className="text-gray-600">
                Manage your product inventory and catalog
              </p>
            </div>

            <ProductStats
              loading={loading}
              rawMaterialCount={
                products.filter((p) => p.type === "raw_material").length
              }
              finishedProductCount={
                products.filter((p) => p.type === "finished_product").length
              }
              lastUpdated={lastUpdated}
            />

            <ProductControls
              searchTerm={searchTerm}
              showFilters={showFilters}
              viewType={viewType}
              onSearchChange={handleSearch}
              onSearchSubmit={handleSearchSubmit}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onToggleViewType={() =>
                setViewType((prev) => (prev === "table" ? "cards" : "table"))
              }
              onExportData={() => toast.info("Export feature coming soon!")}
              onRefresh={handleRefresh}
              onAddClick={handleAddClick}
            />
            {/* 
            <ProductFilters
              showFilters={showFilters}
              filters={{
                status: filters.status || "",
                pageSize: filters.pageSize,
              }}
              onFilterChange={handleFilterChange}
              onApplyFilters={() => fetchProducts()}
            /> */}

            {!loading && products.length === 0 && (
              <ProductEmptyState
                loading={loading}
                searchTerm={searchTerm}
                onAddClick={handleAddClick}
              />
            )}

            {viewType === "table" ? (
              <ProductTable
                loading={loading}
                error={error}
                products={products}
                searchTerm={searchTerm}
                sortConfig={sortConfig}
                currentPage={filters.page}
                pageSize={filters.pageSize}
                totalPages={pagination.totalPages}
                onRequestSort={requestSort}
                onPageChange={handlePageChange}
                onViewClick={(product) => {
                  setSelectedProduct(product);
                  setShowViewModal(true);
                }}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteConfirm}
              />
            ) : (
              <ProductCards
                loading={loading}
                error={error}
                products={products}
                searchTerm={searchTerm}
                currentPage={filters.page}
                pageSize={filters.pageSize}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                onViewClick={(product) => {
                  setSelectedProduct(product);
                  setShowViewModal(true);
                }}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteConfirm}
                onRefresh={handleRefresh}
              />
            )}
          </div>
        </main>
      </div>

      {/* Use a single condition to control form visibility */}
      {showAddForm && (
        <ProductForm
          onSubmit={handleFormSubmit}
          onClose={() => setShowAddForm(false)}
          initialData={editingProduct || undefined}
          isSubmitting={isSubmitting}
          onRefresh={fetchProducts}
        />
      )}

      {showViewModal && selectedProduct && (
        <ProductViewModal
          product={selectedProduct}
          onClose={() => setShowViewModal(false)}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showConfirmDelete !== null}
        isSubmitting={isSubmitting}
        onClose={() => setShowConfirmDelete(null)}
        onConfirm={() => {
          if (showConfirmDelete !== null) {
            handleDeleteProduct(showConfirmDelete);
          }
        }}
      />

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
