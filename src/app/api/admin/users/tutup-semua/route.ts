import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

// Tutup semua akses untuk user tertentu (nonaktifkan bundel)
export async function POST(request: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { user_id } = await request.json();
  if (!user_id) return NextResponse.json({ error: 'User ID wajib' }, { status: 400 });

  const db = getDb();

  // Set all akses to locked (status=0)
  const result = db.prepare(
    'UPDATE akses_materi SET status = 0, tipe_pembelian = NULL WHERE user_id = ?'
  ).run(user_id);

  return NextResponse.json({ success: true, ditutup: result.changes });
}
