import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

app.use(errorHandler as express.ErrorRequestHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
