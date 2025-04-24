import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { Delivery, deliveryService } from "../../services/deliveryService";
import axios from "axios";

const API_BASE_URL = "https://test.gvibyequ.a2hosted.com/api";

interface DeliveryFormProps {
  editingDelivery: Delivery | null;
  setShowAddForm: React.Dispatch<React.SetStateAction<boolean>>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setDeliveries: React.Dispatch<React.SetStateAction<Delivery[]>>;
  setTotalDeliveries: React.Dispatch<React.SetStateAction<number>>;
  deliveries: Delivery[];
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({
  editingDelivery,
  setShowAddForm,
  isSubmitting,
  setIsSubmitting,
  setDeliveries,
  setTotalDeliveries,
  deliveries,
}) => {
  const [formData, setFormData] = useState({
    direction: "in" as "in" | "out",
    quantity: "",
    driverId: "",
    productId: "",
    warehouseId: "",
    purchaseId: "",
    saleId: "",
    notes: "",
  });

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [loadingSales, setLoadingSales] = useState(false);
  const [salesSearch, setSalesSearch] = useState("");
  const [purchasesSearch, setPurchasesSearch] = useState("");

  const [products, setProducts] = useState<
    { id: number; name: string; description: string }[]
  >([]);
  const [warehouses, setWarehouses] = useState<
    { id: number; name: string; location: string }[]
  >([]);
  const [drivers, setDrivers] = useState<
    { id: number; driverId: string; user: { profile?: { names: string } } }[]
  >([]);
  const [purchases, setPurchases] = useState<
    {
      id: number;
      purchaseReference: string;
      description: string;
      product?: { name: string };
    }[]
  >([]);
  const [sales, setSales] = useState<
    { id: number; referenceNumber: string; product?: { name: string } }[]
  >([]);

  useEffect(() => {
    if (editingDelivery) {
      setFormData({
        direction: editingDelivery.direction,
        quantity: editingDelivery.quantity.toString(),
        driverId: editingDelivery.driverId.toString(),
        productId: editingDelivery.productId?.toString() || "",
        warehouseId: editingDelivery.warehouseId?.toString() || "",
        purchaseId: editingDelivery.purchaseId?.toString() || "",
        saleId: editingDelivery.saleId?.toString() || "",
        notes: editingDelivery.notes || "",
      });
    }
  }, [editingDelivery]);

  const fetchDropdownOptions = async () => {
    try {
      setLoadingProducts(true);
      setLoadingDrivers(true);
      setLoadingWarehouses(true);

      const [productsRes, warehousesRes, driversRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/products`),
        axios.get(`${API_BASE_URL}/warehouse`),
        axios.get(`${API_BASE_URL}/drivers`, {
          params: { include: "user.profile" },
        }),
      ]);

      setProducts(productsRes.data || []);
      setWarehouses(warehousesRes.data || []);
      setDrivers(driversRes.data || []);

      if (formData.direction === "in") {
        setLoadingPurchases(true);
        const purchasesRes = await axios.get(`${API_BASE_URL}/purchases`, {
          params: { 
            include: "product",
            search: purchasesSearch
          },
        });
        setPurchases(purchasesRes.data || []);
      } else if (formData.direction === "out") {
        setLoadingSales(true);
        const salesRes = await axios.get(`${API_BASE_URL}/sales`, {
          params: { 
            include: "product",
            search: salesSearch
          },
        });
        setSales(salesRes.data?.data || []);
      }
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
    } finally {
      setLoadingProducts(false);
      setLoadingDrivers(false);
      setLoadingWarehouses(false);
      setLoadingPurchases(false);
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    fetchDropdownOptions();
  }, [formData.direction, purchasesSearch, salesSearch]);

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "direction" && {
        purchaseId: "",
        saleId: "",
      }),
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const deliveryData = {
        direction: formData.direction,
        quantity: parseFloat(formData.quantity),
        driverId: Number(formData.driverId),
        productId: Number(formData.productId),
        warehouseId: Number(formData.warehouseId),
        notes: formData.notes,
        ...(formData.direction === "in" && formData.purchaseId
          ? { purchaseId: Number(formData.purchaseId) }
          : {}),
        ...(formData.direction === "out" && formData.saleId
          ? { saleId: Number(formData.saleId) }
          : {}),
      };

      if (editingDelivery) {
        const updatedDelivery = await deliveryService.updateDelivery(
          editingDelivery.id,
          { notes: formData.notes }
        );
        setDeliveries(
          deliveries.map((d) =>
            d.id === editingDelivery.id ? updatedDelivery : d
          )
        );
      } else {
        const newDelivery = await deliveryService.createDelivery(deliveryData);
        setDeliveries([newDelivery, ...deliveries]);
        setTotalDeliveries((prev) => prev + 1);
      }

      setShowAddForm(false);
    } catch (err: any) {
      console.error("Error saving delivery:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const salesOptions = sales.map((sale) => ({
    value: sale.id,
    label: `${sale.referenceNumber || "N/A"} (${
      sale.product?.name || "Unknown Product"
    })`,
  }));

  const purchasesOptions = purchases.map((purchase) => ({
    value: purchase.id,
    label: `${purchase.purchaseReference} (${
      purchase.product?.name || "Unknown Product"
    })`,
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingDelivery ? "Edit Delivery" : "Create New Delivery"}
          </h2>
          <button
            onClick={() => setShowAddForm(false)}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction <span className="text-red-500">*</span>
              </label>
              <select
                name="direction"
                value={formData.direction}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isSubmitting || !!editingDelivery}
              >
                <option value="in">Incoming (Purchase)</option>
                <option value="out">Outgoing (Sale)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={
                  !!editingDelivery || isSubmitting || loadingProducts
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity (Kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0.01"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <select
                name="warehouseId"
                value={formData.warehouseId}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={
                  !!editingDelivery || isSubmitting || loadingWarehouses
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Driver <span className="text-red-500">*</span>
              </label>
              <select
                name="driverId"
                value={formData.driverId}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={
                  !!editingDelivery || isSubmitting || loadingDrivers
                }
              >
                <option value="">
                  {loadingDrivers
                    ? "Loading drivers..."
                    : "Select a driver"}
                </option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.user?.profile?.names || "Unknown Driver"}
                  </option>
                ))}
              </select>
              {!loadingDrivers && drivers.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  No drivers found. Please add drivers first.
                </p>
              )}
            </div>

            {formData.direction === "in" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase <span className="text-red-500">*</span>
                </label>
                <Select
                  id="purchaseId"
                  name="purchaseId"
                  options={purchasesOptions}
                  isLoading={loadingPurchases}
                  onInputChange={(value) => {
                    setPurchasesSearch(value);
                  }}
                  onChange={(selectedOption) => {
                    setFormData((prev) => ({
                      ...prev,
                      purchaseId: selectedOption?.value.toString() || "",
                    }));
                  }}
                  value={purchasesOptions.find(
                    (option) =>
                      option.value.toString() === formData.purchaseId
                  )}
                  placeholder="Search and select purchase..."
                  className="basic-single"
                  classNamePrefix="select"
                  isClearable
                  required
                  isDisabled={isSubmitting}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sale <span className="text-red-500">*</span>
                </label>
                <Select
                  id="saleId"
                  name="saleId"
                  options={salesOptions}
                  isLoading={loadingSales}
                  onInputChange={(value) => {
                    setSalesSearch(value);
                  }}
                  onChange={(selectedOption) => {
                    setFormData((prev) => ({
                      ...prev,
                      saleId: selectedOption?.value.toString() || "",
                    }));
                  }}
                  value={salesOptions.find(
                    (option) => option.value.toString() === formData.saleId
                  )}
                  placeholder="Search and select sale..."
                  className="basic-single"
                  classNamePrefix="select"
                  isClearable
                  required
                  isDisabled={isSubmitting}
                />
              </div>
            )}

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
                loadingDrivers ||
                loadingWarehouses ||
                (formData.direction === "in" && loadingPurchases) ||
                (formData.direction === "out" && loadingSales) ||
                !formData.quantity ||
                !formData.driverId ||
                !formData.productId ||
                !formData.warehouseId ||
                (formData.direction === "in" && !formData.purchaseId) ||
                (formData.direction === "out" && !formData.saleId)
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
                  {editingDelivery ? "Updating..." : "Creating..."}
                </>
              ) : editingDelivery ? (
                "Update Delivery"
              ) : (
                "Create Delivery"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryForm;