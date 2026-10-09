import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    title: {
      type: String,
      required: [true, 'Please provide an expense title'],
      trim: true,
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
  {
    timestamps: true,
  }
);

// Prevent mongoose overwrite model error during hot reloads
const Expense = mongoose.models.Expense || mongoose.model<IExpense>('Expense', expenseSchema);

export default Expense;
