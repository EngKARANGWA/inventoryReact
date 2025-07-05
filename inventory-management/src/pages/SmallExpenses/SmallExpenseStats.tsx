import React, { useEffect, useState } from "react";
import { SmallExpense } from "../../services/smallExpenseService";
import { ArrowDown, ArrowUp, Banknote, Wallet } from "lucide-react";
import { getCurrentBalance } from "../../services/smallExpenseService";
import { toast } from "react-hot-toast";

interface SmallExpenseStatsProps {
  loading: boolean;
  expenses: SmallExpense[];
  refreshTrigger: number; // Add this prop to trigger refreshes
}

const SmallExpenseStats: React.FC<SmallExpenseStatsProps> = ({
  loading,
  expenses,
  refreshTrigger, // Add this prop
}) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      currency: "RWF",
    }).format(amount);
  };

  const inbound = expenses.filter((e) => e.direction === "in");
  const outbound = expenses.filter((e) => e.direction === "out");

  const totalInAmount = inbound.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );
  const totalOutAmount = outbound.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  );

  const fetchBalance = async () => {
    setBalanceLoading(true);
    try {
      const data = await getCurrentBalance();
      setBalance(data.currentBalance);
    } catch (error) {
      toast.error("Failed to fetch current balance");
    } finally {
      setBalanceLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [refreshTrigger]); // Add refreshTrigger as dependency

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {/* Expenses Count Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs md:text-sm font-medium text-gray-500">
            Expenses Count
          </p>
          <div className="flex space-x-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowDown className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 bg-red-100 rounded-full flex items-center justify-center">
              <ArrowUp className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-1 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>In:</span>
            <span className="font-semibold">
              {loading ? "..." : inbound.length}(
              <span>{loading ? "..." : formatCurrency(totalInAmount)}</span>)
            </span>
          </div>
          <div className="flex justify-between">
            <span>Out:</span>
            <span className="font-semibold">
              {loading ? "..." : outbound.length}(
              <span>{loading ? "..." : formatCurrency(totalOutAmount)}</span>)
            </span>
          </div>
        </div>
      </div>

      {/* Total In Value Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Total In Value
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                formatCurrency(totalInAmount)
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <Banknote className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          From {loading ? "..." : inbound.length} expenses
        </div>
      </div>

      {/* Total Out Value Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Total Out Value
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : (
                formatCurrency(totalOutAmount)
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Banknote className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          From {loading ? "..." : outbound.length} expenses
        </div>
      </div>

      {/* Current Balance Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-gray-500">
              Current Balance
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-800">
              {balanceLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                balance !== null ? formatCurrency(balance) : "N/A"
              )}
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          {balanceLoading ? "Loading..." : "Updated from balance snapshot"}
        </div>
      </div>
    </div>
  );
};

export default SmallExpenseStats;