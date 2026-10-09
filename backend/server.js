import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import expensesRouter from './routes/expenses.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
  }),
);

app.use(express.json());

// Serverless-friendly cached database connection
let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) return;

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    }).then(() => {
      console.log('[MongoDB] Connected to database.');
    }).catch((err) => {
      connectionPromise = null;
      console.warn('[MongoDB] Connection warning:', err.message);
    });
  }

  await connectionPromise;
}

// Ensure DB is connected before processing incoming requests
app.use(async (_req, _res, next) => {
  try {
    if (process.env.MONGODB_URI && mongoose.connection.readyState !== 1) {
      await connectDB();
    }
  } catch (err) {
    console.warn('[MongoDB] Middleware connect warning:', err.message);
  }
  next();
});

// Health check endpoints
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({
    status: 'ok',
    message: 'Expense Tracker API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Mount routes on both /api/expenses and /expenses (handles Vercel rewrite variations)
app.use('/api/expenses', expensesRouter);
app.use('/expenses', expensesRouter);

app.use((error, _req, res, _next) => {
  if (error.name === 'ValidationError') {
    const message = Object.values(error.errors || {})
      .map((item) => item.message)
      .join(' ');
    return res.status(400).json({ message });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid expense data.' });
  }
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({ message: 'Request body must be valid JSON.' });
  }
  console.error(error);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

// If not running in a Vercel serverless environment, start standalone listener
if (!process.env.VERCEL) {
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

export default app;
