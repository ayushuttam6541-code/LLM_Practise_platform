import React, { useEffect, useState } from 'react';
import { Attempt } from '../types';
import { api } from '../api/client';
import { History, RotateCcw, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface AttemptsPageProps {
  onNavigate: (view: string, id?: string) => void;
}

export const AttemptsPage: React.FC<AttemptsPageProps> = ({ onNavigate }) => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    loadAttempts();
  }, []);

  async function loadAttempts() {
    try {
      const data = await api.getAttempts();
      setAttempts(data);
    } catch (err) {
      console.error('Failed to load attempts', err);
    } finally {
      setLoading(false);
    }
  }

  const handleRetry = async (attemptId: string) => {
    setRetryingId(attemptId);
    try {
      const newAttempt = await api.retryAttempt(attemptId);
      onNavigate('editor', newAttempt.id);
    } catch (err: any) {
      alert('Retry failed: ' + (err.message || 'Unknown error'));
      setRetryingId(null);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Attempt History</h1>
          <p className="page-subtitle">
            Track your design iterations. Compare past rubric feedback, review submitted solutions, or retry to improve your score.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => onNavigate('problems')}>
          Start New Problem
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {attempts.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <History size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 8 }}>No practice attempts yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              Choose an LLD problem from our curated catalog to start your first design session.
            </p>
            <button className="btn btn-primary" onClick={() => onNavigate('problems')}>
              Browse Problems
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Difficulty</th>
                <th>Attempt Date</th>
                <th>Status</th>
                <th>Score</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map(att => (
                <tr key={att.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{att.problemTitle || att.problemId}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{att.id}</div>
                  </td>
                  <td>
                    {att.problemDifficulty && (
                      <span className={`badge badge-${att.problemDifficulty.toLowerCase()}`}>
                        {att.problemDifficulty}
                      </span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    <div>{new Date(att.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(att.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${att.status.toLowerCase()}`}>
                      {att.status}
                    </span>
                  </td>
                  <td>
                    {att.score !== undefined ? (
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: att.score >= 70 ? '#34d399' : '#fbbf24' }}>
                        {att.score} / 100
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 8 }}>
                      {att.status === 'COMPLETED' ? (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => onNavigate('evaluation', att.id)}
                          >
                            View Feedback
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleRetry(att.id)}
                            disabled={retryingId === att.id}
                            title="Start a new attempt for this problem preserving this attempt in history"
                          >
                            {retryingId === att.id ? (
                              <div className="spinner" style={{ width: 14, height: 14 }} />
                            ) : (
                              <RotateCcw size={13} />
                            )}
                            <span>Retry</span>
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onNavigate('editor', att.id)}
                        >
                          <span>Resume Attempt</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
