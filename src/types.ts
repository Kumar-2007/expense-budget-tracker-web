export type Category = "Food" | "Travel" | "Bills" | "Entertainment" | "Shopping";

export const CATEGORIES: Category[] = ["Food", "Travel", "Bills", "Entertainment", "Shopping"];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "#f97316",
  Travel: "#0ea5e9",
  Bills: "#8b5cf6",
  Entertainment: "#ec4899",
  Shopping: "#10b981",
};

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: Category;
  date: string; // YYYY-MM-DD
  note?: string;
}

export type Theme = "light" | "dark";
export type View = "dashboard" | "transactions" | "settings";

export const formatINR = (value: number): string =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
