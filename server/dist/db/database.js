import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';
let dbInstance = null;
export function getDatabase(dbPath) {
    if (dbInstance) {
        return dbInstance;
    }
    const targetPath = dbPath || config.databasePath;
    if (targetPath !== ':memory:') {
        const dir = path.dirname(targetPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    const db = new DatabaseSync(targetPath);
    // Enable WAL mode for better concurrency and performance
    if (targetPath !== ':memory:') {
        db.exec('PRAGMA journal_mode = WAL;');
    }
    db.exec('PRAGMA foreign_keys = ON;');
    // Initialize schema
    initSchema(db);
    dbInstance = db;
    return dbInstance;
}
export function closeDatabase() {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
}
function initSchema(db) {
    let schemaPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
        schemaPath = path.resolve(process.cwd(), 'src', 'db', 'schema.sql');
    }
    if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schemaSql);
    }
    else {
        throw new Error(`Schema file not found at: ${schemaPath}`);
    }
}
