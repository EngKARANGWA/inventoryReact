import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, X, Package, Beaker, AlertCircle } from "lucide-react";
import {
  Product,
  Production,
  Warehouse,
  ProductionOutcome,
  PackageSummary,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

interface ProductionCostItem {
  item?: string;
  name?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  total?: number;
  cost?: number;
  amount?: number;
  price?: number;
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
    totalOutcome: editingProduction?.totalOutcome?.toString() || "",
    mainProductId: editingProduction?.mainProductId?.toString() || "",
    usedQuantity: editingProduction?.usedQuantity?.toString() || "",
    mainProductUnitCost:
      editingProduction?.mainProductUnitCost?.toString() || "",
    warehouseId: editingProduction?.warehouseId?.toString() || "",
    notes: editingProduction?.notes || "",
    productionCost: (editingProduction?.productionCost ||
      []) as ProductionCostItem[],
    outcomes: editingProduction?.outcomes || [],
    packagesSummary: editingProduction?.packagesSummary || [],
    date: editingProduction?.date || new Date().toISOString().split("T")[0],
  });

  const [formErrors, setFormErrors] = useState({
    productId: "",
    totalOutcome: "",
    mainProductId: "",
    usedQuantity: "",
    mainProductUnitCost: "",
    outcomesValidation: "",
    packagesValidation: "",
  });

  const [loadingPrice, setLoadingPrice] = useState(false);
  const [loadingProductPrices, setLoadingProductPrices] = useState<{
    [key: string]: boolean;
  }>({});
  const [loadingOutcomePrices, setLoadingOutcomePrices] = useState<{
    [key: string]: boolean;
  }>({});
  const [totalCost, setTotalCost] = useState(0);
  const [byproductRevenue, setByproductRevenue] = useState(0);
  const [netProductionCost, setNetProductionCost] = useState(0);
  const [calculatedUnitCost, setCalculatedUnitCost] = useState(0);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // Filter products by type
  const rawMaterials = products.filter(
    (product) => product.type === "raw_material"
  );
  const finishedProducts = products.filter(
    (product) => product.type === "finished_product"
  );

  useEffect(() => {
    // Calculate costs whenever relevant fields change
    const rawMaterialCost =
      formData.mainProductId &&
      formData.usedQuantity &&
      formData.mainProductUnitCost
        ? parseFloat(formData.usedQuantity) *
          parseFloat(formData.mainProductUnitCost)
        : 0;

    const additionalCosts = formData.productionCost.reduce((sum, cost) => {
      const total =
        cost.quantity && cost.unitPrice
          ? cost.quantity * cost.unitPrice
          : cost.total || cost.cost || cost.amount || cost.price || 0;
      return sum + total;
    }, 0);

    const totalProductionCost = rawMaterialCost + additionalCosts;

    // Calculate byproduct revenue
    const byproductRev = formData.outcomes
      .filter(
        (outcome) => outcome.outcomeType === "byproduct" && outcome.unitPrice
      )
      .reduce((sum, outcome) => {
        const quantity = parseFloat(outcome.quantity?.toString() || "0");
        const unitPrice = parseFloat(outcome.unitPrice?.toString() || "0");
        return sum + quantity * unitPrice;
      }, 0);

    const netCost = totalProductionCost - byproductRev;
    const unitCost =
      formData.totalOutcome && parseFloat(formData.totalOutcome) > 0
        ? netCost / parseFloat(formData.totalOutcome)
        : 0;

    setTotalCost(totalProductionCost);
    setByproductRevenue(byproductRev);
    setNetProductionCost(netCost);
    setCalculatedUnitCost(unitCost);
  }, [
    formData.mainProductId,
    formData.usedQuantity,
    formData.mainProductUnitCost,
    formData.productionCost,
    formData.outcomes,
    formData.totalOutcome,
  ]);

  const fetchAveragePrice = async (
    productId: string,
    type: "main" | "outcome" | "cost",
    index?: number
  ) => {
    if (!productId) return;

    try {
      if (type === "main") {
        setLoadingPrice(true);
      } else if (type === "outcome" && index !== undefined) {
        setLoadingOutcomePrices((prev) => ({ ...prev, [index]: true }));
      } else if (type === "cost" && index !== undefined) {
        setLoadingProductPrices((prev) => ({ ...prev, [index]: true }));
      }

      const response = await fetch(
        `${API_BASE_URL}/stoke-movements/average-price/${productId}`
      );
      const data = await response.json();

      if (data.success && data.data.averageUnitPrice) {
        const roundedPrice = Math.round(data.data.averageUnitPrice * 100) / 100;

        if (type === "main") {
          setFormData((prev) => ({
            ...prev,
            mainProductUnitCost: roundedPrice.toString(),
          }));
        } else if (type === "outcome" && index !== undefined) {
          // Update the unit price directly without calling handleOutcomeChange
          setFormData((prev) => {
            const updatedOutcomes = [...prev.outcomes];
            updatedOutcomes[index] = {
              ...updatedOutcomes[index],
              unitPrice: roundedPrice,
            };
            return {
              ...prev,
              outcomes: updatedOutcomes,
            };
          });
        } else if (type === "cost" && index !== undefined) {
          // Update the cost directly without calling handleCostItemChange
          setFormData((prev) => {
            const updatedCosts = [...prev.productionCost];
            updatedCosts[index] = {
              ...updatedCosts[index],
              unitPrice: roundedPrice,
            };
            return {
              ...prev,
              productionCost: updatedCosts,
            };
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch average price:", error);
    } finally {
      if (type === "main") {
        setLoadingPrice(false);
      } else if (type === "outcome" && index !== undefined) {
        setLoadingOutcomePrices((prev) => ({ ...prev, [index]: false }));
      } else if (type === "cost" && index !== undefined) {
        setLoadingProductPrices((prev) => ({ ...prev, [index]: false }));
      }
    }
  };

  useEffect(() => {
    if (formData.mainProductId) {
      fetchAveragePrice(formData.mainProductId, "main");
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
    field: string,
    value: string
  ) => {
    const updatedCosts = [...formData.productionCost];
    updatedCosts[index] = {
      ...updatedCosts[index],
      [field]:
        field === "quantity" || field === "unitPrice"
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
      productionCost: [
        ...prev.productionCost,
        {
          item: "",
          quantity: 0,
          unitPrice: 0,
        },
      ],
    }));
  };

  const removeCostItem = (index: number) => {
    const updatedCosts = formData.productionCost.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      productionCost: updatedCosts,
    }));
  };

  const handleOutcomeChange = (
    index: number,
    field: keyof ProductionOutcome,
    value: string
  ) => {
    const updatedOutcomes = [...formData.outcomes];

    if (
      field === "productId" &&
      value &&
      updatedOutcomes[index].outcomeType === "byproduct"
    ) {
      // Fetch average price when product is selected for byproducts only
      fetchAveragePrice(value, "outcome", index);
    }

    updatedOutcomes[index] = {
      ...updatedOutcomes[index],
      [field]:
        field === "quantity" || field === "unitPrice"
          ? value
            ? parseFloat(value)
            : 0
          : field === "productId"
          ? value // Keep productId as string/number, don't parse it
          : value,
    };

    setFormData((prev) => ({
      ...prev,
      outcomes: updatedOutcomes,
    }));

    // Clear validation errors when outcomes change
    setFormErrors((prev) => ({
      ...prev,
      outcomesValidation: "",
    }));
  };

  const addOutcome = (type: "byproduct" | "loss") => {
    const newOutcome: ProductionOutcome = {
      outcomeType: type,
      name: type === "loss" ? "Processing Loss" : "",
      quantity: 0,
      unit: "kg",
      productId: type === "byproduct" ? undefined : undefined,
      unitPrice: type === "byproduct" ? undefined : undefined,
      warehouseId: formData.warehouseId
        ? parseInt(formData.warehouseId)
        : undefined,
      notes: "",
    };

    setFormData((prev) => ({
      ...prev,
      outcomes: [...prev.outcomes, newOutcome],
    }));
  };

  const removeOutcome = (index: number) => {
    const updatedOutcomes = formData.outcomes.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      outcomes: updatedOutcomes,
    }));
  };

  const handlePackageChange = (
    index: number,
    field: keyof PackageSummary,
    value: string
  ) => {
    const updatedPackages = [...formData.packagesSummary];
    updatedPackages[index] = {
      ...updatedPackages[index],
      [field]:
        field === "quantity" || field === "totalWeight"
          ? parseFloat(value) || 0
          : value,
    };
    setFormData((prev) => ({
      ...prev,
      packagesSummary: updatedPackages,
    }));

    // Clear package validation error
    setFormErrors((prev) => ({
      ...prev,
      packagesValidation: "",
    }));
  };

  const addPackage = () => {
    setFormData((prev) => ({
      ...prev,
      packagesSummary: [
        ...prev.packagesSummary,
        {
          quantity: 0,
          totalWeight: 0,
          packageSize: "",
          unit: "kg",
        },
      ],
    }));
  };

  const removePackage = (index: number) => {
    const updatedPackages = formData.packagesSummary.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({
      ...prev,
      packagesSummary: updatedPackages,
    }));
  };

  const validateForm = () => {
    const errors = {
      productId: !formData.productId ? "Finished product is required" : "",
      totalOutcome:
        !formData.totalOutcome ||
        isNaN(parseFloat(formData.totalOutcome)) ||
        parseFloat(formData.totalOutcome) <= 0
          ? "Valid total outcome is required (must be greater than 0)"
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
      mainProductUnitCost:
        formData.mainProductId &&
        formData.mainProductUnitCost &&
        (isNaN(parseFloat(formData.mainProductUnitCost)) ||
          parseFloat(formData.mainProductUnitCost) < 0)
          ? "Valid unit cost is required (must be 0 or greater)"
          : "",
      outcomesValidation: "",
      packagesValidation: "",
    };

    // Validate outcomes sum equals used quantity
    if (formData.usedQuantity) {
      const finishedOutcome = parseFloat(formData.totalOutcome) || 0;
      const otherOutcomes = formData.outcomes.reduce(
        (sum, outcome) =>
          sum + (parseFloat(outcome.quantity?.toString() || "0") || 0),
        0
      );

      const totalOutcomes = finishedOutcome + otherOutcomes;
      const difference = Math.abs(
        parseFloat(formData.usedQuantity) - totalOutcomes
      );

      if (difference > 0.01) {
        // Allow small rounding differences
        errors.outcomesValidation = `Total outcomes (${totalOutcomes.toFixed(
          2
        )}) must equal used quantity (${formData.usedQuantity})`;
      }
    }

    // Validate packages total weight doesn't exceed total outcome
    if (formData.packagesSummary.length > 0 && formData.totalOutcome) {
      const totalPackageWeight = formData.packagesSummary.reduce(
        (sum, pkg) => sum + (pkg.totalWeight || 0),
        0
      );

      if (totalPackageWeight > parseFloat(formData.totalOutcome)) {
        errors.packagesValidation = `Total package weight (${totalPackageWeight}) cannot exceed total outcome (${formData.totalOutcome})`;
      }
    }

    setFormErrors(errors);

    // If there are errors, scroll to error summary
    const hasErrors = Object.values(errors).some((error) => error !== "");
    if (hasErrors && errorSummaryRef.current) {
      errorSummaryRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    return !hasErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const productionData = {
      productId: Number(formData.productId),
      quantityProduced: parseFloat(formData.totalOutcome), // Backend expects quantityProduced
      totalOutcome: parseFloat(formData.totalOutcome),
      ...(formData.mainProductId
        ? { mainProductId: Number(formData.mainProductId) }
        : {}),
      ...(formData.usedQuantity
        ? { usedQuantity: parseFloat(formData.usedQuantity) }
        : {}),
      ...(formData.mainProductUnitCost
        ? { mainProductUnitCost: parseFloat(formData.mainProductUnitCost) }
        : {}),
      ...(formData.warehouseId
        ? { warehouseId: Number(formData.warehouseId) }
        : {}),
      ...(formData.notes ? { notes: formData.notes } : {}),
      date: formData.date,
      productionCost: formData.productionCost.map((cost) => ({
        item: cost.item || "",
        total:
          cost.quantity && cost.unitPrice
            ? cost.quantity * cost.unitPrice
            : cost.total || cost.cost || cost.amount || cost.price || 0,
      })),
      outcomes: formData.outcomes.map((outcome) => ({
        outcomeType: outcome.outcomeType,
        ...(outcome.outcomeType === "byproduct" && outcome.productId
          ? { productId: Number(outcome.productId) }
          : {}),
        name:
          outcome.name ||
          (outcome.outcomeType === "loss" ? "Processing Loss" : ""),
        quantity: parseFloat(outcome.quantity?.toString() || "0"),
        unit: outcome.unit || "kg",
        ...(outcome.outcomeType === "byproduct" &&
        outcome.unitPrice !== undefined
          ? { unitPrice: parseFloat(outcome.unitPrice.toString()) }
          : {}),
        ...(outcome.warehouseId
          ? { warehouseId: Number(outcome.warehouseId) }
          : {}),
        ...(outcome.notes ? { notes: outcome.notes } : {}),
      })),
      packagesSummary: formData.packagesSummary.map((pkg) => ({
        size: pkg.packageSize, // Backend expects 'size' not 'packageSize'
        quantity: parseInt(pkg.quantity.toString()),
        totalWeight: parseFloat(pkg.totalWeight.toString()),
        unit: pkg.unit,
      })),
    };

    console.log(
      "Submitting production data:",
      JSON.stringify(productionData, null, 2)
    );
    onSubmit(productionData);
  };

  const hasErrors = Object.values(formErrors).some((error) => error !== "");

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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

        {/* Error Summary */}
        {hasErrors && (
          <div
            ref={errorSummaryRef}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-medium text-red-800">
                Please fix the following missmatch:
              </h3>
            </div>
            <ul className="list-disc list-inside text-red-700">
              {Object.entries(formErrors).map(([key, error]) =>
                error ? <li key={key}>{error}</li> : null
              )}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Raw Material Section (Left) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Raw Material (Input)
              </h3>

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
                          ? "border-red-500 bg-red-50"
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
                      Unit Cost
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="mainProductUnitCost"
                        value={formData.mainProductUnitCost}
                        onChange={handleFormChange}
                        className={`w-full px-3 py-2 border ${
                          formErrors.mainProductUnitCost
                            ? "border-red-500 bg-red-50"
                            : "border-gray-300"
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
                    {formErrors.mainProductUnitCost && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.mainProductUnitCost}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Produced Product Section (Right) */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Production Output
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Finished Product <span className="text-red-500">*</span>
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
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                      disabled={isSubmitting || loadingProducts}
                    >
                      <option value="">Select finished product</option>
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
                  Total Outcome <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalOutcome"
                  value={formData.totalOutcome}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border ${
                    formErrors.totalOutcome
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                  min="0.01"
                  step="0.01"
                  disabled={isSubmitting}
                  placeholder="e.g. 100.50"
                />
                {formErrors.totalOutcome && (
                  <p className="mt-1 text-sm text-red-600">
                    {formErrors.totalOutcome}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Outcomes Section */}
          <div
            className={`mb-6 ${
              formErrors.outcomesValidation
                ? "border-red-500 border rounded-lg p-4"
                : ""
            }`}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Beaker className="w-5 h-5 mr-2 text-purple-500" />
              Production Outcomes
            </h3>

            {formErrors.outcomesValidation && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {formErrors.outcomesValidation}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {formData.outcomes.map((outcome, index) => (
                <div key={index} className="border rounded-md p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">
                      {outcome.outcomeType === "byproduct"
                        ? "Byproduct"
                        : "Loss"}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeOutcome(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove outcome"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {outcome.outcomeType === "byproduct" ? (
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Byproduct <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={outcome.productId || ""}
                          onChange={(e) =>
                            handleOutcomeChange(
                              index,
                              "productId",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name}{" "}
                              {product.unit ? `(${product.unit})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Loss Type
                        </label>
                        <input
                          type="text"
                          value={outcome.name || "Processing Loss"}
                          onChange={(e) =>
                            handleOutcomeChange(index, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g. Processing Loss"
                        />
                      </div>
                    )}

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="Amount"
                        value={outcome.quantity || ""}
                        onChange={(e) =>
                          handleOutcomeChange(index, "quantity", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        placeholder="kg"
                        value={outcome.unit || "kg"}
                        onChange={(e) =>
                          handleOutcomeChange(index, "unit", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {outcome.outcomeType === "byproduct" && (
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Price per unit"
                            value={outcome.unitPrice || ""}
                            onChange={(e) =>
                              handleOutcomeChange(
                                index,
                                "unitPrice",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                            disabled={loadingOutcomePrices[index]}
                          />
                          {loadingProductPrices[index] && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        placeholder="Additional notes"
                        value={outcome.notes || ""}
                        onChange={(e) =>
                          handleOutcomeChange(index, "notes", e.target.value)
                        }
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => addOutcome("byproduct")}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Byproduct
                </button>
                <button
                  type="button"
                  onClick={() => addOutcome("loss")}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center"
                >
                  <Plus size={16} className="mr-1" />
                  Add Loss
                </button>
              </div>
            </div>
          </div>

          {/* Packages Section */}
          <div
            className={`mb-6 ${
              formErrors.packagesValidation
                ? "border-red-500 border rounded-lg p-4"
                : ""
            }`}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-green-500" />
              Packaging Summary
            </h3>

            {formErrors.packagesValidation && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {formErrors.packagesValidation}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {formData.packagesSummary.map((pkg, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      Package Type/Size
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 25kg bags"
                      value={pkg.packageSize || ""}
                      onChange={(e) =>
                        handlePackageChange(
                          index,
                          "packageSize",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs text-gray-500 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      placeholder="Number of packages"
                      value={pkg.quantity || ""}
                      onChange={(e) =>
                        handlePackageChange(index, "quantity", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs text-gray-500 mb-1">
                      Total Weight
                    </label>
                    <input
                      type="number"
                      placeholder="Weight in kg"
                      value={pkg.totalWeight || ""}
                      onChange={(e) =>
                        handlePackageChange(
                          index,
                          "totalWeight",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removePackage(index)}
                    className="text-red-500 hover:text-red-700 p-2 mt-5"
                    title="Remove package"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPackage}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-2"
              >
                <Plus size={16} className="mr-1" />
                Add Package Type
              </button>
            </div>
          </div>

          {/* Warehouse and Date Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                Production Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Production Costs Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Additional Production Costs
            </h3>
            <div className="space-y-3">
              {formData.productionCost.map((cost, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="Cost description"
                      value={cost.item || cost.name || cost.description || ""}
                      onChange={(e) =>
                        handleCostItemChange(index, "item", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs text-gray-500 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={cost.quantity || ""}
                      onChange={(e) =>
                        handleCostItemChange(index, "quantity", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs text-gray-500 mb-1">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      placeholder="Price"
                      value={cost.unitPrice || ""}
                      onChange={(e) =>
                        handleCostItemChange(index, "unitPrice", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs text-gray-500 mb-1">
                      Total
                    </label>
                    <input
                      type="number"
                      value={
                        cost.quantity && cost.unitPrice
                          ? (cost.quantity * cost.unitPrice).toFixed(2)
                          : "0.00"
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-100"
                      disabled
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCostItem(index)}
                    className="text-red-500 hover:text-red-700 p-2 mt-5"
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
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-900 mb-3">Cost Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Total Production Cost:
                </span>
                <span className="font-medium">
                  {totalCost.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  RWF
                </span>
              </div>

              {byproductRevenue > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span className="text-sm">Byproduct Revenue:</span>
                  <span className="font-medium">
                    -
                    {byproductRevenue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    RWF
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center border-t pt-2">
                <span className="font-medium">Net Production Cost:</span>
                <span className="text-lg font-semibold">
                  {netProductionCost.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  RWF
                </span>
              </div>

              {formData.totalOutcome &&
                parseFloat(formData.totalOutcome) > 0 && (
                  <div className="flex justify-between items-center text-blue-600">
                    <span className="text-sm">Unit Cost (per kg):</span>
                    <span className="font-medium">
                      {calculatedUnitCost.toFixed(2)} RWF/kg
                    </span>
                  </div>
                )}
            </div>

            {formData.mainProductId &&
              formData.usedQuantity &&
              formData.mainProductUnitCost && (
                <div className="text-sm text-gray-600 mt-2">
                  <p>
                    (Raw Material: {parseFloat(formData.usedQuantity)} ×{" "}
                    {parseFloat(formData.mainProductUnitCost).toFixed(2)} ={" "}
                    {(
                      parseFloat(formData.usedQuantity) *
                      parseFloat(formData.mainProductUnitCost)
                    ).toFixed(2)}{" "}
                    RWF)
                  </p>
                </div>
              )}

            {formData.productionCost.length > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                <p>
                  (Additional Costs:{" "}
                  {formData.productionCost
                    .reduce(
                      (sum, cost) =>
                        sum +
                        (cost.quantity && cost.unitPrice
                          ? cost.quantity * cost.unitPrice
                          : 0),
                      0
                    )
                    .toFixed(2)}{" "}
                  RWF)
                </p>
              </div>
            )}
          </div>

          {/* Efficiency Preview */}
          {formData.mainProductId &&
            formData.usedQuantity &&
            formData.totalOutcome && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2">
                  Production Efficiency
                </h4>
                <div className="text-sm text-blue-800">
                  <p>
                    Efficiency:{" "}
                    {(
                      (parseFloat(formData.totalOutcome) /
                        parseFloat(formData.usedQuantity)) *
                      100
                    ).toFixed(2)}
                    %
                  </p>
                  {formData.outcomes.filter((o) => o.outcomeType === "loss")
                    .length > 0 && (
                    <p>
                      Loss Percentage:{" "}
                      {(
                        (formData.outcomes
                          .filter((o) => o.outcomeType === "loss")
                          .reduce(
                            (sum, o) =>
                              sum + parseFloat(o.quantity?.toString() || "0"),
                            0
                          ) /
                          parseFloat(formData.usedQuantity)) *
                        100
                      ).toFixed(2)}
                      %
                    </p>
                  )}
                </div>
              </div>
            )}

          {/* Notes Section - Moved to last */}
          <div className="mt-6">
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
