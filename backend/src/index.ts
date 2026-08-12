import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import feedbackRoutes from './routes/feedback.routes';
import themeRoutes from './routes/theme.routes';
import askRoutes from './routes/ask.routes';
import reportRoutes from './routes/report.routes';
import { errorHandler } from './middleware/error';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/ask', askRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Centralized error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});

export default app;
