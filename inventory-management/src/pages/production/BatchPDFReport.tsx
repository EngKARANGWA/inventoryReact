import React from "react";
import { Production } from "./types";
import { formatCurrency, formatDate, formatNumber } from "./utils";

interface Props {
  production: Production;
  exportDate: string;
}

const ProductionPDFReport: React.FC<Props> = ({ production, exportDate }) => {
  // Calculations (unchanged from your original)
  const totalMaterialCost =
    parseFloat(production.usedQuantity?.toString() || "0") *
    parseFloat(production.mainProductUnitPrice?.toString() || "0");

  const totalProductionCost =
    production.productionCost?.reduce((sum, cost) => {
      const val = parseFloat(
        (cost.total || cost.cost || cost.amount || cost.price || 0).toString()
      );
      return sum + (isNaN(val) ? 0 : val);
    }, 0) || 0;

  const totalCost = totalMaterialCost + totalProductionCost;

  const byproductRevenue =
    production.outcomes?.reduce((sum, outcome) => {
      if (outcome.outcomeType === "byproduct" && outcome.unitPrice) {
        return (
          sum +
          parseFloat(outcome.quantity.toString()) *
            parseFloat(outcome.unitPrice.toString())
        );
      }
      return sum;
    }, 0) || 0;

  const netProductionCost = totalCost - byproductRevenue;
  const unitCost = production.totalOutcome
    ? netProductionCost / parseFloat(production.totalOutcome.toString())
    : 0;

  const outcomeBreakdown = {
    finished: parseFloat(production.totalOutcome?.toString() || "0"),
    byproducts:
      production.outcomes
        ?.filter((o) => o.outcomeType === "byproduct")
        .reduce((sum, o) => sum + parseFloat(o.quantity.toString()), 0) || 0,
    losses:
      production.outcomes
        ?.filter((o) => o.outcomeType === "loss")
        .reduce((sum, o) => sum + parseFloat(o.quantity.toString()), 0) || 0,
  };

  const efficiency = parseFloat(production.efficiency?.toString() || "0");
  const lossPercentage = production.usedQuantity
    ? (outcomeBreakdown.losses /
        parseFloat(production.usedQuantity.toString())) *
      100
    : 0;
  const yieldPercentage = production.usedQuantity
    ? (outcomeBreakdown.finished /
        parseFloat(production.usedQuantity.toString())) *
      100
    : 0;

  return (
    <div
      style={{
        padding: "40px",
        fontSize: "14px",
        lineHeight: "1.6",
        color: "#000",
        fontFamily: "sans-serif",
      }}
    >
      {/* Header */}
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
        Production Batch Report
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

      {/* Batch Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
          paddingBottom: "8px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div>
          <p>
            <strong>Batch Ref:</strong> {production.referenceNumber}
          </p>
          <p>
            <strong>Product:</strong> {production.product?.name || "N/A"}
          </p>
        </div>
        <div>
          <p>
            <strong>Date:</strong> {formatDate(production.date)}
          </p>
          <p>
            <strong>Warehouse:</strong> {production.warehouse?.name || "N/A"}
          </p>
        </div>
      </div>

      {/* Raw Material Section */}
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 600,
          margin: "16px 0 8px 0",
          paddingBottom: "4px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        1. Raw Material
      </h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "24px",
          border: "1px solid #e2e8f0",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f1f5f9" }}>
            <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
              Product
            </th>
            <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
              Quantity (kg)
            </th>
            <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
              Unit Price
            </th>
            <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
            <td style={{ padding: "8px" }}>
              {production.mainProduct?.name || "—"}
            </td>
            <td style={{ padding: "8px", textAlign: "right" }}>
              {formatNumber(production.usedQuantity || 0)}
            </td>
            <td style={{ padding: "8px", textAlign: "right" }}>
              {formatCurrency(Number(production.mainProductUnitPrice))}
            </td>
            <td style={{ padding: "8px", textAlign: "right" }}>
              {formatCurrency(totalMaterialCost)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Outcome Section */}
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 600,
          margin: "16px 0 8px 0",
          paddingBottom: "4px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        2. Outcome
      </h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "24px",
          border: "1px solid #e2e8f0",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f1f5f9" }}>
            <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
              Product
            </th>
            <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
              Quantity (kg)
            </th>
            <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
              Unit Price
            </th>
            <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {production.outcomes
            ?.filter((o) => o.outcomeType === "finished_product")
            .map((o, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "8px" }}>{o.name || "—"}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  {formatNumber(o.quantity)}
                </td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  {formatCurrency(Number(o.unitPrice))}
                </td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  {formatCurrency(
                    parseFloat(o.quantity.toString()) *
                      parseFloat(o.unitPrice?.toString() || "0")
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Byproduct Section */}
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 600,
          margin: "16px 0 8px 0",
          paddingBottom: "4px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        3. Byproduct
      </h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "24px",
          border: "1px solid #e2e8f0",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f1f5f9" }}>
            <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
              Product
            </th>
            <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
              Quantity (kg)
            </th>
            <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
              Unit Price
            </th>
            <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {production.outcomes
            ?.filter((o) => o.outcomeType === "byproduct")
            .map((o, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "8px" }}>{o.name || "—"}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  {formatNumber(o.quantity)}
                </td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  {formatCurrency(Number(o.unitPrice))}
                </td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  {formatCurrency(
                    parseFloat(o.quantity.toString()) *
                      parseFloat(o.unitPrice?.toString() || "0")
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Loss Section */}
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 600,
          margin: "16px 0 8px 0",
          paddingBottom: "4px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        4. Loss
      </h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "24px",
          border: "1px solid #e2e8f0",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f1f5f9" }}>
            <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
              Product
            </th>
            <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
              Quantity (kg)
            </th>
          </tr>
        </thead>
        <tbody>
          {production.outcomes
            ?.filter((o) => o.outcomeType === "loss")
            .map((o, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "8px" }}>{o.name || "—"}</td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  {formatNumber(o.quantity)}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Packaging Section */}
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 600,
          margin: "16px 0 8px 0",
          paddingBottom: "4px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        5. Packaging Summary
      </h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "24px",
          border: "1px solid #e2e8f0",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f1f5f9" }}>
            <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
              Package Type/Size
            </th>
            <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
              Quantity
            </th>
            <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
              Total Weight (kg)
            </th>
          </tr>
        </thead>
        <tbody>
          {production.packagesSummary?.map((pkg, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
              <td style={{ padding: "8px" }}>{pkg.size || "—"}</td>
              <td style={{ padding: "8px", textAlign: "right" }}>
                {formatNumber(pkg.quantity)}
              </td>
              <td style={{ padding: "8px", textAlign: "right" }}>
                {formatNumber(pkg.totalWeight)}
              </td>
            </tr>
          ))}
          {(!production.packagesSummary ||
            production.packagesSummary.length === 0) && (
            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
              <td colSpan={3} style={{ padding: "8px", textAlign: "center" }}>
                No packaging information
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {/* Efficiency Section */}
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 600,
          margin: "16px 0 8px 0",
          paddingBottom: "4px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        6. Efficiency Metrics
      </h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "24px",
          border: "1px solid #e2e8f0",
        }}
      >
        <tbody>
          <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
            <td style={{ padding: "8px" }}>Production Efficiency</td>
            <td style={{ padding: "8px", textAlign: "right" }}>
              {efficiency.toFixed(1)}%
            </td>
          </tr>
          <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
            <td style={{ padding: "8px" }}>Yield %</td>
            <td style={{ padding: "8px", textAlign: "right" }}>
              {yieldPercentage.toFixed(1)}%
            </td>
          </tr>
          <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
            <td style={{ padding: "8px" }}>Loss %</td>
            <td style={{ padding: "8px", textAlign: "right" }}>
              {lossPercentage.toFixed(1)}%
            </td>
          </tr>
        </tbody>
      </table>

      {/* Cost Summary Section */}
      <h3
        style={{
          fontSize: "14px",
          fontWeight: 600,
          margin: "16px 0 8px 0",
          paddingBottom: "4px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        7. Cost Summary
      </h3>
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
          <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
            <td style={{ padding: "8px" }}>Material Cost</td>
            <td style={{ padding: "8px", textAlign: "right" }}>
              {formatCurrency(totalMaterialCost)}
            </td>
          </tr>
          <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
            <td style={{ padding: "8px" }}>Production Cost</td>
            <td style={{ padding: "8px", textAlign: "right" }}>
              {formatCurrency(totalProductionCost)}
            </td>
          </tr>
          <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
            <td style={{ padding: "8px" }}>Total Cost</td>
            <td style={{ padding: "8px", textAlign: "right" }}>
              {formatCurrency(totalCost)}
            </td>
          </tr>
          <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
            <td style={{ padding: "8px" }}>Byproduct Revenue</td>
            <td
              style={{ padding: "8px", textAlign: "right", color: "#16a34a" }}
            >
              -{formatCurrency(byproductRevenue)}
            </td>
          </tr>
          <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
            <td style={{ padding: "8px", fontWeight: 600 }}>
              Net Production Cost
            </td>
            <td style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
              {formatCurrency(netProductionCost)}
            </td>
          </tr>
          <tr>
            <td style={{ padding: "8px" }}>Unit Cost (/kg)</td>
            <td style={{ padding: "8px", textAlign: "right" }}>
              {formatCurrency(unitCost)}/kg
            </td>
          </tr>
        </tbody>
      </table>

      {/* Notes Section */}
      {production.notes && (
        <div style={{ marginTop: "16px" }}>
          <h3
            style={{
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "8px",
              paddingBottom: "4px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            Notes
          </h3>
          <p style={{ padding: "8px", lineHeight: "1.5" }}>
            {production.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductionPDFReport;
