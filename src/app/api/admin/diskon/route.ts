import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const getSetting = (key: string, fallback: string) => {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as any;
    return row?.value || fallback;
  };

  return NextResponse.json({
    diskon_satuan: parseInt(getSetting('diskon_satuan', '40')),
    harga_bundel_coret: parseInt(getSetting('harga_bundel_coret', '300000')),
    diskon_bundel: parseInt(getSetting('diskon_bundel', '0')),
  });
}

export async function POST(request: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { diskon_satuan, harga_bundel_coret, diskon_bundel } = await request.json();
  const db = getDb();

  const saveSetting = (key: string, value: number | undefined) => {
    if (value !== undefined) {
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, String(value));
    }
  };

  saveSetting('diskon_satuan', diskon_satuan);
  saveSetting('harga_bundel_coret', harga_bundel_coret);
  saveSetting('diskon_bundel', diskon_bundel);

  return NextResponse.json({ success: true });
}
