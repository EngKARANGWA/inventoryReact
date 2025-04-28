import React, { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Product, Production, ProductionCost, Warehouse } from "./types";

interface ProductionFormProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  products: Product[];
  warehouses: Warehouse[];
  editingProduction?: Production | null;
  loadingProducts: boolean;
  loadingWarehouses: boolean;
}

const ProductionForm: React.FC<ProductionFormProps> = ({
  show,
  onClose,
  onSubmit,
  isSubmitting,
  products,
  warehouses,
  editingProduction,
  loadingProducts,
  loadingWarehouses,
}) => {
  const [formData, setFormData] = useState({
    productId: editingProduction?.productId?.toString() || "",
    quantityProduced: editingProduction?.quantityProduced?.toString() || "",
    mainProductId: editingProduction?.mainProductId?.toString() || "",
    usedQuantity: editingProduction?.usedQuantity?.toString() || "",
    warehouseId: editingProduction?.warehouseId?.toString() || "",
    notes: editingProduction?.notes || "",
    productionCost: editingProduction?.productionCost || [],
    unitPrice: editingProduction?.unitPrice?.toString() || "",
  });

  const [formErrors, setFormErrors] = useState({
    productId: "",
    quantityProduced: "",
    mainProductId: "",
    usedQuantity: "",
    unitPrice: "",
  });

  const [loadingPrice, setLoadingPrice] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  // Filter products by type
  const rawMaterials = products.filter(product => product.type === "raw_material");
  const finishedProducts = products.filter(product => product.type === "finished_product");

  useEffect(() => {
    // Calculate total cost whenever relevant fields change
    const rawMaterialCost = formData.mainProductId && formData.usedQuantity && formData.unitPrice
      ? parseFloat(formData.usedQuantity) * parseFloat(formData.unitPrice)
      : 0;
    
    const additionalCosts = formData.productionCost.reduce(
      (sum, cost) => sum + (cost.cost || cost.amount || cost.price || 0),
      0
    );

    setTotalCost(rawMaterialCost + additionalCosts);
  }, [formData.mainProductId, formData.usedQuantity, formData.unitPrice, formData.productionCost]);

  const fetchAveragePrice = async (productId: string) => {
    if (!productId) return;
    
    try {
      setLoadingPrice(true);
      const response = await fetch(
        `https://test.gvibyequ.a2hosted.com/api/stoke-movements/average-price/${productId}`
      );
      const data = await response.json();
      
      if (data.success && data.data.averageUnitPrice) {
        const roundedPrice = Math.round(data.data.averageUnitPrice * 100) / 100;
        setFormData(prev => ({
          ...prev,
          unitPrice: roundedPrice.toString(),
        }));
      }
    } catch (error) {
      console.error("Failed to fetch average price:", error);
    } finally {
      setLoadingPrice(false);
    }
  };

  useEffect(() => {
    if (formData.mainProductId) {
      fetchAveragePrice(formData.mainProductId);
    }
  }, [formData.mainProductId]);

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

    // Clear error when field is changed
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleCostItemChange = (
    index: number,
    field: keyof ProductionCost,
    value: string
  ) => {
    const updatedCosts = [...formData.productionCost];
    updatedCosts[index] = {
      ...updatedCosts[index],
      [field]:
        field === "cost" || field === "amount" || field === "price"
          ? parseFloat(value) || 0
          : value,
    };
    setFormData((prev) => ({
      ...prev,
      productionCost: updatedCosts,
    }));
  };

  const addCostItem = () => {
    setFormData((prev) => ({
      ...prev,
      productionCost: [...prev.productionCost, { name: "", cost: 0 }],
    }));
  };

  const removeCostItem = (index: number) => {
    const updatedCosts = formData.productionCost.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      productionCost: updatedCosts,
    }));
  };

  const validateForm = () => {
    const errors = {
      productId: !formData.productId ? "Produced product is required" : "",
      quantityProduced:
        !formData.quantityProduced ||
        isNaN(parseFloat(formData.quantityProduced)) ||
        parseFloat(formData.quantityProduced) <= 0
          ? "Valid quantity is required (must be greater than 0)"
          : "",
      mainProductId:
        formData.mainProductId && !formData.usedQuantity
          ? "Used quantity is required when raw material is selected"
          : "",
      usedQuantity:
        formData.usedQuantity &&
        (isNaN(parseFloat(formData.usedQuantity)) ||
          parseFloat(formData.usedQuantity) <= 0)
          ? "Valid used quantity is required (must be greater than 0)"
          : formData.mainProductId && !formData.usedQuantity
          ? "Used quantity is required"
          : "",
      unitPrice:
        formData.unitPrice &&
        (isNaN(parseFloat(formData.unitPrice)) ||
          parseFloat(formData.unitPrice) < 0)
          ? "Valid unit price is required (must be 0 or greater)"
          : "",
    };

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error !== "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const productionData = {
      productId: Number(formData.productId),
      quantityProduced: parseFloat(formData.quantityProduced),
      ...(formData.mainProductId
        ? { mainProductId: Number(formData.mainProductId) }
        : {}),
      ...(formData.usedQuantity
        ? { usedQuantity: parseFloat(formData.usedQuantity) }
        : {}),
      ...(formData.warehouseId
        ? { warehouseId: Number(formData.warehouseId) }
        : {}),
      ...(formData.notes ? { notes: formData.notes } : {}),
      ...(formData.unitPrice
        ? { unitPrice: parseFloat(formData.unitPrice) }
        : {}),
      productionCost: formData.productionCost.map((cost) => ({
        name: cost.name || cost.description || "",
        cost: cost.cost || cost.amount || cost.price || 0,
      })),
    };

    onSubmit(productionData);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingProduction
              ? "Edit Production Batch"
              : "Create New Production Batch"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Raw Material Section (Left) */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raw Material (Optional)
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
                      <option value="">Select raw material (optional)</option>
                      {rawMaterials
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
                <>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="unitPrice"
                        value={formData.unitPrice}
                        onChange={handleFormChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.unitPrice ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        min="0"
                        step="0.01"
                        disabled={isSubmitting || loadingPrice}
                        placeholder="Loading..."
                      />
                      {loadingPrice && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </div>
                    {formErrors.unitPrice && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.unitPrice}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Produced Product Section (Right) */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produced Product <span className="text-red-500">*</span>
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
                      <option value="">Select produced product</option>
                      {finishedProducts
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
            </div>
          </div>

          {/* Warehouse and Notes Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
          </div>

          {/* Production Costs Section */}
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
                      placeholder="Cost name"
                      value={cost.name || cost.description || ""}
                      onChange={(e) =>
                        handleCostItemChange(index, "name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      placeholder="Amount"
                      value={cost.cost || cost.amount || cost.price || ""}
                      onChange={(e) =>
                        handleCostItemChange(index, "cost", e.target.value)
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

          {/* Total Cost Calculation */}
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Production Cost:</span>
              <span className="text-lg font-semibold">
                {totalCost.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                RWF
              </span>
            </div>
            {formData.mainProductId && formData.usedQuantity && formData.unitPrice && (
              <div className="text-sm text-gray-600 mt-2">
                <p>
                  (Raw Material: {parseFloat(formData.usedQuantity)} × {parseFloat(formData.unitPrice).toFixed(2)} ={" "}
                  {(parseFloat(formData.usedQuantity) * parseFloat(formData.unitPrice)).toFixed(2)} RWF)
                </p>
              </div>
            )}
            {formData.productionCost.length > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                <p>
                  (Additional Costs:{" "}
                  {formData.productionCost
                    .reduce((sum, cost) => sum + (cost.cost || cost.amount || cost.price || 0), 0)
                    .toFixed(2)}{" "}
                  RWF)
                </p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
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
};

export default ProductionForm;