import { Router, Request, Response, NextFunction } from 'express';
import { problemService } from './problem.service.js';

export const problemRouter = Router();

problemRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const problems = problemService.getAllProblems();
    res.json({ success: true, data: problems });
  } catch (error) {
    next(error);
  }
});

problemRouter.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const problem = problemService.getProblemById(req.params.id);
    res.json({ success: true, data: problem });
  } catch (error) {
    next(error);
  }
});
