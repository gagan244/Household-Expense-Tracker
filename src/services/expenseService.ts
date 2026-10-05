import axios from 'axios';
import { Expense, ExpenseFormData } from '../types/expense.js';

const API_BASE_URL = '/api/expenses';

// Get all expenses
export const fetchExpenses = async (): Promise<Expense[]> => {
  const response = await axios.get(API_BASE_URL);
  return response.data.data;
};

// Get single expense by ID
export const fetchExpenseById = async (id: string): Promise<Expense> => {
  const response = await axios.get(`${API_BASE_URL}/${id}`);
  return response.data.data;
};

// Create a new expense
export const createExpense = async (data: ExpenseFormData): Promise<Expense> => {
  const response = await axios.post(API_BASE_URL, {
    ...data,
    amount: Number(data.amount),
  });
  return response.data.data;
};

// Update an existing expense
export const updateExpense = async (id: string, data: ExpenseFormData): Promise<Expense> => {
  const response = await axios.put(`${API_BASE_URL}/${id}`, {
    ...data,
    amount: Number(data.amount),
  });
  return response.data.data;
};

// Delete an expense
export const deleteExpense = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${id}`);
};
