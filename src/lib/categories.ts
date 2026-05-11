export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Salary",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<string, string> = {
  Food: "var(--chart-1)",
  Transport: "var(--chart-2)",
  Shopping: "var(--chart-3)",
  Bills: "var(--chart-4)",
  Entertainment: "var(--chart-5)",
  Health: "var(--chart-6)",
  Education: "var(--chart-7)",
  Salary: "var(--chart-8)",
  Other: "var(--chart-9)",
};

export const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);
