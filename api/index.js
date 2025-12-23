import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

// Load .env from the api folder (resolve absolute path so it works from any cwd)
dotenv.config({ path: path.join(process.cwd(), 'api', '.env') });

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

console.log('Connecting to MongoDB at:', mongoUri ? '[REDACTED]' : mongoUri); // show presence only

if (!mongoUri) {
  console.error('❌ Missing MongoDB connection string. Set `MONGO_URI` in `api/.env` or provide `MONGODB_URI` as an environment variable.');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('✅ Connected to MongoDB!');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const __dirname = path.resolve();
const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5174', // Frontend URL
  credentials: true // Allow cookies to be sent
}));

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '/client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

app.listen(3000, () => {
  console.log('🚀 Server is running on port 3000!');
});
