import React, { forwardRef } from "react";
import { Purchase } from "../../services/purchaseService";

interface Props {
  purchases: Purchase[];
  exportDate: string;
}

const cellStyle = {
  border: "1px solid #000",
  padding: "8px",
  fontSize: "16px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: "16px",
  marginBottom: "16px",
};

const PurchasePDFReport = forwardRef<HTMLDivElement, Props>(
  ({ purchases, exportDate }, ref) => {
    // Calculate totals
    const totalAmount = purchases.reduce(
      (sum, p) => sum + Number(p.weight || 0) * Number(p.unitPrice || 0),
      0
    );
    const totalPaid = purchases.reduce(
      (sum, p) => sum + Number(p.totalPaid || 0),
      0
    );
    const totalUnpaid = totalAmount - totalPaid;

    const formatAmount = (val: number | string | undefined) =>
      Number(val || 0).toLocaleString();

    const formatDate = (dateString?: string) =>
      dateString ? new Date(dateString).toLocaleDateString() : "N/A";

    return (
      <div
        ref={ref}
        style={{
          padding: "48px",
          fontFamily: "Arial, sans-serif",
          fontSize: "18px",
          color: "#000",
          width: "100%",
          boxSizing: "border-box",
          minWidth: "210mm",
          minHeight: "297mm",
        }}
      >
        <h1
          style={{
            color: "#16a34a",
            fontWeight: "bold",
            fontSize: "18px",
            marginBottom: "4px",
          }}
        >
          IHIRWE TRADING CO. LTD
        </h1>
        <h2 style={{ fontSize: "16px", fontWeight: "bold" }}>
          Purchases Report
        </h2>
        <p>Exported on: {exportDate}</p>
        <hr style={{ margin: "12px 0" }} />

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Reference</th>
              <th style={cellStyle}>Supplier</th>
              <th style={cellStyle}>Product</th>
              <th style={cellStyle}>Weight (kg)</th>
              <th style={cellStyle}>Unit Price</th>
              <th style={cellStyle}>Total</th>
              <th style={cellStyle}>Paid</th>
              <th style={cellStyle}>Unpaid</th>
              <th style={cellStyle}>Date</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p, idx) => {
              const total = Number(p.weight || 0) * Number(p.unitPrice || 0);
              const paid = Number(p.totalPaid || 0);
              const unpaid = total - paid;
              return (
                <tr key={p.id || idx}>
                  <td style={cellStyle}>{p.purchaseReference}</td>
                  <td style={cellStyle}>
                    {p.user?.profile?.names || "Unknown"}
                  </td>
                  <td style={cellStyle}>{p.product?.name || "—"}</td>
                  <td style={cellStyle}>{p.weight}</td>
                  <td style={cellStyle}>{formatAmount(Number(p.unitPrice))}</td>
                  <td style={cellStyle}>{formatAmount(total)}</td>
                  <td style={cellStyle}>{formatAmount(paid)}</td>
                  <td style={cellStyle}>{formatAmount(unpaid)}</td>
                  <td style={cellStyle}>{formatDate(p.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={cellStyle}>
                <strong>Total Amount:</strong>
              </td>
              <td style={cellStyle}>{formatAmount(totalAmount)}</td>
              <td style={cellStyle}>
                <strong>Total Paid:</strong>
              </td>
              <td style={cellStyle}>{formatAmount(totalPaid)}</td>
              <td style={cellStyle}>
                <strong>Total Unpaid:</strong>
              </td>
              <td style={cellStyle}>{formatAmount(totalUnpaid)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
);

export default PurchasePDFReport;
