import Select from "react-select";
import { X, Plus, Trash } from "lucide-react";
import api from "../../services/authService";

export interface SaleItem {
  id?: number;
  productId: number;
  quantity: string;
  unitPrice: string;
  totalDelivered?: string;
  note?: string;
  product?: {
    id: number;
    name: string;
    type?: string;
  };
}


interface SaleFormProps {
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  editingSale: any;
  formData: any;
  setFormData: (data: any) => void;
  products: any[];
  salers: any[];
  clients: any[];
  blockers: any[];
  setProductsSearch: (search: string) => void;
  setSalersSearch: (search: string) => void;
  setClientsSearch: (search: string) => void;
  setBlockersSearch: (search: string) => void;
  handleFormSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
}

export const SaleForm: React.FC<SaleFormProps> = ({
  showAddForm,
  setShowAddForm,
  editingSale,
  formData,
  setFormData,
  products,
  salers,
  clients,
  blockers,
  setProductsSearch,
  setSalersSearch,
  setClientsSearch,
  setBlockersSearch,
  handleFormSubmit,
  isSubmitting,
}) => {
  if (!showAddForm) return null;

  const fetchAveragePrice = async (productId: string) => {
    try {
      const response = await api.get(
        `/stoke-movements/average-price/${productId}`
      );
      if (response.data.success) {
        return response.data.data.averageUnitPrice;
      }
      return null;
    } catch (error) {
      console.error("Error fetching average price:", error);
      return null;
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const items = [...formData.items];
    items[index] = { ...items[index], [name]: value };
    setFormData((prev: any) => ({ ...prev, items }));
  };

  const handleProductSelect = async (index: number, selectedOption: any) => {
    const items = [...formData.items];
    items[index] = {
      ...items[index],
      productId: selectedOption?.value.toString() || "",
      unitPrice: "", // Reset unit price when product changes
    };
    setFormData((prev: any) => ({ ...prev, items }));

    if (selectedOption?.value) {
      const averagePrice = await fetchAveragePrice(
        selectedOption.value.toString()
      );
      if (averagePrice) {
        const updatedItems = [...formData.items];
        updatedItems[index] = {
          ...updatedItems[index],
          productId: selectedOption.value.toString(),
          unitPrice: averagePrice.toString(),
        };
        setFormData((prev: any) => ({ ...prev, items: updatedItems }));
      }
    }
  };

  const addItem = () => {
    setFormData((prev: any) => ({
      ...prev,
      items: [
        ...prev.items,
        { productId: "", quantity: "", unitPrice: "", note: "" },
      ],
    }));
  };

  const removeItem = (index: number) => {
    const items = [...formData.items];
    items.splice(index, 1);
    setFormData((prev: any) => ({ ...prev, items }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total: number, item: SaleItem) => {
      if (item.quantity && item.unitPrice) {
        return total + parseFloat(item.quantity) * parseFloat(item.unitPrice);
      }
      return total;
    }, 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editingSale ? "Edit Sale" : "Create New Sale"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Saler <span className="text-red-500">*</span>
              </label>
              <Select
                id="salerId"
                name="salerId"
                options={salers.map((s) => ({ value: s.id, label: s.name }))}
                isLoading={!salers.length}
                onInputChange={(value) => setSalersSearch(value)}
                onChange={(selectedOption) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    salerId: selectedOption?.value.toString() || "",
                  }));
                }}
                value={
                  salers
                    .filter((s) => s.id.toString() === formData.salerId)
                    .map((s) => ({ value: s.id, label: s.name }))[0]
                }
                placeholder="Search and select saler..."
                className="basic-single"
                classNamePrefix="select"
                isClearable
                required
                isDisabled={isSubmitting || !!editingSale}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client (Optional)
              </label>
              <Select
                id="clientId"
                name="clientId"
                options={clients.map((c) => ({ value: c.id, label: c.name }))}
                isLoading={!clients.length}
                onInputChange={(value) => setClientsSearch(value)}
                onChange={(selectedOption) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    clientId: selectedOption?.value.toString() || "",
                  }));
                }}
                value={
                  clients
                    .filter((c) => c.id.toString() === formData.clientId)
                    .map((c) => ({ value: c.id, label: c.name }))[0]
                }
                placeholder="No client"
                className="basic-single"
                classNamePrefix="select"
                isClearable
                isDisabled={isSubmitting}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blocker (Optional)
              </label>
              <Select
                id="blockerId"
                name="blockerId"
                options={blockers.map((b) => ({ value: b.id, label: b.name }))}
                isLoading={!blockers.length}
                onInputChange={(value) => setBlockersSearch(value)}
                onChange={(selectedOption) => {
                  setFormData((prev: any) => ({
                    ...prev,
                    blockerId: selectedOption?.value.toString() || "",
                  }));
                }}
                value={
                  blockers
                    .filter((b) => b.id.toString() === formData.blockerId)
                    .map((b) => ({ value: b.id, label: b.name }))[0]
                }
                placeholder="No blocker"
                className="basic-single"
                classNamePrefix="select"
                isClearable
                isDisabled={isSubmitting}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Delivery Date
              </label>
              <input
                type="date"
                id="expectedDeliveryDate"
                name="expectedDeliveryDate"
                value={formData.expectedDeliveryDate}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sale Items
            </h3>

            {formData.items.length === 0 ? (
              <div className="text-center py-4 border border-dashed border-gray-300 rounded-md bg-gray-50">
                <p className="text-gray-500">
                  No items added. Click "Add Item" to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.items.map((item: SaleItem, index: number) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-md bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-medium text-gray-700">
                        Item #{index + 1}
                      </h4>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={isSubmitting || formData.items.length === 1}
                        className="inline-flex items-center p-1 border border-transparent text-sm font-medium rounded-md text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        <Trash size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product <span className="text-red-500">*</span>
                        </label>
                        <Select
                          options={products.map((p) => ({
                            value: p.id,
                            label: p.name,
                          }))}
                          isLoading={!products.length}
                          onInputChange={setProductsSearch}
                          onChange={(option) =>
                            handleProductSelect(index, option)
                          }
                          value={
                            products
                              .filter((p) => p.id.toString() === item.productId)
                              .map((p) => ({ value: p.id, label: p.name }))[0]
                          }
                          placeholder="Select product..."
                          className="basic-single"
                          classNamePrefix="select"
                          isClearable
                          required
                          isDisabled={
                            isSubmitting || (!!editingSale && !!item.id)
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity (Kg) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="quantity"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          min="0.01"
                          step="0.01"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price (RWF){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="unitPrice"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          min="0.01"
                          step="0.01"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Note (Optional)
                      </label>
                      <input
                        type="text"
                        name="note"
                        value={item.note || ""}
                        onChange={(e) => handleItemChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>

                    {item.quantity && item.unitPrice && (
                      <div className="mt-2 text-right">
                        <p className="text-sm font-medium text-gray-700">
                          Subtotal:{" "}
                          {(
                            parseFloat(item.quantity) *
                            parseFloat(item.unitPrice)
                          ).toLocaleString()}{" "}
                          RWF
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <Plus size={16} className="mr-1" /> Add Item
                  </button>
                <div className="p-3 bg-gray-100 rounded-md mt-2">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-700 font-medium">Total Amount:</p>
                    <p className="text-xl font-bold text-gray-900">
                      {calculateTotal().toLocaleString()} RWF
                    </p>
                  </div>
                </div>
              </div>
            )}

            {formData.items.length === 0 && (
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={addItem}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Plus size={16} className="mr-1" /> Add Item
                </button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              General Notes
            </label>
            <textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={handleFormChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
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
                !formData.salerId ||
                formData.items.length === 0 ||
                !formData.items.every(
                  (item: SaleItem) =>
                    item.productId && item.quantity && item.unitPrice
                )
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
                  {editingSale ? "Updating..." : "Creating..."}
                </>
              ) : editingSale ? (
                "Update Sale"
              ) : (
                "Create Sale"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
