import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAdminFromCookies } from '@/lib/auth';

// List all items in recycle bin
export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();
  const items = db.prepare(
    'SELECT * FROM recycle_bin ORDER BY deleted_at DESC'
  ).all() as any[];

  // Parse data_json for display
  const result = items.map((item: any) => {
    const data = JSON.parse(item.data_json);
    return {
      id: item.id,
      original_table: item.original_table,
      original_id: item.original_id,
      data,
      deleted_at: item.deleted_at,
      // Display-friendly summary
      summary: item.original_table === 'users'
        ? `👤 ${data.nama} (${data.email})`
        : item.original_table === 'pendapatan'
          ? `💰 Rp ${(data.jumlah || 0).toLocaleString('id-ID')} — ${data.user_nama || data.user_id || '-'}`
          : item.original_table === 'akses_materi'
            ? `🔑 Akses — ${data.user_nama || data.user_id} → ${data.materi_judul || data.materi_id}`
            : item.original_id,
    };
  });

  return NextResponse.json({ items: result });
}

// Recover an item (POST with action=recover)
export async function POST(request: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { recycle_id } = await request.json();
  if (!recycle_id) return NextResponse.json({ error: 'recycle_id wajib' }, { status: 400 });

  const db = getDb();

  const recycleItem = db.prepare('SELECT * FROM recycle_bin WHERE id = ?').get(recycle_id) as any;
  if (!recycleItem) return NextResponse.json({ error: 'Item tidak ditemukan di recycle bin' }, { status: 404 });

  const data = JSON.parse(recycleItem.data_json);

  if (recycleItem.original_table === 'users') {
    // Recover user first
    db.prepare(
      'INSERT OR IGNORE INTO users (id, nama, email, password, no_telepon, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(data.id, data.nama, data.email, data.password, data.no_telepon || '', data.created_at);

    // Auto-recover all related akses_materi and pendapatan entries from recycle_bin
    const relatedItems = db.prepare(
      `SELECT * FROM recycle_bin WHERE original_table IN ('akses_materi', 'pendapatan')
       AND json_extract(data_json, '$.user_id') = ?`
    ).all(data.id) as any[];

    for (const rel of relatedItems) {
      const relData = JSON.parse(rel.data_json);
      if (rel.original_table === 'akses_materi') {
        db.prepare(
          'INSERT OR IGNORE INTO akses_materi (id, user_id, materi_id, status, tipe_pembelian, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(relData.id, relData.user_id, relData.materi_id, relData.status, relData.tipe_pembelian || 'satuan', relData.created_at);
      } else if (rel.original_table === 'pendapatan') {
        db.prepare(
          'INSERT OR IGNORE INTO pendapatan (id, user_id, materi_id, jumlah, tipe, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(relData.id, relData.user_id, relData.materi_id || null, relData.jumlah, relData.tipe, relData.created_at);
      }
      // Remove related item from recycle_bin
      db.prepare('DELETE FROM recycle_bin WHERE id = ?').run(rel.id);
    }
  } else if (recycleItem.original_table === 'pendapatan') {
    // Recover pendapatan
    db.prepare(
      'INSERT OR IGNORE INTO pendapatan (id, user_id, materi_id, jumlah, tipe, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(data.id, data.user_id, data.materi_id || null, data.jumlah, data.tipe, data.created_at);
  } else if (recycleItem.original_table === 'akses_materi') {
    // Recover akses_materi
    db.prepare(
      'INSERT OR IGNORE INTO akses_materi (id, user_id, materi_id, status, tipe_pembelian, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(data.id, data.user_id, data.materi_id, data.status, data.tipe_pembelian || 'satuan', data.created_at);
  }

  // Remove from recycle bin
  db.prepare('DELETE FROM recycle_bin WHERE id = ?').run(recycle_id);

  return NextResponse.json({ success: true });
}

// Permanently delete an item from recycle bin
export async function DELETE(request: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = getDb();

  // Check if it's a "delete all" request
  const body = await request.json().catch(() => ({}));
  const { recycle_id, hapus_semua } = body;

  if (hapus_semua) {
    const result = db.prepare('DELETE FROM recycle_bin').run();
    return NextResponse.json({ success: true, terhapus: result.changes });
  }

  if (!recycle_id) return NextResponse.json({ error: 'recycle_id wajib' }, { status: 400 });

  db.prepare('DELETE FROM recycle_bin WHERE id = ?').run(recycle_id);

  return NextResponse.json({ success: true });
}
