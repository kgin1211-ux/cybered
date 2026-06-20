import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getUserFromCookies } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const db = getDb();
  const authUser = await getUserFromCookies();
  
  const materi = db.prepare('SELECT * FROM materi ORDER BY tipe, level, judul').all() as any[];

  const getSetting = (key: string, fallback: string) => {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as any;
    return row?.value || fallback;
  };

  const diskonSatuan = parseInt(getSetting('diskon_satuan', '40'));
  const hargaBundelCoret = parseInt(getSetting('harga_bundel_coret', '300000'));
  const diskonBundel = parseInt(getSetting('diskon_bundel', '0'));

  // Compute display harga for individual: harga_coret * (1 - diskon_satuan/100)
  const computeHarga = (m: any) => {
    if (m.is_gratis) return 0;
    if (m.harga_coret && m.harga_coret > 0) {
      return Math.round(m.harga_coret * (1 - diskonSatuan / 100));
    }
    return m.harga;
  };

  // Bundle price: harga_bundel_coret * (1 - diskon_bundel/100)
  const bundleHarga = Math.round(hargaBundelCoret * (1 - diskonBundel / 100));
  const bundleInfo = { hargaCoret: hargaBundelCoret, harga: bundleHarga };

  const nonFree = materi.filter((m: any) => !m.is_gratis);

  if (authUser) {
    const userRecord = db.prepare('SELECT id, nama, email, no_telepon FROM users WHERE id = ?').get(authUser.id) as any;
    const aksesList = db.prepare('SELECT materi_id, status FROM akses_materi WHERE user_id = ?').all(authUser.id) as any[];
    const aksesMap = new Map(aksesList.map((a: any) => [a.materi_id, a.status]));

    const nonFreeIds = new Set(nonFree.map((m: any) => m.id));
    const hasBundle = nonFreeIds.size > 0 &&
      [...nonFreeIds].every(id => aksesMap.get(id) === 1);

    const result = materi.map((m: any) => ({
      ...m,
      is_gratis: !!m.is_gratis,
      harga: computeHarga(m),
      user_akses_status: aksesMap.get(m.id) ?? null,
    }));
    return NextResponse.json({ materi: result, user: userRecord, hasBundle, bundleInfo });
  }

  const result = materi.map((m: any) => ({
    ...m,
    is_gratis: !!m.is_gratis,
    harga: computeHarga(m),
    user_akses_status: null,
  }));
  return NextResponse.json({ materi: result, user: null, bundleInfo });
}
