import { AttemptStatus } from '../shared/types.js';

export class InvalidStateTransitionError extends Error {
  statusCode = 400;
  constructor(public currentStatus: AttemptStatus, public targetStatus: AttemptStatus) {
    super(`Cannot transition attempt from '${currentStatus}' to '${targetStatus}'. Invalid state transition.`);
    this.name = 'InvalidStateTransitionError';
  }
}

const ALLOWED_TRANSITIONS: Record<AttemptStatus, AttemptStatus[]> = {
  IN_PROGRESS: ['SUBMITTED'],
  SUBMITTED: ['EVALUATING'],
  EVALUATING: ['COMPLETED', 'FAILED'],
  COMPLETED: [], // Terminal state. Must call retry to create a NEW attempt!
  FAILED: ['EVALUATING'] // Allows retrying evaluation if needed
};

export function validateStateTransition(current: AttemptStatus, next: AttemptStatus): void {
  const allowed = ALLOWED_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    throw new InvalidStateTransitionError(current, next);
  }
}
