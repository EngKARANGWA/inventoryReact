import { forwardRef } from "react";
import { Delivery } from "../../services/deliveryService";

interface Props {
  delivery: Delivery;
  exportDate: string;
}

const DeliveryPDFReport = forwardRef<HTMLDivElement, Props>(({ delivery, exportDate }, ref) => {
  const formatNumber = (value?: string | number) =>
    value ? Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : "N/A";

  return (
    <div ref={ref} style={{ padding: "40px", fontSize: "14px", lineHeight: "1.6", color: "#000", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#16a34a", textAlign: "center", marginBottom: "8px" }}>
        IHIRWE TRADING CO. LTD
      </h1>
      <h2 style={{ fontSize: "16px", fontWeight: 600, textAlign: "center", marginBottom: "16px" }}>
        Delivery Report - {delivery.deliveryReference}
      </h2>
      <p style={{ textAlign: "right", fontSize: "12px", marginBottom: "20px" }}>
        Exported at: {exportDate}
      </p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
        <tbody>
          <tr>
            <td><strong>Status:</strong></td>
            <td>{delivery.status}</td>
            <td><strong>Direction:</strong></td>
            <td>{delivery.direction}</td>
          </tr>
          <tr>
            <td><strong>Delivered At:</strong></td>
            <td>{new Date(delivery.deliveredAt).toLocaleString()}</td>
            <td><strong>Created At:</strong></td>
            <td>{new Date(delivery.createdAt).toLocaleString()}</td>
          </tr>
          <tr>
            <td><strong>Driver:</strong></td>
            <td colSpan={3}>{delivery.driver?.profile?.names || "N/A"}</td>
          </tr>
          <tr>
            <td><strong>Notes:</strong></td>
            <td colSpan={3}>{delivery.notes || "N/A"}</td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>Product & Warehouse</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
        <tbody>
          <tr>
            <td><strong>Product:</strong></td>
            <td>{delivery.product?.name || delivery.saleItem?.product?.name || "N/A"}</td>
            <td><strong>Description:</strong></td>
            <td>{delivery.product?.description || "N/A"}</td>
          </tr>
          <tr>
            <td><strong>Warehouse:</strong></td>
            <td>{delivery.warehouse?.name || "N/A"}</td>
            <td><strong>Location:</strong></td>
            <td>{delivery.warehouse?.location || "N/A"}</td>
          </tr>
          <tr>
            <td><strong>Quantity:</strong></td>
            <td>{formatNumber(delivery.quantity)} Kg</td>
            <td><strong>Unit Price:</strong></td>
            <td>{formatNumber(delivery.unitPrice)} RWF</td>
          </tr>
        </tbody>
      </table>

      {delivery.direction === "in" ? (
        <>
          <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>Purchase Details</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
            <tbody>
              <tr>
                <td><strong>Reference:</strong></td>
                <td>{delivery.purchase?.purchaseReference || "N/A"}</td>
                <td><strong>Supplier:</strong></td>
                <td>{delivery.purchase?.user?.profile?.names || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Weight:</strong></td>
                <td>{formatNumber(delivery.purchase?.weight)} Kg</td>
                <td><strong>Total Paid:</strong></td>
                <td>{formatNumber(delivery.purchase?.totalPaid)} RWF</td>
              </tr>
              <tr>
                <td><strong>Description:</strong></td>
                <td colSpan={3}>{delivery.purchase?.description || "N/A"}</td>
              </tr>
            </tbody>
          </table>
        </>
      ) : (
        <>
          <h3 style={{ fontWeight: "bold", marginBottom: "8px" }}>Sale Details</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "24px" }}>
            <tbody>
              <tr>
                <td><strong>Sale Reference:</strong></td>
                <td>{delivery.sale?.saleReference || delivery.saleItem?.sale?.saleReference || "N/A"}</td>
                <td><strong>Client:</strong></td>
                <td>{delivery.sale?.client?.profile?.names || "N/A"}</td>
              </tr>
              <tr>
                <td><strong>Note:</strong></td>
                <td colSpan={3}>{delivery.sale?.note || delivery.saleItem?.note || "N/A"}</td>
              </tr>
              {delivery.saleItem && (
                <>
                  <tr>
                    <td><strong>Product:</strong></td>
                    <td>{delivery.saleItem.product?.name || "N/A"}</td>
                    <td><strong>Quantity:</strong></td>
                    <td>{formatNumber(delivery.saleItem.quantity)} Kg</td>
                  </tr>
                  <tr>
                    <td><strong>Unit Price:</strong></td>
                    <td>{formatNumber(delivery.saleItem.unitPrice)} RWF</td>
                    <td><strong>Delivered:</strong></td>
                    <td>{formatNumber(delivery.saleItem.totalDelivered)} Kg</td>
                  </tr>
                </>
              )}
              <tr>
                
                <td><strong>Total Paid:</strong></td>
                <td>{formatNumber(delivery.sale?.totalPaid)} RWF</td>
              </tr>
              {delivery.sale?.totalAmount && (
                <tr>
                  <td><strong>Total Amount:</strong></td>
                  <td>{formatNumber(delivery.sale.totalAmount)} RWF</td>
                  <td><strong>Remaining:</strong></td>
                  <td>{formatNumber(Number(delivery.sale.totalAmount) - Number(delivery.sale.totalPaid))} RWF</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
});

export default DeliveryPDFReport;
