export interface Expense {
  _id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ExpenseFormData = {
  title: string;
  category: string;
  amount: number | '';
  date: string;
  description: string;
};

export const EXPENSE_CATEGORIES = [
  'Groceries',
  'Utilities',
  'Bills',
  'Transport',
  'Housing',
  'Healthcare',
  'Entertainment',
  'Education',
  'Personal Care',
  'Other',
] as const;
