'use client';

import Link from 'next/link';

interface MateriProps {
  materi: {
    id: string;
    judul: string;
    deskripsi_singkat: string;
    harga: number;
    harga_coret: number | null;
    thumbnail_emoji: string;
    level: string | null;
    tipe: string;
    is_gratis: boolean;
  };
  user: { id: string } | null;
  accessStatus: 'gratis' | 'terbuka' | 'terkunci' | 'menunggu' | 'login_dulu';
  onBuy: () => void;
}

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function levelBadge(level: string | null) {
  if (!level) return null;
  const map: Record<string, { label: string; cls: string }> = {
    mudah: { label: '🟢 Mudah', cls: 'badge-green' },
    menengah: { label: '🟡 Menengah', cls: 'badge-yellow' },
    sulit: { label: '🟠 Sulit', cls: 'badge-orange' },
    sangat_sulit: { label: '🔴 Sangat Sulit', cls: 'badge-red' },
  };
  const b = map[level] || { label: level, cls: 'badge-blue' };
  return <span className={`badge ${b.cls}`}>{b.label}</span>;
}

export default function MateriCard({ materi, user, accessStatus, onBuy }: MateriProps) {
  return (
    <div className="card materi-card" style={{
      padding: 24, display: 'flex', flexDirection: 'column', gap: 12,
      border: materi.is_gratis ? '2px solid #C8E6C9' : undefined,
      transition: 'all 0.2s'
    }}>
      {/* Emoji & Type badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 48 }}>{materi.thumbnail_emoji}</span>
        <span className={`badge ${materi.tipe === 'serangan' ? 'badge-red' : 'badge-blue'}`}>
          {materi.tipe === 'serangan' ? '⚔️ Serangan' : '🛡️ Pertahanan'}
        </span>
      </div>

      {/* Level badge */}
      <div>{levelBadge(materi.level)}</div>

      {/* Title */}
      <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#333' }}>
        {materi.judul}
      </h3>

      {/* Description */}
      <p style={{ fontSize: 14, color: '#666', margin: 0, lineHeight: 1.5, flex: 1 }}>
        {materi.deskripsi_singkat || 'Materi cybersecurity lengkap dengan langkah detail.'}
      </p>

      {/* Price */}
      <div>
        {materi.is_gratis ? (
          <span style={{ fontSize: 20, fontWeight: 800, color: '#2E7D32' }}>GRATIS</span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {materi.harga_coret && (
              <span className="price-coret">{formatRp(materi.harga_coret)}</span>
            )}
            <span className="price-asli">{formatRp(materi.harga)}</span>
          </div>
        )}
      </div>

      {/* Action button */}
      <div style={{ marginTop: 4 }}>
        {accessStatus === 'login_dulu' && (
          <Link href="/login" className="btn btn-blue" style={{ width: '100%', textDecoration: 'none' }}>
            🔑 Login Dulu
          </Link>
        )}
        {accessStatus === 'gratis' && (
          <Link href={`/materi/${materi.id}`} className="btn btn-green" style={{ width: '100%', textDecoration: 'none' }}>
            📖 Akses Gratis
          </Link>
        )}
        {accessStatus === 'terbuka' && (
          <Link href={`/materi/${materi.id}`} className="btn btn-blue" style={{ width: '100%', textDecoration: 'none' }}>
            📖 Baca Materi
          </Link>
        )}
        {accessStatus === 'terkunci' && (
          <button className="btn btn-yellow" style={{ width: '100%' }} onClick={onBuy}>
            🛒 Beli Materi Ini
          </button>
        )}
      </div>
    </div>
  );
}
