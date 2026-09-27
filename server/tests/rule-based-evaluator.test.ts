import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RuleBasedEvaluator } from '../src/evaluations/rule-based-evaluator.js';
import { RUBRIC_CRITERIA, Problem, Submission } from '../src/shared/types.js';

describe('Rule-Based Evaluator', () => {
  const evaluator = new RuleBasedEvaluator();

  const dummyProblem: Problem = {
    id: 'parking-lot',
    title: 'Parking Lot',
    description: 'Design a parking lot',
    difficulty: 'Medium',
    practiceFocus: 'Object responsibilities',
    requirements: ['Support vehicle types', 'Assign spot', 'Issue ticket'],
    constraints: ['Thread-safe allocation'],
    exampleScenarios: ['Car enters'],
    createdAt: new Date().toISOString()
  };

  const dummySubmission: Submission = {
    id: 'sub_test',
    attemptId: 'att_test',
    requirements: 'Multi-floor parking lot with gates and spots. Spot allocation for car, motorcycle, truck.',
    assumptions: 'Concurrent entry gates and exit gates across multiple threads.',
    classes: `Class: ParkingLot
Responsibility: Manage floors and gates
Class: ParkingFloor
Responsibility: Track available spots
Class: ParkingSpot
Responsibility: State of spot
Interface: PricingStrategy
Responsibility: calculate fee dynamically`,
    relationships: 'ParkingLot HAS-A collection of ParkingFloor (composition). ExitGate USES PricingStrategy.',
    reasoning: 'Used Strategy pattern to decouple pricing rules from exit gate. High cohesion maintained.',
    extensibility: 'Open for extension: add new vehicle types by extending ParkingSpot without modifying ParkingLot.',
    edgeCases: 'Handles full parking lot gracefully. Synchronized spot locking prevents race conditions between entrance gates.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  it('evaluates all 8 rubric dimensions', async () => {
    const result = await evaluator.evaluate(dummySubmission, dummyProblem);

    assert.equal(result.evaluatorUsed, 'rule-based');
    assert.ok(result.overallScore > 0 && result.overallScore <= 100);
    assert.equal(result.criteria.length, 8);

    // Verify all 8 criteria exist
    const criteriaNames = result.criteria.map(c => c.criterion);
    RUBRIC_CRITERIA.forEach(expected => {
      assert.ok(criteriaNames.includes(expected), `Missing criterion: ${expected}`);
    });
  });

  it('provides concrete evidence, concern, suggestion, and confidence for each criterion', async () => {
    const result = await evaluator.evaluate(dummySubmission, dummyProblem);

    for (const c of result.criteria) {
      assert.ok(c.criterion.length > 0);
      assert.ok(c.score >= 1 && c.score <= 10);
      assert.ok(c.evidence.length > 0, `Evidence missing for ${c.criterion}`);
      assert.ok(c.concern.length > 0, `Concern missing for ${c.criterion}`);
      assert.ok(c.suggestion.length > 0, `Suggestion missing for ${c.criterion}`);
      assert.ok(['high', 'medium', 'low'].includes(c.confidence));
    }
  });

  it('detects God Class violation and flags concern in class responsibilities', async () => {
    const godClassSubmission: Submission = {
      ...dummySubmission,
      classes: `Class: ParkingLot
Responsibility:
- Manage parking floors
- Calculate fee and dynamic pricing
- Process payment
- Generate tickets
- Control gate barriers`
    };

    const result = await evaluator.evaluate(godClassSubmission, dummyProblem);
    const classResp = result.criteria.find(c => c.criterion === 'Class Responsibilities');
    assert.ok(classResp);
    assert.ok(classResp.score <= 7);
    assert.ok(classResp.concern.toLowerCase().includes('responsibilit') || classResp.concern.toLowerCase().includes('srp'));
  });
});
