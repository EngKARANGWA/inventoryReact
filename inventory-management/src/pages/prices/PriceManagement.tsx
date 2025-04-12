import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  RefreshCw,
  Tag,
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar
} from 'lucide-react';
import { priceService } from '../../services/priceService';
import { productService, Product } from '../../services/productService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PriceForm from '../../components/prices/PriceForm';
import { Sidebar } from '../../components/ui/sidebar';
import { Header } from '../../components/ui/header';

export interface Price {
  id: number;
  unitPrice: string;
  date: string;
  productId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  product: {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
  };
}

const PriceManagement: React.FC = () => {
  const [prices, setPrices] = useState<Price[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<Price | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: '',
    priceRange: ''
  });

  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts() as Product[];
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to fetch products');
    }
  };

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await priceService.getAllPrices();
      setPrices(data);
      if (data && data.length > 0 && isRefreshing) {
        toast.success('Prices refreshed successfully');
      }
    } catch (err: any) {
      console.error('Error details:', err.response?.data || err.message);
      if (!prices || prices.length === 0) {
        setError('Failed to fetch prices');
        toast.error('Failed to fetch prices');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchPrices();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPrices();
  };

  const handleAdd = () => {
    setSelectedPrice(undefined);
    setShowForm(true);
  };

  const handleEdit = (price: Price) => {
    setSelectedPrice(price);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this price?')) {
      try {
        await priceService.deletePrice(id);
        setPrices(prices.filter(price => price.id !== id));
        toast.success('Price deleted successfully', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (err) {
        console.error('Error deleting price:', err);
        toast.error('Failed to delete price', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: '',
      priceRange: ''
    });
  };

  const filteredPrices = prices.filter(price => {
    const productName = price.product.name.toLowerCase();
    return productName.includes(searchTerm.toLowerCase());
  });

  // Calculate summary data
  const totalPrices = prices.length;
  const averagePrice = prices.reduce((sum, price) => sum + Number(price.unitPrice), 0) / (prices.length || 1);
  const latestUpdate = prices.length > 0 ? 
    new Date(prices[0].updatedAt).toLocaleDateString() : 'N/A';

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (selectedPrice) {
        await priceService.updatePrice(selectedPrice.id, data);
      } else {
        await priceService.createPrice(data);
      }
      await fetchPrices();
      setShowForm(false);
      setSelectedPrice(undefined);
      toast.success(selectedPrice ? 'Price updated successfully' : 'Price added successfully');
    } catch (err) {
      console.error('Error saving price:', err);
      toast.error('Failed to save price');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 w-full">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Price Management</h1>
              <p className="text-gray-600">Manage product pricing information</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Prices</p>
                    <p className="text-2xl font-bold text-gray-800">{totalPrices}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Tag className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Average Price</p>
                    <p className="text-2xl font-bold text-gray-800">RWF{averagePrice.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-2xl font-bold text-gray-800">{latestUpdate}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search prices..."
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
                    {showFilters ? <ChevronUp size={18} className="ml-2" /> : <ChevronDown size={18} className="ml-2" />}
                  </button>
                  <button
                    onClick={handleRefresh}
                    className={`flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 ${
                      isRefreshing ? 'animate-spin' : ''
                    }`}
                    title="Refresh Prices"
                    disabled={isRefreshing}
                  >
                    <RefreshCw size={18} />
                  </button>
                  <button
                    onClick={handleAdd}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} className="mr-2" />
                    Add Price
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-3">Filter Prices</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                      <select
                        name="dateRange"
                        value={filters.dateRange}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Dates</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                      <select
                        name="priceRange"
                        value={filters.priceRange}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Prices</option>
                        <option value="0-50">$0 - $50</option>
                        <option value="50-100">$50 - $100</option>
                        <option value="100-500">$100 - $500</option>
                        <option value="500+">$500+</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md mr-2"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Prices Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Effective Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center">Loading prices...</td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-red-600">{error}</td>
                      </tr>
                    ) : filteredPrices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center">No prices found matching your criteria</td>
                      </tr>
                    ) : (
                      filteredPrices.map((price) => (
                        <tr key={price.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{price.product.name}</div>
                            <div className="text-sm text-gray-500">ID: {price.productId}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {price.product.description}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">RWF {price.unitPrice}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(price.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(price.updatedAt).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(price)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                              title="Edit Price"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(Number(price.id))}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Price"
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
            </div>
          </div>
        </main>
      </div>

      {/* Price Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {selectedPrice ? 'Edit Price' : 'Add New Price'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setSelectedPrice(undefined);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <PriceForm
              onSubmit={handleSubmit}
              onClose={() => {
                setShowForm(false);
                setSelectedPrice(undefined);
              }}
              initialData={selectedPrice}
              isSubmitting={isSubmitting}
              products={products}
            />
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default PriceManagement;