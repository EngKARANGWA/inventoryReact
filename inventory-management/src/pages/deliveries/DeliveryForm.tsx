import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Select from "react-select";
import { Delivery, deliveryService, SaleItem } from "../../services/deliveryService";
import { toast } from "react-toastify";
import api  from '../../services/authService';


interface DeliveryFormProps {
  editingDelivery: Delivery | null;
  setShowAddForm: React.Dispatch<React.SetStateAction<boolean>>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setDeliveries: React.Dispatch<React.SetStateAction<Delivery[]>>;
  setTotalDeliveries: React.Dispatch<React.SetStateAction<number>>;
  deliveries: Delivery[];
  onSuccess?: () => void;
}

interface Warehouse {
  id: number;
  name: string;
  location: string;
}

interface Driver {
  id: number;
  driverId: string;
  licenseNumber: string;
  user?: {
    profile?: {
      names: string;
    };
  };
}

interface Purchase {
  id: number;
  purchaseReference: string;
  description: string;
  product?: { name: string };
  weight: string;
  totalDelivered: string;
  status?: string;
}

interface Sale {
  id: number;
  saleReference: string;
  totalAmount: string;
  status?: string;
  items?: SaleItem[];
}

const DeliveryForm: React.FC<DeliveryFormProps> = ({
  editingDelivery,
  setShowAddForm,
  isSubmitting,
  setIsSubmitting,
  setDeliveries,
  setTotalDeliveries,
  deliveries,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    direction: "in" as "in" | "out",
    quantity: "",
    driverId: "",
    warehouseId: "",
    purchaseId: "",
    saleId: "",
    saleItemId: "",
    notes: "",
  });

  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [loadingSales, setLoadingSales] = useState(false);
  const [salesSearch, setSalesSearch] = useState("");
  const [purchasesSearch, setPurchasesSearch] = useState("");

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [remainingQuantity, setRemainingQuantity] = useState<number | null>(null);

  useEffect(() => {
    if (editingDelivery) {
      setFormData({
        direction: editingDelivery.direction,
        quantity: editingDelivery.quantity.toString(),
        driverId: editingDelivery.driverId.toString(),
        warehouseId: editingDelivery.warehouseId?.toString() || "",
        purchaseId: editingDelivery.purchaseId?.toString() || "",
        saleId: editingDelivery.saleId?.toString() || "",
        saleItemId: editingDelivery.saleItemId?.toString() || "", // Add saleItemId
        notes: editingDelivery.notes || "",
      });
    }
  }, [editingDelivery]);

  // Update to check for the remaining quantity based on the correct relationship
  useEffect(() => {
    if (formData.direction === "in" && formData.purchaseId) {
      const selectedPurchase = purchases.find(p => p.id.toString() === formData.purchaseId);
      if (selectedPurchase) {
        const totalWeight = parseFloat(selectedPurchase.weight);
        const totalDelivered = parseFloat(selectedPurchase.totalDelivered || "0");
        const remaining = totalWeight - totalDelivered;
        setRemainingQuantity(remaining > 0 ? remaining : 0);
      }
    } else if (formData.direction === "out" && formData.saleItemId) {
      // If a sale item is selected, calculate remaining quantity based on that specific item
      const selectedSaleItem = saleItems.find(item => item.id.toString() === formData.saleItemId);
      if (selectedSaleItem) {
        const totalQuantity = parseFloat(selectedSaleItem.quantity);
        const totalDelivered = parseFloat(selectedSaleItem.totalDelivered || "0");
        const remaining = totalQuantity - totalDelivered;
        setRemainingQuantity(remaining > 0 ? remaining : 0);
      }
    } else {
      setRemainingQuantity(null);
    }
  }, [formData.purchaseId, formData.saleItemId, purchases, saleItems]);

  // Update to load sale items when a sale is selected
  useEffect(() => {
    if (formData.saleId) {
      const selectedSale = sales.find(s => s.id.toString() === formData.saleId);
      if (selectedSale && selectedSale.items) {
        setSaleItems(selectedSale.items);
      } else {
        loadSaleItems(formData.saleId);
      }
    } else {
      setSaleItems([]);
    }
  }, [formData.saleId, sales]);

  const loadSaleItems = async (saleId: string) => {
    try {
      const response = await api.get(`/sales/${saleId}`, { 
        params: { include: "items.product" }
      });
      
      if (response.data?.items) {
        setSaleItems(response.data.items);
      } else {
        setSaleItems([]);
      }
    } catch (error) {
      console.error("Error loading sale items:", error);
      setSaleItems([]);
    }
  };

  const fetchDropdownOptions = async () => {
    try {
      setLoadingDrivers(true);
      setLoadingWarehouses(true);

      // Fetch drivers with user profile included
      const driversRes = await api.get('/drivers', {
        params: { include: "user.profile" }
      });
      setDrivers(driversRes.data?.data || driversRes.data || []);

      // Fetch warehouses
      const warehousesRes = await api.get('/warehouse');
      setWarehouses(warehousesRes.data?.data || warehousesRes.data || []);

      if (formData.direction === "in") {
        setLoadingPurchases(true);
        const purchasesRes = await api.get('/purchases', {
          params: { 
            include: "product",
            search: purchasesSearch
          },
        });
        const data = purchasesRes.data?.data || purchasesRes.data || [];
        const filteredPurchases = data.filter(
          (p: Purchase) => p.status !== "delivery_complete" && p.status !== "completed"
        );
        setPurchases(filteredPurchases);
        setLoadingPurchases(false);
      } else if (formData.direction === "out") {
        setLoadingSales(true);
        const salesRes = await api.get('/sales', {
          params: { 
            include: "items.product",
            search: salesSearch
          },
        });
        const data = salesRes.data?.data || salesRes.data || [];
        const filteredSales = data.filter(
          (s: Sale) => s.status !== "completed" && s.status !== "all_completed"
        );
        setSales(filteredSales);
        setLoadingSales(false);
      }
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      toast.error("Failed to load dropdown options");
    } finally {
      setLoadingDrivers(false);
      setLoadingWarehouses(false);
    }
  };

  useEffect(() => {
    fetchDropdownOptions();
  }, [formData.direction, purchasesSearch, salesSearch]);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "direction" && {
        purchaseId: "",
        saleId: "",
        saleItemId: "",
      }),
      ...(name === "saleId" && {
        saleItemId: "",
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
        warehouseId: Number(formData.warehouseId),
        notes: formData.notes,
        ...(formData.direction === "in" && formData.purchaseId
          ? { purchaseId: Number(formData.purchaseId) }
          : {}),
        ...(formData.direction === "out" && formData.saleItemId
          ? { saleItemId: Number(formData.saleItemId) }
          : {}),
        ...(formData.direction === "out" && formData.saleId && !formData.saleItemId
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
        toast.success("Delivery updated successfully");
      } else {
        const newDelivery = await deliveryService.createDelivery(deliveryData);
        setDeliveries([newDelivery, ...deliveries]);
        setTotalDeliveries((prev) => prev + 1);
        toast.success("Delivery created successfully");
      }

      setShowAddForm(false);
      
      // Call the onSuccess callback to refresh the list
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Error saving delivery:", err);
      
      // Handle INSUFFICIENT_STOCK error specifically
      if (err.response?.data?.code === "INSUFFICIENT_STOCK") {
        const errorData = err.response.data;
        toast.error(
          `Insufficient stock available. Current: ${errorData.message.match(/Current: (\d+\.?\d*)/)?.[1] || 'N/A'} Kg, Required: ${errorData.message.match(/Required: (\d+\.?\d*)/)?.[1] || formData.quantity} Kg`,
          {
            autoClose: 7000, // Show for longer time
          }
        );
      } else if (err.response?.data?.code === "QUANTITY_EXCEEDS_REMAINING") {
        toast.error(err.response.data.message, {
          autoClose: 7000,
        });
      } else {
        toast.error(err.response?.data?.message || err.message || "Failed to save delivery");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const salesOptions = sales.map((sale) => ({
    value: sale.id,
    label: `${sale.saleReference} (Total: ${sale.totalAmount || '0'})`,
  }));

  const saleItemOptions = saleItems.map((item) => ({
    value: item.id,
    label: `${item.product?.name || 'Product'} - ${item.quantity} Kg (Delivered: ${item.totalDelivered || '0'} Kg)`,
  }));

  const purchasesOptions = purchases.map((purchase) => ({
    value: purchase.id,
    label: `${purchase.purchaseReference} (${purchase.product?.name || "Unknown Product"})`,
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
            {/* Direction field */}
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

            {/* Purchase/Sale selection */}
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
                {!loadingPurchases && purchasesOptions.length === 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    No purchases available or all purchases are already completed.
                  </p>
                )}
              </div>
            ) : (
              <>
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
                        saleItemId: "", // Clear sale item when sale changes
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
                  {!loadingSales && salesOptions.length === 0 && (
                    <p className="mt-1 text-sm text-red-600">
                      No sales available or all sales are already completed.
                    </p>
                  )}
                </div>

                {/* Sale Item selection - only show when a sale is selected */}
                {formData.saleId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale Item <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="saleItemId"
                      name="saleItemId"
                      options={saleItemOptions}
                      onChange={(selectedOption) => {
                        setFormData((prev) => ({
                          ...prev,
                          saleItemId: selectedOption?.value.toString() || "",
                        }));
                      }}
                      value={saleItemOptions.find(
                        (option) => option.value.toString() === formData.saleItemId
                      )}
                      placeholder="Select sale item..."
                      className="basic-single"
                      classNamePrefix="select"
                      isClearable
                      required
                      isDisabled={isSubmitting || !formData.saleId}
                    />
                    {formData.saleId && saleItemOptions.length === 0 && (
                      <p className="mt-1 text-sm text-red-600">
                        No items available for this sale or all items are already delivered.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Quantity field */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity (Kg) <span className="text-red-500">*</span>
                </label>
                {remainingQuantity !== null && (
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm">
                    Remaining: {remainingQuantity.toLocaleString()} Kg
                  </div>
                )}
              </div>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="0.01"
                step="0.01"
                max={remainingQuantity?.toString() || undefined}
              />
              {remainingQuantity !== null && Number(formData.quantity) > remainingQuantity && (
                <p className="mt-1 text-sm text-red-600">
                  Quantity exceeds remaining amount ({remainingQuantity.toLocaleString()} Kg)
                </p>
              )}
            </div>

            {/* Warehouse selection */}
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

            {/* Driver selection */}
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
                    {driver.user?.profile?.names || `Driver ${driver.driverId}`}
                  </option>
                ))}
              </select>
              {!loadingDrivers && drivers.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  No drivers found. Please add drivers first.
                </p>
              )}
            </div>

            {/* Notes field */}
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

          {/* Submit buttons */}
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
                loadingDrivers ||
                loadingWarehouses ||
                (formData.direction === "in" && loadingPurchases) ||
                (formData.direction === "out" && loadingSales) ||
                !formData.quantity ||
                !formData.driverId ||
                !formData.warehouseId ||
                (formData.direction === "in" && !formData.purchaseId) ||
                (formData.direction === "out" && !formData.saleId) ||
                (formData.direction === "out" && formData.saleId && !formData.saleItemId) ||
                (remainingQuantity !== null && Number(formData.quantity) > remainingQuantity)
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