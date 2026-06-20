import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromCookies } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  const user = await getUserFromCookies();

  const materi = db.prepare('SELECT * FROM materi WHERE id = ?').get(id) as any;

  if (!materi) {
    return NextResponse.json({ error: 'Materi tidak ditemukan' }, { status: 404 });
  }

  // Check access - user MUST be logged in
  if (!user) {
    return NextResponse.json({ materi, canAccess: false, user: null });
  }

  let canAccess = false;
  if (materi.is_gratis) {
    canAccess = true;
  } else {
    const akses = db.prepare('SELECT status FROM akses_materi WHERE user_id = ? AND materi_id = ?').get(user.id, id) as any;
    if (akses && akses.status === 1) {
      canAccess = true;
    }
  }

  return NextResponse.json({
    materi: { ...materi, is_gratis: !!materi.is_gratis },
    canAccess,
    user,
  });
}
