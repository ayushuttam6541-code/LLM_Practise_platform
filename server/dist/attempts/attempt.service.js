import { attemptRepository } from './attempt.repository.js';
import { problemRepository } from '../problems/problem.repository.js';
import { submissionRepository } from '../submissions/submission.repository.js';
import { evaluationService } from '../evaluations/evaluation.service.js';
import { validateStateTransition } from './attempt.state-machine.js';
import { validateSubmission } from '../submissions/submission.validator.js';
export class AttemptService {
    attRepo;
    probRepo;
    subRepo;
    evalService;
    constructor(attRepo = attemptRepository, probRepo = problemRepository, subRepo = submissionRepository, evalService = evaluationService) {
        this.attRepo = attRepo;
        this.probRepo = probRepo;
        this.subRepo = subRepo;
        this.evalService = evalService;
    }
    createAttempt(problemId) {
        const problem = this.probRepo.getById(problemId);
        if (!problem) {
            const err = new Error(`Cannot create attempt: Problem '${problemId}' not found`);
            err.statusCode = 404;
            throw err;
        }
        const id = 'att_' + Math.random().toString(36).substring(2, 11);
        const now = new Date().toISOString();
        const attempt = {
            id,
            problemId,
            status: 'IN_PROGRESS',
            createdAt: now,
            updatedAt: now
        };
        this.attRepo.create(attempt);
        return this.getAttempt(id);
    }
    getAttempt(id) {
        const attempt = this.attRepo.getById(id);
        if (!attempt) {
            const err = new Error(`Attempt '${id}' not found`);
            err.statusCode = 404;
            throw err;
        }
        return attempt;
    }
    getAllAttempts(problemId) {
        return this.attRepo.getAll(problemId);
    }
    saveDraft(attemptId, payload) {
        const attempt = this.getAttempt(attemptId);
        if (attempt.status === 'COMPLETED') {
            const err = new Error('Cannot edit submission for an already completed attempt. Please use Retry to start a new attempt.');
            err.statusCode = 400;
            throw err;
        }
        // Lenient validation for draft
        validateSubmission(payload, false);
        return this.subRepo.upsert(attemptId, payload);
    }
    async submitAttempt(attemptId, payload) {
        const attempt = this.getAttempt(attemptId);
        // Rule: Validate state transition IN_PROGRESS -> SUBMITTED
        validateStateTransition(attempt.status, 'SUBMITTED');
        // Rule: Enforce deterministic submission validation
        validateSubmission(payload, true);
        // Step 1: Save submission FIRST so work is NEVER lost
        const submission = this.subRepo.upsert(attemptId, payload);
        // Step 2: Mark as SUBMITTED with submitted timestamp
        const now = new Date().toISOString();
        this.attRepo.updateStatus(attemptId, 'SUBMITTED', now);
        // Step 3: Run evaluation pipeline (SUBMITTED -> EVALUATING -> COMPLETED / FAILED)
        const evaluation = await this.evalService.runEvaluationForAttempt(attemptId);
        const updatedAttempt = this.getAttempt(attemptId);
        return {
            attempt: updatedAttempt,
            submission,
            evaluation
        };
    }
    retryAttempt(attemptId) {
        const previous = this.getAttempt(attemptId);
        // Create a brand new attempt for the same problem.
        // Previous attempt is strictly preserved!
        return this.createAttempt(previous.problemId);
    }
}
export const attemptService = new AttemptService();
