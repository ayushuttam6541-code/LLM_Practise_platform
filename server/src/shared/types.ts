export type AttemptStatus = 
  | 'IN_PROGRESS' 
  | 'SUBMITTED' 
  | 'EVALUATING' 
  | 'COMPLETED' 
  | 'FAILED';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  practiceFocus: string;
  requirements: string[];
  constraints: string[];
  exampleScenarios: string[];
  createdAt: string;
  attemptStats?: {
    totalAttempts: number;
    completedAttempts: number;
    latestStatus?: AttemptStatus;
    latestScore?: number;
  };
}

export interface Attempt {
  id: string;
  problemId: string;
  status: AttemptStatus;
  createdAt: string;
  submittedAt?: string;
  updatedAt: string;
  problemTitle?: string;
  problemDifficulty?: DifficultyLevel;
  score?: number;
}

export interface Submission {
  id: string;
  attemptId: string;
  requirements: string;
  assumptions: string;
  classes: string;
  relationships: string;
  reasoning: string;
  extensibility: string;
  edgeCases: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackItem {
  id: string;
  evaluationId: string;
  criterion: string;
  score: number; // e.g. 1 - 10
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: ConfidenceLevel;
  sortOrder: number;
}

export interface Evaluation {
  id: string;
  attemptId: string;
  status: 'COMPLETED' | 'FAILED';
  overallSummary: string;
  overallScore: number; // 0 - 100
  whatWentWell: string[];
  whatToImprove: string[];
  suggestedNextStep: string;
  evaluatorUsed: 'rule-based' | 'gemini-ai' | 'fallback';
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
  feedbackItems: FeedbackItem[];
}

export const RUBRIC_CRITERIA = [
  'Requirement Understanding',
  'Class Responsibilities',
  'Coupling & Cohesion',
  'Encapsulation & Interfaces',
  'Abstraction / Patterns',
  'Extensibility',
  'Edge Cases & Testability',
  'Explanation Quality'
] as const;

export type RubricCriterion = typeof RUBRIC_CRITERIA[number];
