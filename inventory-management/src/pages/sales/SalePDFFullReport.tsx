import React, { forwardRef } from "react";

interface SalePDFFullReportProps {
  sales: any[];
  exportDate: string;
}

const SalePDFFullReport = forwardRef<HTMLDivElement, SalePDFFullReportProps>(
  ({ sales, exportDate }, ref) => {
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

    // Totals
    const totalAmount = sales.reduce(
      (sum, s) =>
        sum +
        s.items.reduce(
          (itemSum: number, item: any) =>
            itemSum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
          0
        ),
      0
    );
    const totalPaid = sales.reduce(
      (sum, s) => sum + Number(s.totalPaid || 0),
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
          Sales Report
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

        {/* Sales Table */}
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
                Saler
              </th>
              <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
                Client
              </th>
              <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
                Products
              </th>
              <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
                Amount
              </th>
              <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
                Paid
              </th>
              <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
                Unpaid
              </th>
              <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((s) => {
              const amount = s.items.reduce(
                (sum: number, item: any) =>
                  sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
                0
              );
              const paid = Number(s.totalPaid || 0);
              const unpaid = amount - paid;
              return (
                <tr
                  key={s.id}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    backgroundColor: "#fff",
                  }}
                >
                  <td style={{ padding: "8px" }}>{s.saleReference}</td>
                  <td style={{ padding: "8px" }}>
                    {s.saler?.profile?.names || "—"}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {s.client?.profile?.names || "—"}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {s.items && s.items.length > 0
                      ? s.items.map((item: any) => item.product?.name).join(", ")
                      : "—"}
                  </td>
                  <td style={{ padding: "8px", textAlign: "right" }}>
                    {formatAmount(amount)}
                  </td>
                  <td style={{ padding: "8px", textAlign: "right" }}>
                    {formatAmount(paid)}
                  </td>
                  <td style={{ padding: "8px", textAlign: "right" }}>
                    {formatAmount(unpaid)}
                  </td>
                  <td style={{ padding: "8px" }}>{formatDate(s.createdAt)}</td>
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

export default SalePDFFullReport;