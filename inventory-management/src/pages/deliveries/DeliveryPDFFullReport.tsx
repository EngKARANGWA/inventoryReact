import { forwardRef } from "react";
import { Delivery } from "../../services/deliveryService";

interface Props {
  deliveries: Delivery[];
  exportDate: string;
}

const DeliveryPDFFullReport = forwardRef<HTMLDivElement, Props>(
  ({ deliveries, exportDate }, ref) => {
    const formatAmount = (val: number | string | undefined) => {
      const amount = Number(val) || 0;
      return new Intl.NumberFormat("en-US", {
        style: "decimal",
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
    const totalQuantity = deliveries.reduce(
      (sum, d) => sum + Number(d.quantity || 0),
      0
    );

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
          Deliveries Report
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

        {/* Deliveries Table */}
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
                Direction
              </th>
              <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
                Product
              </th>
              <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
                Warehouse
              </th>
              <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
                Driver
              </th>
              <th style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}>
                Quantity
              </th>
              <th style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}>
                Delivered At
              </th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr
                key={d.id}
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  backgroundColor: "#fff",
                }}
              >
                <td style={{ padding: "8px" }}>{d.deliveryReference}</td>
                <td style={{ padding: "8px" }}>{d.direction}</td>
                <td style={{ padding: "8px" }}>{d.product?.name || "—"}</td>
                <td style={{ padding: "8px" }}>{d.warehouse?.name || "—"}</td>
                <td style={{ padding: "8px" }}>
                  {d.driver?.profile?.names || "—"}
                </td>
                <td style={{ padding: "8px", textAlign: "right" }}>
                  {formatAmount(d.quantity)}
                </td>
                <td style={{ padding: "8px" }}>{formatDate(d.deliveredAt)}</td>
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
                <strong>Total Quantity:</strong>
              </td>
              <td
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #e2e8f0",
                  textAlign: "right",
                  color: "#16a34a",
                }}
              >
                {formatAmount(totalQuantity)} KG
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
);

export default DeliveryPDFFullReport;