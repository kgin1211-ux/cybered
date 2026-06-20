'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface Materi {
  id: string;
  judul: string;
  deskripsi_singkat: string;
  konten_lengkap: string;
  harga: number;
  harga_coret: number | null;
  thumbnail_emoji: string;
  level: string | null;
  tipe: string;
  is_gratis: boolean;
  created_at: string;
}

interface User {
  id: string;
  nama: string;
  email: string;
  no_telepon: string;
  created_at: string;
}

interface UserAkses {
  id: string;
  judul: string;
  tipe: string;
  harga: number;
  level: string | null;
  thumbnail_emoji: string;
  status_akses: 'terbuka' | 'terkunci';
}

interface PendapatanRecord {
  id: string;
  user_nama: string;
  user_email: string;
  materi_judul: string;
  jumlah: number;
  tipe: string;
  created_at: string;
}

type Tab = 'materi' | 'users' | 'pendapatan' | 'recycle';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('materi');
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check admin auth
  useEffect(() => {
    fetch('/api/admin/pendapatan')
      .then(res => {
        if (res.status === 401) {
          router.push('/admin/login');
        } else {
          setAuth(true);
        }
      })
      .catch(() => router.push('/admin/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FFFEF7' }}>
        <span className="animate-bounce-soft" style={{ fontSize: 48 }}>⏳</span>
      </main>
    );
  }

  if (!auth) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#FFFEF7', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'white', borderRight: '1px solid rgba(0,0,0,0.05)',
        padding: '20px 12px', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 36 }}>⚙️</span>
          <h2 style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Fredoka One', cursive", margin: '4px 0' }}>Admin CyberEd</h2>
        </div>

        <nav className="admin-sidebar" style={{ flex: 1 }}>
          {[
            { tab: 'materi' as Tab, label: '📖 Materi', icon: '📖' },
            { tab: 'users' as Tab, label: '👥 User & Izin', icon: '👥' },
            { tab: 'pendapatan' as Tab, label: '💰 Pendapatan', icon: '💰' },
            { tab: 'recycle' as Tab, label: '🗑️ Recycle Bin', icon: '🗑️' },
          ].map(item => (
            <a
              key={item.tab}
              href="#"
              onClick={e => { e.preventDefault(); setActiveTab(item.tab); }}
              className={activeTab === item.tab ? 'active' : ''}
              style={{ textDecoration: 'none', color: '#333' }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button className="btn btn-red" onClick={handleLogout} style={{ fontSize: 13, width: '100%' }}>
          🚪 Keluar
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: 24, overflowY: 'auto', maxHeight: '100vh' }}>
        {activeTab === 'materi' && <AdminMateriTab />}
        {activeTab === 'users' && <AdminUsersTab />}
        {activeTab === 'pendapatan' && <AdminPendapatanTab />}
        {activeTab === 'recycle' && <AdminRecycleBinTab />}
      </main>
    </div>
  );
}

/* ================== MATERI TAB ================== */
function AdminMateriTab() {
  const [materi, setMateri] = useState<Materi[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Materi | null>(null);
  const [form, setForm] = useState({
    judul: '', deskripsi_singkat: '', konten_lengkap: '', harga: 0, harga_coret: 0,
    thumbnail_emoji: '📘', level: '', tipe: 'serangan', is_gratis: false, diskon_persen: 0,
  });

  const fetchMateri = useCallback(async () => {
    const res = await fetch('/api/admin/materi');
    const data = await res.json();
    setMateri(data.materi || []);
  }, []);

  useEffect(() => { fetchMateri(); }, [fetchMateri]);

  const handleSave = async () => {
    const url = '/api/admin/materi';
    const method = editing ? 'PUT' : 'POST';
    const body: any = { ...form, harga_coret: form.harga_coret || null, level: form.level || null };
    if (editing) body.id = editing.id;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setShowForm(false);
    setEditing(null);
    fetchMateri();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus materi ini?')) return;
    await fetch('/api/admin/materi', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchMateri();
  };

  const startEdit = (m: Materi) => {
    setEditing(m);
    setForm({
      judul: m.judul, deskripsi_singkat: m.deskripsi_singkat, konten_lengkap: m.konten_lengkap,
      harga: m.harga, harga_coret: m.harga_coret || 0, thumbnail_emoji: m.thumbnail_emoji,
      level: m.level || '', tipe: m.tipe, is_gratis: m.is_gratis, diskon_persen: 0,
    });
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>📖 Daftar Materi ({materi.length})</h2>
        <button className="btn btn-blue" onClick={() => { setEditing(null); setForm({
          judul: '', deskripsi_singkat: '', konten_lengkap: '', harga: 0, harga_coret: 0,
          thumbnail_emoji: '📘', level: '', tipe: 'serangan', is_gratis: false, diskon_persen: 0,
        }); setShowForm(true); }}>
          ➕ Tambah Materi Baru
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>
            {editing ? '✏️ Edit Materi' : '➕ Tambah Materi Baru'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Judul *</label>
              <input className="input" value={form.judul} onChange={e => setForm({ ...form, judul: e.target.value })} />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Thumbnail Emoji</label>
              <input className="input" value={form.thumbnail_emoji} onChange={e => setForm({ ...form, thumbnail_emoji: e.target.value })} />
            </div>
            <div className="" style={{ gridColumn: 'span 2' }}>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Deskripsi Singkat</label>
              <input className="input" value={form.deskripsi_singkat} onChange={e => setForm({ ...form, deskripsi_singkat: e.target.value })} />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Harga Coret (Rp)</label>
              <input className="input" type="number" value={form.harga_coret} onChange={e => setForm({ ...form, harga_coret: +e.target.value })} />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Diskon (%)</label>
              <input className="input" type="number" value={form.diskon_persen} onChange={e => setForm({ ...form, diskon_persen: +e.target.value })} />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Harga Final (dihitung otomatis jika diskon ada)</label>
              <input className="input" type="number" value={form.harga} onChange={e => setForm({ ...form, harga: +e.target.value })} />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Tipe *</label>
              <select className="input" value={form.tipe} onChange={e => setForm({ ...form, tipe: e.target.value })}>
                <option value="serangan">Serangan</option>
                <option value="pertahanan">Pertahanan</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Level</label>
              <select className="input" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                <option value="">-</option>
                <option value="mudah">Mudah</option>
                <option value="menengah">Menengah</option>
                <option value="sulit">Sulit</option>
                <option value="sangat_sulit">Sangat Sulit</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.is_gratis} onChange={e => setForm({ ...form, is_gratis: e.target.checked })} style={{ width: 20, height: 20 }} />
              <label style={{ fontWeight: 700, fontSize: 13 }}>Gratis</label>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Konten Lengkap (HTML)</label>
              {typeof window !== 'undefined' ? (
                <div style={{ background: '#fff', borderRadius: 12, minHeight: 300 }}>
                  <ReactQuill
                    theme="snow"
                    value={form.konten_lengkap}
                    onChange={(val) => setForm({ ...form, konten_lengkap: val })}
                    style={{ minHeight: 250, marginBottom: 8 }}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['blockquote', 'code-block'],
                        ['link'],
                        ['clean']
                      ]
                    }}
                  />
                </div>
              ) : (
                <textarea
                  className="input"
                  value={form.konten_lengkap}
                  onChange={e => setForm({ ...form, konten_lengkap: e.target.value })}
                  rows={8}
                  style={{ fontFamily: 'monospace', fontSize: 13 }}
                />
              )}
              <p style={{ fontSize: 11, color: '#999', margin: '4px 0 0' }}>Rich text editor untuk formatting konten materi.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="btn btn-green" onClick={handleSave}>💾 Simpan</button>
            <button className="btn" style={{ background: '#eee' }} onClick={() => { setShowForm(false); setEditing(null); }}>Batal</button>
          </div>
        </div>
      )}

      {/* Materi table */}
      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#BBDEFB', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', borderRadius: '18px 0 0 0' }}>Emoji</th>
              <th style={{ padding: '10px 12px' }}>Judul</th>
              <th style={{ padding: '10px 12px' }}>Tipe</th>
              <th style={{ padding: '10px 12px' }}>Level</th>
              <th style={{ padding: '10px 12px' }}>Harga (Setelah Diskon)</th>
              <th style={{ padding: '10px 12px' }}>Gratis</th>
              <th style={{ padding: '10px 12px', borderRadius: '0 18px 0 0' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {materi.map((m, i) => (
              <tr key={m.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '10px 12px', fontSize: 20 }}>{m.thumbnail_emoji}</td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{m.judul}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span className={`badge ${m.tipe === 'serangan' ? 'badge-red' : m.tipe === 'pertahanan' ? 'badge-blue' : 'badge-green'}`}>{m.tipe}</span>
                </td>
                <td style={{ padding: '10px 12px' }}>{m.level || '-'}</td>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>
                  {m.is_gratis ? 'Gratis' : 'Rp ' + (((m as any).harga_display ?? m.harga) as number).toLocaleString('id-ID')}
                </td>
                <td style={{ padding: '10px 12px' }}>{m.is_gratis ? '✅' : '❌'}</td>
                <td style={{ padding: '10px 12px', display: 'flex', gap: 6 }}>
                  <button className="btn btn-blue" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => startEdit(m)}>Edit</button>
                  <button className="btn btn-red" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => handleDelete(m.id)}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {materi.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>Belum ada materi</div>
        )}
      </div>
    </div>
  );
}

/* ================== USERS TAB ================== */
function AdminUsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [aksesData, setAksesData] = useState<UserAkses[]>([]);
  const [diskonSatuan, setDiskonSatuan] = useState(40);
  const [hargaBundelCoret, setHargaBundelCoret] = useState(300000);
  const [diskonBundel, setDiskonBundel] = useState(0);

  const fetchUsers = useCallback(async (q = '') => {
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setUsers(data.users || []);
  }, []);

  const fetchAkses = useCallback(async (userId: string) => {
    const res = await fetch(`/api/admin/users/${userId}/akses`);
    const data = await res.json();
    setAksesData(data.materi || []);
  }, []);

  const fetchSettings = useCallback(async () => {
    const res = await fetch('/api/admin/diskon');
    const data = await res.json();
    setDiskonSatuan(data.diskon_satuan);
    setHargaBundelCoret(data.harga_bundel_coret);
    setDiskonBundel(data.diskon_bundel);
  }, []);

  useEffect(() => { fetchUsers(); fetchSettings(); }, [fetchUsers, fetchSettings]);

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(search), 300);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  const handleSelectUser = (userId: string) => {
    setSelectedUser(userId);
    fetchAkses(userId);
  };

  const handleToggleAkses = async (userId: string, materiId: string) => {
    await fetch(`/api/admin/users/${userId}/akses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materi_id: materiId }),
    });
    fetchAkses(userId);
  };

  const handleBukaSemua = async (userId: string) => {
    await fetch('/api/admin/users/buka-semua', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    fetchAkses(userId);
    alert('Semua akses dibuka untuk user ini! ✅');
  };

  const handleTutupSemua = async (userId: string) => {
    if (!confirm('Tutup SEMUA akses user ini? User tidak bisa mengakses materi apapun lagi.')) return;
    await fetch('/api/admin/users/tutup-semua', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    fetchAkses(userId);
    alert('Semua akses ditutup! 🔒');
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Hapus user ini? Data akan masuk ke Recycle Bin dan bisa direcovery.')) return;
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId }),
    });
    setSelectedUser(null);
    setAksesData([]);
    fetchUsers(search);
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>👥 Manajemen User & Izin</h2>

      {/* Settings: Diskon Satuan, Harga Bundel Coret, Diskon Bundel */}
      <div className="card" style={{ padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>💎 Diskon Satuan (%):</span>
          <input
            className="input"
            type="number"
            value={diskonSatuan}
            onChange={e => setDiskonSatuan(+e.target.value)}
            style={{ width: 80 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>🎁 Harga Asli Bundel (Rp):</span>
          <input
            className="input"
            type="number"
            value={hargaBundelCoret}
            onChange={e => setHargaBundelCoret(+e.target.value)}
            style={{ width: 140 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>🎁 Diskon Bundel (%):</span>
          <input
            className="input"
            type="number"
            value={diskonBundel}
            onChange={e => setDiskonBundel(+e.target.value)}
            style={{ width: 80 }}
          />
        </div>
        <span style={{ fontSize: 11, color: '#666' }}>
          Final: Rp {Math.round(hargaBundelCoret * (1 - diskonBundel / 100)).toLocaleString('id-ID')}
        </span>
        <button
          className="btn btn-blue"
          style={{ fontSize: 13 }}
          onClick={async () => {
            await fetch('/api/admin/diskon', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ diskon_satuan: diskonSatuan, harga_bundel_coret: hargaBundelCoret, diskon_bundel: diskonBundel }),
            });
            alert('Pengaturan disimpan! ✅');
          }}
        >
          💾 Simpan
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          className="input"
          type="text"
          placeholder="🔍 Cari user (nama/email)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Users table */}
      <div className="card" style={{ overflow: 'auto', marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#BBDEFB', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px' }}>Nama</th>
              <th style={{ padding: '10px 12px' }}>Email</th>
              <th style={{ padding: '10px 12px' }}>No. HP</th>
              <th style={{ padding: '10px 12px' }}>Tanggal Daftar</th>
              <th style={{ padding: '10px 12px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{
                borderBottom: '1px solid #f0f0f0',
                background: selectedUser === u.id ? '#E3F2FD' : (i % 2 === 0 ? '#fff' : '#fafafa'),
                cursor: 'pointer'
              }}>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{u.nama}</td>
                <td style={{ padding: '10px 12px' }}>{u.email}</td>
                <td style={{ padding: '10px 12px' }}>{u.no_telepon}</td>
                <td style={{ padding: '10px 12px' }}>{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                <td style={{ padding: '10px 12px' }}>
                  <button
                    className="btn btn-blue"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => handleSelectUser(u.id)}
                  >
                    🔑 Kelola Izin
                  </button>
                  <button
                    className="btn btn-red"
                    style={{ padding: '6px 12px', fontSize: 12, marginLeft: 6 }}
                    onClick={() => handleDeleteUser(u.id)}
                  >
                    🗑️ Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Access panel */}
      {selectedUser && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 800, fontSize: 18 }}>🔑 Izin Akses Materi</h3>
            <button className="btn btn-green" onClick={() => handleBukaSemua(selectedUser!)} style={{ fontSize: 13 }}>
              🔓 Buka Semua
            </button>
            <button className="btn btn-red" onClick={() => handleTutupSemua(selectedUser!)} style={{ fontSize: 13 }}>
              🔒 Tutup Semua
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {aksesData.map((m) => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: 10,
                background: '#fafafa', borderRadius: 12, justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 24 }}>{m.thumbnail_emoji}</span>
                  <div>
                    <strong>{m.judul}</strong>
                    <span style={{ fontSize: 12, color: '#666', marginLeft: 8 }}>
                      {m.tipe === 'serangan' ? '⚔️' : m.tipe === 'pertahanan' ? '🛡️' : '📚'} {m.level || '-'}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Rp {((m as any).harga_display ?? m.harga).toLocaleString('id-ID')}</span>
                  <button
                    onClick={() => handleToggleAkses(selectedUser!, m.id)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', fontSize: 24,
                      padding: 4, borderRadius: 8, transition: 'all 0.2s'
                    }}
                    title={m.status_akses === 'terbuka' ? 'Kunci' : 'Buka'}
                  >
                    {m.status_akses === 'terbuka' ? '🔓' : '🔒'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================== PENDAPATAN TAB ================== */
function AdminPendapatanTab() {
  const [pendapatan, setPendapatan] = useState<PendapatanRecord[]>([]);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/admin/pendapatan');
    const data = await res.json();
    setPendapatan(data.pendapatan || []);
    setTotal(data.total || 0);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeletePendapatan = async (id: string) => {
    if (!confirm('Hapus pendapatan ini? Data akan masuk ke Recycle Bin dan total pendapatan berkurang.')) return;
    const res = await fetch('/api/admin/pendapatan', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.success) {
      setTotal(data.total);
      fetchData();
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>💰 Dashboard Pendapatan</h2>

      {/* Total card */}
      <div className="card" style={{ padding: 32, textAlign: 'center', marginBottom: 24, background: 'linear-gradient(135deg, #FFF9C4, #C8E6C9)' }}>
        <span style={{ fontSize: 48 }}>💰</span>
        <h1 style={{ fontSize: 36, fontWeight: 800, fontFamily: "'Fredoka One', cursive", margin: '8px 0' }}>
          Rp {total.toLocaleString('id-ID')}
        </h1>
        <p style={{ color: '#666', fontWeight: 600 }}>Total Pendapatan</p>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#BBDEFB', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', borderRadius: '18px 0 0 0' }}>User</th>
              <th style={{ padding: '10px 12px' }}>Materi</th>
              <th style={{ padding: '10px 12px' }}>Tipe</th>
              <th style={{ padding: '10px 12px' }}>Jumlah</th>
              <th style={{ padding: '10px 12px' }}>Tanggal</th>
              <th style={{ padding: '10px 12px', borderRadius: '0 18px 0 0' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pendapatan.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ fontWeight: 600 }}>{p.user_nama}</span>
                  <br />
                  <span style={{ fontSize: 11, color: '#999' }}>{p.user_email}</span>
                </td>
                <td style={{ padding: '10px 12px' }}>{p.materi_judul}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span className={`badge ${p.tipe === 'semua' ? 'badge-yellow' : 'badge-blue'}`}>
                    {p.tipe === 'semua' ? '🎁 Semua' : '📦 Satuan'}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', fontWeight: 700 }}>Rp {p.jumlah.toLocaleString('id-ID')}</td>
                <td style={{ padding: '10px 12px' }}>{new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td style={{ padding: '10px 12px' }}>
                  <button
                    className="btn btn-red"
                    style={{ padding: '4px 10px', fontSize: 11 }}
                    onClick={() => handleDeletePendapatan(p.id)}
                  >
                    🗑️ Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pendapatan.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>
            <span style={{ fontSize: 48, display: 'block' }}>📭</span>
            Belum ada pendapatan tercatat
          </div>
        )}
      </div>
    </div>
  );
}

/* ================== RECYCLE BIN TAB ================== */
function AdminRecycleBinTab() {
  const [items, setItems] = useState<any[]>([]);

  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/admin/recycle-bin');
    const data = await res.json();
    setItems(data.items || []);
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleRecover = async (recycleId: string) => {
    if (!confirm('Recover item ini dari Recycle Bin?')) return;
    await fetch('/api/admin/recycle-bin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recycle_id: recycleId }),
    });
    fetchItems();
  };

  const handlePermanentDelete = async (recycleId: string) => {
    if (!confirm('HAPUS PERMANEN item ini? Data tidak bisa dikembalikan!')) return;
    await fetch('/api/admin/recycle-bin', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recycle_id: recycleId }),
    });
    fetchItems();
  };

  const handleHapusSemua = async () => {
    if (!confirm('⚠️ HAPUS PERMANEN SEMUA item di Recycle Bin? Data TIDAK BISA dikembalikan!')) return;
    const res = await fetch('/api/admin/recycle-bin', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hapus_semua: true }),
    });
    const data = await res.json();
    alert(`Semua item dihapus permanen! (${data.terhapus} item)`);
    fetchItems();
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>🗑️ Recycle Bin — Penyimpanan Sementara</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
          Data yang dihapus dari User &amp; Pendapatan masuk ke sini. Kamu bisa recover atau hapus permanen.
        </p>
        {items.length > 0 && (
          <button
            className="btn btn-red"
            style={{ fontSize: 13, padding: '8px 16px' }}
            onClick={handleHapusSemua}
          >
            ❌ Hapus Semua
          </button>
        )}
      </div>

      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FFE0B2', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', borderRadius: '18px 0 0 0' }}>Tipe</th>
              <th style={{ padding: '10px 12px' }}>Ringkasan</th>
              <th style={{ padding: '10px 12px' }}>Dihapus Pada</th>
              <th style={{ padding: '10px 12px', borderRadius: '0 18px 0 0' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '10px 12px' }}>
                  <span className={`badge ${item.original_table === 'users' ? 'badge-blue' : 'badge-yellow'}`}>
                    {item.original_table === 'users' ? '👤 User' : '💰 Pendapatan'}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', fontWeight: 600 }}>{item.summary}</td>
                <td style={{ padding: '10px 12px', fontSize: 12, color: '#666' }}>
                  {new Date(item.deleted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ padding: '10px 12px', display: 'flex', gap: 6 }}>
                  <button
                    className="btn btn-green"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => handleRecover(item.id)}
                  >
                    ↩️ Recovery
                  </button>
                  <button
                    className="btn btn-red"
                    style={{ padding: '6px 12px', fontSize: 12 }}
                    onClick={() => handlePermanentDelete(item.id)}
                  >
                    ❌ Hapus Permanen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: '#999' }}>
            <span style={{ fontSize: 48, display: 'block' }}>🗑️</span>
            <p style={{ fontWeight: 600, fontSize: 16 }}>Recycle Bin kosong</p>
            <p style={{ fontSize: 13 }}>Data yang dihapus akan muncul di sini</p>
          </div>
        )}
      </div>
    </div>
  );
}
