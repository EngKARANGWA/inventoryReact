import { forwardRef } from "react";

interface Props {
  sale: any;
  exportDate: string;
}

const SalePDFReport = forwardRef<HTMLDivElement, Props>(
  ({ sale, exportDate }, ref) => {
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

    const formatNumber = (value?: string | number) =>
      value
        ? Number(value).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })
        : "N/A";

    const totalQuantity =
      sale.items?.reduce(
        (sum: number, item: any) => sum + parseFloat(item.quantity || 0),
        0
      ) || 0;
    const totalDelivered =
      sale.items?.reduce(
        (sum: number, item: any) => sum + parseFloat(item.totalDelivered || 0),
        0
      ) || 0;
    const totalValue =
      sale.items?.reduce(
        (sum: number, item: any) =>
          sum +
          parseFloat(item.quantity || 0) * parseFloat(item.unitPrice || 0),
        0
      ) || 0;
    const remainingPayment = totalValue - parseFloat(sale.totalPaid || 0);

    const tableHeaderStyle = {
      backgroundColor: "#f1f5f9",
      borderBottom: "1px solid #e2e8f0",
      padding: "8px",
      textAlign: "left" as const,
      fontWeight: 600,
    };

    const tableCellStyle = {
      padding: "8px",
      borderBottom: "1px solid #e2e8f0",
      backgroundColor: "#fff",
    };

    const tableStyle = {
      width: "100%",
      borderCollapse: "collapse" as const,
      marginBottom: "24px",
      border: "1px solid #e2e8f0",
      fontSize: "12px",
    };

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
          Sale Report - {sale.saleReference}
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

        {/* Basic Info */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={{ ...tableCellStyle, fontWeight: 600, width: "30%" }}>
                Expected Delivery:
              </td>
              <td style={tableCellStyle}>
                {sale.expectedDeliveryDate
                  ? formatDate(sale.expectedDeliveryDate)
                  : "N/A"}
              </td>
            </tr>
            <tr>
              <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                Created At:
              </td>
              <td style={tableCellStyle}>{formatDate(sale.createdAt)}</td>
            </tr>
          </tbody>
        </table>

        {/* Involved Parties */}
        <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>
          Participants
        </h3>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                Saler:
              </td>
              <td style={tableCellStyle}>
                {sale.saler?.profile?.names || "N/A"}
              </td>
            </tr>
            <tr>
              <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                Client:
              </td>
              <td style={tableCellStyle}>
                {sale.client?.profile?.names || "N/A"}
              </td>
            </tr>
            <tr>
              <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                Blocker:
              </td>
              <td style={tableCellStyle}>
                {sale.blocker?.profile?.names || "N/A"}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Financials */}
        <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>
          Payment Summary
        </h3>
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                Total Amount:
              </td>
              <td style={{ ...tableCellStyle, textAlign: "right", color: "#16a34a" }}>
                {formatAmount(totalValue)}
              </td>
            </tr>
            <tr>
              <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                Total Paid:
              </td>
              <td style={{ ...tableCellStyle, textAlign: "right", color: "#2563eb" }}>
                {formatAmount(sale.totalPaid)}
              </td>
            </tr>
            <tr>
              <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                Remaining Payment:
              </td>
              <td style={{ ...tableCellStyle, textAlign: "right", color: "#dc2626" }}>
                {formatAmount(remainingPayment)}
              </td>
            </tr>
            <tr>
              <td style={{ ...tableCellStyle, fontWeight: 600 }}>
                Notes:
              </td>
              <td style={tableCellStyle}>{sale.note || "N/A"}</td>
            </tr>
          </tbody>
        </table>

        {/* Items */}
        <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>Sale Items</h3>
        <table style={tableStyle}>
          <thead>
            <tr style={{ ...tableHeaderStyle }}>
              <th style={tableHeaderStyle}>#</th>
              <th style={tableHeaderStyle}>Product</th>
              <th style={tableHeaderStyle}>Description</th>
              <th style={tableHeaderStyle}>Qty (Kg)</th>
              <th style={tableHeaderStyle}>Unit Price</th>
              <th style={tableHeaderStyle}>Subtotal</th>
              <th style={tableHeaderStyle}>Delivered (Kg)</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item: any, index: number) => (
              <tr key={item.id}>
                <td style={tableCellStyle}>{index + 1}</td>
                <td style={tableCellStyle}>{item.product?.name || "N/A"}</td>
                <td style={tableCellStyle}>{item.product?.description || "N/A"}</td>
                <td style={{ ...tableCellStyle, textAlign: "right" }}>
                  {formatNumber(item.quantity)}
                </td>
                <td style={{ ...tableCellStyle, textAlign: "right" }}>
                  {formatAmount(item.unitPrice)}
                </td>
                <td style={{ ...tableCellStyle, textAlign: "right" }}>
                  {formatAmount(
                    parseFloat(item.quantity) * parseFloat(item.unitPrice)
                  )}
                </td>
                <td style={{ ...tableCellStyle, textAlign: "right" }}>
                  {formatNumber(item.totalDelivered)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: "#f8fafc" }}>
              <td 
                colSpan={3} 
                style={{ ...tableCellStyle, fontWeight: 600, backgroundColor: "#f8fafc" }}
              >
                Total
              </td>
              <td style={{ ...tableCellStyle, textAlign: "right", fontWeight: 600, backgroundColor: "#f8fafc" }}>
                {formatNumber(totalQuantity)}
              </td>
              <td style={{ ...tableCellStyle, backgroundColor: "#f8fafc" }}></td>
              <td style={{ ...tableCellStyle, textAlign: "right", fontWeight: 600, backgroundColor: "#f8fafc" }}>
                {formatAmount(totalValue)}
              </td>
              <td style={{ ...tableCellStyle, textAlign: "right", fontWeight: 600, backgroundColor: "#f8fafc" }}>
                {formatNumber(totalDelivered)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Delivery Records */}
        {sale.deliveries?.length > 0 && (
          <>
            <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>
              Delivery Records
            </h3>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderStyle}>
                  <th style={tableHeaderStyle}>#</th>
                  <th style={tableHeaderStyle}>Reference</th>
                  <th style={tableHeaderStyle}>Product</th>
                  <th style={tableHeaderStyle}>Quantity (Kg)</th>
                  <th style={tableHeaderStyle}>Unit Price</th>
                  <th style={tableHeaderStyle}>Warehouse</th>
                  <th style={tableHeaderStyle}>Delivered At</th>
                  <th style={tableHeaderStyle}>Driver</th>
                </tr>
              </thead>
              <tbody>
                {sale.deliveries.map((delivery: any, index: number) => (
                  <tr key={delivery.id}>
                    <td style={tableCellStyle}>{index + 1}</td>
                    <td style={tableCellStyle}>{delivery.deliveryReference}</td>
                    <td style={tableCellStyle}>{delivery.product?.name || "N/A"}</td>
                    <td style={{ ...tableCellStyle, textAlign: "right" }}>
                      {formatNumber(delivery.quantity)}
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: "right" }}>
                      {formatAmount(delivery.unitPrice)}
                    </td>
                    <td style={tableCellStyle}>
                      {delivery.warehouse?.name || "N/A"}
                    </td>
                    <td style={tableCellStyle}>
                      {delivery.deliveredAt
                        ? formatDate(delivery.deliveredAt)
                        : "Pending"}
                    </td>
                    <td style={tableCellStyle}>
                      {delivery.driver?.profile?.names ||
                        delivery.driver?.username ||
                        "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    );
  }
);

export default SalePDFReport;