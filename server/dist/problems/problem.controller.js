import { Router } from 'express';
import { problemService } from './problem.service.js';
export const problemRouter = Router();
problemRouter.get('/', (req, res, next) => {
    try {
        const problems = problemService.getAllProblems();
        res.json({ success: true, data: problems });
    }
    catch (error) {
        next(error);
    }
});
problemRouter.get('/:id', (req, res, next) => {
    try {
        const problem = problemService.getProblemById(req.params.id);
        res.json({ success: true, data: problem });
    }
    catch (error) {
        next(error);
    }
});
