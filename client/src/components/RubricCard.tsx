import React from 'react';
import { FeedbackItem } from '../types';
import { Quote, AlertTriangle, Lightbulb, ShieldCheck } from 'lucide-react';

interface RubricCardProps {
  item: FeedbackItem;
}

export const RubricCard: React.FC<RubricCardProps> = ({ item }) => {
  const getScoreBadgeClass = (score: number) => {
    if (score >= 8) return 'badge-easy';
    if (score >= 6) return 'badge-medium';
    return 'badge-hard';
  };

  const getConfidenceClass = (confidence: string) => {
    switch (confidence) {
      case 'high': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399' };
      case 'medium': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' };
      default: return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' };
    }
  };

  const confStyle = getConfidenceClass(item.confidence);

  return (
    <div className="rubric-card">
      <div className="rubric-card-header">
        <div>
          <h3 className="rubric-criterion-name">{item.criterion}</h3>
          <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: confStyle.bg,
                color: confStyle.color
              }}
            >
              {item.confidence} confidence
            </span>
          </div>
        </div>
        <div className={`badge ${getScoreBadgeClass(item.score)} rubric-score-badge`}>
          {item.score} / 10
        </div>
      </div>

      {/* Concrete Grounded Evidence Quote */}
      <div className="rubric-section-block rubric-evidence">
        <div className="block-label block-evidence-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Quote size={12} />
          <span>Evidence from your submission</span>
        </div>
        <p className="block-text" style={{ fontStyle: 'italic' }}>
          "{item.evidence}"
        </p>
      </div>

      {/* Architectural Concern */}
      <div className="rubric-section-block rubric-concern">
        <div className="block-label block-concern-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertTriangle size={12} />
          <span>Architectural Concern</span>
        </div>
        <p className="block-text">
          {item.concern}
        </p>
      </div>

      {/* Actionable Suggestion */}
      <div className="rubric-section-block rubric-suggestion">
        <div className="block-label block-suggestion-label" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Lightbulb size={12} />
          <span>Actionable Suggestion</span>
        </div>
        <p className="block-text">
          {item.suggestion}
        </p>
      </div>
    </div>
  );
};
