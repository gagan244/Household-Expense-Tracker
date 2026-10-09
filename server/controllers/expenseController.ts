import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Expense from '../models/Expense.js';

interface ExpenseItem {
  _id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

let inMemoryExpenses: ExpenseItem[] = [
  {
    _id: '650000000000000000000001',
    title: 'Monthly Grocery',
    category: 'Groceries',
    amount: 850,
    date: '2026-10-05',
    description: 'Monthly grocery shopping',
    createdAt: new Date('2026-10-05T09:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-05T09:00:00Z').toISOString(),
  },
  {
    _id: '650000000000000000000002',
    title: 'Electricity Bill',
    category: 'Utilities',
    amount: 1200,
    date: '2026-10-03',
    description: 'Electricity utility payment',
    createdAt: new Date('2026-10-03T11:00:00Z').toISOString(),
    updatedAt: new Date('2026-10-03T11:00:00Z').toISOString(),
  },
  {
    _id: '650000000000000000000003',
    title: 'Internet Bill',
    category: 'Bills',
    amount: 700,
    date: '2026-10-01',
    description: 'High speed broadband',
    createdAt: new Date('2026-10-01T14:30:00Z').toISOString(),
    updatedAt: new Date('2026-10-01T14:30:00Z').toISOString(),
  },
  {
    _id: '650000000000000000000004',
    title: 'Transportation',
    category: 'Transport',
    amount: 300,
    date: '2026-10-04',
    description: 'Weekly metro card recharge',
    createdAt: new Date('2026-10-04T08:15:00Z').toISOString(),
    updatedAt: new Date('2026-10-04T08:15:00Z').toISOString(),
  },
];

const isDbConnected = (): boolean => mongoose.connection.readyState === 1;

// @desc    Get all expenses
// @route   GET /api/expenses
export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    if (isDbConnected()) {
      const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
      res.status(200).json({
        success: true,
        count: expenses.length,
        data: expenses,
      });
      return;
    }
  } catch (err: any) {
    console.warn('[ExpenseController] DB query failed, falling back to memory store:', err.message);
  }

  // In-memory fallback
  const sorted = [...inMemoryExpenses].sort((a, b) => (b.date > a.date ? 1 : -1));
  res.status(200).json({
    success: true,
    count: sorted.length,
    data: sorted,
  });
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
export const getExpenseById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    if (isDbConnected()) {
      const expense = await Expense.findById(id);
      if (expense) {
        res.status(200).json({
          success: true,
          data: expense,
        });
        return;
      }
    }
  } catch (err: any) {
    console.warn('[ExpenseController] DB query failed, falling back to memory store:', err.message);
  }

  // In-memory fallback
  const item = inMemoryExpenses.find((e) => e._id === id);
  if (!item) {
    res.status(404).json({
      success: false,
      message: `Expense not found with id ${id}`,
    });
    return;
  }
  res.status(200).json({
    success: true,
    data: item,
  });
};

// @desc    Create new expense
// @route   POST /api/expenses
export const createExpense = async (req: Request, res: Response): Promise<void> => {
  const { title, category, amount, date, description } = req.body;

  if (!title || amount === undefined || amount === null) {
    res.status(400).json({
      success: false,
      message: 'Title and amount are required fields',
    });
    return;
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    res.status(400).json({
      success: false,
      message: 'Amount must be a positive number',
    });
    return;
  }

  const expenseDate = date || new Date().toISOString().split('T')[0];
  const expenseCat = category || 'Groceries';
  const expenseDesc = description || '';

  try {
    if (isDbConnected()) {
      const expense = await Expense.create({
        title,
        category: expenseCat,
        amount: numAmount,
        date: expenseDate,
        description: expenseDesc,
      });

      res.status(201).json({
        success: true,
        message: 'Expense added successfully',
        data: expense,
      });
      return;
    }
  } catch (err: any) {
    console.warn('[ExpenseController] DB query failed, falling back to memory store:', err.message);
  }

  // In-memory fallback
  const now = new Date().toISOString();
  const hexId = Math.random().toString(16).substring(2, 10) + Date.now().toString(16);
  const newExpense: ExpenseItem = {
    _id: hexId,
    title,
    category: expenseCat,
    amount: numAmount,
    date: expenseDate,
    description: expenseDesc,
    createdAt: now,
    updatedAt: now,
  };

  inMemoryExpenses.push(newExpense);
  res.status(201).json({
    success: true,
    message: 'Expense added successfully',
    data: newExpense,
  });
};

// @desc    Update existing expense
// @route   PUT /api/expenses/:id
export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, category, amount, date, description } = req.body;

  try {
    if (isDbConnected()) {
      const updatedExpense = await Expense.findByIdAndUpdate(
        id,
        {
          title,
          category,
          amount: amount !== undefined ? Number(amount) : undefined,
          date,
          description,
        },
        { new: true, runValidators: true }
      );

      if (updatedExpense) {
        res.status(200).json({
          success: true,
          message: 'Expense updated successfully',
          data: updatedExpense,
        });
        return;
      }
    }
  } catch (err: any) {
    console.warn('[ExpenseController] DB query failed, falling back to memory store:', err.message);
  }

  // In-memory fallback
  const idx = inMemoryExpenses.findIndex((e) => e._id === id);
  if (idx === -1) {
    res.status(404).json({
      success: false,
      message: `Expense not found with id ${id}`,
    });
    return;
  }

  const existing = inMemoryExpenses[idx];
  const updatedItem: ExpenseItem = {
    ...existing,
    title: title !== undefined ? title : existing.title,
    category: category !== undefined ? category : existing.category,
    amount: amount !== undefined ? Number(amount) : existing.amount,
    date: date !== undefined ? date : existing.date,
    description: description !== undefined ? description : existing.description,
    updatedAt: new Date().toISOString(),
  };

  inMemoryExpenses[idx] = updatedItem;
  res.status(200).json({
    success: true,
    message: 'Expense updated successfully',
    data: updatedItem,
  });
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    if (isDbConnected()) {
      const expense = await Expense.findByIdAndDelete(id);
      if (expense) {
        res.status(200).json({
          success: true,
          message: 'Expense deleted successfully',
          data: {},
        });
        return;
      }
    }
  } catch (err: any) {
    console.warn('[ExpenseController] DB query failed, falling back to memory store:', err.message);
  }

  // In-memory fallback
  const idx = inMemoryExpenses.findIndex((e) => e._id === id);
  if (idx === -1) {
    res.status(404).json({
      success: false,
      message: `Expense not found with id ${id}`,
    });
    return;
  }

  inMemoryExpenses.splice(idx, 1);
  res.status(200).json({
    success: true,
    message: 'Expense deleted successfully',
    data: {},
  });
};
