import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/ui/sidebar';
import { Header } from '../../components/ui/header';
import { Search, Edit2, Trash2} from 'lucide-react';
import { productService, Product } from '../../services/productService';
import ProductForm from '../../components/products/ProductForm';
import { useLocation } from 'react-router-dom';

const ProductManagement: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const skipForm = queryParams.get('skipForm') === 'true';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedProduct] = useState<string | null>(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await productService.getAllProducts();
      // Check if response is an array or has a data property
      const productsData = Array.isArray(response) ? response : (response as { data: Product[] })?.data || [];
      if (!Array.isArray(productsData)) {
        console.warn('Unexpected response format:', response);
        setProducts([]);
      } else {
        setProducts(productsData);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddProduct = () => {
    if (skipForm) {
      // If skipForm is true, directly create a product without showing the form
      const defaultProductData = {
        productId: '',
        name: '',
        description: '',
        status: 'active'
      };
      handleFormSubmit(defaultProductData);
    } else {
      setSelectedProduct(null);
      setShowProductForm(true);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        setProducts(products.filter(product => String(product.id) !== productId));
      } catch (err) {
        setError('Failed to delete product');
        console.error('Error deleting product:', err);
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (selectedProduct && selectedProduct.id) {
        await productService.updateProduct(String(selectedProduct.id), formData);
        setProducts(products.map(product => 
          String(product.id) === String(selectedProduct.id) ? { ...product, ...formData } : product
        ));
      } else {
        const newProduct = await productService.createProduct(formData) as Product;
        setProducts([...products, newProduct]);
      }
      setShowProductForm(false);
      setSelectedProduct(null);
    } catch (err) {
      setError('Failed to save product');
      console.error('Error saving product:', err);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary data
  const totalProducts = products.length;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 w-full">
          <div className="max-w-7xl mx-auto">
            {/* Enhanced Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Product Management</h1>
              <p className="text-gray-600">Manage your products</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Products</p>
                    <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
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
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddProduct}
                    className="x-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    + Add Product
                  </button>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-winder'>Description</th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-winder'>Created at</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center">Loading...</td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-red-600">{error}</td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center">No products found</td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <React.Fragment key={product.id}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.description}</td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                              {new Date(product.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                                title="Edit Product"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => product.id && handleDeleteProduct(String(product.id))}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Product"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                          {expandedProduct && String(product.id) === expandedProduct && (
                            <tr>
                              <td colSpan={5} className="px-6 py-4 bg-gray-50">
                                <div className="text-sm">
                                  <h4 className="font-medium text-gray-900 mb-2">Product Details</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <p className="font-medium text-gray-700">Description</p>
                                      <p className="text-gray-600">{product.description || 'N/A'}</p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {selectedProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setShowProductForm(false);
                  setSelectedProduct(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ProductForm
              onSubmit={handleFormSubmit}
              onClose={() => {
                setShowProductForm(false);
                setSelectedProduct(null);
              }}
              initialData={selectedProduct || undefined}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;