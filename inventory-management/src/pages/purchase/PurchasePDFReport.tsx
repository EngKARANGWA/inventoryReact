import React, { forwardRef } from "react";
import { Purchase } from "../../services/purchaseService";

interface Props {
  purchases: Purchase[];
  exportDate: string;
}

const PurchasePDFReport = forwardRef<HTMLDivElement, Props>(
  ({ purchases, exportDate }, ref) => {
    const formatAmount = (val: number | string | undefined) => {
      const amount = Number(val) || 0;
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "RWF",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const formatDate = (dateString?: string) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };

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

    return (
      <div
        ref={ref}
        style={{
          padding: "40px",
          fontSize: "14px",
          lineHeight: "1.6",
          color: "#000",
          fontFamily: "sans-serif",
        }}
      >
        <h1
          style={{
            color: "#16a34a",
            fontWeight: "bold",
            fontSize: "28px",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          IHIRWE TRADING CO. LTD
        </h1>
        <h2
          style={{
            fontSize: "16px",
            fontWeight: 600,
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          Purchases Report
        </h2>
        <p
          style={{
            textAlign: "right",
            fontSize: "12px",
            marginBottom: "20px",
          }}
        >
          Exported at: {exportDate}
        </p>

        {/* Purchases Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "24px",
            border: "1px solid #e2e8f0",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f1f5f9",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
                Reference
              </th>
              <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
                Supplier
              </th>
              <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
                Product
              </th>
              <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
                Weight (kg)
              </th>
              <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
                Unit Price
              </th>
              <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
                Total
              </th>
              <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
                Paid
              </th>
              <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
                Unpaid
              </th>
              <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
                Status
              </th>
              <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => {
              const total = Number(p.weight || 0) * Number(p.unitPrice || 0);
              const paid = Number(p.totalPaid || 0);
              const unpaid = total - paid;
              return (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    backgroundColor: "#fff",
                  }}
                >
                  <td style={{ padding: "8px" }}>{p.purchaseReference}</td>
                  <td style={{ padding: "8px" }}>
                    {p.user?.profile?.names || "—"}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {p.product?.name || "—"}
                  </td>
                  <td style={{ padding: "8px", textAlign: "right" }}>
                    {p.weight}
                  </td>
                  <td style={{ padding: "8px", textAlign: "right" }}>
                    {formatAmount(Number(p.unitPrice))}
                  </td>
                  <td style={{ padding: "8px", textAlign: "right" }}>
                    {formatAmount(total)}
                  </td>
                  <td style={{ padding: "8px", textAlign: "right" }}>
                    {formatAmount(paid)}
                  </td>
                  <td style={{ padding: "8px", textAlign: "right" }}>
                    {formatAmount(unpaid)}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {p.status || "—"}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {formatDate(p.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Summary Section */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "24px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>
                <strong>Total Amount:</strong>
              </td>
              <td
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #e2e8f0",
                  textAlign: "right",
                  color: "#16a34a",
                }}
              >
                {formatAmount(totalAmount)}
              </td>
              <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>
                <strong>Total Paid:</strong>
              </td>
              <td
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #e2e8f0",
                  textAlign: "right",
                  color: "#2563eb",
                }}
              >
                {formatAmount(totalPaid)}
              </td>
              <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>
                <strong>Total Unpaid:</strong>
              </td>
              <td
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #e2e8f0",
                  textAlign: "right",
                  color: "#dc2626",
                }}
              >
                {formatAmount(totalUnpaid)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
);

export default PurchasePDFReport;