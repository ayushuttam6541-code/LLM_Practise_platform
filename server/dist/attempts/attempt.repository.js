import { getDatabase } from '../db/database.js';
export class AttemptRepository {
    create(attempt) {
        const db = getDatabase();
        db.prepare(`
      INSERT INTO attempts (id, problem_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(attempt.id, attempt.problemId, attempt.status, attempt.createdAt, attempt.updatedAt);
    }
    getById(id) {
        const db = getDatabase();
        const row = db.prepare(`
      SELECT 
        a.*,
        p.title AS problem_title,
        p.difficulty AS problem_difficulty,
        e.overall_score
      FROM attempts a
      JOIN problems p ON p.id = a.problem_id
      LEFT JOIN evaluations e ON e.attempt_id = a.id
      WHERE a.id = ?
    `).get(id);
        if (!row)
            return null;
        return this.mapRow(row);
    }
    getAll(problemId) {
        const db = getDatabase();
        let query = `
      SELECT 
        a.*,
        p.title AS problem_title,
        p.difficulty AS problem_difficulty,
        e.overall_score
      FROM attempts a
      JOIN problems p ON p.id = a.problem_id
      LEFT JOIN evaluations e ON e.attempt_id = a.id
    `;
        const params = [];
        if (problemId) {
            query += ` WHERE a.problem_id = ? `;
            params.push(problemId);
        }
        query += ` ORDER BY a.created_at DESC `;
        const rows = (params.length > 0
            ? db.prepare(query).all(...params)
            : db.prepare(query).all());
        return rows.map(this.mapRow);
    }
    updateStatus(id, status, submittedAt) {
        const db = getDatabase();
        const now = new Date().toISOString();
        if (submittedAt !== undefined) {
            db.prepare(`
        UPDATE attempts
        SET status = ?, submitted_at = ?, updated_at = ?
        WHERE id = ?
      `).run(status, submittedAt, now, id);
        }
        else {
            db.prepare(`
        UPDATE attempts
        SET status = ?, updated_at = ?
        WHERE id = ?
      `).run(status, now, id);
        }
    }
    mapRow(row) {
        return {
            id: row.id,
            problemId: row.problem_id,
            status: row.status,
            createdAt: row.created_at,
            submittedAt: row.submitted_at || undefined,
            updatedAt: row.updated_at,
            problemTitle: row.problem_title,
            problemDifficulty: row.problem_difficulty,
            score: row.overall_score !== null && row.overall_score !== undefined ? Number(row.overall_score) : undefined
        };
    }
}
export const attemptRepository = new AttemptRepository();
