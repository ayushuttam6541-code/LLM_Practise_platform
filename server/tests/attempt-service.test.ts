import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { getDatabase } from '../src/db/database.js';
import { seedDatabase } from '../src/db/seed.js';
import { attemptService } from '../src/attempts/attempt.service.js';
import { evaluationService } from '../src/evaluations/evaluation.service.js';
import { Evaluator, EvaluationResult } from '../src/evaluations/evaluator.interface.js';
import { Submission, Problem } from '../src/shared/types.js';

describe('Attempt Lifecycle and Service Rules', () => {
  before(() => {
    // Initialize in-memory or fresh DB for tests
    process.env.DATABASE_PATH = ':memory:';
    const db = getDatabase(':memory:');
    seedDatabase(db);
  });

  const validPayload = {
    requirements: 'Multi-floor parking lot with gates and spots. Support motorcycle, car, truck.',
    assumptions: 'Concurrent entry gates and exit gates across multiple threads.',
    classes: 'Class: ParkingLot\nResponsibility: Manage floors and gates\nClass: ParkingSpot\nResponsibility: Track state\nInterface: PricingStrategy',
    relationships: 'ParkingLot HAS-A ParkingFloor (1:N composition). ExitGate USES PricingStrategy.',
    reasoning: 'Separated pricing calculation behind strategy pattern to satisfy OCP.',
    extensibility: 'Easily plug in electric vehicle charging spots by extending ParkingSpot.',
    edgeCases: 'Concurrency safety using synchronized locks on floor level spot allocations.'
  };

  it('creates an attempt in IN_PROGRESS status', () => {
    const attempt = attemptService.createAttempt('parking-lot');
    assert.ok(attempt.id.startsWith('att_'));
    assert.equal(attempt.problemId, 'parking-lot');
    assert.equal(attempt.status, 'IN_PROGRESS');
  });

  it('saves a draft and allows retrieving it', () => {
    const attempt = attemptService.createAttempt('parking-lot');
    const draft = attemptService.saveDraft(attempt.id, {
      requirements: 'Draft in progress...',
      assumptions: 'Initial assumption'
    });
    assert.equal(draft.requirements, 'Draft in progress...');
  });

  it('submits an attempt and performs evaluation transitioning status to COMPLETED', async () => {
    const attempt = attemptService.createAttempt('parking-lot');
    const result = await attemptService.submitAttempt(attempt.id, validPayload);

    assert.equal(result.attempt.status, 'COMPLETED');
    assert.ok(result.attempt.submittedAt);
    assert.equal(result.evaluation.status, 'COMPLETED');
    assert.ok(result.evaluation.overallScore > 0);
    assert.equal(result.evaluation.feedbackItems.length, 8);
  });

  it('rejects resubmission on an already COMPLETED attempt', async () => {
    const attempt = attemptService.createAttempt('parking-lot');
    await attemptService.submitAttempt(attempt.id, validPayload);

    await assert.rejects(
      async () => {
        await attemptService.submitAttempt(attempt.id, validPayload);
      },
      (err: any) => err.statusCode === 400
    );
  });

  it('retry creates a new attempt and preserves previous attempt and evaluation', async () => {
    const firstAttempt = attemptService.createAttempt('parking-lot');
    const submitResult = await attemptService.submitAttempt(firstAttempt.id, validPayload);

    // Call retry
    const retriedAttempt = attemptService.retryAttempt(firstAttempt.id);

    // 1. Verify retried attempt is a NEW attempt
    assert.notEqual(retriedAttempt.id, firstAttempt.id);
    assert.equal(retriedAttempt.problemId, 'parking-lot');
    assert.equal(retriedAttempt.status, 'IN_PROGRESS');

    // 2. Verify original attempt is strictly preserved
    const retrievedFirstAttempt = attemptService.getAttempt(firstAttempt.id);
    assert.equal(retrievedFirstAttempt.status, 'COMPLETED');
    assert.equal(retrievedFirstAttempt.score, submitResult.evaluation.overallScore);

    // 3. Verify original evaluation is intact
    const originalEval = evaluationService.getEvaluation(firstAttempt.id);
    assert.equal(originalEval.attemptId, firstAttempt.id);
    assert.equal(originalEval.status, 'COMPLETED');
  });

  it('preserves submission and transitions status to FAILED when evaluator errors', async () => {
    // Create a mock evaluator that fails intentionally
    class FailingEvaluator implements Evaluator {
      readonly name = 'failing-mock';
      async evaluate(_sub: Submission, _prob: Problem): Promise<EvaluationResult> {
        throw new Error('Simulated external service timeout / failure');
      }
    }

    const failingService = new (class extends attemptService.constructor {
      constructor() {
        super();
        const failingEvalService = new (evaluationService.constructor as any)();
        failingEvalService.setEvaluator(new FailingEvaluator());
        (this as any).evalService = failingEvalService;
      }
    })();

    const attempt = attemptService.createAttempt('vending-machine');
    
    // Submitting through failing service
    const result = await (failingService as any).submitAttempt(attempt.id, validPayload);

    // Submission MUST be saved!
    assert.ok(result.submission);
    assert.equal(result.submission.requirements, validPayload.requirements);

    // Attempt and evaluation MUST be marked FAILED with error context
    assert.equal(result.attempt.status, 'FAILED');
    assert.equal(result.evaluation.status, 'FAILED');
    assert.ok(result.evaluation.errorMessage?.includes('Simulated external service timeout'));
  });
});
