import React from "react";
import { Production } from "./types";
import { formatCurrency, formatDate, formatNumber } from "./utils";

interface Props {
  production: Production;
  exportDate: string;
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: "12px",
  marginBottom: "16px",
};

const cellStyle = {
  border: "1px solid #000",
  padding: "4px",
};

const ProductionPDFReport: React.FC<Props> = ({ production, exportDate }) => {
  const totalMaterialCost = parseFloat(production.usedQuantity?.toString() || "0") *
    parseFloat(production.mainProductUnitPrice?.toString() || "0");

  const totalProductionCost = production.productionCost?.reduce((sum, cost) => {
    const val = parseFloat((cost.total || cost.cost || cost.amount || cost.price || 0).toString());
    return sum + (isNaN(val) ? 0 : val);
  }, 0) || 0;

  const totalCost = totalMaterialCost + totalProductionCost;

  const byproductRevenue = production.outcomes?.reduce((sum, outcome) => {
    if (outcome.outcomeType === "byproduct" && outcome.unitPrice) {
      return sum + parseFloat(outcome.quantity.toString()) * parseFloat(outcome.unitPrice.toString());
    }
    return sum;
  }, 0) || 0;

  const netProductionCost = totalCost - byproductRevenue;
  const unitCost = production.totalOutcome ? netProductionCost / parseFloat(production.totalOutcome.toString()) : 0;

  const outcomeBreakdown = {
    finished: parseFloat(production.totalOutcome?.toString() || "0"),
    byproducts: production.outcomes?.filter(o => o.outcomeType === "byproduct").reduce((sum, o) => sum + parseFloat(o.quantity.toString()), 0) || 0,
    losses: production.outcomes?.filter(o => o.outcomeType === "loss").reduce((sum, o) => sum + parseFloat(o.quantity.toString()), 0) || 0,
  };

  const efficiency = parseFloat(production.efficiency?.toString() || "0");
  const lossPercentage = production.usedQuantity ? (outcomeBreakdown.losses / parseFloat(production.usedQuantity.toString())) * 100 : 0;
  const yieldPercentage = production.usedQuantity ? (outcomeBreakdown.finished / parseFloat(production.usedQuantity.toString())) * 100 : 0;

  return (
    <div style={{ padding: "40px", fontFamily: "Arial", fontSize: "12px", color: "#000" }}>
      <h1 style={{ color: "#16a34a", fontWeight: "bold", fontSize: "18px", marginBottom: "4px" }}>IHIRWE TRADING CO. LTD</h1>
      <h2 style={{ fontSize: "16px", fontWeight: "bold" }}>Production Batch Report</h2>
      <p>Exported on: {exportDate}</p>
      <p><strong>Batch Ref:</strong> {production.referenceNumber}</p>
      <p><strong>Date:</strong> {formatDate(production.date)}</p>
      <hr style={{ margin: "12px 0" }} />

      {/* Used Section */}
      <h3>1. Raw material</h3><br />
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={cellStyle}>Product</th>
            <th style={cellStyle}>Quantity (kg)</th>
            <th style={cellStyle}>Unit Price</th>
            <th style={cellStyle}>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cellStyle}>{production.mainProduct?.name}</td>
            <td style={cellStyle}>{formatNumber(production.usedQuantity || 0)}</td>
            <td style={cellStyle}>{formatCurrency(Number(production.mainProductUnitPrice))}</td>
            <td style={cellStyle}>{formatCurrency(totalMaterialCost)}</td>
          </tr>
        </tbody>
      </table>

      {/* Produced Section */}
      <h3>2. Outcome</h3><br />
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={cellStyle}>Product</th>
            <th style={cellStyle}>Quantity (kg)</th>
            <th style={cellStyle}>Unit Price</th>
            <th style={cellStyle}>Total</th>
          </tr>
        </thead>
        <tbody>
          {production.outcomes?.filter(o => o.outcomeType === "finished_product").map((o, i) => (
            <tr key={i}>
              <td style={cellStyle}>{o.name}</td>
              <td style={cellStyle}>{formatNumber(o.quantity)}</td>
              <td style={cellStyle}>{formatCurrency(Number(o.unitPrice))}</td>
              <td style={cellStyle}>{formatCurrency(parseFloat(o.quantity.toString()) * parseFloat(o.unitPrice?.toString() || "0"))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ByProduct Section */}
      <h3>3. ByProduct</h3><br />
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={cellStyle}>Product</th>
            <th style={cellStyle}>Quantity (kg)</th>
            <th style={cellStyle}>Unit Price</th>
            <th style={cellStyle}>Total</th>
          </tr>
        </thead>
        <tbody>
          {production.outcomes?.filter(o => o.outcomeType === "byproduct").map((o, i) => (
            <tr key={i}>
              <td style={cellStyle}>{o.name}</td>
              <td style={cellStyle}>{formatNumber(o.quantity)}</td>
              <td style={cellStyle}>{formatCurrency(Number(o.unitPrice))}</td>
              <td style={cellStyle}>{formatCurrency(parseFloat(o.quantity.toString()) * parseFloat(o.unitPrice?.toString() || "0"))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Loss Section */}
      <h3>4. Loss</h3><br />
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={cellStyle}>Product</th>
            <th style={cellStyle}>Quantity (kg)</th>
          </tr>
        </thead>
        <tbody>
          {production.outcomes?.filter(o => o.outcomeType === "loss").map((o, i) => (
            <tr key={i}>
              <td style={cellStyle}>{o.name}</td>
              <td style={cellStyle}>{formatNumber(o.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Efficiency Section */}
      <h3>5. Efficiency</h3><br />
      <table style={tableStyle}>
        <tbody>
          <tr><td style={cellStyle}>Production Efficiency</td><td style={cellStyle}>{efficiency.toFixed(1)}%</td></tr>
          <tr><td style={cellStyle}>Yield %</td><td style={cellStyle}>{yieldPercentage.toFixed(1)}%</td></tr>
          <tr><td style={cellStyle}>Loss %</td><td style={cellStyle}>{lossPercentage.toFixed(1)}%</td></tr>
        </tbody>
      </table>

      {/* Totals Section */}
      <h3>6. Total Calculations</h3><br />
      <table style={tableStyle}>
        <tbody>
          <tr><td style={cellStyle}>Material Cost</td><td style={cellStyle}>{formatCurrency(totalMaterialCost)}</td></tr>
          <tr><td style={cellStyle}>Production Cost</td><td style={cellStyle}>{formatCurrency(totalProductionCost)}</td></tr>
          <tr><td style={cellStyle}>Total Cost</td><td style={cellStyle}>{formatCurrency(totalCost)}</td></tr>
          <tr><td style={cellStyle}>Byproduct Revenue</td><td style={cellStyle}>-{formatCurrency(byproductRevenue)}</td></tr>
          <tr><td style={cellStyle}><strong>Net Production Cost</strong></td><td style={cellStyle}><strong>{formatCurrency(netProductionCost)}</strong></td></tr>
          <tr><td style={cellStyle}>Unit Cost(/Kg)</td><td style={cellStyle}>{formatCurrency(unitCost)}/kg</td></tr>
        </tbody>
      </table>

      {/* Notes Section */}
      {production.notes && (
        <div style={{ marginTop: "16px" }}>
          <h3>Notes</h3>
          <p>{production.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ProductionPDFReport;
