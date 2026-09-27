import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateStateTransition, InvalidStateTransitionError } from '../src/attempts/attempt.state-machine.js';

describe('Attempt State Machine', () => {
  it('allows valid state progression: IN_PROGRESS -> SUBMITTED -> EVALUATING -> COMPLETED', () => {
    assert.doesNotThrow(() => validateStateTransition('IN_PROGRESS', 'SUBMITTED'));
    assert.doesNotThrow(() => validateStateTransition('SUBMITTED', 'EVALUATING'));
    assert.doesNotThrow(() => validateStateTransition('EVALUATING', 'COMPLETED'));
  });

  it('allows evaluation failure: EVALUATING -> FAILED', () => {
    assert.doesNotThrow(() => validateStateTransition('EVALUATING', 'FAILED'));
  });

  it('allows retrying evaluation from FAILED state', () => {
    assert.doesNotThrow(() => validateStateTransition('FAILED', 'EVALUATING'));
  });

  it('rejects transitioning from COMPLETED (terminal state)', () => {
    assert.throws(
      () => validateStateTransition('COMPLETED', 'SUBMITTED'),
      (err: any) => err instanceof InvalidStateTransitionError && err.statusCode === 400
    );
    assert.throws(
      () => validateStateTransition('COMPLETED', 'IN_PROGRESS'),
      (err: any) => err instanceof InvalidStateTransitionError
    );
  });

  it('rejects skipping states (e.g. IN_PROGRESS directly to COMPLETED or EVALUATING)', () => {
    assert.throws(
      () => validateStateTransition('IN_PROGRESS', 'COMPLETED'),
      (err: any) => err instanceof InvalidStateTransitionError
    );
    assert.throws(
      () => validateStateTransition('IN_PROGRESS', 'EVALUATING'),
      (err: any) => err instanceof InvalidStateTransitionError
    );
  });
});
