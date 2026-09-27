import dotenv from 'dotenv';
import path from 'path';
dotenv.config();
export const config = {
    port: parseInt(process.env.PORT || '4000', 10),
    evaluatorMode: (process.env.EVALUATOR_MODE || 'mock').toLowerCase(),
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    databasePath: process.env.DATABASE_PATH || path.resolve(process.cwd(), 'data', 'lld_platform.db'),
    corsOrigin: process.env.CORS_ORIGIN || '*'
};
