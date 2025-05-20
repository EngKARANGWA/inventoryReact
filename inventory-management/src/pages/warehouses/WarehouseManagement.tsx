/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import api from '../../services/authService';
import {
  Warehouse as WarehouseIcon,
  ArrowLeft,
  ArrowRight,
  Plus,
} from "lucide-react";
import { warehouseService, Warehouse } from "../../services/warehouseServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import WarehouseTable from "./WarehouseTable";
import WarehouseCards from "./WarehouseCards";
import WarehouseForm from "./WarehouseForm";
import ManagerForm from "./ManagerForm";
import DeleteConfirmation from "./DeleteConfirmation";
import WarehouseFilters from "./WarehouseFilters";
import WarehouseControls from "./WarehouseControls";
import { StockKeeper, WarehouseFilters as Filters, SortConfig } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const WarehouseManagement: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
  const [newManagerId, setNewManagerId] = useState<string>("");
  const [isSubmittingManager, setIsSubmittingManager] = useState(false);
  const [stockKeepers, setStockKeepers] = useState<StockKeeper[]>([]);
  const [loadingStockKeepers, setLoadingStockKeepers] = useState(false);
  const [viewType, setViewType] = useState<"table" | "cards">("table");
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);

  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: "createdAt",
    direction: "descending"
  });

  const [filters, setFilters] = useState<Filters>({
    page: 1,
    pageSize: 10,
    status: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    status: "active",
    description: "",
  });

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const warehousesData = await warehouseService.getAllWarehouses();
      setWarehouses(warehousesData);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      setError("Failed to fetch warehouses. Please try again later.");
      toast.error("Failed to load warehouses");
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  useEffect(() => {
    if (showManagerForm) {
      fetchStockKeepers();
    }
  }, [showManagerForm]);

  const fetchStockKeepers = async () => {
    setLoadingStockKeepers(true);
    try {
      const response = await api.get(`${API_BASE_URL}/stockkeeper`);
      setStockKeepers(response.data);
    } catch (err) {
      console.error("Error fetching stock keepers:", err);
      toast.error("Failed to load stock keepers");
    } finally {
      setLoadingStockKeepers(false);
    }
  };

  const handleRefresh = () => {
    fetchWarehouses();
    toast.info("Warehouses refreshed");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWarehouses();
  };

  const handleAddClick = () => {
    setFormData({
      name: "",
      location: "",
      capacity: "",
      status: "active",
      description: "",
    });
    setEditingWarehouse(null);
    setShowAddForm(true);
  };

  const handleEditClick = (warehouse: Warehouse) => {
    setFormData({
      name: warehouse.name,
      location: warehouse.location,
      capacity: String(warehouse.capacity),
      status: warehouse.status,
      description: warehouse.description || "",
    });
    setEditingWarehouse(warehouse);
    setShowAddForm(true);
  };

  const handleDeleteConfirm = (warehouseId: number) => {
    setShowConfirmDelete(warehouseId);
  };

  const handleDeleteWarehouse = async (warehouseId: number) => {
    try {
      setIsSubmitting(true);
      await warehouseService.deleteWarehouse(warehouseId);
      setWarehouses(warehouses.filter((wh) => wh.id !== warehouseId));
      toast.success("Warehouse deleted successfully");
      setShowConfirmDelete(null);
    } catch (err: any) {
      console.error("Error deleting warehouse:", err);
      toast.error(err.message || "Failed to delete warehouse");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeManagerClick = (warehouseId: number) => {
    setSelectedWarehouseId(warehouseId);
    setNewManagerId("");
    setShowManagerForm(true);
  };

  const handleChangeManagerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouseId || isSubmittingManager) return;
    if (!newManagerId) {
      toast.error("Please select a manager");
      return;
    }

    setIsSubmittingManager(true);

    try {
      await warehouseService.changeManager(selectedWarehouseId, {
        newManagerId: Number(newManagerId),
      });
      toast.success("Manager changed successfully");
      fetchWarehouses();
      setShowManagerForm(false);
      setNewManagerId("");
    } catch (err: any) {
      console.error("Error changing manager:", err);
      toast.error(err.message || "Failed to change manager");
    } finally {
      setIsSubmittingManager(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const warehouseData = {
        ...formData,
        capacity: Number(formData.capacity),
        status: formData.status as "active" | "inactive",
        description: formData.description,
      };

      if (editingWarehouse) {
        const updatedWarehouse = await warehouseService.updateWarehouse(
          editingWarehouse.id,
          warehouseData
        );
        setWarehouses(
          warehouses.map((wh) =>
            wh.id === editingWarehouse.id ? updatedWarehouse : wh
          )
        );
        toast.success("Warehouse updated successfully");
      } else {
        const newWarehouse = await warehouseService.createWarehouse(
          warehouseData
        );
        setWarehouses([newWarehouse, ...warehouses]);
        toast.success("Warehouse created successfully");
      }

      setShowAddForm(false);
    } catch (err: any) {
      console.error("Error saving warehouse:", err);
      toast.error(err.message || "Failed to save warehouse");
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
    
    const tableElement = document.getElementById('warehouses-table-container');
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const requestSort = (key: keyof Warehouse) => {
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

  const sortedWarehouses = React.useMemo(() => {
    if (!sortConfig) return warehouses;

    return [...warehouses].sort((a, b) => {
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
  }, [warehouses, sortConfig]);

  const filteredWarehouses = React.useMemo(() => {
    if (!searchTerm) return sortedWarehouses;

    const searchLower = searchTerm.toLowerCase();
    return sortedWarehouses.filter((warehouse) => {
      return (
        warehouse.name.toLowerCase().includes(searchLower) ||
        warehouse.location.toLowerCase().includes(searchLower) ||
        warehouse.capacity.toString().includes(searchTerm) ||
        warehouse.currentOccupancy.toString().includes(searchTerm) ||
        warehouse.status.toLowerCase().includes(searchLower) ||
        (warehouse.manager?.user?.username || "").toLowerCase().includes(searchLower) ||
        (warehouse.description || "").toLowerCase().includes(searchLower)
      );
    });
  }, [sortedWarehouses, searchTerm]);

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(filteredWarehouses.length / pageSize);
  const paginatedWarehouses = filteredWarehouses.slice(
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <WarehouseIcon className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600" />
                Warehouse Management
              </h1>
              <p className="text-gray-600">
                Manage your warehouses and inventory locations
              </p>
            </div>

            <WarehouseControls
              searchTerm={searchTerm}
              showFilters={showFilters}
              viewType={viewType}
              onSearch={handleSearch}
              onSearchSubmit={handleSearchSubmit}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onToggleViewType={toggleViewType}
              onExportData={handleExportData}
              onRefresh={handleRefresh}
              onAddClick={handleAddClick}
            />

            {showFilters && (
              <WarehouseFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onApplyFilters={fetchWarehouses}
              />
            )}

            {!loading && filteredWarehouses.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <WarehouseIcon className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No warehouses found</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  {searchTerm ? 
                    `No warehouses matching "${searchTerm}" were found. Try a different search term or clear your filters.` : 
                    "There are no warehouses to display. Start by creating a new warehouse."}
                </p>
                <button
                  onClick={handleAddClick}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                  <Plus size={16} className="mr-2" />
                  Create New Warehouse
                </button>
              </div>
            )}

            {viewType === "table" ? (
              <div 
                id="warehouses-table-container" 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <WarehouseTable
                  warehouses={paginatedWarehouses}
                  loading={loading}
                  error={error}
                  sortConfig={sortConfig}
                  onRequestSort={requestSort}
                  onEditClick={handleEditClick}
                  onDeleteConfirm={handleDeleteConfirm}
                  onChangeManagerClick={handleChangeManagerClick}
                />

                {filteredWarehouses.length > 0 && (
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
                              filteredWarehouses.length
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {filteredWarehouses.length}
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
            ) : (
              <>
                <WarehouseCards
                  warehouses={paginatedWarehouses}
                  loading={loading}
                  error={error}
                  searchTerm={searchTerm}
                  onEditClick={handleEditClick}
                  onDeleteConfirm={handleDeleteConfirm}
                  onChangeManagerClick={handleChangeManagerClick}
                />
                
                {filteredWarehouses.length > 0 && (
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
                        <span className="hidden sm:inline"> • Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredWarehouses.length)} of {filteredWarehouses.length}</span>
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
              </>
            )}
          </div>
        </main>
      </div>

      {showAddForm && (
        <WarehouseForm
          editingWarehouse={editingWarehouse}
          formData={formData}
          isSubmitting={isSubmitting}
          onChange={handleFormChange}
          onSubmit={handleFormSubmit}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {showManagerForm && (
        <ManagerForm
          stockKeepers={stockKeepers}
          loadingStockKeepers={loadingStockKeepers}
          newManagerId={newManagerId}
          isSubmittingManager={isSubmittingManager}
          onChange={(e) => setNewManagerId(e.target.value)}
          onSubmit={handleChangeManagerSubmit}
          onClose={() => setShowManagerForm(false)}
        />
      )}

      {showConfirmDelete !== null && (
        <DeleteConfirmation
          isSubmitting={isSubmitting}
          onConfirm={() => handleDeleteWarehouse(showConfirmDelete)}
          onClose={() => setShowConfirmDelete(null)}
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
        aria-label="Notification container"
      />
    </div>
  );
};

export default WarehouseManagement;