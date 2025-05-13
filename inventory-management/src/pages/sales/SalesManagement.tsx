import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import { ShoppingCart, Plus } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { saleService } from "../../services/saleService";
import { Sale, Product, Saler, Client, Blocker, SortConfig } from "./sale";

// Import the new components
import { SalesStats } from "./SalesStats";
import { SalesFilters } from "./SalesFilters";
import SalesTable from "./SalesTable";
import { SaleForm } from "./SaleForm";
import { SalesCards } from "./SalesCards";
import { SaleDetailsModal } from "./SaleDetailsModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { SalesPagination } from "./SalesPagination";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SaleManagement: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSale, setEditingSale] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(
    null
  );
  const [viewType, setViewType] = useState<"table" | "cards">("table");
  const [productsSearch, setProductsSearch] = useState("");
  const [salersSearch, setSalersSearch] = useState("");
  const [clientsSearch, setClientsSearch] = useState("");
  const [blockersSearch, setBlockersSearch] = useState("");

  const [sortConfig, setSortConfig] = useState<SortConfig | null>({
    key: "createdAt",
    direction: "descending",
  });

  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 10,
    productId: "",
    salerId: "",
    clientId: "",
    startDate: "",
    endDate: "",
    status: "",
    search: "",
  });

  const [formData, setFormData] = useState({
    salerId: "",
    clientId: "",
    blockerId: "",
    note: "",
    expectedDeliveryDate: "",
    items: [
      {
        id: undefined as number | undefined,
        productId: "",
        quantity: "",
        unitPrice: "",
        note: "",
      },
    ],
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [salers, setSalers] = useState<Saler[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [blockers, setBlockers] = useState<Blocker[]>([]);

  // Format numbers with comma as thousand separator
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    }).format(num);
  };

  const fetchSales = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await saleService.getAllSales();

      setSales(response.data || []);
      setTotalSales(response.pagination?.totalItems || 0);
    } catch (err) {
      console.error("Error fetching sales:", err);
      setError("Failed to fetch sales. Please try again later.");
      toast.error("Failed to load sales");
      setSales([]);
      setTotalSales(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const fetchDropdownOptions = useCallback(async () => {
    try {
      const [productsRes, salersRes, clientsRes, blockersRes] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/products?search=${productsSearch}`),
          axios.get(`${API_BASE_URL}/saler?search=${salersSearch}`),
          axios.get(`${API_BASE_URL}/clients?search=${clientsSearch}`),
          axios.get(`${API_BASE_URL}/blockers?search=${blockersSearch}`),
        ]);

      // Handle products response
      const productsData = productsRes.data.success
        ? productsRes.data.data
        : productsRes.data;
      setProducts(
        (productsData || []).map((product: any) => ({
          id: product.id,
          name: product.name,
        }))
      );

      // Handle salers response
      const salersData = salersRes.data.success
        ? salersRes.data.data
        : salersRes.data;
      setSalers(
        (salersData || []).map((saler: any) => ({
          id: saler.id,
          name: saler.user?.profile?.names || "Unknown Saler",
        }))
      );

      // Handle clients response
      const clientsData = clientsRes.data.success
        ? clientsRes.data.data
        : clientsRes.data;
      setClients(
        (clientsData || []).map((client: any) => ({
          id: client.id,
          name: client.user?.profile?.names || "Unknown Client",
        }))
      );

      // Handle blockers response
      const blockersData = blockersRes.data.success
        ? blockersRes.data.data
        : blockersRes.data;
      setBlockers(
        (blockersData || []).map((blocker: any) => ({
          id: blocker.id,
          name: blocker.user?.profile?.names || "Unknown Blocker",
        }))
      );
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      toast.error("Failed to load form options");
    }
  }, [productsSearch, salersSearch, clientsSearch, blockersSearch]);

  useEffect(() => {
    if (showAddForm) {
      fetchDropdownOptions();
    }
  }, [showAddForm, fetchDropdownOptions]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare items data - convert strings to numbers
      const items = formData.items.map((item) => ({
        ...(item.id ? { id: Number(item.id) } : {}),
        productId: Number(item.productId),
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        note: item.note || undefined,
      }));

      if (editingSale) {
        // For update, we don't need to provide salerId if it's not changing
        const updateData = {
          ...(formData.clientId && { clientId: Number(formData.clientId) }),
          ...(formData.blockerId && { blockerId: Number(formData.blockerId) }),
          items,
          note: formData.note || undefined,
          expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
        };

        await saleService.updateSale(editingSale.id, updateData);
        toast.success("Sale updated successfully");
      } else {
        // For create, salerId is required
        if (!formData.salerId) {
          toast.error("Saler is required");
          setIsSubmitting(false);
          return;
        }

        const createData = {
          salerId: Number(formData.salerId),
          ...(formData.clientId && { clientId: Number(formData.clientId) }),
          ...(formData.blockerId && { blockerId: Number(formData.blockerId) }),
          items,
          note: formData.note || undefined,
          expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
        };

        await saleService.createSale(createData);
        toast.success("Sale created successfully");
      }

      setShowAddForm(false);
      fetchSales(); // Refresh the list after successful operation
    } catch (err: any) {
      console.error("Error saving sale:", err);
      toast.error(err.response?.data?.message || "Failed to save sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: name === "pageSize" ? 1 : prev.page, // Reset to first page if page size changes
    }));
  };

  // const handleRefresh = () => {
  //   fetchSales();
  //   toast.info("Sales refreshed");
  // };

  const handleAddClick = () => {
    setEditingSale(null);
    setFormData({
      salerId: "",
      clientId: "",
      blockerId: "",
      note: "",
      expectedDeliveryDate: "",
      items: [
        {
          id: undefined,
          productId: "",
          quantity: "",
          unitPrice: "",
          note: "",
        },
      ],
    });
    setShowAddForm(true);
  };

  const handleEditClick = (sale: any) => {
    setEditingSale(sale);

    // Map sale items to form format
    const items =
      sale.items?.map((item: any) => ({
        id: item.id,
        productId: String(item.productId),
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice ? item.unitPrice.toString() : "",
        note: item.note || "",
      })) || [];

    setFormData({
      salerId: String(sale.salerId),
      clientId: sale.clientId ? String(sale.clientId) : "",
      blockerId: sale.blockerId ? String(sale.blockerId) : "",
      note: sale.note || "",
      expectedDeliveryDate: sale.expectedDeliveryDate?.split("T")[0] || "",
      items:
        items.length > 0
          ? items
          : [{ productId: "", quantity: "", unitPrice: "", note: "" }],
    });

    setShowAddForm(true);
  };

  const handleDeleteConfirm = (saleId: number) => {
    setShowConfirmDelete(saleId);
  };

  const handleDeleteSale = async (saleId: number) => {
    try {
      setIsSubmitting(true);
      await saleService.deleteSale(saleId);
      setSales(sales.filter((s) => s.id !== saleId));
      setTotalSales(totalSales - 1);
      toast.success("Sale deleted successfully");
      setShowConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting sale:", error);
      toast.error("Failed to delete sale");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));

    // Scroll to top of the table
    const tableElement = document.getElementById("sales-table-container");
    if (tableElement) {
      tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const requestSort = (key: keyof Sale) => {
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

  const sortedSales = React.useMemo(() => {
    if (!sortConfig) return sales;

    return [...sales].sort((a, b) => {
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
  }, [sales, sortConfig]);

  const filteredSales = React.useMemo(() => {
    if (!filters.search) return sortedSales;

    const searchLower = filters.search.toLowerCase();
    return sortedSales.filter((sale) => {
      return (
        sale.saleReference?.toLowerCase().includes(searchLower) ||
        sale.product?.name?.toLowerCase().includes(searchLower) ||
        sale.saler?.user?.profile?.names?.toLowerCase().includes(searchLower) ||
        sale.client?.user?.profile?.names
          ?.toLowerCase()
          .includes(searchLower) ||
        sale.note?.toLowerCase().includes(searchLower)
      );
    });
  }, [sortedSales, filters.search]);


  const getStatusBadge = (sale: any) => {
    const unitPrice = sale.unitPrice ? parseFloat(sale.unitPrice) : 0;
    const totalAmount = unitPrice * sale.quantity;
    const paidAmount = parseFloat(sale.totalPaid || "0");

    if (paidAmount >= totalAmount) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Paid
        </span>
      );
    } else if (paidAmount > 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Partial
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
          Unpaid
        </span>
      );
    }
  };

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(filteredSales.length / pageSize);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // const handleExportData = () => {
  //   toast.info("Data export feature will be implemented soon!");
  // };

  const toggleViewType = () => {
    setViewType((prev) => (prev === "table" ? "cards" : "table"));
  };

  const { totalRevenue, totalPaid, pendingSalesCount, completedSalesCount } =
    React.useMemo(() => {
      let revenue = 0;
      let paid = 0;
      let pending = 0;
      let completed = 0;

      sales.forEach((sale) => {
        const saleAmount = sale.items.reduce((sum, item) => {
          return sum + parseFloat(item.quantity) * parseFloat(item.unitPrice);
        }, 0);

        revenue += saleAmount;
        paid += parseFloat(sale.totalPaid || "0");

        if (parseFloat(sale.totalPaid || "0") >= saleAmount) {
          completed++;
        } else {
          pending++;
        }
      });

      return {
        totalRevenue: revenue,
        totalPaid: paid,
        pendingSalesCount: pending,
        completedSalesCount: completed,
      };
    }, [sales]);
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <Header />
        <main className="flex-1 w-full p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 mr-2 text-blue-600" />
                Sale Management
              </h1>
              <p className="text-gray-600">
                Manage product sales and customer transactions
              </p>
            </div>

            <SalesStats
              loading={loading}
              totalSales={sales.length}
              completedSales={completedSalesCount}
              pendingSales={pendingSalesCount}
              totalPaid={totalPaid}
              totalRevenue={totalRevenue}
              formatNumber={formatNumber}
            />

            <SalesFilters
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              filters={filters}
              handleFilterChange={handleFilterChange}
              products={products}
              salers={salers}
              clients={clients}
              fetchSales={fetchSales}
              viewType={viewType}
              toggleViewType={toggleViewType}
              handleAddClick={handleAddClick}
              handleExportData={() => {
                toast.info("Data export feature will be implemented soon!");
              }}
            />

            {/* Empty State */}
            {!loading && filteredSales.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No sales found
                </h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  {filters.search
                    ? `No sales matching "${filters.search}" were found. Try a different search term or clear your filters.`
                    : "There are no sales to display. Start by creating a new sale."}
                </p>
                <button
                  onClick={handleAddClick}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                >
                  <Plus size={16} className="mr-2" />
                  Create New Sale
                </button>
              </div>
            )}

            {viewType === "table" ? (
              <SalesTable
                loading={loading}
                error={error}
                sales={paginatedSales}
                currentPage={currentPage}
                pageSize={pageSize}
                totalPages={totalPages}
                totalItems={filteredSales.length}
                handlePageChange={handlePageChange}
                onView={(sale) => {
                  setSelectedSale(sale);
                  setShowViewModal(true);
                }}
                onEdit={handleEditClick}
                onDelete={handleDeleteConfirm}
                sortConfig={sortConfig}
                requestSort={requestSort}
              />
            ) : (
              <SalesCards
                loading={loading}
                error={error}
                sales={paginatedSales}
                currentPage={currentPage}
                pageSize={pageSize}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
                handleEditClick={handleEditClick}
                handleDeleteConfirm={handleDeleteConfirm}
                setSelectedSale={setSelectedSale}
                setShowViewModal={setShowViewModal}
                getStatusBadge={getStatusBadge}
              />
            )}

            {totalPages > 1 && (
              <SalesPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredSales.length}
                pageSize={pageSize}
                handlePageChange={handlePageChange}
              />
            )}
          </div>
        </main>
      </div>

      <SaleForm
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        editingSale={editingSale}
        formData={formData}
        setFormData={setFormData}
        products={products}
        salers={salers}
        clients={clients}
        blockers={blockers}
        setProductsSearch={setProductsSearch}
        setSalersSearch={setSalersSearch}
        setClientsSearch={setClientsSearch}
        setBlockersSearch={setBlockersSearch}
        handleFormSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <SaleDetailsModal
        showViewModal={showViewModal}
        setShowViewModal={setShowViewModal}
        selectedSale={selectedSale}
        getStatusBadge={getStatusBadge}
      />

      <DeleteConfirmationModal
        showConfirmDelete={showConfirmDelete}
        setShowConfirmDelete={setShowConfirmDelete}
        handleDeleteSale={handleDeleteSale}
        isSubmitting={isSubmitting}
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

export default SaleManagement;
