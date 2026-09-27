import { attemptRepository, AttemptRepository } from './attempt.repository.js';
import { problemRepository, ProblemRepository } from '../problems/problem.repository.js';
import { submissionRepository, SubmissionRepository } from '../submissions/submission.repository.js';
import { evaluationService, EvaluationService } from '../evaluations/evaluation.service.js';
import { validateStateTransition } from './attempt.state-machine.js';
import { validateSubmission, SubmissionPayload } from '../submissions/submission.validator.js';
import { Attempt, Submission, Evaluation } from '../shared/types.js';

export class AttemptService {
  constructor(
    private attRepo: AttemptRepository = attemptRepository,
    private probRepo: ProblemRepository = problemRepository,
    private subRepo: SubmissionRepository = submissionRepository,
    private evalService: EvaluationService = evaluationService
  ) {}

  createAttempt(problemId: string): Attempt {
    const problem = this.probRepo.getById(problemId);
    if (!problem) {
      const err = new Error(`Cannot create attempt: Problem '${problemId}' not found`);
      (err as any).statusCode = 404;
      throw err;
    }

    const id = 'att_' + Math.random().toString(36).substring(2, 11);
    const now = new Date().toISOString();

    const attempt = {
      id,
      problemId,
      status: 'IN_PROGRESS' as const,
      createdAt: now,
      updatedAt: now
    };

    this.attRepo.create(attempt);
    return this.getAttempt(id);
  }

  getAttempt(id: string): Attempt {
    const attempt = this.attRepo.getById(id);
    if (!attempt) {
      const err = new Error(`Attempt '${id}' not found`);
      (err as any).statusCode = 404;
      throw err;
    }
    return attempt;
  }

  getAllAttempts(problemId?: string): Attempt[] {
    return this.attRepo.getAll(problemId);
  }

  saveDraft(attemptId: string, payload: SubmissionPayload): Submission {
    const attempt = this.getAttempt(attemptId);

    if (attempt.status === 'COMPLETED') {
      const err = new Error('Cannot edit submission for an already completed attempt. Please use Retry to start a new attempt.');
      (err as any).statusCode = 400;
      throw err;
    }

    // Lenient validation for draft
    validateSubmission(payload, false);

    return this.subRepo.upsert(attemptId, payload);
  }

  async submitAttempt(attemptId: string, payload: SubmissionPayload): Promise<{ attempt: Attempt; submission: Submission; evaluation: Evaluation }> {
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

  retryAttempt(attemptId: string): Attempt {
    const previous = this.getAttempt(attemptId);
    
    // Create a brand new attempt for the same problem.
    // Previous attempt is strictly preserved!
    return this.createAttempt(previous.problemId);
  }
}

export const attemptService = new AttemptService();
