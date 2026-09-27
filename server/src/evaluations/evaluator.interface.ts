import { Submission, Problem, ConfidenceLevel, RubricCriterion } from '../shared/types.js';

export interface EvaluatorCriterionResult {
  criterion: RubricCriterion;
  score: number; // 1 to 10
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: ConfidenceLevel;
}

export interface EvaluationResult {
  overallSummary: string;
  overallScore: number; // 0 to 100
  whatWentWell: string[];
  whatToImprove: string[];
  suggestedNextStep: string;
  criteria: EvaluatorCriterionResult[];
  evaluatorUsed: 'rule-based' | 'gemini-ai' | 'fallback';
}

export interface Evaluator {
  readonly name: string;
  evaluate(submission: Submission, problem: Problem): Promise<EvaluationResult>;
}
