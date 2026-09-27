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

export interface SubmissionPayload {
  requirements?: string;
  assumptions?: string;
  classes?: string;
  relationships?: string;
  reasoning?: string;
  extensibility?: string;
  edgeCases?: string;
}

export interface Submission extends SubmissionPayload {
  id: string;
  attemptId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackItem {
  id: string;
  evaluationId: string;
  criterion: string;
  score: number;
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
  overallScore: number;
  whatWentWell: string[];
  whatToImprove: string[];
  suggestedNextStep: string;
  evaluatorUsed: 'rule-based' | 'gemini-ai' | 'fallback';
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
  feedbackItems: FeedbackItem[];
}
