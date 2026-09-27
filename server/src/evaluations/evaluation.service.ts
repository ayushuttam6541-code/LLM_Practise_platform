import { Evaluator } from './evaluator.interface.js';
import { RuleBasedEvaluator } from './rule-based-evaluator.js';
import { AIEvaluator } from './ai-evaluator.js';
import { evaluationRepository, EvaluationRepository } from './evaluation.repository.js';
import { attemptRepository, AttemptRepository } from '../attempts/attempt.repository.js';
import { submissionRepository, SubmissionRepository } from '../submissions/submission.repository.js';
import { problemRepository, ProblemRepository } from '../problems/problem.repository.js';
import { validateStateTransition } from '../attempts/attempt.state-machine.js';
import { Evaluation } from '../shared/types.js';
import { config } from '../config.js';

export class EvaluationService {
  private evaluator: Evaluator;

  constructor(
    private evalRepo: EvaluationRepository = evaluationRepository,
    private attRepo: AttemptRepository = attemptRepository,
    private subRepo: SubmissionRepository = submissionRepository,
    private probRepo: ProblemRepository = problemRepository
  ) {
    if (config.evaluatorMode === 'ai') {
      this.evaluator = new AIEvaluator();
    } else {
      this.evaluator = new RuleBasedEvaluator();
    }
  }

  setEvaluator(evaluator: Evaluator): void {
    this.evaluator = evaluator;
  }

  getEvaluation(attemptId: string): Evaluation {
    const evaluation = this.evalRepo.getByAttemptId(attemptId);
    if (!evaluation) {
      const err = new Error(`No evaluation found for attempt '${attemptId}'`);
      (err as any).statusCode = 404;
      throw err;
    }
    return evaluation;
  }

  async runEvaluationForAttempt(attemptId: string): Promise<Evaluation> {
    const attempt = this.attRepo.getById(attemptId);
    if (!attempt) {
      const err = new Error(`Attempt '${attemptId}' not found`);
      (err as any).statusCode = 404;
      throw err;
    }

    if (attempt.status === 'COMPLETED') {
      const existing = this.evalRepo.getByAttemptId(attemptId);
      if (existing) return existing;
    }

    // Step: Transition to EVALUATING
    validateStateTransition(attempt.status, 'EVALUATING');
    this.attRepo.updateStatus(attemptId, 'EVALUATING');

    const submission = this.subRepo.getByAttemptId(attemptId);
    if (!submission) {
      const err = new Error(`Cannot evaluate attempt '${attemptId}' without a submission`);
      (err as any).statusCode = 400;
      this.attRepo.updateStatus(attemptId, 'FAILED');
      throw err;
    }

    const problem = this.probRepo.getById(attempt.problemId);
    if (!problem) {
      const err = new Error(`Problem '${attempt.problemId}' associated with attempt not found`);
      (err as any).statusCode = 404;
      this.attRepo.updateStatus(attemptId, 'FAILED');
      throw err;
    }

    try {
      // Evaluate submission against rubric
      const result = await this.evaluator.evaluate(submission, problem);

      const evaluationId = 'eval_' + Math.random().toString(36).substring(2, 11);
      const now = new Date().toISOString();

      const evaluation: Evaluation = {
        id: evaluationId,
        attemptId,
        status: 'COMPLETED',
        overallSummary: result.overallSummary,
        overallScore: result.overallScore,
        whatWentWell: result.whatWentWell,
        whatToImprove: result.whatToImprove,
        suggestedNextStep: result.suggestedNextStep,
        evaluatorUsed: result.evaluatorUsed,
        createdAt: now,
        completedAt: now,
        feedbackItems: result.criteria.map((c, i) => ({
          id: 'fb_' + Math.random().toString(36).substring(2, 11),
          evaluationId,
          criterion: c.criterion,
          score: c.score,
          evidence: c.evidence,
          concern: c.concern,
          suggestion: c.suggestion,
          confidence: c.confidence,
          sortOrder: i
        }))
      };

      // Save evaluation and update attempt to COMPLETED
      this.evalRepo.save(evaluation);
      this.attRepo.updateStatus(attemptId, 'COMPLETED');

      return evaluation;
    } catch (evalError: any) {
      console.error(`[EvaluationService] Evaluation failed for attempt ${attemptId}:`, evalError);

      const now = new Date().toISOString();
      const failedEval: Evaluation = {
        id: 'eval_fail_' + Math.random().toString(36).substring(2, 11),
        attemptId,
        status: 'FAILED',
        overallSummary: 'Evaluation could not be completed due to an internal evaluator error.',
        overallScore: 0,
        whatWentWell: [],
        whatToImprove: [],
        suggestedNextStep: 'Please try submitting again or review submission formatting.',
        evaluatorUsed: 'fallback',
        errorMessage: evalError?.message || 'Unknown evaluation failure',
        createdAt: now,
        feedbackItems: []
      };

      this.evalRepo.save(failedEval);
      this.attRepo.updateStatus(attemptId, 'FAILED');
      
      return failedEval;
    }
  }
}

export const evaluationService = new EvaluationService();
