import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config.js';
import { getDatabase } from './db/database.js';
import { problemRouter } from './problems/problem.controller.js';
import { attemptRouter } from './attempts/attempt.controller.js';
import { SAMPLE_SOLUTIONS } from './problems/sample-solutions.js';
import { SubmissionValidationError } from './submissions/submission.validator.js';
import { InvalidStateTransitionError } from './attempts/attempt.state-machine.js';

const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: '2mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    evaluatorMode: config.evaluatorMode,
    aiConfigured: Boolean(config.geminiApiKey)
  });
});

// Config info for frontend
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    evaluatorMode: config.evaluatorMode,
    aiConfigured: Boolean(config.geminiApiKey),
    model: config.geminiModel
  });
});

// Sample solution helper for rapid demoing / testing
app.get('/api/sample-solution/:problemId', (req: Request, res: Response) => {
  const solution = SAMPLE_SOLUTIONS[req.params.problemId];
  if (!solution) {
    res.status(404).json({ success: false, message: 'No sample solution available for this problem' });
    return;
  }
  res.json({ success: true, data: solution });
});

// Domain Routes
app.use('/api/problems', problemRouter);
app.use('/api/attempts', attemptRouter);

// Serve Frontend Static Files
const clientDistCandidates = [
  path.resolve(process.cwd(), 'client', 'dist'),
  path.resolve(process.cwd(), '..', 'client', 'dist')
];

let clientDistPath: string | null = null;
for (const p of clientDistCandidates) {
  if (fs.existsSync(p)) {
    clientDistPath = p;
    break;
  }
}

if (clientDistPath) {
  app.use(express.static(clientDistPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath!, 'index.html'));
  });
}

// Centralized Error Handler (Never expose raw stack traces)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[API Error] ${req.method} ${req.path}:`, err?.message || err);

  if (err instanceof SubmissionValidationError) {
    res.status(400).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
    return;
  }

  if (err instanceof InvalidStateTransitionError) {
    res.status(400).json({
      success: false,
      message: err.message,
      currentStatus: err.currentStatus,
      targetStatus: err.targetStatus
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 
    ? 'An unexpected error occurred while processing your request. Please try again.'
    : err.message || 'Operation failed';

  res.status(statusCode).json({
    success: false,
    message
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  // Ensure DB initialized
  getDatabase();
  app.listen(config.port, () => {
    console.log(`\n=================================================`);
    console.log(`🚀 LLD Practice Platform Server running on port ${config.port}`);
    console.log(`⚙️  Evaluator Mode: [${config.evaluatorMode.toUpperCase()}]`);
    console.log(`🔑 Gemini AI Key: ${config.geminiApiKey ? 'Configured ✅' : 'Not configured (Mock/Rule-based active) ℹ️'}`);
    console.log(`=================================================\n`);
  });
}

export default app;
