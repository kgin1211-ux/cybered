import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

function checkAdmin() {
  return getAdminFromCookies();
}

export async function GET() {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const materi = db.prepare('SELECT * FROM materi ORDER BY created_at DESC').all() as any[];

  const diskonSetting = db.prepare("SELECT value FROM settings WHERE key = 'diskon_satuan'").get() as any;
  const diskonPersen = parseInt(diskonSetting?.value || '40');

  // Compute display prices
  const result = materi.map((m: any) => ({
    ...m,
    is_gratis: !!m.is_gratis,
    harga_display: m.is_gratis ? 0 : (
      m.harga_coret && m.harga_coret > 0
        ? Math.round(m.harga_coret * (1 - diskonPersen / 100))
        : m.harga
    ),
  }));

  return NextResponse.json({ materi: result });
}

export async function POST(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { judul, deskripsi_singkat, konten_lengkap, harga, harga_coret, thumbnail_emoji, level, tipe, is_gratis, diskon_persen } = body;

    if (!judul || !tipe) {
      return NextResponse.json({ error: 'Judul dan tipe wajib diisi' }, { status: 400 });
    }

    const db = getDb();
    const id = uuidv4();

    // harga_coret = original/base price; harga = display (computed from diskon if global, or per-item diskon)
    const baseHargaCoret = harga_coret || harga || 0;
    let finalHarga: number;
    if (is_gratis) {
      finalHarga = 0;
    } else if (diskon_persen && diskon_persen > 0) {
      finalHarga = Math.round(baseHargaCoret * (1 - diskon_persen / 100));
    } else {
      // Use global diskon
      const diskonSetting = db.prepare("SELECT value FROM settings WHERE key = 'diskon_satuan'").get() as any;
      const globalDiskon = parseInt(diskonSetting?.value || '40');
      finalHarga = Math.round(baseHargaCoret * (1 - globalDiskon / 100));
    }

    db.prepare(`
      INSERT INTO materi (id, judul, deskripsi_singkat, konten_lengkap, harga, harga_coret, thumbnail_emoji, level, tipe, is_gratis)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, judul, deskripsi_singkat || '', konten_lengkap || '',
      finalHarga, baseHargaCoret, thumbnail_emoji || '📘',
      level || null, tipe, is_gratis ? 1 : 0
    );

    return NextResponse.json({ success: true, id });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const { id, judul, deskripsi_singkat, konten_lengkap, harga, harga_coret, thumbnail_emoji, level, tipe, is_gratis, diskon_persen } = body;

    if (!id) return NextResponse.json({ error: 'ID wajib' }, { status: 400 });

    const db = getDb();
    const baseHargaCoret = harga_coret || harga || 0;
    let finalHarga: number;
    if (is_gratis) {
      finalHarga = 0;
    } else if (diskon_persen && diskon_persen > 0) {
      finalHarga = Math.round(baseHargaCoret * (1 - diskon_persen / 100));
    } else {
      const diskonSetting = db.prepare("SELECT value FROM settings WHERE key = 'diskon_satuan'").get() as any;
      const globalDiskon = parseInt(diskonSetting?.value || '40');
      finalHarga = Math.round(baseHargaCoret * (1 - globalDiskon / 100));
    }

    db.prepare(`
      UPDATE materi SET judul=?, deskripsi_singkat=?, konten_lengkap=?, harga=?, harga_coret=?,
      thumbnail_emoji=?, level=?, tipe=?, is_gratis=? WHERE id=?
    `).run(
      judul, deskripsi_singkat || '', konten_lengkap || '',
      finalHarga, baseHargaCoret, thumbnail_emoji || '📘',
      level || null, tipe, is_gratis ? 1 : 0, id
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID wajib' }, { status: 400 });

    const db = getDb();
    db.prepare('DELETE FROM materi WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
