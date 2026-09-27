import React, { useEffect, useState } from 'react';
import { Problem } from '../types';
import { api } from '../api/client';
import { Play, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Layers, ListChecks } from 'lucide-react';

interface ProblemDetailsPageProps {
  problemId: string;
  onNavigate: (view: string, id?: string) => void;
}

export const ProblemDetailsPage: React.FC<ProblemDetailsPageProps> = ({ problemId, onNavigate }) => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    async function loadProblem() {
      try {
        const data = await api.getProblem(problemId);
        setProblem(data);
      } catch (err) {
        console.error('Failed to load problem details', err);
      } finally {
        setLoading(false);
      }
    }
    loadProblem();
  }, [problemId]);

  const handleStartAttempt = async () => {
    if (!problem) return;
    setStarting(true);
    try {
      const attempt = await api.createAttempt(problem.id);
      onNavigate('editor', attempt.id);
    } catch (err) {
      console.error('Failed to start attempt', err);
      setStarting(false);
    }
  };

  if (loading || !problem) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading problem details...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Navigation Breadcrumb */}
      <button
        className="btn btn-outline btn-sm"
        style={{ marginBottom: 20 }}
        onClick={() => onNavigate('problems')}
      >
        <ArrowLeft size={14} />
        <span>Back to Problems</span>
      </button>

      {/* Header Banner */}
      <div className="card card-elevated" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <h1 className="page-title">{problem.title}</h1>
              <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>
                {problem.difficulty}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: 800 }}>
              {problem.description}
            </p>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleStartAttempt}
            disabled={starting}
          >
            {starting ? <div className="spinner" /> : <Play size={18} />}
            <span>{starting ? 'Starting Attempt...' : 'Start Attempt'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Requirements & Scenarios on left, What We Evaluate on right */}
      <div className="grid-cols-2" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Functional Requirements */}
          <div className="card">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ListChecks size={20} color="#818cf8" />
              <span>Functional Requirements</span>
            </h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {problem.requirements.map((req, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.92rem', color: '#cbd5e1' }}>
                  <CheckCircle2 size={16} color="#10b981" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Constraints */}
          <div className="card">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={20} color="#fbbf24" />
              <span>Important Constraints</span>
            </h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {problem.constraints.map((c, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.92rem', color: '#cbd5e1' }}>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Example Scenarios */}
          <div className="card">
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={20} color="#38bdf8" />
              <span>Example Scenarios</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {problem.exampleScenarios.map((sc, i) => (
                <div
                  key={i}
                  style={{
                    background: 'var(--bg-canvas)',
                    padding: '12px 14px',
                    borderRadius: 6,
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.88rem',
                    color: '#e2e8f0',
                    lineHeight: 1.5
                  }}
                >
                  {sc}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: What We Evaluate Rubric Preview */}
        <div className="card card-elevated" style={{ position: 'sticky', top: 90 }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={20} color="#a855f7" />
            <span>What We Evaluate</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
            Your text solution will be evaluated against our structured 8-dimension rubric:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { title: 'Requirement Understanding', desc: 'Identifies functional scope, core entities, and assumptions.' },
              { title: 'Class Responsibilities', desc: 'Single Responsibility Principle (SRP) and avoids God Objects.' },
              { title: 'Coupling & Cohesion', desc: 'High cohesion within classes and loose coupling between components.' },
              { title: 'Encapsulation & Interfaces', desc: 'Programs to interfaces rather than concrete classes.' },
              { title: 'Abstraction / Patterns', desc: 'Judicious application of design patterns (Strategy, State, etc.).' },
              { title: 'Extensibility', desc: 'Open/Closed Principle: adding new variants without breaking existing code.' },
              { title: 'Edge Cases & Testability', desc: 'Capacity limits, race conditions, concurrency locks, and failure states.' },
              { title: 'Explanation Quality', desc: 'Clear design rationale, architecture diagrams/traces, and trade-offs.' }
            ].map((rubric, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg-canvas)',
                  borderRadius: 6,
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc', marginBottom: 2 }}>
                  {idx + 1}. {rubric.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {rubric.desc}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={handleStartAttempt}
              disabled={starting}
            >
              <Play size={16} />
              <span>{starting ? 'Initializing...' : 'Ready? Start Attempt Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
