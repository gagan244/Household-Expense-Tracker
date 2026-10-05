import { Request, Response } from 'express';
import Expense from '../models/Expense.js';

// @desc    Get all expenses
// @route   GET /api/expenses
export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve expenses',
      error: error.message,
    });
  }
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
export const getExpenseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      res.status(404).json({
        success: false,
        message: `Expense not found with id ${req.params.id}`,
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve expense',
      error: error.message,
    });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category, amount, date, description } = req.body;

    if (!title || amount === undefined || amount === null) {
      res.status(400).json({
        success: false,
        message: 'Title and amount are required fields',
      });
      return;
    }

    const expense = await Expense.create({
      title,
      category: category || 'Groceries',
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: expense,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Failed to create expense',
      error: error.message,
    });
  }
};

// @desc    Update existing expense
// @route   PUT /api/expenses/:id
export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, category, amount, date, description } = req.body;

    const expense = await Expense.findById(id);
    if (!expense) {
      res.status(404).json({
        success: false,
        message: `Expense not found with id ${id}`,
      });
      return;
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      {
        title,
        category,
        amount: Number(amount),
        date,
        description,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: updatedExpense,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Failed to update expense',
      error: error.message,
    });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id);

    if (!expense) {
      res.status(404).json({
        success: false,
        message: `Expense not found with id ${id}`,
      });
      return;
    }

    await Expense.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete expense',
      error: error.message,
    });
  }
};
