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
  Factory,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Eye,
  X,
  Banknote,
  XCircle,
  Layers,
  DollarSign,
  Info,
} from "lucide-react";
import { productionService } from "../../services/productionServices";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// Improved interface organization with better documentation
interface FilterParams {
  productId?: string;
  startDate?: string;
  endDate?: string;
  mainProductId?: string; // Added filter for main product
}

interface DailyPrice {
  id: number;
  buyingUnitPrice: number | null;
  sellingUnitPrice: number | null;
  date: string;
  productId: number;
  product?: Product;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  unit?: string; // Added unit for better display
}

interface User {
  id: number;
  username: string;
  email?: string;
  profile?: {
    names?: string;
  };
}

interface Warehouse {
  id: number;
  name: string;
  location?: string;
}

interface ProductionCost {
  id?: number; // Added optional id for better editing
  description: string;
  amount: number;
}

interface Production {
  id: number;
  referenceNumber: string;
  productId: number;
  quantityProduced: number;
  mainProductId?: number | null;
  usedQuantity?: number | null;
  date: string;
  productionCost: ProductionCost[];
  userId: number;
  notes?: string;
  product?: Product;
  mainProduct?: Product | null;
  createdBy?: User;
  warehouseId?: number | null;
  warehouse?: Warehouse | null;
  dailyPrice?: DailyPrice | null;
  // Added efficiency metrics
  efficiency?: number;
  wastePercentage?: number;
}

const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";

const ProductionManagement: React.FC = () => {
  // State organization by category
  // Data state
  const [productions, setProductions] = useState<Production[]>([]);
  const [totalProductions, setTotalProductions] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);

  // Filter/Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({});

  // Modal state
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProduction, setSelectedProduction] =
    useState<Production | null>(null);
  const [editingProduction, setEditingProduction] = useState<Production | null>(
    null
  );

  // Form state
  const [formData, setFormData] = useState({
    productId: "",
    quantityProduced: "",
    mainProductId: "",
    usedQuantity: "",
    warehouseId: "",
    notes: "",
    productionCost: [] as ProductionCost[],
    efficiency: "", // Added efficiency field
    wastePercentage: "", // Added waste percentage field
  });

  const [formErrors, setFormErrors] = useState({
    productId: "",
    quantityProduced: "",
    mainProductId: "",
    usedQuantity: "",
    efficiency: "",
    wastePercentage: "",
  });

  // Pagination/Sorting
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Production;
    direction: "ascending" | "descending";
  } | null>(null);

  // Operation state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalProductions / pageSize);

  // Memoized data calculations
  const totalQuantity = React.useMemo(
    () =>
      productions.reduce((sum, p) => sum + Number(p.quantityProduced || 0), 0),
    [productions]
  );

  const calculateProductionCost = useCallback(
    (production: Production): number => {
      const productionCosts =
        production.productionCost?.reduce(
          (sum, cost) => sum + (cost.amount || 0),
          0
        ) || 0;

      const buyPriceCost =
        production.dailyPrice?.buyingUnitPrice && production.usedQuantity
          ? production.dailyPrice.buyingUnitPrice * production.usedQuantity
          : 0;

      return productionCosts + buyPriceCost;
    },
    []
  );

  const totalCost = React.useMemo(
    () => productions.reduce((sum, p) => sum + calculateProductionCost(p), 0),
    [productions, calculateProductionCost]
  );

  // Improved fetch functions with better error handling
  const fetchProductions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { rows, count } = await productionService.getAllProductions(
        page,
        pageSize,
        searchTerm,
        filters
      );
      setProductions((rows as Production[]) || []);
      setTotalProductions(count || 0);
    } catch (err) {
      console.error("Error fetching productions:", err);
      setError("Failed to fetch productions. Please try again later.");
      toast.error("Failed to load productions");
      setProductions([]);
      setTotalProductions(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm, filters]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params: {
          activeOnly: true, // Added filter for active products only
        },
      });
      const productsData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setProducts(productsData);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load products");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchWarehouses = useCallback(async () => {
    setLoadingWarehouses(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/warehouse`, {
        params: {
          activeOnly: true, // Added filter for active warehouses only
        },
      });
      const warehousesData = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];
      setWarehouses(warehousesData);
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      toast.error("Failed to load warehouses");
      setWarehouses([]);
    } finally {
      setLoadingWarehouses(false);
    }
  }, []);

  // Fetch data on component mount and when dependencies change
  useEffect(() => {
    fetchProductions();
  }, [fetchProductions]);

  useEffect(() => {
    if (showAddForm || showFilters) {
      fetchProducts();
      fetchWarehouses();
    }
  }, [showAddForm, showFilters, fetchProducts, fetchWarehouses]);

  // Improved handler functions
  const handleRefresh = useCallback(() => {
    fetchProductions();
    toast.success("Data refreshed successfully");
  }, [fetchProductions]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
      }
    },
    [totalPages]
  );

  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSize = Number(e.target.value);
      setPageSize(newSize);
      setPage(1); // Reset to first page when changing page size
    },
    []
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  }, []);

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFilters((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const applyFilters = useCallback(() => {
    setPage(1);
    fetchProductions();
  }, [fetchProductions]);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
    fetchProductions();
  }, [fetchProductions]);

  // Form handling functions
  const handleAddClick = useCallback(() => {
    setFormData({
      productId: "",
      quantityProduced: "",
      mainProductId: "",
      usedQuantity: "",
      warehouseId: "",
      notes: "",
      productionCost: [],
      efficiency: "",
      wastePercentage: "",
    });
    setEditingProduction(null);
    setShowAddForm(true);
  }, []);

  const handleEditClick = useCallback((production: Production) => {
    setFormData({
      productId: String(production.productId),
      quantityProduced: String(production.quantityProduced),
      mainProductId: production.mainProductId
        ? String(production.mainProductId)
        : "",
      usedQuantity: production.usedQuantity
        ? String(production.usedQuantity)
        : "",
      warehouseId: production.warehouseId ? String(production.warehouseId) : "",
      notes: production.notes || "",
      productionCost: production.productionCost || [],
      efficiency: production.efficiency ? String(production.efficiency) : "",
      wastePercentage: production.wastePercentage
        ? String(production.wastePercentage)
        : "",
    });
    setEditingProduction(production);
    setShowAddForm(true);
  }, []);

  const handleViewClick = useCallback((production: Production) => {
    setSelectedProduction(production);
    setShowViewModal(true);
  }, []);

  const handleDeleteProduction = useCallback(
    async (productionId: number) => {
      if (
        window.confirm(
          "Are you sure you want to delete this production batch? This action cannot be undone."
        )
      ) {
        try {
          await productionService.deleteProduction(productionId);
          setProductions((prev) => prev.filter((p) => p.id !== productionId));
          toast.success("Production batch deleted successfully");

          // If we're on the last page with one item, go back a page
          if (productions.length === 1 && page > 1) {
            setPage(page - 1);
          }
        } catch (err: any) {
          console.error("Error deleting production:", err);
          toast.error(err.message || "Failed to delete production batch");
        }
      }
    },
    [productions.length, page]
  );

  // Improved form handling with better validation
  const validateForm = useCallback(() => {
    const errors = {
      productId: !formData.productId ? "Product is required" : "",
      quantityProduced:
        !formData.quantityProduced || parseFloat(formData.quantityProduced) <= 0
          ? "Valid quantity is required (must be greater than 0)"
          : "",
      mainProductId:
        formData.mainProductId && !formData.usedQuantity
          ? "Used quantity is required when main product is selected"
          : "",
      usedQuantity:
        formData.usedQuantity && parseFloat(formData.usedQuantity) <= 0
          ? "Valid used quantity is required (must be greater than 0)"
          : formData.mainProductId && !formData.usedQuantity
          ? "Used quantity is required"
          : "",
      efficiency:
        formData.efficiency &&
        (parseFloat(formData.efficiency) < 0 ||
          parseFloat(formData.efficiency) > 100)
          ? "Efficiency must be between 0 and 100"
          : "",
      wastePercentage:
        formData.wastePercentage &&
        (parseFloat(formData.wastePercentage) < 0 ||
          parseFloat(formData.wastePercentage) > 100)
          ? "Waste percentage must be between 0 and 100"
          : "",
    };

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  }, [formData]);

  const handleFormChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Clear error when field is changed
      if (formErrors[name as keyof typeof formErrors]) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: "",
        }));
      }
    },
    [formErrors]
  );

  const handleCostItemChange = useCallback(
    (index: number, field: keyof ProductionCost, value: string) => {
      const updatedCosts = [...formData.productionCost];
      updatedCosts[index] = {
        ...updatedCosts[index],
        [field]: field === "amount" ? parseFloat(value) || 0 : value,
      };
      setFormData((prev) => ({
        ...prev,
        productionCost: updatedCosts,
      }));
    },
    [formData.productionCost]
  );

  const addCostItem = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      productionCost: [...prev.productionCost, { description: "", amount: 0 }],
    }));
  }, []);

  const removeCostItem = useCallback(
    (index: number) => {
      const updatedCosts = formData.productionCost.filter(
        (_, i) => i !== index
      );
      setFormData((prev) => ({
        ...prev,
        productionCost: updatedCosts,
      }));
    },
    [formData.productionCost]
  );

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        toast.error("Please fix the errors in the form");
        return;
      }

      setIsSubmitting(true);

      try {
        const productionData = {
          productId: Number(formData.productId),
          quantityProduced: parseFloat(formData.quantityProduced),
          mainProductId: formData.mainProductId
            ? Number(formData.mainProductId)
            : undefined,
          usedQuantity: formData.usedQuantity
            ? parseFloat(formData.usedQuantity)
            : undefined,
          warehouseId: formData.warehouseId
            ? Number(formData.warehouseId)
            : undefined,
          notes: formData.notes,
          productionCost: formData.productionCost,
          efficiency: formData.efficiency
            ? parseFloat(formData.efficiency)
            : undefined,
          wastePercentage: formData.wastePercentage
            ? parseFloat(formData.wastePercentage)
            : undefined,
        };

        if (editingProduction) {
          await productionService.updateProduction(
            editingProduction.id,
            productionData
          );
          toast.success("Production batch updated successfully");
        } else {
          await productionService.createProduction(productionData);
          toast.success("Production batch created successfully");
        }

        setShowAddForm(false);
        fetchProductions();
      } catch (err: any) {
        console.error("Error saving production:", err);
        toast.error(err.message || "Failed to save production batch");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, editingProduction, validateForm, fetchProductions]
  );

  const requestSort = useCallback(
    (key: keyof Production) => {
      let direction: "ascending" | "descending" = "ascending";
      if (sortConfig?.key === key && sortConfig.direction === "ascending") {
        direction = "descending";
      }
      setSortConfig({ key, direction });
    },
    [sortConfig]
  );

  const sortedProductions = React.useMemo(() => {
    if (!sortConfig) return productions;

    return [...productions].sort((a, b) => {
      let aValue: any, bValue: any;

      // Handle calculated fields
      if (sortConfig.key === "cost") {
        aValue = calculateProductionCost(a);
        bValue = calculateProductionCost(b);
      } else {
        // Handle direct properties
        aValue = a[sortConfig.key as keyof Production] ?? "";
        bValue = b[sortConfig.key as keyof Production] ?? "";
      }

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [productions, sortConfig, calculateProductionCost]);

  const calculateEfficiency = useCallback(
    (production: Production): number | null => {
      if (!production.usedQuantity || !production.quantityProduced) return null;
      return (production.quantityProduced / production.usedQuantity) * 100;
    },
    []
  );

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }, []);

  // Render functions for better organization
  const renderSummaryCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Batches</p>
            <p className="text-2xl font-bold text-gray-800">
              {totalProductions}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Factory className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Produced</p>
            <p className="text-2xl font-bold text-gray-800">
              {totalQuantity.toLocaleString()} Kg
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
            <p className="text-sm font-medium text-gray-500">Total Cost</p>
            <p className="text-2xl font-bold text-gray-800">
              {formatCurrency(totalCost)}
            </p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Banknote className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Avg Efficiency</p>
            <p className="text-2xl font-bold text-gray-800">
              {productions.length > 0
                ? `${
                    productions.reduce(
                      (sum, p) => sum + (calculateEfficiency(p) || 0),
                      0
                    ) / productions.length
                  }%`
                : "N/A"}
            </p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Info className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderActionBar = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by reference, product, notes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
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
            Add Batch
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-700">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <XCircle size={16} />
              Clear Filters
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              <select
                name="productId"
                value={filters.productId || ""}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Products</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Main Product
              </label>
              <select
                name="mainProductId"
                value={filters.mainProductId || ""}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Main Products</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate || ""}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate || ""}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderProductionTable = () => {
    const columns = [
      { key: "referenceNumber", label: "Reference", sortable: true },
      { key: "product", label: "Product", sortable: true },
      { key: "quantityProduced", label: "Quantity", sortable: true },
      { key: "date", label: "Date", sortable: true },
      { key: "efficiency", label: "Efficiency", sortable: true },
      { key: "actions", label: "Actions", sortable: false },
    ];

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                    }`}
                    onClick={() =>
                      column.sortable &&
                      requestSort(column.key as keyof Production)
                    }
                  >
                    <div className="flex items-center">
                      {column.label}
                      {sortConfig?.key === column.key && (
                        <span className="ml-1">
                          {sortConfig.direction === "ascending" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-4 text-center"
                  >
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-4 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : sortedProductions.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No production batches found.{" "}
                    {searchTerm && "Try a different search term."}
                  </td>
                </tr>
              ) : (
                sortedProductions.map((production) => (
                  <tr key={production.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">
                        {production.referenceNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {production.product?.name || "N/A"}
                      </div>
                      {production.mainProduct && (
                        <div className="text-xs text-gray-500">
                          From: {production.mainProduct.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {production.quantityProduced.toLocaleString()} Kg
                      </div>
                      {production.usedQuantity && (
                        <div className="text-xs text-gray-500">
                          Used: {production.usedQuantity.toLocaleString()} Kg
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {formatDate(production.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {formatCurrency(calculateProductionCost(production))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {production.efficiency
                          ? `${production.efficiency.toFixed(2)}%`
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleViewClick(production)}
                        className="text-purple-600 hover:text-purple-900"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEditClick(production)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduction(production.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
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

        {totalProductions > 0 && (
          <div className="bg-gray-50 px-6 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
            <div className="flex items-center mb-2 sm:mb-0">
              <span className="text-sm text-gray-700 mr-2">
                Showing {(page - 1) * pageSize + 1}-
                {Math.min(page * pageSize, totalProductions)} of{" "}
                {totalProductions}
              </span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    Show {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={page === 1}
                className={`px-3 py-1 rounded ${
                  page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`px-3 py-1 rounded ${
                  page === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className={`px-3 py-1 rounded ${
                  page >= totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={page >= totalPages}
                className={`px-3 py-1 rounded ${
                  page >= totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAddEditForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingProduction
              ? "Edit Production Batch"
              : "Add New Production Batch"}
          </h2>
          <button
            onClick={() => setShowAddForm(false)}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product <span className="text-red-500">*</span>
                </label>
                {loadingProducts ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    <select
                      name="productId"
                      value={formData.productId}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 border ${
                        formErrors.productId
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                      disabled={isSubmitting || loadingProducts}
                    >
                      <option value="">Select a product</option>
                      {products
                        .filter(
                          (p) =>
                            !formData.mainProductId ||
                            p.id !== Number(formData.mainProductId)
                        )
                        .map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}{" "}
                            {product.unit ? `(${product.unit})` : ""}
                          </option>
                        ))}
                    </select>
                    {formErrors.productId && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.productId}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Produced <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantityProduced"
                  value={formData.quantityProduced}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.quantityProduced
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  min="0.01"
                  step="0.01"
                  disabled={isSubmitting}
                  placeholder="e.g. 100.50"
                />
                {formErrors.quantityProduced && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.quantityProduced}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Product
                </label>
                {loadingProducts ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <>
                    <select
                      name="mainProductId"
                      value={formData.mainProductId}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 border ${
                        formErrors.mainProductId
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      disabled={isSubmitting || loadingProducts}
                    >
                      <option value="">Select main product (optional)</option>
                      {products
                        .filter(
                          (p) =>
                            !formData.productId ||
                            p.id !== Number(formData.productId)
                        )
                        .map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}{" "}
                            {product.unit ? `(${product.unit})` : ""}
                          </option>
                        ))}
                    </select>
                    {formErrors.mainProductId && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.mainProductId}
                      </p>
                    )}
                  </>
                )}
              </div>

              {formData.mainProductId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity Used <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="usedQuantity"
                    value={formData.usedQuantity}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.usedQuantity
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    min="0.01"
                    step="0.01"
                    disabled={isSubmitting}
                    placeholder="e.g. 50.25"
                  />
                  {formErrors.usedQuantity && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.usedQuantity}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warehouse
                </label>
                {loadingWarehouses ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <select
                    name="warehouseId"
                    value={formData.warehouseId}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value="">Select warehouse (optional)</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}{" "}
                        {warehouse.location ? `(${warehouse.location})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                  placeholder="Any additional notes about this production..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Efficiency (%)
                  </label>
                  <input
                    type="number"
                    name="efficiency"
                    value={formData.efficiency}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.efficiency
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={isSubmitting}
                    placeholder="0-100%"
                  />
                  {formErrors.efficiency && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.efficiency}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waste (%)
                  </label>
                  <input
                    type="number"
                    name="wastePercentage"
                    value={formData.wastePercentage}
                    onChange={handleFormChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.wastePercentage
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    min="0"
                    max="100"
                    step="0.01"
                    disabled={isSubmitting}
                    placeholder="0-100%"
                  />
                  {formErrors.wastePercentage && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.wastePercentage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Production Costs
            </label>
            <div className="space-y-3">
              {formData.productionCost.map((cost, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Cost description"
                      value={cost.description}
                      onChange={(e) =>
                        handleCostItemChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={cost.amount}
                      onChange={(e) =>
                        handleCostItemChange(index, "amount", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCostItem(index)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Remove cost"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCostItem}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-2"
              >
                <Plus size={16} className="mr-1" />
                Add Cost Item
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
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
                  {editingProduction ? "Saving..." : "Creating..."}
                </>
              ) : editingProduction ? (
                "Save Changes"
              ) : (
                "Create Production"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderViewModal = () => {
    if (!selectedProduction) return null;

    const totalMaterialCost =
      selectedProduction.dailyPrice?.buyingUnitPrice &&
      selectedProduction.usedQuantity
        ? selectedProduction.dailyPrice.buyingUnitPrice *
          selectedProduction.usedQuantity
        : 0;

    const totalProductionCost =
      selectedProduction.productionCost?.reduce(
        (sum, cost) => sum + (cost.amount || 0),
        0
      ) || 0;

    const totalCost = totalMaterialCost + totalProductionCost;
    const unitCost = totalCost / selectedProduction.quantityProduced;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Production Batch Details - {selectedProduction.referenceNumber}
            </h2>
            <button
              onClick={() => setShowViewModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Production Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Package className="mr-2" size={18} />
                  Production Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Product</p>
                    <p className="text-sm font-medium">
                      {selectedProduction.product?.name || "N/A"}
                      {selectedProduction.product?.description && (
                        <span className="text-gray-500 block mt-1">
                          {selectedProduction.product.description}
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity Produced</p>
                    <p className="text-sm font-medium">
                      {selectedProduction.quantityProduced.toLocaleString()} Kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Production Date</p>
                    <p className="text-sm font-medium">
                      {formatDate(selectedProduction.date)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Warehouse</p>
                    <p className="text-sm font-medium">
                      {selectedProduction.warehouse?.name || "N/A"}
                      {selectedProduction.warehouse?.location && (
                        <span className="text-gray-500 block mt-1">
                          {selectedProduction.warehouse.location}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Product Details */}
              {selectedProduction.mainProduct && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Layers className="mr-2" size={18} />
                    Raw Material Used
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Main Product</p>
                      <p className="text-sm font-medium">
                        {selectedProduction.mainProduct.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Quantity Used</p>
                      <p className="text-sm font-medium">
                        {selectedProduction.usedQuantity?.toLocaleString()} Kg
                      </p>
                    </div>
                    {selectedProduction.dailyPrice?.buyingUnitPrice && (
                      <div>
                        <p className="text-sm text-gray-500">Buy Price</p>
                        <p className="text-sm font-medium">
                          {formatCurrency(
                            selectedProduction.dailyPrice.buyingUnitPrice
                          )}{" "}
                          per Kg
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">
                        Total Material Cost
                      </p>
                      <p className="text-sm font-medium">
                        {formatCurrency(totalMaterialCost)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Efficiency Metrics */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Info className="mr-2" size={18} />
                Efficiency Metrics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Efficiency</p>
                  <p className="text-xl font-medium">
                    {selectedProduction.efficiency
                      ? `${selectedProduction.efficiency.toFixed(2)}%`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Waste Percentage</p>
                  <p className="text-xl font-medium">
                    {selectedProduction.wastePercentage
                      ? `${selectedProduction.wastePercentage.toFixed(2)}%`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cost per Unit</p>
                  <p className="text-xl font-medium">
                    {formatCurrency(unitCost)}
                  </p>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <DollarSign className="mr-2" size={18} />
                Cost Breakdown
              </h3>
              <div className="space-y-4">
                {/* Material Costs */}
                {selectedProduction.mainProduct && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Material Costs
                    </p>
                    <div className="bg-white p-3 rounded-md border border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">
                            {selectedProduction.mainProduct.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedProduction.usedQuantity} Kg ×{" "}
                            {formatCurrency(
                              selectedProduction.dailyPrice?.buyingUnitPrice ||
                                0
                            )}
                            /Kg
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {formatCurrency(totalMaterialCost)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Production Costs */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Production Costs
                  </p>
                  {selectedProduction.productionCost?.length > 0 ? (
                    <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {selectedProduction.productionCost.map(
                            (cost, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                  {cost.description}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                  {formatCurrency(cost.amount)}
                                </td>
                              </tr>
                            )
                          )}
                          <tr className="bg-gray-50">
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              Total Production Costs
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                              {formatCurrency(totalProductionCost)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 py-2">
                      No additional production costs recorded
                    </p>
                  )}
                </div>

                {/* Total Cost */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-medium text-gray-900">
                      Total Production Cost
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(totalCost)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-sm text-gray-500">Cost per Unit</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatCurrency(unitCost)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedProduction.notes && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                  <Info className="mr-2" size={18} />
                  Notes
                </h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {selectedProduction.notes}
                </p>
              </div>
            )}

            {/* Created By */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
                <Info className="mr-2" size={18} />
                Record Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Created By</p>
                  <p className="text-sm font-medium">
                    {selectedProduction.createdBy?.username || "Unknown"}
                    {selectedProduction.createdBy?.profile?.names && (
                      <span className="text-gray-500 block">
                        {selectedProduction.createdBy.profile.names}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium">
                    {formatDate(selectedProduction.date)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditClick(selectedProduction);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Edit Production
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 w-full p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Production Batch Management
              </h1>
              <p className="text-gray-600">
                Track and manage all production batches, raw material usage, and
                costs
              </p>
            </div>

            {renderSummaryCards()}
            {renderActionBar()}
            {renderProductionTable()}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showAddForm && renderAddEditForm()}
      {showViewModal && renderViewModal()}

      {/* Toast Container */}
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
      />
    </div>
  );
};

export default ProductionManagement;
