'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MateriCard from '@/components/MateriCard';
import CheckoutModal from '@/components/CheckoutModal';

interface Materi {
  id: string;
  judul: string;
  deskripsi_singkat: string;
  harga: number;
  harga_coret: number | null;
  thumbnail_emoji: string;
  level: string | null;
  tipe: string;
  is_gratis: boolean;
  user_akses_status: number | null;
}

interface User {
  id: string;
  nama: string;
  email: string;
  no_telepon: string;
}

interface BundleInfo {
  hargaCoret: number;
  harga: number;
}

export default function HomePage() {
  const [materi, setMateri] = useState<Materi[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState<{ materi: Materi; isAll: boolean } | null>(null);
  const [filter, setFilter] = useState<'semua' | 'serangan' | 'pertahanan' | 'lainnya' | 'gratis'>('semua');
  const [hasBundle, setHasBundle] = useState(false);
  const [bundleInfo, setBundleInfo] = useState<BundleInfo>({ hargaCoret: 300000, harga: 180000 });

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/materi');
      const data = await res.json();
      setMateri(data.materi || []);
      setUser(data.user);
      setHasBundle(data.hasBundle || false);
      if (data.bundleInfo) setBundleInfo(data.bundleInfo);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredMateri = materi.filter(m => {
    if (filter === 'serangan') return m.tipe === 'serangan';
    if (filter === 'pertahanan') return m.tipe === 'pertahanan';
    if (filter === 'lainnya') return m.tipe === 'lainnya';
    if (filter === 'gratis') return m.is_gratis;
    return true;
  });

  const canAccess = (m: Materi) => {
    if (!user) return 'login_dulu';
    if (m.is_gratis) return 'gratis';
    if (m.user_akses_status === 1) return 'terbuka';
    // status=0 (terkunci) atau null (belum ada akses) → tampilkan harga + tombol beli
    return 'terkunci';
  };

  return (
    <>
      <Header />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        {/* Hero Section */}
        <section className="hero-section" style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <span className="animate-bounce-soft" style={{ fontSize: 80 }}>🦊</span>
            <span className="animate-bounce-soft" style={{ fontSize: 80, animationDelay: '0.3s' }}>🛡️</span>
            <span className="animate-bounce-soft" style={{ fontSize: 80, animationDelay: '0.6s' }}>🐱</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800,
            fontFamily: "'Fredoka One', cursive", color: '#333',
            lineHeight: 1.3, margin: '0 0 12px'
          }}>
            Kuasai Cyber Security dari Dasar<br />sampai Teknik Paling Dalam
          </h1>
          <p style={{ fontSize: 18, color: '#666', marginBottom: 24, maxWidth: 600, margin: '0 auto 24px' }}>
            Pelajari serangan dan pertahanan cybersecurity dengan materi super detail, 
            langkah demi langkah, oleh para profesional.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#materi" className="btn btn-blue" style={{ fontSize: 16, textDecoration: 'none' }}>
              📖 Lihat Materi
            </a>
            {!hasBundle && (
              <button
                className="btn btn-yellow"
                style={{ fontSize: 16 }}
                onClick={() => {
                  if (!user) {
                    window.location.href = '/login';
                    return;
                  }
                  setShowCheckout({ materi: { id: 'all', judul: '', deskripsi_singkat: '', harga: bundleInfo.harga, harga_coret: bundleInfo.hargaCoret, thumbnail_emoji: '🎁', level: null, tipe: 'pertahanan', is_gratis: false, user_akses_status: null }, isAll: true });
                }}
              >
                🎁 Beli Semua Materi
              </button>
            )}
            {hasBundle && (
              <span className="badge badge-green" style={{ fontSize: 16, padding: '10px 20px' }}>
                ✅ Kamu sudah punya semua materi!
              </span>
            )}
          </div>
        </section>

        {/* Filter tabs */}
        <div id="materi" style={{ margin: '32px 0 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['semua', 'serangan', 'pertahanan', 'lainnya', 'gratis'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 20px', borderRadius: 18, border: '2px solid #e0e0e0',
                background: filter === f ? '#BBDEFB' : 'white',
                fontWeight: 700, cursor: 'pointer', fontSize: 14,
                fontFamily: "'Nunito', sans-serif",
                transition: 'all 0.2s'
              }}
            >
              {f === 'semua' ? '📋 Semua' : f === 'serangan' ? '⚔️ Serangan' : f === 'pertahanan' ? '🛡️ Pertahanan' : f === 'lainnya' ? '📚 Lainnya' : '🎁 Gratis'}
            </button>
          ))}
        </div>

        {/* Beli Semua Card Special — hidden if user already has bundle */}
        {!hasBundle && (
        <div className="card" style={{
          marginBottom: 24, padding: 24, display: 'flex', alignItems: 'center',
          gap: 20, flexWrap: 'wrap', border: '3px solid #FFF9C4'
        }}>
          <span style={{ fontSize: 48 }}>🎁</span>
          <div style={{ flex: 1 }}>
            <span className="badge badge-orange">💎 HEMAT {Math.round((1 - bundleInfo.harga / bundleInfo.hargaCoret) * 100)}%</span>
            <h3 style={{ fontSize: 20, fontWeight: 800, margin: '8px 0' }}>Beli Semua Materi (Paket Lengkap)</h3>
            <p style={{ color: '#666', fontSize: 14 }}>Akses semua materi serangan, pertahanan &amp; lainnya sekaligus dengan harga super hemat!</p>
            <div style={{ marginTop: 8 }}>
              <span className="price-coret">Rp {bundleInfo.hargaCoret.toLocaleString('id-ID')}</span>
              {' '}
              <span className="price-asli">Rp {bundleInfo.harga.toLocaleString('id-ID')}</span>
            </div>
          </div>
          <button
            className="btn btn-yellow"
            style={{ fontSize: 16, padding: '12px 28px' }}
            onClick={() => {
              if (!user) { window.location.href = '/login'; return; }
              setShowCheckout({ materi: { id: 'all', judul: '', deskripsi_singkat: '', harga: bundleInfo.harga, harga_coret: bundleInfo.hargaCoret, thumbnail_emoji: '🎁', level: null, tipe: 'pertahanan', is_gratis: false, user_akses_status: null }, isAll: true });
            }}
          >
            🛒 Beli Semua Materi
          </button>
        </div>
        )}

        {/* Materi Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <span style={{ fontSize: 48 }} className="animate-bounce-soft">⏳</span>
            <p>Memuat materi...</p>
          </div>
        ) : filteredMateri.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
            <span style={{ fontSize: 48 }}>📭</span>
            <p>Belum ada materi di kategori ini</p>
          </div>
        ) : (
          <div className="materi-grid">
            {filteredMateri.map(m => (
              <MateriCard
                key={m.id}
                materi={m}
                user={user}
                accessStatus={canAccess(m)}
                onBuy={() => setShowCheckout({ materi: m, isAll: false })}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* Checkout modal */}
      {showCheckout && (
        <CheckoutModal
          materi={showCheckout.materi}
          isAll={showCheckout.isAll}
          user={user ? { nama: user.nama, no_telepon: user.no_telepon } : null}
          onClose={() => setShowCheckout(null)}
        />
      )}
    </>
  );
}
