import React, { useState, useEffect, useMemo } from "react";
import { Sidebar } from "../../components/ui/sidebar";
import { Header } from "../../components/ui/header";
import {
  Search,
  Plus,
  Package,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Info,
  AlertCircle,
  X,
  Eye,
} from "lucide-react";
import { returnsService, Return } from "../../services/returnsService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Select from "react-select";

interface Sale {
  id: number;
  referenceNumber: string;
  quantity: string;
  productId: number;
  product: {
    id: number;
    name: string;
  };
}

// interface StockMovement {
//   id: number;
//   referenceNumber: string;
//   productId: number;
//   quantity: string;
//   direction: "in" | "out";
//   warehouseId: number;
//   sourceType: string;
//   movementDate: string;
//   notes: string | null;
//   warehouse: {
//     id: number;
//     name: string;
//   };
//   // Other properties from the API response
//   deliveryId: number | null;
//   productionId: number | null;
//   transferId: number | null;
//   saleId: number | null;
//   returnsId: number | null;
//   disposalId: number | null;
//   userId: number;
//   createdAt: string;
//   updatedAt: string;
//   deletedAt: string | null;
// }

interface SortConfig {
  key: keyof Return;
  direction: "ascending" | "descending";
}

const ReturnsManagement: React.FC = () => {
  const [allReturns, setAllReturns] = useState<Return[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  // const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });
  const [selectedSaleId] = useState<string>("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesSearch, setSalesSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [selectedReturn, setSelectedReturn] = useState<Return | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [formData, setFormData] = useState({
    saleId: "",
    returnedQuantity: "",
    note: "",
  });

  useEffect(() => {
    fetchReturns();
  }, []);

  useEffect(() => {
    if (showAddForm) {
      fetchSales();
    }
  }, [showAddForm]);

  const fetchReturns = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await returnsService.getAllReturns();
      setAllReturns(data);
      setFilteredReturns(data);
      setPagination(prev => ({
        ...prev,
        total: data.length,
        totalPages: Math.ceil(data.length / prev.pageSize),
      }));
    } catch (err) {
      console.error("Error fetching returns:", err);
      setError("Failed to fetch returns. Please try again later.");
      toast.error("Failed to load returns");
      setAllReturns([]);
      setFilteredReturns([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    setSalesLoading(true);
    try {
      const response = await axios.get(
        "https://test.gvibyequ.a2hosted.com/api/sales",
        {
          params: {
            page: 1,
            pageSize: 100,
            search: salesSearch,
          },
        }
      );
      setSales(response.data.data);
    } catch (err) {
      console.error("Error fetching sales:", err);
      toast.error("Failed to load sales");
      setSales([]);
    } finally {
      setSalesLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm || selectedSaleId) {
      const filtered = allReturns.filter((ret) => {
        const matchesSearch = searchTerm
          ? ret.referenceNumber
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (ret.note &&
              ret.note.toLowerCase().includes(searchTerm.toLowerCase()))
          : true;

        const matchesSale = selectedSaleId
          ? ret.saleId === Number(selectedSaleId)
          : true;

        return matchesSearch && matchesSale;
      });

      setFilteredReturns(filtered);
      setPagination(prev => ({
        ...prev,
        page: 1,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / prev.pageSize),
      }));
    } else {
      setFilteredReturns(allReturns);
      setPagination(prev => ({
        ...prev,
        total: allReturns.length,
        totalPages: Math.ceil(allReturns.length / prev.pageSize),
      }));
    }
  }, [searchTerm, selectedSaleId, allReturns]);

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
    const start = (pagination.page - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return sortedReturns.slice(start, end);
  }, [sortedReturns, pagination.page, pagination.pageSize]);

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

  const handleAddClick = () => {
    setFormData({
      saleId: "",
      returnedQuantity: "",
      note: "",
    });
    setShowAddForm(true);
  };

  const handleRefresh = () => {
    fetchReturns();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = Number(e.target.value);
    setPagination(prev => ({
      ...prev,
      pageSize: newPageSize,
      page: 1,
      totalPages: Math.ceil(prev.total / newPageSize),
    }));
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const returnData = {
        saleId: Number(formData.saleId),
        returnedQuantity: Number(formData.returnedQuantity),
        note: formData.note || undefined,
      };

      const newReturn = await returnsService.createReturn(returnData);
      setAllReturns(prev => [newReturn, ...prev]);
      toast.success("Return created successfully");
      setShowAddForm(false);
      fetchReturns();
    } catch (err: any) {
      console.error("Error creating return:", err);
      toast.error(err.message || "Failed to create return");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewReturn = (returnItem: Return) => {
    setSelectedReturn(returnItem);
    setShowViewModal(true);
  };

  const totalReturns = allReturns.length;
  const totalReturnedQuantity = allReturns.reduce(
    (sum, ret) => sum + parseFloat(ret.returnedQuantity || "0"),
    0
  );
  const uniqueProducts = new Set(allReturns.map(ret => ret.productId)).size;
  const uniqueSales = new Set(allReturns.map(ret => ret.saleId)).size;

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const salesOptions = sales.map(sale => ({
    value: sale.id,
    label: `${sale.referenceNumber} - ${sale.product?.name} (${sale.quantity} KG)`,
  }));

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 w-full p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Returns Management
              </h1>
              <p className="text-gray-600">
                Track and manage product returns and inventory adjustments
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Returns
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalReturns}
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
                      Total Quantity Returned
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {totalReturnedQuantity.toFixed(2)} KG
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Unique Products
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {uniqueProducts}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Info className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Unique Sales
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {uniqueSales}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search returns by reference or note..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="flex gap-2">
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
                    Record Return
                  </button>
                </div>
              </div>
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
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("saleId")}
                      >
                        <div className="flex items-center">
                          Sale Reference
                          {sortConfig?.key === "saleId" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("productId")}
                      >
                        <div className="flex items-center">
                          Product
                          {sortConfig?.key === "productId" && (
                            <span className="ml-1">
                              {sortConfig.direction === "ascending" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort("returnedQuantity")}
                      >
                        <div className="flex items-center">
                          Quantity
                          {sortConfig?.key === "returnedQuantity" && (
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
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 text-center text-red-600"
                        >
                          {error}
                        </td>
                      </tr>
                    ) : paginatedReturns.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No returns found.{" "}
                          {(searchTerm || selectedSaleId) &&
                            "Try adjusting your filters."}
                        </td>
                      </tr>
                    ) : (
                      paginatedReturns.map(ret => (
                        <tr key={ret.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-blue-600">
                              {ret.referenceNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {ret.sale?.referenceNumber ||
                                `Sale #${ret.saleId}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {ret.product?.name || `Product #${ret.productId}`}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {parseFloat(ret.returnedQuantity).toFixed(2)} KG
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(ret.date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleViewReturn(ret)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                              title="View details"
                            >
                              <Eye size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 px-6 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
                <div className="flex items-center mb-2 sm:mb-0">
                  <span className="text-sm text-gray-700 mr-2">
                    Showing {(pagination.page - 1) * pagination.pageSize + 1}-
                    {Math.min(
                      pagination.page * pagination.pageSize,
                      filteredReturns.length
                    )}{" "}
                    of {filteredReturns.length}
                  </span>
                  <select
                    value={pagination.pageSize}
                    onChange={handlePageSizeChange}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    {[5, 10, 20, 50].map(size => (
                      <option key={size} value={size}>
                        Show {size}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={pagination.page === 1}
                    className={`px-3 py-1 rounded ${
                      pagination.page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    First
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className={`px-3 py-1 rounded ${
                      pagination.page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className={`px-3 py-1 rounded ${
                      pagination.page >= pagination.totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.totalPages)}
                    disabled={pagination.page >= pagination.totalPages}
                    className={`px-3 py-1 rounded ${
                      pagination.page >= pagination.totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Record New Return</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="saleId"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Sale <span className="text-red-500">*</span>
                  </label>
                  <Select
                    id="saleId"
                    name="saleId"
                    options={salesOptions}
                    isLoading={salesLoading}
                    onInputChange={value => {
                      setSalesSearch(value);
                      fetchSales();
                    }}
                    onChange={selectedOption => {
                      setFormData(prev => ({
                        ...prev,
                        saleId: selectedOption?.value.toString() || "",
                      }));
                    }}
                    value={salesOptions.find(
                      option => option.value.toString() === formData.saleId
                    )}
                    placeholder="Search and select sale..."
                    className="basic-single"
                    classNamePrefix="select"
                    isClearable
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="returnedQuantity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Returned Quantity (KG){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="returnedQuantity"
                    name="returnedQuantity"
                    value={formData.returnedQuantity}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="0.01"
                    step="0.01"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    disabled={isSubmitting}
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
                      Processing...
                    </>
                  ) : (
                    "Record Return"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Return Details</h2>
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
                        {selectedReturn.referenceNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Product</p>
                      <p className="text-sm font-medium">
                        {selectedReturn.product?.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantity Returned</p>
                      <p className="text-sm font-medium">
                        {parseFloat(selectedReturn.returnedQuantity).toFixed(2)}{" "}
                        KG
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
                      <p className="text-sm text-gray-500">Return Date</p>
                      <p className="text-sm font-medium">
                        {formatDate(selectedReturn.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Original Sale</p>
                      <p className="text-sm font-medium">
                        {selectedReturn.sale?.referenceNumber ||
                          `Sale #${selectedReturn.saleId}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="text-sm font-medium">
                        {selectedReturn.note || "No notes provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Stock Movement Details
                </h3>
                {selectedReturn.stockMovements &&
                selectedReturn.stockMovements.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Movement Reference
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Warehouse
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedReturn.stockMovements.map((movement: any) => (
                          <tr key={movement.id}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {movement.referenceNumber}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {movement.warehouse?.name || "N/A"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(movement.movementDate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No stock movement recorded for this return
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

export default ReturnsManagement;