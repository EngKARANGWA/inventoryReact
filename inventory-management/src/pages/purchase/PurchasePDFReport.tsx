import React from "react";
import { Purchase } from "../../services/purchaseService";

interface Props {
  purchase: Purchase;
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

const PurchasePDFReport: React.FC<Props> = ({ purchase, exportDate }) => {
  const deliveries = Array.isArray(purchase.deliveries)
    ? purchase.deliveries
    : Object.values(purchase.deliveries || {});

  const payments = Array.isArray(purchase.payments)
    ? purchase.payments
    : Object.values(purchase.payments || {}) as any[];

  const deliveryProgress =
    parseFloat(purchase.totalDelivered || "0") /
    parseFloat(purchase.weight || "1") *
    100;

  const totalPaid = parseFloat(purchase.totalPaid || "0");
  const totalCost = parseFloat(purchase.weight || "0") * parseFloat(purchase.unitPrice || "0");
  const remainingPayment = totalCost - totalPaid;

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", fontSize: "12px", color: "#000" }}>
      <h1 style={{ color: "#16a34a", fontWeight: "bold", fontSize: "18px", marginBottom: "4px" }}>
        IHIRWE TRADING CO. LTD
      </h1>
      <h2 style={{ fontSize: "16px", fontWeight: "bold" }}>Purchase Report</h2>
      <p>Exported on: {exportDate}</p>
      <p><strong>Reference:</strong> {purchase.purchaseReference}</p>

      <hr style={{ margin: "12px 0" }} />

      <h3>Supplier</h3>
      <p>Name: {purchase.user?.profile?.names || "Unknown"}</p>
      <p>Contact: {purchase.user?.profile?.phoneNumber || "N/A"}</p>

      <h3>Product</h3>
      <p>Product: {purchase.product?.name}</p>
      <p>Description: {purchase.product?.description}</p>
      <p>Weight: {purchase.weight} kg</p>
      <p>Unit Price: {purchase.unitPrice} RWF/kg</p>
      <p>Total Cost: {totalCost.toLocaleString()} RWF</p>
      <p>Total Paid: {totalPaid.toLocaleString()} RWF</p>
      {remainingPayment > 0 && (
        <p>Remaining Payment: {remainingPayment.toLocaleString()} RWF</p>
      )}

      <h3>Deliveries</h3><br />
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={cellStyle}>Reference</th>
            <th style={cellStyle}>Quantity</th>
            <th style={cellStyle}>Driver</th>
            <th style={cellStyle}>Date</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map((d: any, idx) => (
            <tr key={idx}>
              <td style={cellStyle}>{d.deliveryReference}</td>
              <td style={cellStyle}>{d.quantity}</td>
              <td style={cellStyle}>{d.driver?.profile?.names || "N/A"}</td>
              <td style={cellStyle}>{d.deliveredAt ? new Date(d.deliveredAt).toLocaleDateString() : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Payments</h3><br />
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={cellStyle}>Reference</th>
            <th style={cellStyle}>Amount</th>
            <th style={cellStyle}>Method</th>
            <th style={cellStyle}>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p: any, idx) => (
            <tr key={idx}>
              <td style={cellStyle}>{p.paymentReference}</td>
              <td style={cellStyle}>{parseFloat(p.amount).toLocaleString()}</td>
              <td style={cellStyle}>{p.paymentMethod}</td>
              <td style={cellStyle}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "N/A"}</td>
            </tr>
          ))}
          <tr>
            <td style={cellStyle} colSpan={3}><strong>Total</strong></td>
            <td style={cellStyle}><strong>{totalPaid.toLocaleString()} RWF</strong></td>
          </tr>
        </tbody>
      </table>

      <h3>Delivery Progress</h3>
      <p>{Math.round(deliveryProgress)}% completed</p>
    </div>
  );
};

export default PurchasePDFReport;
