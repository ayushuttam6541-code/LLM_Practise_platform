import React, { useEffect, useState } from 'react';
import { Problem } from '../types';
import { api } from '../api/client';
import { BookOpen, ArrowRight, Target, CheckCircle2, RefreshCw } from 'lucide-react';

interface ProblemsPageProps {
  onNavigate: (view: string, id?: string) => void;
}

export const ProblemsPage: React.FC<ProblemsPageProps> = ({ onNavigate }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProblems() {
      try {
        const data = await api.getProblems();
        setProblems(data);
      } catch (err) {
        console.error('Failed to load problems', err);
      } finally {
        setLoading(false);
      }
    }
    loadProblems();
  }, []);

  return (
    <div className="page-container">
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">Practice Problems</h1>
        <p className="page-subtitle">
          Select a system to design. Focus on entity boundaries, single responsibility, clean interfaces, and trade-offs.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {problems.map(prob => (
          <div
            key={prob.id}
            className="card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 24,
              padding: '28px'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
                  {prob.title}
                </h2>
                <span className={`badge badge-${prob.difficulty.toLowerCase()}`}>
                  {prob.difficulty}
                </span>

                {prob.attemptStats?.latestStatus && (
                  <span className={`badge badge-${prob.attemptStats.latestStatus.toLowerCase()}`}>
                    {prob.attemptStats.latestStatus === 'COMPLETED'
                      ? `Latest Score: ${prob.attemptStats.latestScore}%`
                      : `Status: ${prob.attemptStats.latestStatus}`}
                  </span>
                )}
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginBottom: 16, lineHeight: 1.6 }}>
                {prob.description}
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--bg-canvas)',
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.84rem',
                  color: '#94a3b8'
                }}
              >
                <Target size={14} color="#818cf8" />
                <span style={{ color: '#cbd5e1', fontWeight: 500 }}>What you'll practice:</span>
                <span>{prob.practiceFocus}</span>
              </div>
            </div>

            <div style={{ minWidth: 160, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => onNavigate('problem-details', prob.id)}
              >
                <span>Start Problem</span>
                <ArrowRight size={16} />
              </button>

              {prob.attemptStats?.totalAttempts ? (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {prob.attemptStats.totalAttempts} total {prob.attemptStats.totalAttempts === 1 ? 'attempt' : 'attempts'}
                </span>
              ) : (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Not yet attempted
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
