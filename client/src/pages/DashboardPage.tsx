import React, { useEffect, useState } from 'react';
import { Problem, Attempt } from '../types';
import { api } from '../api/client';
import { Play, BookOpen, Award, CheckCircle, ArrowRight, Clock, RefreshCw } from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (view: string, id?: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [probs, atts] = await Promise.all([
          api.getProblems(),
          api.getAttempts()
        ]);
        setProblems(probs);
        setAttempts(atts);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const completedAttempts = attempts.filter(a => a.status === 'COMPLETED');
  const avgScore = completedAttempts.length > 0
    ? Math.round(completedAttempts.reduce((acc, a) => acc + (a.score || 0), 0) / completedAttempts.length)
    : 0;

  return (
    <div className="page-container">
      {/* Hero Banner */}
      <div
        className="card card-elevated"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.95))',
          borderColor: 'rgba(99, 102, 241, 0.25)',
          padding: '36px 32px',
          marginBottom: 32,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ maxWidth: 680 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span className="badge badge-in_progress">Low-Level System Design Practice</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '2.2rem', marginBottom: 12 }}>
            LLD Practice Platform
          </h1>
          <p className="page-subtitle" style={{ fontSize: '1.05rem', marginBottom: 24 }}>
            Practice Low-Level Design. Design real-world systems, submit your solution, and get structured feedback across 8 architectural rubric dimensions.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary btn-lg" onClick={() => onNavigate('problems')}>
              <Play size={18} />
              <span>Start Practice</span>
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => onNavigate('attempts')}>
              <Clock size={18} />
              <span>View Past Attempts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-cols-3" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div className="stat-value">{problems.length}</div>
            <div className="stat-label">Practice Problems Available</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="stat-value">{attempts.length}</div>
            <div className="stat-label">Total Design Attempts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="stat-value">{avgScore > 0 ? `${avgScore}%` : 'N/A'}</div>
            <div className="stat-label">Average Architectural Score</div>
          </div>
        </div>
      </div>

      {/* Quick Problem Launchpad */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Recommended Problems</h2>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => onNavigate('problems')}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <span>View all problems</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="grid-cols-3" style={{ marginBottom: 36 }}>
        {problems.slice(0, 3).map(prob => (
          <div key={prob.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span className={`badge badge-${prob.difficulty.toLowerCase()}`}>
                  {prob.difficulty}
                </span>
                {prob.attemptStats?.latestStatus && (
                  <span className={`badge badge-${prob.attemptStats.latestStatus.toLowerCase()}`}>
                    {prob.attemptStats.latestStatus === 'COMPLETED' ? `Score: ${prob.attemptStats.latestScore}%` : prob.attemptStats.latestStatus}
                  </span>
                )}
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                {prob.title}
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                {prob.description}
              </p>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
              onClick={() => onNavigate('problem-details', prob.id)}
            >
              <span>Explore Problem</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Recent Attempts Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Recent Attempts</h2>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {attempts.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: 12 }}>You haven't submitted any design attempts yet.</p>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('problems')}>
              Select a Problem to Begin
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Attempt Date</th>
                <th>Status</th>
                <th>Score</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {attempts.slice(0, 5).map(att => (
                <tr key={att.id}>
                  <td style={{ fontWeight: 600 }}>{att.problemTitle || att.problemId}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {new Date(att.createdAt).toLocaleDateString()} {new Date(att.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td>
                    <span className={`badge badge-${att.status.toLowerCase()}`}>
                      {att.status}
                    </span>
                  </td>
                  <td>
                    {att.score !== undefined ? (
                      <span style={{ fontWeight: 700, color: att.score >= 70 ? '#34d399' : '#fbbf24' }}>
                        {att.score} / 100
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {att.status === 'COMPLETED' ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onNavigate('evaluation', att.id)}
                      >
                        View Feedback
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onNavigate('editor', att.id)}
                      >
                        Resume Attempt
                      </button>
                    )}
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
