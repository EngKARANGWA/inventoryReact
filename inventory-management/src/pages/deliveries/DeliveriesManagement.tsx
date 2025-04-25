// DeliveryManagement.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { deliveryService, Delivery } from "../../services/deliveryService";
import DeliveryTable from "./DeliveryTable";
import DeliveryCards from "./DeliveryCards";
import DeliveryForm from "./DeliveryForm";
import DeliveryViewModal from "./DeliveryViewModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import DeliveryStats from "./DeliveryStats";
import DeliveryControls from "./DeliveryControls";
import EmptyState from "./EmptyState";
import { Truck } from "lucide-react";
import { DeliveryFilters } from "./types";


const DeliveryManagement: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [totalDeliveries, setTotalDeliveries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null
  );
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(
    null
  );
  const [viewType, setViewType] = useState<"table" | "cards">("table");

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Delivery;
    direction: "ascending" | "descending";
  } | null>({
    key: "deliveredAt",
    direction: "descending",
  });

  const [filters, setFilters] = useState<DeliveryFilters>({
    page: 1,
    pageSize: 10,
    status: undefined,
    direction: undefined,
    productId: undefined,
    warehouseId: undefined,
    driverId: undefined,
    dateFrom: "",
    dateTo: "",
  });

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await deliveryService.getAllDeliveries();

      setDeliveries(response.deliveries || []);
      setTotalDeliveries(response.total || 0);
    } catch (err) {
      console.error("Error fetching deliveries:", err);
      setError("Failed to fetch deliveries. Please try again later.");
      toast.error("Failed to load deliveries");
      setDeliveries([]);
      setTotalDeliveries(0);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm]);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleRefresh = () => {
    fetchDeliveries();
    toast.info("Deliveries refreshed");
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDeliveries();
  };

  const handleAddClick = () => {
    setShowAddForm(true);
  };

  const handleEditClick = (delivery: Delivery) => {
    setEditingDelivery(delivery);
    setShowAddForm(true);
  };

  const handleDeleteConfirm = (deliveryId: number) => {
    setShowConfirmDelete(deliveryId);
  };

  const handleDeleteDelivery = async (deliveryId: number) => {
    try {
      setIsSubmitting(true);
      await deliveryService.deleteDelivery(deliveryId);
      setDeliveries(deliveries.filter((d) => d.id !== deliveryId));
      setTotalDeliveries(totalDeliveries - 1);
      toast.success("Delivery deleted successfully");
      setShowConfirmDelete(null);
    } catch (err: any) {
      console.error("Error deleting delivery:", err);
      toast.error(err.message || "Failed to delete delivery");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]:
        value === "" ? undefined : name.includes("Id") ? Number(value) : value,
      page: 1,
    }));
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const requestSort = (key: keyof Delivery) => {
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

  const sortedDeliveries = React.useMemo(() => {
    if (!sortConfig) return deliveries;

    return [...deliveries].sort((a, b) => {
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
  }, [deliveries, sortConfig]);

  const filteredDeliveries = React.useMemo(() => {
    if (!searchTerm) return sortedDeliveries;

    return sortedDeliveries.filter((delivery) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        delivery.deliveryReference.toLowerCase().includes(searchLower) ||
        (delivery.driver?.user?.profile?.names
          ?.toLowerCase()
          .includes(searchLower) ??
          false) ||
        (delivery.product?.name.toLowerCase().includes(searchLower) ?? false) ||
        (delivery.warehouse?.name.toLowerCase().includes(searchLower) ??
          false) ||
        delivery.direction.toLowerCase().includes(searchLower) ||
        delivery.status.toLowerCase().includes(searchLower)
      );
    });
  }, [sortedDeliveries, searchTerm]);

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(totalDeliveries / pageSize);
  const paginatedDeliveries = filteredDeliveries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
                Delivery Management
              </h1>
              <p className="text-gray-600">
                Manage product deliveries to/from warehouses
              </p>
            </div>

            <DeliveryStats
              loading={loading}
              totalDeliveries={totalDeliveries}
              deliveries={deliveries}
            />

            <DeliveryControls
              searchTerm={searchTerm}
              handleSearch={handleSearch}
              handleSearchSubmit={handleSearchSubmit}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              viewType={viewType}
              toggleViewType={() =>
                setViewType((prev) => (prev === "table" ? "cards" : "table"))
              }
              handleExportData={() =>
                toast.info("Data export feature will be implemented soon!")
              }
              handleRefresh={handleRefresh}
              handleAddClick={handleAddClick}
              filters={filters}
              handleFilterChange={handleFilterChange}
              handleDateFilterChange={handleDateFilterChange}
              fetchDeliveries={fetchDeliveries}
            />

            {!loading && filteredDeliveries.length === 0 && (
              <EmptyState
                searchTerm={searchTerm}
                handleAddClick={handleAddClick}
              />
            )}

            {viewType === "table" ? (
              <DeliveryTable
                loading={loading}
                error={error}
                sortConfig={sortConfig}
                requestSort={requestSort}
                paginatedDeliveries={paginatedDeliveries}
                currentPage={currentPage}
                pageSize={pageSize}
                totalPages={totalPages}
                totalDeliveries={totalDeliveries}
                filteredDeliveries={filteredDeliveries}
                handlePageChange={handlePageChange}
                setSelectedDelivery={setSelectedDelivery}
                setShowViewModal={setShowViewModal}
                handleEditClick={handleEditClick}
                handleDeleteConfirm={handleDeleteConfirm}
                searchTerm={searchTerm}
              />
            ) : (
              <DeliveryCards
                loading={loading}
                error={error}
                paginatedDeliveries={paginatedDeliveries}
                currentPage={currentPage}
                totalPages={totalPages}
                filteredDeliveries={filteredDeliveries}
                handlePageChange={handlePageChange}
                setSelectedDelivery={setSelectedDelivery}
                setShowViewModal={setShowViewModal}
                handleEditClick={handleEditClick}
                handleDeleteConfirm={handleDeleteConfirm}
                searchTerm={searchTerm}
                handleRefresh={handleRefresh}
                pageSize={filters.pageSize}
              />
            )}
          </div>
        </main>
      </div>

      {showAddForm && (
        <DeliveryForm
          editingDelivery={editingDelivery}
          setShowAddForm={setShowAddForm}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          setDeliveries={setDeliveries}
          setTotalDeliveries={setTotalDeliveries}
          deliveries={deliveries}
        />
      )}

      {showViewModal && selectedDelivery && (
        <DeliveryViewModal
          selectedDelivery={selectedDelivery}
          setShowViewModal={setShowViewModal}
        />
      )}

      {showConfirmDelete !== null && (
        <DeleteConfirmationModal
          showConfirmDelete={showConfirmDelete}
          setShowConfirmDelete={setShowConfirmDelete}
          isSubmitting={isSubmitting}
          handleDeleteDelivery={handleDeleteDelivery}
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

export default DeliveryManagement;
