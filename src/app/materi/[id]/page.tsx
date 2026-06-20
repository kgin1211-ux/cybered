'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BacaMateriPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [materi, setMateri] = useState<any>(null);
  const [canAccess, setCanAccess] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/materi/${id}`)
      .then(res => res.json())
      .then(data => {
        setMateri(data.materi);
        setCanAccess(data.canAccess);
        setNeedLogin(!data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // If not allowed, redirect with proper message
  useEffect(() => {
    if (!loading && !canAccess) {
      if (needLogin) {
        alert('Silakan login terlebih dahulu untuk mengakses materi ini. Gratis kok, tinggal daftar! 📝');
        router.push('/login?redirect=' + encodeURIComponent('/materi/' + id));
      } else {
        alert('Akses ditolak. Materi ini belum dibuka oleh admin. Silakan beli dulu atau tunggu admin membuka akses. ⏳');
        router.push('/');
      }
    }
  }, [loading, canAccess, needLogin, router, id]);

  if (loading) {
    return (
      <>
        <Header />
        <main style={{ textAlign: 'center', padding: 80 }}>
          <span className="animate-bounce-soft" style={{ fontSize: 48 }}>⏳</span>
          <p>Memuat materi...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!materi || !canAccess) return null;

  return (
    <>
      <Header />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: 20, display: 'flex', gap: 8, fontSize: 14 }}>
          <Link href="/" style={{ color: '#1565C0', textDecoration: 'none', fontWeight: 600 }}>Beranda</Link>
          <span>/</span>
          <Link href="/materi-saya" style={{ color: '#1565C0', textDecoration: 'none', fontWeight: 600 }}>Materi Saya</Link>
          <span>/</span>
          <span style={{ color: '#666' }}>{materi.judul}</span>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{ fontSize: 64, display: 'block' }}>{materi.thumbnail_emoji}</span>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
              <span className={`badge ${materi.tipe === 'serangan' ? 'badge-red' : 'badge-blue'}`}>
                {materi.tipe === 'serangan' ? '⚔️ Serangan' : '🛡️ Pertahanan'}
              </span>
              {materi.level && (
                <span className={`badge ${materi.level === 'mudah' ? 'badge-green' : materi.level === 'menengah' ? 'badge-yellow' : materi.level === 'sulit' ? 'badge-orange' : 'badge-red'}`}>
                  {materi.level}
                </span>
              )}
              {materi.is_gratis && <span className="badge badge-green">🎁 Gratis</span>}
            </div>
            <h1 style={{ fontSize: 'clamp(20px, 3vw, 30px)', fontWeight: 800, margin: '16px 0 8px', fontFamily: "'Fredoka One', cursive" }}>
              {materi.judul}
            </h1>
            <p style={{ color: '#666', fontSize: 16 }}>{materi.deskripsi_singkat}</p>
          </div>

          <hr style={{ border: 'none', borderTop: '2px solid #e0e0e0', margin: '24px 0' }} />

          {/* Content */}
          <div className="konten-materi" dangerouslySetInnerHTML={{ __html: materi.konten_lengkap }} />

          {/* Warning */}
          {materi.tipe === 'serangan' && (
            <div className="warning-box">
              ⚠️ <strong>PERINGATAN KERAS:</strong> Teknik ini HANYA untuk edukasi dan riset keamanan pada sistem yang ANDA MILIKI SENDIRI atau ANDA PUNYA IZIN TERTULIS. Penggunaan ilegal adalah tindak pidana. Penulis dan platform tidak bertanggung jawab atas penyalahgunaan.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
