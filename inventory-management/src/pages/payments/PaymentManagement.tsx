import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { paymentService, Payment, PaginationInfo } from '../../services/paymentService';
import { Sidebar } from '../../components/ui/sidebar';
import { Header } from '../../components/ui/header';
import PaymentForm from '../../components/payments/PaymentForm';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  RefreshCw,
  CreditCard,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';


const PaymentManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 1
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    payableType: '',
    paymentMethod: ''
  });

  const fetchPayments = async (page: number, itemsPerPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentService.getAllPayments(page, itemsPerPage);
      setPayments(response.data);
      setPagination(response.pagination);
      if (response.data && response.data.length > 0 && isRefreshing) {
        toast.success('Payments refreshed successfully');
      }
    } catch (err: any) {
      console.error('Error details:', err.response?.data || err.message);
      if (!payments || payments.length === 0) {
        setError('Failed to fetch payments');
        toast.error('Failed to fetch payments');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments(currentPage, pageSize);
  }, [currentPage, pageSize, isRefreshing]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPayments(currentPage, pageSize);
  };

  const handleAdd = () => {
    setSelectedPayment(undefined);
    setShowForm(true);
  };

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await paymentService.deletePayment(id.toString());
        toast.success('Payment deleted successfully');
        fetchPayments(currentPage, pageSize);
      } catch (err) {
        console.error('Error deleting payment:', err);
        toast.error('Failed to delete payment');
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
      status: '',
      payableType: '',
      paymentMethod: ''
    });
  };

  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = 
      (payment?.paymentReference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment?.transactionReference || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || payment?.status === filters.status;
    const matchesPayableType = !filters.payableType || payment?.payableType === filters.payableType;
    const matchesPaymentMethod = !filters.paymentMethod || payment?.paymentMethod === filters.paymentMethod;
    
    return matchesSearch && matchesStatus && matchesPayableType && matchesPaymentMethod;
  }) || [];

  // Calculate summary data
  const totalPayments = payments?.length || 0;
  const completedPayments = payments?.filter(p => p?.status === 'completed').length || 0;
  const pendingPayments = payments?.filter(p => p?.status === 'pending').length || 0;
  const totalAmount = payments?.reduce((sum, p) => sum + Number(p?.amount || 0), 0) || 0;

  const formatStatus = (status: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    const statusLabels = {
      pending: 'Pending',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled'
    };
    
    const className = statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800';
    const label = statusLabels[status as keyof typeof statusLabels] || status;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
        {label}
      </span>
    );
  };

  const formatPayableType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatPaymentMethod = (method: string) => {
    const methodLabels: Record<string, string> = {
      mobile_money: 'Mobile Money',
      bank_transfer: 'Bank Transfer',
      cash: 'Cash',
      credit_card: 'Credit Card'
    };
    
    return methodLabels[method] || method;
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
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Management</h1>
              <p className="text-gray-600">Manage your payment information</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Payments</p>
                    <p className="text-2xl font-bold text-gray-800">{totalPayments}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Completed Payments</p>
                    <p className="text-2xl font-bold text-gray-800">{completedPayments}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-800">{pendingPayments}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-800">RWF{totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-600" />
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
                    placeholder="Search payments..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                <div className="flex items-center gap-2">
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
                    className={`flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 ${
                      isRefreshing ? 'animate-spin' : ''
                    }`}
                    title="Refresh Payments"
                    disabled={isRefreshing}
                  >
                    <RefreshCw size={18} />
                  </button>
                  <button
                    onClick={handleAdd}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} className="mr-2" />
                    Add Payment
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-3">Filter Payments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payable Type</label>
                      <select
                        name="payableType"
                        value={filters.payableType}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Types</option>
                        <option value="purchase">Purchase</option>
                        <option value="sale">Sale</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        name="paymentMethod"
                        value={filters.paymentMethod}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Methods</option>
                        <option value="mobile_money">Mobile Money</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="credit_card">Credit Card</option>
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

            {/* Payments Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center">Loading payments...</td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-red-600">{error}</td>
                      </tr>
                    ) : filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center">No payments found matching your criteria</td>
                      </tr>
                    ) : (
                      filteredPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{payment.paymentReference}</div>
                            {payment.transactionReference && (
                              <div className="text-xs text-gray-500">TRX: {payment.transactionReference}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatPayableType(payment.payableType)}</div>
                            <div className="text-xs text-gray-500">
                              ID: {payment.payableType === 'purchase' ? payment.purchaseId : payment.saleId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">RWF{payment.amount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatPaymentMethod(payment.paymentMethod)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {formatStatus(payment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </div>
                            {payment.paidAt && (
                              <div className="text-xs text-gray-500">
                                Paid: {new Date(payment.paidAt).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(payment)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                              title="Edit Payment"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(payment.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Payment"
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

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.pageSize) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Payment Form Modal */}
      {showForm && (
        <PaymentForm
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedPayment(undefined);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedPayment(undefined);
            fetchPayments(currentPage, pageSize);
          }}
          payment={selectedPayment}
        />
      )}
    </div>
  );
};

export default PaymentManagement; 