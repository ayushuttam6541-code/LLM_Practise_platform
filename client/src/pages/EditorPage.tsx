import React, { useEffect, useState } from 'react';
import { Attempt, Problem, SubmissionPayload } from '../types';
import { api } from '../api/client';
import {
  Save,
  Send,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  FileText,
  Code2,
  GitBranch,
  Layers,
  HelpCircle,
  Compass,
  ShieldAlert
} from 'lucide-react';

interface EditorPageProps {
  attemptId: string;
  onNavigate: (view: string, id?: string) => void;
}

export const EditorPage: React.FC<EditorPageProps> = ({ attemptId, onNavigate }) => {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Solution Fields
  const [formData, setFormData] = useState<SubmissionPayload>({
    requirements: '',
    assumptions: '',
    classes: '',
    relationships: '',
    reasoning: '',
    extensibility: '',
    edgeCases: ''
  });

  useEffect(() => {
    async function loadAttemptData() {
      try {
        const att = await api.getAttempt(attemptId);
        setAttempt(att);

        const [prob, sub] = await Promise.all([
          api.getProblem(att.problemId),
          api.getSubmission(attemptId)
        ]);

        setProblem(prob);
        if (sub) {
          setFormData({
            requirements: sub.requirements || '',
            assumptions: sub.assumptions || '',
            classes: sub.classes || '',
            relationships: sub.relationships || '',
            reasoning: sub.reasoning || '',
            extensibility: sub.extensibility || '',
            edgeCases: sub.edgeCases || ''
          });
        }
      } catch (err) {
        console.error('Failed to load attempt or problem data', err);
      } finally {
        setLoading(false);
      }
    }
    loadAttemptData();
  }, [attemptId]);

  const handleChange = (field: keyof SubmissionPayload, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveMessage(null);
    setValidationErrors([]);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await api.saveDraft(attemptId, formData);
      setSaveMessage('Draft saved successfully at ' + new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error('Draft save failed', err);
      setSaveMessage('Failed to save draft: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSampleSolution = async () => {
    if (!problem) return;
    try {
      const sample = await api.getSampleSolution(problem.id);
      setFormData(sample);
      setSaveMessage('Loaded reference template solution! You can now edit and submit.');
    } catch (err: any) {
      alert('Sample solution not available for this problem.');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setValidationErrors([]);
    try {
      const result = await api.submitAttempt(attemptId, formData);
      // Route immediately to Evaluation / Design Review page
      onNavigate('evaluation', attemptId);
    } catch (err: any) {
      console.error('Submission failed', err);
      if (err.errors && Array.isArray(err.errors)) {
        setValidationErrors(err.errors.map((e: any) => e.message));
      } else {
        setValidationErrors([err.message || 'Submission failed. Please check required fields.']);
      }
      setSubmitting(false);
    }
  };

  if (loading || !attempt || !problem) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading design workspace...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 28px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => onNavigate('problem-details', problem.id)}
          >
            <ArrowLeft size={14} />
            <span>Problem Details</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                {problem.title}
              </h1>
              <span className={`badge badge-${problem.difficulty.toLowerCase()}`}>
                {problem.difficulty}
              </span>
              <span className={`badge badge-${attempt.status.toLowerCase()}`}>
                {attempt.status}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Attempt ID: {attempt.id}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {saveMessage && (
            <span style={{ fontSize: '0.82rem', color: saveMessage.includes('Failed') ? '#f87171' : '#34d399' }}>
              {saveMessage}
            </span>
          )}

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleLoadSampleSolution}
            title="Populates a comprehensive reference LLD solution for testing and demoing"
          >
            <Sparkles size={14} color="#818cf8" />
            <span>Load Sample Solution</span>
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleSaveDraft}
            disabled={saving || submitting}
          >
            {saving ? <div className="spinner" /> : <Save size={14} />}
            <span>Save Draft</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <div className="spinner" /> : <Send size={14} />}
            <span>{submitting ? 'Evaluating Design...' : 'Submit Solution'}</span>
          </button>
        </div>
      </div>

      {/* Validation Errors Callout */}
      {validationErrors.length > 0 && (
        <div className="callout callout-warning" style={{ marginBottom: 14, padding: '12px 16px' }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 4 }}>
              Please correct the following before submitting:
            </div>
            <ul style={{ paddingLeft: 18, fontSize: '0.84rem' }}>
              {validationErrors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 2-Column Split Workspace */}
      <div className="editor-layout" style={{ flex: 1 }}>
        {/* Left Column: Problem Reference Pane */}
        <div className="editor-problem-pane">
          <div className="pane-header">
            <span className="pane-title">
              <FileText size={16} color="#818cf8" />
              <span>Problem Reference & Specs</span>
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Collapsible Context
            </span>
          </div>

          <div className="pane-content">
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 6 }}>
                Overview
              </div>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                {problem.description}
              </p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>
                Functional Requirements
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {problem.requirements.map((req, i) => (
                  <div key={i} style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', gap: 6 }}>
                    <span style={{ color: '#818cf8', fontWeight: 600 }}>{i + 1}.</span>
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>
                Important Constraints
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {problem.constraints.map((c, i) => (
                  <div key={i} style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'flex', gap: 6 }}>
                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>•</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>
                Example Scenarios
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {problem.exampleScenarios.map((sc, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--bg-canvas)',
                      padding: '8px 10px',
                      borderRadius: 4,
                      fontSize: '0.8rem',
                      color: '#cbd5e1',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    {sc}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Structured Solution Editor */}
        <div className="editor-solution-pane">
          <div className="pane-header">
            <span className="pane-title">
              <Code2 size={16} color="#34d399" />
              <span>Structured LLD Solution</span>
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Explain requirements, class models, relationships & trade-offs
            </span>
          </div>

          <div className="pane-content">
            {/* 1. Requirements */}
            <div className="section-form-group">
              <div className="section-label-row">
                <span className="section-title">
                  <FileText size={15} color="#818cf8" />
                  <span>1. Requirements Summary</span>
                </span>
                <span className="section-hint">Summarize functional scope you are addressing</span>
              </div>
              <textarea
                className="solution-textarea"
                rows={3}
                placeholder="List the key functional requirements your design will fulfill..."
                value={formData.requirements}
                onChange={e => handleChange('requirements', e.target.value)}
              />
            </div>

            {/* 2. Assumptions */}
            <div className="section-form-group">
              <div className="section-label-row">
                <span className="section-title">
                  <Compass size={15} color="#38bdf8" />
                  <span>2. Assumptions</span>
                </span>
                <span className="section-hint">Scale, hardware interfaces, concurrency assumptions</span>
              </div>
              <textarea
                className="solution-textarea"
                rows={3}
                placeholder="State your assumptions (e.g. concurrency level, single vs multi-node, pricing increments)..."
                value={formData.assumptions}
                onChange={e => handleChange('assumptions', e.target.value)}
              />
            </div>

            {/* 3. Classes & Interfaces (Mandatory Core) */}
            <div className="section-form-group">
              <div className="section-label-row">
                <span className="section-title" style={{ color: '#f8fafc' }}>
                  <Layers size={15} color="#a855f7" />
                  <span>3. Classes & Interfaces (Core LLD)</span>
                  <span style={{ color: '#f43f5e', fontSize: '0.8rem' }}>*</span>
                </span>
                <span className="section-hint">Define classes, fields, responsibilities, and interface contracts</span>
              </div>
              <textarea
                className="solution-textarea"
                rows={9}
                style={{ minHeight: 180 }}
                placeholder={`Example:
Class: ParkingLot
Responsibility:
- Manage parking floors
- Coordinate spot allocation

Interface: PricingStrategy
Responsibility:
- calculateFee(ticket: ParkingTicket): number`}
                value={formData.classes}
                onChange={e => handleChange('classes', e.target.value)}
              />
            </div>

            {/* 4. Relationships */}
            <div className="section-form-group">
              <div className="section-label-row">
                <span className="section-title">
                  <GitBranch size={15} color="#f59e0b" />
                  <span>4. Relationships & Cardinalities</span>
                </span>
                <span className="section-hint">Composition, inheritance (is-a), aggregation, association</span>
              </div>
              <textarea
                className="solution-textarea"
                rows={4}
                placeholder="Describe relationships: e.g. ParkingLot HAS-A collection of ParkingFloor (1:N composition); Car EXTENDS Vehicle."
                value={formData.relationships}
                onChange={e => handleChange('relationships', e.target.value)}
              />
            </div>

            {/* 5. Design Reasoning */}
            <div className="section-form-group">
              <div className="section-label-row">
                <span className="section-title">
                  <HelpCircle size={15} color="#10b981" />
                  <span>5. Design Reasoning & Patterns</span>
                </span>
                <span className="section-hint">Why did you make these choices? Justify patterns and trade-offs</span>
              </div>
              <textarea
                className="solution-textarea"
                rows={4}
                placeholder="Explain why you chose specific design patterns (e.g. Strategy pattern for pricing, State pattern for machine states)..."
                value={formData.reasoning}
                onChange={e => handleChange('reasoning', e.target.value)}
              />
            </div>

            {/* 6. Extensibility */}
            <div className="section-form-group">
              <div className="section-label-row">
                <span className="section-title">
                  <Sparkles size={15} color="#818cf8" />
                  <span>6. Extensibility Considerations</span>
                </span>
                <span className="section-hint">How does your design support Open/Closed Principle for new features?</span>
              </div>
              <textarea
                className="solution-textarea"
                rows={3}
                placeholder="How to add new vehicle types, payment methods, or pricing algorithms without rewriting existing code..."
                value={formData.extensibility}
                onChange={e => handleChange('extensibility', e.target.value)}
              />
            </div>

            {/* 7. Edge Cases & Testability */}
            <div className="section-form-group">
              <div className="section-label-row">
                <span className="section-title">
                  <ShieldAlert size={15} color="#ef4444" />
                  <span>7. Edge Cases & Testability</span>
                </span>
                <span className="section-hint">Race conditions, capacity limits, failure recovery, mockability</span>
              </div>
              <textarea
                className="solution-textarea"
                rows={3}
                placeholder="Identify race conditions, concurrent access handling, full capacity edge cases, and unit test strategies..."
                value={formData.edgeCases}
                onChange={e => handleChange('edgeCases', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
