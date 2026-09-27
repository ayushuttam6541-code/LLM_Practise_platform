import { getDatabase } from '../db/database.js';
export class EvaluationRepository {
    save(evaluation) {
        const db = getDatabase();
        // Upsert evaluation record
        db.prepare(`
      INSERT INTO evaluations (
        id, attempt_id, status, overall_summary, overall_score,
        what_went_well, what_to_improve, suggested_next_step,
        evaluator_used, error_message, created_at, completed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(attempt_id) DO UPDATE SET
        status = excluded.status,
        overall_summary = excluded.overall_summary,
        overall_score = excluded.overall_score,
        what_went_well = excluded.what_went_well,
        what_to_improve = excluded.what_to_improve,
        suggested_next_step = excluded.suggested_next_step,
        evaluator_used = excluded.evaluator_used,
        error_message = excluded.error_message,
        completed_at = excluded.completed_at
    `).run(evaluation.id, evaluation.attemptId, evaluation.status, evaluation.overallSummary, evaluation.overallScore, JSON.stringify(evaluation.whatWentWell), JSON.stringify(evaluation.whatToImprove), evaluation.suggestedNextStep, evaluation.evaluatorUsed, evaluation.errorMessage || null, evaluation.createdAt, evaluation.completedAt || null);
        // Replace feedback items
        db.prepare(`DELETE FROM feedback_items WHERE evaluation_id = ?`).run(evaluation.id);
        const insertFeedback = db.prepare(`
      INSERT INTO feedback_items (
        id, evaluation_id, criterion, score, evidence, concern, suggestion, confidence, sort_order
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        evaluation.feedbackItems.forEach((item, index) => {
            insertFeedback.run(item.id, evaluation.id, item.criterion, item.score, item.evidence, item.concern, item.suggestion, item.confidence, index);
        });
    }
    getByAttemptId(attemptId) {
        const db = getDatabase();
        const row = db.prepare(`
      SELECT * FROM evaluations WHERE attempt_id = ?
    `).get(attemptId);
        if (!row)
            return null;
        const feedbackRows = db.prepare(`
      SELECT * FROM feedback_items WHERE evaluation_id = ? ORDER BY sort_order ASC
    `).all(row.id);
        return {
            id: row.id,
            attemptId: row.attempt_id,
            status: row.status,
            overallSummary: row.overall_summary,
            overallScore: Number(row.overall_score),
            whatWentWell: JSON.parse(row.what_went_well || '[]'),
            whatToImprove: JSON.parse(row.what_to_improve || '[]'),
            suggestedNextStep: row.suggested_next_step,
            evaluatorUsed: row.evaluator_used,
            errorMessage: row.error_message || undefined,
            createdAt: row.created_at,
            completedAt: row.completed_at || undefined,
            feedbackItems: feedbackRows.map(f => ({
                id: f.id,
                evaluationId: f.evaluation_id,
                criterion: f.criterion,
                score: Number(f.score),
                evidence: f.evidence,
                concern: f.concern,
                suggestion: f.suggestion,
                confidence: f.confidence,
                sortOrder: f.sort_order
            }))
        };
    }
}
export const evaluationRepository = new EvaluationRepository();
