import { Router, Request, Response, NextFunction } from 'express';
import { attemptService } from './attempt.service.js';
import { submissionRepository } from '../submissions/submission.repository.js';
import { evaluationService } from '../evaluations/evaluation.service.js';

export const attemptRouter = Router();

// POST /api/attempts - Create a new practice attempt
attemptRouter.post('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { problemId } = req.body;
    if (!problemId) {
      res.status(400).json({ success: false, message: 'problemId is required' });
      return;
    }
    const attempt = attemptService.createAttempt(problemId);
    res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
});

// GET /api/attempts - List all attempts (optionally filter by ?problemId=...)
attemptRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const problemId = req.query.problemId as string | undefined;
    const attempts = attemptService.getAllAttempts(problemId);
    res.json({ success: true, data: attempts });
  } catch (error) {
    next(error);
  }
});

// GET /api/attempts/:id - Get a specific attempt
attemptRouter.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const attempt = attemptService.getAttempt(req.params.id);
    res.json({ success: true, data: attempt });
  } catch (error) {
    next(error);
  }
});

// GET /api/attempts/:id/submission - Get submission for an attempt
attemptRouter.get('/:id/submission', (req: Request, res: Response, next: NextFunction) => {
  try {
    const submission = submissionRepository.getByAttemptId(req.params.id);
    res.json({ success: true, data: submission || null });
  } catch (error) {
    next(error);
  }
});

// PUT /api/attempts/:id/submission - Save draft submission
attemptRouter.put('/:id/submission', (req: Request, res: Response, next: NextFunction) => {
  try {
    const submission = attemptService.saveDraft(req.params.id, req.body);
    res.json({ success: true, data: submission, message: 'Draft saved successfully' });
  } catch (error) {
    next(error);
  }
});

// POST /api/attempts/:id/submit - Submit solution and trigger evaluation
attemptRouter.post('/:id/submit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await attemptService.submitAttempt(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Solution submitted and evaluated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/attempts/:id/evaluation - Get evaluation results for an attempt
attemptRouter.get('/:id/evaluation', (req: Request, res: Response, next: NextFunction) => {
  try {
    const evaluation = evaluationService.getEvaluation(req.params.id);
    res.json({ success: true, data: evaluation });
  } catch (error) {
    next(error);
  }
});

// POST /api/attempts/:id/retry - Retry problem (creates a new attempt preserving previous)
attemptRouter.post('/:id/retry', (req: Request, res: Response, next: NextFunction) => {
  try {
    const newAttempt = attemptService.retryAttempt(req.params.id);
    res.status(201).json({
      success: true,
      message: 'New attempt created successfully',
      data: newAttempt
    });
  } catch (error) {
    next(error);
  }
});
