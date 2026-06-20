'use client';

import { useState, useRef } from 'react';

interface CheckoutModalProps {
  materi: {
    id: string;
    judul: string;
    thumbnail_emoji: string;
    harga: number;
    harga_coret: number | null;
  };
  isAll: boolean;
  user: { nama: string; no_telepon: string } | null;
  onClose: () => void;
}

function formatRp(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

export default function CheckoutModal({ materi, isAll, user, onClose }: CheckoutModalProps) {
  const [nama, setNama] = useState(user?.nama || '');
  const [noTelp, setNoTelp] = useState(user?.no_telepon || '');
  const [setuju, setSetuju] = useState(false);
  const [sent, setSent] = useState(false);
  const waLinkRef = useRef<HTMLAnchorElement>(null);

  const title = isAll ? 'SEMUA MATERI' : materi.judul;
  const harga = materi.harga;

  const waText = `Halo admin CyberEd!\n\n` +
    `Saya ingin membeli: ${isAll ? 'Paket Lengkap (Semua Materi)' : materi.judul}\n` +
    `Nama: ${nama}\n` +
    `No. Telp: ${noTelp}\n` +
    `Harga: ${formatRp(harga)}\n\n` +
    `Mohon dibukakan aksesnya ya. Terima kasih! 🙏`;

  const waUrl = `https://wa.me/6285123161583?text=${encodeURIComponent(waText)}`;

  const handleSendWA = () => {
    if (!setuju) return;
    // Buka WhatsApp di tab baru — halaman ini tetap stay
    if (waLinkRef.current) {
      waLinkRef.current.click();
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
          <span className="animate-bounce-soft" style={{ fontSize: 80, display: 'block' }}>✅</span>
          <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Fredoka One', cursive", margin: '16px 0' }}>
            Pesan Terkirim! 🎉
          </h2>
          <p style={{ fontSize: 16, color: '#666', lineHeight: 1.6 }}>
            Admin akan segera membuka akses untukmu.<br />
            Cek WhatsApp kamu ya!
          </p>
          <button className="btn btn-blue" onClick={onClose} style={{ marginTop: 20, fontSize: 16 }}>
            👌 Oke, Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: 48 }}>{isAll ? '🎁' : materi.thumbnail_emoji}</span>
          <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Fredoka One', cursive", margin: '8px 0' }}>
            Checkout {isAll ? 'Paket Lengkap' : 'Materi'}
          </h2>
          <p style={{ fontSize: 16, color: '#333', fontWeight: 600 }}>
            {isAll ? 'Semua Materi (Paket Lengkap)' : materi.judul}
          </p>
          <div style={{ marginTop: 8 }}>
            {materi.harga_coret && (
              <span className="price-coret" style={{ marginRight: 8 }}>{formatRp(materi.harga_coret)}</span>
            )}
            <span className="price-asli">{formatRp(harga)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'block' }}>Nama</label>
            <input className="input" value={nama} onChange={e => setNama(e.target.value)} placeholder="Nama kamu" />
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, display: 'block' }}>Nomor Telepon/WA</label>
            <input className="input" value={noTelp} onChange={e => setNoTelp(e.target.value)} placeholder="08xxxxxxxxxx" />
          </div>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={setuju}
              onChange={e => setSetuju(e.target.checked)}
              style={{ width: 20, height: 20, marginTop: 2, accentColor: '#1565C0' }}
            />
            <span>
              Saya setuju dan ingin membeli{' '}
              <strong>{isAll ? 'SEMUA MATERI' : '"' + materi.judul + '"'}</strong>
            </span>
          </label>
          {/* Hidden anchor for reliable new-tab WhatsApp opening */}
          <a
            ref={waLinkRef}
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'none' }}
          >
            WA Link
          </a>
          <button
            className="btn btn-blue"
            disabled={!setuju || !nama || !noTelp}
            onClick={handleSendWA}
            style={{
              fontSize: 16, padding: '14px', width: '100%',
              opacity: setuju && nama && noTelp ? 1 : 0.5,
              background: '#25D366'
            }}
          >
            💬 Beli via WhatsApp
          </button>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#999',
            cursor: 'pointer', fontSize: 14, fontWeight: 600
          }}>
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
