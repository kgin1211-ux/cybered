import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// Buka semua akses untuk user tertentu
export async function POST(request: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { user_id } = await request.json();
  if (!user_id) return NextResponse.json({ error: 'User ID wajib' }, { status: 400 });

  const db = getDb();

  const allMateri = db.prepare('SELECT * FROM materi WHERE is_gratis = 0').all() as any[];

  const existingAkses = db.prepare('SELECT materi_id, status, id FROM akses_materi WHERE user_id = ?').all(user_id) as any[];
  const aksesMap = new Map(existingAkses.map((a: any) => [a.materi_id, { status: a.status, id: a.id }]));

  let anyUnlocked = false;

  const insertStmt = db.prepare(
    'INSERT INTO akses_materi (id, user_id, materi_id, status, tipe_pembelian) VALUES (?, ?, ?, 1, ?)'
  );
  const updateStmt = db.prepare(
    'UPDATE akses_materi SET status = 1, tipe_pembelian = ? WHERE id = ?'
  );

  for (const m of allMateri) {
    const existing = aksesMap.get(m.id);
    if (!existing) {
      insertStmt.run(uuidv4(), user_id, m.id, 'semua');
      anyUnlocked = true;
    } else if (existing.status !== 1) {
      updateStmt.run('semua', existing.id);
      anyUnlocked = true;
    }
  }

  if (anyUnlocked) {
    // Compute bundle price: harga_bundel_coret * (1 - diskon_bundel/100)
    const getSetting = (key: string, fallback: string) => {
      const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as any;
      return row?.value || fallback;
    };
    const hargaBundelCoret = parseInt(getSetting('harga_bundel_coret', '300000'));
    const diskonBundel = parseInt(getSetting('diskon_bundel', '0'));
    const hargaBundle = Math.round(hargaBundelCoret * (1 - diskonBundel / 100));

    db.prepare('INSERT INTO pendapatan (id, user_id, materi_id, jumlah, tipe) VALUES (?, ?, NULL, ?, ?)').run(
      uuidv4(), user_id, hargaBundle, 'semua'
    );
  }

  return NextResponse.json({ success: true, anyUnlocked });
}
