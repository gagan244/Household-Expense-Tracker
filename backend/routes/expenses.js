import { Router } from 'express';
import mongoose from 'mongoose';
import Expense from '../models/Expense.js';

const router = Router();

let inMemoryExpenses = [
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

const isConnected = () => mongoose.connection.readyState === 1;

// GET all expenses
router.get('/', async (_req, res, next) => {
  try {
    if (isConnected()) {
      const expenses = await Expense.find().sort({ date: -1, createdAt: -1 });
      return res.json(expenses);
    }
    const sorted = [...inMemoryExpenses].sort((a, b) => (b.date > a.date ? 1 : -1));
    res.json(sorted);
  } catch (error) {
    next(error);
  }
});

// GET single expense
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isConnected()) {
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid expense ID.' });
      }
      const expense = await Expense.findById(id);
      if (!expense) return res.status(404).json({ message: 'Expense not found.' });
      return res.json(expense);
    }
    const item = inMemoryExpenses.find((e) => e._id === id);
    if (!item) return res.status(404).json({ message: 'Expense not found.' });
    res.json(item);
  } catch (error) {
    next(error);
  }
});

// POST create expense
router.post('/', async (req, res, next) => {
  try {
    const { title, category, amount, date, description } = req.body || {};
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const payload = {
      title: title.trim(),
      category: category || 'Groceries',
      amount: Number(amount),
      date: date || new Date().toISOString().split('T')[0],
      description: (description || '').trim(),
    };

    if (isConnected()) {
      const expense = await Expense.create(payload);
      return res.status(201).json(expense);
    }

    const now = new Date().toISOString();
    const hexId = Math.random().toString(16).substring(2, 10) + Date.now().toString(16);
    const newExpense = {
      _id: hexId,
      ...payload,
      createdAt: now,
      updatedAt: now,
    };
    inMemoryExpenses.unshift(newExpense);
    res.status(201).json(newExpense);
  } catch (error) {
    next(error);
  }
});

// PUT update expense
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, category, amount, date, description } = req.body || {};

    const updateData = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (category !== undefined) updateData.category = category;
    if (amount !== undefined) updateData.amount = Number(amount);
    if (date !== undefined) updateData.date = date;
    if (description !== undefined) updateData.description = String(description).trim();

    if (isConnected()) {
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid expense ID.' });
      }
      const expense = await Expense.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!expense) return res.status(404).json({ message: 'Expense not found.' });
      return res.json(expense);
    }

    const idx = inMemoryExpenses.findIndex((e) => e._id === id);
    if (idx === -1) return res.status(404).json({ message: 'Expense not found.' });
    inMemoryExpenses[idx] = {
      ...inMemoryExpenses[idx],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    res.json(inMemoryExpenses[idx]);
  } catch (error) {
    next(error);
  }
});

// DELETE expense
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (isConnected()) {
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid expense ID.' });
      }
      const expense = await Expense.findByIdAndDelete(id);
      if (!expense) return res.status(404).json({ message: 'Expense not found.' });
      return res.status(204).end();
    }
    const idx = inMemoryExpenses.findIndex((e) => e._id === id);
    if (idx === -1) return res.status(404).json({ message: 'Expense not found.' });
    inMemoryExpenses.splice(idx, 1);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;
