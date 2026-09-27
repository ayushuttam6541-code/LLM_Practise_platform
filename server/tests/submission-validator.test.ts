import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateSubmission, SubmissionValidationError } from '../src/submissions/submission.validator.js';

describe('Submission Validator', () => {
  it('rejects empty submission payload', () => {
    assert.throws(
      () => validateSubmission({} as any, true),
      (err: any) => err instanceof SubmissionValidationError
    );
  });

  it('rejects submission missing Classes & Interfaces', () => {
    assert.throws(
      () => validateSubmission({
        requirements: 'Multi-floor parking lot with gates and spots.',
        assumptions: 'Cash and card payments supported.',
        classes: 'Too short',
        relationships: 'Has a relationship',
        reasoning: 'Decoupled design',
        extensibility: 'Open for extension',
        edgeCases: 'Full capacity handling'
      }, true),
      (err: any) => {
        return err instanceof SubmissionValidationError && 
               err.errors.some((e: any) => e.field === 'classes');
      }
    );
  });

  it('rejects submission with insufficient total content', () => {
    assert.throws(
      () => validateSubmission({
        requirements: 'Short req',
        classes: 'Class: A Responsibility: B',
        reasoning: 'Short reason'
      }, true),
      (err: any) => {
        return err instanceof SubmissionValidationError && 
               err.errors.some((e: any) => e.field === 'totalContent');
      }
    );
  });

  it('allows saving draft with minimal fields (lenient draft validation)', () => {
    assert.doesNotThrow(() => {
      validateSubmission({
        requirements: 'Work in progress draft...'
      }, false);
    });
  });

  it('passes validation for complete and structured submission', () => {
    assert.doesNotThrow(() => {
      validateSubmission({
        requirements: 'Multi-floor parking lot with multiple gates and spot types (Small, Medium, Large).',
        assumptions: 'Concurrent entry gates and exit gates across multiple threads.',
        classes: 'Class: ParkingLot\nResponsibility: Manage floors and gates\nClass: ParkingSpot\nResponsibility: Track state\nInterface: PricingStrategy',
        relationships: 'ParkingLot HAS-A ParkingFloor (1:N composition). ExitGate USES PricingStrategy.',
        reasoning: 'Separated pricing calculation behind strategy pattern to satisfy OCP.',
        extensibility: 'Easily plug in electric vehicle charging spots by extending ParkingSpot.',
        edgeCases: 'Concurrency safety using synchronized locks on floor level spot allocations.'
      }, true);
    });
  });
});
