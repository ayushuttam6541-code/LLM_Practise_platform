import { getDatabase } from '../db/database.js';
export class SubmissionRepository {
    upsert(attemptId, data) {
        const db = getDatabase();
        const existing = this.getByAttemptId(attemptId);
        const now = new Date().toISOString();
        if (existing) {
            db.prepare(`
        UPDATE submissions
        SET requirements = ?, assumptions = ?, classes = ?, relationships = ?,
            reasoning = ?, extensibility = ?, edge_cases = ?, updated_at = ?
        WHERE attempt_id = ?
      `).run(data.requirements || '', data.assumptions || '', data.classes || '', data.relationships || '', data.reasoning || '', data.extensibility || '', data.edgeCases || '', now, attemptId);
            return {
                id: existing.id,
                attemptId,
                requirements: data.requirements ?? existing.requirements,
                assumptions: data.assumptions ?? existing.assumptions,
                classes: data.classes ?? existing.classes,
                relationships: data.relationships ?? existing.relationships,
                reasoning: data.reasoning ?? existing.reasoning,
                extensibility: data.extensibility ?? existing.extensibility,
                edgeCases: data.edgeCases ?? existing.edgeCases,
                createdAt: existing.createdAt,
                updatedAt: now
            };
        }
        else {
            const id = 'sub_' + Math.random().toString(36).substring(2, 11);
            db.prepare(`
        INSERT INTO submissions (id, attempt_id, requirements, assumptions, classes, relationships, reasoning, extensibility, edge_cases, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, attemptId, data.requirements || '', data.assumptions || '', data.classes || '', data.relationships || '', data.reasoning || '', data.extensibility || '', data.edgeCases || '', now, now);
            return {
                id,
                attemptId,
                requirements: data.requirements || '',
                assumptions: data.assumptions || '',
                classes: data.classes || '',
                relationships: data.relationships || '',
                reasoning: data.reasoning || '',
                extensibility: data.extensibility || '',
                edgeCases: data.edgeCases || '',
                createdAt: now,
                updatedAt: now
            };
        }
    }
    getByAttemptId(attemptId) {
        const db = getDatabase();
        const row = db.prepare(`
      SELECT * FROM submissions WHERE attempt_id = ?
    `).get(attemptId);
        if (!row)
            return null;
        return {
            id: row.id,
            attemptId: row.attempt_id,
            requirements: row.requirements,
            assumptions: row.assumptions,
            classes: row.classes,
            relationships: row.relationships,
            reasoning: row.reasoning,
            extensibility: row.extensibility,
            edgeCases: row.edge_cases,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}
export const submissionRepository = new SubmissionRepository();
