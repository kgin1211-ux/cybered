import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'cybered.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nama TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      no_telepon TEXT NOT NULL DEFAULT '',
      is_verified INTEGER NOT NULL DEFAULT 0,
      otp_code TEXT,
      otp_expires TEXT,
      otp_attempts INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS materi (
      id TEXT PRIMARY KEY,
      judul TEXT NOT NULL,
      deskripsi_singkat TEXT NOT NULL DEFAULT '',
      konten_lengkap TEXT NOT NULL DEFAULT '',
      harga INTEGER NOT NULL DEFAULT 0,
      harga_coret INTEGER,
      thumbnail_emoji TEXT NOT NULL DEFAULT '📘',
      level TEXT CHECK(level IN ('mudah', 'menengah', 'sulit', 'sangat_sulit', NULL)),
      tipe TEXT NOT NULL CHECK(tipe IN ('serangan', 'pertahanan', 'lainnya')),
      is_gratis INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      slug TEXT
    );

    CREATE TABLE IF NOT EXISTS akses_materi (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      materi_id TEXT NOT NULL,
      status INTEGER NOT NULL DEFAULT 0,
      tipe_pembelian TEXT CHECK(tipe_pembelian IN ('satuan', 'semua')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (materi_id) REFERENCES materi(id) ON DELETE CASCADE,
      UNIQUE(user_id, materi_id)
    );

    CREATE TABLE IF NOT EXISTS pendapatan (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      materi_id TEXT,
      jumlah INTEGER NOT NULL,
      tipe TEXT NOT NULL CHECK(tipe IN ('satuan', 'semua')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recycle_bin (
      id TEXT PRIMARY KEY,
      original_table TEXT NOT NULL,
      original_id TEXT NOT NULL,
      data_json TEXT NOT NULL,
      deleted_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Insert default admin if not exists
  const adminExists = db.prepare('SELECT id FROM admin WHERE username = ?').get('NodeschZ');
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('Qwerty1211', 10);
    const { v4: uuidv4 } = require('uuid');
    db.prepare('INSERT INTO admin (id, username, password) VALUES (?, ?, ?)').run(
      uuidv4(), 'NodeschZ', hashedPassword
    );
  }

  // Default settings
  const settings = [
    { key: 'diskon_satuan', value: '40' },
    { key: 'harga_bundel_coret', value: '300000' },
    { key: 'diskon_bundel', value: '0' },
  ];
  for (const s of settings) {
    const exists = db.prepare('SELECT key FROM settings WHERE key = ?').get(s.key);
    if (!exists) {
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(s.key, s.value);
    }
  }

  // Migration: add 'lainnya' to tipe CHECK constraint for existing databases
  const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='materi'").get() as any;
  if (tableInfo && tableInfo.sql && !tableInfo.sql.includes("'lainnya'")) {
    db.pragma('foreign_keys = OFF');
    db.exec(`
      CREATE TABLE IF NOT EXISTS materi_new (
        id TEXT PRIMARY KEY,
        judul TEXT NOT NULL,
        deskripsi_singkat TEXT NOT NULL DEFAULT '',
        konten_lengkap TEXT NOT NULL DEFAULT '',
        harga INTEGER NOT NULL DEFAULT 0,
        harga_coret INTEGER,
        thumbnail_emoji TEXT NOT NULL DEFAULT '📘',
        level TEXT CHECK(level IN ('mudah', 'menengah', 'sulit', 'sangat_sulit', NULL)),
        tipe TEXT NOT NULL CHECK(tipe IN ('serangan', 'pertahanan', 'lainnya')),
        is_gratis INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        slug TEXT
      );
      INSERT INTO materi_new SELECT * FROM materi;
      DROP TABLE materi;
      ALTER TABLE materi_new RENAME TO materi;
    `);
    db.pragma('foreign_keys = ON');
  }

  // Migration: add OTP verification columns to users table
  const userCols = db.prepare("PRAGMA table_info('users')").all() as any[];
  const hasOtp = userCols.some((c: any) => c.name === 'otp_code');
  if (!hasOtp) {
    db.exec(`
      ALTER TABLE users ADD COLUMN is_verified INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE users ADD COLUMN otp_code TEXT;
      ALTER TABLE users ADD COLUMN otp_expires TEXT;
      ALTER TABLE users ADD COLUMN otp_attempts INTEGER NOT NULL DEFAULT 0;
    `);
  }
}
