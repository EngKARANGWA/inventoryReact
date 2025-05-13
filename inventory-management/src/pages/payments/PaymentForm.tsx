import React, { useState, useEffect } from "react";
import { Payment } from "../../services/paymentService";
import { paymentService } from "../../services/paymentService";
import Select from "react-select";
import { X } from "lucide-react";

interface PaymentFormProps {
  payment?: Payment | null;
  onClose: () => void;
  onSubmit: (payment: Payment) => void;
}


const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(num);
};

const PaymentForm: React.FC<PaymentFormProps> = ({
  payment,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    amount: "",
    payableType: "",
    paymentMethod: "",
    transactionReference: "",
    purchaseId: "",
    saleId: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [purchasesLoading, setPurchasesLoading] = useState(false);
  const [salesLoading, setSalesLoading] = useState(false);
  const [purchasesOptions, setPurchasesOptions] = useState<
    { value: number; label: string; totalPaid: number; weight: number; unitPrice: number }[]
  >([]);
  const [salesOptions, setSalesOptions] = useState<
    { value: number; label: string; totalPaid: number; totalAmount: number }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState<number | null>(null);

  useEffect(() => {
    if (payment) {
      setFormData({
        amount: payment.amount.toString(),
        payableType: payment.payableType,
        paymentMethod: payment.paymentMethod,
        transactionReference: payment.transactionReference || "",
        purchaseId: payment.purchaseId?.toString() || "",
        saleId: payment.saleId?.toString() || "",
      });
    }
  }, [payment]);

  useEffect(() => {
    if (formData.payableType === "purchase") {
      fetchPurchases();
    } else if (formData.payableType === "sale") {
      fetchSales();
    }
  }, [formData.payableType]);

  useEffect(() => {
    if (formData.payableType === "purchase" && formData.purchaseId) {
      const selectedPurchase = purchasesOptions.find(
        (p) => p.value.toString() === formData.purchaseId
      );
      if (selectedPurchase) {
        const totalAmount = selectedPurchase.weight * selectedPurchase.unitPrice;
        const remaining = totalAmount - selectedPurchase.totalPaid;
        setRemainingAmount(remaining > 0 ? remaining : 0);
      }
    } else if (formData.payableType === "sale" && formData.saleId) {
      const selectedSale = salesOptions.find(
        (s) => s.value.toString() === formData.saleId
      );
      if (selectedSale) {
        const remaining = selectedSale.totalAmount - selectedSale.totalPaid;
        setRemainingAmount(remaining > 0 ? remaining : 0);
      }
    } else {
      setRemainingAmount(null);
    }
  }, [formData.purchaseId, formData.saleId, purchasesOptions, salesOptions]);

  const fetchPurchases = async () => {
    setPurchasesLoading(true);
    try {
      const response = await paymentService.getPurchases("");
      const purchases = response || [];
      const filteredPurchases = purchases.filter(
        (p: any) => p.status !== "delivery_complete" && p.status !== "completed"
      );
      
      setPurchasesOptions(
        filteredPurchases.map((purchase: any) => ({
          value: purchase.id,
          label: `${purchase.purchaseReference} (${purchase.description})`,
          totalPaid: parseFloat(purchase.totalPaid) || 0,
          weight: parseFloat(purchase.weight) || 0,
          unitPrice: parseFloat(purchase.unitPrice) || 0
        }))
      );
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setPurchasesLoading(false);
    }
  };

  const fetchSales = async () => {
    setSalesLoading(true);
    try {
      const response = await paymentService.getSalesWithItems("");
      const sales = response || [];
      const filteredSales = sales.filter(
        (s: any) => s.status !== "completed" && s.status !== "payment_complete"
      );
      
      setSalesOptions(
        filteredSales.map((sale: any) => ({
          value: sale.id,
          label: `${sale.saleReference} - ${
            sale.client?.user?.profile?.names || "Unknown"
          } (Total: ${formatNumber(sale.totalAmount)} RWF, Paid: ${formatNumber(sale.totalPaid)} RWF)`,
          totalPaid: parseFloat(sale.totalPaid) || 0,
          totalAmount: parseFloat(sale.totalAmount) || 0
        }))
      );
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setSalesLoading(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "payableType" && {
        purchaseId: "",
        saleId: "",
      }),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const amountValue = parseFloat(formData.amount.replace(/,/g, ""));
      const paymentData = {
        amount: amountValue,
        payableType: formData.payableType as "purchase" | "sale",
        paymentMethod: formData.paymentMethod as
          | "bank_transfer"
          | "cheque"
          | "cash"
          | "mobile_money",
        ...(formData.payableType === "purchase" && {
          purchaseId: parseInt(formData.purchaseId),
        }),
        ...(formData.payableType === "sale" && {
          saleId: parseInt(formData.saleId),
        }),
      };

      let result;
      if (payment) {
        result = await paymentService.updatePayment(
          payment.id,
          paymentData,
          file || undefined
        );
      } else {
        result = await paymentService.createPayment(
          paymentData,
          file || undefined
        );
      }

      onSubmit(result);
      onClose();
    } catch (error) {
      console.error("Error saving payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {payment ? "Edit Payment" : "Create New Payment"}
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
        <div className="grid grid-cols-1 gap-6">
          {/* Payable Type */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Payable Type <span className="text-red-500">*</span>
              </label>
              {remainingAmount !== null && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm">
                  Remaining: {formatNumber(remainingAmount)} RWF
                </div>
              )}
            </div>
            <select
              name="payableType"
              value={formData.payableType}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting || !!payment}
            >
              <option value="">Select payable type</option>
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
            </select>
          </div>

          {/* Purchase/Sale Select */}
          {formData.payableType === "purchase" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase <span className="text-red-500">*</span>
              </label>
              <Select
                id="purchaseId"
                name="purchaseId"
                options={purchasesOptions}
                isLoading={purchasesLoading}
                onChange={(selectedOption) => {
                  setFormData((prev) => ({
                    ...prev,
                    purchaseId: selectedOption?.value.toString() || "",
                  }));
                }}
                value={purchasesOptions.find(
                  (option) => option.value.toString() === formData.purchaseId
                )}
                placeholder="Search and select purchase..."
                className="basic-single"
                classNamePrefix="select"
                isClearable
                required
                isDisabled={isSubmitting || !!payment}
              />
              {!purchasesLoading && purchasesOptions.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  No purchases available or all purchases are already completed.
                </p>
              )}
            </div>
          )}

          {formData.payableType === "sale" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sale <span className="text-red-500">*</span>
              </label>
              <Select
                id="saleId"
                name="saleId"
                options={salesOptions}
                isLoading={salesLoading}
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
                isDisabled={isSubmitting || !!payment}
              />
              {!salesLoading && salesOptions.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  No sales available or all sales are already completed.
                </p>
              )}
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (RWF) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="amount"
              value={formData.amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/,/g, "");
                if (!isNaN(Number(rawValue))) {
                  setFormData({
                    ...formData,
                    amount: rawValue,
                  });
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={isSubmitting}
            >
              <option value="">Select payment method</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          {/* Transaction Reference (File Upload) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Reference (Proof)
            </label>
            <input
              type="file"
              name="transactionReference"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
            {payment?.transactionReference && !file && (
              <p className="mt-1 text-sm text-gray-500">
                Current file: {payment.transactionReference}
              </p>
            )}
          </div>
        </div>

        {/* Form buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
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
              !formData.amount ||
              !formData.payableType ||
              !formData.paymentMethod ||
              (formData.payableType === "purchase" && !formData.purchaseId) ||
              (formData.payableType === "sale" && !formData.saleId)
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
                {payment ? "Updating..." : "Creating..."}
              </>
            ) : payment ? (
              "Update Payment"
            ) : (
              "Create Payment"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;