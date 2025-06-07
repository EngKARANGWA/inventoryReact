// src/pages/DisposalManagement.tsx
import React, { useState, useEffect, useCallback } from "react";
import {Sidebar} from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  disposalService,
  Disposal,
  DisposalFilterOptions,
  productService,
  warehouseService,
  priceService,
  Price
} from "../../services/disposalService";
import DisposalStats from "./DisposalStats";
import DisposalFilters from "./DisposalFilters";
import DisposalTableView from "./DisposalTableView";
import DisposalCardsView from "./DisposalCardsView";
import DisposalForm from "./DisposalForm";
import DisposalViewModal from "./DisposalViewModal";
import DeleteConfirmation from "./DeleteConfirmation";
import { Package, Plus } from "lucide-react";

const DisposalManagement: React.FC = () => {
  const [disposals, setDisposals] = useState<Disposal[]>([]);
  const [totalDisposals, setTotalDisposals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDisposal, setSelectedDisposal] = useState<Disposal | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDisposal, setEditingDisposal] = useState<Disposal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [viewType, setViewType] = useState<"table" | "cards">("table");
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Disposal;
    direction: "ascending" | "descending";
  } | null>({
    key: "createdAt",
    direction: "descending"
  });

  const [filters, setFilters] = useState<DisposalFilterOptions>({
    page: 1,
    pageSize: 10,
    method: "",
    includeDeleted: false,
  });

  const [formData, setFormData] = useState({
    productId: "",
    warehouseId: "",
    quantity: "",
    method: "damaged",
    note: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [products, setProducts] = useState<{ id: number; name: string }[]>([]);
  const [warehouses, setWarehouses] = useState<
    { id: number; name: string; location: string }[]
  >([]);
  const [prices, setPrices] = useState<Price[]>([]);

  
  const fetchDisposals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, pagination } = await disposalService.getAllDisposals();

      const processedDisposals: Disposal[] = (data || []).map(
        (disposal: any) => ({
          ...disposal,
          quantity: disposal.quantity
            ? parseFloat(disposal.quantity.toString())
            : 0,
        })
      );

      setDisposals(processedDisposals);
      setTotalDisposals(pagination?.total || 0);
    } catch (err) {
      console.error("Error fetching disposals:", err);
      setError("Failed to fetch disposals. Please try again later.");
      toast.error("Failed to load disposals");
      setDisposals([]);
      setTotalDisposals(0);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    fetchDisposals();
  }, [fetchDisposals]);

  useEffect(() => {
    if (showAddForm) {
      fetchDropdownOptions();
    }
  }, [showAddForm]);

  const fetchDropdownOptions = async () => {
    try {
      setLoadingProducts(true);
      setLoadingWarehouses(true);

      const [products, warehouses] = await Promise.all([
        productService.getAllProducts(),
        warehouseService.getAllWarehouses(),
      ]);

      setProducts(
        products.map((product) => ({
          id: product.id,
          name: product.name,
        }))
      );

      setWarehouses(
        warehouses.map((warehouse) => ({
          id: warehouse.id,
          name: warehouse.name,
          location: warehouse.location,
        }))
      );
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      toast.error("Failed to load form options");
    } finally {
      setLoadingProducts(false);
      setLoadingWarehouses(false);
    }
  };

  const fetchPricesForProduct = async (productId: number) => {
    try {
      setLoadingPrices(true);
      const priceData = await priceService.getAveragePriceForProduct(productId);
  
      if (priceData) {
        setPrices([{
          id: 0, // No ID from the average price endpoint
          buyingUnitPrice: priceData.averageUnitPrice,
          sellingUnitPrice: null,
          date: new Date().toISOString(),
          productId: priceData.productId,
        }]);
      } else {
        setPrices([]);
      }
    } catch (error) {
      console.error("Error fetching prices:", error);
      toast.error("Failed to load product prices");
      setPrices([]);
    } finally {
      setLoadingPrices(false);
    }
  };

  const handleRefresh = () => {
    fetchDisposals();
    toast.info("Disposals refreshed");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDisposals();
  };

  const handleAddClick = () => {
    setFormData({
      productId: "",
      warehouseId: "",
      quantity: "",
      method: "damaged",
      note: "",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingDisposal(null);
    setSelectedProduct(null);
    setPrices([]);
    setShowAddForm(true);
  };

  const handleEditClick = (disposal: Disposal) => {
    setFormData({
      productId: String(disposal.productId),
      warehouseId: String(disposal.warehouseId),
      quantity: String(disposal.quantity),
      method: disposal.method,
      note: disposal.note || "",
      date: disposal.date.split("T")[0],
    });
    setEditingDisposal(disposal);
    setSelectedProduct(disposal.productId);

    if (disposal.price) {
      setPrices([
        {
          id: disposal.price.id,
          buyingUnitPrice:
            disposal.price.buyingUnitPrice !== undefined
              ? disposal.price.buyingUnitPrice
              : null,
          sellingUnitPrice:
            disposal.price.sellingUnitPrice !== undefined
              ? disposal.price.sellingUnitPrice
              : null,
          date: disposal.price.date,
          productId: disposal.productId,
        },
      ]);
    } else {
      setPrices([]);
    }

    setShowAddForm(true);
  };

  const handleDeleteConfirm = (disposalId: number) => {
    setShowConfirmDelete(disposalId);
  };

  const handleDeleteDisposal = async (disposalId: number) => {
    try {
      setIsSubmitting(true);
      await disposalService.deleteDisposal(disposalId);
      setDisposals(disposals.filter((d) => d.id !== disposalId));
      setTotalDisposals(totalDisposals - 1);
      toast.success("Disposal deleted successfully");
      setShowConfirmDelete(null);
    } catch (err: any) {
      console.error("Error deleting disposal:", err);
      toast.error(err.message || "Failed to delete disposal");
    } finally {
      setIsSubmitting(false);
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

    if (name === "productId" && value) {
      const productId = Number(value);
      setSelectedProduct(productId);
      fetchPricesForProduct(productId);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const disposalData = {
        productId: Number(formData.productId),
        warehouseId: Number(formData.warehouseId),
        quantity: parseFloat(formData.quantity),
        method: formData.method,
        note: formData.note,
        date: formData.date,
        unitPrice: prices[0]?.buyingUnitPrice || 0,
      };
  
      if (editingDisposal) {
        const updatedDisposal = await disposalService.updateDisposal(
          editingDisposal.id,
          disposalData
        );
        setDisposals(
          disposals.map((d) =>
            d.id === editingDisposal.id ? updatedDisposal : d
          )
        );
        toast.success("Disposal updated successfully");
      } else {
        const newDisposal = await disposalService.createDisposal(disposalData);
        setDisposals([newDisposal, ...disposals]);
        setTotalDisposals(totalDisposals + 1);
        toast.success("Disposal created successfully");
      }
  
      setShowAddForm(false);
    } catch (err: any) {
      console.error("Error saving disposal:", err);
      toast.error(err.message || "Failed to save disposal");
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
    const tableElement = document.getElementById('disposals-table-container');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const requestSort = (key: keyof Disposal) => {
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

  const sortedDisposals = React.useMemo(() => {
    if (!sortConfig) return disposals;

    return [...disposals].sort((a, b) => {
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
  }, [disposals, sortConfig]);

  const filteredDisposals = React.useMemo(() => {
    if (!searchTerm) return sortedDisposals;

    return sortedDisposals.filter((disposal) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        disposal.referenceNumber.toLowerCase().includes(searchLower) ||
        (disposal.product?.name.toLowerCase().includes(searchLower) ||
        (disposal.warehouse?.name.toLowerCase().includes(searchLower)) ||
        disposal.method.toLowerCase().includes(searchLower)
      ));
    });
  }, [sortedDisposals, searchTerm]);

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(totalDisposals / pageSize);
  const paginatedDisposals = filteredDisposals.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportData = () => {
    toast.info("Data export feature will be implemented soon!");
  };

  const toggleViewType = () => {
    setViewType(prev => prev === "table" ? "cards" : "table");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 w-full p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                Disposal Management
              </h1>
              <p className="text-gray-600">
                Track and manage product disposals
              </p>
            </div>

            <DisposalStats 
              loading={loading}
              totalDisposals={totalDisposals}
              disposals={disposals}
            />

            <DisposalFilters 
              searchTerm={searchTerm}
              handleSearch={handleSearch}
              handleSearchSubmit={handleSearchSubmit}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              filters={filters}
              handleFilterChange={handleFilterChange}
              fetchDisposals={fetchDisposals}
              viewType={viewType}
              toggleViewType={toggleViewType}
              handleExportData={handleExportData}
              handleRefresh={handleRefresh}
              handleAddClick={handleAddClick}
            />

            {!loading && filteredDisposals.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No disposals found</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  {searchTerm ? 
                    `No disposals matching "${searchTerm}" were found. Try a different search term or clear your filters.` : 
                    "There are no disposals to display. Start by creating a new disposal."}
                </p>
                <button
                  onClick={handleAddClick}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                  <Plus size={16} className="mr-2" />
                  Create New Disposal
                </button>
              </div>
            )}

            {viewType === "table" ? (
              <DisposalTableView
                loading={loading}
                error={error}
                filteredDisposals={filteredDisposals}
                paginatedDisposals={paginatedDisposals}
                sortConfig={sortConfig}
                requestSort={requestSort}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalDisposals={totalDisposals}
                handlePageChange={handlePageChange}
                setSelectedDisposal={setSelectedDisposal}
                setShowViewModal={setShowViewModal}
                handleEditClick={handleEditClick}
                handleDeleteConfirm={handleDeleteConfirm}
                searchTerm={searchTerm} 
              />
            ) : (
              <DisposalCardsView
                loading={loading}
                error={error}
                searchTerm={searchTerm}
                paginatedDisposals={paginatedDisposals}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                filteredDisposals={filteredDisposals}
                handlePageChange={handlePageChange}
                setSelectedDisposal={setSelectedDisposal}
                setShowViewModal={setShowViewModal}
                handleEditClick={handleEditClick}
                handleDeleteConfirm={handleDeleteConfirm}
                handleRefresh={handleRefresh}
              />
            )}
          </div>
        </main>
      </div>

      {showAddForm && (
        <DisposalForm
          editingDisposal={editingDisposal}
          formData={formData}
          isSubmitting={isSubmitting}
          loadingProducts={loadingProducts}
          loadingWarehouses={loadingWarehouses}
          loadingPrices={loadingPrices}
          products={products}
          warehouses={warehouses}
          prices={prices}
          selectedProduct={selectedProduct}
          handleFormChange={handleFormChange}
          handleFormSubmit={handleFormSubmit}
          setShowAddForm={setShowAddForm}
        />
      )}

      {showViewModal && selectedDisposal && (
        <DisposalViewModal
          selectedDisposal={selectedDisposal}
          setShowViewModal={setShowViewModal}
        />
      )}

      {showConfirmDelete !== null && (
        <DeleteConfirmation
          showConfirmDelete={showConfirmDelete}
          isSubmitting={isSubmitting}
          setShowConfirmDelete={setShowConfirmDelete}
          handleDeleteDisposal={handleDeleteDisposal}
        />
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
      />
    </div>
  );
};

export default DisposalManagement;