import React, { useState } from 'react';
import { Expense, EXPENSE_CATEGORIES } from '../types/expense.js';
import { Edit2, Trash2, Search, Filter, AlertTriangle } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => Promise<void>;
  editingId: string | null;
  isLoading: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onEdit,
  onDelete,
  editingId,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter expenses by search keyword and category
  const filteredExpenses = expenses.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteConfirm = async (id: string) => {
    setIsDeleting(true);
    try {
      await onDelete(id);
      setPendingDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Groceries':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Utilities':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Bills':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Transport':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Housing':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Healthcare':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Entertainment':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header & Filters */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Expenses List</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredExpenses.length} of {expenses.length} record(s)
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses by title or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal / Banner */}
      {pendingDeleteId && (
        <div className="p-4 bg-amber-50 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-800 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Are you sure you want to permanently delete this expense?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDeleteConfirm(pendingDeleteId)}
              disabled={isDeleting}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md shadow-sm transition disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
            <button
              onClick={() => setPendingDeleteId(null)}
              disabled={isDeleting}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-md transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table Content */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-indigo-600 mb-2"></div>
          <p className="text-sm">Loading expenses from MongoDB...</p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-slate-600 font-medium">No expenses found</p>
          <p className="text-slate-400 text-xs mt-1">
            {expenses.length === 0
              ? 'Get started by adding your first household expense above.'
              : 'Try changing your search term or category filter.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredExpenses.map((expense) => {
                const isSelectedForEdit = editingId === expense._id;
                return (
                  <tr
                    key={expense._id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelectedForEdit ? 'bg-indigo-50/60' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{expense.title}</div>
                      {expense.description ? (
                        <div className="text-xs text-slate-500 mt-0.5 max-w-xs truncate">
                          {expense.description}
                        </div>
                      ) : null}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-medium border rounded-full ${getCategoryBadgeClass(
                          expense.category
                        )}`}
                      >
                        {expense.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs font-medium">
                      {expense.date}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <span className="font-bold text-slate-900 text-base">
                        ₹{Number(expense.amount).toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => onEdit(expense)}
                          title="Edit expense"
                          className={`p-1.5 rounded-md border text-xs font-medium transition cursor-pointer ${
                            isSelectedForEdit
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-indigo-600'
                          }`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setPendingDeleteId(expense._id)}
                          title="Delete expense"
                          className="p-1.5 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-medium transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
