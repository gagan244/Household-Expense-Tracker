import React, { useState, useEffect } from 'react';
import { Expense, ExpenseFormData, EXPENSE_CATEGORIES } from '../types/expense.js';
import { PlusCircle, CheckCircle, XCircle } from 'lucide-react';

interface ExpenseFormProps {
  onSubmit: (formData: ExpenseFormData) => Promise<void>;
  editingExpense: Expense | null;
  onCancelEdit: () => void;
  isSubmitting: boolean;
}

const defaultFormState: ExpenseFormData = {
  title: '',
  category: 'Groceries',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  description: '',
};

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onSubmit,
  editingExpense,
  onCancelEdit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<ExpenseFormData>(defaultFormState);
  const [validationError, setValidationError] = useState<string | null>(null);

  // When editingExpense changes, update local form values
  useEffect(() => {
    if (editingExpense) {
      setFormData({
        title: editingExpense.title,
        category: editingExpense.category,
        amount: editingExpense.amount,
        date: editingExpense.date,
        description: editingExpense.description || '',
      });
      setValidationError(null);
    } else {
      setFormData(defaultFormState);
    }
  }, [editingExpense]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!formData.title.trim()) {
      setValidationError('Please enter an expense title');
      return;
    }

    if (formData.amount === '' || Number(formData.amount) <= 0) {
      setValidationError('Please enter a valid amount greater than 0');
      return;
    }

    if (!formData.date) {
      setValidationError('Please select a date');
      return;
    }

    try {
      await onSubmit(formData);
      if (!editingExpense) {
        setFormData(defaultFormState);
      }
    } catch {
      // Error handled by parent
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {editingExpense
              ? 'Update the details for this expense record'
              : 'Record a new household transaction to your tracker'}
          </p>
        </div>
        {editingExpense && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            Editing Mode
          </span>
        )}
      </div>

      {validationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Expense Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Monthly Grocery, Electricity Bill"
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Category & Amount Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm font-medium">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Description / Notes (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={2}
            placeholder="Add any extra notes or memo..."
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition cursor-pointer"
          >
            {editingExpense ? (
              <>
                <CheckCircle className="w-4 h-4" />
                {isSubmitting ? 'Updating...' : 'Update Expense'}
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : 'Add Expense'}
              </>
            )}
          </button>

          {editingExpense && (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg focus:outline-none transition cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
