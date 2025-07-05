import { forwardRef } from "react";

interface Props {
  sale: any;
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

const formatNumber = (value?: string | number) =>
  value
    ? Number(value).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : "N/A";

const SalePDFReport = forwardRef<HTMLDivElement, Props>(
  ({ sale, exportDate }, ref) => {
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
    // const remainingQuantity = totalQuantity - totalDelivered;
    const remainingPayment = totalValue - parseFloat(sale.totalPaid || 0);

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
            fontSize: "18px",
            marginBottom: "4px",
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
          style={{ textAlign: "right", fontSize: "12px", marginBottom: "20px" }}
        >
          Exported at: {exportDate}
        </p>

        {/* Basic Info */}
        <table style={tableStyle}>
          <tbody>
            <tr>
              <td style={cellStyle}>
                <strong>Expected Delivery:</strong>
              </td>
              <td style={cellStyle}>
                {new Date(sale.expectedDeliveryDate).toLocaleDateString()}
              </td>
            </tr>
            <tr>
              <td style={cellStyle}>
                <strong>Created At:</strong>
              </td>
              <td style={cellStyle}>
                {new Date(sale.createdAt).toLocaleString()}
              </td>
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
              <td style={cellStyle}>
                <strong>Saler:</strong>
              </td>
              <td style={cellStyle}>{sale.saler?.profile?.names}</td>
            </tr>
            <tr>
              <td style={cellStyle}>
                <strong>Client:</strong>
              </td>
              <td style={cellStyle}>{sale.client?.profile?.names}</td>
            </tr>
            <tr>
              <td style={cellStyle}>
                <strong>Blocker:</strong>
              </td>
              <td style={cellStyle} colSpan={3}>
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
              <td style={cellStyle}>
                <strong>Total Amount:</strong>
              </td>
              <td style={cellStyle}>{formatNumber(totalValue)} RWF</td>
            </tr>
            <tr>
              <td style={cellStyle}>
                <strong>Total Paid:</strong>
              </td>
              <td style={cellStyle}>{formatNumber(sale.totalPaid)} RWF</td>
            </tr>
            <tr>
              <td style={cellStyle}>
                <strong>Remaining Payment:</strong>
              </td>
              <td style={cellStyle}>{formatNumber(remainingPayment)} RWF</td>
            </tr>
            <tr>
              <td style={cellStyle}>
                <strong>Notes:</strong>
              </td>
              <td style={cellStyle}>{sale.note || "N/A"}</td>
            </tr>
          </tbody>
        </table>

        {/* Items */}
        <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>Sale Items</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>#</th>
              <th style={cellStyle}>Product</th>
              <th style={cellStyle}>Description</th>
              <th style={cellStyle}>Qty</th>
              <th style={cellStyle}>Unit Price</th>
              <th style={cellStyle}>Subtotal</th>
              <th style={cellStyle}>Delivered</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item: any, index: number) => (
              <tr key={item.id}>
                <td style={cellStyle}>{index + 1}</td>
                <td style={cellStyle}>{item.product?.name}</td>
                <td style={cellStyle}>{item.product?.description}</td>
                <td style={cellStyle}>{formatNumber(item.quantity)} Kg</td>
                <td style={cellStyle}>{formatNumber(item.unitPrice)} RWF</td>
                <td style={cellStyle}>
                  {formatNumber(
                    parseFloat(item.quantity) * parseFloat(item.unitPrice)
                  )}{" "}
                  RWF
                </td>
                <td style={cellStyle}>
                  {formatNumber(item.totalDelivered)} Kg
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={cellStyle}>
                <strong>Total</strong>
              </td>
              <td style={cellStyle}>
                <strong>{formatNumber(totalQuantity)} Kg</strong>
              </td>
              <td style={cellStyle}></td>
              <td style={cellStyle}>
                <strong>{formatNumber(totalValue)} RWF</strong>
              </td>
              <td style={cellStyle}>
                <strong>{formatNumber(totalDelivered)} Kg</strong>
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
                <tr>
                  <th style={cellStyle}>#</th>
                  <th style={cellStyle}>Reference</th>
                  <th style={cellStyle}>Product</th>
                  <th style={cellStyle}>Quantity</th>
                  <th style={cellStyle}>Unit Price</th>
                  <th style={cellStyle}>Warehouse</th>
                  <th style={cellStyle}>Delivered At</th>
                  <th style={cellStyle}>Driver</th>
                </tr>
              </thead>
              <tbody>
                {sale.deliveries.map((delivery: any, index: number) => (
                  <tr key={delivery.id}>
                    <td style={cellStyle}>{index + 1}</td>
                    <td style={cellStyle}>{delivery.deliveryReference}</td>
                    <td style={cellStyle}>{delivery.product?.name || "N/A"}</td>
                    <td style={cellStyle}>
                      {formatNumber(delivery.quantity)} Kg
                    </td>
                    <td style={cellStyle}>
                      {formatNumber(delivery.unitPrice)} RWF
                    </td>
                    <td style={cellStyle}>
                      {delivery.warehouse?.name || "N/A"}
                    </td>
                    <td style={cellStyle}>
                      {delivery.deliveredAt
                        ? new Date(delivery.deliveredAt).toLocaleString()
                        : "Pending"}
                    </td>
                    <td style={cellStyle}>
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
