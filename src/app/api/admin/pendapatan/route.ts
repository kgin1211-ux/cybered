import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const pendapatan = db.prepare(`
    SELECT p.*, u.nama as user_nama, u.email as user_email,
      CASE WHEN p.materi_id IS NULL THEN 'Semua Materi' ELSE COALESCE(m.judul, 'Unknown') END as materi_judul
    FROM pendapatan p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN materi m ON p.materi_id = m.id
    ORDER BY p.created_at DESC
  `).all();

  const total = db.prepare('SELECT COALESCE(SUM(jumlah), 0) as total FROM pendapatan').get() as any;

  return NextResponse.json({ pendapatan, total: total.total });
}

// Soft-delete pendapatan: move to recycle_bin, then delete from pendapatan
export async function DELETE(request: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'ID wajib' }, { status: 400 });

  const db = getDb();

  // Get full pendapatan record (with joined user/materi info for display in recycle bin)
  const record = db.prepare(`
    SELECT p.*, u.nama as user_nama, u.email as user_email,
      CASE WHEN p.materi_id IS NULL THEN 'Semua Materi' ELSE COALESCE(m.judul, 'Unknown') END as materi_judul
    FROM pendapatan p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN materi m ON p.materi_id = m.id
    WHERE p.id = ?
  `).get(id) as any;

  if (!record) return NextResponse.json({ error: 'Pendapatan tidak ditemukan' }, { status: 404 });

  // Save to recycle bin
  db.prepare(
    'INSERT INTO recycle_bin (id, original_table, original_id, data_json) VALUES (?, ?, ?, ?)'
  ).run(uuidv4(), 'pendapatan', record.id, JSON.stringify(record));

  // Delete pendapatan
  db.prepare('DELETE FROM pendapatan WHERE id = ?').run(id);

  // Return updated total
  const total = db.prepare('SELECT COALESCE(SUM(jumlah), 0) as total FROM pendapatan').get() as any;

  return NextResponse.json({ success: true, total: total.total });
}
