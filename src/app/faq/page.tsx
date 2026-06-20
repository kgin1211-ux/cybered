'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface FaqItem {
  q: string;
  a: string;
}

const faqData: FaqItem[] = [
  {
    q: '💬 Gimana cara membayar / membeli materi?',
    a: '1. Login dulu (atau daftar kalau belum punya akun).\n2. Di halaman Beranda, pilih materi yang kamu mau atau klik "Beli Semua Materi".\n3. Klik tombol 🛒 Beli / 🎁 Beli Semua.\n4. Isi nama & nomor WhatsApp kamu, lalu centang "Saya setuju".\n5. Klik "💬 Beli via WhatsApp" — kamu akan diarahkan ke chat WhatsApp admin.\n6. Kirim pesan yang sudah tersedia. Admin akan merespon dan membukakan akses setelah pembayaran dikonfirmasi.\n\n💡 Pembayaran dilakukan manual via transfer bank / e-wallet. Detail akan diberikan admin di WhatsApp.',
  },
  {
    q: '🔑 Gimana cara login?',
    a: '1. Klik tombol "Login" di pojok kanan atas.\n2. Masukkan email & password yang kamu daftarkan.\n3. Klik "Login".\n4. Kalau lupa password, hubungi admin via WhatsApp: +62 851-2316-1583.',
  },
  {
    q: '📝 Gimana cara daftar / register?',
    a: '1. Klik tombol "Daftar" di pojok kanan atas.\n2. Isi nama lengkap, email, nomor telepon, dan password.\n3. Klik "Daftar".\n4. Setelah berhasil, kamu otomatis login dan bisa langsung lihat materi!',
  },
  {
    q: '📚 Gimana cara akses materi setelah beli?',
    a: '1. Setelah admin membukakan akses, login ke akun kamu.\n2. Klik "📚 Materi Saya" di header.\n3. Semua materi yang sudah kamu beli muncul di sini.\n4. Klik materi yang ingin kamu baca — konten lengkap akan terbuka.\n\n💡 Materi gratis juga langsung bisa diakses tanpa perlu beli!',
  },
  {
    q: '🎁 Apa itu "Beli Semua Materi" (paket bundel)?',
    a: 'Kamu bisa beli SEMUA materi sekaligus dengan harga jauh lebih murah dibanding beli satu-satu. Harga bundel sudah termasuk diskon khusus. Setelah beli, semua materi langsung terbuka!',
  },
  {
    q: '⏳ Berapa lama akses materi dibuka?',
    a: 'Biasanya admin merespon dalam 1-12 jam (tergantung jam operasional). Kalau lebih dari 24 jam belum dibuka, hubungi admin via WhatsApp atau email Zaennrdev@gmail.com.',
  },
  {
    q: '🔄 Apakah akses materi berlaku selamanya?',
    a: 'Ya! Sekali kamu beli, akses materi berlaku SELAMANYA. Kamu bisa baca kapan saja, tanpa batas waktu.',
  },
  {
    q: '❌ Apakah saya bisa refund?',
    a: 'Kami mengutamakan kepuasan pelanggan. Kalau ada kendala atau kurang puas, hubungi admin via WhatsApp. Kami akan bantu sebaik mungkin. Refund diproses sesuai kebijakan yang disepakati.',
  },
  {
    q: '🛡️ Apakah developer ini amanah & terpercaya?',
    a: '✅ Ya! CyberEd dikembangkan oleh Zaennrdev — developer yang berkomitmen pada transparansi, kejujuran, dan tanggung jawab.\n\n— Semua transaksi tercatat dengan rapi.\n— Materi disusun oleh profesional cybersecurity.\n— Akses langsung dibuka setelah pembayaran dikonfirmasi.\n— Support siap membantu kapan saja via WhatsApp & email.\n\nKeunggulan kami: murah, lengkap, akses selamanya, dan selalu update!',
  },
  {
    q: '📞 Gimana cara hubungi support?',
    a: '📧 Email: Zaennrdev@gmail.com\n📱 WhatsApp: +62 851-2316-1583\n\nAtau klik link di footer halaman manapun. Kami siap bantu!',
  },
];

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <>
      <Header />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px', minHeight: '70vh' }}>
        {/* Header */}
        <section style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 56 }}>❓</span>
          <h1 style={{
            fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800,
            fontFamily: "'Fredoka One', cursive", color: '#333', margin: '8px 0'
          }}>
            FAQ — Bantuan & Pertanyaan Umum
          </h1>
          <p style={{ fontSize: 16, color: '#666', maxWidth: 500, margin: '0 auto' }}>
            Cari tahu cara membeli, login, daftar, dan info lainnya tentang CyberEd.
          </p>
        </section>

        {/* FAQ list */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqData.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#fff', borderRadius: 16, border: '2px solid #e8e8e8',
                overflow: 'hidden', transition: 'all 0.2s',
                ...(openIdx === idx ? { borderColor: '#90CAF9', boxShadow: '0 4px 20px rgba(21,101,192,0.08)' } : {}),
              }}
            >
              <button
                onClick={() => toggle(idx)}
                style={{
                  width: '100%', textAlign: 'left', padding: '16px 20px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: 16, fontWeight: 700, color: '#333',
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                <span>{item.q}</span>
                <span style={{
                  fontSize: 18, transition: 'transform 0.2s',
                  transform: openIdx === idx ? 'rotate(45deg)' : 'rotate(0deg)',
                  color: '#999'
                }}>
                  {openIdx === idx ? '✕' : '+'}
                </span>
              </button>
              {openIdx === idx && (
                <div style={{
                  padding: '0 20px 20px', fontSize: 15, lineHeight: 1.8,
                  color: '#555', whiteSpace: 'pre-line'
                }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Trust banner */}
        <section style={{
          marginTop: 48, padding: 32, background: 'linear-gradient(135deg, #E3F2FD, #C8E6C9)',
          borderRadius: 20, textAlign: 'center'
        }}>
          <span style={{ fontSize: 48 }}>🤝</span>
          <h2 style={{
            fontSize: 22, fontWeight: 800, fontFamily: "'Fredoka One', cursive",
            color: '#333', margin: '8px 0'
          }}>
            Kenapa Harus Percaya CyberEd?
          </h2>
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16,
            marginTop: 16, maxWidth: 600, margin: '16px auto 0'
          }}>
            {[
              { icon: '✅', text: 'Semua transaksi tercatat rapi & transparan' },
              { icon: '✅', text: 'Materi disusun oleh profesional cybersecurity' },
              { icon: '✅', text: 'Akses dibuka segera setelah pembayaran' },
              { icon: '✅', text: 'Akses berlaku SELAMANYA — tanpa biaya langganan' },
              { icon: '✅', text: 'Support via WhatsApp & email siap bantu' },
              { icon: '✅', text: 'Harga SUPER HEMAT — termurah se-Indonesia' },
            ].map((item, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 14, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 14, fontWeight: 600, color: '#2E7D32',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
