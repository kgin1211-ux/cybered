'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MateriSayaPage() {
  const router = useRouter();
  const [materi, setMateri] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/materi-saya')
      .then(res => {
        if (res.status === 401) {
          router.push('/login?redirect=/materi-saya');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setMateri(data.materi || []);
        }
      })
      .catch(() => setError('Gagal memuat data'))
      .finally(() => setLoading(false));
  }, [router]);

  const serangan = materi.filter(m => m.tipe === 'serangan');
  const pertahanan = materi.filter(m => m.tipe === 'pertahanan');

  return (
    <>
      <Header />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 56, display: 'block' }} className="animate-bounce-soft">📚</span>
          <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Fredoka One', cursive", margin: '8px 0' }}>
            Materi Saya
          </h1>
          <p style={{ color: '#666', fontSize: 16 }}>
            Materi yang sudah kamu dapatkan aksesnya
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <span className="animate-bounce-soft" style={{ fontSize: 48 }}>⏳</span>
            <p>Memuat...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: 48, color: '#C62828' }}>❌ {error}</div>
        ) : materi.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
            <span style={{ fontSize: 64, display: 'block' }}>🛒</span>
            <h2 style={{ fontWeight: 800, margin: '12px 0' }}>Kamu belum punya materi, yuk belanja!</h2>
            <p style={{ color: '#666', marginBottom: 16 }}>Beli materi serangan atau dapatkan materi pertahanan gratis.</p>
            <Link href="/" className="btn btn-yellow" style={{ textDecoration: 'none', fontSize: 16 }}>
              🔍 Lihat Materi
            </Link>
          </div>
        ) : (
          <>
            {/* Serangan */}
            {serangan.length > 0 && (
              <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⚔️</span> Serangan ({serangan.length})
                </h2>
                <div className="materi-grid">
                  {serangan.map(m => (
                    <Link
                      key={m.id}
                      href={`/materi/${m.id}`}
                      className="card materi-card"
                      style={{ padding: 20, textDecoration: 'none', color: '#333', display: 'flex', flexDirection: 'column', gap: 8 }}
                    >
                      <span style={{ fontSize: 40 }}>{m.thumbnail_emoji}</span>
                      <span className={`badge ${m.level === 'mudah' ? 'badge-green' : m.level === 'menengah' ? 'badge-yellow' : m.level === 'sulit' ? 'badge-orange' : 'badge-red'}`}>
                        {m.level}
                      </span>
                      <h3 style={{ fontWeight: 800, fontSize: 16 }}>{m.judul}</h3>
                      <p style={{ fontSize: 13, color: '#666', lineHeight: 1.4 }}>{m.deskripsi_singkat}</p>
                      <span className="badge badge-green" style={{ alignSelf: 'flex-start' }}>✅ Terbuka</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Pertahanan */}
            {pertahanan.length > 0 && (
              <section>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🛡️</span> Pertahanan ({pertahanan.length})
                </h2>
                <div className="materi-grid">
                  {pertahanan.map(m => (
                    <Link
                      key={m.id}
                      href={`/materi/${m.id}`}
                      className="card materi-card"
                      style={{ padding: 20, textDecoration: 'none', color: '#333', display: 'flex', flexDirection: 'column', gap: 8, border: m.is_gratis ? '2px solid #C8E6C9' : undefined }}
                    >
                      <span style={{ fontSize: 40 }}>{m.thumbnail_emoji}</span>
                      <h3 style={{ fontWeight: 800, fontSize: 16 }}>{m.judul}</h3>
                      <p style={{ fontSize: 13, color: '#666', lineHeight: 1.4 }}>{m.deskripsi_singkat}</p>
                      {m.is_gratis ? (
                        <span className="badge badge-green">🎁 Gratis</span>
                      ) : (
                        <span className="badge badge-green">✅ Terbuka</span>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
