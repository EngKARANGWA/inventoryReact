import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, RefreshCw } from 'lucide-react';
import { productService, Product } from '../../services/productService';
import ProductForm from './ProductForm';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionType, setActionType] = useState<'add' | 'edit' | 'delete' | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAllProducts() as Product[];
      setProducts(data);
      setIsDataLoaded(true);
      toast.success('Products refreshed successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
      toast.error('Failed to fetch products', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProducts();
  };

  const handleAdd = () => {
    setSelectedProduct(undefined);
    setActionType('add');
    setShowForm(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setActionType('edit');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      setActionType('delete');
      await productService.deleteProduct(id);
      await fetchProducts();
      toast.success('Product deleted successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      setError('Failed to delete product');
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      if (selectedProduct) {
        await productService.updateProduct(selectedProduct.id, data);
      } else {
        await productService.createProduct(data);
      }
      await fetchProducts();
      setShowForm(false);
      setSelectedProduct(undefined);
      
      // Show specific success message based on action type
      if (actionType === 'add') {
        toast.success('Product added successfully', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else if (actionType === 'edit') {
        toast.success('Product edited successfully', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      setError('Failed to save product');
      console.error('Error saving product:', err);
      toast.error('Failed to save product', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
      setActionType(null);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Auto-refresh data when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Product Management</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your product inventory</p>
      </div>

      {!isDataLoaded ? (
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">No Products Loaded</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Click the button below to load products</p>
          <button
            onClick={fetchProducts}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={18} className="mr-2" />
            Load Products
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={18} className="mr-2" />
                  Add Product
                </button>
                <button
                  onClick={handleRefresh}
                  className={`flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                  title="Refresh Products"
                  disabled={isRefreshing}
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded dark:bg-red-900/50 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Updated Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {product.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {product.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {new Date(product.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.deletedAt 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                        }`}>
                          {product.deletedAt ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 mr-4 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit Product"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(String(product.id))}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Product"
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
        </>
      )}

      {showForm && (
        <ProductForm
          onSubmit={handleSubmit}
          onClose={() => {
            setShowForm(false);
            setSelectedProduct(undefined);
            setActionType(null);
          }}
          initialData={selectedProduct}
          isSubmitting={isSubmitting}
          onRefresh={fetchProducts}
        />
      )}
    </div>
  );
};

export default ProductList; 