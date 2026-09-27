import { getDatabase } from '../db/database.js';
export class ProblemRepository {
    getAll() {
        const db = getDatabase();
        // Left join attempts and evaluations to provide summary statistics on the problem card
        const rows = db.prepare(`
      SELECT 
        p.*,
        COUNT(a.id) AS total_attempts,
        SUM(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_attempts,
        (
          SELECT a2.status FROM attempts a2 
          WHERE a2.problem_id = p.id 
          ORDER BY a2.created_at DESC LIMIT 1
        ) AS latest_status,
        (
          SELECT e.overall_score FROM attempts a3
          JOIN evaluations e ON e.attempt_id = a3.id
          WHERE a3.problem_id = p.id AND a3.status = 'COMPLETED'
          ORDER BY a3.created_at DESC LIMIT 1
        ) AS latest_score
      FROM problems p
      LEFT JOIN attempts a ON a.problem_id = p.id
      GROUP BY p.id
      ORDER BY 
        CASE p.difficulty 
          WHEN 'Easy' THEN 1 
          WHEN 'Medium' THEN 2 
          WHEN 'Hard' THEN 3 
          ELSE 4 
        END ASC,
        p.title ASC
    `).all();
        return rows.map(this.mapRowToProblem);
    }
    getById(id) {
        const db = getDatabase();
        const row = db.prepare(`
      SELECT 
        p.*,
        COUNT(a.id) AS total_attempts,
        SUM(CASE WHEN a.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_attempts,
        (
          SELECT a2.status FROM attempts a2 
          WHERE a2.problem_id = p.id 
          ORDER BY a2.created_at DESC LIMIT 1
        ) AS latest_status,
        (
          SELECT e.overall_score FROM attempts a3
          JOIN evaluations e ON e.attempt_id = a3.id
          WHERE a3.problem_id = p.id AND a3.status = 'COMPLETED'
          ORDER BY a3.created_at DESC LIMIT 1
        ) AS latest_score
      FROM problems p
      LEFT JOIN attempts a ON a.problem_id = p.id
      WHERE p.id = ?
      GROUP BY p.id
    `).get(id);
        if (!row)
            return null;
        return this.mapRowToProblem(row);
    }
    mapRowToProblem(row) {
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            difficulty: row.difficulty,
            practiceFocus: row.practice_focus,
            requirements: JSON.parse(row.requirements || '[]'),
            constraints: JSON.parse(row.constraints_text || '[]'),
            exampleScenarios: JSON.parse(row.example_scenarios || '[]'),
            createdAt: row.created_at,
            attemptStats: {
                totalAttempts: Number(row.total_attempts || 0),
                completedAttempts: Number(row.completed_attempts || 0),
                latestStatus: row.latest_status || undefined,
                latestScore: row.latest_score !== undefined && row.latest_score !== null ? Number(row.latest_score) : undefined
            }
        };
    }
}
export const problemRepository = new ProblemRepository();
