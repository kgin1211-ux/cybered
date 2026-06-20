import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const search = url.searchParams.get('q') || '';

  const db = getDb();
  let users;
  if (search) {
    users = db.prepare(
      'SELECT id, nama, email, no_telepon, created_at FROM users WHERE nama LIKE ? OR email LIKE ? ORDER BY created_at DESC'
    ).all(`%${search}%`, `%${search}%`);
  } else {
    users = db.prepare('SELECT id, nama, email, no_telepon, created_at FROM users ORDER BY created_at DESC').all();
  }

  return NextResponse.json({ users });
}

// Soft-delete user: save user + akses_materi + pendapatan to recycle_bin, then delete
export async function DELETE(request: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID wajib' }, { status: 400 });

  const db = getDb();

  // Get full user data before deleting
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });

  // Save all akses_materi records to recycle_bin (with user & materi names for display)
  const aksesList = db.prepare(`
    SELECT am.*, u.nama as user_nama, COALESCE(m.judul, 'Materi Dihapus') as materi_judul
    FROM akses_materi am
    JOIN users u ON am.user_id = u.id
    LEFT JOIN materi m ON am.materi_id = m.id
    WHERE am.user_id = ?
  `).all(id) as any[];
  for (const akses of aksesList) {
    db.prepare(
      'INSERT INTO recycle_bin (id, original_table, original_id, data_json) VALUES (?, ?, ?, ?)'
    ).run(uuidv4(), 'akses_materi', akses.id, JSON.stringify(akses));
  }

  // Save all pendapatan records to recycle_bin (with user & materi names for display)
  const pendapatanList = db.prepare(`
    SELECT p.*, u.nama as user_nama, u.email as user_email,
      CASE WHEN p.materi_id IS NULL THEN 'Semua Materi' ELSE COALESCE(m.judul, 'Materi Dihapus') END as materi_judul
    FROM pendapatan p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN materi m ON p.materi_id = m.id
    WHERE p.user_id = ?
  `).all(id) as any[];
  for (const p of pendapatanList) {
    db.prepare(
      'INSERT INTO recycle_bin (id, original_table, original_id, data_json) VALUES (?, ?, ?, ?)'
    ).run(uuidv4(), 'pendapatan', p.id, JSON.stringify(p));
  }

  // Save user to recycle bin
  db.prepare(
    'INSERT INTO recycle_bin (id, original_table, original_id, data_json) VALUES (?, ?, ?, ?)'
  ).run(uuidv4(), 'users', user.id, JSON.stringify(user));

  // Temporarily disable FK cascade so we control the deletion order
  db.pragma('foreign_keys = OFF');

  // Delete pendapatan and akses_materi first (since we already saved them)
  db.prepare('DELETE FROM pendapatan WHERE user_id = ?').run(id);
  db.prepare('DELETE FROM akses_materi WHERE user_id = ?').run(id);

  // Delete the user
  db.prepare('DELETE FROM users WHERE id = ?').run(id);

  db.pragma('foreign_keys = ON');

  return NextResponse.json({ success: true });
}
