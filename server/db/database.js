import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DATABASE_PATH || join(__dirname, 'exam_portal.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
    db.exec(schema);
    runMigrations(db);
  }
  return db;
}

function runMigrations(db) {
  const columns = db.prepare('PRAGMA table_info(candidates)').all();
  if (!columns.some((col) => col.name === 'applied_position')) {
    db.exec(`ALTER TABLE candidates ADD COLUMN applied_position TEXT NOT NULL DEFAULT ''`);
  }
  if (!columns.some((col) => col.name === 'cv_stored_name')) {
    db.exec(`ALTER TABLE candidates ADD COLUMN cv_stored_name TEXT`);
  }
  if (!columns.some((col) => col.name === 'cv_original_name')) {
    db.exec(`ALTER TABLE candidates ADD COLUMN cv_original_name TEXT`);
  }
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
