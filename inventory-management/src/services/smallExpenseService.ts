import api from "./authService";

export interface SmallExpense {
  id: number;
  operation: string;
  amount: number;
  direction: "in" | "out";
  paymentMethod: "bank_transfer" | "cheque" | "cash" | "mobile_money";
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const getAllExpenses = async (): Promise<SmallExpense[]> => {
  const res = await api.get("/small-expenses");

  return (res.data.expenses || []).map((exp: any) => ({
    ...exp,
    payment_method: exp.paymentMethod,
  }));
};

export const getExpenseById = async (id: number): Promise<SmallExpense> => {
  const res = await api.get(`/small-expenses/${id}`);
  return res.data;
};

export const createExpense = async (
  expense: Omit<SmallExpense, "id" | "createdAt" | "updatedAt">
): Promise<SmallExpense> => {
  const res = await api.post("/small-expenses", expense);
  return res.data;
};

export const updateExpense = async (
  id: number,
  expense: Partial<Omit<SmallExpense, "id" | "createdAt" | "updatedAt">>
): Promise<SmallExpense> => {
  const res = await api.put(`/small-expenses/${id}`, expense);
  return res.data;
};

export const deleteExpense = async (id: number): Promise<void> => {
  await api.delete(`/small-expenses/${id}`);
};

export const getCurrentBalance = async (): Promise<{ currentBalance: number; updatedAt: string }> => {
  const res = await api.get("/small-expenses/balance");
  return res.data.balance;
};
