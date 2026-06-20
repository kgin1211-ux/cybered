'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  nama: string;
  email: string;
}

export default function Footer() {
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <footer style={{
      background: '#1A1A2E', color: '#e0e0e0',
      padding: '48px 24px 24px', marginTop: 64
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
        
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 28 }}>🛡️</span>
            <span style={{ fontSize: 22, fontWeight: 800, fontFamily: "'Fredoka One', cursive", color: '#fff' }}>CyberEd</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: '#aaa', margin: 0 }}>
            Platform edukasi cybersecurity No. 1 di Indonesia. Kami berkomitmen menyediakan materi berkualitas tinggi dengan harga terjangkau — amanah, jujur, dan bertanggung jawab.
          </p>
        </div>

        {/* Quick Links — conditional based on auth */}
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px', color: '#fff' }}>🔗 Navigasi</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link href="/" style={{ color: '#90CAF9', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>📖 Beranda</Link>
            <Link href="/#materi" style={{ color: '#90CAF9', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>📋 Daftar Materi</Link>
            <Link href="/faq" style={{ color: '#90CAF9', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>❓ FAQ / Bantuan</Link>
            {user ? (
              <>
                <Link href="/materi-saya" style={{ color: '#90CAF9', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>📚 Materi Saya</Link>
                <span style={{ fontSize: 13, color: '#aaa' }}>👋 Login sebagai <strong style={{ color: '#fff' }}>{user.nama}</strong></span>
              </>
            ) : (
              <>
                <Link href="/login" style={{ color: '#90CAF9', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>🔑 Login</Link>
                <Link href="/register" style={{ color: '#90CAF9', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>📝 Daftar</Link>
              </>
            )}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px', color: '#fff' }}>📞 Kontak Support</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>📧</span>
              <div>
                <span style={{ color: '#aaa', fontSize: 11 }}>Email</span>
                <br />
                <a href="mailto:Zaennrdev@gmail.com" style={{ color: '#90CAF9', textDecoration: 'none', fontWeight: 600 }}>
                  Zaennrdev@gmail.com
                </a>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>📱</span>
              <div>
                <span style={{ color: '#aaa', fontSize: 11 }}>WhatsApp</span>
                <br />
                <a href="https://wa.me/6285123161583" target="_blank" rel="noopener noreferrer" style={{ color: '#90CAF9', textDecoration: 'none', fontWeight: 600 }}>
                  +62 851-2316-1583
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sponsor & Trust */}
        <div>
          <h4 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px', color: '#fff' }}>🤝 Sponsor & Kepercayaan</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12,
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <span style={{ color: '#aaa', fontSize: 12 }}>Sponsor</span>
              <p style={{ color: '#ccc', margin: '4px 0 0', fontWeight: 600 }}>—</p>
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12,
              border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 12, flexWrap: 'wrap'
            }}>
              <span style={{ color: '#C8E6C9', fontSize: 13, fontWeight: 700 }}>✅ Amanah</span>
              <span style={{ color: '#C8E6C9', fontSize: 13, fontWeight: 700 }}>✅ Jujur</span>
              <span style={{ color: '#C8E6C9', fontSize: 13, fontWeight: 700 }}>✅ Bertanggung Jawab</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 32, paddingTop: 16,
        textAlign: 'center', fontSize: 13, color: '#777'
      }}>
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} <strong style={{ color: '#90CAF9' }}>CyberEd</strong> — Developed by{' '}
          <strong style={{ color: '#fff' }}>Zaennrdev</strong>. All rights reserved.
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 11 }}>
          Materi disusun oleh profesional cybersecurity. Akses dibuka setelah konfirmasi pembayaran via WhatsApp.
        </p>
      </div>
    </footer>
  );
}
