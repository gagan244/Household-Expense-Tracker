/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { Expense, ExpenseFormData } from './types/expense.js';
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from './services/expenseService.js';
import { ExpenseForm } from './components/ExpenseForm.js';
import { ExpenseList } from './components/ExpenseList.js';
import { ExpenseMetrics } from './components/ExpenseMetrics.js';
import { Wallet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  };

  // Fetch all expenses from backend
  const loadExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchExpenses();
      setExpenses(data);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      showNotification('error', err.response?.data?.message || 'Failed to load expenses from server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  // Handle Form Submission (Create or Update)
  const handleFormSubmit = async (formData: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      if (editingExpense) {
        // UPDATE operation
        await updateExpense(editingExpense._id, formData);
        showNotification('success', `Expense "${formData.title}" updated successfully.`);
        setEditingExpense(null);
      } else {
        // CREATE operation
        await createExpense(formData);
        showNotification('success', `Expense "${formData.title}" recorded successfully.`);
      }
      // Re-fetch expenses to sync with MongoDB
      await loadExpenses();
    } catch (err: any) {
      console.error('Submit error:', err);
      const msg = err.response?.data?.message || 'Operation failed. Please try again.';
      showNotification('error', msg);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit selection
  const handleEditSelect = (expense: Expense) => {
    setEditingExpense(expense);
    // Smooth scroll to form if needed on smaller screens
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  // Handle Delete operation
  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      showNotification('success', 'Expense deleted successfully.');
      if (editingExpense?._id === id) {
        setEditingExpense(null);
      }
      await loadExpenses();
    } catch (err: any) {
      console.error('Delete error:', err);
      showNotification('error', err.response?.data?.message || 'Failed to delete expense.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Household Expense Tracker
              </h1>
              <p className="text-xs text-slate-500 font-medium">MERN Stack CRUD Application</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={loadExpenses}
              disabled={isLoading}
              title="Refresh expenses"
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Flash Notifications */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center justify-between shadow-xs transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span className="text-sm font-medium">{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs font-semibold uppercase hover:underline opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Expense Metrics Summary */}
        <ExpenseMetrics expenses={expenses} />

        {/* 2-Column Responsive Layout: Form on Left/Top, List on Right/Bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-5 xl:col-span-4">
            <ExpenseForm
              onSubmit={handleFormSubmit}
              editingExpense={editingExpense}
              onCancelEdit={handleCancelEdit}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Right Column: List & Table */}
          <div className="lg:col-span-7 xl:col-span-8">
            <ExpenseList
              expenses={expenses}
              onEdit={handleEditSelect}
              onDelete={handleDelete}
              editingId={editingExpense?._id || null}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>Household Expense Tracker &bull; Full-stack MERN CRUD Pattern</p>
      </footer>
    </div>
  );
}
