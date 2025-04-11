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
  Warehouse,
  Calendar,
  Check,
  X,
  Clock,
  RefreshCw,
  AlertTriangle,
  Gift,
  Recycle,
  Truck,
  RotateCcw,
  Skull,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  disposalService,
  Disposal,
  DisposalFilterOptions,
  productService,
  warehouseService,
  priceService,
} from "../../services/disposalService";

const DisposalManagement: React.FC = () => {
  const [disposals, setDisposals] = useState<Disposal[]>([]);
  const [totalDisposals, setTotalDisposals] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDisposal, setEditingDisposal] = useState<Disposal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [availableStock, setAvailableStock] = useState<number>(0);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof Disposal;
    direction: "ascending" | "descending";
  } | null>(null);

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
  const [prices, setPrices] = useState<
    { id: number; unitPrice: number; date: string }[]
  >([]);

  const methodOptions = [
    {
      value: "damaged",
      label: "Damaged",
      icon: <AlertTriangle className="w-4 h-4 mr-2" />,
    },
    {
      value: "expired",
      label: "Expired",
      icon: <Calendar className="w-4 h-4 mr-2" />,
    },
    {
      value: "destroyed",
      label: "Destroyed",
      icon: <Skull className="w-4 h-4 mr-2" />,
    },
    {
      value: "donated",
      label: "Donated",
      icon: <Gift className="w-4 h-4 mr-2" />,
    },
    {
      value: "recycled",
      label: "Recycled",
      icon: <Recycle className="w-4 h-4 mr-2" />,
    },
    {
      value: "returned_to_supplier",
      label: "Returned to Supplier",
      icon: <Truck className="w-4 h-4 mr-2" />,
    },
    {
      value: "other",
      label: "Other",
      icon: <Package className="w-4 h-4 mr-2" />,
    },
  ];

  useEffect(() => {
    fetchDisposals();
  }, [filters]);

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
      const prices = await priceService.getPricesByProduct(productId);
      setPrices(prices);
    } catch (error) {
      console.error("Error fetching prices:", error);
      toast.error("Failed to load product prices");
    } finally {
      setLoadingPrices(false);
    }
  };

  const fetchDisposals = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, pagination } = await disposalService.getAllDisposals({
        ...filters,
        search: searchTerm,
      });

      const processedDisposals: Disposal[] = (data || []).map(
        (disposal: Disposal) => ({
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
  };

  const handleRefresh = () => {
    fetchDisposals();
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
          unitPrice: parseFloat(disposal.price.unitPrice.toString()),
          date: disposal.price.date,
        },
      ]);
    }
    setShowAddForm(true);
  };

  const handleDeleteDisposal = async (disposalId: number) => {
    if (window.confirm("Are you sure you want to delete this disposal?")) {
      try {
        await disposalService.deleteDisposal(disposalId);
        setDisposals(disposals.filter((d) => d.id !== disposalId));
        setTotalDisposals(totalDisposals - 1);
        toast.success("Disposal deleted successfully");
      } catch (err: any) {
        console.error("Error deleting disposal:", err);
        toast.error(err.message || "Failed to delete disposal");
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
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
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

  const getMethodIcon = (method: string) => {
    const option = methodOptions.find((m) => m.value === method);
    return option ? option.icon : <Package className="w-4 h-4 mr-2" />;
  };

  const getMethodLabel = (method: string) => {
    const option = methodOptions.find((m) => m.value === method);
    return option ? option.label : "Other";
  };

  const currentPage = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const totalPages = Math.ceil(totalDisposals / pageSize);

  // Calculate summary statistics
  const totalQuantity = disposals.reduce(
    (sum, d) => sum + (d.quantity || 0),
    0
  );
  const totalValue = disposals.reduce((sum, d) => {
    const price = d.price?.unitPrice
      ? parseFloat(d.price.unitPrice.toString())
      : 0;
    return sum + (d.quantity || 0) * price;
  }, 0);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 w-full p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Disposal Management
              </h1>
              <p className="text-gray-600">
                Track and manage product disposals
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Disposals
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalDisposals}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Quantity
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalQuantity.toFixed(2)} Kg
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Value
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      ${totalValue.toFixed(2)}
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
                      Methods Used
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {new Set(disposals.map((d) => d.method)).size}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Recycle className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex-1 max-w-md"
                >
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search disposals..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </form>
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
                    New Disposal
                  </button>
                </div>
              </div>

              {showFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Filters
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Method
                      </label>
                      <select
                        name="method"
                        value={filters.method}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Methods</option>
                        {methodOptions.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={fetchDisposals}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Warehouse
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("quantity")}
                      >
                        <div className="flex items-center">
                          Quantity
                          {sortConfig?.key === "quantity" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("method")}
                      >
                        <div className="flex items-center">
                          Method
                          {sortConfig?.key === "method" && (
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
                    ) : sortedDisposals.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No disposals found.{" "}
                          {searchTerm && "Try a different search term."}
                        </td>
                      </tr>
                    ) : (
                      sortedDisposals.map((disposal) => (
                        <tr key={disposal.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {disposal.referenceNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {disposal.product?.name || "N/A"}
                            </div>
                            {disposal.product?.description && (
                              <div className="text-xs text-gray-500">
                                {disposal.product.description.substring(0, 30)}
                                ...
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Warehouse className="w-4 h-4 mr-1 text-blue-500" />
                              <div>
                                <div className="text-sm text-gray-900">
                                  {disposal.warehouse?.name || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {disposal.warehouse?.location}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {disposal.quantity.toLocaleString()} Kg
                            </div>
                            {disposal.price && (
                              <div className="text-xs text-gray-500">
                                @ $
                                {parseFloat(
                                  disposal.price.unitPrice.toString()
                                ).toFixed(2)}
                                /unit
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getMethodIcon(disposal.method)}
                              <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {getMethodLabel(disposal.method)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400 mr-1" />
                              <div className="text-sm text-gray-900">
                                {new Date(disposal.date).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEditClick(disposal)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                              title="Edit Disposal"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteDisposal(disposal.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Disposal"
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

              {totalDisposals > 0 && (
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between items-center sm:hidden">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
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
                          {Math.min(currentPage * pageSize, totalDisposals)}
                        </span>{" "}
                        of <span className="font-medium">{totalDisposals}</span>{" "}
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
                          <ChevronUp className="h-5 w-5" aria-hidden="true" />
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
                          <ChevronDown className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingDisposal ? "Edit Disposal" : "Create New Disposal"}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Select */}
                <div className="col-span-1">
                  <label
                    htmlFor="productId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="productId"
                    name="productId"
                    value={formData.productId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={
                      !!editingDisposal || isSubmitting || loadingProducts
                    }
                  >
                    <option value="">
                      {loadingProducts
                        ? "Loading products..."
                        : "Select a product"}
                    </option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {!loadingProducts && products.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      No products available
                    </p>
                  )}
                </div>

                {/* Warehouse Select */}
                <div className="col-span-1">
                  <label
                    htmlFor="warehouseId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Warehouse <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="warehouseId"
                    name="warehouseId"
                    value={formData.warehouseId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={
                      !!editingDisposal || isSubmitting || loadingWarehouses
                    }
                  >
                    <option value="">
                      {loadingWarehouses
                        ? "Loading warehouses..."
                        : "Select a warehouse"}
                    </option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.location})
                      </option>
                    ))}
                  </select>
                  {!loadingWarehouses && warehouses.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      No warehouses available
                    </p>
                  )}
                </div>

                {/* Quantity Input */}
                <div className="col-span-1">
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Quantity (Kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0.01"
                    step="0.01"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Method Select */}
                <div className="col-span-1">
                  <label
                    htmlFor="method"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="method"
                    name="method"
                    value={formData.method}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isSubmitting}
                  >
                    {methodOptions.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Input */}
                <div className="col-span-1">
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Price Information */}
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price Information
                  </label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {loadingPrices ? (
                      <div className="text-sm text-gray-500">
                        Loading prices...
                      </div>
                    ) : prices.length > 0 ? (
                      <div>
                        <div className="text-sm text-gray-900">
                          $
                          {parseFloat(prices[0].unitPrice.toString()).toFixed(
                            2
                          )}{" "}
                          per unit
                        </div>
                        <div className="text-xs text-gray-500">
                          Updated:{" "}
                          {new Date(prices[0].date).toLocaleDateString()}
                        </div>
                      </div>
                    ) : selectedProduct ? (
                      <div className="text-sm text-red-500">
                        No price found for this product
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Select a product to see price
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <label
                    htmlFor="note"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Notes
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={formData.note}
                    onChange={handleFormChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                    placeholder="Additional information about this disposal..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  disabled={
                    isSubmitting ||
                    loadingProducts ||
                    loadingWarehouses ||
                    products.length === 0 ||
                    warehouses.length === 0
                  }
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
                      {editingDisposal ? "Updating..." : "Creating..."}
                    </>
                  ) : editingDisposal ? (
                    "Update Disposal"
                  ) : (
                    "Create Disposal"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default DisposalManagement;
