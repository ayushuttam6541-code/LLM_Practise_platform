import { problemRepository, ProblemRepository } from './problem.repository.js';
import { Problem } from '../shared/types.js';

export class ProblemService {
  constructor(private repo: ProblemRepository = problemRepository) {}

  getAllProblems(): Problem[] {
    return this.repo.getAll();
  }

  getProblemById(id: string): Problem {
    const problem = this.repo.getById(id);
    if (!problem) {
      const err = new Error(`Problem with id '${id}' not found`);
      (err as any).statusCode = 404;
      throw err;
    }
    return problem;
  }
}

export const problemService = new ProblemService();
