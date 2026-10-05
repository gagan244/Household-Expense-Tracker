import React from 'react';
import { Expense } from '../types/expense.js';
import { IndianRupee, Receipt, Tag, TrendingUp } from 'lucide-react';

interface ExpenseMetricsProps {
  expenses: Expense[];
}

export const ExpenseMetrics: React.FC<ExpenseMetricsProps> = ({ expenses }) => {
  const totalAmount = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const count = expenses.length;
  const average = count > 0 ? totalAmount / count : 0;

  // Compute top category
  const categoryTotals = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  let topCategory = 'None';
  let topCategoryAmount = 0;
  for (const [category, amount] of Object.entries(categoryTotals)) {
    if (amount > topCategoryAmount) {
      topCategory = category;
      topCategoryAmount = amount;
    }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
          <IndianRupee className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Spent</p>
          <p className="text-xl font-bold text-slate-900">₹{totalAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
          <Receipt className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Records</p>
          <p className="text-xl font-bold text-slate-900">{count}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Average</p>
          <p className="text-xl font-bold text-slate-900">₹{average.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
          <Tag className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Top Category</p>
          <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{topCategory}</p>
          <p className="text-xs text-slate-400 font-medium">₹{topCategoryAmount.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
};
