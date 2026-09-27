export interface SubmissionPayload {
  requirements?: string;
  assumptions?: string;
  classes?: string;
  relationships?: string;
  reasoning?: string;
  extensibility?: string;
  edgeCases?: string;
}

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export class SubmissionValidationError extends Error {
  statusCode = 400;
  constructor(public errors: ValidationErrorItem[]) {
    super(`Submission validation failed: ${errors.map(e => e.message).join('; ')}`);
    this.name = 'SubmissionValidationError';
  }
}

export function validateSubmission(data: SubmissionPayload, isFinalSubmit = true): void {
  const errors: ValidationErrorItem[] = [];

  if (!data || typeof data !== 'object') {
    throw new SubmissionValidationError([{ field: 'body', message: 'Submission body must be an object' }]);
  }

  // Draft saving is lenient, but final submit enforces quality requirements
  if (isFinalSubmit) {
    // Classes & Interfaces is the core of LLD
    if (!data.classes || data.classes.trim().length < 20) {
      errors.push({
        field: 'classes',
        message: 'The "Classes & Interfaces" section is required and must contain at least 20 characters describing your domain model.'
      });
    }

    // Requirements or Assumptions
    const hasReqsOrAssumptions = (data.requirements && data.requirements.trim().length > 10) || 
                                 (data.assumptions && data.assumptions.trim().length > 10);
    if (!hasReqsOrAssumptions) {
      errors.push({
        field: 'requirements',
        message: 'Please provide at least a brief summary of Requirements or Assumptions.'
      });
    }

    // Relationships or Design Reasoning
    const hasDesignReasoning = (data.relationships && data.relationships.trim().length > 10) || 
                               (data.reasoning && data.reasoning.trim().length > 10);
    if (!hasDesignReasoning) {
      errors.push({
        field: 'reasoning',
        message: 'Please outline class Relationships or Design Reasoning behind your architecture.'
      });
    }

    // Overall length check
    const totalChars = (data.requirements || '').trim().length +
      (data.assumptions || '').trim().length +
      (data.classes || '').trim().length +
      (data.relationships || '').trim().length +
      (data.reasoning || '').trim().length +
      (data.extensibility || '').trim().length +
      (data.edgeCases || '').trim().length;

    if (totalChars < 80) {
      errors.push({
        field: 'totalContent',
        message: 'Your solution is too brief to evaluate. Please provide more detail across the design sections.'
      });
    }
  }

  if (errors.length > 0) {
    throw new SubmissionValidationError(errors);
  }
}
