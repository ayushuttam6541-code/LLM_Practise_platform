export class InvalidStateTransitionError extends Error {
    currentStatus;
    targetStatus;
    statusCode = 400;
    constructor(currentStatus, targetStatus) {
        super(`Cannot transition attempt from '${currentStatus}' to '${targetStatus}'. Invalid state transition.`);
        this.currentStatus = currentStatus;
        this.targetStatus = targetStatus;
        this.name = 'InvalidStateTransitionError';
    }
}
const ALLOWED_TRANSITIONS = {
    IN_PROGRESS: ['SUBMITTED'],
    SUBMITTED: ['EVALUATING'],
    EVALUATING: ['COMPLETED', 'FAILED'],
    COMPLETED: [], // Terminal state. Must call retry to create a NEW attempt!
    FAILED: ['EVALUATING'] // Allows retrying evaluation if needed
};
export function validateStateTransition(current, next) {
    const allowed = ALLOWED_TRANSITIONS[current] || [];
    if (!allowed.includes(next)) {
        throw new InvalidStateTransitionError(current, next);
    }
}
