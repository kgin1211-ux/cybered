// CyberEd Content Seeder v3 — Replace-all with 30 deep-walkthrough materi
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

import { seranganWeb } from '../src/lib/materi-content/serangan-web';
import { seranganSystem } from '../src/lib/materi-content/serangan-system';
import { seranganWeb2 } from '../src/lib/materi-content/serangan-web2';
import { seranganNetwork } from '../src/lib/materi-content/serangan-network';
import { seranganSocial } from '../src/lib/materi-content/serangan-social';
import { pertahanan1 } from '../src/lib/materi-content/pertahanan-1';
import { pertahanan2 } from '../src/lib/materi-content/pertahanan-2';
import { pertahanan3 } from '../src/lib/materi-content/pertahanan-3';
import { insertMateri } from '../src/lib/materi-content/runner';

const DB_PATH = path.join(process.cwd(), 'cybered.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  no_telepon TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS materi (
  id TEXT PK,
  judul TEXT NOT NULL,
  deskripsi_singkat TEXT DEFAULT '',
  konten_lengkap TEXT DEFAULT '',
  harga INTEGER DEFAULT 0,
  harga_coret INTEGER,
  thumbnail_emoji TEXT DEFAULT '📘',
  level TEXT CHECK(level IN ('mudah','menengah','sulit','sangat_sulit',NULL)),
  tipe TEXT NOT NULL CHECK(tipe IN ('serangan','pertahanan')),
  is_gratis INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS akses_materi (
  id TEXT PK,
  user_id TEXT NOT NULL,
  materi_id TEXT NOT NULL,
  status INTEGER DEFAULT 0,
  tipe_pembelian TEXT CHECK(tipe_pembelian IN ('satuan','semua')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (materi_id) REFERENCES materi(id),
  UNIQUE(user_id, materi_id)
);
CREATE TABLE IF NOT EXISTS pendapatan (
  id TEXT PK,
  user_id TEXT NOT NULL,
  materi_id TEXT,
  jumlah INTEGER NOT NULL,
  tipe TEXT NOT NULL CHECK(tipe IN ('satuan','semua')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS admin (
  id TEXT PK,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PK,
  value TEXT NOT NULL
);`);

db.prepare('INSERT OR IGNORE INTO admin (id, username, password) VALUES (?,?,?)').run(
  uuidv4(),
  'NodeschZ',
  bcrypt.hashSync('Qwerty1211', 10)
);
db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?,?)').run('diskon_semua', '40');

// Fresh seed: drop existing materi (transactions/akses akan cascade-safe karena FK kita disable dulu)
db.pragma('foreign_keys = OFF');
db.prepare('DELETE FROM pendapatan').run();
db.prepare('DELETE FROM akses_materi').run();
db.prepare('DELETE FROM materi').run();
db.pragma('foreign_keys = ON');

const SEMUA_MATERI = [
  ...seranganWeb,
  ...seranganSystem,
  ...seranganWeb2,
  ...seranganNetwork,
  ...seranganSocial,
  ...pertahanan1,
  ...pertahanan2,
  ...pertahanan3,
];

console.log(`🌱 Fresh seed ${SEMUA_MATERI.length} materi (walkthrough style)...\n`);

let inserted = 0;
const tx = db.transaction((materiList: typeof SEMUA_MATERI) => {
  for (const m of materiList) {
    try {
      insertMateri({ db, uuid: uuidv4 }, m);
      inserted++;
    } catch (e) {
      console.error(`  ❌ ${m.judul}: ${(e as Error).message}`);
    }
  }
});

try {
  tx(SEMUA_MATERI);
} catch (e) {
  console.error('❌ Transaction failed:', e);
  process.exit(1);
}

const totalRows = (db.prepare(`SELECT COUNT(*) as cnt FROM materi`).get() as { cnt: number }).cnt;
const avgRows = db.prepare(
  `SELECT tipe, COUNT(*) as cnt, AVG(LENGTH(konten_lengkap)) as avg_len, MAX(LENGTH(konten_lengkap)) as max_len FROM materi GROUP BY tipe`
).all() as { tipe: string; cnt: number; avg_len: number; max_len: number }[];

console.log(`  ✅ ${inserted} materi di-insert`);
console.log(`  📚 Total materi di DB: ${totalRows}`);
for (const r of avgRows) {
  console.log(`     ${r.tipe}: ${r.cnt} materi — avg ${Math.round(r.avg_len)} chars, max ${r.max_len} chars`);
}
console.log(`\n📂 Database: ${DB_PATH}`);

// =====================
// 🌱 DEMO DATA: Users, Akses, Pendapatan
// =====================
console.log(`\n👥 Seeding demo users, akses & pendapatan...\n`);

// --- Demo Users ---
const demoUsers = [
  { id: uuidv4(), nama: 'Budi Santoso', email: 'budi@example.com', password: bcrypt.hashSync('password123', 10), no_telepon: '081234567890' },
  { id: uuidv4(), nama: 'Siti Rahayu', email: 'siti@example.com', password: bcrypt.hashSync('password123', 10), no_telepon: '082345678901' },
  { id: uuidv4(), nama: 'Andi Wijaya', email: 'andi@example.com', password: bcrypt.hashSync('password123', 10), no_telepon: '083456789012' },
];

db.prepare('DELETE FROM users WHERE email LIKE ?').run('%@example.com');
const insertUser = db.prepare('INSERT OR IGNORE INTO users (id, nama, email, password, no_telepon) VALUES (?, ?, ?, ?, ?)');
for (const u of demoUsers) {
  insertUser.run(u.id, u.nama, u.email, u.password, u.no_telepon);
}
console.log(`  ✅ ${demoUsers.length} demo users created`);

// --- Ambil semua materi ID untuk akses ---
const semuaMateri = db.prepare('SELECT id, harga, is_gratis, tipe FROM materi').all() as { id: string; harga: number; is_gratis: number; tipe: string }[];
const materiSerangan = semuaMateri.filter(m => m.tipe === 'serangan');
const materiGratis = semuaMateri.filter(m => m.is_gratis === 1);

const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
const insertAkses = db.prepare('INSERT OR IGNORE INTO akses_materi (id, user_id, materi_id, status, tipe_pembelian, created_at) VALUES (?, ?, ?, ?, ?, ?)');
const insertPendapatan = db.prepare('INSERT OR IGNORE INTO pendapatan (id, user_id, materi_id, jumlah, tipe, created_at) VALUES (?, ?, ?, ?, ?, ?)');

// --- Budi: beli 4 materi serangan satuan ---
const budi = demoUsers[0];
const budiMateri = materiSerangan.slice(0, 4);
let budiTotal = 0;
for (const m of budiMateri) {
  insertAkses.run(uuidv4(), budi.id, m.id, 1, 'satuan', now);
  insertPendapatan.run(uuidv4(), budi.id, m.id, m.harga, 'satuan', now);
  budiTotal += m.harga;
}
// Beri juga akses ke materi gratis
for (const m of materiGratis) {
  insertAkses.run(uuidv4(), budi.id, m.id, 1, 'satuan', now);
}
console.log(`  ✅ Budi Santoso: ${budiMateri.length} materi serangan dibeli (Rp ${budiTotal.toLocaleString('id-ID')}) + ${materiGratis.length} gratis`);

// --- Siti: beli SEMUA materi (paket lengkap) ---
const siti = demoUsers[1];
const diskonSemua = parseInt((db.prepare("SELECT value FROM settings WHERE key = 'diskon_semua'").get() as { value: string }).value) || 40;
const totalHargaSemua = semuaMateri.filter(m => !m.is_gratis).reduce((sum, m) => sum + m.harga, 0);
const hargaSetelahDiskon = Math.round(totalHargaSemua * (1 - diskonSemua / 100));
for (const m of semuaMateri) {
  insertAkses.run(uuidv4(), siti.id, m.id, 1, 'semua', now);
}
insertPendapatan.run(uuidv4(), siti.id, null, hargaSetelahDiskon, 'semua', now);
console.log(`  ✅ Siti Rahayu: semua ${semuaMateri.length} materi dibeli (paket lengkap Rp ${hargaSetelahDiskon.toLocaleString('id-ID')}, diskon ${diskonSemua}%)`);

// --- Andi: cuma user baru, belum beli apa-apa (hanya akses gratis) ---
const andi = demoUsers[2];
for (const m of materiGratis) {
  insertAkses.run(uuidv4(), andi.id, m.id, 1, 'satuan', now);
}
console.log(`  ✅ Andi Wijaya: user baru, ${materiGratis.length} materi gratis saja`);

// --- Summary ---
const totalUsers = (db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number }).cnt;
const totalAkses = (db.prepare('SELECT COUNT(*) as cnt FROM akses_materi').get() as { cnt: number }).cnt;
const totalPendapatan = db.prepare("SELECT SUM(jumlah) as total FROM pendapatan").get() as { total: number };
console.log(`\n📊 Demo Data Summary:`);
console.log(`  👤 Total users: ${totalUsers}`);
console.log(`  🔑 Total akses entries: ${totalAkses}`);
console.log(`  💰 Total pendapatan: Rp ${(totalPendapatan.total || 0).toLocaleString('id-ID')}`);

db.close();
