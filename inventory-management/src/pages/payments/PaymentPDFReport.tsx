import { forwardRef, useEffect, useState } from "react";
import { Payment, paymentService } from "../../services/paymentService";
import { formatNumber } from "../../utils/formatUtils";

interface Props {
  payment: Payment;
  exportDate: string;
}

const cellStyle = {
  border: "1px solid #000",
  padding: "4px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: "12px",
  marginBottom: "16px",
};

const isImageFile = (filename: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

const PaymentPDFReport = forwardRef<HTMLDivElement, Props>(({ payment, exportDate }, ref) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const isPurchase = payment.payableType === "purchase";
  const purchase = isPurchase ? payment.purchase as any : null;
  const sale = !isPurchase ? payment.sale as any : null;

  const unitPrice = purchase?.unitPrice?.toString() || "0";
  const weight = purchase?.weight?.toString() || "0";
  const totalCost = parseFloat(unitPrice) * parseFloat(weight);
  const totalPaid = payment.amount || 0;
  const remaining = isPurchase
    ? totalCost - totalPaid
    : sale
    ? parseFloat(sale.totalAmount?.toString() || "0") - totalPaid
    : 0;

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;

    const loadProof = async () => {
      if (!payment.transactionReference || !isImageFile(payment.transactionReference)) return;
      const filename = payment.transactionReference.split("/").pop();
      if (!filename) return;

      try {
        const blob = await paymentService.getPaymentFile(filename);
        if (isMounted) {
          objectUrl = URL.createObjectURL(blob);
          setImageUrl(objectUrl);
        }
      } catch (error) {
        console.error("Failed to load payment proof image:", error);
      }
    };

    loadProof();

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [payment.transactionReference]);

  return (
    <div ref={ref} style={{ padding: "40px", fontFamily: "Arial", fontSize: "12px", color: "#000" }}>
      <h1 style={{ color: "#16a34a", fontWeight: "bold", fontSize: "18px", marginBottom: "4px" }}>
        IHIRWE TRADING CO. LTD
      </h1>
      <h2 style={{ fontSize: "16px", fontWeight: "bold" }}>Payment Report</h2>
      <p>Exported on: {exportDate}</p>
      <p><strong>Payment Reference:</strong> {payment.paymentReference}</p>

      <hr style={{ margin: "12px 0" }} />

      <h3>Payment Information</h3>
      <p>Amount: {formatNumber(totalPaid)} RWF</p>
      <p>Method: {payment.paymentMethod.replace("_", " ")}</p>
      <p>Created At: {new Date(payment.createdAt).toLocaleString()}</p>
      <p>Paid At: {payment.paidAt ? new Date(payment.paidAt).toLocaleString() : "Not paid yet"}</p>

      {imageUrl && (
        <>
          <h3>Proof of Payment</h3><br />
          <img
            src={imageUrl}
            alt="Proof of Payment"
            style={{ maxWidth: "300px", marginBottom: "16px", border: "1px solid #000" }}
          />
        </>
      )}

      <h3>{isPurchase ? "Purchase Details" : "Sale Details"}</h3>

      {isPurchase && purchase && (
        <>
          <p>Reference: {purchase.purchaseReference || "N/A"}</p>
          <p>Supplier: {purchase.supplier?.user?.profile?.names || "Unknown"}</p>
          <p>Description: {purchase.description || "N/A"}</p>
          <p>Weight: {weight} kg</p>
          <p>Unit Price: {formatNumber(unitPrice)} RWF</p>
          <p>Total Cost: {formatNumber(totalCost)} RWF</p>
          <p><strong>Remaining: {formatNumber(remaining)} RWF</strong></p>
        </>
      )}

      {!isPurchase && sale && (
        <>
          <p>Reference: {sale.saleReference}</p>
          <p>Client: {sale.client?.user?.profile?.names || "Unknown"}</p>
          <p>Total Amount: {formatNumber(sale.totalAmount)} RWF</p>
          <p><strong>Remaining: {formatNumber(remaining)} RWF</strong></p>

          {sale.items && sale.items.length > 0 && (
            <>
              <h4>Items</h4><br />
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={cellStyle}>Product</th>
                    <th style={cellStyle}>Qty</th>
                    <th style={cellStyle}>Unit Price</th>
                    <th style={cellStyle}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item: any, idx: any) => (
                    <tr key={idx}>
                      <td style={cellStyle}>{item.product?.name || "N/A"}</td>
                      <td style={cellStyle}>{formatNumber(item.quantity)}</td>
                      <td style={cellStyle}>{formatNumber(item.unitPrice)} RWF</td>
                      <td style={cellStyle}>{formatNumber(item.quantity * item.unitPrice)} RWF</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
});

export default PaymentPDFReport;
