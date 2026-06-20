import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

function computeHarga(db: ReturnType<typeof getDb>, m: any): number {
  if (m.is_gratis) return 0;
  const diskonSetting = db.prepare("SELECT value FROM settings WHERE key = 'diskon_satuan'").get() as any;
  const diskonPersen = parseInt(diskonSetting?.value || '40');
  if (m.harga_coret && m.harga_coret > 0) {
    return Math.round(m.harga_coret * (1 - diskonPersen / 100));
  }
  return m.harga;
}

// Get access status for a user for all materials
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: userId } = await params;
  const db = getDb();

  const user = db.prepare('SELECT id, nama, email, no_telepon FROM users WHERE id = ?').get(userId);
  if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });

  const materi = db.prepare('SELECT * FROM materi WHERE is_gratis = 0 ORDER BY tipe, level, judul').all() as any[];
  const aksesList = db.prepare('SELECT materi_id, status FROM akses_materi WHERE user_id = ?').all(userId) as any[];
  const aksesMap = new Map(aksesList.map((a: any) => [a.materi_id, a.status]));

  const result = materi.map((m: any) => ({
    ...m,
    is_gratis: !!m.is_gratis,
    harga_display: computeHarga(db, m),
    status_akses: aksesMap.get(m.id) === 1 ? 'terbuka' : 'terkunci',
  }));

  return NextResponse.json({ user, materi: result });
}

// Toggle single material access
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: userId } = await params;
  const { materi_id } = await request.json();

  const db = getDb();

  const existing = db.prepare('SELECT * FROM akses_materi WHERE user_id = ? AND materi_id = ?').get(userId, materi_id) as any;

  if (existing) {
    // Toggle
    const newStatus = existing.status === 1 ? 0 : 1;
    db.prepare('UPDATE akses_materi SET status = ?, tipe_pembelian = ? WHERE id = ?').run(newStatus, newStatus === 1 ? 'satuan' : null, existing.id);

    // Record revenue if unlocking (use dynamic harga)
    if (newStatus === 1) {
      const materi = db.prepare('SELECT * FROM materi WHERE id = ?').get(materi_id) as any;
      if (materi) {
        const hargaDisplay = computeHarga(db, materi);
        db.prepare('INSERT INTO pendapatan (id, user_id, materi_id, jumlah, tipe) VALUES (?, ?, ?, ?, ?)').run(
          uuidv4(), userId, materi_id, hargaDisplay, 'satuan'
        );
      }
    }

    return NextResponse.json({ success: true, status: newStatus });
  } else {
    // Create and open
    db.prepare('INSERT INTO akses_materi (id, user_id, materi_id, status, tipe_pembelian) VALUES (?, ?, ?, 1, ?)').run(
      uuidv4(), userId, materi_id, 'satuan'
    );

    const materi = db.prepare('SELECT * FROM materi WHERE id = ?').get(materi_id) as any;
    if (materi) {
      const hargaDisplay = computeHarga(db, materi);
      db.prepare('INSERT INTO pendapatan (id, user_id, materi_id, jumlah, tipe) VALUES (?, ?, ?, ?, ?)').run(
        uuidv4(), userId, materi_id, hargaDisplay, 'satuan'
      );
    }

    return NextResponse.json({ success: true, status: 1 });
  }
}
