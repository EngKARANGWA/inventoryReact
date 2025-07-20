import React, { forwardRef } from "react";
import { Production } from "./types";

interface Props {
  productions: Production[];
  exportDate: string;
}

const ProductionPDFFullReport = forwardRef<HTMLDivElement, Props>(
  ({ productions, exportDate }, ref) => {
    const formatNumber = (val: number | string | undefined) => {
      const num = Number(val) || 0;
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
      }).format(num);
    };

    const formatDate = (dateString?: string) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    };

    // Totals
    const totalOutcome = productions.reduce(
      (sum, p) => sum + Number(p.totalOutcome || 0),
      0
    );
    const avgEfficiency =
      productions.length > 0
        ? productions.reduce((sum, p) => sum + Number(p.efficiency || 0), 0) /
          productions.length
        : 0;

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
          Production Batches Report
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

        {/* Productions Table */}
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
              <th
                style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}
              >
                Reference
              </th>
              <th
                style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}
              >
                Product
              </th>
              <th
                style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}
              >
                Raw Material
              </th>
              <th
                style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}
              >
                Input (kg)
              </th>
              <th
                style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}
              >
                Output (kg)
              </th>
              <th
                style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}
              >
                Efficiency (%)
              </th>
              <th
                style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}
              >
                Warehouse
              </th>
              <th
                style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}
              >
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {productions.map((p) => (
              <tr
                key={p.id}
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  backgroundColor: "#fff",
                }}
              >
                <td style={{ padding: "8px" }}>{p.referenceNumber}</td>
                <td style={{ padding: "8px" }}>{p.product?.name || "—"}</td>
                <td style={{ padding: "8px" }}>{p.mainProduct?.name || "—"}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  {formatNumber(Number(p.usedQuantity))}
                </td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  {formatNumber(p.totalOutcome)}
                </td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  {p.efficiency !== undefined && p.efficiency !== null
                    ? Number(p.efficiency).toFixed(1)
                    : "—"}
                </td>
                <td style={{ padding: "8px" }}>{p.warehouse?.name || "—"}</td>
                <td style={{ padding: "8px" }}>{formatDate(p.date)}</td>
              </tr>
            ))}
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
                <strong>Total Output:</strong>
              </td>
              <td
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #e2e8f0",
                  textAlign: "right",
                  color: "#16a34a",
                }}
              >
                {formatNumber(totalOutcome)} kg
              </td>
              <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>
                <strong>Average Efficiency:</strong>
              </td>
              <td
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #e2e8f0",
                  textAlign: "right",
                  color: "#2563eb",
                }}
              >
                {avgEfficiency ? avgEfficiency.toFixed(1) : "0.0"} %
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
);

export default ProductionPDFFullReport;
