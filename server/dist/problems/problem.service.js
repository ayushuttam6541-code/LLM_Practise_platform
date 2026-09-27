import { problemRepository } from './problem.repository.js';
export class ProblemService {
    repo;
    constructor(repo = problemRepository) {
        this.repo = repo;
    }
    getAllProblems() {
        return this.repo.getAll();
    }
    getProblemById(id) {
        const problem = this.repo.getById(id);
        if (!problem) {
            const err = new Error(`Problem with id '${id}' not found`);
            err.statusCode = 404;
            throw err;
        }
        return problem;
    }
}
export const problemService = new ProblemService();
