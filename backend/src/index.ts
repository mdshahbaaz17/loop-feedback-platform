import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.routes';
import feedbackRoutes from './routes/feedback.routes';
import themeRoutes from './routes/theme.routes';
import askRoutes from './routes/ask.routes';
import reportRoutes from './routes/report.routes';
import analyticsRoutes from './routes/analytics.routes';
import { errorHandler } from './middleware/error';
import { apiLimiter, authLimiter, aiLimiter } from './middleware/rateLimiter';
import { sanitizeInput } from './middleware/sanitize';
import { swaggerSpec } from './lib/swagger';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Security HTTP Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allowed for Swagger UI rendering
  })
);

// Configurable CORS
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));

// Input XSS Sanitization Middleware
app.use('/api', sanitizeInput);

// Swagger OpenAPI Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// General API Rate Limiting
app.use('/api', apiLimiter);

// Specific Route Rate Limiters
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/ask', aiLimiter, askRoutes);
app.use('/api/reports', aiLimiter, reportRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Centralized error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
});

export default app;

