import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an expense title'],
      trim: true,
      maxlength: [100, 'Title cannot be longer than 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
      default: 'Groceries',
    },
    amount: {
      type: Number,
      required: [true, 'Please provide the expense amount'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    date: {
      type: String,
      required: [true, 'Please specify the expense date'],
      default: () => new Date().toISOString().split('T')[0],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model('Expense', expenseSchema);
