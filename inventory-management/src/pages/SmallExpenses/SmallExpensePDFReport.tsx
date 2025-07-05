import { forwardRef } from "react";
import { SmallExpense } from "../../services/smallExpenseService";

interface BalanceData {
  currentBalance: number;
  updatedAt: string;
}

interface Props {
  expenses: SmallExpense[];
  exportDate: string;
  currentBalance?: BalanceData;
}

const SmallExpensePDFReport = forwardRef<HTMLDivElement, Props>(
  ({ expenses, exportDate, currentBalance }, ref) => {
    const formatAmount = (val: number | undefined) => {
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

    const totals = expenses.reduce(
      (acc, expense) => {
        const amount = Number(expense.amount) || 0;
        if (expense.direction === "in") {
          acc.income += amount;
        } else {
          acc.expenses += amount;
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );

    const balanceValue = currentBalance?.currentBalance || 0;
    const balanceUpdatedAt = currentBalance?.updatedAt;



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
            fontSize: "20px",
            fontWeight: "bold",
            color: "#16a34a",
            textAlign: "center",
            marginBottom: "8px",
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
          Small Expenses Report
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

        {/* Expenses Table */}
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
                style={{
                  padding: "8px",
                  textAlign: "left",
                  fontWeight: 600,
                }}
              >
                Operation
              </th>
              <th
                style={{
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: 600,
                }}
              >
                Amount
              </th>
              <th
                style={{
                  padding: "8px",
                  textAlign: "left",
                  fontWeight: 600,
                }}
              >
                Direction
              </th>
              <th
                style={{
                  padding: "8px",
                  textAlign: "left",
                  fontWeight: 600,
                }}
              >
                Payment Method
              </th>
              <th
                style={{
                  padding: "8px",
                  textAlign: "left",
                  fontWeight: 600,
                }}
              >
                Description
              </th>
              <th
                style={{
                  padding: "8px",
                  textAlign: "left",
                  fontWeight: 600,
                }}
              >
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr
                key={e.id}
                style={{
                  borderBottom: "1px solid #e2e8f0",
                  backgroundColor: e.direction === "in" ? "#f0fdf4" : "#fff1f2",
                }}
              >
                <td style={{ padding: "8px" }}>{e.operation}</td>
                <td
                  style={{
                    padding: "8px",
                    textAlign: "right",
                    color: e.direction === "in" ? "#16a34a" : "#dc2626",
                    fontWeight: 500,
                  }}
                >
                  {formatAmount(e.amount)}
                </td>
                <td style={{ padding: "8px" }}>
                  <span
                    style={{
                      textTransform: "capitalize",
                      color: e.direction === "in" ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {e.direction}
                  </span>
                </td>
                <td style={{ padding: "8px" }}>
                  {e.paymentMethod.replace(/_/g, " ")}
                </td>
                <td style={{ padding: "8px" }}>{e.description || "—"}</td>
                <td style={{ padding: "8px" }}>{formatDate(e.createdAt)}</td>
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
                <strong>Total Expenses:</strong>
              </td>
              <td
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #e2e8f0",
                  textAlign: "right",
                  color: "#dc2626",
                }}
              >
                {formatAmount(totals.expenses)}
              </td>
              <td style={{ padding: "8px", borderBottom: "1px solid #e2e8f0" }}>
                <strong>Total Income:</strong>
              </td>
              <td
                style={{
                  padding: "8px",
                  borderBottom: "1px solid #e2e8f0",
                  textAlign: "right",
                  color: "#16a34a",
                }}
              >
                {formatAmount(totals.income)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px" }}>
                <strong>Report Balance:</strong>
              </td>
              <td
                colSpan={3}
                style={{
                  padding: "8px",
                  textAlign: "right",
                  color:
                    totals.income - totals.expenses >= 0
                      ? "#16a34a"
                      : "#dc2626",
                }}
              >
                {formatAmount(totals.income - totals.expenses)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Overall Balance Section */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #e2e8f0",
            backgroundColor: "#f8fafc",
          }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  padding: "8px",
                  fontWeight: 600,
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                Overall Balance:
              </td>
              <td
                style={{
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: 600,
                  borderBottom: "1px solid #e2e8f0",
                  color: balanceValue >= 0 ? "#16a34a" : "#dc2626",
                }}
              >
                {formatAmount(balanceValue)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px" }}>
                <strong>Last Updated:</strong>
              </td>
              <td
                style={{
                  padding: "8px",
                  textAlign: "right",
                }}
              >
                {formatDate(balanceUpdatedAt)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
);

export default SmallExpensePDFReport;
