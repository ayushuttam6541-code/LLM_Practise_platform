import React, { useEffect, useState } from 'react';
import { Evaluation, Attempt, Problem } from '../types';
import { api } from '../api/client';
import { RubricCard } from '../components/RubricCard';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  Award,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface EvaluationPageProps {
  attemptId: string;
  onNavigate: (view: string, id?: string) => void;
}

export const EvaluationPage: React.FC<EvaluationPageProps> = ({ attemptId, onNavigate }) => {
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvaluation() {
      try {
        const [evalData, attData] = await Promise.all([
          api.getEvaluation(attemptId),
          api.getAttempt(attemptId)
        ]);
        setEvaluation(evalData);
        setAttempt(attData);

        const prob = await api.getProblem(attData.problemId);
        setProblem(prob);
      } catch (err: any) {
        console.error('Failed to load evaluation', err);
        setError(err.message || 'Could not load evaluation data');
      } finally {
        setLoading(false);
      }
    }
    loadEvaluation();
  }, [attemptId]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const newAttempt = await api.retryAttempt(attemptId);
      // Navigate to the editor for the NEW attempt!
      onNavigate('editor', newAttempt.id);
    } catch (err: any) {
      console.error('Retry failed', err);
      alert('Failed to initialize retry attempt: ' + err.message);
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Retrieving architectural design review...</p>
      </div>
    );
  }

  if (error || !evaluation) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: 8 }}>Evaluation Unavailable</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{error || 'No evaluation found for this attempt.'}</p>
        <button className="btn btn-secondary" onClick={() => onNavigate('attempts')}>
          Return to Attempts
        </button>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 65) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="page-container">
      {/* Top Breadcrumb & Action Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => onNavigate('attempts')}
        >
          <ArrowLeft size={14} />
          <span>Back to Attempts</span>
        </button>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('editor', attemptId)}
          >
            <span>View Submitted Solution</span>
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleRetry}
            disabled={retrying}
          >
            {retrying ? <div className="spinner" /> : <RotateCcw size={14} />}
            <span>{retrying ? 'Creating Attempt...' : 'Retry Problem'}</span>
          </button>
        </div>
      </div>

      {/* Main Design Review Hero Card */}
      <div className="evaluation-header-card">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span className="badge badge-completed">
              Design Review
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Evaluated via {evaluation.evaluatorUsed === 'gemini-ai' ? 'Google Gemini 2.5 Flash' : 'Rule-Based Engine'}
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
            {problem?.title || 'System Design'} Feedback
          </h1>

          <p style={{ color: '#cbd5e1', fontSize: '1rem', lineHeight: 1.6, maxWidth: 800 }}>
            {evaluation.overallSummary}
          </p>
        </div>

        {/* Score Ring / Pill */}
        <div className="score-circle-wrapper">
          <div
            style={{
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: `conic-gradient(${getScoreColor(evaluation.overallScore)} ${evaluation.overallScore * 3.6}deg, #1e293b 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 20px ${getScoreColor(evaluation.overallScore)}40`
            }}
          >
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: '50%',
                background: 'var(--bg-canvas)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span className="score-display-number" style={{ color: getScoreColor(evaluation.overallScore), fontSize: '2.1rem' }}>
                {evaluation.overallScore}
              </span>
              <span className="score-display-sub">Score / 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Feedback Synthesis Banners */}
      <div className="grid-cols-3" style={{ marginBottom: 36 }}>
        {/* What You Did Well */}
        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <CheckCircle2 size={18} color="#10b981" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>What You Did Well</h2>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {evaluation.whatWentWell.map((item, i) => (
              <li key={i} style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                • {item}
              </li>
            ))}
          </ul>
        </div>

        {/* What to Improve */}
        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={18} color="#f59e0b" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>What to Improve</h2>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {evaluation.whatToImprove.map((item, i) => (
              <li key={i} style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                • {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Suggested Next Step */}
        <div className="card" style={{ borderLeft: '4px solid #38bdf8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Lightbulb size={18} color="#38bdf8" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Suggested Next Step</h2>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.6 }}>
            {evaluation.suggestedNextStep}
          </p>
        </div>
      </div>

      {/* 8-Dimension Rubric Breakdown Grid */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={22} color="#a855f7" />
            <span>Rubric Breakdown (8 Dimensions)</span>
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Every criterion includes direct evidence cited from your submission, specific architectural concerns, and actionable design suggestions.
          </p>
        </div>
      </div>

      <div className="grid-cols-2" style={{ marginBottom: 40 }}>
        {evaluation.feedbackItems.map(item => (
          <RubricCard key={item.id} item={item} />
        ))}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-surface-elevated)',
          borderColor: 'var(--border-medium)',
          padding: '20px 28px'
        }}
      >
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
            Ready to iterate on your design?
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Clicking Retry creates a new attempt while keeping this review accessible in your history.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => onNavigate('problems')}>
            Browse Other Problems
          </button>
          <button className="btn btn-primary" onClick={handleRetry} disabled={retrying}>
            <RotateCcw size={16} />
            <span>{retrying ? 'Creating Attempt...' : 'Retry This Problem'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
