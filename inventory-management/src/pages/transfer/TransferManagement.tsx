import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import { AlertCircle, RefreshCw, Truck } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { transferService, Transfer } from "../../services/transferService";
import { productService } from "../../services/productService";
import { driverService } from "../../services/driverService";

// Import the new components
import TransferStatsCards from "./TransferStatsCards";
import ControlsBar from "./ControlsBar";
import FiltersPanel from "./FiltersPanel";
import EmptyState from "./EmptyState";
import TransferTable from "./TransferTable";
import TransferForm from "./TransferForm";
import TransferViewModal from "./TransferViewModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import Pagination from "./Pagination";
import TransferCard from "./TransferCard";

interface Product {
  id: number;
  name: string;
  description: string;
  type: string;
}


interface Driver {
  id: number;
  username: string;
  email: string;
  profile?: {
    names: string;
  };
  roles: {
    id: number;
    name: string;
    description: string;
  }[];
}

interface TransferFilters {
  page: number;
  pageSize: number;
  status: string;
  includeDeleted: boolean;
}

const TransferManagement: React.FC = () => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [totalTransfers, setTotalTransfers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(
    null
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<Transfer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [driversLoading, setDriversLoading] = useState(false);
  const [productsOptions, setProductsOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [driversOptions, setDriversOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [warehouseOptions] = useState<{ value: number; label: string }[]>([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [transferToDelete, setTransferToDelete] = useState<number | null>(null);
  const [viewType, setViewType] = useState<"table" | "cards">("table");

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Transfer;
    direction: "ascending" | "descending";
  } | null>({
    key: "createdAt",
    direction: "descending",
  });

  const [filters, setFilters] = useState<TransferFilters>({
    page: 1,
    pageSize: 10,
    status: "",
    includeDeleted: false,
  });

  const [formData, setFormData] = useState({
    productId: "",
    fromWarehouseId: "",
    toWarehouseId: "",
    driverId: "",
    quantity: "",
    note: "",
    unitPrice: "",
  });

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, pagination } = await transferService.getAllTransfers();

      const processedTransfers: Transfer[] = (data || []).map(
        (transfer: Transfer) => ({
          ...transfer,
          quantity: transfer.quantity
            ? parseFloat(transfer.quantity.toString())
            : 0,
          driver: transfer.driver || undefined,
        })
      );

      setTransfers(processedTransfers);
      setTotalTransfers(pagination?.total || 0);
    } catch (err: any) {
      console.error("Error fetching transfers:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to fetch transfers. Please try again later.";
      setError(errorMessage);
      toast.error(errorMessage);
      setTransfers([]);
      setTotalTransfers(0);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  const fetchDropdownOptions = useCallback(async () => {
    try {
      setProductsLoading(true);
      setDriversLoading(true);

      // Fetch products
      const productsResponse = await productService.getAllProducts();
      const formattedProducts = productsResponse.data.map(
        (product: Product) => ({
          value: product.id,
          label: product.name,
        })
      );
      setProductsOptions(formattedProducts);

      // Fetch drivers
      const response = await driverService.getAllDrivers();
      const driversResponse = response as unknown as Driver[];

      const formattedDrivers = driversResponse.map((driver) => ({
        value: driver.id,
        label: driver.profile?.names || driver.username,
      }));

      setDriversOptions(formattedDrivers);
    } catch (error: any) {
      console.error("Error fetching dropdown options:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to load form options";
      toast.error(errorMessage);
    } finally {
      setProductsLoading(false);
      setDriversLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  useEffect(() => {
    if (showAddForm) {
      fetchDropdownOptions();
    }
  }, [showAddForm, fetchDropdownOptions]);

  const handleRefresh = () => {
    fetchTransfers();
    toast.info("Transfers refreshed");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransfers();
  };

  const handleAddClick = () => {
    setFormData({
      productId: "",
      fromWarehouseId: "",
      toWarehouseId: "",
      driverId: "",
      quantity: "",
      note: "",
      unitPrice: "",
    });
    setEditingTransfer(null);
    setShowAddForm(true);
  };

  const handleEditClick = (transfer: Transfer) => {
    setFormData({
      productId: String(transfer.productId),
      fromWarehouseId: String(transfer.fromWarehouseId),
      toWarehouseId: String(transfer.toWarehouseId),
      driverId: String(transfer.driverId),
      quantity: String(transfer.quantity),
      note: transfer.note || "",
      unitPrice: "",
    });
    setEditingTransfer(transfer);
    setShowAddForm(true);
  };

  const handleDeleteConfirm = (transferId: number) => {
    setTransferToDelete(transferId);
    setShowConfirmDelete(true);
  };

  const handleDeleteTransfer = async () => {
    if (!transferToDelete) return;

    try {
      setIsSubmitting(true);
      await transferService.deleteTransfer(transferToDelete);
      setTransfers(transfers.filter((t) => t.id !== transferToDelete));
      setTotalTransfers(totalTransfers - 1);
      toast.success("Transfer deleted successfully");
      setShowConfirmDelete(false);
    } catch (err: any) {
      console.error("Error deleting transfer:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete transfer";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setTransferToDelete(null);
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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingTransfer) {
        const updateData = {
          driverId: Number(formData.driverId),
          quantity: parseFloat(formData.quantity),
          note: formData.note,
        };

        const updatedTransfer = await transferService.updateTransfer(
          editingTransfer.id,
          updateData
        );

        setTransfers(
          transfers.map((t) =>
            t.id === editingTransfer.id ? updatedTransfer : t
          )
        );
        toast.success("Transfer updated successfully");
      } else {
        const transferData = {
          productId: Number(formData.productId),
          fromWarehouseId: Number(formData.fromWarehouseId),
          toWarehouseId: Number(formData.toWarehouseId),
          driverId: Number(formData.driverId),
          quantity: parseFloat(formData.quantity),
          unitPrice: parseFloat(formData.unitPrice),
          note: formData.note,
        };

        const newTransfer = await transferService.createTransfer(transferData);
        setTransfers([newTransfer, ...transfers]);
        setTotalTransfers(totalTransfers + 1);
        toast.success("Transfer created successfully");
      }

      setShowAddForm(false);
    } catch (err: any) {
      console.error("Error saving transfer:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to save transfer";
      if (err.response?.data?.code === "MISSING_UNIT_PRICE") {
        toast.error("Unit price is required for the transfer");
      } else {
        toast.error(errorMessage);
      }
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
    const tableElement = document.getElementById("transfers-table-container");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const requestSort = (key: keyof Transfer) => {
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

  const sortedTransfers = React.useMemo(() => {
    if (!sortConfig) return transfers;

    return [...transfers].sort((a, b) => {
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
  }, [transfers, sortConfig]);

  // Filter transfers based on search term
  const filteredTransfers = React.useMemo(() => {
    if (!searchTerm) return sortedTransfers;

    return sortedTransfers.filter((transfer) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        transfer.referenceNumber.toLowerCase().includes(searchLower) ||
        transfer.product?.name.toLowerCase().includes(searchLower) ||
        transfer.fromWarehouse?.name.toLowerCase().includes(searchLower) ||
        transfer.toWarehouse?.name.toLowerCase().includes(searchLower) ||
        transfer.driver?.user?.profile?.names
          .toLowerCase()
          .includes(searchLower)
      );
    });
  }, [sortedTransfers, searchTerm]);

  // Calculate summary statistics
  const completedTransfers = transfers.filter(
    (t) => t.status === "completed"
  ).length;
  const pendingTransfers = transfers.filter(
    (t) => t.status === "pending"
  ).length;
  const totalQuantity = transfers.reduce((sum, t) => {
    const quantity = Number(t.quantity) || 0;
    return sum + quantity;
  }, 0);

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(filteredTransfers.length / pageSize);
  const paginatedTransfers = filteredTransfers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportData = () => {
    toast.info("Data export feature will be implemented soon!");
  };

  const toggleViewType = () => {
    setViewType((prev) => (prev === "table" ? "cards" : "table"));
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
                <Truck className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600" />
                Transfer Management
              </h1>
              <p className="text-gray-600">
                Manage product transfers between warehouses
              </p>
            </div>

            {/* Stats Cards */}
            <TransferStatsCards
              loading={loading}
              totalTransfers={totalTransfers}
              completedTransfers={completedTransfers}
              pendingTransfers={pendingTransfers}
              totalQuantity={totalQuantity}
            />

            {/* Controls Bar */}
            <ControlsBar
              searchTerm={searchTerm}
              showFilters={showFilters}
              viewType={viewType}
              onSearchChange={handleSearch}
              onSearchSubmit={handleSearchSubmit}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onToggleView={toggleViewType}
              onRefresh={handleRefresh}
              onExport={handleExportData}
              onAddClick={handleAddClick}
            />

            {/* Filters Panel */}
            <FiltersPanel
              isOpen={showFilters}
              filters={{
                status: filters.status,
                pageSize: filters.pageSize,
              }}
              onFilterChange={handleFilterChange}
              onApplyFilters={fetchTransfers}
            />

            {/* Empty State */}
            {!loading && filteredTransfers.length === 0 && (
              <EmptyState searchTerm={searchTerm} onAddClick={handleAddClick} />
            )}

            {/* Transfers Display - Table View */}
            {viewType === "table" && (
              <div
                id="transfers-table-container"
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <TransferTable
                  transfers={paginatedTransfers}
                  sortConfig={sortConfig}
                  onSort={requestSort}
                  onView={(transfer) => {
                    setSelectedTransfer(transfer);
                    setShowViewModal(true);
                  }}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteConfirm}
                />

                {/* Pagination */}
                {filteredTransfers.length > 0 && (
                  <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredTransfers.length}
                      pageSize={pageSize}
                      onPageChange={handlePageChange}
                      isMobile
                    />
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredTransfers.length}
                      pageSize={pageSize}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Card View */}
            {viewType === "cards" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {loading ? (
                  // Skeleton for card view
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
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
                ) : paginatedTransfers.length === 0 ? (
                  <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                    <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No transfers found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm
                        ? `No transfers matching "${searchTerm}" were found.`
                        : "There are no transfers to display."}
                    </p>
                  </div>
                ) : (
                  paginatedTransfers.map((transfer) => (
                    <TransferCard
                      key={transfer.id}
                      transfer={transfer}
                      onView={(transfer) => {
                        setSelectedTransfer(transfer);
                        setShowViewModal(true);
                      }}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteConfirm}
                    />
                  ))
                )}

                {/* Card View Pagination */}
                {filteredTransfers.length > 0 && (
                  <div className="col-span-full mt-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 flex items-center justify-between">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredTransfers.length}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        isMobile
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Transfer Form */}
      {showAddForm && (
        <TransferForm
          formData={formData}
          editingTransfer={editingTransfer}
          isSubmitting={isSubmitting}
          productsLoading={productsLoading}
          driversLoading={driversLoading}
          productsOptions={productsOptions}
          driversOptions={driversOptions}
          warehouseOptions={warehouseOptions}
          onChange={handleFormChange}
          onSelectChange={handleSelectChange}
          onSubmit={handleFormSubmit}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {/* View Transfer Details Modal */}
      {showViewModal && selectedTransfer && (
        <TransferViewModal
          transfer={selectedTransfer}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showConfirmDelete}
        isSubmitting={isSubmitting}
        onConfirm={handleDeleteTransfer}
        onCancel={() => {
          setShowConfirmDelete(false);
          setTransferToDelete(null);
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

export default TransferManagement;
