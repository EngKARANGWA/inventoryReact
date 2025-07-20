import { forwardRef } from "react";
import { Payment } from "../../services/paymentService";

interface Props {
  payments: Payment[];
  exportDate: string;
}

const PaymentsPDFReport = forwardRef<HTMLDivElement, Props>(
  ({ payments, exportDate }, ref) => {
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

    const totalAmount = payments.reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    );

    const getPartyName = (payment: Payment) => {
      if (payment.payableType === "purchase") {
        return payment.purchase?.user?.profile?.names || "—";
      } else {
        return payment.sale?.client?.profile?.names || "—";
      }
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
          Payments Report
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

        {/* Payments Table */}
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
                Type
              </th>
              <th
                style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}
              >
                Party
              </th>
              <th
                style={{ padding: "8px", textAlign: "right", fontWeight: 600 }}
              >
                Amount
              </th>
              <th
                style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}
              >
                Method
              </th>
              <th
                style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}
              >
                Status
              </th>
              <th
                style={{ padding: "8px", textAlign: "left", fontWeight: 600 }}
              >
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr
                key={p.id}
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  backgroundColor: "#fff",
                }}
              >
                <td style={{ padding: "8px" }}>{p.paymentReference}</td>
                <td style={{ padding: "8px" }}>{p.payableType}</td>
                <td style={{ padding: "8px" }}>{getPartyName(p)}</td>

                <td style={{ padding: "8px", textAlign: "right" }}>
                  {formatAmount(p.amount)}
                </td>
                <td style={{ padding: "8px" }}>{p.paymentMethod}</td>
                <td style={{ padding: "8px" }}>{p.status}</td>
                <td style={{ padding: "8px" }}>{formatDate(p.createdAt)}</td>
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
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
);

export default PaymentsPDFReport;
