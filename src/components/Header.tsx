'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  nama: string;
  email: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <header className="sticky" style={{
      position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,254,247,0.95)',
      backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(0,0,0,0.05)',
      padding: '12px 24px'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: '#333' }}>
          <span style={{ fontSize: 32 }}>🛡️</span>
          <span style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Fredoka One', cursive" }}>CyberEd</span>
        </Link>

        {/* Desktop nav */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/" style={{ fontWeight: 600, color: '#333', textDecoration: 'none' }}>Beranda</Link>
          <Link href="/?scroll=materi" style={{ fontWeight: 600, color: '#333', textDecoration: 'none' }}>Materi</Link>
          <Link href="/faq" style={{ fontWeight: 600, color: '#333', textDecoration: 'none' }}>❓ FAQ</Link>
          {user ? (
            <>
              <Link href="/materi-saya" style={{ fontWeight: 600, color: '#1565C0', textDecoration: 'none' }}>
                📚 Materi Saya
              </Link>
              <span style={{ fontWeight: 600, color: '#666' }}>👋 {user.nama}</span>
              <button onClick={handleLogout} className="btn btn-red" style={{ padding: '8px 16px', fontSize: 14 }}>
                Keluar
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-blue" style={{ padding: '8px 16px', fontSize: 14, textDecoration: 'none' }}>
                Login
              </Link>
              <Link href="/register" className="btn btn-yellow" style={{ padding: '8px 16px', fontSize: 14, textDecoration: 'none' }}>
                Daftar
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          style={{ background: 'none', border: 'none', fontSize: 28, cursor: 'pointer' }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          padding: '16px', display: 'flex', flexDirection: 'column', gap: 12,
          borderTop: '1px solid rgba(0,0,0,0.05)', marginTop: 8
        }}>
          <Link href="/" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600, color: '#333', textDecoration: 'none' }}>Beranda</Link>
          <Link href="/?scroll=materi" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600, color: '#333', textDecoration: 'none' }}>Materi</Link>
          <Link href="/faq" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600, color: '#333', textDecoration: 'none' }}>❓ FAQ</Link>
          {user ? (
            <>
              <Link href="/materi-saya" onClick={() => setMenuOpen(false)} style={{ fontWeight: 600, color: '#1565C0', textDecoration: 'none' }}>📚 Materi Saya</Link>
              <span style={{ fontWeight: 600, color: '#666' }}>👋 {user.nama}</span>
              <button onClick={handleLogout} className="btn btn-red" style={{ padding: '8px 16px', fontSize: 14, width: '100%' }}>Keluar</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-blue" style={{ padding: '8px 16px', fontSize: 14, textDecoration: 'none', textAlign: 'center' }}>Login</Link>
              <Link href="/register" className="btn btn-yellow" style={{ padding: '8px 16px', fontSize: 14, textDecoration: 'none', textAlign: 'center' }}>Daftar</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
