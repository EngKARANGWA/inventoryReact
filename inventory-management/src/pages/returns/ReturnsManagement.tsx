import React, { useState, useEffect, useMemo, useCallback } from "react";
import {Sidebar} from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { returnsService, Return } from "../../services/returnsService";
import ReturnsStats from "./ReturnsStats";
import ReturnsControls from "./ReturnsControls";
import ReturnsTable from "./ReturnsTable";
import ReturnsCards from "./ReturnsCards";
import ReturnForm from "./ReturnForm";
import ReturnViewModal from "./ReturnViewModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { Package } from "lucide-react";
import ReturnsFilters from "./ReturnsFilters";

interface SortConfig {
  key: keyof Return;
  direction: "ascending" | "descending";
}

interface ReturnFilters {
  page: number;
  pageSize: number;
  status: string;
  includeDeleted: boolean;
  search?: string;
}

const ReturnsManagement: React.FC = () => {
  const [allReturns, setAllReturns] = useState<Return[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(
    null
  );
  const [viewType, setViewType] = useState<"table" | "cards">("table");
  const [editingReturn, setEditingReturn] = useState<Return | null>(null);

  const [filters, setFilters] = useState<ReturnFilters>({
    page: 1,
    pageSize: 10,
    status: "",
    includeDeleted: false,
  });

  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: "date",
    direction: "descending",
  });

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await returnsService.getAllReturns({
        page: filters.page,
        pageSize: filters.pageSize,
        search: searchTerm,
        includeDeleted: filters.includeDeleted,
      });
      setAllReturns(data);
      setFilteredReturns(data);
    } catch (err) {
      console.error("Error fetching returns:", err);
      setError("Failed to fetch returns. Please try again later.");
      toast.error("Failed to load returns");
      setAllReturns([]);
      setFilteredReturns([]);
    } finally {
      setLoading(false);
    }
  }, [filters.page, filters.pageSize, filters.includeDeleted, searchTerm]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  useEffect(() => {
    let filtered = [...allReturns];

    if (searchTerm) {
      filtered = filtered.filter((ret) => {
        return (
          ret.referenceNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (ret.note &&
            ret.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (ret.sale?.referenceNumber &&
            ret.sale.referenceNumber
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (ret.product?.name &&
            ret.product.name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    if (filters.status) {
      filtered = filtered.filter((ret) => ret.status === filters.status);
    }

    setFilteredReturns(filtered);
  }, [searchTerm, allReturns, filters.status]);

  const sortedReturns = useMemo(() => {
    let sortableItems = [...filteredReturns];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";

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
  }, [filteredReturns, sortConfig]);

  const paginatedReturns = useMemo(() => {
    const start = (filters.page - 1) * filters.pageSize;
    const end = start + filters.pageSize;
    return sortedReturns.slice(start, end);
  }, [sortedReturns, filters.page, filters.pageSize]);

  const requestSort = (key: keyof Return) => {
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReturns();
  };

  const handleAddClick = () => {
    setShowAddForm(true);
  };

  const handleEditClick = (returnItem: Return) => {
    setEditingReturn(returnItem);
    setShowAddForm(true);
  };

  const handleRefresh = () => {
    fetchReturns();
    toast.info("Returns refreshed");
  };

  const handlePageChange = (newPage: number) => {
    if (
      newPage >= 1 &&
      newPage <= Math.ceil(filteredReturns.length / filters.pageSize)
    ) {
      setFilters((prev) => ({ ...prev, page: newPage }));
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

  const handleViewReturn = async (returnItem: Return) => {
    try {
      setLoading(true);
      const fullReturn = await returnsService.getReturnById(returnItem.id);
      if (fullReturn) {
        setSelectedReturn(fullReturn);
        setShowViewModal(true);
      }
    } catch (err) {
      console.error("Error fetching return details:", err);
      toast.error("Failed to load return details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = (returnId: number) => {
    setShowConfirmDelete(returnId);
  };

  const handleDeleteReturn = async (returnId: number) => {
    try {
      setIsSubmitting(true);
      await returnsService.deleteReturn(returnId);
      setAllReturns((prev) => prev.filter((r) => r.id !== returnId));
      toast.success("Return deleted successfully");
      setShowConfirmDelete(null);
      fetchReturns();
    } catch (err: any) {
      console.error("Error deleting return:", err);
      toast.error(err.message || "Failed to delete return");
    } finally {
      setIsSubmitting(false);
    }
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
                <Package className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600" />
                Returns Management
              </h1>
              <p className="text-gray-600">
                Track and manage product returns and inventory adjustments
              </p>
            </div>

            <ReturnsStats loading={loading} allReturns={allReturns} />

            <ReturnsControls
              searchTerm={searchTerm}
              showFilters={showFilters}
              viewType={viewType}
              onSearch={handleSearch}
              onSearchSubmit={handleSearchSubmit}
              onToggleFilters={() => setShowFilters(!showFilters)}
              onToggleViewType={toggleViewType}
              onRefresh={handleRefresh}
              onAddClick={handleAddClick}
            />

            {showFilters && (
              <ReturnsFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onApplyFilters={fetchReturns}
              />
            )}

            {viewType === "table" ? (
              <ReturnsTable
                loading={loading}
                error={error}
                returns={paginatedReturns}
                sortConfig={sortConfig}
                onSort={requestSort}
                onView={handleViewReturn}
                onEdit={handleEditClick}
                onDelete={handleDeleteConfirm}
                currentPage={filters.page}
                pageSize={filters.pageSize}
                totalItems={filteredReturns.length}
                onPageChange={handlePageChange}
              />
            ) : (
              <ReturnsCards
                loading={loading}
                error={error}
                returns={paginatedReturns}
                currentPage={filters.page}
                pageSize={filters.pageSize}
                totalItems={filteredReturns.length}
                onPageChange={handlePageChange}
                onView={handleViewReturn}
                onEdit={handleEditClick}
                onDelete={handleDeleteConfirm}
              />
            )}
          </div>
        </main>
      </div>

      {showAddForm && (
        <ReturnForm
          returnToEdit={editingReturn}
          onClose={() => setShowAddForm(false)}
          onSubmitSuccess={() => {
            setShowAddForm(false);
            fetchReturns();
          }}
        />
      )}

      {showViewModal && selectedReturn && (
        <ReturnViewModal
          returnData={selectedReturn}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {showConfirmDelete !== null && (
        <DeleteConfirmationModal
          returnId={showConfirmDelete}
          onClose={() => setShowConfirmDelete(null)}
          onConfirm={handleDeleteReturn}
          isSubmitting={isSubmitting}
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

export default ReturnsManagement;
