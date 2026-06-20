import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromCookies } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const db = getDb();
  const user = await getUserFromCookies();

  if (!user) {
    return NextResponse.json({ error: 'Harap login terlebih dahulu' }, { status: 401 });
  }

  const diskonSetting = db.prepare("SELECT value FROM settings WHERE key = 'diskon_satuan'").get() as any;
  const diskonPersen = parseInt(diskonSetting?.value || '40');

  const materi = db.prepare('SELECT * FROM materi ORDER BY tipe, level, judul').all() as any[];
  const aksesList = db.prepare('SELECT materi_id, status FROM akses_materi WHERE user_id = ?').all(user.id) as any[];
  const aksesMap = new Map(aksesList.map((a: any) => [a.materi_id, a.status]));

  const myMateri = materi
    .filter((m: any) => m.is_gratis || aksesMap.get(m.id) === 1)
    .map((m: any) => {
      const hargaDisplay = m.is_gratis ? 0 : (
        m.harga_coret && m.harga_coret > 0
          ? Math.round(m.harga_coret * (1 - diskonPersen / 100))
          : m.harga
      );
      return {
        ...m,
        is_gratis: !!m.is_gratis,
        harga: hargaDisplay,
        status: m.is_gratis ? 'gratis' : (aksesMap.get(m.id) === 1 ? 'terbuka' : 'terkunci'),
      };
    });

  return NextResponse.json({ materi: myMateri, user });
}
