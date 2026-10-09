import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Expense from './models/Expense.js';

// Fail fast, don't hang if disconnected
mongoose.set('bufferCommands', false);

let mongod: MongoMemoryServer | null = null;

export const initialExpenses = [
  {
    title: 'Monthly Grocery',
    category: 'Groceries',
    amount: 850,
    date: '2026-10-05',
    description: 'Monthly grocery shopping',
  },
  {
    title: 'Electricity Bill',
    category: 'Utilities',
    amount: 1200,
    date: '2026-10-03',
    description: 'Electricity utility payment',
  },
  {
    title: 'Internet Bill',
    category: 'Bills',
    amount: 700,
    date: '2026-10-01',
    description: 'High speed broadband',
  },
  {
    title: 'Transportation',
    category: 'Transport',
    amount: 300,
    date: '2026-10-04',
    description: 'Weekly metro card recharge',
  },
];

export const connectDB = async (): Promise<string | null> => {
  let uri = process.env.MONGODB_URI;

  try {
    if (uri) {
      console.log(`[MongoDB] Connecting to external MongoDB at ${uri}...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('[MongoDB] Connected to external MongoDB successfully.');
    } else {
      console.log('[MongoDB] No external MONGODB_URI provided. Starting in-memory MongoDB instance...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`[MongoDB] Connected to in-memory MongoDB at ${uri}`);
    }

    // Seed initial sample data if collection is empty
    const count = await Expense.countDocuments();
    if (count === 0) {
      console.log('[MongoDB] Seeding initial sample expenses...');
      await Expense.insertMany(initialExpenses);
      console.log('[MongoDB] Initial sample expenses seeded successfully.');
    }

    return uri;
  } catch (err: any) {
    console.warn('[MongoDB] Connection warning (using in-memory fallback):', err?.message || err);
    return null;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err: any) {
    console.error('[MongoDB] Disconnect error:', err.message);
  }
};
