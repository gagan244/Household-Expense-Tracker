import { Router } from 'express';
import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';

const router = Router();

// Route: /api/expenses
router
  .route('/')
  .get(getExpenses)
  .post(createExpense);

// Route: /api/expenses/:id
router
  .route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

export default router;
