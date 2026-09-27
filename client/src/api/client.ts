import { Problem, Attempt, Submission, SubmissionPayload, Evaluation } from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error: any = new Error(json.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.errors = json.errors;
    throw error;
  }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<{ status: string; evaluatorMode: string; aiConfigured: boolean }>(res);
  },

  async getConfig() {
    const res = await fetch(`${API_BASE}/config`);
    return handleResponse<{ evaluatorMode: string; aiConfigured: boolean; model: string }>(res);
  },

  async getProblems(): Promise<Problem[]> {
    const res = await fetch(`${API_BASE}/problems`);
    return handleResponse<Problem[]>(res);
  },

  async getProblem(id: string): Promise<Problem> {
    const res = await fetch(`${API_BASE}/problems/${id}`);
    return handleResponse<Problem>(res);
  },

  async getSampleSolution(problemId: string): Promise<SubmissionPayload> {
    const res = await fetch(`${API_BASE}/sample-solution/${problemId}`);
    return handleResponse<SubmissionPayload>(res);
  },

  async createAttempt(problemId: string): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problemId })
    });
    return handleResponse<Attempt>(res);
  },

  async getAttempts(problemId?: string): Promise<Attempt[]> {
    const url = problemId ? `${API_BASE}/attempts?problemId=${problemId}` : `${API_BASE}/attempts`;
    const res = await fetch(url);
    return handleResponse<Attempt[]>(res);
  },

  async getAttempt(id: string): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/attempts/${id}`);
    return handleResponse<Attempt>(res);
  },

  async getSubmission(attemptId: string): Promise<Submission | null> {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/submission`);
    return handleResponse<Submission | null>(res);
  },

  async saveDraft(attemptId: string, payload: SubmissionPayload): Promise<Submission> {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/submission`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<Submission>(res);
  },

  async submitAttempt(attemptId: string, payload: SubmissionPayload): Promise<{ attempt: Attempt; submission: Submission; evaluation: Evaluation }> {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<{ attempt: Attempt; submission: Submission; evaluation: Evaluation }>(res);
  },

  async getEvaluation(attemptId: string): Promise<Evaluation> {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/evaluation`);
    return handleResponse<Evaluation>(res);
  },

  async retryAttempt(attemptId: string): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/attempts/${attemptId}/retry`, {
      method: 'POST'
    });
    return handleResponse<Attempt>(res);
  }
};
